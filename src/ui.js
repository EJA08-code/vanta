/* ---------- icons + brand ---------- */
const MARK='<path d="M 928,543 L 788,543 L 772,545 L 749,551 L 725,562 L 695,584 L 677,604 L 667,619 L 654,645 L 646,672 L 641,678 L 637,680 L 606,685 L 582,694 L 569,701 L 550,715 L 538,727 L 522,749 L 511,773 L 504,802 L 503,912 L 643,913 L 643,713 L 647,702 L 657,692 L 668,688 L 928,688 Z"/><path d="M 749,317 L 609,317 L 609,519 L 603,532 L 595,539 L 585,543 L 325,543 L 325,688 L 469,687 L 487,683 L 506,676 L 525,666 L 543,653 L 563,633 L 578,613 L 594,582 L 602,556 L 608,548 L 646,540 L 672,529 L 699,510 L 712,497 L 727,477 L 741,448 L 748,419 Z"/>';
const logo=(s=22)=>`<svg class="ic" width="${s}" height="${s}" viewBox="325 317 603 596" fill="currentColor" aria-hidden="true">${MARK}</svg>`;
const ICONS={
  overview:'<path d="M3 15.5 7.5 10l3.5 3 6-7.5"/><path d="M3 3v14h14" opacity=".45"/>',
  calendar:'<rect x="3" y="4.5" width="14" height="12.5" rx="2.5"/><path d="M3 8.5h14M7 2.5v3.5M13 2.5v3.5"/>',
  trades:'<path d="M7 5.5h10M7 10h10M7 14.5h10M3.5 5.5h.01M3.5 10h.01M3.5 14.5h.01"/>',
  insights:'<path d="M4 17v-6M10 17V3.5M16 17V8"/>',
  playbook:'<path d="M4 16.5V4.5A2 2 0 0 1 6 2.5h10v12H6a2 2 0 0 0-2 2Zm0 0a2 2 0 0 0 2 1h10"/>',
  import:'<path d="M10 3v9.5M6.5 9 10 12.5 13.500 9"/><path d="M3.500 13v2.500a1.500 1.500 0 0 0 1.500 1.500h10a1.500 1.500 0 0 0 1.500-1.500V13"/>',
  settings:'<path d="M3 6h7M14 6h3M3 14h3M10 14h7"/><circle cx="12" cy="6" r="2"/><circle cx="8" cy="14" r="2"/>',
  more:'<circle cx="4.500" cy="10" r=".6"/><circle cx="10" cy="10" r=".6"/><circle cx="15.500" cy="10" r=".6"/>',
  shuffle:'<path d="M3 6h3c5 0 5 8 11 8M3 14h3c1.700 0 2.900-.9 3.900-2M17 6c-2.500 0-4 .8-5 2M14.500 3.500 17 6l-2.500 2.500M14.500 11.500 17 14l-2.500 2.500"/>',check:'<circle cx="10" cy="10" r="7"/><path d="m7 10.200 2.100 2.100L13.200 8"/>',
  plus:'<path d="M10 4v12M4 10h12"/>',x:'<path d="m5 5 10 10M15 5 5 15"/>',
  left:'<path d="m12 4.500-5.500 5.500 5.500 5.500"/>',right:'<path d="m8 4.500 5.500 5.500L8 15.500"/>',
  up:'<path d="m4.500 12.500 5.500-5.500 5.500 5.500"/>',down:'<path d="m4.500 7.500 5.500 5.500 5.500-5.500"/>',
  filter:'<path d="M3 5.500h14M6 10h8M8.500 14.500h3"/>',search:'<circle cx="9" cy="9" r="5.500"/><path d="m13.200 13.200 3.800 3.800"/>',
  image:'<rect x="3" y="4" width="14" height="12" rx="2"/><circle cx="7.500" cy="8.500" r="1.200"/><path d="m3.500 14.500 4-3.500 3 2.500 2.500-2 3.500 3"/>'
};
const ic=(n,s=20)=>`<svg class="ic" width="${s}" height="${s}" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n]}</svg>`;

/* ---------- small formatters ---------- */
const sg=(v,dec)=>(v>0?'+':'')+money(v,dec);
const sameYear=ds=>ds.slice(0,4)===String(new Date().getFullYear());
const fmtDate=ds=>{const d=pd(ds);return MONTHS[d.getMonth()].slice(0,3)+' '+d.getDate()+(sameYear(ds)?'':', '+d.getFullYear())};
const fmtLong=ds=>{const d=pd(ds);return ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][d.getDay()]+', '+MONTHS[d.getMonth()]+' '+d.getDate()};
const plural=(n,w)=>n+' '+w+(n===1?'':'s');
function missing(t){if(t.outcome==='be'||t.outcome==='missed')return false;const u=unitOf();if(u==='R')return rMult(t)==null;if(u==='points')return ptsOf(t)==null;return !num(t.pnl)&&blank(t.entry)}
const resultText=t=>t.outcome==='missed'?'Missed':missing(t)?'–':sg(net(t));
const resultCls=t=>t.outcome==='missed'||missing(t)?'mut':cls(net(t));
const rangeLabel=()=>({all:'all time',month:'this month','30':'last 30 days','90':'last 90 days',ytd:'this year',custom:'custom range'})[F.range];

/* ---------- state ---------- */
function defaults(){return{
  currency:'$',startBalance:50000,feePerContract:0,theme:'dark',accent:'',
  pointValues:{NQ:20,MNQ:2,ES:50,MES:5,YM:5,MYM:0.5,RTY:50,M2K:5,CL:1000,MCL:100,GC:100,MGC:10},
  strategies:[],mistakes:['FEAR','ANXIOUS','GREED','PNL PEEKING','TILT','HESITATION','BOREDOM','IMPATIENT','TIRED','DOUBTFUL','FOMO','GAMBLING','OVER TRADING','OVER LEVERAGING','UNPREPARED','UNPLANNED TRADE'],customFields:[],
  widgets:[{id:'summary',on:true},{id:'past',on:true},{id:'rules',on:true},{id:'calendar',on:true},{id:'recent',on:true},{id:'dailybars',on:false},{id:'strategy',on:false},{id:'score',on:false}],
  kpis:{winrate:true,pf:true,expectancy:true,maxdd:true,ratio:false,streak:false,trades:false,avgday:false},cols:{},
  score:{name:'Vanta Score',weights:{win:1,pf:1,wl:1,dd:1,rec:1,cons:1},targets:{win:60,pf:2.5,wl:2.5,dd:10,rec:3}},
  lastMapping:null,dateFormat:'MDY',unit:'money',notion:{dataSourceId:'',name:'',lastSync:''}
}}
let S={trades:[],notes:{},settings:defaults()};
let F={range:'all',from:'',to:'',strategy:'',symbol:''};
let view='overview',calMonth=null,daySel=null,calTab='month',filterOpen=false,onlyMissing=false;
let saveState='ok',nativeInfo=null;
const openSec=new Set();
function mergeDefaults(st){const d=defaults();const s=st.settings=Object.assign({},d,st.settings||{});
  for(const k of ['kpis','pointValues','cols'])s[k]=Object.assign({},d[k],s[k]||{});
  s.score=Object.assign({},d.score,s.score||{});s.score.weights=Object.assign({},d.score.weights,s.score.weights||{});s.score.targets=Object.assign({},d.score.targets,s.score.targets||{});
  const known=d.widgets.map(w=>w.id);s.widgets=(Array.isArray(s.widgets)?s.widgets:d.widgets).filter(w=>known.includes(w.id));d.widgets.forEach((w,i)=>{if(!s.widgets.some(x=>x.id===w.id))s.widgets.splice(Math.min(i,s.widgets.length),0,Object.assign({},w))});
  s.strategies=(s.strategies||[]).map(x=>typeof x==='string'?{name:x,rules:''}:x);
  if(s.mistakes.includes('FOMO entry'))s.mistakes=d.mistakes;
  st.trades=st.trades||[];st.notes=st.notes||{};deriveMistakes(st);return st}
/* Behavior is one list in Notion. Vanta shows the bad ones as Mistakes and the good ones as Behaviors */
const splitList=v=>String(v||'').split(',').map(x=>x.trim()).filter(Boolean);
const behaviorFieldOf=st=>st.settings.customFields.find(c=>/^behaviou?rs?$/i.test(c.label));
function deriveMistakes(st){const f=behaviorFieldOf(st);if(!f)return;const bad=new Set(st.settings.mistakes);for(const t of st.trades){const v=(t.custom||{})[f.key];if(v!=null)t.mistakes=splitList(v).filter(x=>bad.has(x))}}

/* ---------- storage: native file, or IndexedDB + optional folder ---------- */
const BR=window.webkit&&window.webkit.messageHandlers&&window.webkit.messageHandlers.vanta;const NATIVE=!!BR;
const nat=(action,o={})=>BR.postMessage(Object.assign({action},o));
let saveT=null;
function save(){clearTimeout(saveT);saveT=setTimeout(persist,250)}
async function persist(){clearTimeout(saveT);saveT=null;const was=saveState;
  try{await nat('save',{json:JSON.stringify(S)});saveState='ok'}
  catch(e){console.error(e);saveState='err';if(was!=='err')toast('Your last change could not be saved. Export a backup from Settings, then try again.')}
  renderStatus()}
async function connectFolder(){const r=await nat('chooseFolder');if(!r)return;
  if(r.existing&&await ask({title:'This folder already has a journal',body:'Open the journal in this folder, or replace it with the one open now?',ok:'Open it',cancel:'Replace it'})){const t=await nat('load');if(t)S=mergeDefaults(JSON.parse(t))}
  nativeInfo=await nat('info');await persist();applyTheme();render();toast('Now saving to '+r.path.split('/').pop())}
function renderStatus(){const b=$('#status');if(!b)return;let t=nativeInfo&&nativeInfo.custom?'Saved to '+nativeInfo.path.split('/').pop():'Saved on this Mac',warn=false;
  if(saveState==='err'){t='Not saved';warn=true}
  else if(N.connected&&N.err){t='Notion needs attention';warn=true}
  else if(N.connected&&N.running)t='Checking Notion…';
  else if(N.connected&&S.settings.notion.lastSync)t='Synced '+nAgo(S.settings.notion.lastSync);
  b.classList.toggle('warn',warn);b.innerHTML=`<i></i><span>${esc(t)}</span>`;b.title=t;updateReviewNav()}

/* ---------- overlays ---------- */
function toast(m,o={}){document.querySelectorAll('.toast').forEach(x=>x.remove());const t=document.createElement('div');t.className='toast';t.setAttribute('role','status');t.innerHTML=`<span>${esc(m)}</span>`;
  if(o.undo){const b=document.createElement('button');b.textContent='Undo';b.onclick=()=>{o.undo();t.remove()};t.appendChild(b)}
  document.body.appendChild(t);setTimeout(()=>t.remove(),o.undo?6000:3200)}
function ask({title,body='',ok='OK',cancel='Cancel',danger=false,input=null}){return new Promise(res=>{const prev=document.activeElement;const w=document.createElement('div');w.className='dialog-wrap';
  w.innerHTML=`<div class="dialog" role="alertdialog" aria-modal="true" aria-label="${esc(title)}"><h2>${esc(title)}</h2>${body?`<p>${esc(body)}</p>`:''}${input!=null?`<input aria-label="${esc(title)}" value="${esc(input)}">`:''}<div class="row"><button class="btn ghost" data-r="0">${esc(cancel)}</button><button class="btn ${danger?'danger':'pri'}" data-r="1">${esc(ok)}</button></div></div>`;
  const done=v=>{w.remove();if(prev&&prev.isConnected)prev.focus();res(v)};const val=()=>input!=null?w.querySelector('input').value.trim():true;
  w.addEventListener('click',e=>{const r=e.target.closest('[data-r]');if(r)done(r.dataset.r==='1'?val():(input!=null?null:false));else if(e.target===w)done(input!=null?null:false)});
  w.addEventListener('keydown',e=>{if(e.key==='Escape'){e.stopPropagation();done(input!=null?null:false)}if(e.key==='Enter'&&input!=null){e.preventDefault();done(val())}});
  document.body.appendChild(w);(w.querySelector('input')||w.querySelector('[data-r="1"]')).focus()})}
function openLightbox(i){const imgs=editing.images,labs=editing.imgLabels||[],uniq=[...new Set(labs.filter(Boolean))];let cur=i;const w=document.createElement('div');w.className='lightbox';w.setAttribute('role','dialog');w.setAttribute('aria-label','Screenshot');const prev=document.activeElement;
  const draw=()=>{w.innerHTML=`${uniq.length?`<div class="lbtabs" role="group" aria-label="Timeframes">${uniq.map(l=>`<button data-j="${labs.indexOf(l)}" class="${labs[cur]===l?'on':''}" aria-pressed="${labs[cur]===l}">${esc(l)}</button>`).join('')}</div>`:''}<img src="${imgs[cur]}" alt="${esc(labs[cur]||'Trade')} screenshot ${cur+1} of ${imgs.length}"><div class="lbcount">${cur+1} of ${imgs.length}</div><button class="tb" style="top:12px;right:12px" data-x aria-label="Close">${ic('x')}</button>${imgs.length>1?`<button class="tb" style="left:8px;top:50%" data-p aria-label="Previous screenshot">${ic('left')}</button><button class="tb" style="right:8px;top:50%" data-n aria-label="Next screenshot">${ic('right')}</button>`:''}`;w.querySelector('[data-x]').focus()};
  const close=()=>{w.remove();if(prev&&prev.isConnected)prev.focus()};const step=d=>{cur=(cur+d+imgs.length)%imgs.length;draw()};
  w.addEventListener('click',e=>{const j=e.target.closest('[data-j]');if(j){cur=+j.dataset.j;draw();return}if(e.target.closest('[data-p]'))step(-1);else if(e.target.closest('[data-n]'))step(1);else if(e.target.closest('[data-x]')||e.target===w)close()});
  w.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Escape')close();if(e.key==='ArrowLeft'&&imgs.length>1)step(-1);if(e.key==='ArrowRight'&&imgs.length>1)step(1)});
  document.body.appendChild(w);draw()}

/* ---------- charts (pure SVG, offline, drawn at real width) ---------- */
let CH=[];
function contentW(){const m=$('#main'),cs=getComputedStyle(m);return Math.max(260,Math.min(1040,m.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight)))}
function lineChart(curve,o={}){if(!curve.length)return '<div class="nodata">No trades in this range.</div>';
  const pts=[{x:curve[0].x,y:0,start:true},...curve],W=o.w||contentW(),H=o.h||(W<500?180:260),pl=4,pr=8,pt=12,pb=26;const ys=pts.map(p=>p.y);let mn=Math.min(0,...ys),mx=Math.max(0,...ys);if(mn===mx){mx+=1;mn-=1}const pad=(mx-mn)*.04;mn-=pad;mx+=pad;
  const X=i=>pl+(W-pl-pr)*(pts.length<2?0:i/(pts.length-1)),Y=v=>pt+(H-pt-pb)*(1-(v-mn)/(mx-mn));const d=pts.map((p,i)=>(i?'L':'M')+X(i).toFixed(1)+' '+Y(p.y).toFixed(1)).join('');const id=CH.length,L=pts.length-1;
  CH.push({pts,X,Y,H,pb});
  return `<div class="curve"><svg data-ch="${id}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Running total from ${esc(fmtDate(curve[0].x))} to ${esc(fmtDate(curve[curve.length-1].x))}, ending at ${esc(sg(curve[curve.length-1].y))}" style="color:var(--accent)"><defs><linearGradient id="fill${id}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="currentColor" stop-opacity=".12"/><stop offset="1" stop-color="currentColor" stop-opacity="0"/></linearGradient></defs>
  <line x1="${pl}" x2="${W-pr}" y1="${Y(0)}" y2="${Y(0)}" stroke="var(--line2)" stroke-dasharray="2 4"/><path d="${d}L${X(L)} ${H-pb}L${X(0)} ${H-pb}Z" fill="url(#fill${id})"/><path d="${d}" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round" stroke-linecap="round"/><circle cx="${X(L)}" cy="${Y(pts[L].y)}" r="3.500" fill="currentColor"/>
  <line class="ml" y1="${pt}" y2="${H-pb}" stroke="var(--line2)" visibility="hidden"/><circle class="mk" r="4.500" fill="var(--bg)" stroke="currentColor" stroke-width="1.750" visibility="hidden"/>
  <text x="${pl}" y="${H-6}" font-size="12" fill="var(--muted)">${esc(fmtDate(curve[0].x))}</text><text x="${W-pr}" y="${H-6}" font-size="12" text-anchor="end" fill="var(--muted)">${esc(fmtDate(curve[curve.length-1].x))}</text></svg></div>`}
function chartHover(e){const svg=e.target.closest&&e.target.closest('svg[data-ch]');let tip=$('#tip');
  if(!svg||!CH[+svg.dataset.ch]){if(tip)tip.remove();document.querySelectorAll('svg[data-ch] .mk,svg[data-ch] .ml').forEach(n=>n.setAttribute('visibility','hidden'));return}
  const c=CH[+svg.dataset.ch],r=svg.getBoundingClientRect(),vb=svg.viewBox.baseVal.width,x=(e.clientX-r.left)*vb/r.width;let best=1,bd=1e9;for(let i=1;i<c.pts.length;i++){const k=Math.abs(c.X(i)-x);if(k<bd){bd=k;best=i}}
  const p=c.pts[best],px=c.X(best),py=c.Y(p.y),mk=svg.querySelector('.mk'),ml=svg.querySelector('.ml');mk.setAttribute('cx',px);mk.setAttribute('cy',py);mk.setAttribute('visibility','visible');ml.setAttribute('x1',px);ml.setAttribute('x2',px);ml.setAttribute('visibility','visible');
  if(!tip){tip=document.createElement('div');tip.id='tip';tip.className='tip';document.body.appendChild(tip)}tip.innerHTML=`<b>${esc(sg(p.y))}</b><small>${esc(fmtDate(p.x))}</small>`;
  const k=r.width/vb,tw=tip.offsetWidth/2;tip.style.left=Math.max(tw+8,Math.min(innerWidth-tw-8,r.left+px*k))+'px';tip.style.top=Math.max(56,r.top+py*k-12)+'px'}
function barChart(items,o={}){if(!items.length)return '<div class="nodata">No trades in this range.</div>';
  const W=o.w||contentW(),H=o.h||180,pt=6,pb=24;const vs=items.map(i=>i.v);let mn=Math.min(0,...vs),mx=Math.max(0,...vs);if(mn===mx)mx=1;const Y=v=>pt+(H-pt-pb)*(1-(v-mn)/(mx-mn)),bw=W/items.length;let s=`<line x1="0" x2="${W}" y1="${Y(0)}" y2="${Y(0)}" stroke="var(--line2)"/>`;
  items.forEach((it,i)=>{const y0=Y(0),y1=Y(it.v);s+=`<rect x="${i*bw+bw/2-Math.min(28,Math.max(2,bw*.64))/2}" y="${Math.min(y0,y1)}" width="${Math.min(28,Math.max(2,bw*.64))}" height="${Math.max(1,Math.abs(y1-y0))}" rx="2" fill="${it.v>=0?'var(--win)':'var(--loss)'}"><title>${esc(it.l)}: ${esc(sg(it.v))}</title></rect>`});
  const step=Math.max(1,Math.ceil(items.length/(W<500?4:8)));items.forEach((it,i)=>{if(i%step===0)s+=`<text x="${i*bw+bw/2}" y="${H-6}" text-anchor="middle" font-size="12" fill="var(--muted)">${esc(it.short||it.l)}</text>`});
  return `<svg viewBox="0 0 ${W} ${H}" style="display:block;width:100%;height:auto" role="img" aria-label="Results per period">${s}</svg>`}
function radar(parts){const labels={win:'Win %',pf:'Profit factor',wl:'Avg win/loss',rec:'Recovery',dd:'Drawdown',cons:'Consistency'},keys=['win','pf','wl','rec','dd','cons'];const W=420,H=270,cx=W/2,cy=H/2,R=92;const ang=i=>-Math.PI/2+i*2*Math.PI/keys.length,P=(i,r)=>[cx+Math.cos(ang(i))*r,cy+Math.sin(ang(i))*r];let s='';
  for(let k=1;k<=4;k++)s+=`<polygon points="${keys.map((_,i)=>P(i,R*k/4).join(',')).join(' ')}" fill="none" stroke="var(--line)"/>`;
  keys.forEach((k,i)=>{const [x,y]=P(i,R);s+=`<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="var(--line)"/>`;const [lx,ly]=P(i,R+14);s+=`<text x="${lx}" y="${ly+4}" font-size="12" text-anchor="${Math.abs(lx-cx)<5?'middle':lx<cx?'end':'start'}" fill="var(--muted)">${labels[k]}</text>`});
  s+=`<polygon points="${keys.map((k,i)=>P(i,R*Math.max(.03,parts[k])).join(',')).join(' ')}" fill="var(--accent)" fill-opacity=".2" stroke="var(--accent)" stroke-width="1.5" stroke-linejoin="round"/>`;
  return `<svg viewBox="0 0 ${W} ${H}" style="display:block;width:100%;max-width:440px;height:auto" role="img" aria-label="Score by category">${s}</svg>`}

/* ---------- shared view parts ---------- */
function viewBar(){const strats=S.settings.strategies.map(s=>s.name),syms=[...new Set(S.trades.map(t=>rootSym(t.symbol)).filter(Boolean))].sort(),n=(F.strategy?1:0)+(F.symbol?1:0);
  return `<div class="bar"><select class="quiet" data-f="range" aria-label="Date range">${[['all','All time'],['month','This month'],['30','Last 30 days'],['90','Last 90 days'],['ytd','This year'],['custom','Custom range']].map(([v,l])=>`<option value="${v}" ${F.range===v?'selected':''}>${l}</option>`).join('')}</select>
  <button class="btn ghost sm" data-act="toggleFilter" aria-expanded="${filterOpen}">${ic('filter',16)}Filter${n?`<span class="count">${n}</span>`:''}</button>
  <div class="seg" role="group" aria-label="Measure results in">${[['R','R'],['points','Pts'],['money',esc(S.settings.currency)]].map(([v,l])=>`<button data-unit="${v}" class="${unitOf()===v?'on':''}" aria-pressed="${unitOf()===v}" title="${({R:'R multiple',points:'Points or handles',money:'Money'})[v]}">${l}</button>`).join('')}</div>
  ${filterOpen?`<div class="pop">
    ${F.range==='custom'?`<label class="f">From<input type="date" data-f="from" value="${F.from}"></label><label class="f">To<input type="date" data-f="to" value="${F.to}"></label>`:''}
    <label class="f">Strategy<select data-f="strategy"><option value="">All strategies</option>${strats.map(s=>`<option ${F.strategy===s?'selected':''}>${esc(s)}</option>`).join('')}</select></label>
    <label class="f">Symbol<select data-f="symbol"><option value="">All symbols</option>${syms.map(s=>`<option ${F.symbol===s?'selected':''}>${esc(s)}</option>`).join('')}</select></label>
    ${n?'<button class="btn ghost sm" data-act="clearFilter">Clear filters</button>':''}</div>`:''}</div>`}
const head=(title,right='')=>`<div class="head"><h1>${esc(title)}</h1>${right}</div>`;
function emptyState(title='Start with your trades',body='Import a broker CSV or a Notion export, or add a trade by hand. Your journal stays on this device.'){return `<div class="empty">${logo(44)}<h1>${esc(title)}</h1><p>${esc(body)}</p><div class="row"><button class="btn pri" data-go="import">Import trades</button><button class="btn" data-act="addTrade">Add a trade</button></div></div>`}
const stat=(l,v,c='')=>`<div><dt>${esc(l)}</dt><dd class="${c}">${esc(v)}</dd></div>`;
function tradeTable(rows,o={}){const full=!!o.full;if(!rows.length)return `<div class="nodata">${esc(o.empty||'No trades match.')}</div>`;const c=S.settings.cols,cf=full?S.settings.customFields.filter(x=>c['cf:'+x.key]):[],showR=unitOf()!=='R';
  const opt=full?[['time','Time'],['qty','Qty'],['rating','Rating']].filter(([k])=>c[k]):[];
  const th=(k,l,r)=>full?`<th class="${r?'r':''}" aria-sort="${sortKey===k?(sortDir>0?'ascending':'descending'):'none'}"><button data-sort="${k}">${esc(l)}${sortKey===k?ic(sortDir>0?'up':'down',12):''}</button></th>`:`<th class="${r?'r':''}">${esc(l)}</th>`;
  return `<div class="tblwrap"><table class="tbl ${selected.size?'selecting':''}"><thead><tr>${full?'<th class="ck hide-sm"><input type="checkbox" data-act="selAll" aria-label="Select all trades"></th>':''}${th('date','Date')}${th('title','Trade')}${full?`<th class="hide-sm" aria-sort="${sortKey==='strategy'?(sortDir>0?'ascending':'descending'):'none'}"><button data-sort="strategy">Strategy${sortKey==='strategy'?ic(sortDir>0?'up':'down',12):''}</button></th>`:''}${opt.map(([,l])=>`<th class="hide-sm">${l}</th>`).join('')}${cf.map(x=>`<th class="hide-sm">${esc(x.label)}</th>`).join('')}${showR&&full?`<th class="r hide-sm">R</th>`:''}${th('net',unitLabel().replace('Net ','').replace(/^P&L$/,'Result').replace('points','Points').replace(/^R$/,'Result'),true)}</tr></thead><tbody>
  ${rows.map(t=>{const r=rMult(t);return `<tr class="click" ${o.preview?'':`data-trade="${t.id}" tabindex="0"`}>${full?`<td class="ck hide-sm"><input type="checkbox" data-sel="${t.id}" ${selected.has(t.id)?'checked':''} aria-label="Select trade"></td>`:''}<td>${esc(fmtDate(t.date))}</td><td><div class="ttl">${esc(t.title||t.symbol||'Trade')}</div>${t.title&&t.symbol?`<div class="sub">${esc(t.symbol)}</div>`:''}</td>${full?`<td class="hide-sm mut">${esc(modelsOf(t).join(', ')||'–')}</td>`:''}${opt.map(([k])=>`<td class="hide-sm mut">${k==='rating'?(t.rating?t.rating+'/5':'–'):esc(t[k]||'–')}</td>`).join('')}${cf.map(x=>`<td class="hide-sm mut">${esc((t.custom||{})[x.key]??'')}</td>`).join('')}${showR&&full?`<td class="r hide-sm ${r==null?'mut':cls(r)}">${r==null?'–':r.toFixed(2)+'R'}</td>`:''}<td class="r res ${o.preview&&t.outcome?({win:'pos',loss:'neg',be:'mut',missed:'mut'})[t.outcome]:resultCls(t)}">${esc(o.preview&&t.outcome?({win:'Win',loss:'Loss',be:'Breakeven',missed:'Missed'})[t.outcome]:resultText(t))}</td></tr>`}).join('')}</tbody></table></div>`}
function compareTable(rows,label){const mx=Math.max(1e-9,...rows.map(r=>Math.abs(r.net)));return `<div class="tblwrap"><table class="tbl cmp"><thead><tr><th>${esc(label)}</th><th class="bartd"><span class="sr">Result bar</span></th><th class="r hide-sm">Trades</th><th class="r">Win %</th><th class="r">Net</th></tr></thead><tbody>${rows.map(r=>`<tr><td class="ttl" title="${esc(r.k)}">${esc(r.k==='(empty)'?'Not set':r.k)}</td><td class="bartd"><div class="dbar"><i style="left:${r.net>=0?50:50-Math.abs(r.net)/mx*50}%;width:${Math.abs(r.net)/mx*50}%;background:var(--${r.net>=0?'win':'loss'})"></i></div></td><td class="r mut hide-sm">${r.n}</td><td class="r">${(r.win*100).toFixed(0)}%</td><td class="r res ${cls(r.net)}">${esc(sg(r.net,0))}</td></tr>`).join('')}</tbody></table></div>`}

/* ---------- overview ---------- */
function rulesData(tr){const f=S.settings.customFields.find(c=>/rule/i.test(c.label));
  if(f){const rows=group(tr,'cf:'+f.key).filter(r=>r.k!=='(empty)');if(rows.length>=2){rows.sort((a,b)=>b.win-a.win);const bad=rows.find(r=>/viol|brok|break/i.test(r.k));let takeaway='';
      if(bad){const all=tr.filter(t=>outcome(t)==='loss').length,inBad=tr.filter(t=>outcome(t)==='loss'&&groupKeys(t,'cf:'+f.key).includes(bad.k)).length;if(all)takeaway=(inBad===all?(all===1?'Your only loss':`All ${all} losses`):`${inBad} of your ${all} losses`)+` came from trades marked ${bad.k}.`}
      return{title:f.label,rows,takeaway,bad,badTrades:bad?tr.filter(t=>groupKeys(t,'cf:'+f.key).includes(bad.k)):[],costWord:'Breaking your rules has'}}}
  const m=tr.filter(t=>(t.mistakes||[]).length),c=tr.filter(t=>!(t.mistakes||[]).length);if(m.length&&c.length){const a=stats(c),b=stats(m);return{title:'Mistakes',rows:[{k:'Clean trades',n:a.n,win:a.winRate,net:a.total},{k:'With a mistake',n:b.n,win:b.winRate,net:b.total}],takeaway:'',bad:{k:'With a mistake',net:b.total},badTrades:m,costWord:'Mistakes have'}}return null}
function costBlock(d,tr,st){if(!d.bad||!d.badTrades.length)return'';const net=stats(d.badTrades).total,cost=-net,now=todayStr().slice(0,7),rows=group(d.badTrades,'month'),here=rows.find(r=>r.k===now),nowTr=tr.filter(t=>t.date.startsWith(now));
  const mon=k=>MONTHS[+k.slice(5)-1].slice(0,3)+(k.slice(0,4)===now.slice(0,4)?'':' '+k.slice(0,4)),past=rows.filter(r=>r.k!==now).slice(-3).reverse();
  const line=cost>0?`${d.costWord} cost you ${money(cost)}. Without those trades you would be at ${sg(st.total+cost)} instead of ${sg(st.total)}.`:`${d.bad.k==='With a mistake'?'Trades with a mistake':'Trades marked '+d.bad.k} are at ${sg(net)} so far.`;
  return `<p class="takeaway" style="font-weight:600">${esc(line)}</p><dl class="stats" style="margin-top:20px">${stat('This month',here?sg(here.net):nowTr.length?'None broken':'No trades',here?cls(here.net):'')}${past.map(r=>stat(mon(r.k),sg(r.net),cls(r.net))).join('')}</dl>`}
function vOverview(){if(!S.trades.length)return emptyState();const tr=filtered(),st=stats(tr);let h=`<div class="head"><span class="sr">Overview</span>${viewBar()}</div>`;
  const miss=tr.filter(missing).length;
  for(const w of S.settings.widgets){if(!w.on)continue;
    if(w.id==='summary'){const k=S.settings.kpis,ks=[];
      if(k.winrate)ks.push(stat('Win rate',(st.winRate*100).toFixed(0)+'%'));if(k.pf)ks.push(stat('Profit factor',fmtPF(st.pf)));if(k.expectancy)ks.push(stat('Per trade',sg(st.expectancy)));if(k.maxdd)ks.push(stat('Max drawdown',money(-st.maxDD)));if(k.ratio)ks.push(stat('Avg win / loss',isFinite(st.ratio)?st.ratio.toFixed(2):'∞'));if(k.streak)ks.push(stat('Current streak',plural(Math.abs(st.tradeStreak),'trade')));if(k.trades)ks.push(stat('Trades',String(st.n)));if(k.avgday)ks.push(stat('Avg day',sg(st.avgDay)));
      h+=`<section><h1 class="total ${st.total<0?'neg':''}">${esc(sg(st.total))}</h1><p class="totsub">${plural(st.n,'trade')}, ${st.wins} won, ${st.losses} lost. ${esc(rangeLabel()[0].toUpperCase()+rangeLabel().slice(1))}.</p>${lineChart(st.curve)}${ks.length?`<dl class="stats">${ks.join('')}</dl>`:''}${miss?`<div class="note-line"><span>${plural(miss,'trade')} ${miss===1?'is':'are'} missing a result, so ${miss===1?'it counts':'they count'} as zero here.</span><button class="link" data-act="reviewMissing">Review ${miss===1?'it':'them'}</button></div>`:''}${(()=>{const ms=filtered(t=>t.outcome==='missed',true);if(!ms.length)return'';return `<div class="note-line" ${miss?'style="margin-top:0;border-top:0;padding-top:4px"':''}><span>${plural(ms.length,'missed trade')}. ${ms.length===1?'It is':'They are'} not counted in your results.</span></div>`})()}</section>`}
    else if(w.id==='past'){const q=currentQuote();if(q)h+=`<section class="panel-sec" id="past"><div class="sh"><span>From your past</span><button class="tb" data-past aria-label="Show another" title="Show another">${ic('shuffle',16)}</button></div><div class="past-body">${pastBody(q)}</div></section>`}
    else if(w.id==='rules'){const d=rulesData(tr);if(d)h+=`<section class="panel-sec"><h2>${esc(d.title)}</h2><div class="rules">${d.rows.slice(0,3).map(r=>`<div class="rule"><h3>${esc(r.k)}</h3><div class="big ${cls(r.net)}">${esc(sg(r.net))}</div><p>${(r.win*100).toFixed(0)}% wins, ${plural(r.n,'trade')}</p></div>`).join('')}</div>${costBlock(d,tr,st)}${d.takeaway?`<p class="takeaway">${esc(d.takeaway)}</p>`:''}</section>`}
    else if(w.id==='calendar')h+=`<section>${calendar(tr,true)}</section>`;
    else if(w.id==='recent')h+=`<section><div class="sh"><span>Recent trades</span><button class="link" data-go="trades" style="font-size:14px;font-weight:500">All trades</button></div>${tradeTable(tr.slice(-5).reverse())}</section>`;
    else if(w.id==='dailybars')h+=`<section><h2>By day</h2>${barChart(st.days.slice(-40).map(d=>({l:fmtDate(d.date),short:fmtDate(d.date).replace(/,.*/,''),v:d.net})))}</section>`;
    else if(w.id==='strategy')h+=`<section><h2>By strategy</h2>${compareTable(group(tr,'strategy'),'Strategy')}</section>`;
    else if(w.id==='score')h+=scoreSection(st);}
  return h}
function scoreSection(st){const sc=score(st);return `<section><h2>${esc(S.settings.score.name)}</h2><div class="scorerow"><div><div class="scorenum">${sc.total.toFixed(0)}</div><p class="hint" style="margin-top:8px">Out of 100, measured against your own targets. Change them in Settings.</p></div>${radar(sc.parts)}</div></section>`}

/* ---------- calendar ---------- */
function calendar(trades,week){const ref=calMonth||(trades.length?pd(trades[trades.length-1].date):new Date());calMonth=new Date(ref.getFullYear(),ref.getMonth(),1);const y=calMonth.getFullYear(),m=calMonth.getMonth(),dm=new Map(byDay(trades).map(d=>[d.date,d])),ms=stats(trades.filter(t=>t.date.startsWith(y+'-'+pad(m+1))));
  const cv=v=>unitOf()==='points'?(v<0?'-':'')+Math.round(Math.abs(v)*10)/10:moneyK(v);const noRes=ds=>trades.filter(t=>t.date===ds).every(missing);const mt=trades.filter(t=>t.date.startsWith(y+'-'+pad(m+1)));
  let h=`<div class="calhead"><b>${MONTHS[m]} ${y}</b><button class="tb" data-act="calPrev" aria-label="Previous month">${ic('left',16)}</button><button class="tb" data-act="calNext" aria-label="Next month">${ic('right',16)}</button>${ms.n?`<span class="sum">${mt.every(missing)?plural(ms.n,'trade'):`<b class="${cls(ms.total)}" style="font-size:14px;margin:0">${esc(sg(ms.total))}</b> in ${plural(ms.days.length,'day')}`}</span>`:''}</div><div class="cal ${week?'':'noweek'}">`;
  h+=WD.map(d=>`<div class="hd">${d}</div>`).join('')+(week?'<div class="hd wkh">Week</div>':'');const first=new Date(y,m,1),start=new Date(y,m,1-first.getDay()),td=todayStr();
  for(let r=0;r<6;r++){const rs=new Date(start);rs.setDate(start.getDate()+r*7);if(r>0&&rs.getMonth()!==m)break;let wn=0,wd=0,wr=0;
    for(let c=0;c<7;c++){const d=new Date(start);d.setDate(start.getDate()+r*7+c);const ds=ymd(d),dd=dm.get(ds);if(d.getMonth()!==m){h+='<div class="day out" aria-hidden="true"></div>';continue}if(dd){wn+=dd.net;wd++;if(!noRes(ds))wr++}
      h+=`<button class="day ${dd?(dd.net>0?'g':dd.net<0?'r':'b'):''} ${ds===td?'today':''} ${view==='calendar'&&ds===daySel?'sel':''}" data-day="${ds}" aria-label="${esc(fmtLong(ds))}${dd?', '+(noRes(ds)?'no result':esc(sg(dd.net)))+', '+plural(dd.n,'trade'):''}"><span class="dn">${d.getDate()}${S.notes[ds]?'<i title="Has a note"></i>':''}</span>${dd?`<span class="dp ${noRes(ds)?'mut':cls(dd.net)}">${noRes(ds)?'–':esc(cv(dd.net))}</span><span class="dm">${plural(dd.n,'trade')}</span>`:''}</button>`}
    if(week)h+=`<div class="wk">${wd?`<b class="${wr?cls(wn):'mut'}">${wr?esc(cv(wn)):'–'}</b>${plural(wd,'day')}`:''}</div>`}
  return h+'</div>'}
function vCalendar(){if(!S.trades.length&&!Object.keys(S.notes).length)return head('Calendar')+emptyState('Nothing here yet','Days fill in as you add trades. Click any day to write a note.');const tr=filtered();
  const tabs=`<div class="seg" role="group" aria-label="Calendar view"><button data-caltab="month" class="${calTab==='month'?'on':''}" aria-pressed="${calTab==='month'}">Month</button><button data-caltab="notes" class="${calTab==='notes'?'on':''}" aria-pressed="${calTab==='notes'}">Notes</button></div>`;
  if(calTab==='notes'){const ds=Object.keys(S.notes).filter(k=>S.notes[k]&&S.notes[k].trim()).sort().reverse();return head('Calendar',tabs)+(ds.length?`<div class="notes-list" style="max-width:680px">${ds.map(d=>`<button class="mini" data-day="${d}"><span>${esc(fmtLong(d))}${sameYear(d)?'':', '+d.slice(0,4)}</span><p>${esc(S.notes[d].slice(0,240))}</p></button>`).join('')}</div>`:'<div class="nodata">Pick a day in Month to write your first note.</div>')}
  const c=calendar(tr,false);const ym=calMonth.getFullYear()+'-'+pad(calMonth.getMonth()+1);if(!daySel||!daySel.startsWith(ym)){const inM=byDay(tr).filter(d=>d.date.startsWith(ym));daySel=inM.length?inM[inM.length-1].date:(todayStr().startsWith(ym)?todayStr():ym+'-01');return vCalendar()}
  const ts=sortTrades(tr.filter(t=>t.date===daySel)),st=stats(ts);
  return head('Calendar',`<div class="row" style="margin-left:auto">${tabs}${viewBar()}</div>`)+`<div class="calgrid"><div>${c}</div><aside class="daypanel" aria-label="Selected day"><h2>${esc(fmtLong(daySel))}</h2>${ts.length?`<div class="res ${ts.every(missing)?'mut':cls(st.total)}">${ts.every(missing)?'–':esc(sg(st.total))}</div>${ts.map(t=>`<button class="mini" data-trade="${t.id}"><span>${esc(t.title||t.symbol||'Trade')}</span><b class="${resultCls(t)}">${esc(resultText(t))}</b></button>`).join('')}`:'<p class="mut" style="margin:4px 0 0">No trades this day.</p>'}
  <label class="f">Notes<textarea rows="7" data-note="${daySel}" placeholder="Plan, bias, levels, how you felt.">${esc(S.notes[daySel]||'')}</textarea></label><button class="btn" style="width:100%;margin-top:12px" data-act="addTradeDay" data-d="${daySel}">Add a trade this day</button></aside></div>`}

/* ---------- trades ---------- */
let sortKey='date',sortDir=-1,search='',selected=new Set();
function vTrades(){if(!S.trades.length)return head('Trades')+emptyState();let tr=filtered(t=>(!onlyMissing||missing(t))&&(!search||JSON.stringify([t.title,t.symbol,t.strategy,t.notes,t.tags,t.mistakes,t.custom]).toLowerCase().includes(search.toLowerCase())),true);
  const key={net:t=>net(t),date:t=>t.date+(t.time||'')}[sortKey]||(t=>String(t[sortKey]||'').toLowerCase());tr.sort((a,b)=>{const x=key(a),y=key(b);return (x>y?1:x<y?-1:0)*sortDir});const st=stats(tr.filter(t=>t.outcome!=='missed')),miss=filtered(missing).length;
  return head('Trades',viewBar())+`<div class="tools"><div class="search">${ic('search',18)}<input type="search" placeholder="Search" value="${esc(search)}" data-act="search" aria-label="Search trades and notes"></div>${miss||onlyMissing?`<button class="chiptog ${onlyMissing?'on':''}" data-act="toggleMissing" aria-pressed="${onlyMissing}">Missing a result (${miss})</button>`:''}<span class="mut num">${plural(st.n,'trade')}, <b class="${cls(st.total)}" style="font-weight:600">${esc(sg(st.total))}</b></span></div>${tradeTable(tr,{full:true,empty:onlyMissing?'Nothing is missing. Every trade has a result.':'No trades match.'})}${selected.size?`<div class="bulk" role="region" aria-label="Selected trades"><span>${selected.size} selected</span><button class="btn ghost sm" data-act="bulkStrategy">Set strategy</button><button class="btn danger sm" data-act="bulkDelete">Delete</button><button class="tb" data-act="selClear" aria-label="Clear selection">${ic('x',16)}</button></div>`:''}`}

/* ---------- insights ---------- */
let repBy=null,wiExclude=new Set(),wiNoMistakes=false;
function vInsights(){if(!S.trades.length)return head('Insights')+emptyState();const tr=filtered(),st=stats(tr);const rule=S.settings.customFields.find(c=>/rule/i.test(c.label));const opts=[...(rule?[['cf:'+rule.key,rule.label]]:[]),['strategy','Strategy'],['symbol','Symbol'],['weekday','Day of week'],['hour','Hour of entry'],['mistake','Mistake'],['rating','Rating'],['month','Month'],...S.settings.customFields.filter(c=>c!==rule).map(c=>['cf:'+c.key,c.label])];
  if(!repBy||!opts.find(o=>o[0]===repBy))repBy=opts[0][0];const rows=group(tr,repBy),lab=opts.find(o=>o[0]===repBy)[1];const strats=[...new Set(tr.flatMap(modelKeys))],wi=stats(tr.filter(t=>!modelKeys(t).some(x=>wiExclude.has(x))&&!(wiNoMistakes&&t.mistakes&&t.mistakes.length))),diff=wi.total-st.total,months=group(tr,'month'),rs=tr.map(rMult).filter(v=>v!=null);
  const kv=[['Best day',st.best?fmtDate(st.best.date)+', '+sg(st.best.net):'–'],['Worst day',st.worst?fmtDate(st.worst.date)+', '+sg(st.worst.net):'–'],['Largest win',sg(st.biggestW)],['Largest loss',money(st.biggestL)],['Green / red days',st.green+' / '+st.red],['Trades per day',st.days.length?(st.n/st.days.length).toFixed(1):'–'],['Max drawdown',money(-st.maxDD)],['Recovery factor',fmtPF(st.recovery)],['Best / worst streak',st.maxWinStreak+' wins / '+st.maxLossStreak+' losses'],['Average R',rs.length?(rs.reduce((a,b)=>a+b,0)/rs.length).toFixed(2)+'R':'–']];
  return head('Insights',viewBar())+`<section><div class="sh"><label style="display:flex;align-items:center;gap:6px">Compare by<select class="quiet" style="font-size:15px;font-weight:600" data-act="repBy">${opts.map(([v,l])=>`<option value="${esc(v)}" ${repBy===v?'selected':''}>${esc(l)}</option>`).join('')}</select></label></div>${compareTable(rows,lab)}</section>
  ${months.length>1?`<section><h2>By month</h2>${barChart(months.map(r=>({l:r.k,short:MONTHS[+r.k.slice(5)-1].slice(0,3),v:r.net})))}</section>`:''}
  <section><h2>Key numbers</h2><dl class="kv">${kv.map(([a,b])=>`<div><dt>${esc(a)}</dt><dd>${esc(b)}</dd></div>`).join('')}</dl></section>
  ${scoreSection(st)}
  <section>${det('whatif','What if',`<p class="hint">Untick something to see your results without it.</p><div class="checks">${strats.map(s=>`<label><input type="checkbox" data-wi="${esc(s)}" ${wiExclude.has(s)?'':'checked'}>${esc(s)}</label>`).join('')}<label><input type="checkbox" data-act="wiNoMistakes" ${wiNoMistakes?'checked':''}>Drop trades with a mistake</label></div><dl class="stats" style="margin-top:8px">${stat('Actual',sg(st.total,0),cls(st.total))}${stat('What if',sg(wi.total,0),cls(wi.total))}${stat('Difference',sg(diff,0),cls(diff))}${stat('Win rate',(wi.winRate*100).toFixed(0)+'%')}</dl>`,'See results without a strategy or mistake')}</section>`}
function det(id,title,body,small=''){return `<details class="more" data-sec="${id}" ${openSec.has(id)?'open':''}><summary>${esc(title)}${small?`<small>${esc(small)}</small>`:''}${ic('down',16)}</summary><div class="in">${body}</div></details>`}

/* ---------- playbook ---------- */
let stratSel=0;
function vPlaybook(){const ss=S.settings.strategies;if(!ss.length)return head('Playbook',`<button class="btn pri" data-act="addStrategy">Add a setup</button>`)+`<div class="nodata">Write down each setup you trade and its rules. Vanta shows whether it pays.</div>`;if(stratSel>=ss.length)stratSel=0;const s=ss[stratSel],tr=filtered();const ts=tr.filter(t=>modelsOf(t).includes(s.name)),st=stats(ts);const narrow=window.innerWidth<=900,w=contentW()-(narrow?0:288);
  return head('Playbook',`<div class="row" style="margin-left:auto">${viewBar()}<button class="btn" data-act="addStrategy">${ic('plus',16)}Add a setup</button></div>`)+`<div class="split"><div class="list">${ss.map((x,i)=>{const a=stats(tr.filter(t=>modelsOf(t).includes(x.name)));return `<button class="${i===stratSel?'on':''}" aria-current="${i===stratSel}" data-strat="${i}">${esc(x.name)}<small>${plural(a.n,'trade')}${a.n?`, <span class="${cls(a.total)}">${esc(sg(a.total,0))}</span>`:''}</small></button>`}).join('')}</div>
  <div><input class="bigtitle" data-sfield="name" value="${esc(s.name)}" aria-label="Setup name"><div class="inline-stats">${st.n?`<span><b>${st.n}</b> trades</span><span><b>${(st.winRate*100).toFixed(0)}%</b> wins</span><span>Profit factor <b>${fmtPF(st.pf)}</b></span><span class="${cls(st.total)}" style="font-weight:600">${esc(sg(st.total))}</span>`:'<span>No trades with this setup in this range.</span>'}</div>
  <label class="f">Rules<textarea rows="8" data-sfield="rules" placeholder="Entry, stop, target, and what makes this setup invalid.">${esc(s.rules||'')}</textarea></label>${st.n?`<div style="margin-top:32px">${lineChart(st.curve,{w,h:200})}</div>`:''}<button class="btn danger sm" style="margin-top:24px" data-act="delStrategy">Delete this setup</button></div></div>`}

/* ---------- import ---------- */
function importPlan(){const have=new Set(S.trades.map(dupKey));let ok=0,dup=0,bad=0,prev=[];for(const r of imp.rows.slice(1)){const t=rowToTrade(r,imp.map,S.settings.dateFormat,imp.strat);if(!t||t.skip){bad++;continue}const k=dupKey(t);if(have.has(k)){dup++;continue}have.add(k);ok++;if(prev.length<5)prev.push(t)}return{ok,dup,bad,prev}}
function vImport(){let h=head('Import');if(!imp)return h+`<div class="drop" id="drop">${ic('import',28)}<h2>Drop your trades here</h2><p>A CSV from your broker or prop firm, a Notion export, or a Vanta backup.</p><div class="row" style="justify-content:center"><button class="btn pri" data-act="pickFile">Choose a file</button><button class="btn" data-act="pickFolder">Choose a folder</button></div><input type="file" id="fileIn" accept=".csv,text/csv,.zip,application/zip,.json,application/json" data-act="anyFile"><input type="file" id="dirIn" webkitdirectory multiple data-act="notionDir"></div><p class="help">From Notion, export the database as Markdown &amp; CSV. If your Mac unzipped it into a folder, choose or drop that whole folder. Notes and screenshots come with it. Trades you already imported are skipped.</p>`;
  const hdr=imp.rows[0],map=imp.map,pl=importPlan(),matched=IMPORT_FIELDS.filter(([k])=>map[k]!==''&&map[k]!=null).length,noDate=(map.date===''||map.date==null)&&(map.buyTime===''||map.buyTime==null);
  h+=`<div class="sh" style="margin-bottom:4px"><span>${esc(imp.name)}</span></div><p class="hint" style="margin-bottom:24px">${plural(pl.ok,'new trade')}${pl.dup?`, ${plural(pl.dup,'duplicate')} skipped`:''}${pl.bad?`, ${pl.bad} ${pl.bad===1?'row':'rows'} without a usable date or result skipped`:''}${imp.notion?`. ${plural(imp.notion.pages.length,'page')} and ${plural(imp.notion.imgCount,'screenshot')} found`:''}.</p>${noDate?'<p class="warn-line" style="margin-bottom:16px">Vanta could not find a date column. Choose it under Column matching.</p>':''}${pl.prev.length?tradeTable(pl.prev,{preview:true}):'<div class="nodata">No new trades to import.</div>'}
  <div class="row" style="margin:24px 0 40px"><button class="btn pri" data-act="doImport" ${pl.ok?'':'disabled'}>Import ${plural(pl.ok,'trade')}</button><button class="btn ghost" data-act="cancelImport">Cancel</button></div>`;
  if(noDate)openSec.add('mapping');
  h+=det('mapping','Column matching',`<div class="fg">${IMPORT_FIELDS.map(([k,l])=>`<label class="f">${esc(l)}<select data-map="${k}"><option value="">Not used</option>${hdr.map((c,i)=>`<option value="${i}" ${String(map[k])===String(i)?'selected':''}>${esc(c)}</option>`).join('')}</select></label>`).join('')}<label class="f">Date format<select data-act="dateFmt"><option value="MDY" ${S.settings.dateFormat==='MDY'?'selected':''}>MM/DD/YYYY</option><option value="DMY" ${S.settings.dateFormat==='DMY'?'selected':''}>DD/MM/YYYY</option></select></label><label class="f">Other columns<select data-act="impExtra"><option value="1" ${imp.extra!==false?'selected':''}>Keep as fields</option><option value="0" ${imp.extra===false?'selected':''}>Ignore</option></select></label><label class="f">Assign a strategy<select data-act="impStrat"><option value="">From the file</option>${S.settings.strategies.map(s=>`<option ${imp.strat===s.name?'selected':''}>${esc(s.name)}</option>`).join('')}</select></label></div>`,`${matched} columns matched`);
  return h}
async function handleFile(f){const n=f.name.toLowerCase();try{
    if(n.endsWith('.zip'))return await importNotionZip(f);
    if(n.endsWith('.json')){let d;try{d=JSON.parse(await f.text())}catch(e){d=null}if(!d||!d.trades)return toast('That file is not a Vanta backup.');if(!await ask({title:'Restore this backup?',body:`It has ${plural(d.trades.length,'trade')} and replaces the journal open now.`,ok:'Replace journal',danger:true}))return;S=mergeDefaults(d);await migrateImages();await persist();applyTheme();toast('Backup restored');return go('overview')}
    const rows=parseCSV(await f.text());if(rows.length<2)return toast('That file has no rows to import.');setupMapping(f.name,rows);render()
  }catch(err){console.error(err);toast(err.message||'That file could not be read.')}}
async function dropItems(dt){const items=[...dt.items].map(i=>i.webkitGetAsEntry&&i.webkitGetAsEntry()).filter(Boolean);if(items.some(e=>e.isDirectory)){const files={};
    const walk=async(en,base)=>{if(en.isFile){const f=await new Promise((a,b)=>en.file(a,b));if(f.name!=='.DS_Store')files[(base+f.name).normalize('NFC')]={async:t=>t==='string'?f.text():Promise.resolve(f)}}else{const rd=en.createReader();let batch;do{batch=await new Promise((a,b)=>rd.readEntries(a,b));for(const c of batch)await walk(c,base+en.name+'/')}while(batch.length)}};
    for(const e of items)await walk(e,'');return importNotionFiles(files).catch(err=>toast(err.message||'That folder could not be read.'))}
  if(dt.files[0])return handleFile(dt.files[0])}

/* ---------- settings ---------- */
const WIDGET_NAMES={summary:'Running total',past:'From your past',rules:'Rules and mistakes',calendar:'Calendar',recent:'Recent trades',dailybars:'Results by day',strategy:'Results by strategy',score:'Score'};
const KPI_NAMES={winrate:'Win rate',pf:'Profit factor',expectancy:'Per trade',maxdd:'Max drawdown',ratio:'Avg win / loss',streak:'Current streak',trades:'Trade count',avgday:'Avg day'};
function vSettings(){const s=S.settings,sc=s.score,folder=nativeInfo?nativeInfo.path:'';
  return `<div class="settings">`+head('Settings')+
  det('appearance','Appearance',`<div class="fg" style="grid-template-columns:minmax(0,1fr) auto"><label class="f">Theme<select data-set="theme"><option value="dark" ${s.theme==='dark'?'selected':''}>Dark</option><option value="light" ${s.theme==='light'?'selected':''}>Light</option><option value="auto" ${s.theme==='auto'?'selected':''}>Match my Mac</option></select></label><label class="f">Accent<input type="color" data-set="accent" value="${esc(s.accent||(document.documentElement.dataset.theme==='light'?'#1D1D1F':'#F5F5F7'))}"></label></div>${s.accent?'<button class="link" style="align-self:flex-start;font-size:14px" data-act="resetAccent">Use the default black and white</button>':''}`)+
  det('account','Account',`<div class="fg" style="grid-template-columns:repeat(3,minmax(0,1fr))"><label class="f">Currency<input data-set="currency" value="${esc(s.currency)}"></label><label class="f">Starting balance<input type="number" data-set="startBalance" value="${s.startBalance}"></label><label class="f">Fee per contract<input type="number" step="0.01" data-set="feePerContract" value="${s.feePerContract}"></label></div><label class="f">Point values, one per line<textarea rows="5" data-act="pv">${Object.entries(s.pointValues).map(([k,v])=>k+'='+v).join('\n')}</textarea></label>`)+
  det('overview','Overview',`<div>${s.widgets.map((w,i)=>`<div class="cfg"><input type="checkbox" data-wtog="${i}" ${w.on?'checked':''} aria-label="Show ${esc(WIDGET_NAMES[w.id])}"><span>${esc(WIDGET_NAMES[w.id])}</span><button class="tb" data-wup="${i}" ${i?'':'disabled'} aria-label="Move ${esc(WIDGET_NAMES[w.id])} up">${ic('up',16)}</button><button class="tb" data-wdn="${i}" ${i<s.widgets.length-1?'':'disabled'} aria-label="Move ${esc(WIDGET_NAMES[w.id])} down">${ic('down',16)}</button></div>`).join('')}</div><p class="hint">Numbers under the running total</p><div class="checks">${Object.keys(KPI_NAMES).map(k=>`<label><input type="checkbox" data-kpi="${k}" ${s.kpis[k]?'checked':''}>${KPI_NAMES[k]}</label>`).join('')}</div>`,'Choose what shows and in what order')+
  det('list','Trade list',`<p class="hint">Extra columns to show</p><div class="checks">${[['time','Time'],['qty','Qty'],['rating','Rating'],...s.customFields.map(c=>['cf:'+c.key,c.label])].map(([k,l])=>`<label><input type="checkbox" data-col="${esc(k)}" ${s.cols[k]?'checked':''}>${esc(l)}</label>`).join('')}</div>`)+
  det('fields','Trade fields',`<label class="f">Mistakes, separated by commas<input data-act="mistakes" value="${esc(s.mistakes.join(', '))}"></label><div>${s.customFields.map((c,i)=>`<div class="cfg"><span>${esc(c.label)}<small>${esc((c.type==='select'||c.type==='multi')?(c.options||'Dropdown'):c.type==='number'?'Number':'Text')}</small></span><button class="btn danger sm" data-delcf="${i}">Remove</button></div>`).join('')}</div><div class="fg"><label class="f">New field<input id="cfLabel" placeholder="Session"></label><label class="f">Type<select id="cfType"><option value="select">Dropdown</option><option value="text">Text</option><option value="number">Number</option></select></label><label class="f s2">Choices<input id="cfOpts" placeholder="London, NY AM, NY PM"></label></div><button class="btn sm" style="align-self:flex-start" data-act="addCF">Add field</button>`)+
  det('score','Score formula',`<label class="f">Name<input data-score="name" value="${esc(sc.name)}"></label><p class="hint">Each category scores up to 100 against your target. A weight of 0 ignores it.</p><table class="cfg-t"><thead><tr><th>Category</th><th>Target</th><th>Weight</th></tr></thead><tbody>${[['win','Win % at least',1],['pf','Profit factor at least',1],['wl','Avg win / loss at least',1],['dd','Drawdown at most, % of balance',1],['rec','Recovery factor at least',1],['cons','Green days',0]].map(([k,l,t])=>`<tr><td>${esc(l)}</td><td>${t?`<input type="number" step="0.1" data-target="${k}" value="${sc.targets[k]}" aria-label="${esc(l)} target">`:'<span class="mut">Auto</span>'}</td><td><input type="number" step="0.5" data-weight="${k}" value="${sc.weights[k]}" aria-label="${esc(l)} weight"></td></tr>`).join('')}</tbody></table>`)+
  vNotion()+det('data','Your data',`<p class="hint">${plural(S.trades.length,'trade')} and ${plural(Object.keys(S.notes).filter(k=>S.notes[k]).length,'note')}. Every change saves automatically, and Vanta keeps your last 14 daily backups.</p>${folder?`<p class="hint" style="overflow-wrap:anywhere;color:var(--text)">${esc(folder)}</p>`:''}<div class="row"><button class="btn" data-act="connectFolder">Change folder</button><button class="btn" data-act="revealData">Show in Finder</button><button class="btn" data-act="exportJSON">Export backup</button><button class="btn" data-act="exportCSV">Export CSV</button><button class="btn" data-go="import">Import</button></div><div class="row" style="margin-top:8px"><button class="btn danger sm" data-act="clearAll">Delete all trades</button></div>`,folder?'':'')+`</div>`}
function vMore(){return head('More')+`<div class="list" style="margin:0">${[['insights','Insights'],['playbook','Playbook'],['import','Import'],['settings','Settings']].map(([v,l])=>`<button data-go="${v}" style="display:flex;align-items:center;gap:12px;padding:14px 12px">${ic(v)}${l}</button>`).join('')}${S.trades.some(missing)?`<button data-act="reviewAll" style="display:flex;align-items:center;gap:12px;padding:14px 12px">${ic('check')}Review them (${S.trades.filter(missing).length})</button>`:''}</div>`}

/* ---------- trade sheet ---------- */
let editing=null,editOrig='',lastFocus=null;const sheetOpen=new Set();
function openTrade(id,preset={}){const src=id&&S.trades.find(x=>x.id===id);if(id&&!src)return;const t=src?JSON.parse(JSON.stringify(src)):Object.assign({id:uid(),date:todayStr(),time:'',symbol:'NQ',side:'',qty:1,entry:'',exit:'',pnl:'',fees:'',strategy:'',tags:[],mistakes:[],notes:'',images:[],rating:0,risk:'',custom:{},_new:true},preset);
  editing=t;editOrig=JSON.stringify(t);lastFocus=document.activeElement&&document.activeElement.dataset?document.activeElement.dataset.trade||null:null;sheetOpen.clear();if((t.mistakes||[]).length||t.rating||Object.values(t.custom||{}).some(Boolean))sheetOpen.add('review');
  const r=$('#modalRoot');r.innerHTML=`<div class="scrim" data-act="closeBg"></div><div class="sheet" role="dialog" aria-modal="true" aria-label="${t._new?'Add trade':'Edit trade'}"></div>`;document.body.classList.add('lock');renderSheet();void r.querySelector('.sheet').offsetWidth;r.querySelector('.scrim').classList.add('open');r.querySelector('.sheet').classList.add('open');(r.querySelector(t._new?'[data-t="symbol"]':'[data-act="closeModal"]')||r.querySelector('.sheet')).focus({preventScroll:true})}
const sel=(k,l,opts,v)=>`<label class="f">${esc(l)}<select data-t="${k}">${opts.map(([a,b])=>`<option value="${esc(a)}" ${String(v??'')===String(a)?'selected':''}>${esc(b)}</option>`).join('')}</select></label>`;
const seg=(k,l,opts,v)=>`<div class="f s4" style="display:flex;flex-direction:column;gap:6px;font-size:13px;color:var(--muted)">${esc(l)}<div class="seg wide" role="group" aria-label="${esc(l)}">${opts.map(([a,b])=>`<button type="button" data-segt="${k}" data-v="${a}" class="${String(v||'')===a?'on':''}" aria-pressed="${String(v||'')===a}">${b}</button>`).join('')}</div></div>`;
const inp=(k,l,v,o={})=>`<label class="f ${o.c||''}">${esc(l)}<input ${o.type?`type="${o.type}"`:''} ${o.type==='number'?'step="any"':''} data-t="${k}" value="${esc(v??'')}" ${o.ph?`placeholder="${esc(o.ph)}"`:''} ${o.list?`list="${o.list}"`:''}></label>`;
function sheetResult(t){const r=rMult(t),oc=t.outcome?({win:'Win',loss:'Loss',be:'Breakeven',missed:'Missed'})[t.outcome]:'';if(t.outcome==='missed')return 'Missed, so it does not count in your results.';if(missing(t)){const need=unitOf()==='R'?(t.outcome?'Add the R:R to count this trade':'Choose an outcome to count this trade'):unitOf()==='points'?'Add points to count this trade':'Add a P&L to count this trade';return (oc?oc+'. ':'')+need+'.'}return `<b class="${resultCls(t)}">${esc(resultText(t))}</b>${unitOf()!=='R'&&r!=null?' · '+r.toFixed(2)+'R':''}${oc?' · '+oc:''}`}
function renderSheet(){const t=editing,s=S.settings,el=$('.sheet');if(!el)return;const y=el.querySelector('.sheet-body')?.scrollTop||0;
  el.innerHTML=`<div class="sheet-top"><input data-t="title" value="${esc(t.title||'')}" placeholder="${t._new?'New trade':'Untitled trade'}" aria-label="Trade name"><button class="tb" data-act="closeModal" aria-label="Close">${ic('x')}</button></div>
  <div class="sheet-body"><div class="sheet-res" id="sheetRes" aria-live="polite">${sheetResult(t)}</div>${t.notionId?`<p class="hint" style="margin-top:-12px">From Notion. Edit it there so your changes stay.${t.notionUrl?' <button class="link" data-act="openNotion">Open in Notion</button>':''}</p>`:''}
  <div class="shots">${(t.images||[]).map((src,i)=>`<div class="shot"><img src="${src}" data-zoom="${i}" alt="${esc((t.imgLabels||[])[i]||'Trade')} screenshot ${i+1}" tabindex="0" role="button">${(t.imgLabels||[])[i]?`<span class="shotlab">${esc(t.imgLabels[i])}</span>`:''}<button data-delimg="${i}" aria-label="Remove screenshot ${i+1}">${ic('x',14)}</button></div>`).join('')}<button class="addshot" data-act="pickImgs">${ic('image')}<span>Add or paste a screenshot</span></button><input type="file" id="imgIn" accept="image/*" multiple data-act="imgs"></div>
  <label class="f">Notes<textarea rows="${t.notes&&t.notes.length>200?9:4}" data-t="notes" placeholder="Why you took it, how you managed it, what you would change.">${esc(t.notes||'')}</textarea></label>
  <div class="fg">${inp('date','Date',t.date,{type:'date',c:'s2'})}${inp('time','Time',t.time,{type:'time'})}${inp('symbol','Symbol',t.symbol,{list:'symList'})}${seg('outcome','Outcome',[['win','Win'],['loss','Loss'],['be','BE'],['missed','Missed'],['','Auto']],t.outcome)}${inp('points','Points',t.points,{type:'number'})}${inp('rr','R:R',t.rr,{type:'number'})}<div class="s2">${sel('strategy','Strategy',[['','None'],...s.strategies.map(x=>[x.name,x.name])],t.strategy)}</div></div>
  <div>${sheetDet('review','Review',reviewFields(t))}</div>
  <datalist id="symList">${Object.keys(s.pointValues).map(k=>`<option value="${esc(k)}">`).join('')}</datalist></div>
  <div class="sheet-foot">${t._new?'':'<button class="btn danger" data-act="delTrade">Delete</button>'}<span class="kbd">⌘↵ to save</span><button class="btn pri" data-act="saveTrade">${t._new?'Add trade':'Save'}</button></div>`;
  el.querySelector('.sheet-body').scrollTop=y}
const MENU_LONG=10,MENU_CHECK='<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m2.5 7.4 3 3 6-6.8"/></svg>',MENU_CHEV='<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 4.5 6 7.5 9 4.5"/></svg>';
function menuField(title,opts,on,attrs){if(!opts.length)return '';const picked=opts.filter(o=>on.includes(o));return `<div class="mfield"><p class="hint">${esc(title)}</p><button type="button" class="mbtn" aria-expanded="false" aria-label="${esc(title)}"><span class="mv ${picked.length?'':'none'}">${esc(picked.join(', ')||'None')}</span>${MENU_CHEV}</button><div class="mpop" hidden>${opts.length>MENU_LONG?`<div class="mq"><input type="search" placeholder="Search ${esc(title.toLowerCase())}" aria-label="Search ${esc(title)}"></div>`:''}<div class="mscroll">${opts.map(o=>`<label class="mrow" data-o="${esc(o.toLowerCase())}"><input type="checkbox" ${attrs(o)} ${on.includes(o)?'checked':''}><i>${MENU_CHECK}</i><span>${esc(o)}</span></label>`).join('')}<div class="mno" hidden>Nothing matches.</div></div></div></div>`}
let menuOpen=null;
function menuSummary(f){const on=[...f.querySelectorAll('.mrow input:checked')].map(x=>x.closest('.mrow').querySelector('span').textContent),v=f.querySelector('.mv');v.textContent=on.length?on.join(', '):'None';v.classList.toggle('none',!on.length)}
function closeMenu(){if(!menuOpen)return;const{pop,btn}=menuOpen;pop.hidden=true;btn.setAttribute('aria-expanded','false');menuOpen=null}
function menuFilter(pop,t){const s=t.trim().toLowerCase();let n=0;pop.querySelectorAll('.mrow').forEach(r=>{const m=!s||r.dataset.o.includes(s);r.style.display=m?'':'none';if(m)n++});pop.querySelector('.mno').hidden=n>0}
function openMenu(btn){const pop=btn.closest('.mfield').querySelector('.mpop');closeMenu();pop.hidden=false;btn.setAttribute('aria-expanded','true');const r=btn.getBoundingClientRect(),below=innerHeight-r.bottom-14,above=r.top-14,up=below<240&&above>below,h=Math.min(372,up?above:below);pop.style.left=r.left+'px';pop.style.width='max-content';pop.style.width=Math.min(r.width,Math.max(190,Math.ceil(pop.getBoundingClientRect().width)+2))+'px';pop.style.maxHeight=h+'px';if(up){pop.style.top='auto';pop.style.bottom=(innerHeight-r.top+6)+'px'}else{pop.style.bottom='auto';pop.style.top=(r.bottom+6)+'px'}menuOpen={pop,btn,y:btn.closest('.sheet-body')?.scrollTop||0};const q=pop.querySelector('.mq input');if(q){q.value='';menuFilter(pop,'');q.focus()}}
function reviewFields(t){const s=S.settings,cf=s.customFields,bf=behaviorFieldOf(S),seen=c=>{const set=new Set(splitList(c.options));for(const x of S.trades)splitList((x.custom||{})[c.key]).forEach(v=>set.add(v));return [...set]};
  const isMulti=c=>c===bf||c.type==='multi'||/^confluences?$/i.test(c.label),one=c=>{const v=(t.custom||{})[c.key]??'',opts=c.type==='select'?seen(c):[],scale=opts.length&&opts.every(o=>/^[1-5]$/.test(o));if(c.type==='select')return `<label class="f">${esc(c.label)}<select data-cf="${c.key}"><option value="">None</option>${(scale?['1','2','3','4','5']:opts).map(o=>`<option value="${esc(o)}" ${String(v)===o?'selected':''}>${esc(scale?o+' of 5':o)}</option>`).join('')}</select></label>`;return `<label class="f ${String(v).length>18?'s4':''}">${esc(c.label)}<input ${c.type==='number'?'type="number"':''} data-cf="${c.key}" value="${esc(v)}"></label>`};
  let multi='';for(const c of cf)if(c!==bf&&isMulti(c))multi+=menuField(c.label,seen(c),splitList((t.custom||{})[c.key]),o=>`data-multi="${esc(c.key)}" data-v="${esc(o)}"`);
  if(bf){const on=splitList((t.custom||{})[bf.key]),bad=new Set(s.mistakes);const a=o=>`data-multi="${esc(bf.key)}" data-v="${esc(o)}"`;multi+=menuField('Behaviors',seen(bf).filter(o=>!bad.has(o)),on,a)+menuField('Mistakes',s.mistakes,on,a)}else multi+=menuField('Mistakes',s.mistakes,t.mistakes||[],o=>`data-mis="${esc(o)}"`);
  return `<div class="fg">${sel('rating','Rating',[[0,'None'],[1,'1 of 5'],[2,'2 of 5'],[3,'3 of 5'],[4,'4 of 5'],[5,'5 of 5']],t.rating||0)}${cf.filter(c=>!isMulti(c)).map(one).join('')}</div>${multi}`}
function sheetDet(id,title,body){return `<details class="more" data-sheet="${id}" ${sheetOpen.has(id)?'open':''}><summary>${esc(title)}${ic('down',16)}</summary><div class="in">${body}</div></details>`}
async function addImages(files){let bad=0;for(const f of files){if(!f.type.startsWith('image/'))continue;try{editing.images.push(await shrink(f))}catch(e){bad++}}if(bad)toast(plural(bad,'image')+' could not be read.');renderSheet()}
function closeSheet(){closeMenu();const r=$('#modalRoot');const sc=r.querySelector('.scrim'),sh=r.querySelector('.sheet');editing=null;document.body.classList.remove('lock');if(!sh)return;sc.classList.remove('open');sh.classList.remove('open');const f=lastFocus;setTimeout(()=>{if(!editing){r.innerHTML=''}if(f){const n=document.querySelector(`[data-trade="${f}"]`);if(n)n.focus({preventScroll:true})}},matchMedia('(prefers-reduced-motion:reduce)').matches?180:320)}
async function requestClose(){if(!editing)return;if(JSON.stringify(editing)!==editOrig&&!await ask({title:'Discard your changes?',ok:'Discard',cancel:'Keep editing',danger:true}))return;closeSheet()}
function deleteTrades(ids,msg){const before=S.trades.slice();S.trades=S.trades.filter(t=>!ids.has(t.id));save();render();toast(msg,{undo:()=>{S.trades=before;save();render()}})}

/* ---------- export + chrome ---------- */
function download(name,text){return nat('saveAs',{name,text}).then(p=>{if(p)toast('Saved '+name)}).catch(()=>toast('That file could not be saved.'))}
function applyTheme(){const s=S.settings,root=document.documentElement;root.dataset.theme=s.theme==='auto'?(matchMedia('(prefers-color-scheme:light)').matches?'light':'dark'):(s.theme==='light'?'light':'dark');
  if(s.accent&&/^#[0-9a-f]{6}$/i.test(s.accent)){const n=parseInt(s.accent.slice(1),16),l=(.2126*(n>>16&255)+.7152*(n>>8&255)+.0722*(n&255))/255;root.style.setProperty('--accent',s.accent);root.style.setProperty('--on-accent',l>.55?'#000':'#FFF')}else{root.style.removeProperty('--accent');root.style.removeProperty('--on-accent')}
  try{localStorage.setItem('vanta-look',JSON.stringify({t:root.dataset.theme,a:s.accent||''}))}catch(e){}document.title='Vanta';if(NATIVE)nat('theme',{dark:root.dataset.theme==='dark'}).catch(()=>{})}
matchMedia('(prefers-color-scheme:light)').addEventListener('change',()=>{if(S.settings.theme==='auto')applyTheme()});
function render(){CH=[];$('#tip')?.remove();const views={overview:vOverview,calendar:vCalendar,trades:vTrades,insights:vInsights,playbook:vPlaybook,import:vImport,settings:vSettings,more:vMore};
  document.querySelectorAll('[data-go].nv,.tabs [data-go]').forEach(b=>{const on=b.dataset.go===view||(b.dataset.go==='more'&&['insights','playbook','import','settings'].includes(view));b.classList.toggle('on',on);if(on)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});
  const a=document.activeElement,key=a&&a.closest&&a.closest('#main')?['f','act','unit','caltab','sort','set','note','map'].map(k=>a.dataset[k]?`[data-${k}="${a.dataset[k]}"]`:'').join(''):'';const y=window.scrollY;
  $('#main').innerHTML=`<div class="page">${views[view]()}</div>`;window.scrollTo(0,y);if(key){const n=document.querySelector('#main '+key);if(n)n.focus({preventScroll:true})}renderStatus();markFresh();if(chartWant){chartWant=false;if(view==='overview'&&!document.documentElement.classList.contains('boot'))playChart()}}
function go(v){chartWant=v==='overview';view=v;filterOpen=false;window.scrollTo(0,0);render()}

/* ---------- events ---------- */
document.addEventListener('click',async e=>{
  if(filterOpen&&!e.target.closest('.bar')){filterOpen=false;render()}
  const el=e.target.closest('[data-go],[data-act],[data-day],[data-trade],[data-sort],[data-strat],[data-wup],[data-wdn],[data-delcf],[data-delimg],[data-zoom],[data-unit],[data-caltab],[data-segt],[data-goneKeep],[data-goneDel],[data-past]');if(!el)return;const a=el.dataset.act;
  if(e.target.matches('input[type=checkbox]')&&a!=='selAll'&&!el.dataset.sel&&el.dataset.trade)return;
  if(el.dataset.go){if(editing)closeSheet();return go(el.dataset.go)}
  if(a==='closeBg')return requestClose();
  if(a==='selAll'||a==='search'||['anyFile','notionDir','imgs'].includes(a))return;
  if(el.dataset.trade){if(e.target.matches('input'))return;return openTrade(el.dataset.trade)}
  if(el.dataset.day&&!a){daySel=el.dataset.day;calMonth=new Date(pd(daySel).getFullYear(),pd(daySel).getMonth(),1);calTab='month';if(view==='calendar')return render();return go('calendar')}
  if(el.dataset.sort){const k=el.dataset.sort;if(sortKey===k)sortDir*=-1;else{sortKey=k;sortDir=k==='date'||k==='net'?-1:1}return render()}
  if(el.dataset.unit){chartWant=true;S.settings.unit=el.dataset.unit;save();return render()}
  if(el.dataset.caltab){calTab=el.dataset.caltab;return render()}
  if(el.dataset.strat){stratSel=+el.dataset.strat;return render()}
  if(el.dataset.segt&&editing){const k=el.dataset.segt;editing[k]=el.dataset.v;el.parentElement.querySelectorAll('button').forEach(b=>{const on=b===el;b.classList.toggle('on',on);b.setAttribute('aria-pressed',on)});$('#sheetRes').innerHTML=sheetResult(editing);return}
  if(el.dataset.wup||el.dataset.wdn){const i=+(el.dataset.wup??el.dataset.wdn),j=el.dataset.wup!==undefined?i-1:i+1,w=S.settings.widgets;if(j<0||j>=w.length)return;[w[i],w[j]]=[w[j],w[i]];save();return render()}
  if(el.dataset.delcf){const c=S.settings.customFields[+el.dataset.delcf];if(!await ask({title:`Remove “${c.label}”?`,body:'The field leaves your trade form and reports. Values already saved on trades are kept.',ok:'Remove',danger:true}))return;S.settings.customFields.splice(+el.dataset.delcf,1);save();return render()}
  if(el.dataset.delimg){editing.images.splice(+el.dataset.delimg,1);if(editing.notionImgIds)editing.notionImgIds.splice(+el.dataset.delimg,1);if(editing.imgLabels)editing.imgLabels.splice(+el.dataset.delimg,1);return renderSheet()}
  if(el.dataset.zoom)return openLightbox(+el.dataset.zoom);
  if(el.dataset.past!==undefined){const q=nextQuote();if(q){const b=$('#past .past-body');b.innerHTML=pastBody(q);b.classList.remove('swap');void b.offsetWidth;b.classList.add('swap')}return}
  if(el.dataset.gonekeep){const t=S.trades.find(x=>x.id===el.dataset.gonekeep);if(t){delete t.notionGone;delete t.notionId;delete t.notionSig;delete t.notionImgIds;delete t.notionUrl}save();return render()}
  if(el.dataset.gonedel){deleteTrades(new Set([el.dataset.gonedel]),'Trade removed');return}
  switch(a){
    case 'addTrade':return openTrade(null);
    case 'addTradeDay':return openTrade(null,{date:el.dataset.d});
    case 'closeModal':return requestClose();
    case 'toggleFilter':filterOpen=!filterOpen;return render();
    case 'clearFilter':F.strategy='';F.symbol='';return render();
    case 'reviewMissing':return openReview(filtered(missing));
    case 'reviewAll':return openReview(sortTrades(S.trades.filter(missing)));
    case 'toggleMissing':onlyMissing=!onlyMissing;return render();
    case 'pickFile':return $('#fileIn').click();
    case 'pickFolder':return $('#dirIn').click();
    case 'pickImgs':return $('#imgIn').click();
    case 'saveTrade':{const t=editing;if(!t.date||!String(t.symbol||'').trim()){toast('Add a date and a symbol to save this trade.');return}if(blank(t.pnl)){const g=calcGross(t);t.pnl=g==null?0:Math.round(g*100)/100}if(blank(t.fees))t.fees=Math.round(num(S.settings.feePerContract)*num(t.qty)*100)/100;t.pnl=num(t.pnl);t.fees=num(t.fees);const wasNew=t._new;delete t._new;const i=S.trades.findIndex(x=>x.id===t.id);if(i>=0)S.trades[i]=t;else S.trades.push(t);calMonth=wasNew?null:calMonth;save();closeSheet();render();toast(wasNew?'Trade added':'Trade saved');return}
    case 'delTrade':{const id=editing.id;closeSheet();deleteTrades(new Set([id]),'Trade deleted');return}
    case 'calPrev':calMonth=new Date(calMonth.getFullYear(),calMonth.getMonth()-1,1);daySel=null;return render();
    case 'calNext':calMonth=new Date(calMonth.getFullYear(),calMonth.getMonth()+1,1);daySel=null;return render();
    case 'clearAll':{if(await ask({title:`Delete all ${plural(S.trades.length,'trade')}?`,body:'Notes and settings stay. You can undo this for a few seconds.',ok:'Delete all',danger:true}))deleteTrades(new Set(S.trades.map(t=>t.id)),'All trades deleted');return}
    case 'exportJSON':{const name='vanta-backup-'+todayStr()+'.json';await persist();try{if(await nat('exportBackup',{name}))toast('Saved '+name)}catch(err){toast('That backup could not be saved.')}return}
    case 'exportCSV':return download('vanta-trades-'+todayStr()+'.csv',toCSV());
    case 'connectFolder':return connectFolder();
    case 'revealData':return nat('reveal');
    case 'notionOpenSetup':return nat('openURL',{url:'https://www.notion.so/my-integrations'});
    case 'openNotion':if(editing&&editing.notionUrl)return nat('openURL',{url:editing.notionUrl});return;
    case 'notionConnect':return notionConnect();
    case 'notionSyncNow':{if(!S.settings.notion.dataSourceId){try{await notionFindSources()}catch(err){N.err=err.message}render()}return notionSync(true)}
    case 'notionForget':{if(!await ask({title:'Disconnect Notion?',body:'Your trades stay in Vanta and your journal in Notion is not touched. New Notion trades stop appearing here.',ok:'Disconnect',danger:true}))return;await nat('notionForget');N.connected=false;N.err='';N.msg='';N.sources=null;S.settings.notion={dataSourceId:'',name:'',lastSync:''};save();return render()}
    case 'openData':if(N.connected)openSec.add('notion');else openSec.add('data');return go('settings');
    case 'resetAccent':S.settings.accent='';applyTheme();save();return render();
    case 'selClear':selected.clear();return render();
    case 'bulkDelete':{const ids=new Set(selected);selected.clear();deleteTrades(ids,plural(ids.size,'trade')+' deleted');return}
    case 'bulkStrategy':{const n=await ask({title:`Set a strategy for ${plural(selected.size,'trade')}`,input:S.settings.strategies[0]?.name||'',ok:'Set strategy'});if(n==null)return;if(n&&!S.settings.strategies.find(s=>s.name===n))S.settings.strategies.push({name:n,rules:''});S.trades.forEach(t=>{if(selected.has(t.id))t.strategy=n});selected.clear();save();return render()}
    case 'addStrategy':{const n=await ask({title:'Name this setup',input:'',ok:'Add setup'});if(!n)return;if(S.settings.strategies.find(s=>s.name===n))return toast('You already have a setup with that name.');S.settings.strategies.push({name:n,rules:''});stratSel=S.settings.strategies.length-1;save();return render()}
    case 'delStrategy':{const s=S.settings.strategies[stratSel];if(!await ask({title:`Delete “${s.name}”?`,body:'Its trades keep the name, but the setup and its rules leave your playbook.',ok:'Delete',danger:true}))return;S.settings.strategies.splice(stratSel,1);stratSel=0;save();return render()}
    case 'addCF':{const l=$('#cfLabel').value.trim();if(!l)return toast('Name the field first.');S.settings.customFields.push({key:'cf_'+uid(),label:l,type:$('#cfType').value,options:$('#cfOpts').value});save();return render()}
    case 'doImport':{if(imp.busy)return;imp.busy=true;el.disabled=true;el.textContent='Importing…';try{await runImport();await persist()}catch(err){console.error(err);toast('The import stopped: '+err.message);if(imp){imp.busy=false;render()}}return}
    case 'cancelImport':imp=null;return render();
  }});
document.addEventListener('click',e=>{const b=e.target.closest('.mbtn');if(b){const same=menuOpen&&menuOpen.btn===b;if(same)closeMenu();else openMenu(b);return}if(menuOpen&&!e.target.closest('.mpop')&&e.clientX>=0&&e.clientY>=0)closeMenu()});
document.addEventListener('change',e=>{const f=e.target.closest&&e.target.closest('.mfield');if(f)menuSummary(f)});
document.addEventListener('input',e=>{if(menuOpen&&e.target.closest&&e.target.closest('.mq'))menuFilter(menuOpen.pop,e.target.value)});
document.addEventListener('keydown',e=>{if(e.key!=='Escape'||!menuOpen)return;const live=menuOpen.pop.isConnected,b=menuOpen.btn;closeMenu();if(live){e.stopImmediatePropagation();b.focus()}},true);
document.addEventListener('scroll',e=>{if(menuOpen&&e.target.classList&&e.target.classList.contains('sheet-body')&&Math.abs(e.target.scrollTop-menuOpen.y)>2)closeMenu()},true);
document.addEventListener('keydown',e=>{
  const top=document.querySelector('.dialog-wrap,.lightbox')||(editing&&$('.sheet'));
  if(e.key==='Tab'&&top){const f=[...top.querySelectorAll('button,input:not([type=file]),select,textarea,summary,[tabindex="0"]')].filter(n=>!n.disabled&&n.offsetParent!==null);if(!f.length)return;const a=f[0],z=f[f.length-1];if(!top.contains(document.activeElement)){e.preventDefault();a.focus()}else if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}}
  if(e.key==='Escape'){if(editing)return requestClose();if(filterOpen){filterOpen=false;render()}return}
  if((e.metaKey||e.ctrlKey)&&e.key==='Enter'&&editing){e.preventDefault();document.querySelector('[data-act="saveTrade"]').click();return}
  const typing=e.target.matches&&e.target.matches('input,textarea,select,[contenteditable]');
  if(e.key.toLowerCase()==='n'&&!typing&&!top&&!e.metaKey&&!e.ctrlKey&&!e.altKey){e.preventDefault();openTrade(null);return}
  if((e.key==='Enter'||e.key===' ')&&e.target.dataset&&(e.target.dataset.trade||e.target.dataset.zoom)&&!typing&&e.target.tagName!=='BUTTON'){e.preventDefault();e.target.click()}});
document.addEventListener('input',e=>{const el=e.target;
  if(el.dataset.t&&editing){const k=el.dataset.t;let v=el.value;if(k==='rating')v=+v;editing[k]=v;$('#sheetRes').innerHTML=sheetResult(editing);return}
  if(el.dataset.cf&&editing){editing.custom=editing.custom||{};editing.custom[el.dataset.cf]=el.value;return}
  if(el.dataset.note){S.notes[el.dataset.note]=el.value;save();return}
  if(el.dataset.act==='search'){search=el.value;const pos=el.selectionStart;render();const s=document.querySelector('[data-act="search"]');s.focus();s.setSelectionRange(pos,pos);return}
  if(el.dataset.sfield){const s=S.settings.strategies[stratSel],old=s.name;s[el.dataset.sfield]=el.value;if(el.dataset.sfield==='name')S.trades.forEach(t=>{if(t.strategy===old)t.strategy=el.value});save();return}});
document.addEventListener('change',async e=>{const el=e.target;
  if(el.dataset.f){chartWant=true;F[el.dataset.f]=el.value;if(el.dataset.f==='range'&&el.value==='custom')filterOpen=true;return render()}
  if(el.dataset.t){return}
  if(el.dataset.multi&&editing){const k=el.dataset.multi,v=el.dataset.v;editing.custom=editing.custom||{};let l=splitList(editing.custom[k]);if(el.checked){if(!l.includes(v))l.push(v)}else l=l.filter(x=>x!==v);editing.custom[k]=l.join(', ');const f=behaviorFieldOf(S);if(f&&f.key===k){const bad=new Set(S.settings.mistakes);editing.mistakes=l.filter(x=>bad.has(x))}return}
  if(el.dataset.mis!==undefined&&editing){const m=el.dataset.mis;editing.mistakes=editing.mistakes||[];if(el.checked)editing.mistakes.push(m);else editing.mistakes=editing.mistakes.filter(x=>x!==m);return}
  if(el.dataset.sel){if(el.checked)selected.add(el.dataset.sel);else selected.delete(el.dataset.sel);return render()}
  if(el.dataset.act==='selAll'){document.querySelectorAll('[data-sel]').forEach(x=>el.checked?selected.add(x.dataset.sel):selected.delete(x.dataset.sel));return render()}
  if(el.dataset.act==='imgs'&&editing){return addImages(el.files)}
  if(el.dataset.act==='repBy'){repBy=el.value;return render()}
  if(el.dataset.wi!==undefined){if(el.checked)wiExclude.delete(el.dataset.wi);else wiExclude.add(el.dataset.wi);return render()}
  if(el.dataset.act==='wiNoMistakes'){wiNoMistakes=el.checked;return render()}
  if(el.dataset.set){const k=el.dataset.set;S.settings[k]=['startBalance','feePerContract'].includes(k)?num(el.value):el.value;applyTheme();save();return render()}
  if(el.dataset.act==='pv'){const o={};el.value.split('\n').forEach(l=>{const [k,v]=l.split('=');if(k&&v)o[k.trim().toUpperCase()]=num(v)});S.settings.pointValues=o;save();return}
  if(el.dataset.act==='mistakes'){S.settings.mistakes=el.value.split(',').map(x=>x.trim()).filter(Boolean);deriveMistakes(S);save();return}
  if(el.dataset.wtog){S.settings.widgets[+el.dataset.wtog].on=el.checked;save();return}
  if(el.dataset.kpi){S.settings.kpis[el.dataset.kpi]=el.checked;save();return}
  if(el.dataset.col){S.settings.cols[el.dataset.col]=el.checked;save();return}
  if(el.dataset.target){S.settings.score.targets[el.dataset.target]=num(el.value);save();return}
  if(el.dataset.weight){S.settings.score.weights[el.dataset.weight]=num(el.value);save();return}
  if(el.dataset.score){S.settings.score.name=el.value;save();return}
  if(el.dataset.map){imp.map[el.dataset.map]=el.value;return render()}
  if(el.dataset.act==='dateFmt'){S.settings.dateFormat=el.value;save();return render()}
  if(el.dataset.act==='impStrat'){imp.strat=el.value;return render()}
  if(el.dataset.act==='impExtra'){imp.extra=el.value==='1';return}
  if(el.dataset.act==='notionSource'){const s=(N.sources||[]).find(x=>x.id===el.value);if(s){S.settings.notion.dataSourceId=s.id;S.settings.notion.name=s.name;save();render();notionSync(true)}return}
  if(el.dataset.act==='anyFile'&&el.files[0])return handleFile(el.files[0]);
  if(el.dataset.act==='notionDir'&&el.files.length){try{await importNotionFolder([...el.files])}catch(err){console.error(err);toast(err.message||'That folder could not be read.')}return}
});
document.addEventListener('toggle',e=>{const d=e.target;if(d.dataset&&d.dataset.sec){d.open?openSec.add(d.dataset.sec):openSec.delete(d.dataset.sec)}if(d.dataset&&d.dataset.sheet){d.open?sheetOpen.add(d.dataset.sheet):sheetOpen.delete(d.dataset.sheet)}},true);
document.addEventListener('paste',e=>{if(!editing)return;const files=[...(e.clipboardData?.files||[])].filter(f=>f.type.startsWith('image/'));if(files.length){e.preventDefault();addImages(files)}});
document.addEventListener('pointermove',chartHover);document.addEventListener('pointerleave',()=>$('#tip')?.remove());
document.addEventListener('dragover',e=>{e.preventDefault();if(view==='import')$('#drop')?.classList.add('over')});
document.addEventListener('dragleave',e=>{if(!e.relatedTarget)$('#drop')?.classList.remove('over')});
document.addEventListener('drop',e=>{e.preventDefault();$('#drop')?.classList.remove('over');if(editing){const fs=[...e.dataTransfer.files].filter(f=>f.type.startsWith('image/'));if(fs.length)addImages(fs);return}if(view==='import'&&!imp)dropItems(e.dataTransfer)});
window.addEventListener('pagehide',()=>{if(saveT)persist()});
let rzT=null,lastW=innerWidth;window.addEventListener('resize',()=>{clearTimeout(rzT);rzT=setTimeout(()=>{if(innerWidth!==lastW){lastW=innerWidth;render()}},120)});
window.vantaNewTrade=()=>{if(!editing&&!rvEl&&!document.documentElement.classList.contains('boot'))openTrade(null)};

/* ---------- shell ---------- */
const NAV=[['overview','Overview'],['calendar','Calendar'],['trades','Trades'],['insights','Insights'],['playbook','Playbook']];
$('#nav').innerHTML=`<div class="brand">${logo(22)}<span>Vanta</span></div><button class="btn pri add" data-act="addTrade">${ic('plus',16)}Add trade</button>${NAV.map(([v,l])=>`<button class="nv" data-go="${v}">${ic(v)}${l}</button>`).join('')}<button class="nv" id="reviewNav" data-act="reviewAll">${ic('check')}<span>Review them</span><span class="cnt"></span></button><div class="spacer"></div><button class="nv" data-go="import">${ic('import')}Import</button><button class="nv" data-go="settings">${ic('settings')}Settings</button><button class="status" id="status" data-act="openData"></button>`;
$('#tabs').innerHTML=`<button data-go="overview">${ic('overview')}Overview</button><button data-go="calendar">${ic('calendar')}Calendar</button><button class="plus" data-act="addTrade" aria-label="Add trade">${ic('plus',22)}</button><button data-go="trades">${ic('trades')}Trades</button><button data-go="more">${ic('more')}More</button>`;

/* ---------- startup animation ---------- */
const Startup=(()=>{const root=document.documentElement,reduce=matchMedia('(prefers-reduced-motion:reduce)').matches,MIN=reduce?900:1600;let rendered=false,skipped=false,opening=false,done=false,endT=null;
  /* the doors split on a diagonal through the logo, along the line its two pieces part */
  function layout(){const m=document.querySelector('#splash .mark').getBoundingClientRect(),cx=m.left+m.width/2,cy=m.top+m.height/2,W=innerWidth,H=innerHeight,nx=.822,ny=.57,dx=ny,dy=-nx,L=W+H,seam=.75;
    const poly=s=>{const ox=cx-s*nx*seam,oy=cy-s*ny*seam,a=[ox+dx*L,oy+dy*L],b=[ox-dx*L,oy-dy*L],c=[b[0]+s*nx*L,b[1]+s*ny*L],d=[a[0]+s*nx*L,a[1]+s*ny*L];return `polygon(${[a,b,c,d].map(p=>p[0].toFixed(1)+'px '+p[1].toFixed(1)+'px').join(',')})`};
    document.querySelector('#splash .door.a').style.clipPath=poly(1);document.querySelector('#splash .door.b').style.clipPath=poly(-1);
    document.querySelectorAll('#splash .piece').forEach(p=>{p.style.left=m.left+'px';p.style.top=m.top+'px';p.style.width=m.width+'px';p.style.height=m.height+'px'});
    const travel=Math.hypot(W,H)*1.05;root.style.setProperty('--spx',(nx*travel).toFixed(1)+'px');root.style.setProperty('--spy',(ny*travel).toFixed(1)+'px')}
  function end(){if(done)return;done=true;clearTimeout(endT);root.classList.remove('boot','opening');launchChart()}
  function open(){if(opening||done)return;opening=true;layout();root.classList.add('opening');setTimeout(launchChart,260);endT=setTimeout(end,reduce?220:860)}
  function skip(){skipped=true;if(rendered)end()}
  document.getElementById('splash').addEventListener('click',skip);
  document.addEventListener('keydown',e=>{if(done)return;e.stopImmediatePropagation();if(e.key==='Escape'||e.key===' '){e.preventDefault();skip()}},true);
  return{ready(){rendered=true;if(skipped)return end();setTimeout(open,Math.max(0,MIN-performance.now()))},end}})();

/* Screenshots live as files in the Mac app. Older journals hold them inline, so convert any still there.
   A screenshot that fails stays inline and works as before; the next launch tries it again. */
async function migrateImages(){let n=0;for(const t of S.trades)for(let i=0;i<(t.images||[]).length;i++){const s=t.images[i];if(typeof s==='string'&&s.startsWith('data:')){try{t.images[i]=await nat('imageSave',{data:s});n++}catch(e){console.error(e)}}}if(n)await persist();return n}

/* ---------- chart growth: a cover slides off the finished chart, so nothing redraws ---------- */
const CHART_MS=1500,chartEase='cubic-bezier(.3,.1,.2,1)',chartReduce=matchMedia('(prefers-reduced-motion:reduce)').matches;let chartWant=false,chartStop=null,chartLaunched=false;
function launchChart(){if(chartLaunched)return;chartLaunched=true;if(view==='overview')playChart()}
function playChart(){if(chartStop)chartStop();const c=document.querySelector('#main .curve');if(!c||chartReduce)return;const cv=document.createElement('div');cv.className='chart-cover';c.classList.add('grow');c.appendChild(cv);
  const a=cv.animate([{transform:'translate3d(0,0,0)'},{transform:'translate3d(100%,0,0)'}],{duration:CHART_MS,easing:chartEase,fill:'both'}),total=document.querySelector('#main .total'),final=total?total.textContent:'',end=total?stats(filtered()).total:0;
  const svg=c.querySelector('svg[data-ch]'),dot=svg&&[...svg.querySelectorAll('circle')].find(x=>!x.classList.contains('mk'));let raf=0,closed=false,dotT=0;
  const stop=()=>{if(closed)return;closed=true;cancelAnimationFrame(raf);clearTimeout(safe);clearTimeout(dotT);a.cancel();cv.remove();c.classList.remove('grow');if(total)total.textContent=final;if(dot)dot.style.opacity='';chartStop=null};chartStop=stop;
  const safe=setTimeout(stop,CHART_MS+500);a.finished.then(stop).catch(()=>{});
  if(dot){dot.style.transformBox='fill-box';dot.style.transformOrigin='center';dot.style.opacity=0;dotT=setTimeout(()=>{dot.style.opacity='';dot.animate([{transform:'scale(.3)'},{transform:'scale(1.6)',offset:.6},{transform:'scale(1)'}],{duration:320,easing:'ease-out'})},CHART_MS*.82)}
  if(total){total.textContent=sg(0);const tick=()=>{const p=a.effect.getComputedTiming().progress;if(!closed&&p!=null&&p<1){total.textContent=sg(end*p);raf=requestAnimationFrame(tick)}};raf=requestAnimationFrame(tick)}}

/* ---------- from your past: your own lessons, never the template's blank prompts ---------- */
const PAST_HEAD=/^\s*[-*•]?\s*(mistakes?|learnings?|lessons?|leasson)\s*:\s*(.*)$/i,PAST_LEARNED=/^\s*[-*•]?\s*learned\s+\S/i,PAST_PROMPT=/what exactly|was i trading|\?\s*\*?\s*$/i;let pastKey='';
function buildQuotes(){const out=[];for(const t of S.trades){if(t.outcome==='missed')continue;const ls=(t.notes||'').split(/\n+/).map(x=>x.trim()).filter(Boolean);for(let i=0;i<ls.length;i++){const m=ls[i].match(PAST_HEAD);let kind='',body='';if(m){kind=/^m/i.test(m[1])?'Mistake':'Lesson';body=m[2].trim();if(!body&&ls[i+1]&&!PAST_HEAD.test(ls[i+1]))body=ls[i+1]}else if(PAST_LEARNED.test(ls[i])){kind='Lesson';body=ls[i]}body=body.replace(/^[-*•]\s*/,'').replace(/\*/g,'').trim();if(kind&&body.length>=30&&!PAST_PROMPT.test(body))out.push({t,kind,body,key:t.id+'|'+body.slice(0,40)})}}return out}
const pastClip=s=>s.length<=260?s:s.slice(0,260).replace(/\s+\S*$/,'')+'…';
function nextQuote(){const q=buildQuotes();if(!q.length){pastKey='';return null}let i;do{i=Math.floor(Math.random()*q.length)}while(q.length>1&&q[i].key===pastKey);pastKey=q[i].key;return q[i]}
function currentQuote(){return buildQuotes().find(x=>x.key===pastKey)||nextQuote()}
function pastBody(q){return `<blockquote class="past-q">${esc(pastClip(q.body))}</blockquote><button class="past-src" data-trade="${q.t.id}">${q.kind} from “${esc(q.t.title||q.t.symbol)}”, ${esc(fmtDate(q.t.date))}<b class="${resultCls(q.t)}">${esc(resultText(q.t))}</b></button>`}

/* ---------- review them, one trade at a time ---------- */
let rvEl=null,rvQ=[],rvAt=0,rvBack=null;
function updateReviewNav(){const b=document.getElementById('reviewNav');if(!b)return;const n=S.trades.filter(missing).length;b.style.display=n?'':'none';b.querySelector('.cnt').textContent=n;b.setAttribute('aria-label','Review them, '+plural(n,'unfinished trade'))}
function rvNeed(t){const u=unitOf(),what=u==='R'?'R:R':u==='points'?'points':'P&L';return t.outcome?`${({win:'A win',loss:'A loss'})[t.outcome]||'This trade'} with no ${what} yet, so it counts as zero.`:'No outcome yet, so it counts as zero.'}
const rvExcerpt=t=>{const l=(t.notes||'').split(/\n+/).map(x=>x.trim()).find(x=>x.length>30&&!PAST_PROMPT.test(x));return l?pastClip(l):''};
function rvCard(){const n=rvQ.length,finished=rvAt>=n;rvEl.querySelector('.rv-top span').textContent=finished?`${n} of ${n}`:`${rvAt+1} of ${n}`;rvEl.querySelector('.rv-prog i').style.transform=`scaleX(${finished?1:(rvAt+1)/n})`;const body=rvEl.querySelector('.rv-body');
  if(finished){body.innerHTML=`<div class="rv-card" style="text-align:center;align-items:center"><h2>That’s all of them</h2><p class="rv-note" style="-webkit-line-clamp:unset">Anything you fix in Notion shows up here on the next sync.</p><div class="rv-acts"><button class="btn pri" style="margin:0" data-rvdone>Done</button></div></div>`;body.querySelector('[data-rvdone]').focus();return}
  const t=rvQ[rvAt],shots=(t.images||[]).slice(0,4).map((s,i)=>`<img src="${s}" alt="Screenshot ${i+1}">`).join(''),ex=rvExcerpt(t);
  body.innerHTML=`<div class="rv-card"><h2>${esc(t.title||t.symbol)}</h2><div class="rv-meta">${esc(fmtDate(t.date))} · ${esc(t.symbol)}${modelsOf(t).length?' · '+esc(modelsOf(t).join(', ')):''}</div><p class="rv-need">${esc(rvNeed(t))}</p>${shots?`<div class="rv-shots">${shots}</div>`:''}${ex?`<p class="rv-note">${esc(ex)}</p>`:''}<div class="rv-acts"><button class="btn ghost" data-rvback ${rvAt?'':'disabled'}>Back</button><button class="btn" data-rvnext>${rvAt===n-1?'Finish':'Next'}</button><button class="btn pri" data-rvopen>${t.notionUrl?'Open in Notion':'Open trade'}</button></div></div>`;body.querySelector('[data-rvopen]').focus()}
function closeReview(){if(!rvEl)return;rvEl.remove();rvEl=null;document.body.classList.remove('lock');if(rvBack&&rvBack.isConnected)rvBack.focus()}
function openReview(list){if(!list.length||rvEl)return;rvQ=list;rvAt=0;rvBack=document.activeElement;rvEl=document.createElement('div');rvEl.id='rv';rvEl.setAttribute('role','dialog');rvEl.setAttribute('aria-modal','true');rvEl.setAttribute('aria-label','Review them');rvEl.innerHTML=`<div class="rv-top"><b>Review them</b><span></span><button class="tb" data-rvx aria-label="Close">${ic('x')}</button></div><div class="rv-prog"><i></i></div><div class="rv-body"></div>`;document.body.appendChild(rvEl);document.body.classList.add('lock');rvCard();
  rvEl.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const d=b.dataset;if(d.rvx!==undefined||d.rvdone!==undefined)closeReview();else if(d.rvnext!==undefined){rvAt++;rvCard()}else if(d.rvback!==undefined){rvAt=Math.max(0,rvAt-1);rvCard()}else if(d.rvopen!==undefined){const t=rvQ[rvAt];if(t.notionUrl)nat('openURL',{url:t.notionUrl}).catch(()=>toast('That link could not be opened.'));else{closeReview();openTrade(t.id)}}})}
document.addEventListener('keydown',e=>{if(!rvEl)return;e.stopImmediatePropagation();if(e.key==='Escape')closeReview();else if(e.key==='ArrowRight'&&rvAt<rvQ.length){rvAt++;rvCard()}else if(e.key==='ArrowLeft'&&rvAt>0){rvAt--;rvCard()}else if(e.key==='Tab'){const f=[...rvEl.querySelectorAll('button:not([disabled])')];if(!f.length)return;const a=f[0],z=f[f.length-1];if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}}},true);

/* ---------- a new trade from Notion arrives with a brief highlight ---------- */
const freshIds=new Set();
function markFresh(){for(const id of [...freshIds]){const r=document.querySelector(`#main tr[data-trade="${id}"]`);if(!r)continue;freshIds.delete(id);r.classList.add('fresh');setTimeout(()=>r.classList.remove('fresh'),1600)}}

/* ---------- boot ---------- */
(async()=>{document.documentElement.classList.add('native');let st=null,loadFailed=false;
  try{const t=await nat('load');if(t)st=JSON.parse(t);nativeInfo=await nat('info')}catch(e){console.error(e);loadFailed=true}
  if(st)S=mergeDefaults(st);
  try{await migrateImages()}catch(e){console.error(e)}
  applyTheme();render();if(loadFailed)toast('Your saved journal could not be opened. Restore a backup from Import.');Startup.ready();notionBoot()})().catch(e=>{console.error(e);Startup.end()});
