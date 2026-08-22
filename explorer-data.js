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
  function validate(archive) {
    if (!archive || archive.product !== 'Atlas Beyond' || archive.version !== 1 || !archive.data || Array.isArray(archive.data) || typeof archive.data !== 'object') return false;
    const entries = Object.entries(archive.data);
    if (entries.length > 100 || entries.some(([key]) => !key.startsWith(prefix))) return false;
    try { return JSON.stringify(archive).length <= 1_000_000; } catch { return false; }
  }
  function restore(archive, storage = localStorage) {
    if (!validate(archive)) throw new TypeError('Invalid Atlas Beyond archive');
    clear(storage);
    for (const [key, value] of Object.entries(archive.data)) storage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
    return Object.keys(archive.data).length;
  }
  scope.AtlasExplorerData = { collect, clear, validate, restore };
  if (typeof document === 'undefined') return;

  const profile = document.getElementById('profile-dialog');
  if (!profile || profile.querySelector('.explorer-data-controls')) return;
  const copy = {
    en: { title: 'Your expedition data', detail: 'Download, restore, or erase Atlas Beyond data stored in this browser. Archives stay on your device.', download: 'Download my data', import: 'Restore from archive', erase: 'Erase my data', confirmTitle: 'Erase your Atlas data?', confirm: 'This removes your profile, journals, skills, settings, and community participation from this browser. This cannot be undone.', cancel: 'Keep my data', eraseNow: 'Erase permanently', restoreTitle: 'Replace your current Atlas data?', restore: 'Restoring this archive replaces Atlas Beyond data in this browser. Unrelated browser data is not affected.', restoreNow: 'Restore archive', invalid: 'That file is not a valid Atlas Beyond archive.' },
    fr: { title: 'Vos données d’expédition', detail: 'Téléchargez, restaurez ou effacez les données Atlas Beyond de ce navigateur. Les archives restent sur votre appareil.', download: 'Télécharger mes données', import: 'Restaurer une archive', erase: 'Effacer mes données', confirmTitle: 'Effacer vos données Atlas ?', confirm: 'Votre profil, vos carnets, compétences, réglages et participation communautaire seront supprimés de ce navigateur. Cette action est irréversible.', cancel: 'Conserver mes données', eraseNow: 'Effacer définitivement', restoreTitle: 'Remplacer vos données Atlas actuelles ?', restore: 'La restauration remplace les données Atlas Beyond de ce navigateur. Les autres données du navigateur ne sont pas affectées.', restoreNow: 'Restaurer l’archive', invalid: 'Ce fichier n’est pas une archive Atlas Beyond valide.' },
    sv: { title: 'Dina expeditionsdata', detail: 'Ladda ned, återställ eller radera Atlas Beyond-data i den här webbläsaren. Arkiv stannar på din enhet.', download: 'Ladda ned mina data', import: 'Återställ från arkiv', erase: 'Radera mina data', confirmTitle: 'Radera dina Atlas-data?', confirm: 'Din profil, journaler, färdigheter, inställningar och ditt deltagande tas bort från den här webbläsaren. Detta går inte att ångra.', cancel: 'Behåll mina data', eraseNow: 'Radera permanent', restoreTitle: 'Ersätta dina nuvarande Atlas-data?', restore: 'Återställningen ersätter Atlas Beyond-data i den här webbläsaren. Andra webbläsardata påverkas inte.', restoreNow: 'Återställ arkiv', invalid: 'Filen är inte ett giltigt Atlas Beyond-arkiv.' }
  };
  const controls = document.createElement('section');
  controls.className = 'explorer-data-controls';
  controls.innerHTML = '<h3 id="data-controls-title"></h3><p id="data-controls-copy"></p><div><button type="button" id="export-atlas-data"></button><button type="button" id="import-atlas-data"></button><button type="button" id="erase-atlas-data" class="danger"></button><input class="sr-only" id="atlas-data-file" type="file" accept="application/json,.json"><span id="data-controls-status" role="status" aria-live="polite"></span></div>';
  profile.appendChild(controls);
  const confirmDialog = document.createElement('dialog');
  confirmDialog.className = 'data-reset-dialog';
  confirmDialog.innerHTML = '<h2 id="data-reset-title"></h2><p id="data-reset-copy"></p><div><button type="button" id="cancel-data-reset"></button><button type="button" id="confirm-data-reset" class="danger"></button></div>';
  document.body.appendChild(confirmDialog);
  const restoreDialog = document.createElement('dialog');
  restoreDialog.className = 'data-reset-dialog';
  restoreDialog.innerHTML = '<h2 id="data-restore-title"></h2><p id="data-restore-copy"></p><div><button type="button" id="cancel-data-restore"></button><button type="button" id="confirm-data-restore"></button></div>';
  document.body.appendChild(restoreDialog);
  let pendingArchive = null;
  const $ = id => document.getElementById(id);
  const words = () => copy[document.documentElement.lang] || copy.en;
  function translate() {
    const text = words();
    $('data-controls-title').textContent = text.title;
    $('data-controls-copy').textContent = text.detail;
    $('export-atlas-data').textContent = text.download;
    $('import-atlas-data').textContent = text.import;
    $('erase-atlas-data').textContent = text.erase;
    $('data-reset-title').textContent = text.confirmTitle;
    $('data-reset-copy').textContent = text.confirm;
    $('cancel-data-reset').textContent = text.cancel;
    $('confirm-data-reset').textContent = text.eraseNow;
    $('data-restore-title').textContent = text.restoreTitle;
    $('data-restore-copy').textContent = text.restore;
    $('cancel-data-restore').textContent = text.cancel;
    $('confirm-data-restore').textContent = text.restoreNow;
  }
  $('export-atlas-data').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(collect(), null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `atlas-beyond-data-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 0);
  });
  $('import-atlas-data').addEventListener('click', () => $('atlas-data-file').click());
  $('atlas-data-file').addEventListener('change', async event => {
    const file = event.target.files[0];
    event.target.value = '';
    if (!file || file.size > 1_000_000) { $('data-controls-status').textContent = words().invalid; return; }
    try {
      const archive = JSON.parse(await file.text());
      if (!validate(archive)) throw new TypeError('Invalid archive');
      pendingArchive = archive;
      $('data-controls-status').textContent = '';
      translate();
      restoreDialog.showModal();
    } catch { pendingArchive = null; $('data-controls-status').textContent = words().invalid; }
  });
  $('erase-atlas-data').addEventListener('click', () => { translate(); confirmDialog.showModal(); });
  $('cancel-data-reset').addEventListener('click', () => confirmDialog.close());
  $('confirm-data-reset').addEventListener('click', () => { clear(); location.reload(); });
  $('cancel-data-restore').addEventListener('click', () => { pendingArchive = null; restoreDialog.close(); });
  $('confirm-data-restore').addEventListener('click', () => { if (pendingArchive) restore(pendingArchive); location.reload(); });
  document.getElementById('language')?.addEventListener('change', () => requestAnimationFrame(translate));
  translate();
}(typeof window === 'undefined' ? globalThis : window));
