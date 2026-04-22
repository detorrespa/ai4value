export type Pillar = {
  id: PillarId;
  short: string;
  name: string;
  desc: string;
  questions: string[];
};

export type PillarId =
  | "estrategia"
  | "datos"
  | "personas"
  | "procesos"
  | "gobernanza";

export const PILLARS: Pillar[] = [
  {
    id: "estrategia",
    short: "Estrategia",
    name: "Estrategia y liderazgo",
    desc: "¿La IA está en la agenda de dirección o en el cajón?",
    questions: [
      "La dirección tiene una visión IA documentada y ambiciosa a 12-24 meses.",
      "Existe un sponsor ejecutivo con mandato formal y presupuesto asignado a IA.",
      "Los KPIs de IA están conectados a objetivos de negocio y al P&L de la empresa.",
      "La IA se discute regularmente en los comités de dirección (al menos mensual).",
      "Existe un roadmap IA formal con hitos, fechas y responsables identificados.",
      "La inversión anual en IA supera el 2% de la facturación de la empresa.",
      "La estrategia IA se revisa y actualiza al menos una vez al año con métricas objetivas.",
    ],
  },
  {
    id: "datos",
    short: "Datos",
    name: "Datos y tecnología",
    desc: "¿Tus datos son un activo o un problema oculto?",
    questions: [
      "Los datos de cliente, venta y operaciones están centralizados y son accesibles.",
      "La arquitectura tecnológica (cloud, APIs) está preparada para integrar IA.",
      "Los sistemas clave (CRM, ERP, canales) están integrados entre sí.",
      "Existe una única fuente de verdad para los datos críticos del negocio.",
      "La calidad de los datos se mide y monitoriza de forma continua.",
      "Tenemos herramientas de analítica avanzada o BI en uso regular por el equipo.",
      "Podemos acceder a los datos de cliente y venta clave en menos de un día hábil.",
    ],
  },
  {
    id: "personas",
    short: "Personas",
    name: "Personas y cultura",
    desc: "¿Tu equipo empuja la IA o la IA empuja a tu equipo?",
    questions: [
      "Existe un programa continuo de formación en IA para el equipo (no puntual).",
      "Más del 30% del equipo utiliza IA en su trabajo diario de forma productiva.",
      "La cultura valora la experimentación y el aprendizaje rápido con nuevas herramientas.",
      "Hay embajadores IA o referentes internos en las áreas clave del negocio.",
      "Los casos de éxito con IA se comunican y celebran internamente.",
      "El equipo no tiene miedo a ser reemplazado por IA, lo ve como palanca personal.",
      "Los procesos de contratación incorporan ya skills de IA como competencia valorada.",
    ],
  },
  {
    id: "procesos",
    short: "Procesos",
    name: "Procesos y casos de uso",
    desc: "¿Eliges casos por moda o por valor cuantificable?",
    questions: [
      "Tenemos un portfolio de casos de uso priorizados por impacto y esfuerzo.",
      "Al menos un caso de uso de IA está en producción con ROI medido y documentado.",
      "Cada caso de uso tiene KPIs claros, owner asignado y sistema de medición.",
      "Los pilotos que funcionan se escalan a producción con un proceso definido.",
      "Existen mecanismos para capturar feedback de los usuarios de las herramientas IA.",
      "Se comparten aprendizajes entre pilotos (lo que funcionó y lo que no).",
      "La IA ya está integrada en al menos uno de los procesos core del negocio.",
    ],
  },
  {
    id: "gobernanza",
    short: "Gobernanza",
    name: "Gobernanza y ética",
    desc: "¿Estás construyendo sobre terreno firme o sobre arena?",
    questions: [
      "Tenemos una política de uso responsable de IA publicada internamente y firmada.",
      "Cumplimos con RGPD, AI Act y requisitos sectoriales aplicables a IA.",
      "Existen controles de acceso y trazabilidad a los datos que usan los modelos IA.",
      "Hay un responsable formal de IA y datos (puede coincidir con el DPO).",
      "Los empleados saben qué tipos de datos NO pueden subir a IAs públicas.",
      "Las licencias corporativas de IA tienen cláusulas de no-training con nuestros datos.",
      "Los modelos en producción están documentados en un registro accesible y auditable.",
    ],
  },
];

export const LIKERT_LABELS = [
  "Totalmente en desacuerdo",
  "En desacuerdo",
  "Parcialmente",
  "De acuerdo",
  "Totalmente de acuerdo",
];

export type Answers = Record<PillarId, number[]>;

export function emptyAnswers(): Answers {
  return PILLARS.reduce((acc, p) => {
    acc[p.id] = new Array(p.questions.length).fill(0);
    return acc;
  }, {} as Answers);
}
