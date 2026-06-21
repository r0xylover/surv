import { db } from '../db/database';

export async function importProjectFromFile(file: File) {
  const text = await file.text();
  const payload = JSON.parse(text) as Record<string, unknown[]>;

  await db.transaction('rw', [db.projects, db.buildings, db.floors, db.drawings, db.structures, db.defects, db.photos, db.photoAnnotations, db.dictionaries], async () => {
    await db.projects.clear();
    await db.buildings.clear();
    await db.floors.clear();
    await db.drawings.clear();
    await db.structures.clear();
    await db.defects.clear();
    await db.photos.clear();
    await db.photoAnnotations.clear();
    await db.dictionaries.clear();

    if (payload.projects) await db.projects.bulkAdd(payload.projects as never[]);
    if (payload.buildings) await db.buildings.bulkAdd(payload.buildings as never[]);
    if (payload.floors) await db.floors.bulkAdd(payload.floors as never[]);
    if (payload.drawings) await db.drawings.bulkAdd(payload.drawings as never[]);
    if (payload.structures) await db.structures.bulkAdd(payload.structures as never[]);
    if (payload.defects) await db.defects.bulkAdd(payload.defects as never[]);
    if (payload.photos) await db.photos.bulkAdd(payload.photos as never[]);
    if (payload.photoAnnotations) await db.photoAnnotations.bulkAdd(payload.photoAnnotations as never[]);
    if (payload.dictionaries) await db.dictionaries.bulkAdd(payload.dictionaries as never[]);
  });
}
