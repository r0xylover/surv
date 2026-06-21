import { db } from '../db/database';
import { seedDictionaries } from '../db/seed';
import { createDemoData } from '../shared/demo';

export async function ensureDemoProject() {
  await seedDictionaries();
  const hasProjects = await db.projects.count();
  if (hasProjects > 0) return;

  const demo = createDemoData();
  await db.transaction('rw', [db.projects, db.buildings, db.floors, db.structures, db.defects], async () => {
    await db.projects.add(demo.project);
    await db.buildings.add(demo.building);
    await db.floors.add(demo.floor);
    await db.structures.add(demo.structure);
    await db.defects.add(demo.defect);
  });
}

export async function loadSnapshot() {
  const [projects, buildings, floors, drawings, structures, defects, photos] = await Promise.all([
    db.projects.toArray(),
    db.buildings.toArray(),
    db.floors.toArray(),
    db.drawings.toArray(),
    db.structures.toArray(),
    db.defects.toArray(),
    db.photos.toArray()
  ]);

  return { projects, buildings, floors, drawings, structures, defects, photos };
}
