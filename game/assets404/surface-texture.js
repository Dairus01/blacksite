export function makeSurfaceTexture(THREE, kind = 'concrete') {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d', { alpha: false });
  const image = context.createImageData(size, size);
  const concrete = kind === 'concrete';
  const base = concrete ? [118, 125, 127] : [70, 76, 77];
  let seed = concrete ? 1949 : 404;
  for (let i = 0; i < size * size; i += 1) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const grain = ((seed >>> 24) / 255 - 0.5) * (concrete ? 22 : 12);
    const offset = i * 4;
    image.data[offset] = base[0] + grain;
    image.data[offset + 1] = base[1] + grain;
    image.data[offset + 2] = base[2] + grain;
    image.data[offset + 3] = 255;
  }
  context.putImageData(image, 0, 0);
  context.strokeStyle = concrete ? 'rgba(20,27,29,.38)' : 'rgba(145,153,150,.07)';
  context.lineWidth = concrete ? 2 : 1;
  const spacing = concrete ? 64 : 24;
  for (let p = spacing; p < size; p += spacing) {
    context.beginPath(); context.moveTo(p, 0); context.lineTo(p, size); context.stroke();
    context.beginPath(); context.moveTo(0, p); context.lineTo(size, p); context.stroke();
  }
  if (!concrete) {
    context.fillStyle = 'rgba(8,12,13,.16)';
    for (let i = 0; i < 30; i += 1) {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      const x = (seed >>> 24) / 255 * size;
      seed = (seed * 1664525 + 1013904223) >>> 0;
      const y = (seed >>> 24) / 255 * size;
      context.fillRect(x, y, 8 + (i % 4) * 3, 1);
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(concrete ? 3 : 7, concrete ? 3 : 7);
  texture.anisotropy = 2;
  return texture;
}
