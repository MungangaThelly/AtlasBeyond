(function(){
  const id=new URLSearchParams(location.search).get('expedition')||'patagonia-continents-end';
  const pack=window.AtlasCanonicalContent?.[id];
  const notes=pack?.discoveries?.filter(item=>item.kind==='field-note')||[];
  if(!pack||!notes.length)return;
  const storageKey=`${pack.legacyStorageKey}-field-notes`;
  const copy={
    en:{eyebrow:'Optional discoveries',title:'Look beyond the route.',intro:'Follow your curiosity. Each field note adds knowledge to your explorer journal.',saved:'Recorded',locked:'Requires',open:'Open field note',record:'Record discovery',source:'View verified source',journal:'Optional field notes'},
    fr:{eyebrow:'Découvertes facultatives',title:'Regardez au-delà de la route.',intro:'Suivez votre curiosité. Chaque note enrichit votre journal d’exploration.',saved:'Consignée',locked:'Requiert',open:'Ouvrir la note',record:'Consigner la découverte',source:'Voir la source vérifiée',journal:'Notes facultatives'},
    sv:{eyebrow:'Valfria upptäckter',title:'Se bortom rutten.',intro:'Följ din nyfikenhet. Varje fältanteckning bygger kunskap i din journal.',saved:'Dokumenterad',locked:'Kräver',open:'Öppna fältanteckning',record:'Dokumentera upptäckt',source:'Visa verifierad källa',journal:'Valfria fältanteckningar'}
  };
  const read=(key)=>{try{return JSON.parse(localStorage.getItem(key)||'[]')}catch{return[]}};
  const language=()=>['en','fr','sv'].includes(document.documentElement.lang)?document.documentElement.lang:'en';
  const saved=()=>read(storageKey);
  function points(){
    const totals={};
    Object.values(window.AtlasCanonicalContent||{}).forEach(content=>{
      const required=content.discoveries.filter(item=>item.kind==='investigation');
      const completed=read(content.legacyStorageKey).length;
      required.slice(0,completed).forEach(add);
      const optionalKey=content.id==='iceland-elements-in-motion'?'atlas-side-notes':`${content.legacyStorageKey}-field-notes`;
      const ids=read(optionalKey);
      content.discoveries.filter(item=>ids.includes(item.id)).forEach(add);
    });
    return totals;
    function add(item){const reward=item.knowledgeReward;if(reward)totals[reward.path]=(totals[reward.path]||0)+reward.points}
  }
  function sourceFor(note){const sourceId=note.claims?.[0]?.sourceIds?.[0];return pack.sources.find(source=>source.id===sourceId)}
  function coordinates(note){const [lng,lat]=note.coordinates;return `${Math.abs(lat).toFixed(2)}° ${lat<0?'S':'N'} · ${Math.abs(lng).toFixed(2)}° ${lng<0?'W':'E'}`}
  const section=document.createElement('section');section.className='regional-field-notes';
  document.querySelector('.region-explorer').after(section);
  const dialog=document.createElement('dialog');dialog.className='regional-note-dialog';dialog.innerHTML='<button class="regional-note-close" aria-label="Close">×</button><p class="eyebrow"></p><h2></h2><p class="regional-note-reveal"></p><code></code><a class="source-link" target="_blank" rel="noopener"></a><button class="primary regional-note-save"></button>';
  document.body.append(dialog);dialog.querySelector('.regional-note-close').onclick=()=>dialog.close();
  function render(){
    const lang=language(),t=copy[lang],done=saved(),skill=points();
    section.innerHTML=`<header><div><p class="eyebrow">${t.eyebrow}</p><h2>${t.title}</h2><p>${t.intro}</p></div><strong>${done.length} / ${notes.length}</strong></header><div class="regional-note-grid"></div>`;
    const grid=section.querySelector('.regional-note-grid');
    notes.forEach((note,index)=>{
      const text=note.locales[lang]||note.locales.en,reward=note.knowledgeReward,isDone=done.includes(note.id),unlocked=isDone||(skill[reward.path]||0)>=reward.unlockLevel;
      const button=document.createElement('button');button.className=`regional-note-card${isDone?' is-saved':''}`;button.disabled=!unlocked;
      button.innerHTML=`<span><small>${String(index+1).padStart(2,'0')} · ${reward.path}</small><b>${text.place}</b></span><em>${isDone?t.saved:unlocked?'→':`${t.locked} ${reward.path} ${reward.unlockLevel}`}</em>`;
      button.setAttribute('aria-label',unlocked?`${t.open}: ${text.place}`:`${text.place}: ${t.locked} ${reward.path} ${reward.unlockLevel}`);
      if(unlocked)button.onclick=()=>open(note);grid.append(button);
    });
    appendJournal();
  }
  function open(note){
    const lang=language(),t=copy[lang],text=note.locales[lang]||note.locales.en,source=sourceFor(note);
    dialog.dataset.note=note.id;dialog.querySelector('.eyebrow').textContent=`${note.knowledgeReward.path} · +${note.knowledgeReward.points}`;dialog.querySelector('h2').textContent=text.clue;dialog.querySelector('.regional-note-reveal').textContent=text.reveal;dialog.querySelector('code').textContent=coordinates(note);
    const link=dialog.querySelector('a');link.textContent=t.source;link.href=source?.url||'#';dialog.querySelector('.regional-note-save').textContent=saved().includes(note.id)?t.saved:t.record;dialog.querySelector('.regional-note-save').disabled=saved().includes(note.id);dialog.showModal();
  }
  dialog.querySelector('.regional-note-save').onclick=()=>{const values=saved(),note=dialog.dataset.note;if(!values.includes(note))values.push(note);localStorage.setItem(storageKey,JSON.stringify(values));dialog.close();render()};
  function appendJournal(){
    const container=document.querySelector('#region-entries');if(!container)return;container.querySelectorAll('.regional-journal-entry,.regional-journal-heading').forEach(node=>node.remove());
    const values=saved();if(!values.length)return;const lang=language(),heading=document.createElement('p');heading.className='eyebrow regional-journal-heading';heading.textContent=copy[lang].journal;container.append(heading);
    notes.filter(note=>values.includes(note.id)).forEach(note=>{const text=note.locales[lang]||note.locales.en,article=document.createElement('article');article.className='entry regional-journal-entry';article.innerHTML=`<b>${text.place}</b><small>${text.reveal}</small>`;container.append(article)});
  }
  document.querySelector('#region-journal-button')?.addEventListener('click',()=>setTimeout(appendJournal));
  document.querySelector('#region-language')?.addEventListener('change',()=>requestAnimationFrame(render));
  window.addEventListener('storage',render);render();
})();
