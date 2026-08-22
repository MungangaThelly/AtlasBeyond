(function () {
  if (document.querySelector('.journey-footer')) return;

  const path = location.pathname.split('/').pop() || 'index.html';
  const expedition = new URLSearchParams(location.search).get('expedition');
  const profile = (() => {
    try { return JSON.parse(localStorage.getItem('atlas-profile') || '{}'); }
    catch { return {}; }
  })();
  const language = ['en', 'fr', 'sv'].includes(profile.language)
    ? profile.language
    : (localStorage.getItem('atlas-language') || 'en');

  const copy = {
    en: {
      menu: 'Explore', back: 'Back', previous: 'Previous', next: 'Next', journey: 'Continue exploring',
      routes: { 'index.html': 'Expeditions', 'atlas.html': 'World Atlas', 'community.html': 'Community', 'daily.html': 'Daily Clue', 'seals.html': 'Field Seals', 'synthesis.html': 'Beyond', region: 'Field Expedition' }
    },
    fr: {
      menu: 'Explorer', back: 'Retour', previous: 'Précédent', next: 'Suivant', journey: 'Continuer l’exploration',
      routes: { 'index.html': 'Expéditions', 'atlas.html': 'Atlas mondial', 'community.html': 'Communauté', 'daily.html': 'Indice du jour', 'seals.html': 'Sceaux de terrain', 'synthesis.html': 'Au-delà', region: 'Expédition' }
    },
    sv: {
      menu: 'Utforska', back: 'Tillbaka', previous: 'Föregående', next: 'Nästa', journey: 'Fortsätt utforska',
      routes: { 'index.html': 'Expeditioner', 'atlas.html': 'Världsatlas', 'community.html': 'Gemenskap', 'daily.html': 'Dagens spår', 'seals.html': 'Fältsigill', 'synthesis.html': 'Bortom', region: 'Fältexpedition' }
    }
  };
  const t = copy[language] || copy.en;
  const routes = ['index.html', 'atlas.html', 'community.html', 'daily.html', 'seals.html', 'synthesis.html'];
  const currentRoute = path === 'region-player.html' ? 'index.html' : path;
  const currentIndex = Math.max(0, routes.indexOf(currentRoute));
  const previous = routes[Math.max(0, currentIndex - 1)];
  const next = routes[Math.min(routes.length - 1, currentIndex + 1)];

  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href').split(/[?#]/)[0] || 'index.html';
    if (href === currentRoute && (link.classList.contains('atlas-nav') || link.closest('.region-global-nav'))) {
      link.setAttribute('aria-current', 'page');
    }
  });

  const header = document.querySelector('header');
  if (header && !header.querySelector('.journey-menu')) {
    if (header.querySelector('.atlas-nav, .region-global-nav')) header.classList.add('has-global-navigation');
    const menu = document.createElement('details');
    menu.className = 'journey-menu';
    menu.innerHTML = `<summary>${t.menu}<span aria-hidden="true">⌄</span></summary><nav aria-label="${t.menu}">${routes.map(route => `<a href="${route}"${route === currentRoute ? ' aria-current="page"' : ''}>${t.routes[route]}</a>`).join('')}</nav>`;
    header.appendChild(menu);
    menu.addEventListener('click', event => event.stopPropagation());
    document.addEventListener('click', () => menu.removeAttribute('open'));
  }

  const regionNames = {
    'patagonia-continents-end': 'Patagonia',
    'east-africa-migrations': 'East Africa',
    'central-asia-silk-roads': 'Central Asia'
  };
  const currentLabel = path === 'region-player.html'
    ? `${t.routes.region} · ${regionNames[expedition] || 'Iceland'}`
    : (t.routes[currentRoute] || document.title.split('·')[0].trim());

  const footer = document.createElement('nav');
  footer.className = 'journey-footer';
  footer.setAttribute('aria-label', t.journey);
  const previousDisabled = currentIndex === 0;
  const nextDisabled = currentIndex === routes.length - 1;
  footer.innerHTML = `<p>${t.journey}<strong>${currentLabel}</strong></p>
    ${previousDisabled ? `<span class="journey-card is-disabled" aria-disabled="true"><i>←</i><span><small>${t.previous}</small><b>${t.routes[previous]}</b></span></span>` : `<a class="journey-card" href="${previous}"><i>←</i><span><small>${t.previous}</small><b>${t.routes[previous]}</b></span></a>`}
    ${nextDisabled ? `<span class="journey-card is-disabled" aria-disabled="true"><span><small>${t.next}</small><b>${t.routes[next]}</b></span><i>→</i></span>` : `<a class="journey-card" href="${next}"><span><small>${t.next}</small><b>${t.routes[next]}</b></span><i>→</i></a>`}`;

  const main = document.querySelector('main');
  (main || document.body.lastElementChild).insertAdjacentElement('afterend', footer);
}());
