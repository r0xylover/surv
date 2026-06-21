export type EntityId = string;

export type StructureKind =
  | 'column'
  | 'beam'
  | 'truss'
  | 'crane_beam'
  | 'roof_slab'
  | 'floor_slab'
  | 'wall'
  | 'foundation'
  | 'brace'
  | 'stair'
  | 'roof'
  | 'fence'
  | 'other';

export type Severity = 'low' | 'medium' | 'high' | 'critical';

export interface Project {
  id: EntityId;
  name: string;
  customer?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Building {
  id: EntityId;
  projectId: EntityId;
  name: string;
  temperatureBlock?: string;
  section?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Floor {
  id: EntityId;
  buildingId: EntityId;
  name: string;
  elevation: string;
  createdAt: string;
  updatedAt: string;
}

export interface Drawing {
  id: EntityId;
  floorId: EntityId;
  name: string;
  kind: 'pdf' | 'dxf' | 'dwg' | 'image';
  fileName: string;
  mimeType: string;
  blobId: EntityId;
  width?: number;
  height?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Structure {
  id: EntityId;
  projectId: EntityId;
  buildingId: EntityId;
  floorId: EntityId;
  drawingId?: EntityId;
  name: string;
  type: StructureKind;
  material: string;
  elevation: string;
  axesX: string;
  axesY: string;
  span?: string;
  temperatureBlock?: string;
  section?: string;
  dimensions?: string;
  notes?: string;
  x: number;
  y: number;
  createdAt: string;
  updatedAt: string;
  lastInspectionAt?: string;
}

export interface Defect {
  id: EntityId;
  structureId: EntityId;
  type: string;
  description: string;
  severity: Severity;
  recommendation?: string;
  author?: string;
  voiceText?: string;
  x?: number;
  y?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Photo {
  id: EntityId;
  structureId: EntityId;
  defectId?: EntityId;
  fileName: string;
  mimeType: string;
  originalBlobId: EntityId;
  optimizedBlobId: EntityId;
  thumbnailBlobId: EntityId;
  comment?: string;
  shotAt?: string;
  createdAt: string;
}

export interface PhotoAnnotation {
  id: EntityId;
  photoId: EntityId;
  kind: 'arrow' | 'rect' | 'circle' | 'cloud' | 'text' | 'label';
  payload: string;
  createdAt: string;
}

export interface DictionaryItem {
  id: EntityId;
  category: 'structureType' | 'defectType';
  key: string;
  label: string;
  material?: string;
  createdAt: string;
}

export interface BlobRecord {
  id: EntityId;
  blob: Blob;
  createdAt: string;
}
