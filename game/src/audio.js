export function createSoundscape(context,settings){
 const buffers=new Map();let ambience=null;
 const load=async(name)=>{try{const data=await fetch(`./media/${name}.mp3`);if(!data.ok)return;buffers.set(name,await context.decodeAudioData(await data.arrayBuffer()));}catch{}};
 load('rifle');
 function shot(id='arx7',volume=.22){const buffer=buffers.get('rifle');if(!buffer)return false;const s=context.createBufferSource(),g=context.createGain();s.buffer=buffer;s.playbackRate.value=({kestrel:1.35,breacher:.65,vesper:.82,sentinel:1.18})[id]||1;g.gain.value=volume*settings().master*settings().sfx;s.connect(g).connect(context.destination);s.start();return true;}
 function noise(duration=.08,volume=.03,frequency=800){const buffer=context.createBuffer(1,Math.ceil(context.sampleRate*duration),context.sampleRate),d=buffer.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,2);const s=context.createBufferSource(),g=context.createGain(),f=context.createBiquadFilter();s.buffer=buffer;f.type='lowpass';f.frequency.value=frequency;g.gain.value=volume*settings().master*settings().sfx;s.connect(f).connect(g).connect(context.destination);s.start();}
 async function ambient(){await load('ambience');if(!buffers.has('ambience')||ambience)return;const s=context.createBufferSource(),g=context.createGain();s.buffer=buffers.get('ambience');s.loop=true;s.connect(g).connect(context.destination);ambience={s,g};update();s.start();}
 function update(){if(ambience)ambience.g.gain.value=settings().master*settings().music*.4;}
 return {shot,noise,ambient,update};
}
