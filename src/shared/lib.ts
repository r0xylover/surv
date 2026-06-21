export const createId = () => crypto.randomUUID();
export const nowIso = () => new Date().toISOString();

export const structureTypeLabels: Record<string, string> = {
  column: 'Колонна',
  beam: 'Балка',
  truss: 'Ферма',
  crane_beam: 'Подкрановая балка',
  roof_slab: 'Плита покрытия',
  floor_slab: 'Плита перекрытия',
  wall: 'Стена',
  foundation: 'Фундамент',
  brace: 'Связь',
  stair: 'Лестница',
  roof: 'Кровля',
  fence: 'Ограждение',
  other: 'Другое'
};

export const severityLabels: Record<string, string> = {
  low: 'Низкая',
  medium: 'Средняя',
  high: 'Высокая',
  critical: 'Критическая'
};
