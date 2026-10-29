const $ = (id) => document.getElementById(id);
const initial = {coins:120,hunger:72,health:90,fun:65,energy:80,xp:0,level:1,dirty:false,sleeping:false,room:'home',name:'Minty',weight:0,inventory:[],equipped:[],skin:'#65dfe9',eyeColor:'#28d8ed',sound:true,played:0,washed:0,fed:0};
let state = {...initial};
try { const saved=JSON.parse(localStorage.getItem('minty-save')); if(saved) state={...initial,...saved}; } catch(e){}
const foods=[{id:'berry',name:'Frutillas',emoji:'🍓',price:8,hunger:18},{id:'apple',name:'Manzanita',emoji:'🍎',price:7,hunger:15},{id:'cake',name:'Pastelito',emoji:'🧁',price:14,hunger:24},{id:'pizza',name:'Pizza mini',emoji:'🍕',price:16,hunger:28}];
const potions=[{id:'health',name:'Poción salud',emoji:'💖',price:25,desc:'Recupera 30 puntos de salud.'},{id:'energy',name:'Poción energía',emoji:'⚡',price:20,desc:'Recupera 35 puntos de energía.'},{id:'slim',name:'Poción ligera',emoji:'🫧',price:30,desc:'Ayuda a equilibrar el peso.'}];
const wearables=[{id:'hat',name:'Gorrito lila',emoji:'🎩',price:45,type:'hat'},{id:'glasses',name:'Anteojitos',emoji:'🤓',price:55,type:'glasses'},{id:'bow',name:'Moñito rosa',emoji:'🎀',price:35,type:'bow'},{id:'flower',name:'Flor pastel',emoji:'🌼',price:40,type:'flower'}];
const roomInfo={
 home:['¡Hola de nuevo!','Minty tiene ganas de pasar un ratito con vos.','Elegí una habitación para cuidar a Minty ✨'],
 kitchen:['La cocina de Minty','¡Hora de una merienda rica!','Tocá una comida para dársela a Minty 🍓'],
 bath:['Baño burbujeante','Un bañito y queda como nuevo.','Usá el jabón y después enjuagá con la ducha 🫧'],
 lab:['Laboratorio mágico','Pociones pequeñas, cuidados enormes.','Elegí una poción para ayudar a Minty 🧪'],
 bedroom:['Un rincón de sueños','Un descanso también es cariño.','Apagá la luz para que Minty duerma 🌙'],
 play:['¡Hora de jugar!','Jugá un minijuego para sumar moneditas.','¡Tocá el juguete y atrapá las estrellas! 🎮'],
 shop:['Tiendita pastel','Un accesorio nuevo para darle su estilo.','Comprá con tus moneditas y equipá tus favoritos 🛍️']
};
function save(){localStorage.setItem('minty-save',JSON.stringify(state));$('saveStatus').textContent='Progreso guardado automáticamente ✓'}
function toast(msg){const t=$('toast');t.textContent=msg;t.classList.add('show');clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>t.classList.remove('show'),2300)}
function clamp(n){return Math.max(0,Math.min(100,n))}
function gainXP(n){state.xp+=n;while(state.xp>=100){state.xp-=100;state.level++;state.coins+=20;toast('¡Subiste al nivel '+state.level+'! +20 moneditas 🌟')}}
function render(){
 $('coins').textContent=state.coins;$('level').textContent='Nv. '+state.level;$('xpFill').style.width=state.xp+'%';$('xpText').textContent=state.xp+' / 100 XP';
 [['hunger',state.hunger],['health',state.health],['fun',state.fun],['energy',state.energy]].forEach(([k,v])=>{$(k+'Val').textContent=Math.round(v)+'%';$(k+'Bar').style.width=v+'%'});
 $('roomTitle').textContent=roomInfo[state.room][0];$('roomSubtitle').textContent=roomInfo[state.room][1];$('sceneHint').textContent=roomInfo[state.room][2];
 document.querySelectorAll('.room-btn').forEach(b=>b.classList.toggle('active',b.dataset.room===state.room));
 const art=$('roomArt');art.className='room-art '+(state.room==='home'?'home-room':state.room+'-room')+(state.dirty?' dirty':'');
 $('petWrap').classList.toggle('sleeping',state.sleeping);$('petWrap').classList.toggle('hat-on',state.equipped.includes('hat'));$('petWrap').classList.toggle('glasses-on',state.equipped.includes('glasses'));
 $('petWrap').classList.toggle('sad',state.hunger<25||state.health<30);
 $('moodBubble').textContent=state.sleeping?'Zzz...':state.hunger<25?'¿Algo rico?':state.energy<25?'Tengo sueñito':state.fun<25?'¡Juguemos!':state.dirty?'¡Necesito un baño!':'¡Qué lindo día!';
 $('petSvg').querySelectorAll('path').forEach(()=>{});
 $('dailyTitle').textContent=state.health<50?'Minty necesita un poquito de cuidado':state.sleeping?'Dulces sueños, Minty':'¡Sos su persona favorita!';
 $('dailyText').textContent=state.dirty?'Está un poquito sucio. ¡Un baño le va a encantar!':state.hunger<30?'Tiene pancita vacía. Preparale algo rico.':state.energy<25?'Está cansadito; apagá la luz para que descanse.':'Un poquito de cariño hace una gran diferencia.';
 $('achievementText').textContent=state.played>0?'¡Ya jugaron '+state.played+' veces! Seguí así.':'Cuidá a Minty para conseguir XP.';
 renderActions();save();
}
function buttons(items){return items.map(x=>`<button class="action-btn ${x.cls||''}" data-do="${x.action}">${x.label}</button>`).join('')}
function renderActions(){
 const a=$('roomActions');
 if(state.room==='home')a.innerHTML=buttons([{label:'🍓 Darle de comer',action:'go-kitchen',cls:'primary'},{label:'🫧 Bañito',action:'go-bath'},{label:'🎮 Jugar',action:'go-play',cls:'purple-btn'}]);
 if(state.room==='kitchen')a.innerHTML=foods.map(f=>`<button class="action-btn" data-food="${f.id}">${f.emoji} ${f.name} · ${f.price} 🪙</button>`).join('')+buttons([{label:'← Volver a inicio',action:'go-home'}]);
 if(state.room==='bath')a.innerHTML=buttons([{label:'🧼 Poner jabón',action:'soap',cls:'pink-btn'},{label:'🚿 Enjuagar',action:'shower',cls:'primary'},{label:'← Volver',action:'go-home'}]);
 if(state.room==='lab')a.innerHTML=buttons([{label:'💖 Salud · 25 🪙',action:'p-health'},{label:'⚡ Energía · 20 🪙',action:'p-energy'},{label:'🫧 Equilibrar peso · 30 🪙',action:'p-slim'},{label:'← Volver',action:'go-home'}]);
 if(state.room==='bedroom')a.innerHTML=buttons([{label:state.sleeping?'☀️ Encender la luz':'💡 Apagar la luz',action:'toggle-sleep',cls:'primary'},{label:'👗 Abrir armario',action:'wardrobe',cls:'purple-btn'},{label:'← Volver',action:'go-home'}]);
 if(state.room==='play')a.innerHTML=buttons([{label:'⭐ Atrapar estrellas',action:'game-stars',cls:'primary'},{label:'🧠 Memoria relámpago',action:'game-memory',cls:'purple-btn'},{label:'🎾 Pelotita saltarina',action:'game-ball',cls:'pink-btn'},{label:'← Volver',action:'go-home'}]);
 if(state.room==='shop')a.innerHTML=buttons([{label:'🎩 Ropa y accesorios',action:'wardrobe',cls:'primary'},{label:'🎨 Cambiar color',action:'colors',cls:'purple-btn'},{label:'← Volver',action:'go-home'}]);
}
function go(room){state.room=room;render()}
function care(type){
 if(type==='snack'){const f=foods[0];if(state.coins<f.price)return toast('Te faltan moneditas para comprar una frutilla 🍓');state.coins-=f.price;state.hunger=clamp(state.hunger+f.hunger);state.fed++;gainXP(5);animate('eating');toast('¡Ñam ñam! Minty disfrutó su frutita 🍓')}
 if(type==='wash'){state.dirty=false;state.health=clamp(state.health+4);state.washed++;gainXP(8);animate('washing');toast('¡Minty quedó limpito y brillante! 🫧')}
 if(type==='play'){go('play');return}
 render();
}
function animate(cls){const p=$('petWrap');p.classList.remove('jumping','washing','eating');void p.offsetWidth;p.classList.add(cls);setTimeout(()=>p.classList.remove(cls),900)}
function eat(id){const f=foods.find(x=>x.id===id);if(!f)return;if(state.coins<f.price)return toast('No tenés suficientes moneditas 🪙');if(state.hunger>=98)return toast('¡Minty ya está llenito!');state.coins-=f.price;state.hunger=clamp(state.hunger+f.hunger);state.health=clamp(state.health+2);state.fed++;gainXP(6);animate('eating');toast(`${f.emoji} ¡Qué rica merienda! +${f.hunger}% de hambre satisfecha`);render()}
function potion(id){const p=potions.find(x=>x.id===id);if(state.coins<p.price)return toast('Te faltan moneditas 🪙');state.coins-=p.price;if(id==='health')state.health=clamp(state.health+30);if(id==='energy')state.energy=clamp(state.energy+35);if(id==='slim')state.weight=Math.max(0,state.weight-1);gainXP(4);toast(p.emoji+' '+p.desc);render()}
function soap(){if(!state.dirty){state.dirty=true;toast('¡Le pusiste jabón! Ahora enjuagalo 🚿')}else toast('Ya tiene jabón, falta enjuagarlo 🚿');animate('washing');render()}
function shower(){if(!state.dirty)return toast('Minty ya está limpito ✨');state.dirty=false;state.health=clamp(state.health+7);state.washed++;gainXP(8);toast('¡Splash! Minty está limpito y feliz 🫧');animate('washing');render()}
function toggleSleep(){state.sleeping=!state.sleeping;if(state.sleeping){state.energy=clamp(state.energy+8);toast('Shhh… Minty se está durmiendo 🌙')}else{state.energy=clamp(state.energy+25);gainXP(5);toast('¡Buen día, Minty! Recuperó energía ☀️')}render()}
function openModal(title,desc,content){$('modalContent').innerHTML=`<h2 id="modalTitle">${title}</h2><p>${desc}</p>${content}`;$('modalBackdrop').classList.add('open')}
function wardrobe(){const all=wearables.map(w=>{const owned=state.inventory.includes(w.id),eq=state.equipped.includes(w.id);return `<div class="item-card ${eq?'equipped':''}"><span class="item-emoji">${w.emoji}</span><strong>${w.name}</strong><small>${owned?(eq?'Equipado ✓':'En tu armario'):'🪙 '+w.price}</small><button data-wear="${w.id}" ${!owned&&state.coins<w.price?'disabled':''}>${eq?'Quitar':owned?'Equipar':'Comprar'}</button></div>`}).join('');openModal('El armario de Minty','Elegí un accesorio para que tenga su propio estilo.',`<div class="item-grid">${all}</div><div class="modal-tip">Los accesorios que compres quedan guardados en tu inventario.</div>`)}
function wear(id){const w=wearables.find(x=>x.id===id);if(!state.inventory.includes(id)){if(state.coins<w.price)return toast('Te faltan moneditas 🪙');state.coins-=w.price;state.inventory.push(id);toast('¡Compraste '+w.name+'! ✨')}if(state.equipped.includes(id))state.equipped=state.equipped.filter(x=>x!==id);else{if(w.type==='hat')state.equipped=state.equipped.filter(x=>x!=='hat');if(w.type==='glasses')state.equipped=state.equipped.filter(x=>x!=='glasses');state.equipped.push(id)}wardrobe();render()}
function colors(){const opts=['#65dfe9','#a9e7ff','#c9b5ff','#ffb7d2','#a9e8c2','#ffd58c'];openModal('Colores mágicos','Elegí el tono de tu mascotita. Cada cambio cuesta 15 moneditas.',`<div class="item-grid">${opts.map(c=>`<div class="item-card"><span style="display:block;width:48px;height:48px;border-radius:50%;background:${c};border:3px solid white;box-shadow:0 0 0 1px #d8e8e8"></span><strong>${c===state.skin?'Tu color actual':'Color pastel'}</strong><button data-color="${c}" ${state.coins<15?'disabled':''}>Elegir · 15 🪙</button></div>`).join('')}</div>`)}
function setColor(c){if(state.coins<15)return toast('Te faltan moneditas 🪙');state.coins-=15;state.skin=c;document.querySelector('#petSvg path').setAttribute('fill',c);const grad=document.querySelector('#bodyGrad');grad.children[0].setAttribute('stop-color',lighten(c));grad.children[1].setAttribute('stop-color',c);grad.children[2].setAttribute('stop-color',c);toast('¡Nuevo color para Minty! 🎨');colors();render()}
function lighten(hex){return hex==='#65dfe9'?'#a6f6f3':hex}
function game(type){const games={ 'game-stars':['¡Atrapa las estrellas!','Tocá el botón para lanzar la pelotita y conseguir una recompensa.','⭐'], 'game-memory':['Memoria relámpago','¿Podés encontrar el par? Elegí dos cartas iguales.','🧠'],'game-ball':['Pelotita saltarina','¡Hacé saltar a Minty y ganá moneditas!','🎾']};const g=games[type];let body='';if(type==='game-stars')body=`<div class="mini-game"><span class="target">⭐</span><p>¡Listos, preparados…!</p><button class="action-btn primary" data-win="stars">¡Atrapar estrella!</button></div>`;if(type==='game-ball')body=`<div class="mini-game"><span class="target">🎾</span><p>Hacé rebotar la pelotita.</p><button class="action-btn pink-btn" data-win="ball">¡Boing, boing!</button></div>`;if(type==='game-memory')body=`<div class="mini-game"><p>Encontrá dos símbolos iguales:</p><div class="item-grid">${['🍓','⭐','🍓','🌙'].sort(()=>Math.random()-.5).map((e,i)=>`<button class="action-btn memory-card" data-card="${e}" style="font-size:25px;padding:15px">${e}</button>`).join('')}</div><p id="memoryResult">Elegí dos cartas.</p></div>`;openModal(g[0],g[1],body)}
function winGame(type){let reward=type==='stars'?8:type==='ball'?6:12;state.coins+=reward;state.fun=clamp(state.fun+15);state.energy=clamp(state.energy-5);state.played++;gainXP(10);animate('jumping');toast(`¡Bien jugado! +${reward} moneditas 🪙`);$('modalBackdrop').classList.remove('open');render()}
document.addEventListener('click',e=>{
 const room=e.target.closest('[data-room]');if(room){go(room.dataset.room);return}
 const action=e.target.closest('[data-action]');if(action){care(action.dataset.action);return}
 const doBtn=e.target.closest('[data-do]');if(doBtn){const a=doBtn.dataset.do;if(a.startsWith('go-'))go(a.slice(3));else if(a==='soap')soap();else if(a==='shower')shower();else if(a==='toggle-sleep')toggleSleep();else if(a==='wardrobe')wardrobe();else if(a==='colors')colors();else if(a.startsWith('p-'))potion(a.slice(2));else if(a.startsWith('game-'))game(a);return}
 const food=e.target.closest('[data-food]');if(food){eat(food.dataset.food);return}
 const wearBtn=e.target.closest('[data-wear]');if(wearBtn){wear(wearBtn.dataset.wear);return}
 const color=e.target.closest('[data-color]');if(color){setColor(color.dataset.color);return}
 const win=e.target.closest('[data-win]');if(win){winGame(win.dataset.win);return}
 const card=e.target.closest('[data-card]');if(card){window.memoryPicks=window.memoryPicks||[];window.memoryPicks.push({el:card,symbol:card.dataset.card});card.disabled=true;card.style.opacity='.5';if(window.memoryPicks.length===2){const [a,b]=window.memoryPicks;if(a.symbol===b.symbol){$('memoryResult').textContent='¡Encontraste el par! 🎉';setTimeout(()=>winGame('memory'),600)}else{$('memoryResult').textContent='Casi… ¡probá otra vez!';setTimeout(()=>{a.el.disabled=false;b.el.disabled=false;a.el.style.opacity='1';b.el.style.opacity='1';window.memoryPicks=[]},700)} }return}
});
$('modalClose').addEventListener('click',()=>$('modalBackdrop').classList.remove('open'));
$('modalBackdrop').addEventListener('click',e=>{if(e.target===$('modalBackdrop'))$('modalBackdrop').classList.remove('open')});
$('soundBtn').addEventListener('click',()=>{state.sound=!state.sound;$('soundBtn').textContent=state.sound?'♫':'♪';toast(state.sound?'Soniditos activados (visual) ✨':'Sonido desactivado');save()});
document.querySelectorAll('[data-action]').forEach(()=>{});
setInterval(()=>{if(!state.sleeping){state.hunger=clamp(state.hunger-.45);state.fun=clamp(state.fun-.25);state.energy=clamp(state.energy-.2);if(state.hunger<15)state.health=clamp(state.health-.2)}else{state.energy=clamp(state.energy+1.5)}if(Math.random()<.08&&!state.dirty)state.dirty=true;render()},30000);
document.querySelector('#petSvg').addEventListener('click',()=>{animate('jumping');state.fun=clamp(state.fun+2);toast('Minty te saludó con un saltito 💗');render()});
render();
