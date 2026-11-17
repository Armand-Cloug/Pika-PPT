/*
 * Métadonnées de la présentation et de l’annexe : SEULE source à modifier.
 * Elles alimentent la page de garde, le bas de page, la slide de questions,
 * le sélecteur de slides, le mode répétition et l’en-tête de l’annexe.
 *
 * Laisser une valeur vide ('') quand l’information n’est pas encore connue :
 * rien n’est inventé, la mention « à compléter » ou l’absence du champ est gérée
 * par script.js et annexe.js.
 */
window.DECK_META = Object.freeze({
  school: 'ENSAR',
  course: 'UE22 — Sécurité de l’informatique dans les nuages',
  courseShort: 'UE22 Sécurité cloud',
  academicYear: '2026-2027',

  // Noms complets, dans l’ordre de passage (page de garde, slide finale, notes).
  speakers: ['Armand Zireg', 'Timothée Faure', 'Mael Bodin'],
  // Version courte pour le bas de page, par exemple « A. NOM, B. NOM & C. NOM ».
  speakersShort: 'A. Zireg, T. Faure & M. Bodin',

  group: '',        // Facultatif : nom du groupe, classe ou option.
  teacher: 'Arnaud Pupin', // Enseignant : Prénom NOM. Affiché « à compléter » tant qu’il est vide.
  defenseDate: '',  // Date de soutenance, par exemple « 8 décembre 2026 ». Masquée si vide.
  contact: ''       // Facultatif : adresse de contact affichée sur la slide finale.
});
