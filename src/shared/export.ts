import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { db } from '../db/database';
import { severityLabels, structureTypeLabels } from './lib';

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

export async function exportProjectJson() {
  const [projects, buildings, floors, drawings, structures, defects, photos, photoAnnotations, dictionaries] = await Promise.all([
    db.projects.toArray(),
    db.buildings.toArray(),
    db.floors.toArray(),
    db.drawings.toArray(),
    db.structures.toArray(),
    db.defects.toArray(),
    db.photos.toArray(),
    db.photoAnnotations.toArray(),
    db.dictionaries.toArray()
  ]);

  const payload = { projects, buildings, floors, drawings, structures, defects, photos, photoAnnotations, dictionaries };
  downloadBlob(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }), 'project-export.json');
}

export async function exportStatements() {
  const [structures, defects] = await Promise.all([db.structures.toArray(), db.defects.toArray()]);

  const structureRows = await Promise.all(
    structures.map(async (structure) => ({
      Номер: structure.name,
      Тип: structureTypeLabels[structure.type] ?? structure.type,
      Материал: structure.material,
      Этаж: structure.elevation,
      Оси: `${structure.axesX}-${structure.axesY}`,
      Дефекты: await db.defects.where('structureId').equals(structure.id).count()
    }))
  );

  const defectRows = defects.map((defect) => ({
    Дефект: defect.id,
    Тип: defect.type,
    Описание: defect.description,
    Опасность: severityLabels[defect.severity],
    Рекомендации: defect.recommendation ?? ''
  }));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(structureRows), 'Конструкции');
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(defectRows), 'Дефекты');
  const wbArray = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  downloadBlob(new Blob([wbArray], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), 'vedomosti.xlsx');

  const csv = XLSX.utils.sheet_to_csv(XLSX.utils.json_to_sheet(defectRows));
  downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8' }), 'defects.csv');
}

export async function exportZipProject() {
  const zip = new JSZip();
  const root = zip.folder('Проект');
  if (!root) return;

  const [projects, buildings, floors, structures, defects, photos] = await Promise.all([
    db.projects.toArray(),
    db.buildings.toArray(),
    db.floors.toArray(),
    db.structures.toArray(),
    db.defects.toArray(),
    db.photos.toArray()
  ]);

  root.file('Проект.json', JSON.stringify({ projects, buildings, floors }, null, 2));
  const constructions = root.folder('Конструкции');

  for (const structure of structures) {
    const structureFolder = constructions?.folder(structure.name.replace(/\//g, '_'));
    structureFolder?.file('Паспорт.json', JSON.stringify(structure, null, 2));

    const structureDefects = defects.filter((item) => item.structureId === structure.id);
    structureDefects.forEach((defect, index) => {
      structureFolder?.file(`Дефект_${String(index + 1).padStart(3, '0')}.json`, JSON.stringify(defect, null, 2));
    });

    const photoFolder = structureFolder?.folder('Фото');
    for (const photo of photos.filter((item) => item.structureId === structure.id)) {
      const blobRecord = await db.blobs.get(photo.optimizedBlobId);
      if (blobRecord) {
        photoFolder?.file(photo.fileName, blobRecord.blob);
      }
    }
  }

  const archive = await zip.generateAsync({ type: 'blob' });
  downloadBlob(archive, 'inspection-project.zip');
}
