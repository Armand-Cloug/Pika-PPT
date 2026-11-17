(() => {
  'use strict';
  // Icône d’onglet : logo partagé du site Pika-PPT quand la page est servie en HTTP(S),
  // icône locale hors ligne (file://), où /assets/logo.png n’existe pas.
  const favicon = document.getElementById('favicon');
  if (favicon && /^https?:$/.test(location.protocol)) { favicon.type = 'image/png'; favicon.href = '/assets/logo.png'; }
  // Même source de métadonnées que la présentation : metadata.js.
  const meta = Object.assign({
    school: '', course: '', courseShort: '', academicYear: '',
    speakers: [], speakersShort: '', teacher: '', defenseDate: ''
  }, window.DECK_META || {});
  const speakers = [0, 1, 2].map(i => (meta.speakers && meta.speakers[i]) || `Intervenant ${i + 1}`);
  const values = {
    school: meta.school,
    course: meta.course,
    academicYear: meta.academicYear,
    speakers: speakers.join(' · '),
    teacher: meta.teacher || 'à compléter',
    defenseDate: meta.defenseDate
  };
  document.querySelectorAll('[data-meta]').forEach(element => {
    const value = values[element.dataset.meta];
    if (typeof value === 'string' && value) element.textContent = value;
    if (element.dataset.meta === 'teacher') element.classList.toggle('is-todo', !meta.teacher);
  });
  document.querySelectorAll('[data-meta-optional]').forEach(element => {
    element.hidden = !meta[element.dataset.metaOptional];
  });
  const foot = document.getElementById('doc-foot-info');
  if (foot) {
    foot.textContent = [meta.school, meta.courseShort || meta.course, meta.speakersShort || speakers.join(', '),
      `Enseignant : ${meta.teacher || 'à compléter'}`].filter(Boolean).join(' · ');
  }
  const print = document.getElementById('print-button');
  if (print) print.addEventListener('click', () => window.print());
})();
