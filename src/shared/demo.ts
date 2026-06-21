import type { Building, Defect, Floor, Project, Structure } from './types';
import { createId, nowIso } from './lib';

export function createDemoData() {
  const createdAt = nowIso();
  const projectId = createId();
  const buildingId = createId();
  const floorId = createId();
  const structureId = createId();
  const defectId = createId();

  const project: Project = {
    id: projectId,
    name: 'Завод ЖБИ',
    customer: 'Техническая дирекция',
    description: 'Демо-проект обследования',
    createdAt,
    updatedAt: createdAt
  };

  const building: Building = {
    id: buildingId,
    projectId,
    name: 'Главный производственный корпус',
    temperatureBlock: 'Блок 1',
    section: 'Участок А',
    createdAt,
    updatedAt: createdAt
  };

  const floor: Floor = {
    id: floorId,
    buildingId,
    name: 'Отм. +0.000',
    elevation: '+0.000',
    createdAt,
    updatedAt: createdAt
  };

  const structure: Structure = {
    id: structureId,
    projectId,
    buildingId,
    floorId,
    name: 'Колонна К-12',
    type: 'column',
    material: 'железобетон',
    elevation: '+0.000',
    axesX: '5',
    axesY: 'Б',
    span: '2',
    temperatureBlock: 'Блок 1',
    section: 'Главный участок',
    dimensions: '400×400 мм',
    notes: 'Повторное обследование через 6 месяцев',
    x: 480,
    y: 320,
    createdAt,
    updatedAt: createdAt,
    lastInspectionAt: createdAt
  };

  const defect: Defect = {
    id: defectId,
    structureId,
    type: 'Трещина',
    description: 'Вертикальная трещина раскрытием 1,5 мм, длиной 1,2 м.',
    severity: 'high',
    recommendation: 'Установить контрольные маяки и выполнить инструментальный мониторинг.',
    author: 'Инженер обследования',
    voiceText: 'Колонна К-12. Вертикальная трещина раскрытием 1,5 миллиметра. Длина 1,2 метра.',
    x: 486,
    y: 332,
    createdAt,
    updatedAt: createdAt
  };

  return { project, building, floor, structure, defect };
}
