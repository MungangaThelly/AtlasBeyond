(function () {
  if (!('serviceWorker' in navigator) || !location.protocol.startsWith('http')) return;
  const copy = {
    en: { message: 'A new Atlas Beyond release is ready.', action: 'Update now', later: 'Later' },
    fr: { message: 'Une nouvelle version d’Atlas Beyond est prête.', action: 'Mettre à jour', later: 'Plus tard' },
    sv: { message: 'En ny version av Atlas Beyond är klar.', action: 'Uppdatera nu', later: 'Senare' }
  };
  const banner = document.createElement('aside');
  banner.className = 'update-banner';
  banner.hidden = true;
  banner.setAttribute('role', 'status');
  banner.setAttribute('aria-live', 'polite');
  banner.innerHTML = '<span class="update-mark" aria-hidden="true">↻</span><p></p><button class="update-now" type="button"></button><button class="update-later" type="button"></button>';
  document.body.appendChild(banner);
  let registration = null;
  let refreshing = false;
  const language = () => copy[document.documentElement.lang] ? document.documentElement.lang : 'en';
  function translate() {
    const words = copy[language()];
    banner.querySelector('p').textContent = words.message;
    banner.querySelector('.update-now').textContent = words.action;
    banner.querySelector('.update-later').textContent = words.later;
  }
  function offer(candidate) {
    if (!candidate || !navigator.serviceWorker.controller) return;
    translate();
    banner.hidden = false;
    const install = document.querySelector('.install-app');
    if (install) install.hidden = true;
  }
  function observe(current) {
    registration = current;
    offer(current.waiting);
    current.addEventListener('updatefound', () => {
      const worker = current.installing;
      worker?.addEventListener('statechange', () => { if (worker.state === 'installed') offer(current.waiting || worker); });
    });
  }
  navigator.serviceWorker.getRegistration().then(current => { if (current) observe(current); });
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    refreshing = true;
    location.reload();
  });
  banner.querySelector('.update-now').addEventListener('click', () => {
    const worker = registration?.waiting;
    if (worker) worker.postMessage({ type: 'SKIP_WAITING' });
  });
  banner.querySelector('.update-later').addEventListener('click', () => {
    banner.hidden = true;
    const install = document.querySelector('.install-app');
    if (install && !document.documentElement.classList.contains('installed-app')) install.hidden = false;
  });
  document.addEventListener('change', event => { if (event.target.matches('select[id*="language"],#language')) requestAnimationFrame(translate); });
}());
