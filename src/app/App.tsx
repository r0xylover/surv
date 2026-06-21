import { useEffect } from 'react';
import { Stage, Layer, Circle, Text, Rect } from 'react-konva';
import { Download, FileArchive, FileJson, FileSpreadsheet, Plus, Search, Upload, Camera } from 'lucide-react';
import { db } from '../db/database';
import { ensureDemoProject, loadSnapshot } from './bootstrap';
import { useAppStore } from './store';
import { createId, nowIso, severityLabels, structureTypeLabels } from '../shared/lib';
import { exportProjectJson, exportStatements, exportZipProject } from '../shared/export';
import { importProjectFromFile } from '../shared/import';
import { storeImageSet } from '../shared/image';
import type { Defect, Structure } from '../shared/types';

function cls(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(' ');
}

export function App() {
  const state = useAppStore();

  useEffect(() => {
    void (async () => {
      await ensureDemoProject();
      const snapshot = await loadSnapshot();
      state.setData({ ...snapshot, loading: false, selectedFloorId: snapshot.floors[0]?.id });
    })();
  }, []);

  const selectedStructure = state.structures.find((item) => item.id === state.selectedStructureId);
  const selectedDefect = state.defects.find((item) => item.id === state.selectedDefectId);
  const floorStructures = state.structures.filter((item) => !state.selectedFloorId || item.floorId === state.selectedFloorId);
  const visibleDefects = selectedStructure ? state.defects.filter((item) => item.structureId === selectedStructure.id) : [];

  async function refresh() {
    state.setData(await loadSnapshot());
  }

  async function addStructureAt(x: number, y: number) {
    const floor = state.floors.find((item) => item.id === state.selectedFloorId) ?? state.floors[0];
    const building = state.buildings.find((item) => item.id === floor?.buildingId);
    const project = state.projects[0];
    if (!floor || !building || !project) return;

    const index = state.structures.length + 1;
    const structure: Structure = {
      id: createId(),
      projectId: project.id,
      buildingId: building.id,
      floorId: floor.id,
      name: `Конструкция ${index}`,
      type: 'column',
      material: 'железобетон',
      elevation: floor.elevation,
      axesX: String(index),
      axesY: 'А',
      x,
      y,
      createdAt: nowIso(),
      updatedAt: nowIso()
    };

    await db.structures.add(structure);
    await refresh();
    state.selectStructure(structure.id);
  }

  async function addDefect() {
    if (!selectedStructure) return;
    const defect: Defect = {
      id: createId(),
      structureId: selectedStructure.id,
      type: 'Трещина',
      description: 'Новый дефект',
      severity: 'medium',
      createdAt: nowIso(),
      updatedAt: nowIso()
    };
    await db.defects.add(defect);
    await refresh();
    state.selectDefect(defect.id);
  }

  async function updateStructure(patch: Partial<Structure>) {
    if (!selectedStructure) return;
    await db.structures.update(selectedStructure.id, { ...patch, updatedAt: nowIso() });
    await refresh();
  }

  async function updateDefect(patch: Partial<Defect>) {
    if (!selectedDefect) return;
    await db.defects.update(selectedDefect.id, { ...patch, updatedAt: nowIso() });
    await refresh();
  }

  async function handleImport(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    await importProjectFromFile(file);
    await refresh();
  }

  async function handlePhotos(event: React.ChangeEvent<HTMLInputElement>) {
    if (!selectedStructure) return;
    const files = Array.from(event.target.files ?? []);
    for (const file of files) {
      const blobs = await storeImageSet(file);
      await db.photos.add({
        id: createId(),
        structureId: selectedStructure.id,
        defectId: selectedDefect?.id,
        fileName: file.name,
        mimeType: file.type,
        comment: '',
        shotAt: nowIso(),
        createdAt: nowIso(),
        ...blobs
      });
    }
    await refresh();
  }

  if (state.loading) {
    return <div className="flex min-h-screen items-center justify-center text-slate-200">Загрузка...</div>;
  }

  return (
    <div className="safe-top safe-right safe-bottom safe-left grid min-h-screen min-h-dvh grid-cols-[320px_1fr_360px] grid-rows-[72px_1fr] bg-slate-950 text-slate-100">
      <header className="col-span-3 flex items-center justify-between border-b border-slate-800 px-5">
        <div>
          <div className="text-lg font-semibold">PWA обследования зданий</div>
          <div className="text-xs text-slate-400">Офлайн-режим, локальная БД, готово для GitHub Pages</div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => void exportProjectJson()} className="rounded-lg border border-slate-700 px-3 py-2 text-sm"><FileJson className="mr-2 inline h-4 w-4" />JSON</button>
          <button onClick={() => void exportStatements()} className="rounded-lg border border-slate-700 px-3 py-2 text-sm"><FileSpreadsheet className="mr-2 inline h-4 w-4" />Ведомости</button>
          <button onClick={() => void exportZipProject()} className="rounded-lg border border-slate-700 px-3 py-2 text-sm"><FileArchive className="mr-2 inline h-4 w-4" />ZIP</button>
          <label className="cursor-pointer rounded-lg border border-slate-700 px-3 py-2 text-sm"><Upload className="mr-2 inline h-4 w-4" />Импорт<input type="file" accept="application/json" className="hidden" onChange={handleImport} /></label>
        </div>
      </header>

      <aside className="overflow-auto border-r border-slate-800 p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm font-semibold">Дерево проекта</div>
          <Search className="h-4 w-4 text-slate-400" />
        </div>
        {state.projects.map((project) => (
          <div key={project.id} className="mb-4 rounded-2xl border border-slate-800 bg-slate-900 p-3 shadow-panel">
            <div className="font-medium">{project.name}</div>
            {state.buildings.filter((item) => item.projectId === project.id).map((building) => (
              <div key={building.id} className="mt-3 pl-3 text-sm">
                <div className="text-slate-300">{building.name}</div>
                {state.floors.filter((item) => item.buildingId === building.id).map((floor) => (
                  <button key={floor.id} onClick={() => state.selectFloor(floor.id)} className={cls('mt-2 block w-full rounded-lg px-2 py-2 text-left', state.selectedFloorId === floor.id ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-200')}>
                    {floor.name}
                  </button>
                ))}
              </div>
            ))}
          </div>
        ))}

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-3">
          <div className="mb-2 text-sm font-semibold">Конструкции</div>
          <div className="space-y-2">
            {floorStructures.map((structure) => {
              const defectCount = state.defects.filter((item) => item.structureId === structure.id).length;
              return (
                <button key={structure.id} onClick={() => state.selectStructure(structure.id)} className={cls('w-full rounded-xl border px-3 py-2 text-left', state.selectedStructureId === structure.id ? 'border-blue-500 bg-blue-500/10' : 'border-slate-800 bg-slate-950')}>
                  <div className="text-sm font-medium">{structure.name}</div>
                  <div className="text-xs text-slate-400">{structureTypeLabels[structure.type]} · {structure.axesX}-{structure.axesY} · дефекты: {defectCount}</div>
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      <main className="relative overflow-hidden bg-slate-950 p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm text-slate-300">Нажми на схему для создания конструкции</div>
          <button onClick={addDefect} disabled={!selectedStructure} className="rounded-lg bg-blue-600 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:bg-slate-700"><Plus className="mr-2 inline h-4 w-4" />Дефект</button>
        </div>
        <div className="h-[calc(100vh-120px)] rounded-3xl border border-slate-800 bg-[radial-gradient(circle_at_1px_1px,#1e293b_1px,transparent_0)] [background-size:24px_24px]">
          <Stage width={window.innerWidth - 720} height={window.innerHeight - 140} onClick={(event) => {
            const stage = event.target.getStage();
            const pointer = stage?.getPointerPosition();
            if (pointer) void addStructureAt(pointer.x, pointer.y);
          }}>
            <Layer>
              <Rect x={20} y={20} width={900} height={600} cornerRadius={20} stroke="#334155" strokeWidth={2} dash={[10, 8]} />
              <Text x={40} y={40} text="Рабочее поле чертежа / PDF / DXF" fill="#64748b" fontSize={22} />
              {floorStructures.map((structure) => (
                <Circle key={structure.id} x={structure.x} y={structure.y} radius={state.selectedStructureId === structure.id ? 12 : 9} fill={state.selectedStructureId === structure.id ? '#3b82f6' : '#f59e0b'} stroke="#e2e8f0" strokeWidth={2} onClick={() => state.selectStructure(structure.id)} />
              ))}
              {floorStructures.map((structure) => (
                <Text key={`${structure.id}-label`} x={structure.x + 12} y={structure.y - 8} text={structure.name} fill="#e2e8f0" fontSize={14} />
              ))}
            </Layer>
          </Stage>
        </div>
      </main>

      <aside className="overflow-auto border-l border-slate-800 bg-slate-900 p-4">
        {!selectedStructure ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-400">Выбери конструкцию на схеме или в списке.</div>
        ) : (
          <div className="space-y-4">
            <section className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
              <div className="mb-3 text-sm font-semibold">Паспорт конструкции</div>
              <div className="grid gap-3">
                <input value={selectedStructure.name} onChange={(e) => void updateStructure({ name: e.target.value })} className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2" />
                <div className="grid grid-cols-2 gap-2">
                  <input value={selectedStructure.material} onChange={(e) => void updateStructure({ material: e.target.value })} placeholder="Материал" className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2" />
                  <input value={selectedStructure.dimensions ?? ''} onChange={(e) => void updateStructure({ dimensions: e.target.value })} placeholder="Размеры" className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input value={selectedStructure.axesX} onChange={(e) => void updateStructure({ axesX: e.target.value })} placeholder="Ось X" className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2" />
                  <input value={selectedStructure.axesY} onChange={(e) => void updateStructure({ axesY: e.target.value })} placeholder="Ось Y" className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2" />
                </div>
                <textarea value={selectedStructure.notes ?? ''} onChange={(e) => void updateStructure({ notes: e.target.value })} placeholder="Примечания" rows={3} className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2" />
                <div className="rounded-xl bg-slate-900 p-3 text-xs text-slate-400">{structureTypeLabels[selectedStructure.type]} {selectedStructure.name} расположена в осях {selectedStructure.axesX}-{selectedStructure.axesY} на отметке {selectedStructure.elevation}.</div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
              <div className="mb-3 flex items-center justify-between text-sm font-semibold">
                <span>Дефекты</span>
                <span className="text-xs text-slate-400">{visibleDefects.length}</span>
              </div>
              <div className="space-y-2">
                {visibleDefects.map((defect) => (
                  <button key={defect.id} onClick={() => state.selectDefect(defect.id)} className={cls('w-full rounded-xl border px-3 py-2 text-left', state.selectedDefectId === defect.id ? 'border-blue-500 bg-blue-500/10' : 'border-slate-800 bg-slate-900')}>
                    <div className="text-sm font-medium">{defect.type}</div>
                    <div className="text-xs text-slate-400">{severityLabels[defect.severity]}</div>
                  </button>
                ))}
              </div>
            </section>

            {selectedDefect && (
              <section className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                <div className="mb-3 text-sm font-semibold">Карточка дефекта</div>
                <div className="grid gap-3">
                  <input value={selectedDefect.type} onChange={(e) => void updateDefect({ type: e.target.value })} className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2" />
                  <select value={selectedDefect.severity} onChange={(e) => void updateDefect({ severity: e.target.value as Defect['severity'] })} className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2">
                    <option value="low">Низкая</option>
                    <option value="medium">Средняя</option>
                    <option value="high">Высокая</option>
                    <option value="critical">Критическая</option>
                  </select>
                  <textarea value={selectedDefect.description} onChange={(e) => void updateDefect({ description: e.target.value })} rows={4} className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2" />
                  <textarea value={selectedDefect.recommendation ?? ''} onChange={(e) => void updateDefect({ recommendation: e.target.value })} rows={3} placeholder="Рекомендации" className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2" />
                </div>
              </section>
            )}

            <section className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
              <div className="mb-3 flex items-center justify-between text-sm font-semibold">
                <span>Фотофиксация</span>
                <Download className="h-4 w-4 text-slate-400" />
              </div>
              <label className="mb-2 block cursor-pointer rounded-lg bg-blue-600 px-3 py-2 text-center text-sm"><Camera className="mr-2 inline h-4 w-4" />Добавить фото<input className="hidden" type="file" accept="image/*" capture="environment" multiple onChange={handlePhotos} /></label>
              <div className="space-y-2">
                {state.photos.filter((item) => item.structureId === selectedStructure.id).map((photo) => (
                  <div key={photo.id} className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-300">
                    <div>{photo.fileName}</div>
                    <div className="text-slate-500">{photo.defectId ? 'Привязано к дефекту' : 'Привязано к конструкции'}</div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </aside>
    </div>
  );
}
