#!/usr/bin/env bash
# Exécuté sur la VM. Aucun source/eval de .env ; le token arrive sur stdin.
set +x
set -euo pipefail
export LC_ALL=C
umask 077

fail() { printf '%s\n' "$1" >&2; exit 1; }
IFS= read -r target_env || fail 'Environnement requis.'
IFS= read -r image_tag || fail 'Tag requis.'
IFS= read -r image_digest || fail 'Digest requis.'
IFS= read -r registry_user || fail 'Utilisateur GHCR requis.'
IFS= read -r prune_images || fail 'Option de nettoyage requise.'
IFS= read -r registry_token || fail 'Token GHCR requis.'
case $target_env in
    preprod) domain=preprod.pika-ppt.cloug.fr ;;
    production) domain=pika-ppt.cloug.fr ;;
    *) fail 'Environnement de déploiement invalide.' ;;
esac
[[ $image_tag =~ ^[A-Za-z0-9_][A-Za-z0-9_.-]{0,127}$ ]] || fail 'Tag OCI invalide.'
[[ $image_digest =~ ^sha256:[a-f0-9]{64}$ ]] || fail 'Digest GHCR invalide.'
[[ $registry_user =~ ^[A-Za-z0-9][A-Za-z0-9-]*$ ]] || fail 'Utilisateur GHCR invalide.'
[[ $registry_token =~ ^[A-Za-z0-9_.=-]+$ ]] || fail 'Token GHCR invalide.'
[[ $prune_images == true || $prune_images == false ]] || fail 'Option de nettoyage invalide.'
for command in docker flock; do
    command -v "$command" >/dev/null || fail "Prérequis absent : $command."
done
docker compose version >/dev/null 2>&1 || fail 'Plugin Docker Compose absent ou inutilisable sur la VM. Installer Compose >= 2.24.'
compose_help=$(docker compose config --help 2>/dev/null) || fail 'Commande docker compose config indisponible sur la VM.'
[[ $compose_help == *--hash* && $compose_help == *--environment* ]] ||
    fail 'Docker Compose trop ancien sur la VM : config --hash et --environment sont requis. Installer Compose >= 2.24.'
unset compose_help

cd /opt/pika-ppt
exec 9> .deploy.lock
flock -n 9 || fail 'Un autre déploiement Pika-PPT est en cours.'
[[ ! -L .env ]] || fail '.env ne doit pas être un lien symbolique.'
if [[ ! -e .env ]]; then
    cp .env.dist .env
    chmod 600 .env
    fail 'Modèle .env créé. Renseigner DOMAIN, IMAGE_TAG, AUTH_USERNAME et AUTH_PASSWORD sur la VM, puis relancer.'
fi
[[ -f .env ]] || fail '.env doit être un fichier régulier.'
mode=$(stat -c '%a' .env)
(( (8#$mode & 8#77) == 0 )) || fail 'Restreindre les permissions : chmod 600 /opt/pika-ppt/.env'

unset AUTH_USERNAME AUTH_PASSWORD DOMAIN COMPOSE_FILE COMPOSE_PROFILES
export IMAGE_TAG=$image_tag
image=ghcr.io/armand-cloug/pika-ppt/web
service=pika-ppt-web
compose=(docker compose --project-name pika-ppt --env-file .env -f docker-compose.yml)
# Ne jamais afficher le diagnostic brut : même stderr peut contenir un secret.
# Identifier uniquement des erreurs connues et publier un message fixe.
if ! compose_error=$("${compose[@]}" config --quiet 2>&1 >/dev/null); then
    case $compose_error in
        *'AUTH_USERNAME requis'*) fail 'AUTH_USERNAME absent ou vide dans /opt/pika-ppt/.env. Renseigner le nom utilisateur sur la VM.' ;;
        *'AUTH_PASSWORD requis'*) fail 'AUTH_PASSWORD absent ou vide dans /opt/pika-ppt/.env. Renseigner le mot de passe sur la VM (entre apostrophes simples).' ;;
        *'DOMAIN requis'*) fail "DOMAIN absent ou vide dans /opt/pika-ppt/.env. Valeur attendue : $domain" ;;
        *'failed to read'*|*'failed to parse'*|*'unterminated quoted value'*|*'unexpected character'*)
            fail 'Lecture du Compose/.env impossible : vérifier les permissions, la syntaxe et les guillemets sur la VM.' ;;
        *) fail 'Configuration Compose/.env invalide. Sur la VM, exécuter dans /opt/pika-ppt : docker compose --env-file .env -f docker-compose.yml config --quiet. Consulter le diagnostic localement, sans publier sa sortie (secrets possibles).' ;;
    esac
fi
unset compose_error
# Compose reste le seul parseur du .env. Ses sorties restent en mémoire.
config_hash=$("${compose[@]}" config --hash "$service" 2>/dev/null) || fail 'Configuration valide, mais calcul du hash Compose impossible. Vérifier la version de Compose (>= 2.24) et le service pika-ppt-web sur la VM.'
resolved=$("${compose[@]}" config --environment 2>/dev/null) || fail 'Variables Compose invalides.'
username_found=false
password_found=false
domain_found=false
while IFS= read -r line; do
    case $line in
        AUTH_USERNAME=*)
            [[ $username_found == false ]] || fail 'AUTH_USERNAME ambigu ou multiligne.'
            username=${line#AUTH_USERNAME=}
            [[ $username =~ ^[A-Za-z0-9_.@-]{1,128}$ ]] || fail 'AUTH_USERNAME invalide dans le .env serveur.'
            username_found=true
            ;;
        AUTH_PASSWORD=*)
            [[ $password_found == false ]] || fail 'AUTH_PASSWORD ambigu ou multiligne.'
            password=${line#AUTH_PASSWORD=}
            [[ -n $password && ${#password} -le 512 ]] || fail 'AUTH_PASSWORD : 1 à 512 octets attendus.'
            [[ $password != *[[:cntrl:]]* ]] || fail 'AUTH_PASSWORD : caractères de contrôle interdits.'
            password_found=true
            ;;
        DOMAIN=*)
            [[ $domain_found == false && ${line#DOMAIN=} == "$domain" ]] || fail 'DOMAIN ne correspond pas à cet environnement.'
            domain_found=true
            ;;
    esac
done <<< "$resolved"
[[ $username_found == true && $password_found == true && $domain_found == true ]] || fail 'DOMAIN, AUTH_USERNAME et AUTH_PASSWORD requis dans le .env serveur.'
# --environment affiche du texte : une valeur multiligne peut être tronquée
# par read. Réinjecter les valeurs validées et comparer les empreintes natives
# de Compose garantit que le service résolu est strictement identique.
validated_hash=$(AUTH_USERNAME="$username" AUTH_PASSWORD="$password" DOMAIN="$domain" "${compose[@]}" config --hash "$service" 2>/dev/null) || fail 'Validation des variables Compose impossible.'
[[ -n $config_hash && $config_hash == "$validated_hash" ]] || fail 'DOMAIN ou identifiants multilignes/ambigus dans le .env serveur.'
unset resolved username password line config_hash validated_hash

docker network inspect traefik_proxy >/dev/null 2>&1 || fail 'Réseau externe traefik_proxy introuvable.'
registry_dir=
new_env=
backup_env=
restore_env=false
cleanup() {
    local status=$?
    trap - EXIT
    if [[ $restore_env == true ]]; then
        if mv -f -- "$backup_env" .env; then
            backup_env=
            printf '%s\n' 'Déploiement non validé ; ancien IMAGE_TAG restauré. Redéployer le dernier tag validé pour rollback.' >&2
        else
            printf 'Restauration du .env impossible ; copie conservée : %s\n' "$backup_env" >&2
            backup_env=
            status=1
        fi
    fi
    [[ -z $new_env ]] || rm -f -- "$new_env"
    [[ -z $backup_env ]] || rm -f -- "$backup_env"
    [[ -z $registry_dir ]] || rm -rf -- "$registry_dir"
    exit "$status"
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

# Préparer le nouveau .env sans normaliser les autres lignes (CRLF, espaces,
# dollars, apostrophes, dernière ligne sans saut). Aucun secret n'est interprété.
new_env=$(mktemp .env-next.XXXXXX)
count=0
ending=
while true; do
    line=
    if IFS= read -r line; then
        ending=$'\n'
    elif [[ -n $line ]]; then
        ending=
    else
        break
    fi
    if [[ $line =~ ^[[:blank:]]*(export[[:blank:]]+)?IMAGE_TAG[[:blank:]]*= ]]; then
        count=$((count + 1))
        [[ $count -eq 1 ]] || fail 'IMAGE_TAG doit apparaître une seule fois dans .env.'
        suffix=
        [[ $line != *$'\r' ]] || suffix=$'\r'
        line="IMAGE_TAG=$image_tag$suffix"
    fi
    printf '%s%s' "$line" "$ending"
done < .env > "$new_env"
if [[ $count -eq 0 ]]; then
    if [[ -s .env && -z $ending ]]; then printf '\n' >> "$new_env"; fi
    printf 'IMAGE_TAG=%s\n' "$image_tag" >> "$new_env"
fi
unset line

registry_dir=$(mktemp -d)
export DOCKER_CONFIG=$registry_dir
printf '%s\n' "$registry_token" |
    docker login ghcr.io --username "$registry_user" --password-stdin >/dev/null 2>&1 || fail 'Login GHCR échoué.'
unset registry_token
printf '[Deploy] Pull %s:%s\n' "$image" "$image_tag"
"${compose[@]}" pull "$service" >/dev/null 2>&1 || fail 'Pull GHCR échoué.'
repo_digests=$(docker image inspect "$image:$image_tag" --format '{{range .RepoDigests}}{{println .}}{{end}}' 2>/dev/null) || fail "Inspection de l'image impossible."
digest_found=false
while IFS= read -r ref; do
    [[ $ref != "$image@$image_digest" ]] || digest_found=true
done <<< "$repo_digests"
[[ $digest_found == true ]] || fail 'Le tag a changé depuis sa validation GHCR ; aucun conteneur recréé.'

# Remplacement atomique après pull validé ; restauration si up/healthcheck échoue.
backup_env=$(mktemp .env-previous.XXXXXX)
cp -p .env "$backup_env"
restore_env=true
mv -f -- "$new_env" .env
new_env=
printf '[Deploy] Recréation de %s et attente du healthcheck\n' "$service"
"${compose[@]}" up -d --no-deps --force-recreate --pull never --wait --wait-timeout 90 "$service" >/dev/null 2>&1 ||
    fail "Le service n'a pas démarré correctement ; consulter docker compose logs sur la VM."
restore_env=false
if [[ $prune_images == true ]]; then
    docker image prune --force --filter label=fr.cloug.project=pika-ppt --filter until=168h >/dev/null 2>&1 ||
        fail 'Service déployé, mais nettoyage des images dangling échoué.'
fi
printf 'Déploiement validé : %s — %s:%s — %s\n' "$target_env" "$image" "$image_tag" "$image_digest"
