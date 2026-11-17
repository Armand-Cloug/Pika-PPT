# Migrer vers le cloud, maîtriser les risques — ENSAR UE22

Étude de cas « UE22 — Sécurité de l’informatique dans les nuages », année universitaire 2026-2027. Présentation de 18 slides pour 15 minutes à trois intervenants (3 × 5 min), suivie de 5 minutes de questions hors déroulé.

## Ouvrir

- **Hors ligne** : double-cliquer sur `index.html`. Polices, schémas et scripts sont locaux ; aucune ressource distante n’est nécessaire à l’affichage. Icône d’onglet : le logo partagé `/assets/logo.png` (convention du dépôt) quand la page est servie par le site, `assets/cover.svg` hors ligne.
- **Dans Pika-PPT** : `/presentations/securite-cloud-ue22/`, après build et déploiement.
- **Annexe** : `annexe.html`, liens depuis le sommaire, le panneau « Sources & infos » et la slide finale. Imprimable en A4 paysage.

## Présenter

- `←` `→`, Espace, molette ou glissement : navigation. `Début` / `Fin` : première / dernière slide.
- `S` : sélecteur de slides, avec l’intervenant et l’intervalle prévu de chaque slide.
- `F` : plein écran. `R` : minutage de répétition (intervenant, fenêtre prévue, chronomètre). **Aucune avance automatique.**
- `index.html#10` ouvre directement la slide 10.
- `Ctrl+P` : export PDF, une slide par page en 1600 × 900, bas de page généré.

## Fichiers

```text
index.html          18 slides
style.css           direction artistique (clair, ouvertures sombres, turquoise)
script.js           navigation, métadonnées, minutage, bas de page
metadata.js         SEULE source des informations d’identité (présentation + annexe)
presentation.json   manifeste Pika-PPT (date technique de création, pas la date de soutenance)
annexe.html/.css/.js   annexe imprimable des cinq livrables
notes-orales.md     notes de répétition (non publiées par le build)
assets/cover.svg    couverture du catalogue
assets/fonts/       Barlow Condensed et DM Sans + licences OFL
```

## À compléter avant l’oral

Dans `metadata.js` : intervenants et enseignant sont renseignés ; reste la date de soutenance (`defenseDate`), et facultativement `group` et `contact`. Rien d’autre à modifier : page de garde, bas de page, sélecteur, slide finale et annexe se mettent à jour.

Puis : relire les deux PDF de l’énoncé, corriger tout écart avec la synthèse utilisée et ajouter les numéros de page (panneau Sources, annexe § 11, notes) ; supprimer l’encadré « Avant remise » de l’annexe. Vérifier avec l’enseignant si l’export PDF de la présentation et de l’annexe répond à l’exigence de remise en format PPT, DOC ou XLS : ces fichiers HTML ne sont ni des PowerPoint ni des documents Word.

## Vérifier

```sh
python3 scripts/build_catalog.py --output /tmp/pika-check-securite-cloud-ue22   # dossier vide ou inexistant
```
