import * as THREE from "three/webgpu";


export function createASCIITexture(dict:string): THREE.Texture {
 
  const length = dict.length;
  const glyphWidth = 64;
  const canvasWidth = length * glyphWidth;
  const canvasHeight = 64;

  // 1. Create off‑screen canvas (no need to append to DOM)
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  // 2. Draw the glyphs
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight); // width/height were swapped

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 40px Menlo';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle'; // better vertical centering

  for (let i = 0; i < length; i++) {
    // Centre each glyph in its own 64px‑wide cell
    
    if (i > 50){
      for (let j = 0; j < 10 ; j++){
        ctx.filter = `blur(${j * 1})px`
        ctx.fillText(dict[i], 32 + i*64, 64/2)
      }
    }
      ctx.filter = 'none'
    const x = i * glyphWidth + glyphWidth / 2;
    const y = canvasHeight / 2;
    ctx.fillText(dict[i], x, y);
  }

  // 3. Create Three.js texture
  const asciiTexture = new THREE.Texture(canvas);
  asciiTexture.needsUpdate = true;
  return asciiTexture;
}