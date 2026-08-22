(function () {
  const community = window.AtlasCommunity;
  if (!community || document.querySelector('.community-consent')) return;
  const copy = {
    en: { eyebrow: 'Your privacy', title: 'Choose whether to join the shared totals', detail: 'Participation sends only a random device code and expedition completion counts. Your name, location, and journal never leave this device.', join: 'Join anonymous totals', leave: 'Stop sharing updates', joined: 'You are contributing anonymous completion counts.', private: 'Your progress stays only on this device.' },
    fr: { eyebrow: 'Votre vie privée', title: 'Choisissez de participer ou non aux totaux partagés', detail: 'La participation envoie uniquement un code aléatoire et les nombres d’expéditions terminées. Votre nom, position et carnet restent sur cet appareil.', join: 'Participer anonymement', leave: 'Arrêter les mises à jour', joined: 'Vous partagez des nombres de progression anonymes.', private: 'Votre progression reste uniquement sur cet appareil.' },
    sv: { eyebrow: 'Din integritet', title: 'Välj om du vill delta i den gemensamma statistiken', detail: 'Deltagande skickar endast en slumpmässig enhetskod och antal slutförda expeditioner. Ditt namn, din plats och journal lämnar aldrig enheten.', join: 'Delta anonymt', leave: 'Sluta dela uppdateringar', joined: 'Du delar anonyma slutförandesiffror.', private: 'Dina framsteg stannar endast på den här enheten.' }
  };
  const section = document.createElement('section');
  section.className = 'community-consent';
  section.setAttribute('aria-labelledby', 'participation-title');
  section.innerHTML = '<div><p class="eyebrow" id="participation-eyebrow"></p><h2 id="participation-title"></h2><p id="participation-copy"></p></div><button class="primary" id="participation-toggle" type="button"><span id="participation-label"></span></button><p id="participation-status" role="status" aria-live="polite"></p>';
  document.querySelector('.community-stats').before(section);
  const $ = id => document.getElementById(id);
  function render() {
    const words = copy[document.documentElement.lang] || copy.en;
    const active = community.participates();
    $('participation-eyebrow').textContent = words.eyebrow;
    $('participation-title').textContent = words.title;
    $('participation-copy').textContent = words.detail;
    $('participation-label').textContent = active ? words.leave : words.join;
    $('participation-toggle').setAttribute('aria-pressed', String(active));
    $('participation-status').textContent = active ? words.joined : words.private;
  }
  $('participation-toggle').addEventListener('click', async () => { await community.setParticipation(!community.participates()); render(); });
  document.getElementById('community-language').addEventListener('change', () => requestAnimationFrame(render));
  render();
}());
