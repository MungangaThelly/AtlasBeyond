(function(){
  const config=window.ATLAS_COMMUNITY;if(!config)return;
  const read=key=>{try{return JSON.parse(localStorage.getItem(key)||'[]').length}catch{return 0}};
  const device=()=>{let id=localStorage.getItem('atlas-community-id');if(!id){id=crypto.randomUUID();localStorage.setItem('atlas-community-id',id)}return id};
  async function rpc(name,body={}){const response=await fetch(`${config.url}/rest/v1/rpc/${name}`,{method:'POST',headers:{apikey:config.key,Authorization:`Bearer ${config.key}`,'Content-Type':'application/json'},body:JSON.stringify(body)});if(!response.ok)throw Object.assign(new Error(`Community service returned ${response.status}`),{status:response.status});return response.status===204?null:response.json()}
  const participates=()=>localStorage.getItem('atlas-community-participation')==='yes';
  async function sync(){if(!participates())return null;const base={p_device:device(),p_iceland:Math.min(3,read('atlas-journal')),p_patagonia:Math.min(3,read('atlas-patagonia-journal')),p_east_africa:Math.min(3,read('atlas-east-africa-journal'))};try{return await rpc('sync_explorer_v2',{...base,p_central_asia:Math.min(3,read('atlas-central-asia-journal'))})}catch(error){if(error.status===404)return rpc('sync_explorer',base);console.info('Community sync unavailable.',error.message);return null}}
  async function stats(){try{return await rpc('community_stats_v2')}catch(error){if(error.status===404)return rpc('community_stats');throw error}}
  function setParticipation(value){localStorage.setItem('atlas-community-participation',value?'yes':'no');return value?sync():Promise.resolve(null)}
  window.AtlasCommunity={rpc,sync,stats,participates,setParticipation};window.syncCommunity=sync;
}());
