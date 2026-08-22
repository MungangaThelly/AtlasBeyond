(function () {
  const packages = window.AtlasCanonicalContent || {};
  const sourceUrl = (content, discovery) => content.sources.find(source => source.id === discovery.claims[0]?.sourceIds[0])?.url || '#';
  window.AtlasApplyIcelandContent = ({ places, copy }) => {
    const content = packages['iceland-fire-ice'];
    if (!content || content.legacyStorageKey !== 'atlas-journal') return;
    places.splice(0, places.length, ...content.discoveries.filter(item => item.kind === 'investigation').map(item => ({ id: item.id, name: item.locales.en.place, coordinates: item.coordinates, source: sourceUrl(content, item) })));
    for (const locale of ['en', 'fr', 'sv']) {
      copy[locale].eyebrow = content.locales[locale].eyebrow;
      copy[locale].title = content.locales[locale].title;
      copy[locale].intro = content.locales[locale].intro;
    }
    document.documentElement.dataset.contentSource = 'canonical-json';
  };
  window.AtlasApplyRegionalContent = regions => {
    for (const [id, content] of Object.entries(packages)) {
      if (id === 'iceland-fire-ice' || !regions[id]) continue;
      const runtime = regions[id];
      runtime.center = content.region.center; runtime.zoom = content.region.zoom; runtime.storageKey = content.legacyStorageKey;
      for (const locale of ['en', 'fr', 'sv']) {
        const existing = runtime.locales[locale];
        existing.eyebrow = content.locales[locale].eyebrow; existing.title = content.locales[locale].title; existing.intro = content.locales[locale].intro;
        existing.discoveries = content.discoveries.filter(item => item.kind === 'investigation').map(item => { const local = item.locales[locale]; return { place: local.place, coordinates: item.coordinates, clue: local.clue, field: local.fieldNote, evidence: local.evidence.map(card => [card.label, card.text]), question: local.question, options: local.options, correct: local.correct, reveal: local.reveal, source: sourceUrl(content, item) }; });
      }
    }
    document.documentElement.dataset.contentSource = 'canonical-json';
  };
}());
