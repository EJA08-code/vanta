/* ---------- Notion sync: reads from Notion into Vanta, never the other way ---------- */
const N={known:false,connected:false,running:false,msg:'',err:'',sources:null,last:0};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
class NotionError extends Error{constructor(kind,message){super(message);this.kind=kind}}
const NOTION_MESSAGES={auth:'Notion rejected the key. Disconnect below, then connect again with a new one.',access:'Vanta cannot see that database. In Notion, add the Vanta connection to it.',offline:'Notion could not be reached. Vanta will try again shortly.',busy:'Notion is busy. Vanta will try again shortly.'};
let nLast=0;
async function nReq(method,path,body){
  for(let a=0;a<6;a++){
    const gap=350-(Date.now()-nLast);if(gap>0)await sleep(gap);nLast=Date.now();
    const r=await nat('notionRequest',{method,path,body:body?JSON.stringify(body):''});
    if(r.status===0){if(a<3){await sleep(2000*2**a);continue}throw new NotionError('offline',`Notion could not be reached${r.body?' ('+r.body.replace(/\.$/,'')+')':''}. Vanta will try again shortly.`)}
    if(r.status===429||r.status>=500){await sleep((r.retryAfter||Math.min(8,2**a))*1000);continue}
    if(r.status===401)throw new NotionError('auth',NOTION_MESSAGES.auth);
    if(r.status===403||r.status===404)throw new NotionError('access',NOTION_MESSAGES.access);
    let d;try{d=JSON.parse(r.body)}catch(e){throw new NotionError('api','Notion sent a reply Vanta could not read.')}
    if(r.status>=400)throw new NotionError('api','Notion said: '+(d.message||('error '+r.status)));
    return d}
  throw new NotionError('busy',NOTION_MESSAGES.busy)}
const nPlain=a=>(a||[]).map(x=>x.plain_text||'').join('');
function nProp(p){if(!p)return'';switch(p.type){
  case'title':return nPlain(p.title);case'rich_text':return nPlain(p.rich_text);case'number':return p.number==null?'':String(p.number);
  case'select':return p.select?p.select.name:'';case'status':return p.status?p.status.name:'';case'multi_select':return(p.multi_select||[]).map(x=>x.name).join(', ');
  case'date':return p.date?p.date.start||'':'';case'checkbox':return p.checkbox?'Yes':'No';case'url':return p.url||'';case'email':return p.email||'';case'phone_number':return p.phone_number||'';
  case'formula':{const f=p.formula||{};return f.type==='date'?(f.date?f.date.start:''):f.type==='boolean'?(f.boolean?'Yes':'No'):String(f[f.type]??'')}
  case'rollup':{const f=p.rollup||{};if(f.type==='array')return(f.array||[]).map(nProp).filter(Boolean).join(', ');if(f.type==='date')return f.date?f.date.start:'';return String(f[f.type]??'')}
  case'unique_id':{const u=p.unique_id||{};return(u.prefix?u.prefix+'-':'')+(u.number??'')}
  case'created_time':return p.created_time||'';case'last_edited_time':return p.last_edited_time||'';case'people':return(p.people||[]).map(x=>x.name||'').join(', ');default:return''}}
function nMap(hdr,titleIdx){const map={},used=new Set();if(titleIdx>=0){map.title=String(titleIdx);used.add(titleIdx)}
  for(const [k,,res] of IMPORT_FIELDS){if(map[k]!=null)continue;for(const re of res){const i=hdr.findIndex((h,ix)=>!used.has(ix)&&re.test(h));if(i>=0){map[k]=String(i);used.add(i);break}}}return map}
function nLabel(s){const x=s.trim();if(/^smt$/i.test(x))return'SMT';const m=x.match(/^(.+?)\s*time\s*frame$/i);if(!m)return null;const k=m[1].trim(),low=k.toLowerCase();if(/^(daily|weekly|monthly)$/.test(low))return low[0].toUpperCase()+low.slice(1);const n=low.match(/^(\d+)\s*(h|hr|hrs|hour|hours|m|min|mins|minute|minutes)$/);return n?n[1]+(n[2][0]==='h'?'H':'m'):k}
const nCleanNotes=t=>t.replace(/^(\s*-\s*)?(SMT|[\w ]*Timeframe|A N A L Y S I S|P O S T - T R A D E|-{3,})\s*$/gim,'').replace(/\n{3,}/g,'\n\n').trim();
async function nBlocks(id,out,depth=0){let cursor='';do{const d=await nReq('GET',`/v1/blocks/${id}/children?page_size=100${cursor?'&start_cursor='+encodeURIComponent(cursor):''}`);
    for(const b of d.results||[]){const x=b[b.type]||{};let lb=null;
      if(b.type==='image'){const url=x.type==='file'?(x.file&&x.file.url):(x.external&&x.external.url);if(url)out.images.push({id:b.id,url,label:out.label||''})}
      else if(x.rich_text){const s=nPlain(x.rich_text);lb=nLabel(s);if(lb&&b.type!=='toggle')out.label=lb;if(s.trim())out.lines.push((/bulleted|numbered/.test(b.type)?'- ':b.type==='to_do'?(x.checked?'[x] ':'[ ] '):'')+s)}
      if(b.has_children&&depth<6&&!/^child_(page|database)$/.test(b.type)){const keep=out.label;if(b.type==='toggle'&&lb)out.label=lb;await nBlocks(b.id,out,depth+1);if(b.type==='toggle')out.label=keep}}
    cursor=d.has_more?d.next_cursor:''}while(cursor);return out}
async function nImage(url){const r=await nat('notionImage',{url});const bin=atob(r.base64),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);return shrink(new File([u],'shot',{type:r.type||'image/png'}))}
function nEnsureFields(hdr,used,props,schema){const extras={};hdr.forEach((h,i)=>{if(used.has(String(i))||/day.?of.?week|^(created|last edited)|^to fill$/i.test(h)||!h.trim())return;
    const sp=schema&&schema[h],type=(sp||props[h]||{}).type,kind=type==='multi_select'?'multi':['select','status','checkbox'].includes(type)?'select':type==='number'?'number':'text';let cf=S.settings.customFields.find(c=>c.label.toLowerCase()===h.toLowerCase());
    if(!cf){cf={key:'cf_'+uid(),label:h,type:kind,options:''};S.settings.customFields.push(cf)}
    if(sp){cf.type=kind;const o=sp[type]&&sp[type].options;if(o)cf.options=o.map(x=>x.name).join(', ');else if(type==='checkbox')cf.options='Yes, No'}
    extras[h]=cf.key});return extras}
async function nApply(page,row,ctx){const {hdr,map,extras,candidates,cfOpts}=ctx;const sig=JSON.stringify(row),byId=S.trades.find(t=>t.notionId===page.id);if(editing&&byId&&editing.id===byId.id)return false;
  const t=rowToTrade(row,map,S.settings.dateFormat,'');if(!t||t.skip)return false; // a row still being filled in: it comes through once it has a date and a result
  let cur=byId;if(!cur){const norm=x=>String(x||'').toLowerCase().replace(/[^a-z0-9]+/g,'');const open=candidates.filter(x=>!x.notionId&&x.date===t.date);cur=open.find(x=>norm(x.title)===norm(t.title))||(open.length===1&&ctx.perDate[t.date]===1?open[0]:null)}
  const firstLink=!!cur&&!cur.notionId,checked=cur&&cur.notionChecked?Date.parse(cur.notionChecked):0,edited=Date.parse(page.last_edited_time)||0;
  const needBody=!cur||firstLink||cur.labelsV!==2||edited>=checked-120000,changedProps=!cur||cur.notionSig!==sig;if(!needBody&&!changedProps&&!cur.notionGone)return false;
  const isNew=!cur;const out=cur||Object.assign(t,{id:uid()});
  if(changedProps){const set=(k,v)=>{out[k]=v};for(const k of ['date','title'])set(k,t[k]);if(map.time!=null)set('time',t.time);
    for(const k of ['symbol','side','qty','entry','exit','pnl','fees','outcome','points','rr','rating','strategy'])if(map[k]!=null)set(k,t[k]);
    if(map.strategy!=null){const old=new Set(out.notionTags||[]),keep=(cur?out.tags||[]:[]).filter(x=>!old.has(x)&&!t.tags.includes(x));out.tags=[...keep,...t.tags];out.notionTags=t.tags}
    out.custom=out.custom||{};for(const h in extras){const v=(row[hdr.indexOf(h)]||'').trim(),k=extras[h];if(v)out.custom[k]=v;else delete out.custom[k];if(v)(cfOpts[k]=cfOpts[k]||new Set()).add(v)}const bf=behaviorFieldOf(S);if(bf&&out.custom[bf.key]!=null){const bad=new Set(S.settings.mistakes);out.mistakes=splitList(out.custom[bf.key]).filter(x=>bad.has(x))}}
  if(needBody){ctx.report(out.title);const body=await nBlocks(page.id,{lines:[],images:[]});const notes=nCleanNotes(body.lines.join('\n\n'));if(notes||!firstLink)out.notes=notes;
    const ids=body.images.map(i=>i.id),labels=body.images.map(i=>i.label),old=out.notionImgIds;out.images=out.images||[];
    if(!old&&out.images.length===ids.length&&firstLink){out.notionImgIds=ids;out.imgLabels=labels}
    else{const have=new Map(),local=[];if(old)out.images.forEach((src,i)=>{if(old[i])have.set(old[i],src);else local.push(src)});const next=[];for(const im of body.images)next.push(have.get(im.id)||await nImage(im.url));out.images=[...next,...local];out.notionImgIds=[...ids,...local.map(()=>null)];out.imgLabels=[...labels,...local.map(()=>'')]}
    out.notionChecked=new Date().toISOString();out.labelsV=2}
  out.notionId=page.id;out.notionUrl=page.url||'';out.notionSig=sig;out.notionEdited=page.last_edited_time;delete out.notionGone;
  for(const m of modelsOf(out))if(!S.settings.strategies.find(s=>s.name===m))S.settings.strategies.push({name:m,rules:''});
  if(isNew){S.trades.push(out);ctx.added++;ctx.newIds.push(out.id)}else if(firstLink)ctx.linked++;else ctx.updated++;
  return true}
function nSetStatus(m){N.msg=m;renderStatus();const e=document.getElementById('notionMsg');if(e)e.textContent=m}
async function notionSync(manual){if(!N.connected||N.running)return;const cfg=S.settings.notion;N.running=true;N.err='';nSetStatus('Checking Notion…');const before=S.trades.length;let any=false;
  try{if(!cfg.dataSourceId){await notionFindSources();if(!cfg.dataSourceId){nSetStatus('');return}}
    let schema=null;try{schema=(await nReq('GET',`/v1/data_sources/${cfg.dataSourceId}`)).properties||null}catch(e){if(e.kind==='auth')throw e}
    const pages=[];let cursor='',complete=true;do{const d=await nReq('POST',`/v1/data_sources/${cfg.dataSourceId}/query`,cursor?{page_size:100,start_cursor:cursor}:{page_size:100});pages.push(...(d.results||[]).filter(p=>!p.in_trash&&!p.archived));if(d.request_status&&d.request_status.type==='incomplete')complete=false;cursor=d.has_more?d.next_cursor:''}while(cursor);
    const propsOf=pages[0]?pages[0].properties:{},hdr=[...new Set(pages.flatMap(p=>Object.keys(p.properties||{})))].sort(),titleIdx=hdr.findIndex(h=>(propsOf[h]||{}).type==='title'),map=nMap(hdr,titleIdx),used=new Set(Object.values(map)),extras=nEnsureFields(hdr,used,propsOf,schema);
    const rows=pages.map(p=>hdr.map(h=>nProp(p.properties[h]))),dateIdx=map.date!=null?+map.date:-1,perDate={};rows.forEach(r=>{const v=parseDT(dateIdx>=0?r[dateIdx]:'',S.settings.dateFormat);if(v.date)perDate[v.date]=(perDate[v.date]||0)+1});
    const ctx={hdr,map,extras,perDate,candidates:S.trades.slice(),cfOpts:{},newIds:[],added:0,linked:0,updated:0,report:t=>nSetStatus('Reading “'+t+'”…')};const wasEmpty=!S.trades.length;let failed=0;
    for(let i=0;i<pages.length;i++){try{if(await nApply(pages[i],rows[i],ctx))any=true}catch(e){if(e.kind==='auth'||e.kind==='offline')throw e;console.error(e);failed++}}
    for(const k in ctx.cfOpts){const cf=S.settings.customFields.find(c=>c.key===k);if(cf&&!schema&&(cf.type==='select'||cf.type==='multi')){const have=String(cf.options||'').split(',').map(x=>x.trim()).filter(Boolean);ctx.cfOpts[k].forEach(v=>{if(!have.includes(v))have.push(v)});cf.options=have.join(', ')}}
    if(complete&&pages.length){const ids=new Set(pages.map(p=>p.id));for(const t of S.trades)if(t.notionId&&!ids.has(t.notionId)&&!t.notionGone){t.notionGone=true;any=true}}
    if(wasEmpty&&ctx.added&&S.trades.every(t=>!num(t.pnl)&&blank(t.entry)))S.settings.unit=S.trades.some(t=>!blank(t.rr))?'R':'points';
    cfg.lastSync=new Date().toISOString();N.last=Date.now();N.msg='';N.err=failed?`${plural(failed,'trade')} could not be read and will be retried.`:'';
    if(any){if(ctx.added)calMonth=null;if(before)ctx.newIds.forEach(id=>freshIds.add(id));save();const typing=document.activeElement&&document.activeElement.closest&&document.activeElement.closest('#main input,#main textarea');if(!editing&&!typing)render()}else save();
    if(ctx.added&&before)toast(plural(ctx.added,'new trade')+' from Notion');else if(ctx.added||ctx.linked)toast(`Notion connected. ${plural(ctx.added+ctx.linked,'trade')} in sync.`);else if(manual)toast(ctx.updated?plural(ctx.updated,'trade')+' updated from Notion':'Everything is up to date');
  }catch(e){console.error(e);N.msg='';N.err=e.message||'Notion sync stopped.';}
  finally{N.running=false;renderStatus();nRefresh()}}
function nRefresh(){if(view!=='settings')return;const a=document.activeElement;if(a&&a.closest&&a.closest('#main input,#main textarea,#main select'))return;render()}
async function notionFindSources(){const cfg=S.settings.notion;const d=await nReq('POST','/v1/search',{filter:{property:'object',value:'data_source'},page_size:50});N.sources=(d.results||[]).filter(x=>!x.in_trash&&!x.archived).map(x=>({id:x.id,name:nPlain(x.title)||'Untitled database'}));
  if(!cfg.dataSourceId&&N.sources.length){const pick=N.sources.length===1?N.sources[0]:N.sources.find(s=>/2026/.test(s.name)&&/journal/i.test(s.name))||N.sources.find(s=>/journal/i.test(s.name));if(pick){cfg.dataSourceId=pick.id;cfg.name=pick.name;save()}}}
async function notionConnect(){const inp=document.getElementById('notionKey'),key=inp?inp.value.trim():'';if(!key)return toast('Paste your Notion key first.');N.msg='Checking the key…';if(view==='settings')render();
  try{const r=await nat('notionSetKey',{key});if(!r||!r.ok){N.msg='';N.err=r&&r.error||'Notion did not accept that key.';return render()}N.connected=true;N.err='';N.msg='';S.settings.notion.dataSourceId='';notionStartPolling();await notionFindSources();render();if(S.settings.notion.dataSourceId)notionSync(true)}catch(e){console.error(e);N.msg='';N.err=e.message||'The key could not be saved.';render()}}
let nPolling=false;
function notionStartPolling(){if(nPolling)return;nPolling=true;setInterval(()=>{if(!document.hidden&&!editing)notionSync(false)},60000);document.addEventListener('visibilitychange',()=>{if(!document.hidden&&Date.now()-N.last>30000)notionSync(false)})}
async function notionBoot(){try{const r=await nat('notionStatus');N.known=true;N.connected=!!r.connected}catch(e){N.known=true}renderStatus();if(view==='settings')render();if(N.connected){notionSync(false);notionStartPolling()}}
function nAgo(iso){if(!iso)return'';const s=Math.max(0,(Date.now()-Date.parse(iso))/1000);if(s<60)return'just now';if(s<3600)return Math.floor(s/60)+' min ago';if(s<86400)return Math.floor(s/3600)+' hr ago';return fmtDate(iso.slice(0,10))}
function vNotion(){const cfg=S.settings.notion,gone=S.trades.filter(t=>t.notionGone);
  if(!N.connected)return det('notion','Notion',`<p class="hint">New and changed trades in your Notion journal appear here automatically. Vanta only reads from Notion and can never change it.</p><ol class="steps"><li><span>Create a connection named Vanta in Notion. It only needs Read content.</span><button class="btn sm" data-act="notionOpenSetup">Open Notion</button></li><li><span>Copy its secret and paste it here. It is kept in your Mac’s Keychain.</span><div class="row" style="flex-wrap:nowrap;width:100%"><input id="notionKey" type="password" autocomplete="off" spellcheck="false" placeholder="Notion secret" aria-label="Notion secret"><button class="btn pri sm" style="height:40px" data-act="notionConnect">Connect</button></div></li><li><span>In Notion, open your trading journal database, then ••• › Connections, and add Vanta.</span></li></ol>${N.msg?`<p class="hint">${esc(N.msg)}</p>`:''}${N.err?`<p class="warn-line">${esc(N.err)}</p>`:''}`,'Not connected');
  const list=N.sources||[];
  return det('notion','Notion',`${cfg.dataSourceId?`<p class="hint">Reading from <b style="color:var(--text);font-weight:500">${esc(cfg.name||'your database')}</b>. Vanta checks about once a minute while its window is showing, and never changes anything in Notion.</p>`:`<p class="hint">Connected, but Vanta cannot see your journal yet. In Notion, open your trading journal database, then ••• › Connections, and add Vanta.</p>`}${list.length>1?`<label class="f">Database<select data-act="notionSource">${list.map(s=>`<option value="${esc(s.id)}" ${s.id===cfg.dataSourceId?'selected':''}>${esc(s.name)}</option>`).join('')}</select></label>`:''}<p class="hint" id="notionMsg" aria-live="polite">${esc(N.msg)}</p>${N.err?`<p class="warn-line">${esc(N.err)}</p>`:''}${gone.length?`<div><p class="hint" style="margin-bottom:8px">${gone.length===1?'This trade is':'These trades are'} no longer in Notion. Vanta kept ${gone.length===1?'it':'them'} until you decide.</p>${gone.map(t=>`<div class="cfg"><span>${esc(t.title||t.symbol)}<small>${esc(fmtDate(t.date))}</small></span><button class="btn ghost sm" data-goneKeep="${t.id}">Keep</button><button class="btn danger sm" data-goneDel="${t.id}">Remove</button></div>`).join('')}</div>`:''}<div class="row"><button class="btn" data-act="notionSyncNow" ${N.running?'disabled':''}>${cfg.dataSourceId?'Sync now':'Check again'}</button><button class="btn ghost" data-act="notionForget">Disconnect</button></div>`,N.err?'Needs attention':(gone.length?plural(gone.length,'trade')+' to review':(cfg.lastSync?'Synced '+nAgo(cfg.lastSync):'Connected')))}
