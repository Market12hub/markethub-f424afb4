import { getToken } from './api.js';

const MAX_SIDE = 16000;

// Shrinks the photo in the browser, so uploads are small and the shop stays fast
async function shrink(file) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff'; // PNG transparency becomes white instead of black
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close?.();

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Could not process the photo'))),
      'image/jpeg',
      0.9
    );
  });
}

// Sends one photo to the server and returns its address, like /uploads/abc123.jpg
export async function uploadPhoto(file) {
  if (!file.type.startsWith('image/')) {
    throw new Error('Choose an image file (JPG, PNG or WebP)');
  }
  if (file.size > 25 * 1024 * 1024) {
    throw new Error('That photo is too large');
  }

  let blob;
  try {
    blob = await shrink(file);
  } catch {
    throw new Error('This photo type is not supported. Use JPG, PNG or WebP.');
  }

  const body = new FormData();
  body.append('image', blob, 'photo.jpg');

  const res = await fetch('/api/uploads', {
    method: 'POST',
    headers: { Authorization: `Bearer ${getToken()}` },
    body,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Upload failed');
  return data.url;
}