# Créer une présentation

Ce guide décrit comment construire une présentation HTML pour Pika-PPT.

La référence visuelle et ergonomique est **`presentations/vacances/`** (*Golden Days*) : messages clairs et courts, aucun pavé de texte, mise en page soignée, navigation au clavier, plein écran, sélecteur de slides et pagination. Pour un contexte académique ou professionnel, on y ajoute trois exigences : une **page de garde complète**, un **sommaire** et un **bas de page** sur chaque slide.

Les conventions de ce guide reprennent aussi ce qui fonctionnait dans les anciennes présentations PowerPoint (`pptx/`) : sommaire numéroté, slides d’ouverture de partie, cartes « mot-clé + une ligne », grands chiffres et slide de questions. Elles corrigent les défauts qu’on y retrouve souvent (voir [§ 11](#11-pièges-relevés-dans-les-anciennes-présentations)).

---

## 1. Les règles d’or

1. **Une slide = une idée.** Le titre énonce cette idée, le reste la prouve ou l’illustre.
2. **L’oral porte le détail, la slide porte le repère.** Une phrase qu’on lirait à voix haute n’a pas sa place sur la slide.
3. **Pas de pavé.** Au-delà de 3 lignes d’affilée, découper en cartes, en étapes, en tableau ou en chiffre clé.
4. **Montrer plutôt qu’écrire** : un chiffre en grand, un schéma, une photo, une comparaison en deux colonnes.
5. **Le public sait toujours où il en est** grâce au sommaire, au chapitre courant, à la pagination et à la barre de progression.
6. **Les nuances vont en note de bas de slide ou dans le panneau « Sources & infos »**, pas dans le corps de la slide. *Golden Days* fait ça très bien : les réserves sur les prix, les règles de location et les crédits photo sont dans un panneau dédié.
7. **Zéro contenu de remplissage** : pas de texte d’exemple de template, pas de slide vide, pas de « You can enter a subtitle here ».

---

## 2. Structure obligatoire

| # | Slide | Contenu | Obligatoire |
| --- | --- | --- | --- |
| 1 | **Page de garde** | Titre, sous-titre ou problématique, école, matière, étudiants, enseignant, date | Oui |
| 2 | **Sommaire** | Les grandes parties numérotées `01`, `02`… avec une ligne de description chacune | Oui |
| 3 | Introduction / contexte | Le problème, l’enjeu, ou un chiffre d’accroche | Recommandé |
| — | **Ouverture de partie** | Grand numéro + titre de la partie + sa ligne de description du sommaire | Oui, une par partie |
| — | Slides de contenu | 2 à 5 slides par partie | Oui |
| n-1 | **Conclusion** | 3 messages à retenir au maximum, puis une ouverture | Oui |
| n | **Merci / Questions** | « Merci ! Avez-vous des questions ? » et un contact (email étudiant) | Oui |
| — | Références | Bibliographie au format `AUTEUR (ANNÉE). Titre. Éditeur.` | Si sources citées |

**Plan conseillé : 3 ou 4 parties.** Au-delà de 5, le sommaire n’aide plus.

**Durée** : compter environ **1 slide par minute d’oral**, hors page de garde, sommaire et ouvertures de partie. Un oral de 10 minutes tient en 12 à 16 slides au total.

---

## 3. Page de garde

La page de garde doit contenir **toutes** ces informations :

| Élément | Exemple |
| --- | --- |
| Titre | *L’éthique de l’ingénierie : comparaison des modèles allemand et français* |
| Sous-titre ou problématique (une ligne) | *Quelles différences dans l’organisation de l’éthique de l’ingénieur ?* |
| **Nom de l’école** | ENSAR |
| **Matière** (code UE si existant) | UE18 — Éthique et déontologie de l’ingénieur |
| **Étudiants** (prénom NOM, classe/option si utile) | Ethan SIEGLER & Armand ZIREG — A2 GDR SSI |
| **Enseignant** | M./Mme Prénom NOM |
| Date ou année universitaire | Mai 2026 / 2025-2026 |

Mise en page, d’après la couverture de *Golden Days* :

- Un petit **sur-titre** (*eyebrow*) en capitales espacées pour situer le sujet : `ENSAR · UE18 · ÉTHIQUE ET DÉONTOLOGIE`.
- Un **titre très grand** sur 2 lignes maximum, avec un mot ou une ligne en couleur d’accent (`<em>` ou `.outline`).
- Une **ligne de sous-titre**, pas plus.
- Un **bloc d’identité** regroupant étudiants et enseignant, aligné en bas à gauche, en petit et bien lisible.
- Une image de fond ou un visuel fort est bienvenu, avec un voile (`.shade`) pour garantir le contraste.
- Un bouton « Commencer → » (`data-next`) comme « Embarquement » dans *Golden Days*.

---

## 4. Sommaire

Le sommaire est une **vraie slide**, en position 2. À ne pas confondre avec le sélecteur de slides, qui est un outil de navigation (voir [§ 7](#7-navigation-et-interface)).

- Une ligne par partie : **numéro** (`01`), **titre court** (2 à 4 mots), **une ligne de description**.
  Exemple tiré de `AZ_WEB.pptx` : `01 INTRO — Introduction technique aux serveurs web`.
- Chaque ligne est un bouton cliquable vers l’ouverture de sa partie (`<button data-go="4">`).
- Les mêmes titres apparaissent, mot pour mot, à trois endroits :
  1. le sommaire ;
  2. les onglets de chapitres de la barre du haut (`.chapters`) ;
  3. l’attribut `data-chapter` de chaque slide.

  Comme le chapitre affiché en bas et l’onglet actif sont calculés en comparant ces textes, une faute de frappe casse la synchronisation.
- Chaque **slide d’ouverture de partie** reprend le numéro et la description du sommaire : `02` · *ATTAQUE* · *Surface d’attaque d’un serveur web*.

---

## 5. Bas de page

**Le bas de page est présent sur toutes les slides**, y compris dans l’export PDF ou à l’impression. Il reprend les informations de la page de garde, en version courte, et le numéro de slide :

```text
ENSAR · UE18 Éthique et déontologie · E. SIEGLER & A. ZIREG · Enseignant : Prénom NOM            05 / 16
```

Règles :

- Ordre fixe : **école · matière · étudiants · enseignant**, puis la pagination à droite.
- Les informations sont **écrites une seule fois**, dans les attributs `data-*` de `#stage`, et le script génère le bas de page. Ne jamais recopier le texte à la main dans chaque slide : c’est ce qui produisait les numéros faux (`00`, ou décalés d’une page) dans les anciens PowerPoint.
- Petit (11 à 13 px sur la scène de 1600 px), en capitales espacées ou en petites capitales, opacité réduite. Le bas de page est un repère, pas un contenu.
- Il s’adapte au fond : clair sur les slides sombres ou photo, foncé sur les slides claires. *Golden Days* le fait déjà avec la classe `.on-dark` sur `#stage`.
- Les noms trop longs sont abrégés en initiale + NOM. Avec plus de 3 étudiants, mettre le nom du groupe ou `Groupe 3` et garder la liste complète sur la page de garde.

À l’écran, le bas de page **est** la barre de contrôle de *Golden Days* :

```text
[▦] PARTIE 02 · ATTAQUE   |   ENSAR · UE18 · E. SIEGLER & A. ZIREG · Ens. : P. NOM   |   [⤢]  05 / 16  (←) (→)
 sélecteur + chapitre                    informations obligatoires                  plein écran, pagination, flèches
```

À l’impression, la barre de contrôle est masquée. Chaque slide porte donc aussi un `<footer class="slide-footer">` généré par le script, visible seulement en `@media print` (voir [§ 8](#8-mise-en-œuvre-html)).

---

## 6. Écrire une slide

### Anatomie (reprise de *Golden Days*)

```text
┌────────────────────────────────────────────────────────────┐
│ ☼ MARQUE        Partie 1  Partie 2  Partie 3     ÉDITION   │  barre du haut : chapitres cliquables
├────────────────────────────────────────────────────────────┤
│ SUR-TITRE EN CAPITALES                     (eyebrow)       │
│ TITRE QUI DIT L’IDÉE.                      (h2)            │
│ AVEC UN ACCENT.                            (h2 em)         │
│ Une ou deux lignes de chapeau.             (lead)          │
│                                                            │
│ [ carte ] [ carte ] [ carte ]   ou visuel / chiffre / photo│
│                                                            │
│ Note discrète de nuance ou de source.      (footnote)      │
├────────────────────────────────────────────────────────────┤
│ ▦ CHAPITRE · infos bas de page · ⤢ 05 / 16 ← →             │  bas de page + contrôles
└────────────────────────────────────────────────────────────┘
```

### Limites de texte

| Élément | Limite |
| --- | --- |
| Sur-titre | 3 à 8 mots, en capitales |
| Titre | 2 lignes, environ 8 mots |
| Chapeau (`lead`) | 1 ou 2 lignes |
| Blocs par slide | 3 ou 4 cartes, 5 étapes, 6 lignes de tableau |
| Texte d’un bloc | Un **mot-clé en gras** + une ligne de 12 mots maximum |
| Total visible | Environ 40 mots, hors tableau de données |
| Taille minimale du texte | 16 px sur la scène de 1600 × 900 ; ne jamais descendre sous 14 px pour du contenu |

### Mises en page types

Ce sont les dispositions qui reviennent dans les anciens PowerPoint et dans *Golden Days*. Elles serviront aussi de catalogue pour la migration.

| Mise en page | Usage | Exemple existant |
| --- | --- | --- |
| **Cartes mot-clé** (2 à 4) | Lister des concepts, risques, mesures | « Firewall / Fail2Ban / Supervision / Isolation » (`AZ_WEB`) |
| **Chiffre clé** | Accroche, résultat marquant | `348 000 atteintes numériques en 2024` (`Pres_AZ`) ; `≈ 3 700 €` animé (`vacances`) |
| **Mini-stats** (2 à 4 chiffres) | Présenter une organisation, un bilan | `$4.7 B · 4 200 · ~200M` (`DD_RIOT_2024`) |
| **Comparaison 2 colonnes** | Opposer deux modèles, avant/après | Allemagne / France (`EthiqueEtDeontologieInge`) |
| **Plus / Moins** | Analyse critique d’une option | Python, Ruby, C#… (`MAM_AZ_ES`) |
| **Étapes numérotées** (`ol`) | Méthode, procédure, prochaines étapes | FAHP en 5 étapes (`MAM_AZ_ES`) ; « On bloque les dates » (`vacances`) |
| **Frise / feuille de route** | Planning, priorités dans le temps | 0–6 mois / 6–18 mois (`Reglementation_SSI`) ; calendrier 11 jours (`vacances`) |
| **Tableau** | Chiffres comparables, statuts | Objectifs / Statut (`FinCyber912`) ; budget (`vacances`) |
| **Citation** | Thèse forte, transition | Citation de `Pres_AZ` |
| **Photo plein cadre** | Rupture, émotion, ouverture de partie | Slides `photo-slide` de `vacances` |
| **Slide d’ouverture de partie** | Séparer les parties | `01 · INTRO · Introduction technique…` |

Une slide qui ne rentre dans aucune de ces formes est probablement trop chargée : la découper en deux.

### Ton

- Titres affirmatifs qui donnent la conclusion (« Le DES est mort », « On garde de la marge »), pas des titres neutres (« Partie 2 », « Analyse »).
- Pour un sujet scolaire, *Golden Days* reste le modèle de rythme et de clarté, mais le registre est **professionnel** : pas de familiarités ni d’autodérision (« Un gars pas con (moi) »).
- Relire l’orthographe, surtout dans les titres affichés en très gros.

---

## 7. Navigation et interface

Toute présentation doit offrir les mêmes contrôles que *Golden Days* :

| Fonction | Comment | Élément |
| --- | --- | --- |
| Slide suivante / précédente | `→` `↓` `Espace` `PageDown` / `←` `↑` `PageUp`, boutons ronds, molette, glissement sur mobile | `#next`, `#previous` |
| Première / dernière slide | `Début` / `Fin` | — |
| **Plein écran** | Touche `F` ou bouton ⤢ | `#fullscreen-button` |
| **Sélecteur de slides** | Touche `S` ou bouton ▦ : grille de toutes les slides (numéro, titre, chapitre) ; `Échap` pour fermer | `<dialog id="overview">` |
| **Pagination** | `05 / 16`, mis à jour à chaque slide | `#slide-counter` |
| Chapitre courant | Nom de la partie en bas à gauche, onglet actif en haut | `#chapter-name`, `.chapters` |
| Progression | Barre fine en bas de l’écran | `#progress` |
| Lien direct | `index.html#7` ouvre la slide 7 | hash d’URL |
| Sources & infos | Panneau avec références, crédits images et licences | `<dialog id="sources">` |

Les boutons sont désactivés aux extrémités : pas de « précédent » sur la slide 1, pas de « suivant » sur la dernière.

---

## 8. Mise en œuvre HTML

### Arborescence

```text
presentations/mon-sujet/
  presentation.json     manifeste Pika-PPT (voir § 10)
  index.html            toutes les slides
  style.css             direction artistique
  script.js             navigation (copie adaptée de vacances/script.js)
  assets/
    cover.jpg           couverture du catalogue
    img/…               images locales
    fonts/…             polices locales + fichier de licence OFL
```

Tout est **local**, sans CDN, sans police Google ni image distante. La présentation doit s’ouvrir hors ligne en double-cliquant sur `index.html`.

### Point de départ

Copier `presentations/vacances/` dans un nouveau dossier, puis :

1. vider les `<section class="slide">` ;
2. remplacer les couleurs de `:root` dans `style.css` ;
3. supprimer les règles CSS propres au voyage (`.vegas-*`, `.budget-*`…) ;
4. retirer de `script.js` le dictionnaire `labels` des photos et `credits-data.js` si les crédits sont écrits directement dans le panneau Sources.

Ce que fait déjà `script.js` et qu’il faut garder :

- **mise à l’échelle** : la scène fait 1600 × 900 (16:9) et est réduite ou agrandie selon la fenêtre (`--scale`) ;
- **variante portrait** : scène de 760 × 1180 sous un ratio 4:5 ;
- **apparition progressive** : délai automatique sur chaque `.reveal` ;
- **sélecteur généré automatiquement** à partir de `data-title` et `data-chapter` ;
- **accessibilité** : `aria-hidden`, `inert` sur les slides cachées, libellés « 5 sur 16 : titre » ;
- respect de **« Réduire les animations »** (`prefers-reduced-motion`) ;
- **export PDF** : la règle `@media print` place une slide par page en 1600 × 900.

### Squelette

```html
<main id="stage"
      data-school="ENSAR"
      data-course="UE18 Éthique et déontologie"
      data-students="E. SIEGLER &amp; A. ZIREG"
      data-teacher="Prénom NOM"
      aria-roledescription="diaporama" aria-label="Éthique de l’ingénierie">

  <header class="topbar">
    <a class="brand" href="#1">ENSAR<span>UE18</span></a>
    <div class="chapters" aria-label="Chapitres">
      <button data-go="4">Contexte</button>
      <button data-go="7">Allemagne</button>
      <button data-go="10">France</button>
      <button data-go="13">Bilan</button>
    </div>
  </header>

  <div id="slides">
    <!-- 1. Page de garde -->
    <section class="slide cover photo-slide is-active" data-title="Page de garde" data-chapter="Introduction">
      <div class="content">
        <p class="eyebrow reveal">ENSAR · UE18 · ÉTHIQUE ET DÉONTOLOGIE</p>
        <h1 class="reveal">L’ÉTHIQUE<br><em>DE L’INGÉNIEUR.</em></h1>
        <p class="lead reveal">Modèles allemand et français : deux organisations, une même responsabilité.</p>
        <dl class="identity reveal">
          <div><dt>Étudiants</dt><dd>Ethan SIEGLER · Armand ZIREG — A2 GDR SSI</dd></div>
          <div><dt>Enseignant</dt><dd>Prénom NOM</dd></div>
          <div><dt>Date</dt><dd>Mai 2026</dd></div>
        </dl>
      </div>
    </section>

    <!-- 2. Sommaire -->
    <section class="slide summary" data-title="Sommaire" data-chapter="Introduction">
      <div class="content">
        <p class="eyebrow reveal">SOMMAIRE</p>
        <h2 class="reveal">QUATRE TEMPS.<em> UNE QUESTION.</em></h2>
        <ol class="summary-list reveal">
          <li><button data-go="4"><span>01</span><b>Contexte</b><small>Éthique, déontologie, responsabilité</small></button></li>
          <li><button data-go="7"><span>02</span><b>Allemagne</b><small>Une éthique collective portée par le VDI</small></button></li>
          <!-- … -->
        </ol>
      </div>
    </section>

    <!-- Ouverture de partie -->
    <section class="slide part dark" data-title="01 · Contexte" data-chapter="Contexte">
      <div class="content"><span class="part-number">01</span><h2>CONTEXTE</h2><p class="lead">Éthique, déontologie, responsabilité</p></div>
    </section>

    <!-- Slides de contenu… -->
  </div>

  <footer class="controls">
    <div class="control-left"><button id="overview-button" class="icon-button" aria-label="Ouvrir le sélecteur de slides">▦</button><span id="chapter-name"></span></div>
    <div class="control-middle"><span id="deck-info"></span></div>
    <div class="control-right"><button id="fullscreen-button" class="icon-button" aria-label="Activer le plein écran">⤢</button><span id="slide-counter" aria-live="polite"></span><button id="previous" class="nav-button" aria-label="Slide précédente">←</button><button id="next" class="nav-button" aria-label="Slide suivante">→</button></div>
  </footer>
  <div class="progress-track"><div id="progress"></div></div>
</main>
<dialog id="overview">…</dialog>
<dialog id="sources">…</dialog>
```

Dans *Golden Days*, les icônes (▦ ⤢ ← →) sont des symboles SVG (`<svg><use href="#i-grid"/></svg>`), à reprendre tels quels.

### Générer le bas de page

À ajouter dans `script.js`, avant la boucle qui construit le sélecteur :

```js
const info = stage.dataset;
const deckInfo = [info.school, info.course, info.students, `Enseignant : ${info.teacher}`].join(' · ');
document.getElementById('deck-info').textContent = deckInfo;
slides.forEach((slide, index) => {
  const footer = document.createElement('footer');
  footer.className = 'slide-footer';
  footer.setAttribute('aria-hidden', 'true');
  const text = document.createElement('span');
  text.textContent = deckInfo;
  const page = document.createElement('span');
  page.textContent = `${String(index + 1).padStart(2, '0')} / ${slides.length}`;
  footer.append(text, page);
  slide.append(footer);
});
```

```css
.slide-footer { display: none; }
@media print {
  .slide-footer { display: flex; justify-content: space-between; position: absolute;
                  left: 58px; right: 58px; bottom: 24px; font-size: 12px; letter-spacing: 1.5px; opacity: .7; }
}
```

Utiliser `textContent`, jamais `innerHTML`, pour insérer ces informations.

### Attributs de chaque slide

| Attribut | Rôle |
| --- | --- |
| `class="slide …"` | `cream`/clair par défaut ; `dark` ou `photo-slide` passent la barre et le bas de page en clair |
| `data-title` | Titre affiché dans le sélecteur et l’onglet du navigateur. Court et unique. |
| `data-chapter` | Nom **exact** de la partie, identique à `.chapters` et au sommaire |
| `.reveal` | Éléments qui apparaissent en cascade |
| `data-go="N"` | Bouton qui va à la slide N (numérotation à partir de 1) |
| `data-next` | Bouton « suivant » intégré à la slide |
| `data-count="3700"` | Chiffre animé (un seul par slide) |

**Attention** : les numéros `data-go` sont des positions. Insérer une slide décale toutes les cibles qui suivent ; vérifier le sommaire et les onglets après chaque ajout.

---

## 9. Direction artistique

- **2 polices au maximum** : une *display* condensée pour les titres (Barlow Condensed dans *Golden Days*) et une police lisible pour le texte (DM Sans). Fichiers locaux et licence OFL copiée dans `assets/fonts/`.
- **Palette en variables CSS** dans `:root` : un fond clair, un fond sombre, une couleur d’encre, **une** couleur d’accent principale et une ou deux secondaires. Ne pas coder de couleur en dur ailleurs.
- **Contraste** : texte sur photo toujours avec un voile (`.shade`). Vérifier la lisibilité depuis le fond d’une salle, sur vidéoprojecteur.
- **Alterner les fonds** (clair / sombre / photo) pour rythmer, en gardant une logique : par exemple, toutes les ouvertures de partie en sombre.
- **Images** : locales, compressées (JPEG < 300 Ko en 1600 px de large), avec un `alt` descriptif. Source et licence de chaque image dans le panneau Sources. Une photo d’illustration le dit (« inspiration », « modèle illustratif »).
- **Schémas** : en SVG inline plutôt qu’en capture d’écran ; ils restent nets en plein écran.
- **Animations** sobres : apparition en fondu-glissé et compteur sur le chiffre clé. Rien qui clignote ou qui retarde l’orateur.

---

## 10. Publier dans Pika-PPT

1. Dossier `presentations/<slug>/` : minuscules, chiffres et tirets.
2. Manifeste `presentation.json` :

   ```json
   {
     "title": "L’éthique de l’ingénierie",
     "description": "UE18 — Comparaison des modèles allemand et français.",
     "category": "ENSAR",
     "cover": "assets/cover.jpg",
     "date": "2026-05-12",
     "visible": true
   }
   ```

   Seuls ces six champs sont acceptés : le build refuse les champs inconnus. École, enseignant et étudiants restent donc dans le HTML.
3. Vérifier en local : `python3 scripts/build_catalog.py --output /tmp/pika-check-<slug>`, puis `docker compose -f compose.local.yml up -d --build --wait` et ouvrir http://localhost:8090.
4. Commit, puis Build, puis déploiement en préproduction, recette, et promotion du même tag en production (voir le [README](../README.md)).

---

## 11. Pièges relevés dans les anciennes présentations

| Piège | Exemple | Règle |
| --- | --- | --- |
| Slides restées du template | 50 slides Slidesgo (« Mercury is the closest planet… ») à la fin de `DD_RIOT_2024` | Supprimer tout ce qui n’est pas du contenu réel |
| Texte d’exemple oublié | « Ici commence votre présentation », « You can enter a subtitle here », `youremail@freepik.com` | Rechercher les textes d’exemple avant de rendre |
| Mention d’attribution de template | « Please keep this slide for attribution » | Pas de template tiers ; crédits dans le panneau Sources |
| Bas de page saisi à la main | Numéros `00`, ou décalés d’une slide (`CWE272`) | Bas de page généré par le script |
| Page de garde incomplète | Pas d’enseignant, pas de matière, auteurs absents | Les sept éléments du [§ 3](#3-page-de-garde) |
| Pas de sommaire | `RIOT_DD_2023`, `EthiqueEtDeontologieInge`, `Regelementation_SSI` | Sommaire obligatoire en slide 2 |
| Fautes dans les titres | « ENVIVORENEMENT », « PRESENTATIION », « EVAUATION » | Relecture, idéalement par une autre personne |
| Paragraphes complets | Slides 15-16 de `Reglementation_SSI` | Découper en cartes ou en 2 slides |
| Deux versions du même fichier | `Regelementation_SSI` et `Reglementation_SSI` | Un seul dossier par présentation, historisé par Git |
| Titres génériques | « OUR PROCESS », « Contents of this template » | Titres en français qui disent l’idée |

---

## 12. Checklist avant de présenter

**Contenu**

- [ ] Page de garde : titre, sous-titre, école, matière, étudiants, enseignant, date.
- [ ] Sommaire en slide 2, de 3 à 5 parties numérotées avec une ligne chacune.
- [ ] Une slide d’ouverture par partie, cohérente avec le sommaire.
- [ ] Aucune slide de plus de 40 mots environ, sauf tableau de données.
- [ ] Conclusion en 3 messages, puis slide « Merci ! Questions ? » avec contact.
- [ ] Sources citées, crédits images et licences dans le panneau Sources.
- [ ] Orthographe relue ; aucun texte de template.

**Interface**

- [ ] Bas de page présent sur toutes les slides, à l’écran **et** dans l’aperçu d’impression.
- [ ] `←` `→`, `F`, `S`, `Échap`, `Début`/`Fin` fonctionnent.
- [ ] Pagination juste sur la première et la dernière slide.
- [ ] Les onglets de chapitre et le sommaire mènent aux bonnes slides.
- [ ] Rendu vérifié en 1920 × 1080, sur un écran portable et sur téléphone en portrait.
- [ ] Ouverture hors ligne sans erreur dans la console du navigateur.
- [ ] Export PDF (`Ctrl+P`, sans marges) : une slide par page, sans élément coupé.

**Publication**

- [ ] `presentation.json` valide, couverture locale.
- [ ] Build du catalogue réussi.

---

## 13. Préparer la migration des `.pptx`

Les présentations du dossier `pptx/` seront converties plus tard avec ce guide. Pour chacune :

1. **Inventaire** : extraire le texte slide par slide et repérer le plan.
2. **Nettoyage** : retirer les slides de template, les textes d’exemple et les doublons (voir [§ 11](#11-pièges-relevés-dans-les-anciennes-présentations)).
3. **Compléter les informations obligatoires** à demander aux auteurs : matière exacte, enseignant, date de l’oral. Elles manquent dans la plupart des fichiers.
4. **Réécrire chaque slide** dans une mise en page type du [§ 6](#mises-en-page-types), en raccourcissant le texte.
5. **Extraire les images** utiles (`ppt/media/` dans l’archive), les recompresser et retrouver leur source et leur licence.
6. **Vérifier avec la checklist** du [§ 12](#12-checklist-avant-de-présenter), puis publier.

Si plusieurs présentations sont migrées, factoriser `script.js` et la base de `style.css` dans un gabarit commun. Corriger alors un comportement corrigera toutes les présentations.
