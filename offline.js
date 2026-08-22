(function () {
  const copy = {
    en: { eyebrow: 'Beyond the signal', title: 'Keep your place.', detail: 'Your journal is safe on this device. Reconnect to load a place that has not been saved yet.', offline: 'You are offline. Saved expeditions remain available.', online: 'Connection restored. You can continue exploring.', checking: 'Checking the connection…', unavailable: 'The atlas is still beyond the signal.', retry: 'Try again', cached: 'Open the saved expedition hub' },
    fr: { eyebrow: 'Au-delà du signal', title: 'Gardez votre place.', detail: 'Votre carnet est en sécurité sur cet appareil. Reconnectez-vous pour charger un lieu qui n’a pas encore été enregistré.', offline: 'Vous êtes hors ligne. Les expéditions enregistrées restent disponibles.', online: 'Connexion rétablie. Vous pouvez poursuivre l’exploration.', checking: 'Vérification de la connexion…', unavailable: 'L’atlas est toujours hors de portée.', retry: 'Réessayer', cached: 'Ouvrir le centre d’expéditions enregistré' },
    sv: { eyebrow: 'Bortom signalen', title: 'Behåll din plats.', detail: 'Din journal är säker på den här enheten. Anslut igen för att läsa in en plats som ännu inte har sparats.', offline: 'Du är offline. Sparade expeditioner är fortfarande tillgängliga.', online: 'Anslutningen är tillbaka. Du kan fortsätta utforska.', checking: 'Kontrollerar anslutningen…', unavailable: 'Atlasen är fortfarande utom räckhåll.', retry: 'Försök igen', cached: 'Öppna det sparade expeditionsnavet' }
  };
  const $ = id => document.getElementById(id);
  let language = localStorage.getItem('atlas-language') || 'en';
  if (!copy[language]) language = 'en';
  const words = () => copy[language];
  function status() { $('offline-status').textContent = navigator.onLine ? words().online : words().offline; }
  function render() { const text = words(); document.documentElement.lang = language; $('offline-language').value = language; $('offline-eyebrow').textContent = text.eyebrow; $('offline-title').textContent = text.title; $('offline-copy').textContent = text.detail; $('retry-connection').textContent = text.retry; $('return-cached').textContent = text.cached; status(); }
  $('offline-language').addEventListener('change', event => { language = event.target.value; localStorage.setItem('atlas-language', language); render(); });
  $('retry-connection').addEventListener('click', async () => { $('offline-status').textContent = words().checking; try { const response = await fetch('./index.html?connection-check=1', { cache: 'no-store' }); if (!response.ok) throw new Error('Unavailable'); location.href = 'index.html'; } catch { $('offline-status').textContent = words().unavailable; } });
  window.addEventListener('online', status); window.addEventListener('offline', status); render();
}());
