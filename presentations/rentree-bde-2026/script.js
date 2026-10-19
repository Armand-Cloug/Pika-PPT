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
  const deckTitle = 'BDE ENSAR';
  let current = -1;
  let wheelSum = 0;
  let wheelTimer;
  let lastWheel = 0;
  let touchStart = null;
  let statusTimer;

  function pageLabel(index) {
    return `${String(index + 1).padStart(2, '0')} / ${slides.length}`;
  }
  function resize() {
    stage.style.setProperty('--scale', Math.min(window.innerWidth / 1600, window.innerHeight / 900));
  }
  function announce(message) {
    const status = document.getElementById('status-message');
    status.textContent = message;
    status.classList.add('visible');
    clearTimeout(statusTimer);
    statusTimer = setTimeout(() => status.classList.remove('visible'), 3500);
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

  // Bas de page : une seule source (attributs data-* de #stage), affichée dans la
  // barre de contrôle à l'écran et dans chaque slide à l'impression.
  const info = stage.dataset;
  const deckInfo = [info.school, info.course, info.students, info.teacher && `Enseignant : ${info.teacher}`].filter(Boolean).join(' · ');
  document.getElementById('deck-info').textContent = deckInfo;

  slides.forEach((slide, index) => {
    slide.setAttribute('role', 'group');
    slide.setAttribute('aria-roledescription', 'diapositive');
    slide.setAttribute('aria-label', `${index + 1} sur ${slides.length} : ${slide.dataset.title}`);
    slide.querySelectorAll('.reveal').forEach((el, i) => el.style.setProperty('--delay', `${Math.min(90 + i * 70, 420)}ms`));
    const footer = document.createElement('footer');
    footer.className = 'slide-footer';
    footer.setAttribute('aria-hidden', 'true');
    const footerText = document.createElement('span');
    footerText.textContent = deckInfo;
    const footerPage = document.createElement('span');
    footerPage.textContent = pageLabel(index);
    footer.append(footerText, footerPage);
    slide.append(footer);
    const button = document.createElement('button');
    button.className = 'overview-item';
    const number = document.createElement('span');
    number.textContent = String(index + 1).padStart(2, '0');
    const title = document.createElement('b');
    title.textContent = slide.dataset.title;
    const label = document.createElement('small');
    label.textContent = slide.dataset.chapter.toUpperCase();
    button.append(number, title, label);
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
    // Native Enter/Space behavior on buttons remains available for keyboard users.
    if (key === ' ' && event.target.closest('button, a')) return;
    if (['arrowright', 'arrowdown', 'pagedown', ' '].includes(key)) { event.preventDefault(); show(current + 1); }
    else if (['arrowleft', 'arrowup', 'pageup'].includes(key)) { event.preventDefault(); show(current - 1); }
    else if (key === 'home') { event.preventDefault(); show(0); }
    else if (key === 'end') { event.preventDefault(); show(slides.length - 1); }
    else if (key === 's') { event.preventDefault(); openDialog(overview); }
    else if (key === 'f') { event.preventDefault(); toggleFullscreen(); }
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
