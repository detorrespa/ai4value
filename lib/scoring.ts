import { PILLARS, type Answers, type PillarId } from "./pillars";
import { SECTOR_BENCHMARKS, MATURITY_LEVELS, type Level } from "./benchmarks";

export type Scores = Record<PillarId | "overall", number>;

export function computeScores(answers: Answers): Scores {
  const result: Record<string, number> = {};
  let total = 0;
  for (const p of PILLARS) {
    const arr = answers[p.id];
    const answered = arr.filter(v => v >= 1);
    const avg = answered.length > 0
      ? answered.reduce((a, b) => a + b, 0) / answered.length
      : 0;
    const score = Math.round(((avg - 1) / 4) * 100);
    result[p.id] = Math.max(0, score);
    total += result[p.id];
  }
  result.overall = Math.round(total / PILLARS.length);
  return result as Scores;
}

export function getSectorAverages(sector: string): Record<PillarId, number> {
  return SECTOR_BENCHMARKS[sector] || SECTOR_BENCHMARKS.otros;
}

export function getLevel(score: number): Level {
  return MATURITY_LEVELS.find(l => score >= l.min && score < l.max) || MATURITY_LEVELS[0];
}

export type DeltaStatus = "above" | "below" | "inline";

export function getDeltaStatus(score: number, avg: number): DeltaStatus {
  const delta = score - avg;
  if (delta >= 10) return "above";
  if (delta <= -10) return "below";
  return "inline";
}

export const ACTION_LIBRARY: Record<PillarId, { short: string[]; medium: string[]; long: string[] }> = {
  estrategia: {
    short: [
      "Workshop de 1 día con dirección: definir visión IA + 3 casos prioritarios.",
      "Nombrar un sponsor ejecutivo con mandato claro y presupuesto inicial asignado.",
      "Añadir un punto fijo 'Estado IA' al comité de dirección mensual.",
    ],
    medium: [
      "Documentar estrategia IA formal con roadmap 12 meses y KPIs financieros.",
      "Asignar presupuesto específico IA (mínimo 2-3% facturación en PYMEs).",
      "Crear un comité IA con representación de cada área clave del negocio.",
    ],
    long: [
      "Integrar la estrategia IA en el plan estratégico a 3 años de la empresa.",
      "Revisar el modelo de negocio: ¿dónde crea la IA ventaja competitiva defendible?",
      "Establecer partnerships estratégicos (consultoras, tecnológicos, universidades).",
    ],
  },
  datos: {
    short: [
      "Mapear las 10 fuentes de datos críticas y puntuar su calidad de 1 a 5.",
      "Identificar los 3 silos que más duelen y diseñar plan para unificarlos.",
      "Auditoría de seguridad y control de acceso a datos sensibles de cliente.",
    ],
    medium: [
      "Desplegar un data warehouse o data lake ligero (Snowflake, BigQuery, Fabric).",
      "Integrar CRM-ERP-canales con middleware (Make, n8n, Zapier, API propia).",
      "Limpieza y estandarización de datos de cliente: single source of truth.",
    ],
    long: [
      "Migrar a arquitectura cloud-first con data lakehouse y capa semántica.",
      "Implementar MLOps para gestionar modelos en producción con trazabilidad.",
      "Construir ontologías y taxonomías propias del negocio como activo diferencial.",
    ],
  },
  personas: {
    short: [
      "Identificar 1 embajador IA por cada área y darle 2h/semana para experimentar.",
      "Formación express de 4h en IA generativa para todo el equipo (obligatoria).",
      "Crear un canal Slack/Teams para compartir casos de uso y prompts que funcionan.",
    ],
    medium: [
      "Programa formativo IA por niveles: básico / intermedio / avanzado por rol.",
      "Instituir 'Viernes IA': 2h mensuales para que el equipo explore nuevos casos.",
      "Sistema de reconocimiento: premiar mejoras de proceso impulsadas con IA.",
    ],
    long: [
      "Rediseñar perfiles de puesto incorporando skills IA como competencia crítica.",
      "Crear un Centro de Excelencia IA interno con dedicación completa.",
      "Academia IA propia con certificaciones reconocidas por el sector.",
    ],
  },
  procesos: {
    short: [
      "Aplicar matriz Impacto × Esfuerzo a los próximos 10 casos candidatos.",
      "Escoger 1 piloto de 30-60 días con un KPI financiero claro y medible.",
      "Establecer el 'board de pilotos': nombre, owner, KPI, estado, fecha.",
    ],
    medium: [
      "Construir pipeline de 5-8 casos de uso con business case formal documentado.",
      "Implementar 2-3 agentes IA en procesos comerciales u operativos core.",
      "Gate financiero obligatorio: ningún piloto pasa a producción sin ROI medido.",
    ],
    long: [
      "Automatizar procesos end-to-end con agentes IA coordinados entre sí.",
      "Incorporar IA predictiva en la toma de decisiones estratégicas.",
      "Desarrollar nuevos productos o servicios potenciados por IA (nuevas líneas).",
    ],
  },
  gobernanza: {
    short: [
      "Publicar política mínima de uso responsable de IA (1 página, 2 semanas).",
      "Prohibir expresamente subida de datos sensibles a IAs públicas (ChatGPT free).",
      "Nombrar responsable de IA y datos (puede coincidir con el DPO).",
    ],
    medium: [
      "Implementar registro de modelos y de decisiones automatizadas.",
      "Cumplimiento AI Act: clasificar el riesgo de cada caso de uso en producción.",
      "Contratar licencias corporativas con cláusulas de no-entrenamiento con tu dato.",
    ],
    long: [
      "Sistema de auditoría continua y explicabilidad de modelos críticos.",
      "Certificación en normas de gestión de IA (ISO/IEC 42001).",
      "Marco ético propio publicable para clientes, proveedores y stakeholders.",
    ],
  },
};

export type ActionItem = {
  pillar: string;
  pillarId: PillarId;
  score: number;
  text: string;
};

export type ActionPlan = {
  short: ActionItem[];
  medium: ActionItem[];
  long: ActionItem[];
};

export function buildActionPlan(scores: Scores): ActionPlan {
  const ranked = PILLARS.map(p => ({
    ...p,
    score: scores[p.id]
  })).sort((a, b) => a.score - b.score);

  const short: ActionItem[] = ranked.slice(0, 2).flatMap(p =>
    ACTION_LIBRARY[p.id].short.slice(0, 2).map(text => ({
      pillar: p.short, pillarId: p.id, score: p.score, text
    }))
  );

  const medium: ActionItem[] = ranked.map(p => ({
    pillar: p.short,
    pillarId: p.id,
    score: p.score,
    text: ACTION_LIBRARY[p.id].medium[0],
  }));

  const long: ActionItem[] = ranked.slice(0, 3).map(p => ({
    pillar: p.short,
    pillarId: p.id,
    score: p.score,
    text: ACTION_LIBRARY[p.id].long[0],
  }));

  return { short, medium, long };
}
