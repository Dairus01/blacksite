// Memory playback never gates renderer/input readiness.
export function setupMemory(){
 const panel=document.createElement('section');panel.id='memory';panel.className='screen on';
 panel.innerHTML='<video muted autoplay playsinline preload="auto" src="./media/memory.mp4"></video><div class="memory-copy"><p class="system-line">ECHO ONE // FRAGMENTED RECALL</p><h2>PROJECT BLACKSITE</h2><p id="memory-caption">BEFORE BLACKSITE // WE WERE A TEAM</p><label>SYNCHRONIZING MISSION DATA… <progress max="1" value="0"></progress></label><button id="skip-memory" disabled>PREPARING SYSTEMS</button></div>';
 document.body.append(panel);const video=panel.querySelector('video'),button=panel.querySelector('button'),bar=panel.querySelector('progress');
 const captions=['BEFORE BLACKSITE // WE WERE A TEAM','AEGIS // A NETWORK THAT CONNECTED EVERYTHING','THE LAST MISSION // ONE MORE INSERTION','SIGNAL LOST // KANE NEVER CAME HOME','MAYA REYES // MISSING, NOT FORGOTTEN','NOW // RETURN TO BLACKSITE'];
 video.addEventListener('timeupdate',()=>{document.getElementById('memory-caption').textContent=captions[Math.min(5,Math.floor(video.currentTime/2.5))];});
 let originalParent=null,originalNext=null;
 const close=()=>{const start=document.getElementById('startb');if(originalParent&&start){originalParent.insertBefore(start,originalNext);originalParent=null;}video.pause();panel.classList.remove('on');};button.onclick=close;video.onended=close;video.onerror=close;video.play().catch(()=>{});
 const unmute=document.createElement('button');unmute.textContent='MEMORY SOUND';unmute.onclick=()=>{video.muted=!video.muted;unmute.textContent=video.muted?'MEMORY SOUND':'MUTE MEMORY';};panel.querySelector('.memory-copy').append(unmute);
 return {ready(){const start=document.getElementById('startb');originalParent=start.parentElement;originalNext=start.nextSibling;panel.querySelector('.memory-copy').append(start);bar.value=1;button.disabled=false;button.textContent='SKIP MEMORY';panel.classList.add('ready');},close};
}
