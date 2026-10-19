'use strict';
const filterButtons=[...document.querySelectorAll('[data-filter]')];
let active='all';
function applyFilters(){const q=document.querySelector('#search').value.trim().toLowerCase();let n=0;document.querySelectorAll('tbody tr[data-plant]').forEach(row=>{const ok=(active==='all'||row.dataset.plant===active)&&row.dataset.search.toLowerCase().includes(q);row.hidden=!ok;document.querySelector('#plant-'+row.dataset.plant).hidden=!ok;if(ok)n++;});document.querySelector('#result-count').textContent=`显示 ${n} / 7 类植物`;document.querySelector('#empty').style.display=n?'none':'block';}
filterButtons.forEach(b=>b.addEventListener('click',()=>{active=b.dataset.filter;filterButtons.forEach(x=>x.setAttribute('aria-pressed',String(x===b)));applyFilters();}));
document.querySelector('#search').addEventListener('input',applyFilters);
function finiteValue(id,min,max){const el=document.getElementById(id),raw=el.value.trim(),n=Number(raw);return raw!==''&&Number.isFinite(n)&&n>=min&&n<=max?n:null;}
function dli(){const p=finiteValue('ppfd',0,5000),h=finiteValue('hours',0,24);document.getElementById('dli-output').textContent=p===null||h===null?'请输入有效范围':`${(p*h*0.0036).toFixed(2)} mol·m⁻²·d⁻¹`;}
function dose(){const n=finiteValue('nitrogen',0.01,100),t=finiteValue('target-n',0,1000);document.getElementById('dose-output').textContent=n===null||t===null?'请输入有效范围':`${(t/(10*n)).toFixed(3)} g/L` ;}
['ppfd','hours'].forEach(id=>document.getElementById(id).addEventListener('input',dli));
['nitrogen','target-n'].forEach(id=>document.getElementById(id).addEventListener('input',dose));
document.querySelector('#print').addEventListener('click',()=>window.print());
dli();dose();applyFilters();
