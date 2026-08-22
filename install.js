(function(){
let promptEvent=null;const copy={en:['Install Atlas Beyond','Atlas Beyond is ready on your device.'],fr:['Installer Atlas Beyond','Atlas Beyond est prêt sur votre appareil.'],sv:['Installera Atlas Beyond','Atlas Beyond är redo på din enhet.']};
const language=()=>{try{return JSON.parse(localStorage.getItem('atlas-profile')||'{}').language||localStorage.getItem('atlas-language')||'en'}catch{return'en'}};
const button=document.createElement('button');button.className='install-app';button.hidden=true;button.innerHTML='<span>↓</span><b></b>';document.body.appendChild(button);
function label(){button.querySelector('b').textContent=(copy[language()]||copy.en)[0]}label();
window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();promptEvent=event;button.hidden=false});
button.addEventListener('click',async()=>{if(!promptEvent)return;promptEvent.prompt();await promptEvent.userChoice;promptEvent=null;button.hidden=true});
window.addEventListener('appinstalled',()=>{button.hidden=true;const status=document.querySelector('.system-status');if(status){status.textContent=(copy[language()]||copy.en)[1];status.classList.add('visible')}});
if(window.matchMedia('(display-mode: standalone)').matches)document.documentElement.classList.add('installed-app');
}());
