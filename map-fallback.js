(function () {
  const maps = [
    { id: 'real-map', target: '#investigate' },
    { id: 'atlas-map', target: '#atlas-list button' },
    { id: 'region-map', target: '#region-investigate' }
  ];
  const copy = {
    en: { offline: 'The live map is offline.', unavailable: 'The live map could not be loaded.', detail: 'Your journal and evidence remain available.', action: 'Continue with clues' },
    fr: { offline: 'La carte en direct est hors ligne.', unavailable: 'La carte en direct n’a pas pu être chargée.', detail: 'Votre carnet et les indices restent disponibles.', action: 'Continuer avec les indices' },
    sv: { offline: 'Livekartan är offline.', unavailable: 'Livekartan kunde inte läsas in.', detail: 'Din journal och alla ledtrådar är fortfarande tillgängliga.', action: 'Fortsätt med ledtrådar' }
  };
  const language = () => copy[document.documentElement.lang] ? document.documentElement.lang : 'en';
  function attach(config) {
    const container = document.getElementById(config.id);
    if (!container) return;
    const fallback = document.createElement('div');
    fallback.className = 'map-unavailable';
    fallback.hidden = true;
    fallback.setAttribute('role', 'status');
    fallback.innerHTML = '<span aria-hidden="true">⌁</span><strong></strong><p></p><button type="button"></button>';
    container.appendChild(fallback);
    const ready = () => Boolean(container.querySelector('.maplibregl-canvas'));
    function render() {
      const words = copy[language()];
      fallback.querySelector('strong').textContent = navigator.onLine ? words.unavailable : words.offline;
      fallback.querySelector('p').textContent = words.detail;
      fallback.querySelector('button').textContent = words.action;
    }
    function show() { if (ready() && navigator.onLine) return; render(); fallback.hidden = false; container.classList.add('map-has-fallback'); }
    function reconcile() { if (ready()) { fallback.hidden = true; container.classList.remove('map-has-fallback'); } else show(); }
    fallback.querySelector('button').addEventListener('click', () => {
      const target = document.querySelector(config.target);
      target?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
      target?.focus({ preventScroll: true });
    });
    new MutationObserver(reconcile).observe(container, { childList: true });
    window.addEventListener('offline', show);
    window.addEventListener('online', reconcile);
    document.addEventListener('change', event => { if (event.target.matches('select[id*="language"],#language')) requestAnimationFrame(render); });
    if (!navigator.onLine || !window.maplibregl) show(); else setTimeout(reconcile, 7000);
  }
  maps.forEach(attach);
}());
