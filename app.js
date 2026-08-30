(function(){
 const D=window.APP_DATA;
 const grid=document.getElementById('grid'),filters=document.getElementById('filters');
 const q=document.getElementById('q'),sectionTitle=document.getElementById('sectionTitle'),sectionDesc=document.getElementById('sectionDesc');
 const sectionCount=document.getElementById('sectionCount'),homeView=document.getElementById('homeView'),sectionView=document.getElementById('sectionView');
 const homeGrid=document.getElementById('homeGrid'),breadcrumbTitle=document.getElementById('breadcrumbTitle');
 let current=(location.hash||'#inicio').slice(1),subgroup='Todos';
 const fmtSize=n=>{if(n<1024*1024)return Math.max(1,Math.round(n/1024))+' KB';return (n/1024/1024).toFixed(n>10*1024*1024?0:1)+' MB'};
 function escapeHtml(s){return String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
 function goHome(){if(location.hash==='#inicio'||!location.hash){showHome();return}location.hash='inicio'}
 function homeCard(s,i){
   return `<a class="home-card" href="#${escapeHtml(s.id)}" aria-label="Abrir ${escapeHtml(s.label)}">
     <span class="home-number">${String(i+1).padStart(2,'0')}</span>
     <span class="home-card-body"><strong>${escapeHtml(s.label)}</strong><small>${escapeHtml(s.desc)}</small></span>
     <span class="home-card-foot"><b>${s.count}</b> itens <span class="home-arrow" aria-hidden="true">›</span></span>
   </a>`
 }
 function renderHome(){homeGrid.innerHTML=D.sections.map(homeCard).join('')}
 function showHome(){
   current='inicio';homeView.hidden=false;sectionView.hidden=true;document.title='Reuniões Especiais';renderHome();window.scrollTo(0,0)
 }
 function setSection(){
   if(current==='inicio'||!D.sections.some(s=>s.id===current)){showHome();return}
   const s=D.sections.find(x=>x.id===current);homeView.hidden=true;sectionView.hidden=false;
   sectionTitle.textContent=s.label;breadcrumbTitle.textContent=s.label;sectionDesc.textContent=s.desc;sectionCount.textContent=s.count;
   document.title=s.label+' — Reuniões Especiais';subgroup='Todos';q.value='';buildFilters();render();window.scrollTo(0,0)
 }
 function buildFilters(){
   let arr=D.entries.filter(e=>e.section===current);let groups=['Todos',...new Set(arr.map(e=>e.subgroup).filter(Boolean))];
   groups.sort((a,b)=>a==='Todos'?-1:b==='Todos'?1:a.localeCompare(b,'pt-BR',{numeric:true}));filters.innerHTML='';
   groups.forEach(g=>{const b=document.createElement('button');b.textContent=g;b.className=g===subgroup?'active':'';b.onclick=()=>{subgroup=g;[...filters.children].forEach(x=>x.classList.toggle('active',x.textContent===g));render()};filters.appendChild(b)})
 }
 function viewerLink(e){const p=new URLSearchParams({file:e.openPath,title:e.title,type:e.type});return 'viewer.html?'+p.toString()}
 function card(e){
   const official=e.official?'<span class="pill official">JW/WOL</span>':'';const year=e.year?`<span class="pill">${escapeHtml(e.year)}</span>`:'';
   const lang=e.language?`<span class="pill">${escapeHtml(e.language)}</span>`:'';const num=e.number?`<span class="pill">Nº ${escapeHtml(e.number)}</span>`:'';
   const cat=e.catalogTitle?`<div class="catalog"><b>Catálogo:</b> ${escapeHtml(e.catalogTitle)}</div>`:'';const off=e.official?`<a class="gold" href="${escapeHtml(e.official)}" target="_blank" rel="noopener">Fonte JW/WOL</a>`:'';
   const dl=e.downloadPath?`<a href="${encodeURI(e.downloadPath)}" download>EPUB</a>`:'';const open=e.type==='PWA'?`<a class="primary module-open" href="${encodeURI(e.openPath)}">Abrir módulo</a>`:`<a class="primary" href="${viewerLink(e)}">Abrir no leitor</a>`;
   return `<article class="card"><div class="meta"><span class="pill">${escapeHtml(e.type)}</span>${year}${lang}${num}${official}</div><h3>${escapeHtml(e.title)}</h3><div class="filename">${escapeHtml(e.filename)} · ${fmtSize(e.size)}</div>${cat}<div class="actions">${open}${off}${dl}</div></article>`
 }
 function render(){
   let term=q.value.trim().toLocaleLowerCase('pt-BR');let arr=D.entries.filter(e=>e.section===current&&(subgroup==='Todos'||e.subgroup===subgroup));
   if(term)arr=arr.filter(e=>(e.title+' '+e.filename+' '+e.year+' '+e.subgroup+' '+e.language+' '+e.catalogTitle).toLocaleLowerCase('pt-BR').includes(term));
   grid.innerHTML=arr.length?arr.map(card).join(''):'<div class="empty">Nenhum arquivo encontrado com este filtro.</div>';document.getElementById('visibleCount').textContent=arr.length
 }
 q.addEventListener('input',render);window.addEventListener('hashchange',()=>{current=(location.hash||'#inicio').slice(1);setSection()});
 document.getElementById('homeBtn').onclick=goHome;document.getElementById('sectionHomeBtn').onclick=goHome;
 if(current==='inicio'||!D.sections.some(s=>s.id===current))showHome();else setSection();
 let deferred;const install=document.getElementById('installBtn');window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e;install.style.display='inline-flex'});
 install.onclick=async()=>{if(!deferred)return;deferred.prompt();await deferred.userChoice;deferred=null;install.style.display='none'};
 if('serviceWorker' in navigator&&location.protocol!=='file:')navigator.serviceWorker.register('service-worker.js').catch(()=>{});
})();
