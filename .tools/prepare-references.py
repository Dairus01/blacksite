from pathlib import Path
import json, shutil, subprocess
from PIL import Image, ImageDraw
R=Path(__file__).resolve().parents[1]; W=R/'.work'; D=R/'docs'
m=json.loads((D/'MEDIA_MANIFEST.json').read_text(encoding='utf-8'))
purposes=['Loading / Operation AEGIS','Daniel Vale turnaround, proportions, equipment','Maya Reyes medic / recon identity','Elias Kane hostile commander','Sentinel human archetypes','Weapons, attachments and equipment','Four environments and interiors','Campaign and progression','Menus, HUD and store','Gameplay, stairs, cover and boss','Original character / asset overview','Original expanded equipment and interiors','Original narrative storyboard','Daniel expression reference','Kane teammate expression reference','Maya expression reference']
for e,p in zip(m['images'],purposes): e['likelyPurpose']=p; e['visuallyInspected']=True
observations=[
 ('AEGIS briefing', [1,43,73,103,145,181], 'Maya turns from the wall display; Daniel listens in profile. Shoulder-led turn precedes the head settling. Cyan map light reflects on olive uniforms. Rear wide shot pushes into medium and close shots. No rifle reload is visible. Symmetrical console banks, ceiling strips and wall-sized network display define command architecture.'),
 ('Aircraft awakening', [7,31,49,85,115,157], 'Daniel opens his eyes, checks a rifle across his lap, then turns toward the window. Right hand at pistol grip, left under fore-end, muzzle kept down. Close face shot widens to cabin and aircraft exterior. Cold rain light; restrained cabin movement. This is weapon checking, not a complete reload. Aircraft shell, bench, ribs and rainy window provide insertion references.'),
 ('Firefight', [1,13,37,55,79,109,145], 'Daniel fires from the right foreground with stock at shoulder, cheek near sight and support elbow under the rifle. Cut to soldiers on yellow-railed stairs, then rear tracking run on a catwalk. Knees flex and hips lower during running. Turn back at 4.5s leads explosion at 5.5s. White utility lights and red alarms; railings, tread edges, overhead ducts and reinforced doors. Final whiteout is unsuitable for sustained gameplay.'),
 ('Before / friendship', [1,19,37,73,109,133,169], 'A gloved hand pulls Kane upright. He smiles, Maya approaches; Daniel, Kane and Maya walk side by side. Arms oppose legs, boots roll through contact, shoulders remain relaxed. Maya is shorter, not child-proportioned. Warm low sun and waist-to-eye-height tracking; training blocks, rooftop railing and antenna. Strong reference for relaxed idle, rising and walk, but not combat sprint.'),
 ('Reyes / loss', [1,31,55,73,97,121], 'Daniel lies in the near foreground, Maya approaches low through smoke and reaches toward him. His hand rises toward her. A gloved figure recovers the triangular AEGIS module. Low camera, shallow foreground focus and smoke occlusion. Cyan ambient with red practicals and sparks. Maya fate is NOT shown. Black frames after roughly 5.5s must be excluded from the memory edit.'),
 ('Approach', [1,25,43,61,85,109,139,187], 'Squad approaches at low ready on wet concrete. Maya signals halt at 1.75s. Daniel lowers beside cover while others aim around him; Maya touches headset. Low shoulders, bent knees and staggered feet. Wide front tracking cuts to side cover then close portrait and rear wide. Floodlights, barbed fence, concrete piers, tower beacon and high catwalk supply facility vocabulary. Soldiers remain human; dark silhouettes require rim light.')]
lines=['# Video analysis','Every original was sampled visually across its full duration at 250 ms intervals, with every decoded frame retained. Measurements below are visual estimates, not motion capture or camera metadata. Exact filenames and technical properties are in MEDIA_MANIFEST.json.','All six sources: 192 frames, 24 fps, 8 seconds. No complete reload, melee, grenade throw or clean death cycle is evidenced; those animations must be authored and tested, not attributed to nonexistent reference footage.']
for e,(name,frames,note) in zip(m['videos'],observations):
 e['visuallyInspected']=True; e['selectedKeyframes']=frames; e['analysis']=note
 lines+=['',f'## {name}',f"Source: `{e['filename']}`",note,f"Key frames: {', '.join(map(str,frames))}. First: 1. Final: 192."]
 for n in frames:
  src=W/'video-frames'/e['slug']/f'frame_{n:06}.jpg'; dest=W/'pose-analysis'/f"{e['slug']}-{n:06}.jpg"
  im=Image.open(src); draw=ImageDraw.Draw(im); draw.rectangle((0,0,im.width,34),fill='black'); draw.text((10,10),f'{name} | frame {n} | {(n-1)/24:.3f}s',fill='white'); im.save(dest,quality=94)
 for label,n in [('first',1),('final',192),('human',frames[2]),('architecture',frames[0]),('lighting',frames[-1])]:
  shutil.copy2(W/'video-frames'/e['slug']/f'frame_{n:06}.jpg',W/'reference-crops'/f"{e['slug']}-{label}.jpg")
(D/'VIDEO_ANALYSIS.md').write_text('\n\n'.join(lines),encoding='utf-8')
for i in range(1,11):
 im=Image.open(R/'Sep 25 - 01_14'/m['images'][i-1]['filename']); w,h=im.size
 for row in range(2):
  for col in range(2): im.crop((col*w//2,row*h//2,(col+1)*w//2,(row+1)*h//2)).save(W/'reference-crops'/f'board-{i:02}-{row}-{col}.jpg',quality=94)
(D/'MEDIA_MANIFEST.json').write_text(json.dumps(m,indent=2,ensure_ascii=False),encoding='utf-8')
# 15-second editorial cut. Own supplied reference video is only a skippable 2D memory.
order=[3,0,5,2,4,1]; starts=[4.5,1.5,0.5,0.2,1.0,0.25]
parts=[]
for j,(idx,start) in enumerate(zip(order,starts)):
 out=W/'media-analysis'/f'memory-{j}.mp4'; parts.append(out)
 subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-ss',str(start),'-i',str(R/'Sep 25 - 01_14'/m['videos'][idx]['filename']),'-t','2.5','-vf','scale=960:540','-c:v','libx264','-preset','medium','-crf','23','-an',str(out)],check=True)
concat=W/'media-analysis'/'concat.txt'; concat.write_text('\n'.join("file '"+p.as_posix()+"'" for p in parts))
(R/'game/media').mkdir(exist_ok=True)
subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-f','concat','-safe','0','-i',str(concat),'-c','copy','-movflags','+faststart',str(R/'game/media/memory.mp4')],check=True)
for idx in [1,2,3,6]:
 im=Image.open(R/'Sep 25 - 01_14'/m['images'][idx]['filename']); im.thumbnail((720,540)); im.save(R/'game/media'/f'board-{idx}.webp',quality=78)
print('Annotated frames, cropped boards and 15-second memory prepared.')
