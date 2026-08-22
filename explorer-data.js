(function (scope) {
  const prefix = 'atlas-';
  function collect(storage = localStorage) {
    const data = {};
    for (let index = 0; index < storage.length; index += 1) {
      const key = storage.key(index);
      if (key && key.startsWith(prefix)) {
        const value = storage.getItem(key);
        try { data[key] = JSON.parse(value); } catch { data[key] = value; }
      }
    }
    return { product: 'Atlas Beyond', version: 1, exportedAt: new Date().toISOString(), data };
  }
  function clear(storage = localStorage) {
    const keys = [];
    for (let index = 0; index < storage.length; index += 1) {
      const key = storage.key(index);
      if (key && key.startsWith(prefix)) keys.push(key);
    }
    keys.forEach(key => storage.removeItem(key));
    return keys.length;
  }
  scope.AtlasExplorerData = { collect, clear };
  if (typeof document === 'undefined') return;

  const profile = document.getElementById('profile-dialog');
  if (!profile || profile.querySelector('.explorer-data-controls')) return;
  const copy = {
    en: { title: 'Your expedition data', detail: 'Download a portable copy or erase Atlas Beyond data stored in this browser.', download: 'Download my data', erase: 'Erase my data', confirmTitle: 'Erase your Atlas data?', confirm: 'This removes your profile, journals, skills, settings, and community participation from this browser. This cannot be undone.', cancel: 'Keep my data', eraseNow: 'Erase permanently' },
    fr: { title: 'Vos données d’expédition', detail: 'Téléchargez une copie portable ou effacez les données Atlas Beyond stockées dans ce navigateur.', download: 'Télécharger mes données', erase: 'Effacer mes données', confirmTitle: 'Effacer vos données Atlas ?', confirm: 'Votre profil, vos carnets, compétences, réglages et participation communautaire seront supprimés de ce navigateur. Cette action est irréversible.', cancel: 'Conserver mes données', eraseNow: 'Effacer définitivement' },
    sv: { title: 'Dina expeditionsdata', detail: 'Ladda ned en portabel kopia eller radera Atlas Beyond-data som lagras i den här webbläsaren.', download: 'Ladda ned mina data', erase: 'Radera mina data', confirmTitle: 'Radera dina Atlas-data?', confirm: 'Din profil, journaler, färdigheter, inställningar och ditt deltagande tas bort från den här webbläsaren. Detta går inte att ångra.', cancel: 'Behåll mina data', eraseNow: 'Radera permanent' }
  };
  const controls = document.createElement('section');
  controls.className = 'explorer-data-controls';
  controls.innerHTML = '<h3 id="data-controls-title"></h3><p id="data-controls-copy"></p><div><button type="button" id="export-atlas-data"></button><button type="button" id="erase-atlas-data" class="danger"></button></div>';
  profile.appendChild(controls);
  const confirmDialog = document.createElement('dialog');
  confirmDialog.className = 'data-reset-dialog';
  confirmDialog.innerHTML = '<h2 id="data-reset-title"></h2><p id="data-reset-copy"></p><div><button type="button" id="cancel-data-reset"></button><button type="button" id="confirm-data-reset" class="danger"></button></div>';
  document.body.appendChild(confirmDialog);
  const $ = id => document.getElementById(id);
  const words = () => copy[document.documentElement.lang] || copy.en;
  function translate() {
    const text = words();
    $('data-controls-title').textContent = text.title;
    $('data-controls-copy').textContent = text.detail;
    $('export-atlas-data').textContent = text.download;
    $('erase-atlas-data').textContent = text.erase;
    $('data-reset-title').textContent = text.confirmTitle;
    $('data-reset-copy').textContent = text.confirm;
    $('cancel-data-reset').textContent = text.cancel;
    $('confirm-data-reset').textContent = text.eraseNow;
  }
  $('export-atlas-data').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(collect(), null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `atlas-beyond-data-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 0);
  });
  $('erase-atlas-data').addEventListener('click', () => { translate(); confirmDialog.showModal(); });
  $('cancel-data-reset').addEventListener('click', () => confirmDialog.close());
  $('confirm-data-reset').addEventListener('click', () => { clear(); location.reload(); });
  document.getElementById('language')?.addEventListener('change', () => requestAnimationFrame(translate));
  translate();
}(typeof window === 'undefined' ? globalThis : window));
