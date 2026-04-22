import type { PillarId } from "./pillars";

export type Sector = {
  id: string;
  label: string;
};

export const SECTORS: Sector[] = [
  { id: "tecnologia", label: "Tecnología y software" },
  { id: "industria", label: "Industria y manufactura" },
  { id: "distribucion", label: "Distribución y retail" },
  { id: "servicios", label: "Servicios profesionales" },
  { id: "salud", label: "Salud y bienestar" },
  { id: "hosteleria", label: "Hostelería y turismo" },
  { id: "construccion", label: "Construcción e inmobiliario" },
  { id: "alimentacion", label: "Alimentación y bebidas" },
  { id: "educacion", label: "Educación y formación" },
  { id: "otros", label: "Otros" },
];

export const SIZES = [
  { id: "micro", label: "Microempresa", detail: "Menos de 10 empleados" },
  { id: "pequena", label: "Pequeña", detail: "10 a 49 empleados" },
  { id: "mediana", label: "Mediana", detail: "50 a 249 empleados" },
  { id: "grande", label: "Grande", detail: "250 o más empleados" },
];

export const SECTOR_BENCHMARKS: Record<string, Record<PillarId, number>> = {
  tecnologia:   { estrategia: 72, datos: 78, personas: 68, procesos: 65, gobernanza: 60 },
  industria:    { estrategia: 52, datos: 58, personas: 42, procesos: 48, gobernanza: 52 },
  distribucion: { estrategia: 48, datos: 52, personas: 42, procesos: 45, gobernanza: 45 },
  servicios:    { estrategia: 55, datos: 48, personas: 52, procesos: 42, gobernanza: 52 },
  salud:        { estrategia: 42, datos: 48, personas: 38, procesos: 40, gobernanza: 65 },
  hosteleria:   { estrategia: 35, datos: 38, personas: 42, procesos: 35, gobernanza: 38 },
  construccion: { estrategia: 32, datos: 35, personas: 30, procesos: 35, gobernanza: 38 },
  alimentacion: { estrategia: 42, datos: 48, personas: 38, procesos: 50, gobernanza: 52 },
  educacion:    { estrategia: 42, datos: 40, personas: 48, procesos: 38, gobernanza: 45 },
  otros:        { estrategia: 45, datos: 45, personas: 42, procesos: 42, gobernanza: 45 },
};

export type Level = {
  min: number;
  max: number;
  code: string;
  name: string;
  desc: string;
  color: string;
};

export const MATURITY_LEVELS: Level[] = [
  { min: 0,  max: 30,  code: "L1", name: "Exploradora",    color: "#ff6b6b",
    desc: "Uso individual y sin estrategia. ChatGPT en pestañas del navegador." },
  { min: 30, max: 55,  code: "L2", name: "Adoptadora",     color: "#f5b700",
    desc: "Licencias corporativas, casos de uso aislados. Sin integración." },
  { min: 55, max: 75,  code: "L3", name: "Integradora",    color: "#00d9b2",
    desc: "IA conectada a datos y procesos. Primeros agentes, KPIs medibles." },
  { min: 75, max: 101, code: "L4", name: "Transformadora", color: "#c084fc",
    desc: "IA en el centro del modelo de negocio. Ventaja competitiva defendible." },
];
