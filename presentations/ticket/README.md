# S&R — Observatoire des tickets

Ouvrir **index.html** dans un navigateur (double-clic). La page est autonome : aucune installation, aucun serveur et aucune connexion Internet nécessaires.

- **Vue d’ensemble** : indicateurs, créations/résolutions, statuts, responsables et délais.
- **Évolution** : courbes mensuelles ou trimestrielles, stock, délai médian et repères annuels.
- **Équipe** : volumes, délais, taux dans le seuil et heures par responsable ; tri et accès aux tickets.
- **Répartition** : projet, type, urgence, criticité, priorité et émetteur.
- **Tous les tickets** : recherche, statuts, tri, pagination et fiche détaillée.

Les filtres sont communs aux vues et portent sur l’année/date de **création**. Le graphique et les repères annuels placent chaque résolution au mois/à l’année de fin. Les données de 2026 s’arrêtent au 1er octobre. Les statuts correspondent à la situation à l’export, même lorsqu’une année passée est sélectionnée.

Le bouton en haut à droite active le plein écran pour présenter la page. **Exporter la sélection** télécharge les données filtrées en CSV compatible Excel. Dans la vue Tickets, cet export tient aussi compte du statut et de la recherche, sur toutes les pages de résultats.

**Méthode & définitions** explique les calculs et permet d’ajuster les seuils de prise en charge et de résolution pour la session. Les délais négatifs ou absents sont exclus, jamais remplacés par zéro. Les seuils sont des paramètres d’analyse, pas des engagements contractuels.

## Actualiser les données

Le fichier HTML contient un instantané du classeur, sans synchronisation automatique. Après modification du classeur, reconstruire la page avec Python 3 :

```sh
python3 tools/build_dashboard.py
```

Ou fournir le chemin d’un classeur de même structure (onglets, colonnes et paramètres) :

```sh
python3 tools/build_dashboard.py chemin/vers/analyse.xlsx
```

Le générateur utilise uniquement la bibliothèque standard Python. Il lit les résultats de formules enregistrés par Excel/LibreOffice : recalculer et sauvegarder le classeur avant une mise à jour. Le classeur source n’est pas modifié.

## Sources & partage

Les sources de l’interface se trouvent dans `src/`. `index.html` regroupe l’interface et tous les tickets. Pour partager la page, ce fichier suffit ; il contient aussi les données masquées par les filtres. Aucun service externe, police distante, suivi ni ressource réseau n’est utilisé.

