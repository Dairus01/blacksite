"""Non-destructive reference inventory, full frame extraction and contact sheets."""
import json, subprocess, re, hashlib
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'Sep 25 - 01_14'
WORK = ROOT / '.work'
for folder in ['media-analysis', 'video-frames', 'contact-sheets', 'reference-crops', 'pose-analysis', 'environment-analysis', 'weapon-analysis']:
    (WORK / folder).mkdir(parents=True, exist_ok=True)

def sheet(paths, dest, columns=4, width=320, labels=None):
    height = int(width * 9 / 16) + 30
    canvas = Image.new('RGB', (columns * width, ((len(paths)+columns-1)//columns)*height), '#111820')
    draw = ImageDraw.Draw(canvas)
    for i, path in enumerate(paths):
        im = Image.open(path).convert('RGB'); im.thumbnail((width-8, height-32))
        x, y = (i % columns)*width, (i//columns)*height
        canvas.paste(im, (x+(width-im.width)//2, y))
        draw.text((x+5,y+height-27), labels[i] if labels else path.name, fill='white')
    canvas.save(dest, quality=88)

manifest = {'source': SOURCE.name, 'originalsUnmodified': True, 'images': [], 'videos': []}
for index, path in enumerate(sorted(SOURCE.iterdir())):
    if path.suffix.lower() not in ['.mp4','.png','.jpg','.jpeg','.webp']: continue
    entry = {'filename': path.name, 'bytes': path.stat().st_size, 'sha256': hashlib.sha256(path.read_bytes()).hexdigest()}
    if path.suffix.lower() != '.mp4':
        im = Image.open(path)
        entry.update(width=im.width, height=im.height, likelyPurpose='Design board' if 'AM-' in path.name else 'Character reference' if 'Reference' in path.name else 'Original concept board')
        manifest['images'].append(entry)
        im.thumbnail((1600,1600)); im.convert('RGB').save(WORK/'media-analysis'/f'image-{len(manifest["images"]):02}.jpg', quality=94)
        continue
    probe = json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(path)], encoding='utf-8'))
    video = next(s for s in probe['streams'] if s['codec_type']=='video')
    audio = next((s for s in probe['streams'] if s['codec_type']=='audio'), {})
    slug = re.sub('[^a-z0-9]+','-',path.stem.lower()).strip('-')
    out = WORK/'video-frames'/slug; out.mkdir(exist_ok=True)
    entry.update(slug=slug, duration=float(probe['format']['duration']), width=video['width'], height=video['height'], fps=video['avg_frame_rate'], frameCount=int(video.get('nb_frames',0)), codec=video['codec_name'], audioCodec=audio.get('codec_name'))
    subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(path),'-q:v','3',str(out/'frame_%06d.jpg')],check=True)
    frames = sorted(out.glob('frame_*.jpg'))
    entry['extractedFrames'] = len(frames)
    n,d = map(int,entry['fps'].split('/')); fps=n/d
    samples = [frames[min(len(frames)-1,round(t*fps/4))] for t in range(int(entry['duration']*4))]
    samples.append(frames[-1])
    labels = [f'{i/4:.2f}s / {p.stem}' for i,p in enumerate(samples[:-1])] + [f'FINAL / {frames[-1].stem}']
    sheet(samples,WORK/'contact-sheets'/f'{slug}-contact-sheet.jpg',labels=labels)
    entry['quarterSecondFrames'] = [p.name for p in samples]
    manifest['videos'].append(entry)
    print(f'{path.name}: {len(frames)} frames',flush=True)
(ROOT/'docs'/'MEDIA_MANIFEST.json').write_text(json.dumps(manifest,indent=2,ensure_ascii=False),encoding='utf-8')
print(f"Inventoried {len(manifest['images'])} images and {len(manifest['videos'])} videos.")
