const $ = (id) => document.getElementById(id);
const normalize = (value) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('fr');
let presentations = [];
let category = '';
let loaded = false;

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
function card(item) {
  const article = element('article', 'card');
  const cover = element('div', 'cover');
  const fallback = () => cover.replaceChildren(element('span', 'cover-fallback', item.title.slice(0, 1)));
  cover.setAttribute('aria-hidden', 'true');
  if (item.cover) {
    const img = element('img');
    img.src = item.cover;
    img.alt = '';
    img.loading = 'lazy';
    img.decoding = 'async';
    img.addEventListener('error', fallback, {once: true});
    cover.append(img);
  } else fallback();
  const body = element('div', 'card-body');
  const meta = element('div', 'card-meta');
  meta.append(element('span', 'category', item.category));
  if (item.date) {
    const time = element('time', '', new Intl.DateTimeFormat('fr', {day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC'}).format(new Date(`${item.date}T00:00:00Z`)));
    time.dateTime = item.date;
    meta.append(time);
  }
  const title = element('h3');
  const link = element('a', '', item.title);
  link.href = item.url;
  title.append(link);
  const bottom = element('div', 'card-bottom');
  bottom.setAttribute('aria-hidden', 'true');
  bottom.append(element('span', '', 'Ouvrir la présentation'), element('span', 'card-arrow', '↗'));
  body.append(meta, title, element('p', '', item.description), bottom);
  article.append(cover, body);
  return article;
}
function render() {
  if (!loaded) return;
  const query = normalize($('search').value.trim());
  const items = presentations.filter((item) => (!category || item.category === category) && normalize(`${item.title} ${item.description} ${item.category}`).includes(query));
  $('grid').replaceChildren(...items.map(card));
  $('result-count').textContent = `${items.length} présentation${items.length === 1 ? '' : 's'} affichée${items.length === 1 ? '' : 's'} sur ${presentations.length}`;
  $('empty').hidden = items.length > 0;
  const filtered = presentations.length > 0;
  $('empty-title').textContent = filtered ? 'Aucune présentation à l’horizon.' : 'La collection commence ici.';
  $('empty-copy').textContent = filtered ? 'Essayez un autre mot ou explorez une autre catégorie.' : 'Vos prochaines histoires trouveront bientôt leur place.';
  $('reset').hidden = !filtered;
  for (const button of $('filters').children) button.setAttribute('aria-pressed', String(button.dataset.category === category));
}
$('search').addEventListener('input', render);
$('reset').addEventListener('click', () => {category = ''; $('search').value = ''; render(); $('search').focus();});
document.addEventListener('keydown', (event) => {
  if (event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
    event.preventDefault(); $('search').focus();
  }
});
async function init() {
  try {
    const response = await fetch('/catalog.json', {credentials: 'same-origin', cache: 'no-cache'});
    if (!response.ok) throw new Error('catalog');
    presentations = await response.json();
    if (!Array.isArray(presentations)) throw new Error('catalog');
    $('total').textContent = String(presentations.length);
    const categories = ['', ...[...new Set(presentations.map((item) => item.category))].sort((a, b) => a.localeCompare(b, 'fr'))];
    for (const name of categories) {
      const button = element('button', 'filter', name || 'Tout explorer');
      button.type = 'button';
      button.dataset.category = name;
      button.addEventListener('click', () => {category = name; render();});
      $('filters').append(button);
    }
    loaded = true;
    render();
  } catch {
    $('empty').hidden = false;
    $('empty-title').textContent = 'La collection est momentanément indisponible.';
    $('empty-copy').textContent = 'Rechargez la page pour réessayer.';
    $('search').disabled = true;
  } finally {
    $('loading').hidden = true;
    $('grid').setAttribute('aria-busy', 'false');
  }
}
init();
