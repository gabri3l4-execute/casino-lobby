
// src/utils/makeTinyPreview.ts
export async function makeTinyPreview(src: string, w = 16, h = 10, quality = 0.6, cache = true) {
  if (!src) return null;
  try {
    const cacheKey = `lqip:${src}:${w}x${h}:${quality}`;
    if (cache) {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) return cached;
    }

    // Load image
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.crossOrigin = "anonymous";
      i.onload = () => resolve(i);
      i.onerror = (e) => reject(e);
      i.src = src;
    });

    // Draw to offscreen canvas
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Fill with average color fallback (keeps consistent small payload)
    ctx.fillStyle = "#eee";
    ctx.fillRect(0, 0, w, h);

    // Draw scaled image (cover-like)
    const aspectSrc = img.width / img.height;
    const aspectDest = w / h;
    let sx = 0, sy = 0, sw = img.width, sh = img.height;

    if (aspectSrc > aspectDest) {
      // source is wider -> crop horizontally
      sw = img.height * aspectDest;
      sx = (img.width - sw) / 2;
    } else {
      // source is taller -> crop vertically
      sh = img.width / aspectDest;
      sy = (img.height - sh) / 2;
    }

    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);

    // tiny jpeg data URL
    const dataUrl = canvas.toDataURL("image/jpeg", quality);

    if (cache) {
      try {
        sessionStorage.setItem(cacheKey, dataUrl);
      } catch {
        // ignore quota errors
      }
    }

    return dataUrl;
  } catch {
    return null;
  }
}