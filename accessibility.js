(function () {
  const copy = {
    en: { skip: 'Skip to main content', language: 'Language', dialog: 'Dialog' },
    fr: { skip: 'Aller au contenu principal', language: 'Langue', dialog: 'Fenêtre de dialogue' },
    sv: { skip: 'Hoppa till huvudinnehållet', language: 'Språk', dialog: 'Dialogruta' }
  };
  const locale = () => copy[document.documentElement.lang] ? document.documentElement.lang : 'en';
  const main = document.querySelector('main');
  if (main) {
    if (!main.id) main.id = 'main-content';
    if (!document.querySelector('.skip-link')) {
      const skip = document.createElement('a');
      skip.className = 'skip-link';
      skip.href = `#${main.id}`;
      skip.textContent = copy[locale()].skip;
      document.body.prepend(skip);
    }
  }

  function nameControls() {
    const words = copy[locale()];
    document.querySelectorAll('select').forEach(select => {
      if (!select.getAttribute('aria-label') && !select.getAttribute('aria-labelledby')) select.setAttribute('aria-label', words.language);
    });
    document.querySelectorAll('dialog').forEach((dialog, index) => {
      dialog.setAttribute('aria-modal', 'true');
      if (dialog.getAttribute('aria-label') || dialog.getAttribute('aria-labelledby')) return;
      const heading = dialog.querySelector('h1,h2,h3,[role="heading"]');
      if (heading) {
        if (!heading.id) heading.id = `dialog-title-${index + 1}`;
        dialog.setAttribute('aria-labelledby', heading.id);
      } else dialog.setAttribute('aria-label', words.dialog);
    });
  }

  let opener = null;
  document.addEventListener('click', event => {
    const trigger = event.target.closest('button,a,[role="button"]');
    if (trigger && !trigger.closest('dialog')) opener = trigger;
  }, true);
  document.querySelectorAll('dialog').forEach(dialog => dialog.addEventListener('close', () => {
    if (opener && document.contains(opener)) opener.focus({ preventScroll: true });
  }));
  nameControls();
  new MutationObserver(nameControls).observe(document.body, { childList: true, subtree: true });
}());
