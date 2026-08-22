(function () {
  if (!document.querySelector('link[href^="page-navigation.css"]')) { const style = document.createElement('link'); style.rel = 'stylesheet'; style.href = 'page-navigation.css?v=1.0.0'; document.head.appendChild(style); }
  if (!document.querySelector('script[src^="page-navigation.js"]')) { const script = document.createElement('script'); script.src = 'page-navigation.js?v=1.0.0'; document.body.appendChild(script); }
  const announce = document.createElement('div');
  announce.className = 'system-status';
  announce.setAttribute('role', 'status');
  announce.setAttribute('aria-live', 'polite');
  document.body.appendChild(announce);

  function show(message) {
    announce.textContent = message;
    announce.classList.add('visible');
    window.clearTimeout(show.timer);
    show.timer = window.setTimeout(() => announce.classList.remove('visible'), 5000);
  }

  window.addEventListener('offline', () => show('You are offline. Saved journal entries remain available.'));
  window.addEventListener('online', () => show('Connection restored.'));
  if (!navigator.onLine) show('Offline mode: using the saved Atlas Beyond experience.');

  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    const openDialog = document.querySelector('dialog[open]');
    if (openDialog) openDialog.close();
  });

  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      // The experience remains fully usable online when caching is unavailable.
    });
  }
}());
