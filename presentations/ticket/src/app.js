(() => {
  'use strict';
  const DATA = JSON.parse(document.getElementById('dashboard-data').textContent);
  const ALL = DATA.tickets;
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fmt = (v, digits=0) => v == null || !Number.isFinite(v) ? '—' : v.toLocaleString('fr-FR',{minimumFractionDigits:digits,maximumFractionDigits:digits});
  const pct = (a,b,digits=1) => b ? fmt(a / b * 100, digits) + ' %' : '—';
  const valid = v => typeof v === 'number' && Number.isFinite(v);
  const sum = arr => arr.reduce((a,b) => a + (valid(b) ? b : 0),0);
  const mean = arr => arr.length ? sum(arr)/arr.length : null;
  const median = arr => { const a=arr.filter(valid).sort((a,b)=>a-b),m=Math.floor(a.length/2);return a.length ? a.length%2 ? a[m] : (a[m-1]+a[m])/2 : null; };
  const dateLabel = (s, opts={day:'2-digit',month:'short',year:'numeric'}) => s ? new Date(s.slice(0,10)+'T12:00:00').toLocaleDateString('fr-FR',opts) : 'Non renseignée';
  const fold = v => String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const initials = name => name.replace(/[()]/g,'').split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase();
  const shortProject = s => s.replace('Hébergement – ','');
  const icons = {
    layers:'<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 16l9 5 9-5"/>',
    grid:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    chart:'<path d="M3 3v18h18M6 15l4-5 4 3 6-7"/>',
    users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/><circle cx="9" cy="7" r="4"/>',
    ticket:'<path d="M4 5h16v5a2 2 0 0 0 0 4v5H4v-5a2 2 0 0 0 0-4V5Z"/><path d="M14 5v2m0 3v4m0 3v2"/>',
    server:'<rect x="3" y="3" width="18" height="7" rx="2"/><rect x="3" y="14" width="18" height="7" rx="2"/><path d="M7 6.5h.01M7 17.5h.01M11 6.5h6M11 17.5h6"/>',
    info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10h.01"/>',
    expand:'<path d="M8 3H3v5m13-5h5v5M3 16v5h5m8 0h5v-5"/>',
    download:'<path d="M12 3v12m-4-4 4 4 4-4M4 16v5h16v-5"/>',
    calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/>',
    folder:'<path d="M3 7V5h6l2 2h10v13H3V7Z"/>',
    sliders:'<path d="M3 6h4m4 0h10M3 12h10m4 0h4M3 18h4m4 0h10"/><circle cx="9" cy="6" r="2"/><circle cx="15" cy="12" r="2"/><circle cx="9" cy="18" r="2"/>',
    check:'<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    inbox:'<path d="M4 4h16l2 12v4H2v-4L4 4Z"/><path d="M2 16h6l2 2h4l2-2h6"/>',
    spark:'<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z"/>',
    search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
    close:'<path d="m6 6 12 12M6 18 18 6"/>',
  };
  const icon = name => `<span data-icon="${name}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]||icons.info}</svg></span>`;
  function hydrateIcons(root=document){root.querySelectorAll('[data-icon]:empty').forEach(el=>el.innerHTML=icon(el.dataset.icon).match(/<svg[\s\S]*<\/svg>/)[0]);}
  const state = {page:'overview',year:'all',project:'',owner:'',urgency:'',type:'',from:'',to:'',status:'',query:'',pageIndex:0,sort:'created',direction:-1,chartMode:'volume',granularity:'month',teamSort:'resolved',category:'project',responseThreshold:DATA.responseThreshold,resolutionThreshold:DATA.resolutionThreshold};
  let chartObservers = [];
  const pages = {
    overview:['Vue d’ensemble','LE SUPPORT, EN UN REGARD','Les tickets, en perspective','Comprendre l’activité, suivre les délais et identifier les priorités.'],
    evolution:['Évolution','L’ACTIVITÉ AU FIL DU TEMPS','Prendre du recul','Suivre les volumes, les résolutions et le stock de tickets mois après mois.'],
    team:['Équipe','LE COLLECTIF EN ACTION','L’activité, côté équipe','Explorer les volumes et les délais par responsable de ticket.'],
    categories:['Répartition','CHAQUE TICKET A SON CONTEXTE','Comprendre la demande','Explorer les projets, les types de demandes et les niveaux d’urgence.'],
    tickets:['Tous les tickets','AU PLUS PRÈS DES DONNÉES','Derrière chaque chiffre, un ticket','Rechercher, filtrer et ouvrir le détail des tickets de votre sélection.']
  };
  const years=[...new Set(ALL.map(t=>String(t.createdYear)))].sort();
  const minDate=ALL.map(t=>t.created.slice(0,10)).sort()[0];
  function filtered(){return ALL.filter(t=>(state.year==='all'||String(t.createdYear)===state.year)&&(!state.project||t.project===state.project)&&(!state.owner||t.owner===state.owner)&&(!state.urgency||t.urgency===state.urgency)&&(!state.type||t.type===state.type)&&(!state.from||t.created.slice(0,10)>=state.from)&&(!state.to||t.created.slice(0,10)<=state.to));}
  function metrics(rows){
    const resolved=rows.filter(t=>t.status==='Résolu'),response=rows.map(t=>t.responseDays).filter(valid),resolution=resolved.map(t=>t.resolutionDays).filter(valid),open=rows.filter(t=>t.status==='Ouvert');
    return {total:rows.length,resolved:resolved.length,rejected:rows.filter(t=>t.status==='Rejeté').length,open:open.length,response,resolution,medResponse:median(response),medResolution:median(resolution),avgResolution:mean(resolution),avgAge:mean(open.map(t=>t.ageDays).filter(valid)),hours:sum(rows.map(t=>t.hours)),onTime:resolution.filter(d=>d<=state.resolutionThreshold).length,responseOnTime:response.filter(d=>d<=state.responseThreshold).length};
  }
  function badge(status){return `<span class="pill ${status==='Résolu'?'green':status==='Ouvert'?'orange':'gray'}">${esc(status)}</span>`;}
  function empty(message='Aucun ticket ne correspond à ces filtres.'){return `<div class="empty-state">${icon('search')}<h3>Aucun résultat</h3><p>${esc(message)}</p><button class="button" data-action="reset">Réinitialiser les filtres</button></div>`;}
  function showToast(message){$('#toast').textContent=message;$('#toast').classList.add('show');clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>$('#toast').classList.remove('show'),3500);}
  function options(field,allLabel,short=false){return `<option value="">${allLabel}</option>`+[...new Set(ALL.map(t=>t[field]))].sort((a,b)=>a.localeCompare(b,'fr')).map(v=>`<option value="${esc(v)}">${esc(short?shortProject(v):v)}</option>`).join('');}
  function init(){
    $('#nav-count').textContent=fmt(ALL.length);
    $('#source-date').textContent=dateLabel(DATA.exportedAt,{day:'numeric',month:'long',year:'numeric'});
    $('#snapshot-date').textContent='Extraction du '+dateLabel(DATA.exportedAt,{day:'2-digit',month:'2-digit',year:'numeric'});
    $('#project-filter').innerHTML=options('project','Tous les projets',true);
    $('#owner-filter').innerHTML=options('owner','Tous les responsables');
    $('#urgency-filter').innerHTML=options('urgency','Toutes les urgences');
    $('#type-filter').innerHTML=options('type','Tous les types');
    $('#year-tabs').innerHTML=[['all','Tout'],...years.map(y=>[y,y])].map(([v,l])=>`<button data-year="${v}" title="${v==='all'?'Toutes les années':'Tickets créés en '+v}">${l}</button>`).join('');
    for(const key of ['project','owner','urgency','type','from','to']){
      $('#'+key+'-filter').addEventListener('change',e=>{state[key]=e.target.value;state.pageIndex=0;render();});
    }
    $('#more-filter').addEventListener('click',()=>{const open=$('#extra-filters').hidden;$('#extra-filters').hidden=!open;$('#more-filter').setAttribute('aria-expanded',String(open));});
    $('#reset').addEventListener('click',reset);
    $('#export').addEventListener('click',exportCSV);
    $('#fullscreen').addEventListener('click',async()=>{
      try{if(document.fullscreenElement){await document.exitFullscreen();}else if(document.documentElement.requestFullscreen){await document.documentElement.requestFullscreen();}else{document.body.classList.toggle('presenting');showToast('Mode présentation activé · Échap pour quitter');}}catch{document.body.classList.toggle('presenting');showToast('Mode présentation · Échap pour quitter');}
    });
    document.addEventListener('fullscreenchange',()=>{document.body.classList.toggle('presenting',!!document.fullscreenElement);$('#fullscreen').setAttribute('aria-label',document.fullscreenElement?'Quitter le plein écran':'Passer en plein écran');});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!document.fullscreenElement)document.body.classList.remove('presenting');});
    $('#detail-dialog').addEventListener('click',e=>{if(e.target===$('#detail-dialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}});
    document.addEventListener('click',handleClick);
    window.addEventListener('hashchange',()=>navigate(location.hash.slice(1)));
    document.addEventListener('change',e=>{
      if(e.target.id==='team-sort'){state.teamSort=e.target.value;render();}
      if(e.target.id==='category-select'){state.category=e.target.value;render();}
      if(e.target.matches('[data-threshold]')){
        const value=Number(e.target.value);if(!e.target.value||!Number.isFinite(value)||value<0||value>10000){e.target.value=state[e.target.dataset.threshold];return;}
        state[e.target.dataset.threshold]=value;render();showToast('Seuil mis à jour sur toute la sélection');
      }
    });
    document.addEventListener('input',e=>{if(e.target.id==='ticket-search'){state.query=e.target.value;state.pageIndex=0;renderTicketResults();}});
    hydrateIcons();navigate(location.hash.slice(1));
  }
  function reset(){Object.assign(state,{year:'all',project:'',owner:'',urgency:'',type:'',from:'',to:'',status:'',query:'',pageIndex:0});render();}
  function navigate(page){state.page=pages[page]?page:'overview';state.pageIndex=0;render();window.scrollTo({top:0});}
  function go(page){if(location.hash==='#'+page)navigate(page);else location.hash=page;}
  function handleClick(e){
    const b=e.target.closest('button,[data-owner],[data-ticket]');if(!b)return;
    if(b.dataset.year){state.year=b.dataset.year;state.pageIndex=0;render();}
    if(b.dataset.action==='reset')reset();
    if(b.dataset.action==='method')showMethod();
    if(b.dataset.action==='close-dialog')$('#detail-dialog').close();
    if(b.dataset.owner!==undefined){state.owner=b.dataset.owner;state.status='';state.query='';go('tickets');}
    if(b.dataset.ticket)showTicket(Number(b.dataset.ticket));
    if(b.dataset.go)go(b.dataset.go);
    if(b.dataset.status!==undefined){state.status=b.dataset.status;state.pageIndex=0;state.query='';if(state.page==='tickets')render();else go('tickets');}
    if(b.dataset.mode){state.chartMode=b.dataset.mode;render();}
    if(b.dataset.granularity){state.granularity=b.dataset.granularity;render();}
    if(b.dataset.sort){state.direction=state.sort===b.dataset.sort?-state.direction:-1;state.sort=b.dataset.sort;state.pageIndex=0;renderTicketResults();}
    if(b.dataset.paginate){state.pageIndex+=Number(b.dataset.paginate);renderTicketResults();}
    if(b.dataset.categoryValue!==undefined){
      if(['project','type','urgency'].includes(state.category)){state[state.category]=b.dataset.categoryValue;state.status='';state.query='';go('tickets');}
    }
  }
  function render(){
    chartObservers.forEach(observer=>observer.disconnect());chartObservers=[];
    const rows=filtered(),m=metrics(rows),p=pages[state.page];
    $('#breadcrumb').textContent=p[0];$('#eyebrow').textContent=p[1];$('#page-title').innerHTML=esc(p[2])+'<span>.</span>';$('#page-subtitle').textContent=p[3];
    $$('nav [data-page]').forEach(el=>{el.classList.toggle('active',el.dataset.page===state.page);if(el.dataset.page===state.page)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current');el.title=pages[el.dataset.page][0];});
    $$('[data-year]').forEach(el=>{el.classList.toggle('active',el.dataset.year===state.year);el.setAttribute('aria-pressed',String(el.dataset.year===state.year));});
    for(const k of ['project','owner','urgency','type','from','to'])$('#'+k+'-filter').value=state[k];
    const extras=['urgency','type','from','to'].filter(k=>state[k]).length;$('#extra-count').textContent=extras?` · ${extras}`:'';
    const hasFilters=state.year!=='all'||['project','owner','urgency','type','from','to'].some(k=>state[k]);$('#reset').hidden=!hasFilters;
    const invalid=state.from&&state.to&&state.from>state.to;
    $('#scope-text').innerHTML=invalid?'La date de début doit précéder la date de fin.':`<strong>${fmt(rows.length)} tickets</strong> sur ${fmt(ALL.length)} · Filtres sur la date de création${state.year==='2026'?' · 2026 : année partielle au 1er octobre':''}`;
    $('#period-stamp').textContent=state.year==='all'?'Jan. 2023 — Oct. 2026':state.year==='2026'?'Jan. — Oct. 2026':'Jan. — Déc. '+state.year;
    $('#content').innerHTML=state.page==='overview'?renderOverview(rows,m):state.page==='evolution'?renderEvolution(rows,m):state.page==='team'?renderTeam(rows,m):state.page==='categories'?renderCategories(rows,m):renderTickets(rows,m);
    hydrateIcons($('#content'));bindCharts();
  }
  function kpi(label,value,unit,foot,iconName,color='',action=''){
    return `<article class="kpi-card ${color} ${action?'clickable':''}" ${action?`data-status="${action}" role="button" tabindex="0" aria-label="Voir les tickets ${action.toLowerCase()}s"`:''}><div class="kpi-top">${label}<span class="kpi-icon">${icon(iconName)}</span></div><div class="kpi-number">${value}${unit?`<small>${unit}</small>`:''}</div><div class="kpi-bottom">${foot}</div></article>`;
  }
  function kpis(m){return `<div class="kpi-grid">
    ${kpi('Tickets créés',fmt(m.total),'',`<span class="pill">${state.year==='all'?'2023 — 2026':state.year}</span>dans la sélection`,'ticket')}
    ${kpi('Tickets résolus',fmt(m.resolved),'',`<span class="pill green">${pct(m.resolved,m.total)}</span>des tickets créés`,'check','green')}
    ${kpi('Résolution médiane',fmt(m.medResolution,1),'j',`<span class="pill">${pct(m.onTime,m.resolution.length)}</span>en ≤ ${fmt(state.resolutionThreshold,1).replace(',0','')} jours`,'clock')}
    ${kpi('Encore ouverts',fmt(m.open),'',`<span class="pill orange">${fmt(m.avgAge,0)} j</span>d’âge moyen à l’export`,'inbox','orange')}
    </div>`;}
  function chartCard(rows,large=false){
    return `<section class="card activity-card"><div class="card-header"><div><h2>${large?'La dynamique des tickets':'L’activité dans le temps'}</h2><p>Créations et résolutions de la sélection</p></div>${large?'':`<button class="text-button" data-go="evolution">Explorer <span>↗</span></button>`}</div>
      <div class="chart-topline"><div class="chart-legend">${state.chartMode==='volume'||!large?`<span class="legend-item"><i class="legend-dot"></i>Tickets créés</span><span class="legend-item"><i class="legend-dot green"></i>Tickets résolus</span>`:`<span class="legend-item"><i class="legend-dot"></i>${state.chartMode==='backlog'?'Stock non résolu':'Délai médian de résolution (j)'}</span>`}</div><div class="segmented" role="group" aria-label="Granularité du graphique"><button data-granularity="month" class="${state.granularity==='month'?'active':''}" aria-pressed="${state.granularity==='month'}">Mensuel</button><button data-granularity="quarter" class="${state.granularity==='quarter'?'active':''}" aria-pressed="${state.granularity==='quarter'}">Trimestriel</button></div></div>
      ${makeChart(rows,large?state.chartMode:'volume',large)}
      <div class="chart-note">${icon('info')}<span>${large&&state.chartMode==='backlog'?'Stock de la sélection : cumul des créations − résolutions − rejets. Rejets imputés au mois de création.':'Créés au mois de création, résolus au mois de fin. Une résolution peut intervenir après l’année sélectionnée.'} Octobre 2026 est partiel.</span></div></section>`;
  }
  function statusCard(m){const circumference=2*Math.PI*66,values=[m.resolved,m.open,m.rejected],colors=['#8f7ce0','#e7b568','#d6d1e6'];let offset=0;
    const circles=m.total?values.map((v,i)=>{const len=v/m.total*circumference;const circle=`<circle cx="90" cy="90" r="66" fill="none" stroke="${colors[i]}" stroke-width="17" stroke-dasharray="${Math.max(0,len-(v?2:0))} ${circumference}" stroke-dashoffset="${-offset}"/>`;offset+=len;return circle;}).join(''):'';
    return `<section class="card status-card"><div class="card-header"><div><h2>Où en sont les tickets ?</h2><p>Statut au moment de l’export</p></div>${icon('inbox')}</div><div class="donut-wrap"><svg viewBox="0 0 180 180" role="img" aria-label="${m.resolved} résolus, ${m.open} ouverts, ${m.rejected} rejetés"><circle cx="90" cy="90" r="66" fill="none" stroke="#f2effa" stroke-width="17"/>${circles}</svg><div class="donut-center"><strong>${pct(m.resolved,m.total)}</strong><small>de tickets résolus</small></div></div><div class="status-list">${['Résolu','Ouvert','Rejeté'].map((s,i)=>`<button class="status-row" data-status="${s}"><span class="legend-dot ${i===1?'orange':i===2?'gray':''}"></span><span class="status-name">${s}s</span><strong>${fmt(values[i])}</strong><span class="status-percent">${pct(values[i],m.total)}</span></button>`).join('')}</div></section>`;
  }
  function groupMetrics(rows,key){const groups=new Map();for(const t of rows){const k=t[key]||'(non renseigné)';if(!groups.has(k))groups.set(k,[]);groups.get(k).push(t);}return [...groups].map(([name,tickets])=>({name,tickets,...metrics(tickets)}));}
  function peopleCard(rows){const groups=groupMetrics(rows,'owner').sort((a,b)=>b.resolved-a.resolved),top=groups.slice(0,5),max=Math.max(1,...top.map(g=>g.resolved));return `<section class="card"><div class="card-header"><div><h2>La résolution, côté équipe</h2><p>Les 5 premiers responsables · tickets résolus</p></div><button class="text-button" data-go="team">Voir l’équipe <span>↗</span></button></div>${top.length?`<div class="people-list">${top.map((g,i)=>`<button class="person-row" data-owner="${esc(g.name)}" title="Explorer les tickets de ${esc(g.name)}"><span class="avatar a${i}">${esc(initials(g.name))}</span><span class="person-name">${esc(g.name)}</span><span class="bar-track"><span class="bar-fill" style="width:${g.resolved/max*100}%;display:block"></span></span><span class="person-value">${fmt(g.resolved)}</span></button>`).join('')}</div><div class="mini-footer">${fmt(groups.filter(g=>g.resolved>0&&g.name!=='(sans responsable)').length)} responsables avec au moins un ticket résolu dans la sélection.</div>`:empty()}</section>`;}
  function distributionCard(m){const bins=[['≤ 1 jour',d=>d<=1],['1 à 5 j',d=>d>1&&d<=5],['5 à 30 j',d=>d>5&&d<=30],['> 30 j',d=>d>30]].map(([l,test])=>[l,m.resolution.filter(test).length]);const max=Math.max(1,...bins.map(x=>x[1]));return `<section class="card"><div class="card-header"><div><h2>Les délais de résolution</h2><p>${fmt(m.resolution.length)} délais exploitables</p></div><span class="card-tag">Jours calendaires</span></div><div class="threshold-highlight"><strong>${pct(m.onTime,m.resolution.length)}</strong><span>résolus en ≤ ${fmt(state.resolutionThreshold,1).replace(',0','')} jours</span></div><div class="distribution">${bins.map(([l,v])=>`<div class="distribution-row"><span>${l}</span><div class="bar-track"><div class="bar-fill" style="width:${v/max*100}%"></div></div><strong>${pct(v,m.resolution.length,0)}</strong></div>`).join('')}</div><div class="mini-footer">Moyenne : ${fmt(m.avgResolution,1)} j · Médiane : ${fmt(m.medResolution,1)} j</div></section>`;}
  function renderOverview(rows,m){return `${kpis(m)}${!rows.length?`<section class="card">${empty()}</section>`:`<div class="dashboard-grid">${chartCard(rows)}${statusCard(m)}${peopleCard(rows)}${distributionCard(m)}</div><div class="insight-strip">${icon('spark')}<span><strong>${fmt(m.hours,1)} heures de travail renseignées.</strong> La médiane décrit le délai habituel ; la moyenne reflète aussi les tickets qui durent.</span><button class="text-button" data-action="method">Lire les données <span>↗</span></button></div>`}`;}
  function monthly(rows){
    const start=rows.length?rows.map(t=>t.created.slice(0,7)).sort()[0]:minDate.slice(0,7),end=DATA.exportedAt.slice(0,7),map=new Map();
    let [y,m]=start.split('-').map(Number);while(`${y}-${String(m).padStart(2,'0')}`<=end){const key=`${y}-${String(m).padStart(2,'0')}`;map.set(key,{key,created:0,resolved:0,rejected:0,delays:[],hours:0});m++;if(m>12){m=1;y++;}}
    for(const t of rows){const c=map.get(t.created.slice(0,7));if(c){c.created++;if(t.status==='Rejeté')c.rejected++;}if(t.status==='Résolu'&&t.ended){const r=map.get(t.ended.slice(0,7));if(r){r.resolved++;r.hours+=t.hours||0;if(valid(t.resolutionDays))r.delays.push(t.resolutionDays);}}}
    let stock=0;return [...map.values()].map(p=>({...p,backlog:stock+=p.created-p.resolved-p.rejected,median:median(p.delays)}));
  }
  function chartSeries(rows){const months=monthly(rows);if(state.granularity==='month')return months;const groups=new Map();for(const p of months){const key=p.key.slice(0,4)+'-T'+Math.ceil(Number(p.key.slice(5))/3);if(!groups.has(key))groups.set(key,{key,created:0,resolved:0,rejected:0,delays:[],hours:0,backlog:0});const q=groups.get(key);q.created+=p.created;q.resolved+=p.resolved;q.rejected+=p.rejected;q.delays.push(...p.delays);q.hours+=p.hours;q.backlog=p.backlog;}return [...groups.values()].map(q=>({...q,median:median(q.delays)}));}
  function periodLabel(key){return key.includes('T')?key.slice(5)+' '+key.slice(0,4):dateLabel(key+'-01',{month:'short',year:'2-digit'});}
  function makeChart(rows,mode,large,width=760){
    const points=chartSeries(rows),W=Math.max(220,width),H=large?295:215,pad={left:34,right:10,top:14,bottom:30},iw=W-pad.left-pad.right,ih=H-pad.top-pad.bottom;
    const fields=mode==='volume'?['created','resolved']:mode==='backlog'?['backlog']:['median'];
    const rawMax=Math.max(1,...points.flatMap(p=>fields.map(f=>p[f]||0))),step=Math.max(1,Math.ceil(rawMax/4/5)*5),max=step*4;
    const x=i=>pad.left+(points.length>1?i/(points.length-1):.5)*iw,y=v=>pad.top+ih-(v/max)*ih;
    const paths=fields.map((f,j)=>{let d='',active=false;points.forEach((p,i)=>{if(!valid(p[f])){active=false;return;}d+=(active?' L':'M')+x(i).toFixed(2)+' '+y(p[f]).toFixed(2);active=true;});const area=mode!=='median'&&j===0&&points.length?`<path d="${d} L${x(points.length-1)} ${y(0)} L${x(0)} ${y(0)} Z" fill="url(#chart-area)"/>`:'';return area+`<path d="${d}" stroke="${j?'#4ea78e':'#8770de'}" stroke-width="2.4" fill="none" stroke-linejoin="round" stroke-linecap="round"/>${points.length<3?points.filter(p=>valid(p[f])).map(p=>`<circle cx="${x(points.indexOf(p))}" cy="${y(p[f])}" r="3" fill="${j?'#4ea78e':'#8770de'}"/>`).join(''):''}`;}).join('');
    const grid=[0,1,2,3,4].map(i=>`<line x1="${pad.left}" x2="${W-pad.right}" y1="${y(i*step)}" y2="${y(i*step)}" stroke="#eeedf5" ${i?'stroke-dasharray="3 5"':''}/><text x="${pad.left-10}" y="${y(i*step)+3}" text-anchor="end">${fmt(i*step)}</text>`).join('');
    const spacing=Math.ceil(points.length/Math.max(3,Math.floor(W/95)));const labels=points.map((p,i)=>i%spacing===0?`<text class="axis-label" x="${x(i)}" y="${H-8}" text-anchor="${i===0?'start':i===points.length-1?'end':'middle'}">${esc(periodLabel(p.key))}</text>`:'').join('');
    const desc=points.map(p=>`${periodLabel(p.key)} : ${mode==='volume'?p.created+' créés, '+p.resolved+' résolus':mode==='backlog'?p.backlog+' en stock':fmt(p.median,1)+' jours'}`).join(' ; ');
    return `<div class="chart-wrap ${large?'large':''}" data-chart-mode="${mode}"><svg class="chart-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="Évolution ${mode==='volume'?'des créations et résolutions':mode==='backlog'?'du stock':'du délai médian'}"><desc>${esc(desc)}</desc><defs><linearGradient id="chart-area" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#9d8be4" stop-opacity=".18"/><stop offset="100%" stop-color="#9d8be4" stop-opacity=".015"/></linearGradient></defs>${grid}${paths}${labels}<line class="hover-line" x1="0" x2="0" y1="${pad.top}" y2="${y(0)}" stroke="#b7acdb" stroke-dasharray="4 4" visibility="hidden"/></svg><div class="chart-hover"></div></div>`;
  }
  function bindCharts(){
    $$('.chart-wrap').forEach(el=>{const rows=filtered(),points=chartSeries(rows);let lastWidth=0;
      const draw=()=>{const width=el.clientWidth;if(Math.abs(width-lastWidth)<1)return;lastWidth=width;const template=document.createElement('div');template.innerHTML=makeChart(rows,el.dataset.chartMode,el.classList.contains('large'),width);el.replaceChildren(...template.firstElementChild.childNodes);};
      draw();const observer=new ResizeObserver(draw);observer.observe(el);chartObservers.push(observer);
      el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect(),width=Math.max(220,el.clientWidth),i=Math.max(0,Math.min(points.length-1,Math.round(((e.clientX-r.left)/r.width*width-34)/(width-44)*(points.length-1)))),p=points[i];if(!p)return;const tooltip=el.querySelector('.chart-hover'),line=el.querySelector('.hover-line'),mode=el.dataset.chartMode;tooltip.innerHTML=`<strong>${esc(periodLabel(p.key))}</strong>${mode==='volume'?`${fmt(p.created)} tickets créés<br>${fmt(p.resolved)} tickets résolus`:mode==='backlog'?`${fmt(p.backlog)} tickets en stock`:`${fmt(p.median,1)} jours · ${p.delays.length} délais`}`;tooltip.style.display='block';tooltip.style.left=Math.max(0,Math.min(e.clientX-r.left+12,r.width-tooltip.offsetWidth))+'px';tooltip.style.top='0';const x=34+(points.length>1?i/(points.length-1):.5)*(width-44);line.setAttribute('x1',x);line.setAttribute('x2',x);line.setAttribute('visibility','visible');});
      el.addEventListener('pointerleave',()=>{el.querySelector('.chart-hover').style.display='none';el.querySelector('.hover-line').setAttribute('visibility','hidden');});
    });
  }
  function renderEvolution(rows,m){
    const months=monthly(rows),peak=months.reduce((a,b)=>b.created>a.created?b:a,{created:0,key:''});
    const summary=years.map(year=>{const created=rows.filter(t=>String(t.createdYear)===year),resolved=rows.filter(t=>t.status==='Résolu'&&String(t.resolvedYear)===year),delays=resolved.map(t=>t.resolutionDays).filter(valid);return {year,created:created.length,resolved:resolved.length,median:median(delays),hours:sum(resolved.map(t=>t.hours))};});
    return `${kpis(m)}<div class="stack"><section class="card"><div class="stat-strip"><div class="small-stat"><span>Prise en charge médiane</span><strong>${fmt(m.medResponse,1)}</strong><small>jours</small></div><div class="small-stat"><span>Prise en charge en ≤ ${fmt(state.responseThreshold)} j</span><strong>${pct(m.responseOnTime,m.response.length)}</strong></div><div class="small-stat"><span>Pic de créations · ${peak.key?periodLabel(peak.key):'—'}</span><strong>${fmt(peak.created)}</strong><small>tickets</small></div></div><div class="segmented" role="group" aria-label="Indicateur du graphique">${[['volume','Créations & résolutions'],['backlog','Stock non résolu'],['median','Délai médian']].map(([v,l])=>`<button data-mode="${v}" class="${state.chartMode===v?'active':''}" aria-pressed="${state.chartMode===v}">${l}</button>`).join('')}</div></section>${rows.length?chartCard(rows,true):`<section class="card">${empty()}</section>`}<section class="card table-card"><div class="card-header"><div><h2>Les repères annuels</h2><p>Les résolutions sont comptées dans leur année de fin, pour les tickets de la sélection.</p></div><span class="card-tag">2026 partielle</span></div><div class="table-wrap"><table class="data-table"><thead><tr><th>Année</th><th>Créés</th><th>Résolus dans l’année</th><th>Délai médian</th><th>Travail sur résolus</th></tr></thead><tbody>${summary.map(g=>`<tr><td>${g.year}${g.year==='2026'?' <span class="pill gray">au 01/10</span>':''}</td><td>${fmt(g.created)}</td><td>${fmt(g.resolved)}</td><td>${fmt(g.median,1)} j</td><td>${fmt(g.hours,1)} h</td></tr>`).join('')}</tbody></table></div></section></div>`;
  }
  function renderTeam(rows,m){
    const groups=groupMetrics(rows,'owner').sort((a,b)=>state.teamSort==='median'?(a.medResolution??Infinity)-(b.medResolution??Infinity):(b[state.teamSort]??0)-(a[state.teamSort]??0));const max=Math.max(1,...groups.map(g=>g.resolved));
    return `${kpis(m)}<section class="card table-card"><div class="card-header"><div><h2>L’activité par responsable</h2><p>${groups.length} responsables ou groupes d’affectation · cliquez sur un nom pour explorer ses tickets.</p></div><select id="team-sort" aria-label="Trier les responsables">${[['resolved','Plus de tickets résolus'],['total','Plus de tickets assignés'],['hours','Plus de travail renseigné'],['median','Délai médian croissant']].map(([v,l])=>`<option value="${v}" ${state.teamSort===v?'selected':''}>${l}</option>`).join('')}</select></div>${groups.length?`<div class="table-wrap"><table class="data-table"><thead><tr><th>Responsable</th><th>Assignés</th><th>Résolus</th><th>Ouverts</th><th>PEC médiane</th><th>Résolution médiane</th><th>En ≤ ${fmt(state.resolutionThreshold)} j</th><th>Travail</th></tr></thead><tbody>${groups.map((g,i)=>`<tr><td><div class="table-person"><span class="avatar a${i%5}">${esc(initials(g.name))}</span><button data-owner="${esc(g.name)}">${esc(g.name)}<span class="inline-bar"><span style="width:${g.resolved/max*100}%"></span></span></button></div></td><td>${fmt(g.total)}</td><td>${fmt(g.resolved)}</td><td>${g.open?`<span class="pill orange">${g.open}</span>`:'—'}</td><td>${fmt(g.medResponse,1)} j</td><td>${fmt(g.medResolution,1)} j</td><td>${pct(g.onTime,g.resolution.length)}</td><td>${fmt(g.hours,1)} h</td></tr>`).join('')}</tbody></table></div>`:empty()}</section><div class="insight-strip">${icon('info')}<span>Le responsable est celui indiqué dans l’export. <strong>Le volume et les délais dépendent aussi de la complexité des tickets et de la période d’activité.</strong> Le travail correspond aux heures saisies.</span></div>`;
  }
  function renderCategories(rows,m){
    const groups=groupMetrics(rows,state.category).sort((a,b)=>b.total-a.total),max=Math.max(1,...groups.map(g=>g.total));const labels={project:'Projet',type:'Type de ticket',urgency:'Urgence',criticality:'Criticité',priority:'Priorité',author:'Émetteur'};const partial=['urgency','criticality','priority'].includes(state.category),known=rows.filter(t=>t[state.category]&&t[state.category]!=='(non renseigné)').length;
    return `${kpis(m)}<div class="stack"><div class="two-col"><section class="card"><div class="card-header"><div><h2>La composition des demandes</h2><p>Répartition des tickets créés dans la sélection</p></div><select id="category-select" class="category-select" aria-label="Dimension de répartition">${Object.entries(labels).map(([v,l])=>`<option value="${v}" ${state.category===v?'selected':''}>${l}</option>`).join('')}</select></div>${groups.length?`<div class="category-bars">${groups.slice(0,8).map(g=>`<${['project','type','urgency'].includes(state.category)?'button':'div'} class="category-row" ${['project','type','urgency'].includes(state.category)?`data-category-value="${esc(g.name)}"`:''}><span class="category-row-top"><span>${esc(state.category==='project'?shortProject(g.name):g.name)}</span><strong>${fmt(g.total)} <span style="color:#aaa4b6;font-weight:400">· ${pct(g.total,m.total)}</span></strong></span><div class="bar-track"><div class="bar-fill" style="width:${g.total/max*100}%"></div></div><small>${fmt(g.resolved)} résolus · médiane ${fmt(g.medResolution,1)} j</small></${['project','type','urgency'].includes(state.category)?'button':'div'}>`).join('')}</div>`:empty()}</section><section class="card quality-card"><div class="card-header"><div><h2>Ce que racontent les données</h2><p>Quelques repères pour bien les interpréter</p></div>${icon('info')}</div><h3>${partial?'Des champs partiellement renseignés':'Un périmètre, plusieurs usages'}</h3><p>${partial?'L’absence d’urgence, de criticité ou de priorité ne signifie pas un faible niveau. Les tickets sans valeur restent visibles dans « (non renseigné) ».':state.category==='author'?'L’émetteur est la personne qui a créé le ticket dans l’outil. Il ne s’agit pas nécessairement du demandeur ou du client final.':'Les volumes reflètent la composition des demandes. Les médianes sont calculées sur les tickets résolus dont le délai est exploitable.'}</p><div class="category-summary"><strong>${partial?pct(known,m.total):groups.length?pct(groups[0].total,m.total):'—'}</strong><p>${partial?'des tickets ont ce champ renseigné.':groups.length?`des tickets relèvent de « ${esc(state.category==='project'?shortProject(groups[0].name):groups[0].name)} », la catégorie la plus représentée.`:'Aucun ticket dans cette sélection.'}</p></div><div class="mini-footer">Les données manquantes ne sont jamais assimilées à zéro dans les calculs de délai.</div></section></div><section class="card table-card"><div class="card-header"><div><h2>Tous les groupes · ${labels[state.category].toLowerCase()}</h2><p>Les taux de respect du seuil utilisent uniquement les délais de résolution exploitables.</p></div></div><div class="table-wrap"><table class="data-table"><thead><tr><th>${labels[state.category]}</th><th>Tickets</th><th>Résolus</th><th>Ouverts</th><th>Résolution médiane</th><th>En ≤ ${fmt(state.resolutionThreshold)} j</th><th>Travail</th></tr></thead><tbody>${groups.map(g=>`<tr><td>${esc(g.name)}</td><td>${fmt(g.total)}</td><td>${fmt(g.resolved)}</td><td>${fmt(g.open)}</td><td>${fmt(g.medResolution,1)} j</td><td>${pct(g.onTime,g.resolution.length)}</td><td>${fmt(g.hours,1)} h</td></tr>`).join('')}</tbody></table></div></section></div>`;
  }
  function ticketRows(){
    const q=fold(state.query).trim();return filtered().filter(t=>(!state.status||t.status===state.status)&&(!q||fold([t.id,t.reference,t.title,t.owner,t.author,t.project,t.urgency].join(' ')).includes(q))).sort((a,b)=>{
      const av=a[state.sort],bv=b[state.sort];if(av==null)return bv==null?0:1;if(bv==null)return -1;return state.direction*(typeof av==='number'?av-bv:String(av).localeCompare(String(bv),'fr'));
    });
  }
  function renderTickets(rows,m){return `<section class="card table-card"><div class="tickets-toolbar"><label class="search-box">${icon('search')}<input id="ticket-search" type="search" placeholder="Référence, sujet, personne…" aria-label="Rechercher un ticket" value="${esc(state.query)}"></label><div class="status-tabs" role="group" aria-label="Statut des tickets">${[['','Tous',m.total],['Résolu','Résolus',m.resolved],['Ouvert','Ouverts',m.open],['Rejeté','Rejetés',m.rejected]].map(([v,l,n])=>`<button class="${state.status===v?'active':''}" data-status="${v}" aria-pressed="${state.status===v}">${l} <span>${fmt(n)}</span></button>`).join('')}</div></div><div id="ticket-results">${ticketResults()}</div></section>`;}
  function ticketResults(){
    const rows=ticketRows(),count=rows.length,size=20,pages=Math.ceil(count/size);state.pageIndex=Math.max(0,Math.min(state.pageIndex,pages-1));const slice=rows.slice(state.pageIndex*size,(state.pageIndex+1)*size);
    const columns=[['title','Ticket'],['owner','Responsable'],['created','Création'],['status','Statut'],['resolutionDays','Résolution'],['hours','Travail']];
    return `${count?`<div class="table-wrap"><table class="data-table tickets-table"><thead><tr>${columns.map(([key,l])=>`<th scope="col" aria-sort="${state.sort===key?(state.direction===1?'ascending':'descending'):'none'}"><button data-sort="${key}">${l} ${state.sort===key?(state.direction===1?'↑':'↓'):'↕'}</button></th>`).join('')}</tr></thead><tbody>${slice.map(t=>`<tr><td><span class="ticket-ref">${esc(t.reference)} · #${t.id}</span><button class="ticket-title" data-ticket="${t.id}">${esc(t.title)}</button><span class="ticket-project">${esc(shortProject(t.project))}</span></td><td>${esc(t.owner)}</td><td style="white-space:nowrap">${dateLabel(t.created,{day:'2-digit',month:'2-digit',year:'numeric'})}</td><td>${badge(t.status)}</td><td style="white-space:nowrap">${valid(t.resolutionDays)?fmt(t.resolutionDays,1)+' j':'—'}</td><td>${fmt(t.hours,1)} h</td></tr>`).join('')}</tbody></table></div>`:empty('Essayez une autre recherche ou modifiez les filtres.')}<div class="pagination"><span aria-live="polite">${count?`${state.pageIndex*size+1}–${Math.min((state.pageIndex+1)*size,count)} sur ${fmt(count)} tickets`:'0 ticket'}${state.status||state.query?' · sélection affinée':''}</span><div class="pagination-controls"><button data-paginate="-1" aria-label="Page précédente" ${state.pageIndex===0?'disabled':''}>‹</button><span>${count?state.pageIndex+1:0} / ${pages}</span><button data-paginate="1" aria-label="Page suivante" ${state.pageIndex>=pages-1?'disabled':''}>›</button></div></div>`;
  }
  function renderTicketResults(){if($('#ticket-results'))$('#ticket-results').innerHTML=ticketResults();hydrateIcons($('#ticket-results'));}
  function showDialog(html){$('#dialog-content').innerHTML=html;hydrateIcons($('#dialog-content'));$('#detail-dialog').showModal();$('#detail-dialog').scrollTop=0;}
  function dialogHead(eyebrow,title,subtitle=''){return `<div class="dialog-head"><div><div class="eyebrow">${esc(eyebrow)}</div><h2 id="dialog-title">${esc(title)}</h2>${subtitle?`<p>${esc(subtitle)}</p>`:''}</div><button class="icon-button" data-action="close-dialog" aria-label="Fermer">${icon('close')}</button></div>`;}
  function showTicket(id){const t=ALL.find(t=>t.id===id);if(!t)return;
    const details=[['Statut',badge(t.status)+' <span style="color:#a49caf">· '+esc(t.state)+'</span>'],['Responsable',esc(t.owner)],['Projet',esc(t.project)],['Type',esc(t.type)],['Émetteur',esc(t.author)],['Demandeur',esc(t.requester||'Non renseigné')],['Urgence',esc(t.urgency)],['Criticité / priorité',esc(t.criticality)+' / '+esc(t.priority)],['Prise en charge',valid(t.responseDays)?fmt(t.responseDays,2)+' jours':'Délai non exploitable ou début absent'],['Résolution',valid(t.resolutionDays)?fmt(t.resolutionDays,2)+' jours':t.status==='Résolu'?'Délai non exploitable':'Non applicable'],['Travail renseigné',fmt(t.hours,2)+' heures'],['Âge si ouvert',valid(t.ageDays)?fmt(t.ageDays,1)+' jours à l’export':'Non applicable']];
    showDialog(dialogHead(t.reference+' · #'+t.id,t.title)+`<div class="dialog-body"><dl class="detail-grid">${details.map(([l,v])=>`<div><dt>${l}</dt><dd>${v}</dd></div>`).join('')}</dl><div class="timeline">${[['Création',t.created],['Début',t.started],['Fin',t.ended]].map(([l,v])=>`<div><span>${l}</span><strong>${dateLabel(v)}${v?' · '+v.slice(11,16):''}</strong></div>`).join('')}</div><div class="mini-footer">Délais en jours calendaires. Les dates de clôture ne sont pas utilisées dans les calculs. Les dates sont affichées telles que fournies dans le classeur.</div></div>`);
  }
  function showMethod(){showDialog(dialogHead('SOURCE & MÉTHODE','Des chiffres que l’on peut expliquer',DATA.source)+`<div class="dialog-body"><div class="method-intro">${fmt(ALL.length)} tickets · extraction du ${dateLabel(DATA.exportedAt)}. Cette page est un instantané du classeur. Les filtres de période portent sur la <strong>création</strong> des tickets ; les graphiques et les repères annuels positionnent les résolutions à leur date de fin.</div><div class="threshold-settings"><label>Prise en charge ≤<input type="number" min="0" max="10000" step="0.1" data-threshold="responseThreshold" value="${state.responseThreshold}" aria-label="Seuil de prise en charge en jours"> j</label><label>Résolution ≤<input type="number" min="0" max="10000" step="0.1" data-threshold="resolutionThreshold" value="${state.resolutionThreshold}" aria-label="Seuil de résolution en jours"> j</label><small>Seuils d’analyse modifiables pour cette session ; ils ne constituent pas des engagements contractuels. Le classeur source reste inchangé.</small></div>${DATA.method.filter(m=>m.title!=='Seuils').map(m=>`<div class="method-entry"><h3>${esc(m.title)}</h3><p>${esc(m.text)}</p></div>`).join('')}<div class="method-entry"><h3>Dénominateurs & périodes</h3><p>Le taux de résolution = tickets résolus / tickets créés de la sélection. Le pourcentage dans un seuil = délais dans le seuil / délais exploitables, sans inclure les valeurs manquantes. Les tickets rejetés sont exclus des délais de résolution. Le stock est limité aux tickets créés depuis 2023, avec les rejets imputés au mois de création. L’année 2026 et octobre 2026 sont partiels.</p></div><div class="method-entry"><h3>Utilisation & partage</h3><p>La page fonctionne hors ligne. Tous les tickets sont intégrés au fichier HTML : les filtres changent l’affichage, mais ne retirent aucune donnée du fichier. L’export CSV contient les tickets de la sélection actuelle, y compris les filtres de statut et de recherche dans la vue Tickets.</p></div></div>`);}
  function exportCSV(){
    const rows=state.page==='tickets'?ticketRows():filtered();if(!rows.length){showToast('Aucun ticket à exporter dans cette sélection.');return;}
    const columns=[['id','ID'],['reference','Référence'],['title','Titre'],['type','Type'],['project','Projet'],['owner','Responsable'],['author','Émetteur'],['requester','Demandeur'],['state','État'],['status','Statut'],['urgency','Urgence'],['criticality','Criticité'],['priority','Priorité'],['created','Création'],['started','Début'],['ended','Fin'],['responseDays','Prise en charge (j)'],['resolutionDays','Résolution (j)'],['ageDays','Âge si ouvert (j)'],['hours','Travail (h)']];
    function cell(v){if(v==null)return '""';if(typeof v==='number')v=String(v).replace('.',',');else if(/^[\s]*[=+\-@\t\r]/.test(v))v="'"+v;return '"'+String(v).replace(/"/g,'""')+'"';}
    const csv='\uFEFF'+[columns.map(c=>cell(c[1])).join(';'),...rows.map(t=>columns.map(([k])=>cell(t[k])).join(';'))].join('\r\n');
    const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8;'})),a=document.createElement('a');a.href=url;a.download=`tickets-SR-${state.year}-${DATA.exportedAt.slice(0,10)}.csv`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);showToast(`${fmt(rows.length)} tickets exportés au format CSV`);
  }
  init();
})();
