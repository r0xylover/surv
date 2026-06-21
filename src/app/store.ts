import { create } from 'zustand';
import type { Building, Defect, Drawing, Floor, Photo, Project, Structure } from '../shared/types';

interface AppState {
  projects: Project[];
  buildings: Building[];
  floors: Floor[];
  drawings: Drawing[];
  structures: Structure[];
  defects: Defect[];
  photos: Photo[];
  selectedStructureId?: string;
  selectedDefectId?: string;
  selectedFloorId?: string;
  loading: boolean;
  setData: (payload: Partial<AppState>) => void;
  selectStructure: (id?: string) => void;
  selectDefect: (id?: string) => void;
  selectFloor: (id?: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  projects: [],
  buildings: [],
  floors: [],
  drawings: [],
  structures: [],
  defects: [],
  photos: [],
  selectedStructureId: undefined,
  selectedDefectId: undefined,
  selectedFloorId: undefined,
  loading: true,
  setData: (payload) => set(payload),
  selectStructure: (id) => set({ selectedStructureId: id, selectedDefectId: undefined }),
  selectDefect: (id) => set({ selectedDefectId: id }),
  selectFloor: (id) => set({ selectedFloorId: id }),
}));
