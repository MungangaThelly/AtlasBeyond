const livingWorldCopy={
  en:{guide:"Ari · Expedition guide",messages:["Welcome to the south coast. Do not rush toward the answer—let the land present its evidence.","You identified an earlier ice margin. Now follow the water west; its channels tell a more violent story.","Two systems are connected. One final landscape will show where retreating ice meets the sea.","Your first expedition is complete. Open your journal whenever you want to retrace the evidence."],journal:"Open the journal",soundOn:"Disable ambient sound",soundOff:"Enable ambient sound",night:"Switch to night",day:"Switch to daylight",orientation:"Orientation",skip:"Skip orientation",next:"Next",finish:"Begin exploring",tour:[["This is your field map","Illuminated markers show where evidence is ready to investigate. Locked markers emerge as your understanding grows."],["Read before you travel","The clue panel gives context without revealing the answer. Coordinates anchor every investigation to the real Earth."],["Build your legacy","Your journal preserves discoveries and deductions. Your explorer profile tracks the knowledge you earn."]]},
  fr:{guide:"Ari · Guide d’expédition",messages:["Bienvenue sur la côte sud. Ne vous précipitez pas vers la réponse : laissez le paysage présenter ses indices.","Vous avez identifié une ancienne limite de glace. Suivez maintenant l’eau vers l’ouest ; ses chenaux racontent une histoire plus violente.","Deux systèmes sont reliés. Un dernier paysage montrera où la glace en retrait rencontre la mer.","Votre première expédition est terminée. Ouvrez votre carnet pour retracer les indices."],journal:"Ouvrir le carnet",soundOn:"Désactiver l’ambiance sonore",soundOff:"Activer l’ambiance sonore",night:"Passer à la nuit",day:"Revenir au jour",orientation:"Orientation",skip:"Ignorer l’orientation",next:"Suivant",finish:"Commencer l’exploration",tour:[["Voici votre carte de terrain","Les repères illuminés indiquent les indices disponibles. Les autres apparaissent avec votre compréhension."],["Lisez avant de voyager","Le panneau d’indice donne du contexte sans révéler la réponse. Les coordonnées relient chaque enquête à la Terre réelle."],["Construisez votre héritage","Votre carnet conserve découvertes et déductions. Votre profil suit les connaissances acquises."]]},
  sv:{guide:"Ari · Expeditionsguide",messages:["Välkommen till sydkusten. Skynda inte mot svaret—låt landskapet visa sina spår.","Du identifierade en tidigare iskant. Följ nu vattnet västerut; fårorna berättar en våldsammare historia.","Två system hör ihop. Ett sista landskap visar var den vikande isen möter havet.","Din första expedition är slutförd. Öppna journalen när du vill följa spåren igen."],journal:"Öppna journalen",soundOn:"Stäng av omgivningsljud",soundOff:"Slå på omgivningsljud",night:"Växla till natt",day:"Växla till dagsljus",orientation:"Orientering",skip:"Hoppa över orientering",next:"Nästa",finish:"Börja utforska",tour:[["Det här är din fältkarta","Upplysta markörer visar var spår kan undersökas. Låsta markörer framträder när din förståelse växer."],["Läs innan du reser","Ledtrådspanelen ger sammanhang utan att avslöja svaret. Koordinater förankrar varje undersökning i den verkliga världen."],["Bygg ditt arv","Journalen bevarar upptäckter och slutsatser. Din upptäckarprofil följer kunskapen du samlar."]]}
};

let worldStarted=false,tourIndex=0,audioContext,ambientGain,windSource;
const worldText=()=>livingWorldCopy[language]||livingWorldCopy.en;

function initializeLivingWorld(){
  const night=localStorage.getItem('atlas-atmosphere')==='night';
  document.documentElement.classList.toggle('night-mode',night);
  updateAtmosphereControls();
  $('#sound-toggle').addEventListener('click',toggleAmbientSound);
  $('#time-toggle').addEventListener('click',()=>{document.documentElement.classList.toggle('night-mode');localStorage.setItem('atlas-atmosphere',document.documentElement.classList.contains('night-mode')?'night':'day');updateAtmosphereControls()});
  $('#guide-close').addEventListener('click',()=>{$('#guide-panel').hidden=true;sessionStorage.setItem('atlas-guide-hidden','true')});
  $('#guide-action').addEventListener('click',()=>$('#journal-button').click());
  $('#tour-next').addEventListener('click',()=>{tourIndex+=1;if(tourIndex>=3)finishTour();else renderTour()});
  $('#tour-skip').addEventListener('click',finishTour);
  window.addEventListener('resize',()=>{if(!$('#tour-overlay').hidden)positionTour()});
}

function startLivingWorld(){
  worldStarted=true;
  updateLivingWorld();
  if(!localStorage.getItem('atlas-tour-complete'))setTimeout(startTour,900);
}

function updateLivingWorld(){
  const labels=worldText(),panel=$('#guide-panel'),index=Math.min(completed.length,3);
  $('#guide-name').textContent=labels.guide;$('#guide-message').textContent=labels.messages[index];
  const action=$('#guide-action');action.hidden=index<3;action.textContent=labels.journal;
  if(worldStarted&&sessionStorage.getItem('atlas-guide-hidden')!=='true')panel.hidden=false;
  updateAtmosphereControls();
  if(!$('#tour-overlay').hidden)renderTour();
}

function updateAtmosphereControls(){
  const labels=worldText(),night=document.documentElement.classList.contains('night-mode'),sound=ambientGain&&ambientGain.gain.value>0;
  $('#time-icon').textContent=night?'☾':'☼';$('#time-toggle').setAttribute('aria-pressed',String(night));$('#time-toggle').setAttribute('aria-label',night?labels.day:labels.night);
  $('#sound-toggle').setAttribute('aria-pressed',String(Boolean(sound)));$('#sound-toggle').setAttribute('aria-label',sound?labels.soundOn:labels.soundOff);
}

async function toggleAmbientSound(){
  if(!audioContext){
    const AudioEngine=window.AudioContext||window.webkitAudioContext;if(!AudioEngine)return;
    audioContext=new AudioEngine();ambientGain=audioContext.createGain();ambientGain.gain.value=0;ambientGain.connect(audioContext.destination);
    const buffer=audioContext.createBuffer(1,audioContext.sampleRate*3,audioContext.sampleRate),data=buffer.getChannelData(0);let last=0;
    for(let i=0;i<data.length;i++){last=last*.98+(Math.random()*2-1)*.02;data[i]=last*.35}
    windSource=audioContext.createBufferSource();windSource.buffer=buffer;windSource.loop=true;const filter=audioContext.createBiquadFilter();filter.type='lowpass';filter.frequency.value=720;windSource.connect(filter).connect(ambientGain);windSource.start();
  }
  if(audioContext.state==='suspended')await audioContext.resume();
  const on=ambientGain.gain.value>.001;ambientGain.gain.cancelScheduledValues(audioContext.currentTime);ambientGain.gain.linearRampToValueAtTime(on?0:.16,audioContext.currentTime+.45);setTimeout(updateAtmosphereControls,500);
}

const tourTargets=['.map','aside','#journal-button'];
function startTour(){tourIndex=0;$('#tour-overlay').hidden=false;renderTour()}
function renderTour(){const labels=worldText(),step=labels.tour[tourIndex];$('#tour-step').textContent=`${labels.orientation} ${tourIndex+1} / 3`;$('#tour-title').textContent=step[0];$('#tour-copy').textContent=step[1];$('#tour-skip').textContent=labels.skip;$('#tour-next').innerHTML=`${tourIndex===2?labels.finish:labels.next} <b>→</b>`;positionTour();$('#tour-next').focus()}
function positionTour(){const target=$(tourTargets[tourIndex]),focus=$('#tour-focus'),card=$('.tour-card');if(!target)return;const rect=target.getBoundingClientRect(),pad=8;focus.style.left=`${Math.max(0,rect.left-pad)}px`;focus.style.top=`${Math.max(0,rect.top-pad)}px`;focus.style.width=`${Math.min(innerWidth,rect.width+pad*2)}px`;focus.style.height=`${Math.min(innerHeight,rect.height+pad*2)}px`;const cardWidth=Math.min(400,innerWidth-32);card.style.left=`${Math.max(16,Math.min(innerWidth-cardWidth-16,rect.right-cardWidth))}px`;card.style.top=`${Math.max(16,Math.min(innerHeight-300,rect.top+40))}px`}
function finishTour(){localStorage.setItem('atlas-tour-complete','true');$('#tour-overlay').hidden=true;$('#expedition').focus?.()}
