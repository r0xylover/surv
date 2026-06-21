import Dexie, { type Table } from 'dexie';
import type {
  BlobRecord,
  Building,
  Defect,
  DictionaryItem,
  Drawing,
  Floor,
  Photo,
  PhotoAnnotation,
  Project,
  Structure
} from '../shared/types';

export class InspectionDatabase extends Dexie {
  projects!: Table<Project, string>;
  buildings!: Table<Building, string>;
  floors!: Table<Floor, string>;
  drawings!: Table<Drawing, string>;
  structures!: Table<Structure, string>;
  defects!: Table<Defect, string>;
  photos!: Table<Photo, string>;
  photoAnnotations!: Table<PhotoAnnotation, string>;
  dictionaries!: Table<DictionaryItem, string>;
  blobs!: Table<BlobRecord, string>;

  constructor() {
    super('inspection-pwa');

    this.version(1).stores({
      projects: 'id, name, updatedAt',
      buildings: 'id, projectId, name, updatedAt',
      floors: 'id, buildingId, name, elevation, updatedAt',
      drawings: 'id, floorId, kind, updatedAt',
      structures: 'id, projectId, buildingId, floorId, drawingId, name, type, material, axesX, axesY, updatedAt, lastInspectionAt',
      defects: 'id, structureId, type, severity, updatedAt',
      photos: 'id, structureId, defectId, createdAt',
      photoAnnotations: 'id, photoId, kind, createdAt',
      dictionaries: 'id, category, key, label',
      blobs: 'id, createdAt'
    });
  }
}

export const db = new InspectionDatabase();
