import {weaponById} from './arsenal.js';
import {SHOP,LEVELS,DEFAULT_SETTINGS} from './campaign.js';
export function setupInterface(progress,actions){
 const $=id=>document.getElementById(id);
 const modal=(id,title)=>{const el=document.createElement('section');el.id=id;el.className='screen modal';el.innerHTML=`<div class="dialog wide"><p class="system-line">PROJECT BLACKSITE // FIELD SYSTEMS</p><h2>${title}</h2><div class="panel-content"></div><button class="secondary" data-close>BACK</button></div>`;document.body.append(el);el.querySelector('[data-close]').onclick=()=>el.classList.remove('on');return el.querySelector('.panel-content');};
 const shop=modal('arsenal','ARSENAL'),dossier=modal('operator','OPERATOR DOSSIER'),career=modal('progression','SERVICE RECORD'),confirm=modal('confirmation','LEAVE OPERATION?');
 confirm.innerHTML='<p>Current mission progress will be lost. Earned campaign rewards remain saved.</p><button id="confirm-quit">QUIT TO MAIN MENU</button>';
 $('confirm-quit').onclick=()=>{$('confirmation').classList.remove('on');actions.quit();};
 const nav=$('start').querySelector('.menu-nav');
 for(const [id,label] of [['continue','CONTINUE'],['arsenal','ARSENAL / STORE'],['operator','OPERATOR'],['progression','PROGRESSION']]){const b=document.createElement('button');b.textContent=label;b.onclick=()=>{if(id==='continue'){actions.continue();return;}refresh();$(id).classList.add('on');if(id==='arsenal')actions.preview(shop);};nav.append(b);}
 const difficulty=document.createElement('label');difficulty.innerHTML='DIFFICULTY <select id="difficulty"><option value="recruit">RECRUIT</option><option value="regular">REGULAR</option><option value="veteran">VETERAN</option></select>';$('start').querySelector('.selection').append(difficulty);
 $('difficulty').value=progress.state.settings.difficulty;$('difficulty').onchange=e=>progress.settings({difficulty:e.target.value});
 const settings=$('settings').querySelector('.dialog');settings.querySelector('p:not(.system-line)')?.remove();
 const form=document.createElement('div');form.className='settings-grid';
 const labels={sensitivity:'Look sensitivity',master:'Master volume',music:'Memory / ambience',sfx:'Sound effects',quality:'Graphics quality',resolution:'Resolution scale',hudScale:'HUD scale',shake:'Camera shake',subtitles:'Radio subtitles',crosshair:'Crosshair',aimAssist:'Mobile aim assist'};
 for(const [key,label] of Object.entries(labels)){
  const value=progress.state.settings[key],row=document.createElement('label');row.textContent=label;
  let input;if(typeof value==='boolean'){input=document.createElement('input');input.type='checkbox';input.checked=value;}
  else if(key==='quality'){input=document.createElement('select');for(const v of ['low','medium','high']){const o=document.createElement('option');o.value=v;o.textContent=v.toUpperCase();input.append(o);}input.value=value;}
  else{input=document.createElement('input');input.type='range';input.min=key==='sensitivity'?'.2':key==='resolution'?'.5':key==='hudScale'?'.7':'0';input.max=key==='sensitivity'?'3':key==='hudScale'?'1.5':'1';input.step='.05';input.value=value;}
  input.id='setting-'+key;input.oninput=()=>{progress.settings({[key]:input.type==='checkbox'?input.checked:input.tagName==='SELECT'?input.value:Number(input.value)});actions.settings();};row.append(input);form.append(row);
 }
 const reset=document.createElement('button');reset.textContent='RESET PROGRESS';reset.onclick=()=>{reset.textContent='CONFIRM RESET — ALL UNLOCKS';reset.onclick=()=>{progress.reset();location.reload();};};form.append(reset);settings.insertBefore(form,settings.lastElementChild);
 $('game-modes').querySelector('ul').replaceChildren();
 for(const [id,name,desc] of [['campaign','CAMPAIGN','Four linked operations. Discover what happened at Blacksite.'],['survival','SURVIVAL','Endless escalating waves. Extract between waves to bank rewards.'],['extraction','EXTRACTION','Recover randomized field caches and reach extraction.'],['team','TEAM BATTLE','Fight alongside two allied operators. First team to 12 eliminations wins.']]){const li=document.createElement('li'),b=document.createElement('button');b.textContent=name;b.onclick=()=>{actions.mode(id);$('game-modes').classList.remove('on');};li.append(b,document.createTextNode(' '+desc));$('game-modes').querySelector('ul').append(li);}
 const cards=document.createElement('div');cards.id='mission-cards';$('campaign-panel').after(cards);
 let category='WEAPONS';
 function refresh(){
  const state=progress.state;shop.replaceChildren();const balance=document.createElement('p');balance.textContent=`${state.credits} CREDITS · NO REAL MONEY`;shop.append(balance);
  const tabs=document.createElement('nav');tabs.className='arsenal-tabs';for(const name of ['WEAPONS','ATTACHMENTS','EQUIPMENT']){const button=document.createElement('button');button.textContent=name;button.setAttribute('aria-pressed',String(name===category));button.onclick=()=>{category=name;refresh();};tabs.append(button);}shop.append(tabs);
  const catalogue=[{id:'arx7',name:'ARX-7',category:'WEAPONS',unlock:0,effect:'Starter assault rifle'},{id:'sentinel',name:'SENTINEL-45',category:'WEAPONS',unlock:0,effect:'Starter sidearm'},...SHOP];
  for(const item of catalogue.filter(item=>item.category===category)){const row=document.createElement('article');row.className='shop-item';const own=progress.owns(item.id),locked=state.highestCompleted<item.unlock;row.innerHTML=`<div><small>${item.category}</small><b>${item.name}</b><p>${item.effect}</p></div>`;const b=document.createElement('button');b.textContent=own?(item.category==='WEAPONS'?(state.selectedWeapon===item.id?'EQUIPPED':'EQUIP'):'OWNED'):locked?`MISSION ${item.unlock} REQUIRED`:`BUY · ${item.cost}`;b.disabled=locked||(!own&&state.credits<item.cost)||own&&item.category!=='WEAPONS';b.onclick=()=>{if(own)progress.selectWeapon(item.id);else progress.purchase(item.id);actions.refresh();refresh();};if(item.category==='WEAPONS'){const image=document.createElement('img');image.dataset.weapon=item.id;image.alt=item.name+' procedural weapon preview';image.width=180;image.height=80;row.prepend(image);const stats=document.createElement('small'),w=weaponById(item.id);stats.textContent=`DAMAGE ${w.damage} / ${Math.round(60/w.interval)} RPM / ${w.range}m`;row.firstElementChild.after(stats);}row.append(b);shop.append(row);}
  if($('arsenal').classList.contains('on'))actions.preview(shop);
  cards.replaceChildren();for(const l of LEVELS){const b=document.createElement('button');b.className='mission-card';b.disabled=!progress.unlocked(l.id);b.innerHTML=`<small>0${l.id} · ${l.map.name}</small><b>${l.title}</b><span>${b.disabled?'LOCKED':l.id<=state.highestCompleted?'REPLAY':'AVAILABLE'}</span>`;b.onclick=()=>{progress.selectLevel(l.id);$('level-select').value=l.id;actions.refresh();};cards.append(b);}
  dossier.innerHTML='<img class=portrait src="./media/daniel.webp" alt="Daniel Vale reference portrait"><h3>DANIEL VALE / ECHO ONE</h3><p>Survivor of the first Blacksite incident. Returning to find the truth.</p><img class=portrait src="./media/maya.webp" alt="Maya Reyes reference portrait"><h3>MAYA REYES</h3><p>Recon medic. Missing after the incident. Status remains unconfirmed.</p><h3>ELIAS KANE</h3><p>'+ (state.highestCompleted>=3?'Former teammate. Confirmed commanding Sentinel. Motive unknown.':'Trusted teammate. Presumed lost during the incident.')+'</p>';
  if(state.highestCompleted>=3)dossier.insertAdjacentHTML('beforeend','<img class=portrait src="./media/kane.webp" alt="Elias Kane recovered portrait">');
  career.textContent=`RANK ${1+Math.floor(state.xp/1000)} · ${state.xp} XP · ${state.credits} CREDITS · ${state.highestCompleted}/4 MISSIONS`;for(const text of state.intel){const p=document.createElement('p');p.textContent=text;career.append(p);}
 }
 refresh();return {refresh,confirmQuit(){ $('confirmation').classList.add('on'); }};
}
