#!/usr/bin/env bash
# Transport SSH du runner : destinations fixes, clés vérifiées, token sur stdin.
set +x
set -euo pipefail
export LC_ALL=C
umask 077

fail() { printf '%s\n' "$1" >&2; exit 1; }
case ${TARGET_ENV:-} in
    preprod) deploy_host=utilla.cloug.fr ;;
    production) deploy_host=allitu.cloug.fr ;;
    *) fail 'Environnement invalide : preprod ou production attendu.' ;;
esac
[[ ${IMAGE_TAG:-} =~ ^[A-Za-z0-9_][A-Za-z0-9_.-]{0,127}$ ]] || fail 'Tag OCI invalide.'
[[ ${IMAGE_DIGEST:-} =~ ^sha256:[a-f0-9]{64}$ ]] || fail 'Digest GHCR invalide.'
[[ ${REGISTRY_USER:-} =~ ^[A-Za-z0-9][A-Za-z0-9-]*$ ]] || fail 'Utilisateur GHCR invalide.'
[[ ${REGISTRY_TOKEN:-} =~ ^[A-Za-z0-9_.=-]+$ ]] || fail 'Token GHCR absent ou invalide.'
[[ -n ${SSH_DEPLOY_PRIVATE_KEY:-} && -n ${SSH_KNOWN_HOSTS:-} ]] || fail 'Secrets SSH_DEPLOY_PRIVATE_KEY et SSH_KNOWN_HOSTS requis.'
prune_images=${PRUNE_IMAGES:-false}
[[ $prune_images == true || $prune_images == false ]] || fail 'Option de nettoyage invalide.'

ssh_dir=$(mktemp -d)
cleanup() { rm -rf -- "$ssh_dir"; }
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM
printf '%s\n' "$SSH_DEPLOY_PRIVATE_KEY" | tr -d '\r' > "$ssh_dir/key"
printf '%s\n' "$SSH_KNOWN_HOSTS" > "$ssh_dir/known_hosts"
chmod 600 "$ssh_dir/key" "$ssh_dir/known_hosts"
registry_token=$REGISTRY_TOKEN
unset SSH_DEPLOY_PRIVATE_KEY SSH_KNOWN_HOSTS REGISTRY_TOKEN
ssh-keygen -y -P '' -f "$ssh_dir/key" >/dev/null 2>&1 || fail 'Clé privée SSH invalide ou protégée par une passphrase.'
ssh-keygen -F "$deploy_host" -f "$ssh_dir/known_hosts" >/dev/null || fail 'Hôte absent des clés SSH validées.'
ssh_options=(
    -i "$ssh_dir/key"
    -o IdentitiesOnly=yes -o BatchMode=yes -o StrictHostKeyChecking=yes
    -o "UserKnownHostsFile=$ssh_dir/known_hosts" -o GlobalKnownHostsFile=/dev/null
    -o ConnectTimeout=30 -o ServerAliveInterval=15
)
remote="deploy@$deploy_host"
ssh "${ssh_options[@]}" "$remote" 'umask 077; mkdir -p /opt/pika-ppt/.deploy'
scp "${ssh_options[@]}" docker-compose.yml .env.dist "$remote:/opt/pika-ppt/"
scp "${ssh_options[@]}" .github/scripts/remote_deploy.sh "$remote:/opt/pika-ppt/.deploy/remote_deploy.sh"
# printf est un builtin Bash : aucune valeur secrète dans les arguments d'un
# processus externe. Le script distant est fixe ; stdin transporte les données.
printf '%s\n' "$TARGET_ENV" "$IMAGE_TAG" "$IMAGE_DIGEST" "$REGISTRY_USER" "$prune_images" "$registry_token" |
    ssh "${ssh_options[@]}" "$remote" 'bash /opt/pika-ppt/.deploy/remote_deploy.sh'
unset registry_token
