# Notes orales — Migrer vers le cloud, maîtriser les risques

ENSAR · UE22 — Sécurité de l’informatique dans les nuages · année universitaire 2026-2027
Présentation : `index.html` (18 slides) · Annexe : `annexe.html` · Métadonnées : `metadata.js`

> **Fichier de préparation interne.** Le build Pika-PPT ne publie pas les fichiers `.md` : ces notes servent à répéter depuis le dépôt. Aucun lien public ne pointe vers elles.

> **Statut des sources.** Cette version a été rédigée sans accès aux deux PDF de l’énoncé (« 2026_UE22_Sécurité informatique en nuage » et « …_Etude de cas_v2 »), à partir de la synthèse du cas fournie par le groupe. Avant l’oral : relire les PDF, corriger tout écart et ajouter les numéros de page dans les références marquées « p. à préciser ».

## Conventions

- **Fait** : élément de l’énoncé. **Hypothèse** : supposition du groupe, à vérifier. **Recommandation** : proposition du groupe. **À confirmer** : information absente de l’énoncé ; on ne conclut ni à sa présence ni à son absence.
- Les noms entre crochets, par exemple [Intervenant 2], sont à remplacer par les prénoms au moment de la répétition.
- Rythme visé : environ 120 mots par minute, pauses comprises. Les textes ci-dessous sont un support de répétition, pas un texte à lire.
- Le minutage est un objectif de répétition. Aucune slide n’avance seule. Touche **R** : affiche l’intervenant, la fenêtre prévue et un chronomètre ; il passe en orange quand on dépasse la fin prévue de la slide.

## Déroulé et minutage

| Slide | Titre | Intervenant | Durée | Intervalle |
| --- | --- | --- | --- | --- |
| 1 | Couverture | 1 | 0:20 | 00:00 – 00:20 |
| 2 | Sommaire | 1 | 0:20 | 00:20 – 00:40 |
| 3 | 01 · Comprendre et comparer | 1 | 0:10 | 00:40 – 00:50 |
| 4 | Le SI est déjà partiellement externalisé | 1 | 1:00 | 00:50 – 01:50 |
| 5 | Le cloud déplace les risques | 1 | 1:40 | 01:50 – 03:30 |
| 6 | Nos priorités suivent les impacts métiers | 1 | 1:30 | 03:30 – 05:00 |
| 7 | 02 · Concevoir et sécuriser | 2 | 0:10 | 05:00 – 05:10 |
| 8 | Une cible progressive, un pilotage industriel local | 2 | 1:20 | 05:10 – 06:30 |
| 9 | Le client conserve des responsabilités | 2 | 1:00 | 06:30 – 07:30 |
| 10 | Les prérequis conditionnent la migration | 2 | 1:30 | 07:30 – 09:00 |
| 11 | Une PSSI cloud doit être applicable | 2 | 1:00 | 09:00 – 10:00 |
| 12 | 03 · Contractualiser et contrôler | 3 | 0:10 | 10:00 – 10:10 |
| 13 | Le contrat encadre toute la chaîne | 3 | 1:15 | 10:10 – 11:25 |
| 14 | Trois niveaux de contrôle | 3 | 1:15 | 11:25 – 12:40 |
| 15 | Migrer par étapes et sous conditions | 3 | 1:00 | 12:40 – 13:40 |
| 16 | Le gain financier reste à démontrer | 3 | 0:40 | 13:40 – 14:20 |
| 17 | Décision proposée au COMEX | 3 | 0:30 | 14:20 – 14:50 |
| 18 | Questions | 3 | 0:10 | 14:50 – 15:00 |

Totaux : intervenant 1 = 300 s ; intervenant 2 = 300 s ; intervenant 3 = 300 s ; total 900 s. Les cinq minutes de questions viennent ensuite.

Couverture des livrables : comparatif on-premise / cloud (slides 4 à 6, annexe § 2 et § 3) ; PSSI cloud (slide 11, annexe § 4) ; exigences client (slides 9 et 10, annexe § 5) ; clauses (slide 13, annexe § 6) ; plan de contrôle (slide 14, annexe § 7). Faisabilité, compétences et économie : slides 8, 10, 15 et 16, annexe § 8.

---

## Intervenant 1 — Comprendre et comparer (00:00 – 05:00)

### Slide 1 — Couverture · 0:20 · 00:00 – 00:20

**Message principal** : nous conseillons le COMEX sur une question précise, pas sur « le cloud » en général.

**Texte oral**

> Bonjour. Nous conseillons le COMEX d’un fabricant de bagages écoresponsables : une ancienne usine à Niort et une boutique en ligne. La direction souhaite migrer vers le cloud pour réduire certains coûts. Notre question : qu’externaliser sans fragiliser la production et les données ?

**Transition** : enchaîner directement sur le sommaire.

**Faits et hypothèses** : faits — activité, usine de Niort, vente en ligne, volonté de réduire certains coûts. Aucune hypothèse.

**Référence** : énoncé, étude de cas v2 (p. à préciser).

### Slide 2 — Sommaire · 0:20 · 00:20 – 00:40

**Message principal** : trois temps, trois intervenants, une recommandation.

**Texte oral**

> Nous répondons en trois temps, un par intervenant. D’abord comprendre l’existant et comparer les risques. Ensuite concevoir une cible et les prérequis de sécurité. Enfin contractualiser et contrôler, jusqu’à la décision que nous proposons. Le détail des cinq livrables est dans l’annexe.

**Transition** : « Première partie. »

**Faits et hypothèses** : sans objet.

**Référence** : annexe, sommaire.

### Slide 3 — Ouverture 01 · 0:10 · 00:40 – 00:50

**Message principal** : le critère de toute la présentation est la continuité métier.

**Texte oral**

> Première partie : comprendre. Notre fil conducteur est simple : préserver la fabrication, les ventes et les données.

**Transition** : passer à la cartographie.

**Faits et hypothèses** : sans objet.

**Référence** : sans objet.

### Slide 4 — Le SI est déjà partiellement externalisé · 1:00 · 00:50 – 01:50

**Message principal** : l’entreprise dépend déjà de prestataires ; la question n’est pas « cloud ou pas », mais « quoi, comment et avec quelles garanties ».

**Texte oral**

> Premier constat : l’entreprise n’est pas « tout sur site ». Elle utilise déjà Office 365 E3 en SaaS, et sa plateforme de vente est développée et exploitée par une ESN, qui l’héberge chez OVH, en France : OVH est donc un prestataire de rang 2. Les échanges avec les partenaires passent par une liaison MPLS d’Orange.
>
> Il y a de vrais acquis : 802.1X, une PKI, une segmentation par le pare-feu de cœur, un SI industriel isolé d’Internet, des environnements séparés. Mais l’énoncé relève aussi des comptes par défaut, des ports ouverts, des logiciels obsolètes, des secrets stockés sur les postes et un BYOD non encadré. Les traits pointillés sont des dépendances que nous devons confirmer : nous ne les inventons pas.

**Transition** : « Que change le cloud à ces risques ? »

**Faits et hypothèses**
- Faits : Office 365 E3 en SaaS ; plateforme web développée et exploitée par une ESN, hébergée chez OVH en France, OVH rang 2 ; Orange et MPLS partenaires ; 802.1X, PKI open source, AD, NAS ; segmentation par le pare-feu de cœur ; OT sous Windows 7 dans un VLAN dédié, Internet bloqué par défaut ; environnements séparés ; vulnérabilités listées ; BYOD non encadré ; postes hétérogènes non gérés ni supervisés ; licences McAfee sans preuve de déploiement complet.
- À confirmer : flux OT–IT ; synchronisation de l’AD avec Office 365 ; liens entre la plateforme web et les applications internes ; redondance des accès.
- Ambiguïté signalée : Talentsoft et Salesforce sont décrits comme hébergés localement, alors que ces offres sont habituellement proposées en SaaS. Nous gardons l’énoncé et posons la question ; nous ne le corrigeons pas.
- Office 365 E3 n’est pas Microsoft 365 E3 : ne pas supposer que les fonctions de sécurité avancées sont incluses.

**Référence** : énoncé (p. à préciser) ; ANSSI, guide d’hygiène informatique v2.0, mesure 3 (infogérance).

### Slide 5 — Le cloud déplace les risques · 1:40 · 01:50 – 03:30

**Message principal** : pas de score global « cloud plus sûr » ; chaque scénario évolue différemment et chaque amélioration a une condition.

**Texte oral**

> Comparons on-premise et cloud, scénario par scénario, sans score global.
>
> Sinistre local : aujourd’hui, le SI interne est sur site et aucun plan de reprise n’est documenté. Dans le cloud, les services migrés sont moins exposés à un incendie à Niort, mais l’usine et le réseau local restent concernés.
>
> Perte de connectivité : c’est l’inverse. Chaque service migré dépend du lien Internet. Il faut un double accès et un mode dégradé.
>
> Compromission d’identité : les consoles cloud sont joignables depuis Internet. Un compte d’administrateur volé ouvre tout. MFA et comptes d’administration dédiés deviennent indispensables.
>
> Fuite ou destruction de données : le risque se déplace. On ne perd plus seulement un disque ; on publie un partage par erreur, ou une suppression est répliquée partout. D’où la classification et une sauvegarde indépendante du service.
>
> Enfin, la dépendance fournisseur augmente : concentration, coût de sortie. Elle se traite par le contrat et par un plan de sortie testé.
>
> Retenons : le cloud ne rend pas le SI plus sûr ou moins sûr par nature. Il déplace les risques, et chaque condition de maîtrise reste à notre charge.

**Transition** : « Tous ces risques n’ont pas la même priorité. »

**Faits et hypothèses**
- Hypothèse : AD, NAS et applications internes sont hébergés sur le site de Niort.
- À confirmer : sauvegardes hors site, PRA, MFA, redondance des accès.
- Vigilance : sauvegarde, réplication, haute disponibilité et PRA ne sont pas synonymes. La réplication recopie aussi une suppression ; seule une restauration réussie prouve la capacité de reprise.

**Référence** : Microsoft Learn, *Shared responsibility in the cloud* (mise à jour 24/08/2026, consulté le 17/11/2026) ; ANSSI (2024), *Recommandations pour l’hébergement dans le cloud des SI sensibles*, p. 4-5 ; annexe § 2.

### Slide 6 — Nos priorités suivent les impacts métiers · 1:30 · 03:30 – 05:00

**Message principal** : nous priorisons par impact métier ; les cotations sont provisoires et il manque des données pour décider.

**Texte oral**

> Comment prioriser ? Nous suivons une logique inspirée de l’analyse de risque, sans prétendre à une étude EBIOS complète : un scénario, son impact métier, sa vraisemblance, les protections existantes, puis le risque résiduel.
>
> Trois scénarios ressortent. Un : la compromission d’un poste ou d’un compte privilégié. Les failles sont déjà constatées et rien n’est supervisé : priorité 1. C’est aussi la porte d’entrée d’un rançongiciel.
>
> Deux : l’indisponibilité d’un service indispensable à la production ou aux ventes. Aujourd’hui priorité 2, parce que les dépendances ne sont pas cartographiées ; mais elle devient priorité 1 pour tout service que l’on migre.
>
> Trois : la destruction ou la fuite de données, alors que personne n’a démontré qu’on sait restaurer : priorité 1.
>
> Nous les avons cotés, de façon provisoire, dans un registre de onze risques en annexe. Ces cotations sont des estimations pédagogiques. Pour décider, il nous manque les dépendances, la durée d’interruption et la perte de données acceptables, l’état réel des sauvegardes, le MFA et les journaux. [Intervenant 2] va maintenant montrer quelle cible permet de traiter ces risques.

**Transition** : passage de parole explicite à l’intervenant 2.

**Faits et hypothèses**
- Faits : vulnérabilités constatées, postes non supervisés, droits d’administration locaux.
- Estimations : priorités dérivées du registre (annexe § 3) : R1 et R2 au niveau 12, R3 au niveau 8 comme risque induit.
- À confirmer : sauvegardes, PRA, MFA, dépendances, besoins de continuité.
- Distinguer : risque **actuel** (avec les mesures existantes), risque **induit** par la migration, risque **résiduel cible** (après mesures, à accepter).

**Référence** : annexe § 3 (échelles et justifications) ; ANSSI (2024), p. 4 : la décision de migrer relève de la plus haute autorité, éclairée par une étude d’impact et une analyse de risques.

---

## Intervenant 2 — Concevoir et sécuriser (05:00 – 10:00)

### Slide 7 — Ouverture 02 · 0:10 · 05:00 – 05:10

**Message principal** : pas de migration en bloc.

**Texte oral**

> Merci. Deuxième partie : concevoir. Notre principe : choisir une cible adaptée à chaque usage, pas une migration en bloc.

**Transition** : afficher la cible.

**Faits et hypothèses** : sans objet.

**Référence** : sans objet.

### Slide 8 — Une cible progressive, un pilotage industriel local · 1:20 · 05:10 – 06:30

**Message principal** : on garde l’OT local, on sécurise l’existant cloud, on étudie le reste application par application.

**Texte oral**

> Voici la cible que nous proposons. À gauche, le site de Niort : le pilotage industriel reste local. Les postes Windows 7 sont maintenus pour compatibilité ; les relier au cloud ajouterait un risque pour la production sans bénéfice démontré. Une étude spécifique de l’OT viendra plus tard.
>
> À droite, le cloud. Office 365 et la plateforme web existent déjà : la première étape est de les sécuriser, pas d’en ajouter. Talentsoft, Salesforce, Qualiac et Hadoop sont des candidats, à étudier application par application selon leurs données, leurs dépendances, leur coût et leurs conditions de sortie.
>
> Au centre, les flux : filtrés, chiffrés, journalisés. La redondance de la connectivité est à étudier, et nous ne dessinons aucun flux industriel direct vers Internet. Deux dépendances doivent être instruites tôt : l’Active Directory et la PKI, qui portent aussi le 802.1X.
>
> Enfin, le socle : des sauvegardes isolées et testées, et une administration par comptes et postes dédiés.

**Transition** : « Migrer ne veut pas dire déléguer toute la sécurité. »

**Faits et hypothèses**
- Faits : postes industriels Windows 7 pour compatibilité, VLAN dédié, Internet bloqué ; mises à jour automatiques annoncées.
- Point d’examen : Windows 7 n’a plus de correctifs publics depuis le 14/01/2020 (programme ESU clos en janvier 2023). Des « mises à jour automatiques » sur ces postes sont donc à clarifier (antivirus ? logiciels métier ?). En milieu industriel, les correctifs ne peuvent souvent être installés qu’en phase de maintenance et les mises à jour automatiques sont souvent incompatibles avec les anciens systèmes : tout changement OT est validé avec la production et les éditeurs, jamais appliqué à l’aveugle.
- Recommandation : choix du pilote sur un usage non critique pour la fabrication, après cadrage.
- Hypothèse de travail : une identité hybride (AD synchronisé avec le cloud) sera nécessaire ; à étudier avec la PKI et le 802.1X.

**Référence** : ANSSI-PA-108 v2.0 (27/11/2025), § 2.2.1, p. 15 ; Microsoft Lifecycle, Windows 7 ; ANSSI-PA-107 v2.0 (10/03/2025) pour la future étude OT.

### Slide 9 — Le client conserve des responsabilités · 1:00 · 06:30 – 07:30

**Message principal** : quel que soit le modèle, données, identités et configuration restent au client.

**Texte oral**

> Migrer, ce n’est pas déléguer toute la sécurité. Ce tableau donne une répartition indicative. En IaaS, le fournisseur gère le matériel ; nous gardons le système, l’application et les données. En PaaS, il gère aussi le système ; nous gardons le code et le paramétrage. En SaaS, il gère l’essentiel de l’application.
>
> Mais la dernière ligne ne change jamais : données, identités et configuration restent chez nous. Pour Office 365, Microsoft gère les serveurs, mais c’est nous qui décidons qui partage quoi, et avec qui. Concrètement, l’entreprise doit toujours classer ses données, gérer les comptes et les droits, paramétrer puis vérifier, organiser la sauvegarde et la sortie, et accepter le risque résiduel.
>
> Cette répartition se confirme offre par offre, contrat par contrat : c’est le lien avec la troisième partie.

**Transition** : « Ces responsabilités se traduisent en prérequis. »

**Faits et hypothèses**
- Répartition issue d’un modèle de fournisseur, donc indicative : à confirmer dans chaque offre et contrat.
- Pour les données personnelles, l’entreprise reste responsable de traitement pour ses propres traitements ; les rôles se qualifient traitement par traitement.

**Référence** : Microsoft Learn, *Shared responsibility in the cloud*, matrice de responsabilité (consulté le 17/11/2026) ; NIST SP 800-145 (définitions IaaS, PaaS, SaaS) ; ANSSI (2024), p. 5 : certaines actions restent de la responsabilité du client, notamment configurer les options de sécurité.

### Slide 10 — Les prérequis conditionnent la migration · 1:30 · 07:30 – 09:00

**Message principal** : pas de migration sans prérequis prouvés ; chaque exigence a une preuve et un responsable.

**Texte oral**

> Ces responsabilités se traduisent en prérequis. Nous les avons regroupés en quatre domaines, chacun avec une exigence vérifiable, une preuve et un responsable côté client.
>
> Identités et administration : MFA sur cent pour cent des comptes à privilèges, et une revue trimestrielle des droits. La preuve, c’est un export de configuration et un compte rendu signé, pas une déclaration.
>
> Postes, vulnérabilités et secrets : plus aucun compte par défaut actif, et un inventaire des actifs à jour, vérifiés par un scan avant et après.
>
> Sauvegardes et reprise : une restauration complète, chronométrée, dans le délai fixé par le métier. Tant qu’elle n’a pas réussi, on ne migre pas.
>
> Supervision et compétences : des journaux d’administration réellement revus, et un référent SSI désigné. L’entreprise a des compétences techniques mais pas d’expert SSI : ce rôle peut être interne ou à temps partagé.
>
> C’est aussi là qu’une licence ne suffit pas : McAfee offre plusieurs protections, mais seul un tableau de couverture prouve qu’elles sont déployées.

**Transition** : « Ces exigences s’inscrivent dans une politique. »

**Faits et hypothèses**
- Faits : comptes par défaut, secrets locaux, droits d’administration locaux, absence d’expert SSI, licences McAfee sans preuve de déploiement complet.
- À confirmer : MFA existant. Office 365 E3 permet le MFA (paramètres de sécurité par défaut) ; l’accès conditionnel requiert Microsoft Entra ID P1, inclus dans Microsoft 365 E3 mais pas listé pour Office 365 E3.
- Responsables proposés : responsable IT, équipe technique, responsable IT avec le métier, direction. La direction les nomme.

**Référence** : annexe § 5 (21 exigences EX-01 à EX-21) ; ANSSI, guide d’hygiène v2.0, mesures 8, 14, 37 et 39 ; Microsoft Learn, *Microsoft Entra licensing* (07/10/2026, consulté le 17/11/2026).

### Slide 11 — Une PSSI cloud doit être applicable · 1:00 · 09:00 – 10:00

**Message principal** : une politique utile est applicable et contrôlable.

**Texte oral**

> Tout cela s’ancre dans une PSSI cloud. Nous proposons six ensembles : gouvernance et fournisseurs ; données et conformité ; identités et accès ; architecture, exploitation et développement ; incidents et continuité ; contrôles et réversibilité.
>
> Le mot important du titre est « applicable ». Une politique qui reste un document ne protège rien. Chaque règle doit avoir un propriétaire, un périmètre, une preuve et une date de revue. Exemple : « tout compte à privilèges utilise le MFA » ; propriétaire, le responsable IT ; preuve, l’export de configuration ; revue, chaque trimestre. La PSSI est validée par le COMEX, et son plan détaillé est en annexe.
>
> Reste une question : comment s’assurer que les fournisseurs tiennent leur part, et que nous tenons la nôtre ? [Intervenant 3] vous présente les contrats et les contrôles.

**Transition** : passage de parole explicite à l’intervenant 3.

**Sommaire complet de la PSSI cloud** (développé en annexe § 4)

0. Cadre : objet ; périmètre (IaaS, PaaS, SaaS, prestataires et sous-traitants ; SI industriel exclu sauf interfaces) ; articulation avec la PSSI générale, dont l’existence est à confirmer ; références ; approbation COMEX ; revue annuelle ; dérogations à durée limitée.
1. Gouvernance et fournisseurs : rôles (COMEX, comité opérationnel, référent SSI, propriétaires, référent RGPD) ; procédure d’adoption d’un service ; registre des services et prestataires, rang 2 inclus ; critères de sélection ; revue annuelle des fournisseurs.
2. Données et conformité : classification et règles d’hébergement ; localisation, transferts, lois extraterritoriales ; RGPD par traitement ; chiffrement et clés ; conservation, restitution, effacement.
3. Identités et accès : annuaire de référence et synchronisation ; MFA ; comptes d’administration dédiés ; cycle de vie et revues ; secrets et comptes de service ; accès des prestataires ; terminaux et BYOD.
4. Architecture, exploitation et développement : configurations de référence ; segmentation et matrice des flux ; vulnérabilités et correctifs, avec procédure OT ; journalisation ; administration sécurisée ; changements et documentation ; séparation des environnements et données de test ; développement sécurisé chez l’ESN.
5. Incidents et continuité : détection et escalade ; alertes contractuelles et notifications réglementaires ; sauvegardes ; PCA, PRA, mode dégradé ; exercice annuel.
6. Contrôles et réversibilité : plan N1, N2, N3 ; audits fournisseurs ; traitement des écarts ; plan de réversibilité testé.
Annexes : glossaire, RACI par service, matrice des flux, modèle de dérogation, liste des services autorisés.

**Faits et hypothèses** : à confirmer — existence d’une PSSI générale ; COMEX et comité opérationnel existent (fait).

**Référence** : ISO/IEC 27001:2022 (mesures relatives aux fournisseurs et aux services en nuage), ISO/IEC 27017 ; CNIL, guide 2024, fiche 22 ; Cloud Security Alliance, CCM v4.1.

---

## Intervenant 3 — Contractualiser et contrôler (10:00 – 15:00)

### Slide 12 — Ouverture 03 · 0:10 · 10:00 – 10:10

**Message principal** : la confiance se prouve.

**Texte oral**

> Merci. Troisième partie : contractualiser et contrôler. Autrement dit, transformer les engagements en preuves.

**Transition** : afficher la chaîne contractuelle.

**Faits et hypothèses** : sans objet.

**Référence** : sans objet.

### Slide 13 — Le contrat encadre toute la chaîne · 1:15 · 10:10 – 11:25

**Message principal** : les exigences doivent descendre jusqu’au rang 2 ; Office 365 relève d’un autre contrat.

**Texte oral**

> Premier outil : le contrat. Pour la plateforme web, la chaîne compte deux rangs : l’entreprise contracte avec l’ESN, qui contracte avec OVH. Nos exigences doivent donc être répercutées jusqu’à OVH par le contrat de l’ESN, que nous devons pouvoir vérifier. Office 365, c’est un autre contrat, aux conditions standard de Microsoft : on le vérifie et on compense par le paramétrage.
>
> Nous regroupons les clauses en quatre familles. Responsabilités, données et sous-traitance : les rôles RGPD sont qualifiés traitement par traitement, et tout sous-traitant ultérieur doit être autorisé. Disponibilité, sauvegardes et incidents. Audits et traitement des écarts. Réversibilité, restitution et effacement.
>
> Un exemple d’engagement vérifiable : alerte sous vingt-quatre heures après détection. Ce délai contractuel est distinct du délai légal : c’est l’entreprise, responsable de traitement, qui notifie la CNIL dans les meilleurs délais et si possible sous soixante-douze heures. Le délai du fournisseur doit lui permettre de tenir ce délai.

**Transition** : « Un contrat ne vaut que s’il est contrôlé. »

**Faits et hypothèses**
- Faits : ESN qui développe et exploite ; OVH hébergeur en France, rang 2 ; Office 365 E3.
- À confirmer : contenu des contrats existants ; existence d’un lien contractuel direct avec OVH (a priori aucun).
- Vigilance : ne pas recopier une clause qui qualifierait l’hébergeur de responsable de traitement sans analyse ; pour l’hébergement de la plateforme, OVH est a priori sous-traitant ultérieur de l’ESN, elle-même sous-traitante de l’entreprise.
- Localisation en France ≠ souveraineté ≠ conformité RGPD.
- Formulations détaillées : annexe § 6 (clauses A1 à D4). Exemple complet : « Le prestataire notifie au client tout incident de sécurité affectant ou susceptible d’affecter ses données ou le service dans un délai de [24 h] après détection, puis remet un rapport complet sous [5 jours ouvrés]. »

**Référence** : RGPD, art. 28 §2 et §4 (sous-traitants ultérieurs), art. 28 §3 h (audits), art. 33 §1 et §2 (notification) ; Data Act (UE) 2023/2854, art. 25 (préavis maximal de deux mois, période transitoire de trente jours) et art. 29 (fin des frais de changement au 12/01/2027) ; ANSSI, guide d’hygiène, mesure 3 (plan d’assurance sécurité, réversibilité, audits).

### Slide 14 — Trois niveaux de contrôle · 1:15 · 11:25 – 12:40

**Message principal** : contrôle à trois niveaux, réaliste pour une petite structure, et acceptation du risque par le COMEX.

**Texte oral**

> Deuxième outil : le contrôle, sur trois niveaux. N1, l’exploitation : l’équipe technique et l’ESN vérifient au quotidien les sauvegardes, les correctifs, les alertes, avec des tickets et des rapports comme preuves. N2, la supervision : un référent SSI et risques, distinct autant que possible de ceux qui exécutent, contrôle par échantillon chaque trimestre et suit les fournisseurs. N3, l’audit : un auditeur indépendant, chaque année et avant toute généralisation, examine la configuration, teste l’intrusion de la plateforme web et vérifie le contrat.
>
> Exemple de contrôle N2 : chaque trimestre, le référent tire au hasard trois sauvegardes et vérifie qu’elles se restaurent. Pour une petite structure, c’est réaliste : le N2 peut être à temps partagé, le N3 est externe.
>
> Au sommet, le COMEX reçoit la synthèse, arbitre, et accepte ou refuse par écrit le risque résiduel. Et un certificat du fournisseur éclaire nos contrôles, il ne les remplace pas : il faut en vérifier le périmètre.

**Transition** : « Reste à organiser la trajectoire. »

**Faits et hypothèses**
- Fait : COMEX et comité opérationnel existent ; pas d’expert SSI.
- Recommandation : fréquences proposées, à ajuster ; détail en annexe § 7 (16 contrôles).
- Vigilance : une certification ou une qualification ne supprime pas un risque ; la qualification SecNumCloud, par exemple, ne préjuge pas du niveau de sécurité des services du client hébergés sur l’offre.

**Référence** : annexe § 7 ; ANSSI (2024), focus SecNumCloud, p. 9 ; RGPD art. 32 §1 d (procédure de test et d’évaluation régulière).

### Slide 15 — Migrer par étapes et sous conditions · 1:00 · 12:40 – 13:40

**Message principal** : chaque étape a un critère de passage ; aucune date n’est promise.

**Texte oral**

> Comment avancer ? Par étapes, et chaque étape a un critère de passage. Le cadrage valide l’inventaire, les dépendances et les besoins métiers. La remédiation atteint et prouve les prérequis. Le pilote, sur un usage non critique pour la fabrication, teste compatibilité, sécurité, restauration et retour arrière ; son périmètre est choisi au cadrage, limité et réversible. Vient alors la décision du COMEX : contrat conforme, coût complet, risque accepté. Puis la migration par lots, chacun validé par le métier avec une possibilité de retour arrière. Enfin, le suivi par les trois niveaux de contrôle.
>
> Nous ne fixons volontairement aucune date : une étape s’ouvre quand son critère est prouvé, pas quand le calendrier l’impose.

**Transition** : « Un mot sur l’argument économique. »

**Faits et hypothèses** : recommandation du groupe ; aucune date de projet n’est acquise.

**Référence** : ANSSI (2024), p. 4-5 : étude d’impact, analyse de risques, clause de réversibilité, formation des équipes ; annexe § 5 (jalons des exigences).

### Slide 16 — Le gain financier reste à démontrer · 0:40 · 13:40 – 14:20

**Message principal** : comparer des coûts complets, à périmètre égal ; pas de montant inventé.

**Texte oral**

> Un mot sur l’argument économique, puisqu’il motive le projet : le gain reste à démontrer. Il faut comparer le coût complet, sur la même période et au même niveau de service. Aujourd’hui : matériel, énergie, licences, exploitation, sécurité. Demain : abonnements, réseau, sauvegardes, journaux, exploitation. Sans oublier la transition : migration, formation, double fonctionnement, sortie. Un serveur que l’on n’achète plus est un coût évité ; un abonnement, des journaux ou une liaison redondante sont des coûts déplacés. L’énoncé ne donne aucun coût : nous ne présentons donc aucun montant.

**Transition** : « D’où notre recommandation. »

**Faits et hypothèses** : fait — volonté de réduire certains coûts. Aucun coût fourni. Méthode proposée : période de trois à cinq ans par exemple, distinction coûts évités / coûts déplacés, sensibilité aux volumes.

**Référence** : annexe § 8 ; ANSSI (2024), p. 5 : la formation contribue à la maîtrise des coûts et des délais.

### Slide 17 — Décision proposée au COMEX · 0:30 · 14:20 – 14:50

**Message principal** : avancer, sous conditions.

**Texte oral**

> En résumé, une migration progressive et sélective peut être pertinente, si les fondamentaux sont sécurisés, les responsabilités contractualisées et la continuité démontrée. Notre recommandation tient en trois décisions. Un : autoriser le cadrage et un pilote. Deux : conditionner la généralisation aux résultats. Trois : protéger la continuité industrielle et accepter explicitement le risque résiduel. C’est une recommandation : la décision appartient au COMEX.

**Transition** : « Merci. »

**Faits et hypothèses** : recommandation du groupe, ni décision prise, ni obligation réglementaire.

**Référence** : ANSSI (2024), p. 4 : la décision de migrer relève de la plus haute autorité de l’entité.

### Slide 18 — Questions · 0:10 · 14:50 – 15:00

**Message principal** : fin des quinze minutes préparées.

**Texte oral**

> Merci pour votre attention. Nous sommes prêts à répondre à vos questions.

**Transition** : ouvrir l’annexe si une question porte sur le registre, les clauses ou le plan de contrôle.

**Faits et hypothèses** : sans objet.

**Référence** : annexe.

---

## Préparation aux questions (5 minutes)

Réponses courtes, 20 à 40 secondes. Répartition suggérée : la personne qui a présenté le sujet répond.

**1. Pourquoi ne pas tout migrer ?** (intervenant 2)
Parce que rien ne prouve encore le gain, que les dépendances (AD, PKI, flux OT) ne sont pas cartographiées et que chaque service migré dépend de la connectivité. Migrer en bloc additionnerait les risques avant d’avoir prouvé la restauration et obtenu des contrats adaptés. Le pilote mesure tout cela sur un périmètre limité.

**2. Pourquoi maintenir l’OT local ?** (intervenant 2)
La continuité de fabrication prime. Les postes Windows 7 sont gardés pour compatibilité et ne reçoivent plus de correctifs publics ; les relier au cloud élargirait la surface d’attaque sans bénéfice démontré. L’ANSSI rappelle qu’en industrie les correctifs s’installent souvent en maintenance et que les mises à jour automatiques sont souvent incompatibles avec les anciens systèmes. Une étude OT spécifique, avec la production et les éditeurs, viendra ensuite.

**3. Qui reste responsable en SaaS ?** (intervenant 2)
Le client, pour ses données, ses identités, ses configurations, ses terminaux, et pour ses obligations de responsable de traitement au titre du RGPD. Le fournisseur gère l’infrastructure et l’application dans les limites du contrat. Même Microsoft l’écrit : quel que soit le modèle, données, terminaux, comptes et gestion des accès restent au client.

**4. Pourquoi une sauvegarde du fournisseur ne suffit-elle pas à démontrer la résilience ?** (intervenant 1 ou 3)
Elle protège souvent l’infrastructure du fournisseur, pas l’erreur du client : une suppression ou un chiffrement synchronisé est répliqué, et la rétention est limitée. Elle reste dans le même périmètre de défaillance, même compte et même fournisseur. Surtout, seule une restauration réussie, chronométrée, dans le délai fixé par le métier, démontre la résilience. Réplication ≠ sauvegarde ; haute disponibilité ≠ PRA.

**5. Comment prouver le gain économique ?** (intervenant 3)
Avec un coût complet sur la même période, par exemple trois à cinq ans, et au même niveau de service ; à partir de données réelles (factures, inventaire, temps passé) ; en incluant la transition et la sortie ; avec une analyse de sensibilité aux volumes. Le pilote fournit les premières mesures. Le COMEX décide sur cette base.

**6. Comment tester la réversibilité ?** (intervenant 3)
Par un export réel d’un échantillon de données et de configurations, réimporté dans un autre environnement ou sur site, puis vérifié (complétude, intégrité, fonctionnement) et chronométré, avec un procès-verbal. Le contrat doit prévoir des formats ouverts et une assistance ; pour les services cloud, le Data Act fixe un préavis maximal de deux mois et une période transitoire de trente jours.

**7. Comment organiser des contrôles indépendants dans une petite structure ?** (intervenant 3)
En séparant celui qui fait (N1) de celui qui vérifie (N2), même à temps partiel : un référent qui n’administre pas les systèmes qu’il contrôle, un RSSI à temps partagé ou une revue croisée. Le N3 est confié à un auditeur externe ; la qualification PASSI peut servir de critère. Les rapports et certificats des fournisseurs complètent, après vérification de leur périmètre. Le COMEX accepte formellement le risque résiduel.

**8. Quelles données manquent pour décider ?** (intervenant 1)
Les dépendances applicatives et les flux OT–IT ; la durée d’interruption et la perte de données admissibles par processus ; l’état des sauvegardes et d’un éventuel PRA ; le MFA et les licences ; les contrats existants ; les coûts actuels ; l’hébergement réel de Talentsoft et Salesforce ; la taille et l’activité exacte de l’entreprise pour qualifier NIS 2.

**Questions possibles en complément**

- *NIS 2 s’applique-t-elle ?* À qualifier, sans présumer : le secteur « fabrication » de l’annexe II vise les dispositifs médicaux et les divisions NACE 26 à 30, a priori pas les bagages ; il faut aussi examiner le secteur des produits chimiques (production d’articles), la taille de l’entreprise et le texte français de transposition, toujours en cours d’adoption au 17/11/2026. Elle peut servir de référentiel volontaire.
- *Pourquoi ne pas imposer SecNumCloud ?* Ce n’est pas une obligation pour cette entreprise. C’est un critère de sélection si la sensibilité des données ou un client l’exige ; et la qualification de l’offre ne sécurise pas les services que le client y héberge.
- *HDS, DORA ?* DORA vise les entités financières : non applicable. HDS : non applicable a priori, à revoir si des données de santé étaient hébergées pour des tiers.
- *Office 365 E3 suffit-il ?* Il permet le MFA. L’accès conditionnel requiert Microsoft Entra ID P1, inclus dans Microsoft 365 E3 et pas listé pour Office 365 E3 : vérifier le contrat et le besoin avant tout achat.

---

## Métadonnées à compléter dans `metadata.js`

- `speakers` : prénoms et noms des trois intervenants, dans l’ordre de passage.
- `speakersShort` : version courte pour le bas de page.
- `teacher` : enseignant (affiché « à compléter » tant qu’il est vide).
- `defenseDate` : date de soutenance (masquée tant qu’elle est vide). Elle est distincte de la date technique du manifeste (`presentation.json`, 2026-11-17, date de création).
- `group` et `contact` : facultatifs.
