import { db } from './database';
import { createId, nowIso } from '../shared/lib';

const defectSeeds = [
  ['crack_rc', 'Трещина', 'железобетон'],
  ['chip_rc', 'Скол', 'железобетон'],
  ['rebar_exposure', 'Оголение арматуры', 'железобетон'],
  ['rebar_corrosion', 'Коррозия арматуры', 'железобетон'],
  ['concrete_failure', 'Разрушение бетона', 'железобетон'],
  ['metal_corrosion', 'Коррозия', 'металл'],
  ['section_loss', 'Потеря сечения', 'металл'],
  ['deformation', 'Деформация', 'металл'],
  ['metal_crack', 'Трещина', 'металл'],
  ['masonry_crack', 'Трещина', 'камень'],
  ['weathering', 'Выветривание', 'камень'],
  ['masonry_failure', 'Разрушение кладки', 'камень'],
  ['mortar_loss', 'Выпадение раствора', 'камень']
] as const;

const structureSeeds = [
  ['column', 'Колонна'],
  ['beam', 'Балка'],
  ['truss', 'Ферма'],
  ['crane_beam', 'Подкрановая балка'],
  ['roof_slab', 'Плита покрытия'],
  ['floor_slab', 'Плита перекрытия'],
  ['wall', 'Стена'],
  ['foundation', 'Фундамент'],
  ['brace', 'Связь'],
  ['stair', 'Лестница'],
  ['roof', 'Кровля'],
  ['fence', 'Ограждение'],
  ['other', 'Другое']
] as const;

export async function seedDictionaries() {
  const count = await db.dictionaries.count();
  if (count > 0) return;

  const createdAt = nowIso();

  await db.dictionaries.bulkAdd([
    ...structureSeeds.map(([key, label]) => ({
      id: createId(),
      category: 'structureType' as const,
      key,
      label,
      createdAt
    })),
    ...defectSeeds.map(([key, label, material]) => ({
      id: createId(),
      category: 'defectType' as const,
      key,
      label,
      material,
      createdAt
    }))
  ]);
}
