(function () {
  const keys = ['atlas-journal', 'atlas-patagonia-journal', 'atlas-east-africa-journal', 'atlas-central-asia-journal'];
  const read = (key, fallback = {}) => { try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); } catch { return fallback; } };
  const copy = {
    en: { discoveries: 'Discoveries connected', horizons: 'Horizons completed', compass: 'Golden Compass', share: 'Share final passport', shared: 'Final passport shared.', copied: 'Passport link copied.', failed: 'Copy this passport link:', be: 'The journey continues', bt: 'A finished atlas should open another question.', dk: 'Return tomorrow', d: 'Follow the Daily Clue', ak: 'Look across regions', a: 'Read the World Atlas', ck: 'Join other readers', c: 'Enter the Community' },
    fr: { discoveries: 'Découvertes reliées', horizons: 'Horizons accomplis', compass: 'Boussole d’or', share: 'Partager le passeport final', shared: 'Passeport final partagé.', copied: 'Lien du passeport copié.', failed: 'Copiez ce lien :', be: 'Le voyage continue', bt: 'Un atlas achevé doit ouvrir une nouvelle question.', dk: 'Revenez demain', d: 'Suivre l’indice du jour', ak: 'Regarder entre les régions', a: 'Lire l’Atlas mondial', ck: 'Rejoindre les autres lecteurs', c: 'Entrer dans la communauté' },
    sv: { discoveries: 'Sammanbundna upptäckter', horizons: 'Slutförda horisonter', compass: 'Gyllene kompassen', share: 'Dela slutpasset', shared: 'Slutpasset har delats.', copied: 'Passlänken har kopierats.', failed: 'Kopiera denna länk:', be: 'Resan fortsätter', bt: 'En färdig atlas ska öppna en ny fråga.', dk: 'Återvänd i morgon', d: 'Följ dagens spår', ak: 'Se mellan regionerna', a: 'Läs världsatlasen', ck: 'Möt andra läsare', c: 'Gå till gemenskapen' }
  };
  const ids = { discoveries: 'legacy-discoveries', horizons: 'legacy-horizons', compass: 'legacy-compass', share: 'share-final-label', be: 'beyond-eyebrow', bt: 'beyond-title', dk: 'path-daily-kicker', d: 'path-daily', ak: 'path-atlas-kicker', a: 'path-atlas', ck: 'path-community-kicker', c: 'path-community' };
  const language = () => document.querySelector('#synthesis-language')?.value || read('atlas-profile').language || 'en';
  const encode = value => { const bytes = new TextEncoder().encode(JSON.stringify(value)); let binary = ''; bytes.forEach(byte => binary += String.fromCharCode(byte)); return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
  function passportUrl() {
    const profile = read('atlas-profile'), daily = read('atlas-daily'), synthesis = read('atlas-synthesis');
    const url = new URL('passport.html', location.href);
    url.hash = `p=${encode({ v: 2, n: String(profile.name || 'Explorer').slice(0, 40), l: language(), d: keys.map(key => Math.min(3, read(key, []).length)), r: daily.seals || 0, s: true, c: synthesis.completedAt })}`;
    return url.href;
  }
  function render(celebrate = false) {
    const synthesis = read('atlas-synthesis'), complete = synthesis.complete === true, t = copy[language()] || copy.en;
    Object.entries(ids).forEach(([key, id]) => { const node = document.getElementById(id); if (node) node.textContent = t[key]; });
    document.querySelector('#beyond-paths').hidden = !complete;
    if (complete && celebrate) {
      const panel = document.querySelector('#synthesis-complete');
      panel.classList.add('ceremony-active');
      setTimeout(() => panel.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
    }
  }
  async function share() {
    const t = copy[language()] || copy.en, url = passportUrl(), profile = read('atlas-profile'), status = document.querySelector('#final-share-status');
    try {
      if (navigator.share) { await navigator.share({ title: `${profile.name || 'Explorer'} · Atlas Beyond`, text: 'World Reader · Golden Compass', url }); status.textContent = t.shared; }
      else { await navigator.clipboard.writeText(url); status.textContent = t.copied; }
    } catch (error) { if (error.name !== 'AbortError') status.textContent = `${t.failed} ${url}`; }
  }
  document.querySelector('#share-final-passport').addEventListener('click', share);
  document.querySelector('#synthesis-form').addEventListener('submit', () => setTimeout(() => render(read('atlas-synthesis').complete === true), 0));
  document.querySelector('#synthesis-language').addEventListener('change', () => setTimeout(render, 0));
  render();
}());
