(function(){
  const config=window.ATLAS_COMMUNITY;
  if(!config)return;
  const read=key=>{try{return JSON.parse(localStorage.getItem(key)||'[]').length}catch{return 0}};
  const device=()=>{let id=localStorage.getItem('atlas-community-id');if(!id){id=crypto.randomUUID();localStorage.setItem('atlas-community-id',id)}return id};
  async function rpc(name,body={}){const response=await fetch(`${config.url}/rest/v1/rpc/${name}`,{method:'POST',headers:{apikey:config.key,Authorization:`Bearer ${config.key}`,'Content-Type':'application/json'},body:JSON.stringify(body)});if(!response.ok)throw new Error(`Community service returned ${response.status}`);return response.status===204?null:response.json()}
  async function sync(){try{return await rpc('sync_explorer',{p_device:device(),p_iceland:Math.min(3,read('atlas-journal')),p_patagonia:Math.min(3,read('atlas-patagonia-journal')),p_east_africa:Math.min(3,read('atlas-east-africa-journal'))})}catch(error){console.info('Community sync unavailable.',error.message);return null}}
  window.AtlasCommunity={rpc,sync};window.syncCommunity=sync;
  if(location.protocol.startsWith('http'))sync();
}());
