(() => {
  'use strict';
  const stage = document.getElementById('stage');
  const slides = Array.from(document.querySelectorAll('.slide'));
  const counter = document.getElementById('slide-counter');
  const progress = document.getElementById('progress');
  const chapter = document.getElementById('chapter-name');
  const previous = document.getElementById('previous');
  const next = document.getElementById('next');
  const overview = document.getElementById('overview');
  const sources = document.getElementById('sources');
  const rehearsal = document.getElementById('rehearsal');
  const rehearsalButton = document.getElementById('rehearsal-button');
  const deckTitle = stage.dataset.deckTitle || document.title;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let current = -1;
  let wheelSum = 0;
  let wheelTimer;
  let lastWheel = 0;
  let touchStart = null;
  let statusTimer;
  let rehearsalStart = 0;
  let rehearsalTimer = 0;

  // Icône d’onglet : logo partagé du site Pika-PPT quand la page est servie en HTTP(S),
  // icône locale hors ligne (file://), où /assets/logo.png n’existe pas.
  const favicon = document.getElementById('favicon');
  if (favicon && /^https?:$/.test(location.protocol)) { favicon.type = 'image/png'; favicon.href = '/assets/logo.png'; }

  // Métadonnées : une seule source, metadata.js. Valeurs vides = rien d’inventé.
  const meta = Object.assign({
    school: '', course: '', courseShort: '', academicYear: '',
    speakers: [], speakersShort: '', group: '', teacher: '', defenseDate: '', contact: ''
  }, window.DECK_META || {});
  const speakers = [0, 1, 2].map(i => (meta.speakers && meta.speakers[i]) || `Intervenant ${i + 1}`);
  const metaValues = {
    school: meta.school,
    academicYear: meta.academicYear,
    speakers: speakers.join(' · '),
    'speaker-1': speakers[0],
    'speaker-2': speakers[1],
    'speaker-3': speakers[2],
    teacher: meta.teacher || 'à compléter',
    group: meta.group,
    defenseDate: meta.defenseDate,
    contact: meta.contact
  };
  document.querySelectorAll('[data-meta]').forEach(element => {
    const value = metaValues[element.dataset.meta];
    if (typeof value === 'string' && value) element.textContent = value;
    if (element.dataset.meta === 'teacher') element.classList.toggle('is-todo', !meta.teacher);
  });
  document.querySelectorAll('[data-meta-optional]').forEach(element => {
    element.hidden = !meta[element.dataset.metaOptional];
  });

  // Minutage prévu : data-speaker et data-time (secondes) sur chaque slide.
  const timing = [];
  slides.reduce((start, slide) => {
    const duration = Number(slide.dataset.time) || 0;
    timing.push({ speaker: Number(slide.dataset.speaker) || 0, start, end: start + duration, duration });
    return start + duration;
  }, 0);
  const totals = timing.reduce((sum, item) => { sum[item.speaker] = (sum[item.speaker] || 0) + item.duration; return sum; }, {});
  if (totals[1] !== 300 || totals[2] !== 300 || totals[3] !== 300) {
    console.warn('Minutage : chaque intervenant devrait totaliser 300 s.', totals);
  }

  function clock(seconds) {
    const s = Math.max(0, Math.round(seconds));
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  }
  function span(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m ? `${m} min${s ? ` ${String(s).padStart(2, '0')}` : ''}` : `${s} s`;
  }
  function pageLabel(index) {
    return `${String(index + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
  }
  function resize() {
    // Variante portrait (téléphone) : scène de 760 × 1180 sous un ratio 4:5.
    const portrait = window.matchMedia('screen and (max-aspect-ratio: 4/5)').matches;
    const width = portrait ? 760 : 1600;
    const height = portrait ? 1180 : 900;
    // clientWidth/clientHeight = fenêtre réellement visible. Sur mobile, innerWidth peut
    // être élargi par le débordement initial de la scène et fausser l’échelle.
    const root = document.documentElement;
    const viewWidth = root.clientWidth || window.innerWidth;
    const viewHeight = root.clientHeight || window.innerHeight;
    stage.style.setProperty('--scale', Math.min(viewWidth / width, viewHeight / height));
  }
  function announce(message) {
    const status = document.getElementById('status-message');
    status.textContent = message;
    status.classList.add('visible');
    clearTimeout(statusTimer);
    statusTimer = setTimeout(() => status.classList.remove('visible'), 3500);
  }
  function updateRehearsal() {
    if (rehearsal.hidden || current < 0) return;
    const plan = timing[current];
    document.getElementById('rh-speaker').textContent = plan.speaker ? speakers[plan.speaker - 1] : '';
    document.getElementById('rh-window').textContent = `${clock(plan.start)} → ${clock(plan.end)} · ${span(plan.duration)}`;
    const elapsed = (performance.now() - rehearsalStart) / 1000;
    const elapsedNode = document.getElementById('rh-elapsed');
    elapsedNode.textContent = `écoulé ${clock(elapsed)}`;
    elapsedNode.classList.toggle('late', elapsed > plan.end);
  }
  function toggleRehearsal() {
    const on = rehearsal.hidden;
    rehearsal.hidden = !on;
    rehearsalButton.setAttribute('aria-pressed', String(on));
    rehearsalButton.setAttribute('aria-label', on ? 'Masquer le minutage de répétition' : 'Afficher le minutage de répétition');
    clearInterval(rehearsalTimer);
    if (on) {
      rehearsalStart = performance.now();
      rehearsalTimer = setInterval(updateRehearsal, 500);
      updateRehearsal();
      announce('Minutage de répétition : chronomètre lancé. Aucune avance automatique.');
    }
  }
  function show(index, updateHash = true) {
    index = Math.max(0, Math.min(slides.length - 1, index));
    if (index === current) return;
    const old = slides[current];
    if (old) {
      old.classList.remove('is-active');
      old.classList.add('is-leaving');
      window.setTimeout(() => old.classList.remove('is-leaving'), 520);
    }
    current = index;
    slides.forEach((slide, i) => {
      const active = i === index;
      slide.setAttribute('aria-hidden', String(!active));
      slide.inert = !active;
      if (!active) slide.classList.remove('is-active');
      if (active) slide.classList.remove('is-leaving');
    });
    const slide = slides[index];
    slide.classList.add('is-active');
    stage.classList.toggle('on-dark', slide.matches('.dark'));
    previous.disabled = index === 0;
    next.disabled = index === slides.length - 1;
    counter.textContent = pageLabel(index);
    chapter.textContent = slide.dataset.chapter;
    progress.style.width = `${((index + 1) / slides.length) * 100}%`;
    document.title = `${slide.dataset.title} — ${deckTitle}`;
    document.querySelectorAll('.chapters button').forEach(button => {
      const active = button.textContent === slide.dataset.chapter;
      button.classList.toggle('current', active);
      if (active) button.setAttribute('aria-current', 'true');
      else button.removeAttribute('aria-current');
    });
    document.querySelectorAll('.overview-item').forEach((button, i) => button.setAttribute('aria-current', String(i === index)));
    updateRehearsal();
    if (updateHash) {
      try { history.replaceState(null, '', `#${index + 1}`); }
      catch { location.hash = String(index + 1); }
    }
  }
  function fromHash() {
    const value = /^#(\d+)$/.exec(location.hash);
    show(value ? Number(value[1]) - 1 : 0, false);
  }
  function openDialog(dialog) {
    if (dialog.open) return;
    dialog.showModal();
    dialog.querySelector('.close-dialog').focus();
    if (dialog === overview) {
      requestAnimationFrame(() => overview.querySelector('[aria-current="true"]')?.scrollIntoView({ block: 'nearest' }));
    }
  }
  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
      else announce('Utilisez le mode plein écran de votre navigateur.');
    } catch { announce('Utilisez le mode plein écran de votre navigateur.'); }
  }

  // Bas de page : école · matière · intervenants · enseignant, écrit une seule fois,
  // affiché dans la barre de contrôle à l’écran et dans chaque slide à l’impression.
  const deckInfo = [
    meta.school,
    meta.courseShort || meta.course,
    meta.speakersShort || speakers.join(', '),
    `Enseignant : ${meta.teacher || 'à compléter'}`
  ].filter(Boolean).join(' · ');
  document.getElementById('deck-info').textContent = deckInfo;

  slides.forEach((slide, index) => {
    slide.setAttribute('role', 'group');
    slide.setAttribute('aria-roledescription', 'diapositive');
    slide.setAttribute('aria-label', `${index + 1} sur ${slides.length} : ${slide.dataset.title}`);
    slide.querySelectorAll('.reveal').forEach((el, i) => el.style.setProperty('--delay', `${Math.min(80 + i * 60, 380)}ms`));
    const footer = document.createElement('footer');
    footer.className = 'slide-footer';
    footer.setAttribute('aria-hidden', 'true');
    const footerText = document.createElement('span');
    footerText.textContent = deckInfo;
    const footerPage = document.createElement('span');
    footerPage.textContent = pageLabel(index);
    footer.append(footerText, footerPage);
    slide.append(footer);

    const plan = timing[index];
    const button = document.createElement('button');
    button.className = 'overview-item';
    const number = document.createElement('span');
    number.textContent = String(index + 1).padStart(2, '0');
    const title = document.createElement('b');
    title.textContent = slide.dataset.title;
    const label = document.createElement('small');
    label.textContent = slide.dataset.chapter.toUpperCase();
    const time = document.createElement('em');
    time.textContent = `${plan.speaker ? speakers[plan.speaker - 1] : ''} · ${clock(plan.start)}–${clock(plan.end)}`;
    button.append(number, title, label, time);
    button.addEventListener('click', () => { overview.close(); show(index); });
    document.getElementById('overview-grid').append(button);
  });
  document.querySelectorAll('[data-go]').forEach(button => button.addEventListener('click', () => show(Number(button.dataset.go) - 1)));
  document.querySelectorAll('[data-next]').forEach(button => button.addEventListener('click', () => show(current + 1)));
  previous.addEventListener('click', () => show(current - 1));
  next.addEventListener('click', () => show(current + 1));
  document.getElementById('overview-button').addEventListener('click', () => openDialog(overview));
  document.getElementById('sources-button').addEventListener('click', () => openDialog(sources));
  document.getElementById('fullscreen-button').addEventListener('click', toggleFullscreen);
  rehearsalButton.addEventListener('click', toggleRehearsal);
  document.querySelectorAll('dialog').forEach(dialog => {
    dialog.querySelector('.close-dialog').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const box = dialog.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
    });
  });
  document.addEventListener('keydown', event => {
    if (overview.open || sources.open || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.target.matches('input, textarea, select, [contenteditable="true"]')) return;
    const key = event.key.toLowerCase();
    // Entrée / Espace gardent leur comportement natif sur les boutons et liens.
    if (key === ' ' && event.target.closest('button, a')) return;
    if (['arrowright', 'arrowdown', 'pagedown', ' '].includes(key)) { event.preventDefault(); show(current + 1); }
    else if (['arrowleft', 'arrowup', 'pageup'].includes(key)) { event.preventDefault(); show(current - 1); }
    else if (key === 'home') { event.preventDefault(); show(0); }
    else if (key === 'end') { event.preventDefault(); show(slides.length - 1); }
    else if (key === 's') { event.preventDefault(); openDialog(overview); }
    else if (key === 'f') { event.preventDefault(); toggleFullscreen(); }
    else if (key === 'r') { event.preventDefault(); toggleRehearsal(); }
  });
  stage.addEventListener('wheel', event => {
    if (overview.open || sources.open || event.ctrlKey) return;
    event.preventDefault();
    const now = performance.now();
    if (now - lastWheel < 900) return;
    const delta = (Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY) * (event.deltaMode === 1 ? 20 : 1);
    if (Math.sign(delta) !== Math.sign(wheelSum)) wheelSum = 0;
    wheelSum += delta;
    clearTimeout(wheelTimer);
    wheelTimer = setTimeout(() => { wheelSum = 0; }, 180);
    if (Math.abs(wheelSum) >= 80) { show(current + Math.sign(wheelSum)); wheelSum = 0; lastWheel = now; }
  }, { passive: false });
  stage.addEventListener('touchstart', event => {
    if (event.touches.length === 1 && !event.target.closest('button, a')) touchStart = { x: event.touches[0].clientX, y: event.touches[0].clientY };
    else touchStart = null;
  }, { passive: true });
  stage.addEventListener('touchend', event => {
    if (!touchStart || overview.open || sources.open) return;
    const dx = event.changedTouches[0].clientX - touchStart.x;
    const dy = event.changedTouches[0].clientY - touchStart.y;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) show(current + (dx < 0 ? 1 : -1));
    touchStart = null;
  }, { passive: true });
  window.addEventListener('resize', resize);
  window.addEventListener('hashchange', fromHash);
  document.addEventListener('fullscreenchange', () => {
    const on = Boolean(document.fullscreenElement);
    document.getElementById('fullscreen-button').setAttribute('aria-label', on ? 'Quitter le plein écran' : 'Activer le plein écran');
    resize();
  });
  resize();
  fromHash();
})();
