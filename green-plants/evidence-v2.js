'use strict';
(()=>{
const D=window.PLANT_EVIDENCE;
const $=s=>document.querySelector(s), esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sources=Object.fromEntries(D.sources.map(s=>[s.id,s]));
let limit=24,mode='all';
const defaults={plant:'all',species:'all',kind:'all',source:'all',topic:'all',group:'none',q:''};
const params=new URLSearchParams(location.search), state={...defaults};
for(const k of Object.keys(state))if(params.has(k))state[k]=params.get(k);
mode=params.get('mode')==='products'?'products':'all';
function opts(sel,items,all){$(sel).innerHTML=`<option value="all">${esc(all)}</option>`+items.map(([k,v])=>`<option value="${esc(k)}">${esc(v)}</option>`).join('');}
opts('#plant',Object.entries(D.plants),'全部植物');opts('#kind',Object.entries(D.kinds),'全部来源类型');opts('#topic',Object.entries(D.topics),'全部养护主题');
opts('#source',D.sources.map(s=>[s.id,s.author+' · '+s.title]),'全部作者 / 信息源');
const species=[...new Set(D.records.flatMap(r=>r.species||[]))].sort();opts('#species',species.map(s=>[s,s]),'全部物种 / 品种');
for(const k of ['plant','species','kind','source','topic','group']){const el=$('#'+k);el.value=state[k];if(!el.value){state[k]=defaults[k];el.value=defaults[k];}}
$('#search').value=state.q;
function safeLink(url,text,cls=''){return /^https?:\/\//.test(url)?`<a class="${cls}" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(text)}</a>`:esc(text);}
function rich(text){return esc(text).replace(/\[(\d+)\]/g,(m,n)=>sources['s'+n]?safeLink(sources['s'+n].url,m,'cite'):m);}
function productHTML(p){if(!p)return '';const e=p.element_analysis||{};const vals=['N','P','K'].map(k=>e[k]==null?'未披露':Number(e[k]).toFixed(3).replace(/\.?0+$/,''));const data=[['厂家 / 产品',p.brand+' · '+p.name],['专项用途',p.target],['剂型',p.form],['标签 NPK',p.label_npk],['标签口径',p.basis],['元素N、P、K分析',vals.join(' / ')+'；同原百分数基准'],['元素质量比（N=1）',p.element_ratio||'信息不足，不换算'],['称重 / 体积剂量',p.dose],['EC及测量条件',p.ec],['微量元素',p.micro]];return '<dl class="product-info">'+data.map(([k,v])=>`<dt>${esc(k)}</dt><dd>${rich(v||'未披露')}</dd>`).join('')+'</dl><p class="limits">'+esc(p.conversion_note||'元素比例不是摩尔比；标签配方不是最优试验证据。')+'</p>';}
function card(r){const s=sources[r.source_ids[0]],p=r.product;const cover=s.image?`<a class="cover-link" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer"><img class="cover ${p?'product':''}" src="${esc(s.image)}" alt="${esc(s.image_caption||s.title)}" width="128" height="118" loading="lazy"></a><div class="cover-caption">${esc(s.image_caption||'来源页图片')}<br>${safeLink(s.image_url||s.url,'图片出处')}</div>`:`<div class="cover-missing"><strong>${s.kind==='research'?'PAPER':s.kind==='video'?'VIDEO':p?'LABEL':'SOURCE'}</strong><span>无已核验封面</span></div>`;
 const tags=[...(r.plants||[]).map(x=>`<span class="tag">${esc(D.plants[x]||x)}</span>`),...(r.species||[]).map(x=>`<span class="tag">${esc(x)}</span>`),...(r.topics||[]).map(x=>`<span class="tag topic">${esc(D.topics[x]||x)}</span>`)];
 if(p)tags.push(`<span class="tag basis">${esc(p.notation==='oxide'?'氧化物标签':p.notation==='element'?'元素标签':'标签口径未明')} · ${esc(p.concentration_basis||'基准未明')}</span>`);
 const quote=(r.quote||'').split(/\s+/).slice(0,85).join(' ');const truncated=(r.quote||'').split(/\s+/).length>85;
 return `<article class="evidence" id="${esc(r.id)}" data-id="${esc(r.id)}"><div>${cover}</div><div><div class="source-line">${safeLink(s.url,s.author||s.title)}<span class="source-kind">${esc(D.kinds[s.kind]||s.kind)} · ${esc(s.accessed)}</span></div><h3>${safeLink(s.url,r.title+' ↗')}</h3><div class="tags">${tags.join('')}</div><p class="body-text">${rich(r.text)}</p>${p?`<p class="scope"><strong>标签 ${esc(p.label_npk)}</strong> ｜ 元素 N:P:K = ${esc(p.element_ratio||'未确定')}（N=1）；不是摩尔比</p>`:''}<p class="scope">适用：${rich(r.scope)}</p><p class="limits">${rich(r.limitations)}</p><details><summary>${p?'标签、剂量、微量元素与原文':'原文摘录与出处'}</summary>${p?productHTML(p):''}<blockquote>${esc(quote)}${truncated?' …':''}</blockquote><p class="scope">短引文仅展示局部；完整语境以原文为准。${safeLink(s.url,s.title)}</p></details><div class="meta-links">${r.source_ids.map(sid=>safeLink(sources[sid].url,'原文 ['+sources[sid].number+']')).join('')}<a href="#${esc(r.id)}" aria-label="本条证据定位">本条定位</a></div></div></article>`;
}
function matches(r){const ss=r.source_ids.map(id=>sources[id]);return (mode!=='products'||r.product)&&(state.plant==='all'||r.plants.includes(state.plant))&&(state.species==='all'||(r.species||[]).includes(state.species))&&(state.kind==='all'||ss.some(s=>s.kind===state.kind))&&(state.source==='all'||r.source_ids.includes(state.source))&&(state.topic==='all'||r.topics.includes(state.topic))&&(!state.q||JSON.stringify([r,ss.map(s=>[s.title,s.author])]).toLowerCase().includes(state.q.toLowerCase()));}
function groupkey(r){return state.group==='source'?sources[r.source_ids[0]].title:state.group==='plant'?r.plants.map(p=>D.plants[p]||p).join(' / '):'';}
function updateURL(){const q=new URLSearchParams();for(const [k,v] of Object.entries(state))if(v!==defaults[k])q.set(k,v);if(mode==='products')q.set('mode',mode);try{history.replaceState(null,'',location.pathname+(q.toString()?'?'+q:'')+location.hash);}catch(_){}}
function render(){let rows=D.records.filter(matches);if(state.group!=='none')rows.sort((a,b)=>groupkey(a).localeCompare(groupkey(b),'zh-CN'));const selected=rows.slice(0,limit);let h='',last=null;
 for(const r of selected){const g=groupkey(r);if(g&&g!==last){h+=`<h2 class="group-heading">${esc(g)}</h2>`;last=g;}h+=card(r);}
 $('#results').innerHTML=h||'<div class="empty">没有匹配证据。请减少筛选条件，或重置后再搜索。</div>';
 const ns=new Set(rows.flatMap(r=>r.source_ids)).size;
 $('#result-count').textContent=`${rows.length} 条证据 · ${ns} 个来源 · 已显示 ${selected.length} 条`;
 $('#load-more').hidden=rows.length<=limit;$('#load-more').textContent=`继续显示（剩余 ${Math.max(0,rows.length-selected.length)} 条）`;
 $('#mode-all').setAttribute('aria-pressed',String(mode==='all'));$('#mode-products').setAttribute('aria-pressed',String(mode==='products'));
 $('#active-note').textContent=state.plant==='hoya'?'Hoya 按具体物种、试验条件与种植者环境阅读；通用肥标签不等于球兰专属验证。':'原七类资料保留。厂家用途、种植者实践和独立试验分开呈现；没有封面时明确留空。';
 updateURL();window.__evidenceFiltered=rows.map(r=>r.id);}
for(const k of ['plant','species','kind','source','topic','group'])$('#'+k).addEventListener('change',e=>{state[k]=e.target.value;limit=24;render();});
$('#search').addEventListener('input',e=>{state.q=e.target.value.trim();limit=24;render();});
function reset(){Object.assign(state,defaults);for(const k of ['plant','species','kind','source','topic','group'])$('#'+k).value=state[k];$('#search').value='';mode='all';limit=24;}
$('#reset').addEventListener('click',()=>{reset();render();});$('#quick-hoya').addEventListener('click',()=>{reset();state.plant='hoya';$('#plant').value='hoya';render();});$('#quick-ec').addEventListener('click',()=>{reset();state.topic='ec';$('#topic').value='ec';render();});$('#quick-video').addEventListener('click',()=>{reset();state.kind='video';$('#kind').value='video';render();});
$('#mode-all').addEventListener('click',()=>{mode='all';limit=24;render();});$('#mode-products').addEventListener('click',()=>{mode='products';limit=24;render();});$('#load-more').addEventListener('click',()=>{limit+=24;render();});
const media=matchMedia('(min-width:901px)');function filterDisplay(){if(media.matches)$('#filters').open=true;else $('#filters').open=false;}filterDisplay();media.addEventListener('change',filterDisplay);
function number(id,min,max){const raw=$('#'+id).value,n=Number(raw);return raw!==''&&Number.isFinite(n)&&n>=min&&n<=max?n:null;}
function calculate(){const N=number('calc-n',0.001,100),P=number('calc-p',0,100),K=number('calc-k',0,100),target=number('calc-target',0,2000),basis=$('#calc-basis').value,form=$('#calc-form').value;
 if([N,P,K,target].some(x=>x===null)){$('#npk-output').textContent='请输入有效数值';return;}
 const p=basis==='oxide'?P*.4364:P,k=basis==='oxide'?K*.8301:K,dose=target/(10*N);
 $('#npk-output').textContent=`元素 N:P:K = 1 : ${(p/N).toFixed(3)} : ${(k/N).toFixed(3)}\n${form==='ww'?'干粉称重':'液肥量取'} ${dose.toFixed(3)} ${form==='ww'?'g/L':'mL/L'}\n最终 N / P / K ≈ ${target.toFixed(1)} / ${(dose*10*p).toFixed(1)} / ${(dose*10*k).toFixed(1)} mg/L`;
}
for(const id of ['calc-n','calc-p','calc-k','calc-target','calc-basis','calc-form'])$('#'+id).addEventListener('input',calculate);
function dli(){const p=number('ppfd',0,5000),h=number('hours',0,24);$('#dli-output').textContent=p===null||h===null?'请输入有效数值':(p*h*.0036).toFixed(2)+' mol·m⁻²·d⁻¹';}for(const id of ['ppfd','hours'])$('#'+id).addEventListener('input',dli);
$('#dataset-total').textContent=`${D.records.length} 条证据 · ${D.sources.length} 个信息源 · ${D.records.filter(r=>r.product).length} 个产品条目 · ${D.updated}`;
render();calculate();dli();
if(location.hash){const id=decodeURIComponent(location.hash.slice(1));const i=window.__evidenceFiltered.indexOf(id);if(i>=0){limit=Math.max(24,i+1);render();document.getElementById(id)?.scrollIntoView();}}
})();
