(function(){
  const complete=document.querySelector('#synthesis-complete');if(!complete)return;
  const copy={
    en:{eyebrow:'Your explorer portrait',title:'A journey shaped by attention',intro:'Your atlas is not a score. It is a record of where curiosity led you and what you learned to notice.',discoveries:'Discoveries connected',horizons:'Horizons completed',seals:'Seals earned',paths:'Knowledge paths',done:'complete',regions:['Iceland','Patagonia','East Africa','Central Asia']},
    fr:{eyebrow:'Votre portrait d’exploration',title:'Un voyage façonné par l’attention',intro:'Votre atlas n’est pas un score. Il raconte où votre curiosité vous a conduit et ce que vous avez appris à observer.',discoveries:'Découvertes reliées',horizons:'Horizons accomplis',seals:'Sceaux acquis',paths:'Chemins de connaissance',done:'terminée',regions:['Islande','Patagonie','Afrique de l’Est','Asie centrale']},
    sv:{eyebrow:'Ditt upptäckarporträtt',title:'En resa formad av uppmärksamhet',intro:'Din atlas är inte ett resultat. Den visar vart nyfikenheten ledde dig och vad du lärde dig att se.',discoveries:'Sammanbundna upptäckter',horizons:'Slutförda horisonter',seals:'Intjänade sigill',paths:'Kunskapsvägar',done:'klar',regions:['Island','Patagonien','Östafrika','Centralasien']}
  };
  const coreKeys=['atlas-journal','atlas-patagonia-journal','atlas-east-africa-journal','atlas-central-asia-journal'];
  const read=(key,fallback=[])=>{try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback))}catch{return fallback}};
  const panel=document.createElement('section');panel.className='journey-portrait';panel.innerHTML='<p class="eyebrow"></p><h3></h3><p class="portrait-intro"></p><div class="portrait-paths"></div><div class="portrait-regions"></div>';
  complete.querySelector('.endgame-actions').before(panel);
  function language(){return document.querySelector('#synthesis-language')?.value||'en'}
  function snapshot(){
    const points={},regionCounts=[],packs=Object.values(window.AtlasCanonicalContent||{}).sort((a,b)=>a.sequence-b.sequence);
    packs.forEach(pack=>{
      const completed=read(pack.legacyStorageKey),required=pack.discoveries.filter(item=>item.kind==='investigation').slice(0,completed.length);
      const optionalKey=pack.legacyStorageKey==='atlas-journal'?'atlas-side-notes':`${pack.legacyStorageKey}-field-notes`,optionalIds=read(optionalKey),optional=pack.discoveries.filter(item=>optionalIds.includes(item.id));
      [...required,...optional].forEach(item=>{const reward=item.knowledgeReward;if(reward)points[reward.path]=(points[reward.path]||0)+reward.points});regionCounts.push(required.length+optional.length);
    });
    return{points,regionCounts,total:regionCounts.reduce((sum,n)=>sum+n,0),horizons:coreKeys.filter(key=>read(key).length>=3).length,seals:Math.min(8,read('atlas-daily',{}).seals||0)+1};
  }
  function render(){
    const lang=language(),t=copy[lang]||copy.en,s=snapshot(),pathEntries=Object.entries(s.points).sort((a,b)=>b[1]-a[1]);
    const stats=complete.querySelectorAll('.legacy-record>div');if(stats[0]){stats[0].querySelector('b').textContent=s.total;stats[0].querySelector('small').textContent=t.discoveries}if(stats[1]){stats[1].querySelector('b').textContent=s.horizons;stats[1].querySelector('small').textContent=t.horizons}if(stats[2]){stats[2].querySelector('b').textContent=s.seals;stats[2].querySelector('small').textContent=t.seals}
    panel.querySelector('.eyebrow').textContent=t.eyebrow;panel.querySelector('h3').textContent=t.title;panel.querySelector('.portrait-intro').textContent=t.intro;
    panel.querySelector('.portrait-paths').innerHTML=`<small>${t.paths}</small>${pathEntries.map(([path,value])=>`<span><b>${path}</b><i style="--value:${Math.min(100,value*20)}%"></i><em>${value}</em></span>`).join('')}`;
    panel.querySelector('.portrait-regions').innerHTML=s.regionCounts.map((count,index)=>`<article><small>${String(index+1).padStart(2,'0')}</small><b>${t.regions[index]}</b><span>${count} · ${t.done}</span></article>`).join('');
  }
  document.querySelector('#synthesis-language')?.addEventListener('change',()=>setTimeout(render));document.querySelector('#synthesis-form')?.addEventListener('submit',()=>setTimeout(render));render();
})();
