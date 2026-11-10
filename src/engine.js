/* ---------- helpers ---------- */
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,8);
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
function num(v){if(typeof v==='number')return isFinite(v)?v:0;if(v==null)return 0;let s=String(v).trim();if(!s)return 0;const paren=/^\(.*\)$/.test(s)||/^\$?\(.*\)$/.test(s);s=s.replace(/[^0-9.\-]/g,'');let n=parseFloat(s);if(!isFinite(n))return 0;return paren?-Math.abs(n):n}
const blank=v=>v===''||v==null;
const pad=n=>String(n).padStart(2,'0');
const ymd=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const pd=s=>{const [y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d)};
const todayStr=()=>ymd(new Date());
const WD=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];
const unitOf=()=>S.settings.unit||'money';
const unitLabel=()=>({money:'Net P&L',points:'Net points',R:'Net R'})[unitOf()];
function money(v,dec=2){const u=unitOf(),sg=v<0?'-':'';if(u==='points')return sg+Math.abs(v).toLocaleString(undefined,{maximumFractionDigits:1})+' pts';if(u==='R')return sg+Math.abs(v).toFixed(2)+'R';const c=S.settings.currency;return sg+c+Math.abs(v).toLocaleString(undefined,{minimumFractionDigits:dec,maximumFractionDigits:dec})}
function moneyK(v){const a=Math.abs(v),u=unitOf(),sg=v<0?'-':'';if(u==='points')return sg+(a>=1000?(a/1000).toFixed(1)+'K':(Math.round(a*10)/10))+' pts';if(u==='R')return sg+a.toFixed(1)+'R';const c=S.settings.currency;if(a>=1000)return sg+c+(a/1000).toFixed(2).replace(/\.?0+$/,'')+'K';return sg+c+(Math.round(a*100)/100)}
const cls=v=>v>0?'pos':v<0?'neg':'mut';
function rootSym(sym){return String(sym||'').toUpperCase().replace(/\s+/g,'').replace(/[FGHJKMNQUVXZ]\d{1,2}$/,'')}
function pointValue(sym){const pv=S.settings.pointValues;const r=rootSym(sym);return pv[r]??pv[String(sym).toUpperCase()]??1}
function calcGross(t){if(blank(t.entry)||blank(t.exit))return null;const dir=t.side==='Short'?-1:1;return (num(t.exit)-num(t.entry))*dir*num(t.qty||1)*pointValue(t.symbol)}
const dollars=t=>num(t.pnl)-num(t.fees);
function ptsOf(t){let p=null;if(!blank(t.points))p=num(t.points);else if(!blank(t.entry)&&!blank(t.exit))p=(num(t.exit)-num(t.entry))*(t.side==='Short'?-1:1);if(p==null)return null;
  if(t.outcome==='loss')return -Math.abs(p);if(t.outcome==='win')return Math.abs(p);if(t.outcome==='be')return 0;return p}
function rMult(t){if(num(t.risk)>0&&(num(t.pnl)||num(t.fees)))return dollars(t)/num(t.risk);const o=t.outcome;if(o==='win'&&num(t.rr)>0)return num(t.rr);if(o==='loss')return -1;if(o==='be')return 0;return null}
function net(t){const u=unitOf();if(u==='points')return ptsOf(t)??0;if(u==='R')return rMult(t)??0;return dollars(t)}
function outcome(t){if(t.outcome)return t.outcome;const n=dollars(t)||(unitOf()==='points'?ptsOf(t):0)||0;return n>0?'win':n<0?'loss':'be'}
function modelsOf(t){return [...new Set([t.strategy,...(t.notionTags||[])])].filter(Boolean)}
const modelKeys=t=>{const m=modelsOf(t);return m.length?m:['Untagged']};
function sortTrades(a){return a.slice().sort((x,y)=>(x.date+(x.time||'')).localeCompare(y.date+(y.time||'')))}
function filtered(extra,withMissed){const now=new Date();let from='',to='';
  if(F.range==='month'){from=ymd(new Date(now.getFullYear(),now.getMonth(),1))}
  else if(F.range==='30'){const d=new Date();d.setDate(d.getDate()-29);from=ymd(d)}
  else if(F.range==='90'){const d=new Date();d.setDate(d.getDate()-89);from=ymd(d)}
  else if(F.range==='ytd'){from=now.getFullYear()+'-01-01'}
  else if(F.range==='custom'){from=F.from;to=F.to}
  return sortTrades(S.trades.filter(t=>(withMissed||t.outcome!=='missed')&&(!from||t.date>=from)&&(!to||t.date<=to)&&(!F.strategy||modelsOf(t).includes(F.strategy))&&(!F.symbol||rootSym(t.symbol)===F.symbol)&&(!extra||extra(t))))}
function byDay(trades){const m=new Map();for(const t of trades){const d=m.get(t.date)||{date:t.date,net:0,n:0,w:0,l:0};d.net+=net(t);d.n++;const o=outcome(t);if(o==='win')d.w++;else if(o==='loss')d.l++;m.set(t.date,d)}return [...m.values()].sort((a,b)=>a.date.localeCompare(b.date))}
function stats(trades){
  trades=sortTrades(trades);const nets=trades.map(net);const ocs=trades.map(outcome);const sgn=ocs.map(o=>o==='win'?1:o==='loss'?-1:0);
  const wins=nets.filter(v=>v>0),losses=nets.filter(v=>v<0);const winN=ocs.filter(o=>o==='win').length,lossN=ocs.filter(o=>o==='loss').length;
  const gw=wins.reduce((a,b)=>a+b,0),gl=Math.abs(losses.reduce((a,b)=>a+b,0)),total=gw-gl;
  const decided=winN+lossN;const winRate=decided?winN/decided:0;
  const avgW=wins.length?gw/wins.length:0,avgL=losses.length?gl/losses.length:0;
  const ratio=avgL?avgW/avgL:(avgW?Infinity:0);const pf=gl?gw/gl:(gw?Infinity:0);
  const days=byDay(trades);let cum=0,peak=0,maxDD=0;const curve=[];
  for(const d of days){cum+=d.net;peak=Math.max(peak,cum);maxDD=Math.max(maxDD,peak-cum);curve.push({x:d.date,y:cum})}
  const green=days.filter(d=>d.net>0).length,red=days.filter(d=>d.net<0).length;
  const recovery=maxDD?total/maxDD:(total>0?Infinity:0);
  // streaks
  let ts=0;for(let i=sgn.length-1;i>=0;i--){const s=sgn[i];if(!s)continue;if(ts===0)ts=s;else if(Math.sign(ts)===s)ts+=s;else break}
  let ds=0;for(let i=days.length-1;i>=0;i--){const s=Math.sign(days[i].net);if(!s)continue;if(ds===0)ds=s;else if(Math.sign(ds)===s)ds+=s;else break}
  let mw=0,ml=0,cw=0,cl=0;for(const v of sgn){if(v>0){cw++;cl=0}else if(v<0){cl++;cw=0}mw=Math.max(mw,cw);ml=Math.max(ml,cl)}
  const best=days.reduce((a,d)=>!a||d.net>a.net?d:a,null),worst=days.reduce((a,d)=>!a||d.net<a.net?d:a,null);
  return{n:trades.length,total,gw,gl,wins:winN,losses:lossN,be:nets.length-decided,winRate,avgW,avgL,ratio,pf,
    expectancy:trades.length?total/trades.length:0,days,curve,maxDD,recovery,green,red,greenPct:days.length?green/days.length:0,
    tradeStreak:ts,dayStreak:ds,maxWinStreak:mw,maxLossStreak:ml,best,worst,avgDay:days.length?total/days.length:0,
    biggestW:wins.length?Math.max(...wins):0,biggestL:losses.length?Math.min(...losses):0}}
function score(st){const sc=S.settings.score,T=sc.targets,W=sc.weights;const fin=v=>isFinite(v)?v:10;
  const parts={win:clamp(st.winRate*100/T.win),pf:clamp(fin(st.pf)/T.pf),wl:clamp(fin(st.ratio)/T.wl),
    dd:clamp(1-(st.maxDD/Math.max(1e-9,unitOf()==='money'?num(S.settings.startBalance):Math.max(st.gw,1e-9))*100)/T.dd),rec:clamp(fin(st.recovery)/T.rec),cons:clamp(st.greenPct)};
  if(!st.n)Object.keys(parts).forEach(k=>parts[k]=0);
  let sw=0,s=0;for(const k in parts){sw+=num(W[k]);s+=parts[k]*num(W[k])}return{parts,total:sw?s/sw*100:0}}
function groupKeys(t,by){if(by==='strategy')return modelKeys(t);if(by==='symbol')return [rootSym(t.symbol)||'?'];if(by==='weekday')return [WD[pd(t.date).getDay()]];
  if(by==='hour')return [t.time?t.time.slice(0,2)+':00':'No time'];
  if(by==='mistake')return (t.mistakes&&t.mistakes.length)?t.mistakes:['Clean (no mistakes)'];if(by==='rating')return [t.rating?t.rating+'★':'Unrated'];if(by==='month')return [t.date.slice(0,7)];
  if(by.startsWith('cf:')){const v=(t.custom||{})[by.slice(3)];if(blank(v))return ['(empty)'];const parts=String(v).split(',').map(x=>x.trim()).filter(Boolean);return parts.length?parts:['(empty)']}return ['All']}
function group(trades,by){const m=new Map();for(const t of trades)for(const k of groupKeys(t,by)){if(!m.has(k))m.set(k,[]);m.get(k).push(t)}
  let rows=[...m.entries()].map(([k,ts])=>{const st=stats(ts);return{k,n:st.n,net:st.total,win:st.winRate,pf:st.pf,avg:st.expectancy,avgW:st.avgW,avgL:st.avgL}});
  const order={weekday:WD};if(by==='weekday')rows.sort((a,b)=>WD.indexOf(a.k)-WD.indexOf(b.k));else if(by==='hour'||by==='month')rows.sort((a,b)=>a.k.localeCompare(b.k));else rows.sort((a,b)=>b.net-a.net);return rows}
const fmtPF=v=>isFinite(v)?v.toFixed(2):'∞';
const IMPORT_FIELDS=[['title','Trade name / title',[/^#$/,/^name$/i,/^title$/i,/trade.?name/i]],['date','Date / open time',[/^date$/i,/trade.?date/i,/open.?(date|time)/i,/entry.?(date|time)/i,/opened/i,/date/i]],['time','Time (if separate)',[/^time$/i,/entry.?time/i,/time.?of.?entry/i]],['symbol','Symbol',[/^pair$/i,/symbol/i,/instrument/i,/contract/i,/ticker/i,/market/i]],['side','Side / direction',[/^side$/i,/direction/i,/long.?short/i,/^b\/s$/i,/^type$/i,/action/i]],['qty','Quantity',[/^qty$/i,/quantity/i,/contracts/i,/^size$/i,/qty/i]],['entry','Entry price',[/entry.?price/i,/^entry$/i,/open.?price/i,/avg.?entry/i]],['exit','Exit price',[/exit.?price/i,/^exit$/i,/close.?price/i,/avg.?exit/i]],['pnl','P&L (gross or net)',[/^p&?l$/i,/^pnl$/i,/net.?p/i,/realized/i,/profit/i,/p\/l/i,/pnl/i]],['fees','Fees / commission',[/fee/i,/commission/i]],['outcome','Outcome (Win / Loss / BE)',[/outcome/i,/^result$/i,/win.?loss/i]],['points','Points / handles',[/handle/i,/^points?$/i,/^pts$/i]],['rr','R:R achieved',[/risk.?to.?reward/i,/^r:?r$/i,/r.?multiple/i]],['rating','Rating',[/rating/i,/grade/i]],['strategy','Strategy / model',[/strategy/i,/setup/i,/playbook/i,/^model$/i]],['notes','Notes',[/note/i,/comment/i]],['buyPrice','Buy price (Tradovate style)',[/buy.?price/i]],['sellPrice','Sell price (Tradovate style)',[/sell.?price/i]],['buyTime','Bought time (Tradovate style)',[/bought.?time/i,/buy.?time/i]],['sellTime','Sold time (Tradovate style)',[/sold.?time/i,/sell.?time/i]]];
let imp=null;
function parseCSV(text){const rows=[];let row=[],f='',q=false;text=text.replace(/^\uFEFF/,'');
  for(let i=0;i<text.length;i++){const c=text[i];if(q){if(c==='"'){if(text[i+1]==='"'){f+='"';i++}else q=false}else f+=c}else if(c==='"')q=true;else if(c===','||c===';'&&!text.slice(0,200).includes(',')){row.push(f);f=''}else if(c==='\n'||c==='\r'){if(c==='\r'&&text[i+1]==='\n')i++;row.push(f);f='';if(row.some(x=>x.trim()!==''))rows.push(row);row=[]}else f+=c}
  row.push(f);if(row.some(x=>x.trim()!==''))rows.push(row);return rows}
const MON3=['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
function parseDT(s,fmt){s=String(s||'').trim();let date=null,time='';let m=s.match(/(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  const mn=s.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})/i)||s.match(/\b(\d{1,2})\s+(?:de\s+)?(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?,?\s+(?:de\s+)?(\d{4})/i);
  if(mn&&!m){const isA=isNaN(+mn[1]);const mo=MON3.indexOf((isA?mn[1]:mn[2]).toLowerCase().slice(0,3))+1;date=mn[3]+'-'+pad(mo)+'-'+pad(isA?mn[2]:mn[1]);s=s.replace(mn[0],'')}
  else if(m)date=m[1]+'-'+pad(m[2])+'-'+pad(m[3]);else if(!date){m=s.match(/(\d{1,2})[/.\-](\d{1,2})[/.\-](\d{2,4})/);if(m){let y=m[3].length===2?'20'+m[3]:m[3];const a=fmt==='DMY'?m[2]:m[1],b=fmt==='DMY'?m[1]:m[2];date=y+'-'+pad(a)+'-'+pad(b)}}
  const tm=s.replace(/^\S*\d{4}\S*|^\d{1,2}[/.\-]\d{1,2}[/.\-]\d{2,4}/,'').match(/(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?/i);
  if(tm){let hh=+tm[1];if(tm[3]){const pm=/pm/i.test(tm[3]);if(pm&&hh<12)hh+=12;if(!pm&&hh===12)hh=0}time=pad(hh)+':'+tm[2]}return{date,time}}
function rowToTrade(r,map,fmt,defStrat){const g=k=>map[k]!==''&&map[k]!=null?r[map[k]]:undefined;
  let side=g('side');let entry=g('entry'),exit=g('exit');let dt=parseDT(g('date'),fmt);
  if(blank(side)&&g('buyTime')&&g('sellTime')){const b=parseDT(g('buyTime'),fmt),s=parseDT(g('sellTime'),fmt);const long=(b.date+b.time)<=(s.date+s.time);side=long?'Long':'Short';if(!dt.date)dt=long?b:s}
  else if(!dt.date&&g('buyTime'))dt=parseDT(g('buyTime'),fmt);
  if(!blank(side)){side=/^(s|sell|short|sld)/i.test(String(side).trim())?'Short':'Long'}
  if(blank(entry)&&g('buyPrice')!=null&&g('sellPrice')!=null){entry=side==='Short'?g('sellPrice'):g('buyPrice');exit=side==='Short'?g('buyPrice'):g('sellPrice')}
  if(!dt.date)return null;const tmSep=g('time');
  const ocRaw=String(g('outcome')??'').trim();const oc=/^w/i.test(ocRaw)?'win':/^miss/i.test(ocRaw)?'missed':/^l/i.test(ocRaw)?'loss':/^(b|even|scratch)/i.test(ocRaw)?'be':'';
  const t={id:uid(),date:dt.date,time:tmSep?parseDT('2000-01-01 '+tmSep).time:dt.time,symbol:String(g('symbol')||'').trim(),side:side||'',qty:Math.abs(num(g('qty')))||1,entry:blank(entry)?'':num(entry),exit:blank(exit)?'':num(exit),
    pnl:0,fees:blank(g('fees'))?'':Math.abs(num(g('fees'))),strategy:String(g('strategy')||defStrat||'').trim(),notes:String(g('notes')||''),tags:[],mistakes:[],images:[],rating:0,risk:'',custom:{},
    title:String(g('title')||'').trim(),outcome:oc,points:blank(g('points'))?'':Math.abs(num(g('points'))),rr:blank(g('rr'))?'':Math.abs(num(g('rr')))};
  if(!blank(g('rating'))){const rv=parseFloat(String(g('rating')).split('/')[0]);if(isFinite(rv))t.rating=Math.max(0,Math.min(5,Math.round(rv)))}
  if(t.strategy.includes(',')){const parts=t.strategy.split(',').map(x=>x.trim()).filter(Boolean);t.strategy=parts[0]||'';t.tags=parts}
  if(!t.outcome&&blank(g('pnl'))&&blank(t.points)&&blank(t.entry))return {skip:true};
  if(!blank(g('pnl')))t.pnl=num(g('pnl'));else{const gr=calcGross(t);t.pnl=gr==null?0:Math.round(gr*100)/100}
  if(blank(t.fees))t.fees=Math.round(num(S.settings.feePerContract)*t.qty*100)/100;return t}
const dupKey=t=>[t.date,t.time,rootSym(t.symbol),t.qty,t.entry,t.exit,num(t.pnl).toFixed(2),t.title||'',t.points??'',t.outcome||''].join('|');
const usedCols=()=>new Set(Object.values(imp.map).filter(v=>v!==''&&v!=null).map(String));
async function runImport(){const hdr=imp.rows[0];const extras={};
  if(imp.extra!==false){const used=usedCols();hdr.forEach((h,i)=>{if(used.has(String(i))||/day.?of.?week|^(created|last edited)|^to fill$/i.test(h)||!h.trim())return;const vals=imp.rows.slice(1).map(r=>(r[i]||'').trim()).filter(Boolean);if(!vals.length)return;
    let cf=S.settings.customFields.find(c=>c.label.toLowerCase()===h.toLowerCase());const uniq=[...new Set(vals)];
    if(!cf){const multi=vals.some(v=>v.includes(','));cf={key:'cf_'+uid(),label:h,type:(!multi&&uniq.length<=15)?'select':(vals.every(v=>isFinite(num(v))&&/^[\d.\s-]+$/.test(v))?'number':'text'),options:(!multi&&uniq.length<=15)?uniq.join(', '):''};S.settings.customFields.push(cf)}
    else if(cf.type==='select'){const have=String(cf.options||'').split(',').map(x=>x.trim()).filter(Boolean);uniq.forEach(u=>{if(!have.includes(u))have.push(u)});cf.options=have.join(', ')}
    extras[i]=cf.key})}
  const out=[];const have=new Set(S.trades.map(dupKey));let skipped=0,bad=0,empty=0;
  for(const r of imp.rows.slice(1)){const t=rowToTrade(r,imp.map,S.settings.dateFormat,imp.strat);if(!t){bad++;continue}if(t.skip){empty++;continue}
    for(const i in extras){const v=(r[i]||'').trim();if(v)t.custom[extras[i]]=v}
    const k=dupKey(t);if(have.has(k)){skipped++;continue}have.add(k);out.push(t)}
  if(imp.notion){let done=0;const total=out.length;for(const t of out){const pg=matchPage(t);done++;if(!pg)continue;
      const prog=document.querySelector('[data-act="doImport"]');if(prog)prog.textContent='Reading pages '+done+'/'+total+'…';
      const body=mdNotes(pg.text);if(body)t.notes=(t.notes?t.notes+'\n\n':'')+body;
      for(const path of pg.images){const f=imp.notion.files[path];if(!f)continue;try{t.images.push(await shrink(await f.async('blob')))}catch(e){}}}}
  for(const t of out)if(t.strategy&&!S.settings.strategies.find(s=>s.name===t.strategy))S.settings.strategies.push({name:t.strategy,rules:'',color:'#5AB0FF'});
  const noMoney=out.length>0&&out.every(t=>!num(t.pnl)&&blank(t.entry))&&out.some(t=>!blank(t.points));
  S.trades.push(...out);S.settings.lastMapping={hdr:hdr.join('|'),map:imp.map};if(noMoney)S.settings.unit=out.some(t=>!blank(t.rr))?'R':'points';imp=null;save();calMonth=null;
  toast(`Imported ${out.length} trades${skipped?`, ${skipped} duplicates skipped`:''}${bad+empty?`, ${bad+empty} incomplete ${bad+empty===1?'row':'rows'} skipped`:''}`);go('overview')}
/* ---------- Notion export (.zip) ---------- */
function loadJSZip(){if(window.JSZip)return Promise.resolve();return new Promise((res,rej)=>{const sc=document.createElement('script');sc.src='https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';sc.onload=res;sc.onerror=()=>rej(new Error('Could not load the zip reader. Connect to the internet once, or unzip the export and import the CSV inside it.'));document.head.appendChild(sc)})}
async function readZip(file){await loadJSZip();const files={};const add=async z=>{for(const [path,f] of Object.entries(z.files)){if(f.dir)continue;if(/\.zip$/i.test(path))await add(await JSZip.loadAsync(await f.async('blob')));else files[path.normalize('NFC')]=f}};await add(await JSZip.loadAsync(file));return files}
function joinPath(dir,rel){const parts=(dir?dir.split('/'):[]);for(const seg of rel.split('/')){if(seg==='..')parts.pop();else if(seg&&seg!=='.')parts.push(seg)}return parts.join('/')}
function mdNotes(text){const L=text.replace(/\r/g,'').split('\n');let i=0;while(i<L.length&&!/^#\s/.test(L[i]))i++;i++;while(i<L.length&&!L[i].trim())i++;
  while(i<L.length&&/^[A-Za-z][^:\n]{0,40}:\s/.test(L[i])&&!/^(mistakes|learnings|notes?)\s*:/i.test(L[i]))i++;
  return L.slice(i).filter(l=>!/^\s*!\[[^\]]*\]\([^)]*\)\s*$/.test(l)&&!/^\s*<\/?(aside|img)/i.test(l)).map(l=>l.replace(/\*\*/g,'').replace(/^#{1,6}\s+/,'').replace(/(^|[\s-])\*([^*\n]+)\*(?=\s|$)/g,'$1$2').replace(/^\s{4,}/,'  ').replace(/\s+$/,'')).join('\n').replace(/^(\s*-\s*)?(SMT|[\w ]*Timeframe|A N A L Y S I S|P O S T - T R A D E|-{3,})\s*$/gim,'').replace(/\n{3,}/g,'\n\n').trim()}
function matchPage(t){const P=imp.notion.pages;const norm=x=>String(x||'').toLowerCase().replace(/[^a-z0-9]+/g,'');
  return P.find(p=>p.date===t.date&&norm(p.title)===norm(t.title))||(P.filter(p=>p.date===t.date).length===1?P.find(p=>p.date===t.date):null)}
async function importNotionZip(file){toast('Reading Notion export…');return importNotionFiles(await readZip(file))}
async function importNotionFolder(list){const files={};for(const f of list){const pth=(f.webkitRelativePath||f.name).normalize('NFC');if(/(^|\/)\.DS_Store$/.test(pth))continue;files[pth]={async:t=>t==='string'?f.text():Promise.resolve(f)}}
  if(!Object.keys(files).some(k=>/\.csv$/i.test(k))){toast('No database CSV in that folder. Pick the whole unzipped Notion export folder.');return}return importNotionFiles(files)}
async function importNotionFiles(files){const keys=Object.keys(files);
  const csvs=keys.filter(k=>/\.csv$/i.test(k));if(!csvs.length){toast('No database CSV found in that export. In Notion, export the database page as "Markdown & CSV".');return}
  const csvKey=csvs.find(k=>/_all\.csv$/i.test(k))||csvs[0];const rows=parseCSV(await files[csvKey].async('string'));if(rows.length<2){toast('The database in that export has no rows');return}
  const pages=[];let imgCount=0;for(const k of keys.filter(k=>/\.md$/i.test(k))){const text=await files[k].async('string');const tm=text.match(/^#\s+(.+)$/m),dm=text.match(/^Date:\s*(.+)$/m);if(!tm)continue;
    const dir=k.includes('/')?k.slice(0,k.lastIndexOf('/')):'';const images=[...text.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)].map(m=>m[1]).filter(u=>!/^https?:/i.test(u)).map(u=>{try{return joinPath(dir,decodeURIComponent(u)).normalize('NFC')}catch(e){return joinPath(dir,u)}}).filter(pth=>files[pth]);
    imgCount+=images.length;pages.push({title:tm[1].trim(),date:dm?parseDT(dm[1],S.settings.dateFormat).date:null,text,images})}
  setupMapping(csvKey.split('/').pop(),rows);imp.notion={files,pages,imgCount};render()}
function setupMapping(name,rows){const hdr=rows[0].map(h=>h.trim());rows[0]=hdr;let map={};const lm=S.settings.lastMapping;
  if(lm&&lm.hdr===hdr.join('|'))map=Object.assign({},lm.map);else{const used=new Set();for(const [k,,res] of IMPORT_FIELDS){for(const re of res){const i=hdr.findIndex((h,ix)=>!used.has(ix)&&re.test(h));if(i>=0){map[k]=String(i);used.add(i);break}}}}
  imp={name,rows,map,strat:'',extra:true}}
function shrink(file){return new Promise(res=>{const img=new Image();const url=URL.createObjectURL(file);img.onload=()=>{const sc=Math.min(1,1400/img.width);const c=document.createElement('canvas');c.width=img.width*sc;c.height=img.height*sc;c.getContext('2d').drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(url);res(c.toDataURL('image/jpeg',.8))};img.onerror=()=>{URL.revokeObjectURL(url);res(null)};img.src=url}).then(v=>{if(!v)throw new Error('bad image');return v}).then(v=>NATIVE?nat('imageSave',{data:v}):v)}
function toCSV(){const cf=S.settings.customFields;const head=['date','time','symbol','qty','entry','exit','gross_pnl','fees','net_pnl','risk','r_multiple','strategy','rating','tags','mistakes','notes',...cf.map(c=>c.label)];
  const q=v=>{v=String(v??'');return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v};
  return [head.join(','),...sortTrades(S.trades).map(t=>[t.date,t.time,t.symbol,t.qty,t.entry,t.exit,t.pnl,t.fees,net(t).toFixed(2),t.risk,rMult(t)?.toFixed(2)??'',t.strategy,t.rating,(t.tags||[]).join('; '),(t.mistakes||[]).join('; '),t.notes,...cf.map(c=>(t.custom||{})[c.key]??'')].map(q).join(','))].join('\n')}
