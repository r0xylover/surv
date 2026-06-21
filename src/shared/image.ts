import imageCompression from 'browser-image-compression';
import { createId, nowIso } from './lib';
import { db } from '../db/database';

async function makeThumbnail(blob: Blob) {
  const bitmap = await createImageBitmap(blob);
  const scale = 320 / Math.max(bitmap.width, bitmap.height);
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');
  ctx.drawImage(bitmap, 0, 0, width, height);
  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((result) => {
      if (result) resolve(result);
      else reject(new Error('Thumbnail generation failed'));
    }, 'image/webp', 0.88);
  });
}

export async function storeImageSet(file: File) {
  const optimized = await imageCompression(file, {
    maxSizeMB: 2.5,
    maxWidthOrHeight: 3000,
    initialQuality: 0.88,
    useWebWorker: true,
    fileType: file.type.includes('png') ? 'image/png' : 'image/webp',
    preserveExif: true
  });

  const thumbnail = await makeThumbnail(optimized);
  const createdAt = nowIso();
  const originalBlobId = createId();
  const optimizedBlobId = createId();
  const thumbnailBlobId = createId();

  await db.blobs.bulkAdd([
    { id: originalBlobId, blob: file, createdAt },
    { id: optimizedBlobId, blob: optimized, createdAt },
    { id: thumbnailBlobId, blob: thumbnail, createdAt }
  ]);

  return { originalBlobId, optimizedBlobId, thumbnailBlobId };
}
