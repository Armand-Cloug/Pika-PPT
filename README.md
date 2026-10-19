# Pika-PPT

Une collection privée de présentations HTML : dashboard sombre, recherche instantanée, filtres, couvertures, accès direct aux présentations et authentification HTTP Basic native. Une seule image Nginx, aucun backend applicatif, SQL ou Redis.

Les présentations **Golden Days — Le voyage à cinq** (`vacances`) et **S&R — Observatoire des tickets** (`ticket`) sont intégrées avec leurs ressources originales. `maeva` est réservé à un futur import, sans faux contenu. Voir [la migration HB](docs/migration-hb.md).

## Architecture

```text
Navigateur → HTTPS → Traefik mutualisé → pika-ppt-web:8080
                                           ├─ / : dashboard
                                           ├─ /catalog.json
                                           └─ /presentations/<dossier>/
                       Docker healthcheck → 127.0.0.1:8081/healthz
```

Tout le serveur applicatif sur 8080 hérite de `auth_basic`, y compris le catalogue, les manifestes, les images, le JS et le CSS. Les chemins sensibles sont bloqués. Le seul endpoint sans authentification est sur **un autre port, lié exclusivement au loopback du conteneur** : Traefik et les autres conteneurs ne peuvent pas y accéder. `/healthz` sur le domaine public renvoie 404 après authentification.

L’image est indépendante du domaine et des identifiants. Le build Python valide les manifestes et prépare uniquement les fichiers publiables ; Python n’est pas présent dans l’image finale. Au démarrage, un script génère un hash SHA-512 crypt salé via `openssl passwd -6 -stdin`, compatible avec Nginx. Le mot de passe ne passe jamais dans les arguments de processus ni dans les labels ; les variables sont retirées avant l’exécution de Nginx. Le hash est dans `/tmp/pika/auth/htpasswd`, mode 600, hors répertoire web, sur tmpfs.

Nginx tourne avec son utilisateur non-root, sans capacités Linux, avec `no-new-privileges` et un système de fichiers en lecture seule. Seul `/tmp` est inscriptible (32 Mio). Limites : 0,5 CPU, 128 Mio RAM et 100 processus. Logs stdout/stderr avec rotation 3 × 10 Mio ; aucune valeur d’authentification ni chaîne de requête dans le format d’accès. HTML/JSON revalidés ; assets en cache **privé** pendant une heure. Pas de CSP globale restrictive susceptible de casser les scripts intégrés des présentations historiques.

Les administrateurs ayant accès à Docker peuvent lire l’environnement du conteneur : le secret `.env` protège contre sa publication, pas contre l’administrateur de la VM. Les présentations sont des documents de confiance partageant la même origine. `visible: false` est un choix de catalogue, pas un niveau d’autorisation distinct.

## Structure

```text
VERSION                        Version applicative
Dockerfile                     Génération catalogue + image Nginx
.dockerignore                  Contexte Docker limité
.env.dist                      Modèle serveur, sans identifiants
compose.local.yml              Compose local autonome
docker-compose.yml             Compose préprod/prod, image GHCR uniquement
dashboard/                     Accueil, 404, CSS, JS, logo SVG local
presentations/
   vacances/presentation.json  Métadonnées + sources originales
   ticket/presentation.json    Métadonnées + HTML autonome original
   maeva/.gitkeep               Emplacement en attente
docker/                        Nginx et entrypoint sécurisé
scripts/                       Génération du catalogue
.github/workflows/             Build, deploy-preprod, deploy-prod, _deploy
.github/scripts/               Scripts Bash : métadonnées, SSH, déploiement VM
.github/known_hosts            Clés publiques SSH d'Utilla et Allitu
docs/                          Migration HB
```

## Démarrage local

Prérequis : Docker Engine et Docker Compose **v2.24 ou supérieur** (v5 également compatible). Python 3.10+ est utile pour la génération du catalogue hors Docker. Aucune dépendance Node.js.

```sh
# Depuis le dépôt ; ne pas écraser un .env déjà renseigné.
test -f .env || cp .env.dist .env
chmod 600 .env
# Éditer .env et renseigner AUTH_USERNAME et AUTH_PASSWORD.
docker compose -f compose.local.yml up -d --build --wait
```

Ouvrir **http://localhost:8090** et saisir les identifiants dans la boîte native du navigateur. Ce Compose est autonome, sans dépendance à Traefik. Il publie seulement sur `127.0.0.1` pour le développement ; **le Compose de déploiement ne publie aucun port**. Pour un poste distant, utiliser un tunnel SSH (`ssh -L 8090:127.0.0.1:8090 utilisateur@machine`).

```sh
docker compose -f compose.local.yml ps
docker compose -f compose.local.yml logs --tail=50
docker compose -f compose.local.yml down
```

Le navigateur peut mémoriser les identifiants Basic Auth pour l’origine. Pour changer de compte, utiliser une session privée ou fermer la session du navigateur. Pas de faux bouton « déconnexion » : HTTP Basic n’offre pas de déconnexion fiable côté application.

## Variables `.env`

| Variable | Valeur / règle |
| --- | --- |
| `DOMAIN` | `preprod.pika-ppt.cloug.fr` sur Utilla ; `pika-ppt.cloug.fr` sur Allitu |
| `IMAGE_TAG` | Tag publié dans `ghcr.io/armand-cloug/pika-ppt/web` ; préférer `1.0.0-build.42.1` ou `sha-<SHA complet>` |
| `AUTH_USERNAME` | 1 à 128 caractères parmi lettres ASCII, chiffres, `_ . @ -` |
| `AUTH_PASSWORD` | Non vide, au plus 512 octets, une seule ligne, aucun caractère de contrôle |

Le modèle contient des identifiants vides : le démarrage est volontairement refusé tant qu’ils ne sont pas renseignés. Choisir un mot de passe long et unique pour chaque environnement. Les caractères `$`, `#`, `!`, `:`, les espaces, guillemets et antislashs sont acceptés. Avec Compose, entourer le mot de passe d’**apostrophes simples** pour éviter l’interpolation de `$` ; une apostrophe interne s’écrit `\'` :

```dotenv
# Illustration de syntaxe, à remplacer par votre propre mot de passe.
AUTH_USERNAME=pika
AUTH_PASSWORD='exemple-$variable # espace ! " et une apostrophe\' ici'
```

Ne pas exécuter `source .env` : la syntaxe Compose n’est pas du shell. Ne pas lancer `docker compose config` sans `--quiet` dans un log public : cette commande peut afficher les secrets. Ne pas committer `.env`, le transmettre à GitHub ou le copier dans une image. Le `.env` local déjà présent est préservé par ce projet.

Pour modifier le mot de passe : éditer `.env` sur la VM puis `docker compose up -d --no-deps --force-recreate pika-ppt-web`. Un simple `restart` ne relit pas les variables Compose.

## Ajouter une présentation

Créer uniquement un dossier contenant un `index.html`, son manifeste et ses ressources :

```text
presentations/mon-voyage/
  presentation.json
  index.html
  assets/cover.jpg
  assets/...
```

```json
{
  "title": "Voyage USA",
  "description": "Los Angeles, Las Vegas et New York",
  "category": "Voyage",
  "cover": "assets/cover.jpg",
  "date": "2026-10-01",
  "visible": true
}
```

Seul `title` est requis dans le manifeste. Le dossier définit l’identifiant et l’URL : `/presentations/mon-voyage/`. Slug en minuscules, chiffres et tirets, sans espaces. `description` est vide par défaut, `category` vaut `Autres`, `visible` vaut `true`. Sans `cover`, une vignette typographique locale est affichée ; aucune image n’est téléchargée. Sans `date`, aucune date n’est inventée. Les dates renseignées sont triées de la plus récente à la plus ancienne, puis les identifiants départagent les ex æquo.

Le build refuse JSON invalide, propriétés inconnues/dupliquées, mauvais types, date impossible, index manquant, couverture absente ou hors du dossier et liens symboliques. Les couvertures doivent être des images locales. Les présentations masquées restent dans l’image et accessibles directement **avec authentification**, mais sont absentes du catalogue. Les répertoires vides contenant uniquement `.gitkeep` sont ignorés. Un dossier rempli sans manifeste fait échouer le build pour éviter un oubli silencieux.

**Ajouter le dossier → committer → lancer Build → déployer.** Aucun tableau JS, script de gestion, label Traefik ou emplacement Nginx à modifier. Supprimer une présentation revient à retirer son dossier puis reconstruire et déployer.

Les fichiers statiques sont copiés à l’identique. Les formats admis et exclusions sont dans `scripts/build_catalog.py`. Les licences sont conservées. Ne jamais mettre de secret dans les données des présentations, même masquées. Le catalogue est construit dans un répertoire vide pour éviter de réintroduire un fichier retiré. Pour valider indépendamment :

```sh
python3 scripts/build_catalog.py --output /tmp/pika-catalog-validation
# Choisir un nouveau répertoire vide pour la validation suivante.
```

## Traefik et DNS

Aucune instance Traefik, aucun Certbot et aucun réseau partagé ne sont créés par Pika-PPT. Le Compose rejoint le réseau **externe** `traefik_proxy` et déclare :

- routeur `pika-ppt`, règle `Host(DOMAIN)`, entrypoint `websecure` ;
- TLS et resolver `letsencrypt` ;
- middleware existant `security-headers@file` ;
- service explicitement référencé `pika-ppt-web@docker`, port interne **8080** ;
- `traefik.docker.network=traefik_proxy`, `traefik.enable=true`.

La redirection HTTP→HTTPS et le challenge HTTP-01 restent gérés par Traefik mutualisé. Les ports 80/443 sont ceux de Traefik, pas ceux de Pika-PPT. Les préfixes évitent les collisions avec les autres projets. Les deux environnements sont sur des VMs distinctes : mêmes noms Compose/routeur possibles sans conflit.

Configurer les enregistrements DNS avec les adresses réelles des serveurs :

| Nom | Destination |
| --- | --- |
| `preprod.pika-ppt.cloug.fr` | Utilla (`utilla.cloug.fr`) |
| `pika-ppt.cloug.fr` | Allitu (`allitu.cloug.fr`) |

Utiliser A/AAAA vers les adresses correspondantes, ou un CNAME vers le nom du serveur si adapté à votre zone. Ne pas créer d’AAAA vers une IPv6 non fonctionnelle. Les ports 80/443 doivent parvenir à Traefik pour le certificat HTTP-01. Aucun changement du projet Traefik n’est nécessaire avec la configuration confirmée.

## Première installation des VMs

Répéter sur chaque serveur, avec son domaine et ses identifiants propres.

1. Préparer Docker Engine, Compose ≥ 2.24, Bash, `flock` (paquet `util-linux`), les outils GNU courants (`coreutils`), le serveur OpenSSH, `rsync` (transfert des fichiers de déploiement, sans SFTP requis) et les certificats CA système. Ni Python ni `jq` ne sont requis sur les VMs. Le compte `deploy` doit pouvoir utiliser Docker sans `sudo` interactif. Les VMs doivent être Linux **amd64**, architecture publiée par le workflow.
2. Par un compte administrateur, créer le répertoire appartenant à `deploy` :

   ```sh
   sudo install -d -m 750 -o deploy -g deploy /opt/pika-ppt
   ```

3. Installer la clé publique dédiée dans `/home/deploy/.ssh/authorized_keys` (répertoire 700, fichier 600). Utiliser une clé distincte par environnement. Le déploiement utilise exclusivement `deploy@utilla.cloug.fr` ou `deploy@allitu.cloug.fr`, port 22, sans mot de passe SSH. L’accès Docker équivaut à un accès administrateur à la VM.
4. Vérifier le réseau sans le recréer :

   ```sh
   docker network inspect traefik_proxy >/dev/null
   docker compose version
   bash --version
   flock --version
   rsync --version
   ```

5. Transférer `.env.dist` puis préparer le `.env` **sur la VM** :

   ```sh
   # Depuis le dépôt, exemple préproduction :
   rsync .env.dist deploy@utilla.cloug.fr:/opt/pika-ppt/.env.dist
   ssh deploy@utilla.cloug.fr
   cd /opt/pika-ppt
   umask 077
   test -f .env || cp .env.dist .env
   chmod 600 .env
   nano .env
   ```

   Renseigner les quatre variables. En préproduction, remplacer impérativement `DOMAIN` par `preprod.pika-ppt.cloug.fr`. Ne pas recopier les identifiants de production.

Si cette étape est oubliée, le workflow crée un `.env` privé depuis `.env.dist` et s’arrête avec un message explicite. Compléter ce fichier puis relancer ; il ne sera jamais écrasé par un nouveau modèle. Le seul champ automatiquement modifié est `IMAGE_TAG`, après validation et pull réussis.

## Configuration GitHub

Créer deux **GitHub Environments** : `preprod` et `production`. Limiter les branches de déploiement et ajouter, si souhaité, des reviewers obligatoires pour `production`.

Dans **chacun** des environnements, définir ce seul secret personnalisé :

| Secret | Contenu |
| --- | --- |
| `SSH_DEPLOY_PRIVATE_KEY` | Clé privée dédiée complète, non chiffrée par passphrase, correspondant à la clé publique de `deploy` |

**Aucun `AUTH_USERNAME` ou `AUTH_PASSWORD` dans GitHub.** `GITHUB_TOKEN` est fourni automatiquement ; permissions `packages:write` pour Build et `packages:read` pour Deploy. Pour un package GHCR privé, autoriser ce dépôt dans **Package settings → Manage Actions access**. Aucun PAT persistant sur les VMs : un login GHCR éphémère utilise le token du job, transmis par l’entrée standard SSH puis `docker login --password-stdin`. Son répertoire Docker temporaire privé est supprimé à la fin, y compris après erreur.

Les clés publiques des serveurs sont versionnées dans `.github/known_hosts`, comme dans le modèle BDE ; aucun secret `SSH_KNOWN_HOSTS` n’est nécessaire. L’entrée Utilla provient de l’archive BDE fournie et l’entrée Allitu de l’archive Traefik fournie. La correspondance des noms hachés a été vérifiée avec `ssh-keygen -F`, sans nouvelle connexion aux VMs.

Si une clé d’hôte change, obtenir la clé candidate depuis une machine de confiance :

```sh
ssh-keyscan -t ed25519 utilla.cloug.fr > /tmp/utilla.known_hosts
ssh-keygen -lf /tmp/utilla.known_hosts
# Sur la console de confiance de la VM :
sudo ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub
```

Comparer les empreintes, puis remplacer l’entrée correspondante dans `.github/known_hosts` par **la ligne complète** de `/tmp/utilla.known_hosts` et committer la modification. Procéder de même avec Allitu en cas de rotation de sa clé. `ssh-keyscan` seul ne valide pas l’identité. Le script utilise `ssh-keygen -F` pour reconnaître aussi les noms hachés. Aucun `accept-new`, aucune désactivation de `StrictHostKeyChecking`.

## Build et publication GHCR

Les quatre workflows sont manuels ; aucun déploiement sur un simple push.

1. Mettre à jour `VERSION` si nécessaire, puis committer/pousser les sources sur GitHub.
2. Actions → **Build & push — Pika-PPT** → Run workflow.
3. Laisser `push_latest` désactivé, sauf demande intentionnelle.

La CI utilise des scripts Bash et valide la configuration Compose. Buildx construit et publie l’image avec cache GitHub Actions ; les manifestes, le catalogue et la configuration Nginx (`nginx -t`) sont validés pendant le build Docker. Le générateur Python du catalogue reste dans le stage de build Docker : les workflows et scripts de déploiement n’exécutent aucun Python sur le runner ni sur les VMs. Les tags publiés sont :

```text
ghcr.io/armand-cloug/pika-ppt/web:1.0.0
ghcr.io/armand-cloug/pika-ppt/web:1.0.0-build.42.1
ghcr.io/armand-cloug/pika-ppt/web:sha-<SHA complet>
```

`42` représente le numéro du run et `1` sa tentative. Les tags build et SHA sont contrôlés pour refuser la réécriture d’un tag déjà publié ; pour reconstruire après publication, créer un nouveau commit. Le tag de version est un alias pratique qui peut évoluer avec les builds de cette version. `latest` n’existe que si l’option a été cochée. Préférer les tags build/SHA pour la promotion et les rollbacks, et ne pas les réattribuer manuellement dans GHCR.

Le runner construit pour `linux/amd64` ; les VMs ne construisent jamais l’image.

## Déployer en préproduction, promouvoir, revenir en arrière

**Préproduction** : Actions → **Deploy — Préproduction** → renseigner le tag exact, par exemple `1.0.0-build.42.1`. Vide = contenu de `VERSION` de la branche choisie. L’option de nettoyage reste décochée par défaut.

Le workflow réutilisable appelle `metadata.sh` pour résoudre les tags, puis `deploy.sh` pour le transport SSH strict. Il vérifie l’existence du tag, résout le digest avec `jq` déjà fourni sur le runner GitHub, crée le sous-répertoire `.deploy` si nécessaire et copie avec `rsync` via SSH uniquement Compose, `.env.dist` et `.deploy/remote_deploy.sh`. Ce dernier s’exécute avec Bash sur la VM, sans `jq` : il lit les valeurs résolues par `docker compose config --environment`, vérifie leur correspondance exacte avec `config --hash` et lit les digests via le format natif de `docker image inspect`. Sous verrou `flock`, il valide le `.env`, le domaine et le réseau ; effectue le login éphémère, le pull et la comparaison du digest ; remplace atomiquement le seul `IMAGE_TAG` ; recrée uniquement `pika-ppt-web` avec `--no-deps` ; attend le healthcheck Docker. Les autres lignes du `.env` sont préservées, sans `source` ni `eval`. Les identifiants restent sur la VM.

La concurrence est sérialisée par environnement dans GitHub et un verrou distant évite deux recréations simultanées. La recréation de l’unique conteneur peut provoquer une brève interruption ; ce projet ne prétend pas offrir un déploiement sans interruption.

Faire la recette sur **https://preprod.pika-ppt.cloug.fr** : ouverture, recherche, présentations, ressources, navigation et téléchargements.

**Production** : Actions → **Deploy — Production**, confirmation exacte **`deploy-prod`**, puis **le même tag build/SHA** validé en préproduction. Aucun rebuild. Cible : `deploy@allitu.cloug.fr:/opt/pika-ppt`, URL **https://pika-ppt.cloug.fr**.

**Rollback** : relancer le workflow de l’environnement avec un ancien tag validé. Aucune migration de base, aucun volume applicatif à restaurer. Garder ces tags dans GHCR. Un échec après recréation restaure l’ancien `IMAGE_TAG` du fichier `.env`, mais **ne restaure pas automatiquement le conteneur** : relancer explicitement le dernier tag sain. Les logs indiquent cette situation.

Le nettoyage optionnel utilise uniquement `docker image prune` filtré par label `fr.cloug.project=pika-ppt` et âge > 7 jours, sans `-a` : seules les images dangling de Pika-PPT sont candidates. Aucun réseau, volume ou autre stack n’est supprimé. Aucun `docker system prune`, aucun arrêt de Traefik, aucun `compose down` en déploiement.

## Diagnostic et commandes utiles

Sur la VM :

```sh
cd /opt/pika-ppt
docker compose config --quiet
docker compose ps
docker compose logs --tail=100 pika-ppt-web
docker compose exec pika-ppt-web nginx -t
docker compose exec pika-ppt-web wget -qO- http://127.0.0.1:8081/healthz
```

- **401 sans identifiants** : comportement attendu. 401 après saisie : vérifier les apostrophes Compose, puis recréer le service pour prendre en compte un changement.
- **Démarrage refusé** : identifiants vides, nom non admis, mot de passe multiligne/trop long, tmpfs absent. Le message ne contient pas le secret.
- **404 Traefik** : vérifier DNS, `DOMAIN`, réseau externe, labels, provider Docker et `traefik.enable=true`.
- **502** : vérifier le healthcheck, l’attachement au réseau et le port de service 8080.
- **Certificat indisponible** : vérifier la résolution DNS, IPv4/IPv6, ports 80/443 et les logs de l’infrastructure Traefik existante. Aucun Certbot à installer ici.
- **Catalogue invalide** : le build indique le dossier et le champ à corriger. Les titres/descriptions sont rendus comme texte, sans interprétation HTML.
- **Image GHCR introuvable / denied** : vérifier le tag, le namespace, la réussite du Build et l’accès Actions au package privé.
- **Host key verification failed** : vérifier l’empreinte sur la console serveur, puis mettre à jour `.github/known_hosts` si le changement est légitime ; ne pas désactiver la vérification.
- **Permission sur `/opt/pika-ppt`** : corriger le propriétaire, pas les droits globaux en 777. `.env` doit rester en 600 et ne pas être un lien symbolique.
- **Images/CSS manquants après import** : inspecter les chemins depuis le sous-répertoire et les formats autorisés. Voir [migration HB](docs/migration-hb.md).
- **Déploiement échoué après recréation** : le conteneur peut déjà utiliser le nouveau code ; redéployer l’ancien tag. La restauration de `.env` seule ne constitue pas un rollback.

## Références et choix repris

Les dépôts locaux et archives fournis de `bde_ensar` et `traefik-mutualized` ont été consultés sans modification. Repris de BDE : workflows manuels, `_deploy.yml`, environnement GitHub dédié, secret `SSH_DEPLOY_PRIVATE_KEY`, tags VERSION/build/SHA, build sur runner, image GHCR privée avec login éphémère et mise à jour du seul `IMAGE_TAG` côté serveur. Les éléments liés à Next.js, MariaDB et migrations ne sont pas applicables ici. Le fallback `accept-new` de certaines références a été remplacé par une vérification SSH obligatoire.

Documentation des mécanismes utilisés : [Nginx Basic Auth](https://nginx.org/en/docs/http/ngx_http_auth_basic_module.html), [interpolation Compose et apostrophes](https://docs.docker.com/compose/how-tos/environment-variables/variable-interpolation/), [règles HTTP Traefik](https://doc.traefik.io/traefik/reference/routing-configuration/http/routing/rules-and-priority/).

