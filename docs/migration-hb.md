# Migration de HB

## État constaté

Deux présentations sont disponibles dans `presentations/` :

- `ticket/index.html` : **S&R — Observatoire des tickets**, document autonome contenant styles, scripts et données. Son contenu réel est un observatoire du support, pas une billetterie ; le manifeste reprend le contenu fourni.
- `vacances/` : **Golden Days — Le voyage à cinq**, 32 slides, photos locales, polices et licences, crédits JSON et JavaScript.
- `maeva/` : emplacement vide, ignoré au build tant que les sources ne sont pas fournies.

Les documents HTML, JS, CSS, photos et polices fournis sont conservés. L’analyse des références HTML et CSS de `ticket` et `vacances` ne trouve pas de chemin local absolu à corriger. Les références externes des crédits sont des liens d’attribution, conservés tels quels. Aucun téléchargement d’image de remplacement.

Le README historique de `ticket` fait référence à un classeur et à des outils de génération absents de cet import. Le HTML autonome fonctionne ; la régénération de ses données nécessite ces sources originales. `src/` est conservé, mais son `index.html` est un gabarit, pas la présentation finale. Les README historiques restent dans le dépôt, hors image publiée.

## Import d’autres sources HB

Copier le **contenu** de chaque ancien répertoire dans son nouvel emplacement, sans écraser une présentation déjà importée sans vérification :

```sh
# Exemple lorsque les sources de Maeva deviennent disponibles :
cp -a /chemin/vers/HB/html/maeva/. presentations/maeva/
```

Créer `presentations/maeva/presentation.json` :

```json
{
  "title": "Anniversaire de Maeva",
  "category": "Souvenirs",
  "visible": true
}
```

Ajouter une description, une date et une couverture uniquement si elles sont connues/disponibles. Ne pas déplacer les ressources séparément : conserver toute leur arborescence et leurs licences.

Examiner les attributs `src`, `href`, `srcset`, `<base>`, les `url(...)` CSS, `fetch`, imports JS et workers :

```sh
rg -n '(src|href|srcset)=|url\(|fetch\(|https?://|<base' presentations/maeva
```

- `assets/image.jpg`, `./script.js` : inchangés.
- `/assets/image.jpg` : depuis le HTML racine, remplacer par `assets/image.jpg` ou `/presentations/maeva/assets/image.jpg`.
- Dans un CSS imbriqué : calculer le chemin par rapport **au fichier CSS**, pas à la page HTML.
- Ancien domaine dédié : transformer uniquement les URL pointant vers des ressources de la même présentation. Garder les liens externes intentionnels et les crédits. Un domaine codé dans du JavaScript peut aussi être utilisé pour autre chose qu’un asset : vérifier avant de remplacer.
- `<base href="/">` : retirer si les chemins locaux sont déjà cohérents, ou utiliser `/presentations/maeva/` après vérification.
- Ne pas remplacer globalement tous les `/` et ne pas réécrire les HTML autonomes contenant leurs données.

Vérifier que le build conserve tous les formats utiles. La liste des extensions publiables se trouve dans `scripts/build_catalog.py` ; HTML/CSS/JS, images, polices, JSON, CSV, PDF et médias courants sont autorisés. Les dotfiles, clés, configurations et sources serveur sont exclus. Les liens symboliques sont refusés : copier la vraie ressource, après vérification. Aucun fichier statique ne doit contenir de secret : le build ne peut pas deviner la sensibilité d’un JSON métier.

Puis lancer le Compose local indiqué dans le README. Contrôler les erreurs réseau, navigation, animations, données, téléchargements, sommaire, plein écran et affichage mobile. Enfin : commit → Build → déploiement préproduction → recette → promotion du **même tag** en production.
