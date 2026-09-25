from pathlib import Path
import json,subprocess
from PIL import Image
R=Path.cwd();W=R/'.work/media-analysis';m=json.loads((R/'docs/MEDIA_MANIFEST.json').read_text(encoding='utf-8'))
parts=[]
for j,(idx,start) in enumerate(zip([3,0,5,2,4,1],[4.5,1.5,.5,.2,1,.25])):
 out=W/f'hq-{j}.mp4';parts.append(out)
 subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-ss',str(start),'-i',str(R/'Sep 25 - 01_14'/m['videos'][idx]['filename']),'-t','2.5','-vf','scale=1280:720','-c:v','libx264','-preset','medium','-crf','20','-an',str(out)],check=True)
concat=W/'hq-concat.txt';concat.write_text('\n'.join("file '"+p.as_posix()+"'" for p in parts))
subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-f','concat','-safe','0','-i',str(concat),'-stream_loop','-1','-i',str(R/'game/media/ambience.mp3'),'-t','15','-c:v','copy','-c:a','aac','-b:a','64k','-af','afade=t=in:d=1,afade=t=out:st=13:d=2','-movflags','+faststart',str(R/'game/media/memory.mp4')],check=True)
for idx,name,bounds in [(1,'daniel',(.61,.08,1,.54)),(2,'maya',(.67,0,1,.33)),(3,'kane',(.73,0,1,.39))]:
 im=Image.open(R/'Sep 25 - 01_14'/m['images'][idx]['filename']);w,h=im.size;im=im.crop(tuple(int(v*(w if i%2==0 else h)) for i,v in enumerate(bounds)));im.thumbnail((280,280));im.save(R/'game/media'/f'{name}.webp',quality=85)
for name in ['board-1.webp','board-2.webp','board-3.webp','board-6.webp']:
 p=(R/'game/media'/name).resolve();assert p.parent==(R/'game/media').resolve();p.unlink(missing_ok=True)
print('Memory bytes:',(R/'game/media/memory.mp4').stat().st_size)
