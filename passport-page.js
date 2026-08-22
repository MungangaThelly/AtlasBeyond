(function () {
  const copy = {
    en: { rank: 'Explorer passport', worldReader: 'World Reader', subtitle: 'A record of curiosity across the living Earth.', finalSubtitle: 'Four horizons connected by one evidence-led journey.', discoveries: 'Discoveries', expeditions: 'Expeditions', regions: 'Regions visited', seals: 'Rare seals', home: 'Begin your own journey →', locked: 'Not yet earned', compass: 'Golden Compass', completed: 'Grand Synthesis completed' },
    fr: { rank: 'Passeport d’exploration', worldReader: 'Lecteur du monde', subtitle: 'Une trace de curiosité à travers la Terre vivante.', finalSubtitle: 'Quatre horizons reliés par un voyage guidé par les preuves.', discoveries: 'Découvertes', expeditions: 'Expéditions', regions: 'Régions visitées', seals: 'Sceaux rares', home: 'Commencez votre voyage →', locked: 'Pas encore obtenu', compass: 'Boussole d’or', completed: 'Grande Synthèse accomplie' },
    sv: { rank: 'Upptäckarpass', worldReader: 'Världsläsare', subtitle: 'Ett minne av nyfikenhet över den levande jorden.', finalSubtitle: 'Fyra horisonter förenade av en evidensledd resa.', discoveries: 'Upptäckter', expeditions: 'Expeditioner', regions: 'Besökta regioner', seals: 'Sällsynta sigill', home: 'Börja din egen resa →', locked: 'Inte intjänad', compass: 'Gyllene kompassen', completed: 'Den stora syntesen slutförd' }
  };
  const names = ['Iceland', 'Patagonia', 'East Africa', 'Central Asia'];
  function decode(value) { const base = value.replace(/-/g, '+').replace(/_/g, '/'); const binary = atob(base); const bytes = Uint8Array.from(binary, char => char.charCodeAt(0)); return JSON.parse(new TextDecoder().decode(bytes)); }
  try {
    const token = new URLSearchParams(location.hash.slice(1)).get('p'), data = decode(token || '');
    if (![1, 2].includes(data.v) || typeof data.n !== 'string' || !['en', 'fr', 'sv'].includes(data.l) || !Array.isArray(data.d) || (data.d.length !== 3 && data.d.length !== 4)) throw new Error('Invalid');
    while (data.d.length < 4) data.d.push(0);
    data.d = data.d.map(value => Math.max(0, Math.min(3, Number(value) || 0)));
    const t = copy[data.l], earned = data.d.filter(value => value >= 3).length, discoveries = data.d.reduce((sum, value) => sum + value, 0), final = data.s === true && earned === 4;
    document.documentElement.lang = data.l;
    document.title = `${data.n.slice(0, 40)} · Atlas Beyond`;
    document.querySelector('#public-rank').textContent = final ? t.worldReader : t.rank;
    document.querySelector('#public-name').textContent = data.n.slice(0, 40) || 'Explorer';
    document.querySelector('#public-initial').textContent = final ? '✦' : (data.n.trim()[0] || 'E').toUpperCase();
    document.querySelector('#public-subtitle').textContent = final ? t.finalSubtitle : t.subtitle;
    document.querySelector('#public-discoveries').textContent = discoveries;
    document.querySelector('#public-expeditions').textContent = earned;
    document.querySelector('#public-regions').textContent = data.d.filter(Boolean).length;
    document.querySelector('#public-discoveries-label').textContent = t.discoveries;
    document.querySelector('#public-expeditions-label').textContent = t.expeditions;
    document.querySelector('#public-regions-label').textContent = t.regions;
    document.querySelector('#public-home').textContent = t.home;
    document.querySelector('#public-stamps').innerHTML = names.map((name, index) => `<article class="passport-stamp ${data.d[index] >= 3 ? 'earned' : ''}"><b>${name}</b><small>${data.d[index] >= 3 ? `Expedition ${String(index + 1).padStart(3, '0')}` : t.locked}</small></article>`).join('');
    if (final) {
      const legacy = document.createElement('section');
      legacy.className = 'public-final-legacy';
      legacy.innerHTML = `<span>✦</span><div><small>${t.completed}</small><b>${t.compass}</b></div>${data.r ? `<em>${Number(data.r) || 0} ${t.seals}</em>` : ''}`;
      document.querySelector('#public-stamps').insertAdjacentElement('afterend', legacy);
      document.querySelector('#public-passport').classList.add('is-world-reader');
    }
    document.querySelector('#passport-content').hidden = false;
  } catch { document.querySelector('#passport-invalid').hidden = false; }
}());
