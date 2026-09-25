from pathlib import Path
import json
import subprocess
from PIL import Image

R = Path.cwd()
W = R / '.work/media-analysis'
m = json.loads((R / 'docs/MEDIA_MANIFEST.json').read_text(encoding='utf-8'))

W.mkdir(parents=True, exist_ok=True)

# Build the 15-second memory montage from the ORIGINAL Flow clips while preserving
# their scene audio. If a source clip has no audio stream, synthesize silence for
# that segment so the concat remains valid.
selections = list(zip([3, 0, 5, 2, 4, 1], [4.5, 1.5, .5, .2, 1, .25]))
parts = []

def has_audio(path: Path) -> bool:
    probe = subprocess.run(
        [
            'ffprobe', '-v', 'error',
            '-select_streams', 'a:0',
            '-show_entries', 'stream=index',
            '-of', 'csv=p=0',
            str(path),
        ],
        capture_output=True,
        text=True,
        check=False,
    )
    return bool(probe.stdout.strip())

for j, (idx, start) in enumerate(selections):
    src = R / 'Sep 25 - 01_14' / m['videos'][idx]['filename']
    out = W / f'hq-{j}.mp4'
    parts.append(out)

    if has_audio(src):
        cmd = [
            'ffmpeg', '-hide_banner', '-loglevel', 'error', '-y',
            '-ss', str(start), '-i', str(src),
            '-t', '2.5',
            '-vf', 'scale=1280:720',
            '-c:v', 'libx264', '-preset', 'medium', '-crf', '20',
            '-c:a', 'aac', '-b:a', '96k', '-ar', '48000', '-ac', '2',
            '-af', 'afade=t=in:st=0:d=0.12,afade=t=out:st=2.25:d=0.25',
            '-movflags', '+faststart',
            str(out),
        ]
    else:
        cmd = [
            'ffmpeg', '-hide_banner', '-loglevel', 'error', '-y',
            '-ss', str(start), '-i', str(src),
            '-f', 'lavfi', '-t', '2.5', '-i', 'anullsrc=r=48000:cl=stereo',
            '-t', '2.5',
            '-vf', 'scale=1280:720',
            '-map', '0:v:0', '-map', '1:a:0',
            '-c:v', 'libx264', '-preset', 'medium', '-crf', '20',
            '-c:a', 'aac', '-b:a', '96k', '-ar', '48000', '-ac', '2',
            '-shortest',
            '-movflags', '+faststart',
            str(out),
        ]

    subprocess.run(cmd, check=True)

concat = W / 'hq-concat.txt'
concat.write_text(
    '\n'.join("file '" + p.resolve().as_posix() + "'" for p in parts),
    encoding='utf-8',
)

# Concatenate the six selected moments. No generic ambience is layered over them:
# the soundtrack now comes from the actual generated scenes.
subprocess.run(
    [
        'ffmpeg', '-hide_banner', '-loglevel', 'error', '-y',
        '-f', 'concat', '-safe', '0', '-i', str(concat),
        '-t', '15',
        '-c:v', 'copy',
        '-c:a', 'aac', '-b:a', '96k', '-ar', '48000', '-ac', '2',
        '-af', 'afade=t=in:st=0:d=0.35,afade=t=out:st=14.2:d=0.8',
        '-movflags', '+faststart',
        str(R / 'game/media/memory.mp4'),
    ],
    check=True,
)

# Character portraits derived from the reference boards.
for idx, name, bounds in [
    (1, 'daniel', (.61, .08, 1, .54)),
    (2, 'maya', (.67, 0, 1, .33)),
    (3, 'kane', (.73, 0, 1, .39)),
]:
    im = Image.open(R / 'Sep 25 - 01_14' / m['images'][idx]['filename'])
    w, h = im.size
    im = im.crop(tuple(int(v * (w if i % 2 == 0 else h)) for i, v in enumerate(bounds)))
    im.thumbnail((280, 280))
    im.save(R / 'game/media' / f'{name}.webp', quality=85)

for name in ['board-1.webp', 'board-2.webp', 'board-3.webp', 'board-6.webp']:
    p = (R / 'game/media' / name).resolve()
    assert p.parent == (R / 'game/media').resolve()
    p.unlink(missing_ok=True)

print('Memory bytes:', (R / 'game/media/memory.mp4').stat().st_size)
print('Memory soundtrack: preserved original Flow scene audio; generic ambience removed.')
