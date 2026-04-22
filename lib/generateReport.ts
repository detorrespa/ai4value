import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat, HeadingLevel,
  BorderStyle, WidthType, ShadingType, VerticalAlign, PageNumber,
  PageBreak,
} from "docx";
import { PILLARS, LIKERT_LABELS, type Answers, type PillarId } from "./pillars";
import { SECTORS, SIZES } from "./benchmarks";
import {
  computeScores, getSectorAverages, getLevel, buildActionPlan, getDeltaStatus,
  type Scores,
} from "./scoring";

const C = {
  navy: "0B1437",
  teal: "00A896",
  tealDark: "0F6E56",
  gold: "BA7517",
  coral: "D85A30",
  gray: "5F5E5A",
  grayLight: "D3D1C7",
  grayBg: "F1EFE8",
  text: "1A1A1A",
  textMuted: "555555",
};

const BORDER = { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" };
const BORDERS = { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER };

const PAGE_WIDTH = 12240;
const PAGE_HEIGHT = 15840;
const MARGIN = 1080;

export type LeadProfile = {
  name: string;
  email: string;
  company: string;
  role: string;
  sector: string;
  size: string;
};

function p(text: string, opts: any = {}) {
  return new Paragraph({
    spacing: { before: opts.before || 0, after: opts.after || 120, line: 300 },
    alignment: opts.align || AlignmentType.LEFT,
    children: [new TextRun({
      text,
      font: "Arial",
      size: opts.size || 22,
      bold: opts.bold || false,
      italics: opts.italic || false,
      color: opts.color || C.text,
    })],
  });
}

function pRuns(runs: any[], opts: any = {}) {
  return new Paragraph({
    spacing: { before: opts.before || 0, after: opts.after || 120, line: 300 },
    alignment: opts.align || AlignmentType.LEFT,
    children: runs.map(r => new TextRun({
      text: r.text,
      font: "Arial",
      size: r.size || 22,
      bold: r.bold || false,
      italics: r.italic || false,
      color: r.color || C.text,
    })),
  });
}

function h1(text: string) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 200 },
    children: [new TextRun({ text, font: "Arial", size: 32, bold: true, color: C.navy })],
  });
}

function h2(text: string) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 140 },
    children: [new TextRun({ text, font: "Arial", size: 26, bold: true, color: C.navy })],
  });
}

function h3(text: string, color = C.tealDark) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 220, after: 100 },
    children: [new TextRun({ text, font: "Arial", size: 22, bold: true, color })],
  });
}

function kicker(text: string, color = C.teal) {
  return new Paragraph({
    spacing: { before: 120, after: 60 },
    children: [new TextRun({
      text: text.toUpperCase(),
      font: "Arial",
      size: 16,
      bold: true,
      color,
      characterSpacing: 40,
    })],
  });
}

function bullet(text: string) {
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    spacing: { before: 40, after: 40, line: 280 },
    children: [new TextRun({
      text,
      font: "Arial",
      size: 22,
      color: C.text,
    })],
  });
}

function cell(content: any, opts: any = {}) {
  const children = Array.isArray(content)
    ? content
    : [new Paragraph({
        spacing: { before: 40, after: 40, line: 260 },
        alignment: opts.align || AlignmentType.LEFT,
        children: [new TextRun({
          text: content || "",
          font: "Arial",
          size: opts.size || 20,
          bold: opts.bold || false,
          color: opts.color || C.text,
        })],
      })];
  return new TableCell({
    borders: BORDERS,
    width: { size: opts.width, type: WidthType.DXA },
    shading: opts.fill ? { fill: opts.fill, type: ShadingType.CLEAR } : undefined,
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 100, bottom: 100, left: 140, right: 140 },
    children,
  });
}

function headerRow(cols: string[], widths: number[]) {
  return new TableRow({
    tableHeader: true,
    children: cols.map((c, i) => cell(c, {
      width: widths[i], bold: true, fill: C.navy, color: "FFFFFF", size: 20,
    })),
  });
}

function dataRow(cols: string[], widths: number[], zebra = false) {
  return new TableRow({
    children: cols.map((c, i) => cell(c, {
      width: widths[i], fill: zebra ? C.grayBg : undefined,
    })),
  });
}

function simpleTable(headers: string[], rows: string[][], colWidths: number[]) {
  const total = colWidths.reduce((a, b) => a + b, 0);
  return new Table({
    width: { size: total, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [
      headerRow(headers, colWidths),
      ...rows.map((r, i) => dataRow(r, colWidths, i % 2 === 1)),
    ],
  });
}

function spacer(h = 160) {
  return new Paragraph({ spacing: { before: 0, after: h }, children: [] });
}

function hr() {
  return new Paragraph({
    spacing: { before: 200, after: 200 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: C.grayLight, space: 1 } },
    children: [],
  });
}

function cover(profile: LeadProfile, scores: Scores) {
  const sectorLabel = SECTORS.find(s => s.id === profile.sector)?.label || "Otros";
  const sizeLabel = SIZES.find(s => s.id === profile.size)?.label || "";
  const level = getLevel(scores.overall);

  return [
    new Paragraph({ spacing: { before: 2400, after: 240 }, children: [
      new TextRun({
        text: "DIAGNÓSTICO AI4VALUE · NEKTIU",
        font: "Arial", size: 18, bold: true, color: C.teal, characterSpacing: 80,
      }),
    ]}),
    new Paragraph({ spacing: { before: 0, after: 120 }, children: [
      new TextRun({ text: "Informe personalizado", font: "Arial", size: 48, bold: true, color: C.navy }),
    ]}),
    new Paragraph({ spacing: { before: 0, after: 200 }, children: [
      new TextRun({ text: `Madurez IA de ${profile.company}`, font: "Arial", size: 32, color: C.navy }),
    ]}),
    new Paragraph({
      spacing: { before: 200, after: 200 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: C.teal, space: 1 } },
      children: [],
    }),
    new Paragraph({ spacing: { before: 120, after: 120 }, children: [
      new TextRun({ text: "Empresa:  ", font: "Arial", size: 22, color: C.textMuted }),
      new TextRun({ text: profile.company, font: "Arial", size: 22, bold: true }),
    ]}),
    new Paragraph({ spacing: { before: 80, after: 120 }, children: [
      new TextRun({ text: "Contacto:  ", font: "Arial", size: 22, color: C.textMuted }),
      new TextRun({
        text: `${profile.name}${profile.role ? ` · ${profile.role}` : ""}`,
        font: "Arial", size: 22, bold: true,
      }),
    ]}),
    new Paragraph({ spacing: { before: 80, after: 120 }, children: [
      new TextRun({ text: "Sector:  ", font: "Arial", size: 22, color: C.textMuted }),
      new TextRun({ text: sectorLabel, font: "Arial", size: 22, bold: true }),
    ]}),
    new Paragraph({ spacing: { before: 80, after: 120 }, children: [
      new TextRun({ text: "Tamaño:  ", font: "Arial", size: 22, color: C.textMuted }),
      new TextRun({ text: sizeLabel, font: "Arial", size: 22, bold: true }),
    ]}),
    new Paragraph({ spacing: { before: 80, after: 120 }, children: [
      new TextRun({ text: "Puntuación global:  ", font: "Arial", size: 22, color: C.textMuted }),
      new TextRun({
        text: `${scores.overall} / 100 · ${level.code} ${level.name}`,
        font: "Arial", size: 22, bold: true, color: level.code === "L1" ? C.coral : level.code === "L2" ? C.gold : C.tealDark,
      }),
    ]}),
    new Paragraph({ spacing: { before: 80, after: 120 }, children: [
      new TextRun({ text: "Fecha:  ", font: "Arial", size: 22, color: C.textMuted }),
      new TextRun({
        text: new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }),
        font: "Arial", size: 22, bold: true,
      }),
    ]}),
    spacer(1200),
    new Paragraph({ spacing: { before: 200, after: 80 }, children: [
      new TextRun({ text: "Preparado por", font: "Arial", size: 16, color: C.textMuted, characterSpacing: 40 }),
    ]}),
    new Paragraph({ spacing: { before: 0, after: 60 }, children: [
      new TextRun({ text: "Alberto de Torres Pachón", font: "Arial", size: 22, bold: true }),
    ]}),
    new Paragraph({ spacing: { before: 0, after: 60 }, children: [
      new TextRun({
        text: "AI Strategy · Nektiu  |  Professor · ESIC Business School  |  President I4.0 · AMETIC",
        font: "Arial", size: 18, color: C.textMuted,
      }),
    ]}),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

function executiveSummary(profile: LeadProfile, scores: Scores) {
  const level = getLevel(scores.overall);
  const sectorAvgs = getSectorAverages(profile.sector);
  const sectorAvgOverall = Math.round(
    PILLARS.reduce((a, pl) => a + sectorAvgs[pl.id], 0) / PILLARS.length
  );
  const delta = scores.overall - sectorAvgOverall;
  const deltaText = delta > 0
    ? `${delta} puntos por encima`
    : delta < 0
      ? `${Math.abs(delta)} puntos por debajo`
      : "en línea";

  const ranked = PILLARS
    .map(pl => ({ ...pl, score: scores[pl.id], avg: sectorAvgs[pl.id] }))
    .sort((a, b) => a.score - b.score);
  const weakest = ranked.slice(0, 2);
  const strongest = ranked.slice(-1)[0];

  const sectorLabel = SECTORS.find(s => s.id === profile.sector)?.label || "su sector";

  return [
    kicker("Resumen ejecutivo"),
    h1("La foto de tu madurez IA hoy"),
    p(`${profile.company} tiene una puntuación global de ${scores.overall}/100, lo que la sitúa en el nivel ${level.code} ${level.name}: ${level.desc.toLowerCase()}`),
    spacer(80),
    p(`Frente a la media del ${sectorLabel} (${sectorAvgOverall}/100), la empresa está ${deltaText}. El pilar más fuerte es ${strongest.short.toLowerCase()} con ${strongest.score}/100, y los dos que más frenan el avance son ${weakest[0].short.toLowerCase()} (${weakest[0].score}) y ${weakest[1].short.toLowerCase()} (${weakest[1].score}).`),

    spacer(120),
    h3("Lo que significa en términos prácticos"),
    p(level.code === "L1"
      ? "Estás en fase de exploración: el equipo usa IA de forma puntual pero sin estrategia. El riesgo inmediato es invertir tiempo y dinero en iniciativas desconectadas que no muevan la aguja. El salto más rentable ahora es definir prioridades y crear una base mínima antes de escalar."
      : level.code === "L2"
        ? "Estás adoptando IA pero de forma fragmentada: licencias corporativas activas, casos de uso sueltos, pero sin integración con los sistemas ni con el negocio. El siguiente salto (a L3 Integradora) requiere elegir 2-3 casos con ROI cuantificable y construirlos end-to-end."
        : level.code === "L3"
          ? "Estás en el punto donde la IA empieza a generar valor medible. Los siguientes 90 días deben consolidar esa ventaja: más casos en producción, mejor integración, y cultura que empuja el cambio sin fricciones."
          : "Tu empresa ya ha integrado IA en su modelo de negocio. El foco pasa de construir a defender ventaja: automatizar la propia mejora continua y convertirse en referente del sector."),

    spacer(200),
    h3("Las 3 decisiones clave que este informe te ayuda a tomar"),
    bullet(`En qué pilar concreto invertir primero los próximos 30 días (pista: ${weakest[0].short.toLowerCase()}).`),
    bullet("Qué casos de uso priorizar y cuáles rechazar, con criterios objetivos de impacto × esfuerzo."),
    bullet(`Qué objetivo realista te puedes marcar a 90 días partiendo desde ${scores.overall}/100.`),

    new Paragraph({ children: [new PageBreak()] }),
  ];
}

function scoresBreakdown(profile: LeadProfile, scores: Scores) {
  const sectorAvgs = getSectorAverages(profile.sector);
  const sectorLabel = SECTORS.find(s => s.id === profile.sector)?.label || "otros";

  return [
    kicker("Análisis por pilar"),
    h1("Tu pentágono AI4Value, pilar a pilar"),
    p(`Cada pilar se ha evaluado con 7 preguntas calibradas. La puntuación va de 0 a 100 y te permite comparar tu posición con la media de ${sectorLabel} basada en estudios sectoriales de 2024-2025.`),

    spacer(120),
    simpleTable(
      ["Pilar", "Tu empresa", `Media ${sectorLabel}`, "Delta", "Diagnóstico"],
      PILLARS.map(pl => {
        const score = scores[pl.id];
        const avg = sectorAvgs[pl.id];
        const delta = score - avg;
        const status = getDeltaStatus(score, avg);
        const statusText = status === "above"
          ? `+${delta} (por encima)`
          : status === "below"
            ? `${delta} (por debajo)`
            : `${delta >= 0 ? "+" : ""}${delta} (en la media)`;
        return [
          pl.short,
          `${score}/100`,
          `${avg}/100`,
          statusText,
          pl.desc,
        ];
      }),
      [1400, 1400, 1400, 2000, 3880]
    ),

    spacer(240),
    h3("Cómo leer esta tabla"),
    p("Una diferencia de +10 puntos o más respecto a la media indica una ventaja real en ese pilar. Una diferencia de -10 puntos o más es un área donde tu empresa está rezagada y donde hay riesgo competitivo. Entre -10 y +10 la posición es inline con el sector: ni ventaja ni desventaja."),
    p("El objetivo no es estar por encima en todos los pilares: es tener una base suficiente en todos (ningún pilar por debajo de 45) y al menos dos pilares donde se genere ventaja defendible (por encima de 65).", { italic: true, color: C.textMuted }),

    new Paragraph({ children: [new PageBreak()] }),
  ];
}

function deepDive(profile: LeadProfile, scores: Scores) {
  const sectorAvgs = getSectorAverages(profile.sector);
  const ranked = PILLARS
    .map(pl => ({ ...pl, score: scores[pl.id], avg: sectorAvgs[pl.id] }))
    .sort((a, b) => a.score - b.score);
  const focus = ranked.slice(0, 3);

  const children: any[] = [
    kicker("Zoom en los 3 pilares críticos"),
    h1("Dónde hay más oportunidad de mejora"),
    p("Los siguientes 3 pilares son los que más limitan la puntuación global de tu empresa. Atacarlos en orden de mayor a menor impacto es la ruta más corta para subir de nivel."),
    spacer(120),
  ];

  focus.forEach((pl, idx) => {
    const delta = pl.score - pl.avg;
    const status = delta >= 10 ? "por encima de" : delta <= -10 ? "por debajo de" : "en línea con";
    const gap = 100 - pl.score;

    children.push(
      h2(`${idx + 1}. ${pl.name}`),
      pRuns([
        { text: "Puntuación actual: ", color: C.textMuted },
        { text: `${pl.score}/100`, bold: true, color: C.coral },
        { text: "  ·  Media sector: ", color: C.textMuted },
        { text: `${pl.avg}/100`, bold: true },
        { text: `  ·  Estás ${status} la media`, color: C.textMuted },
      ]),
      p(`Este pilar cubre: ${pl.desc}`, { italic: true, color: C.textMuted }),
      spacer(80),
      p(`Diagnóstico: el margen de mejora inmediato es de ${gap} puntos. Las palancas que más mueven este pilar en una empresa como la tuya son:`),
    );

    if (pl.id === "estrategia") {
      children.push(
        bullet("Cerrar una visión IA documentada a 12-24 meses con sponsor ejecutivo asignado."),
        bullet("Incorporar un punto fijo de IA en los comités de dirección mensuales."),
        bullet("Cuantificar el impacto esperado en el P&L de cada caso de uso antes de arrancarlo."),
      );
    } else if (pl.id === "datos") {
      children.push(
        bullet("Mapear y auditar las fuentes de datos críticas de venta, cliente y operaciones."),
        bullet("Integrar CRM y ERP (o sistemas equivalentes) con middleware ligero (Make, n8n)."),
        bullet("Establecer single source of truth para los 3-5 datos que más se usan cada día."),
      );
    } else if (pl.id === "personas") {
      children.push(
        bullet("Formación obligatoria de 4h en IA generativa para el 100% del equipo."),
        bullet("Identificar 1-2 embajadores IA por área con 2h semanales protegidas para experimentar."),
        bullet("Celebrar internamente los primeros casos de éxito para bajar miedos y crear cultura."),
      );
    } else if (pl.id === "procesos") {
      children.push(
        bullet("Matriz Impacto × Esfuerzo para priorizar casos. Rechazar los que no batan un umbral."),
        bullet("Un primer piloto de 30-60 días con KPI financiero claro y medible antes de arrancar."),
        bullet("Board de pilotos visible: nombre, owner, KPI, estado, fecha. Gate antes de producción."),
      );
    } else if (pl.id === "gobernanza") {
      children.push(
        bullet("Política de uso responsable de IA en una página, firmada por todo el equipo."),
        bullet("Clasificación AI Act de los casos en producción. Identificar si alguno es alto riesgo."),
        bullet("Licencias corporativas con cláusula de no-training con los datos de la empresa."),
      );
    }

    children.push(spacer(200));
  });

  children.push(new Paragraph({ children: [new PageBreak()] }));
  return children;
}

function actionPlan(scores: Scores) {
  const plan = buildActionPlan(scores);

  return [
    kicker("Plan de acción"),
    h1("Qué hacer en los próximos 90 días, 6 meses y 18 meses"),
    p("Este plan está priorizado a partir de tu diagnóstico: las acciones a corto plazo atacan los pilares con peor puntuación para generar quick wins, las de medio plazo construyen estructura en todos los pilares, y las de largo plazo consolidan ventaja competitiva."),

    spacer(200),
    h2("Corto plazo · 30 días · quick wins"),
    p("Acciones ejecutables con poco recurso y alto impacto sobre los pilares más débiles. El objetivo es ganar momentum y demostrar valor en el primer mes.", { italic: true, color: C.textMuted }),
    spacer(80),
    ...plan.short.flatMap(a => [
      pRuns([
        { text: `[${a.pillar.toUpperCase()}]  `, bold: true, color: C.coral, size: 20 },
        { text: a.text, size: 22 },
      ]),
    ]),

    spacer(240),
    h2("Medio plazo · 3 a 6 meses · estructura"),
    p("Una acción estructural por cada pilar. Estas acciones consolidan la base necesaria para escalar y evitan que el avance sea puntual.", { italic: true, color: C.textMuted }),
    spacer(80),
    ...plan.medium.flatMap(a => [
      pRuns([
        { text: `[${a.pillar.toUpperCase()}]  `, bold: true, color: C.gold, size: 20 },
        { text: a.text, size: 22 },
      ]),
    ]),

    spacer(240),
    h2("Largo plazo · 6 a 18 meses · transformación"),
    p("Inversiones que convierten la madurez IA en ventaja competitiva defendible. Son las que marcan la diferencia entre una empresa que usa IA y una que ha rediseñado su negocio con IA.", { italic: true, color: C.textMuted }),
    spacer(80),
    ...plan.long.flatMap(a => [
      pRuns([
        { text: `[${a.pillar.toUpperCase()}]  `, bold: true, color: C.tealDark, size: 20 },
        { text: a.text, size: 22 },
      ]),
    ]),

    new Paragraph({ children: [new PageBreak()] }),
  ];
}

function budget(scores: Scores, profile: LeadProfile) {
  const level = getLevel(scores.overall);
  const isMicro = profile.size === "micro";
  const isSmall = profile.size === "pequena";

  const external = isMicro ? "12.000 – 18.000 €" : isSmall ? "25.000 – 40.000 €" : "50.000 – 90.000 €";
  const internal = isMicro ? "~29.000 €" : isSmall ? "~65.000 €" : "~120.000 €";
  const totalRange = isMicro ? "40.000 – 50.000 €" : isSmall ? "90.000 – 105.000 €" : "170.000 – 210.000 €";
  const roiTarget = isMicro ? "60.000 €" : isSmall ? "140.000 €" : "280.000 €";

  return [
    kicker("Inversión"),
    h1("Cuánto cuesta subir al siguiente nivel"),
    p(`Basándonos en el tamaño de ${profile.company} y su posición actual (${level.code} ${level.name}), estos son los rangos orientativos de inversión para un plan de 90 días enfocado en el salto al siguiente nivel de madurez.`),

    spacer(160),
    simpleTable(
      ["Partida", "Importe (orientativo)", "Notas"],
      [
        ["Inversión externa (cash-out)", external, "Licencias IA + consultoría + desarrollo piloto"],
        ["Coste interno del equipo", internal, "Tiempo del equipo dedicado al plan (no cash)"],
        ["Inversión total decisora", totalRange, "A defender ante el comité"],
      ],
      [3600, 2800, 3680]
    ),

    spacer(200),
    h3("ROI objetivo para justificar la inversión"),
    p(`Para que esta inversión tenga sentido, los pilotos deberían generar o ahorrar al menos ${roiTarget} anualizados. Este es el umbral que debes exigir en el business case de cada caso de uso antes de aprobarlo.`),
    p("Casos típicos que alcanzan estos números en PYMEs: cualificación automática de leads (10-15% más conversiones), agentes IA en atención al cliente (reducción 40-60% en tiempo de respuesta), automatización de tareas administrativas (10-20 horas/semana liberadas por empleado afectado).", { italic: true, color: C.textMuted }),

    new Paragraph({ children: [new PageBreak()] }),
  ];
}

function nextSteps(profile: LeadProfile) {
  return [
    kicker("Siguiente paso"),
    h1("Cómo aprovechar este informe"),
    p("Este informe te da el diagnóstico y la dirección. La siguiente pregunta es: ¿cómo lo ejecutas en tu realidad concreta, con tu equipo, tus recursos y tus plazos?"),

    spacer(140),
    h3("Opción 1 · Ejecución interna"),
    p("Comparte este informe con tu equipo directivo. Usa el plan de 90 días como base para una primera sesión de trabajo. Identifica al AI Lead interno que va a liderar el plan y dale el mandato formal."),

    spacer(160),
    h3("Opción 2 · Sesión estratégica con Nektiu"),
    p(`Si quieres acelerar el arranque, reservamos una sesión estratégica de 45 minutos sin compromiso. En esa sesión revisamos tu informe pilar por pilar, te damos recomendaciones específicas para ${profile.company}, y te presentamos cómo acompañamos a PYMEs como la tuya a subir 2 niveles de madurez en 6 meses.`),

    spacer(240),
    hr(),
    p("Para reservar la sesión o resolver dudas sobre el informe:", { italic: true, color: C.textMuted }),
    spacer(80),
    pRuns([
      { text: "Alberto de Torres Pachón  ·  ", bold: true },
      { text: "alberto@nektiu.com", color: C.teal },
    ]),
    spacer(60),
    p("Nektiu · nektiu.com", { size: 20, color: C.textMuted }),
  ];
}

export async function generatePersonalizedReport(
  profile: LeadProfile,
  scores: Scores,
  _answers: Answers
): Promise<Buffer> {
  const doc = new Document({
    creator: "Alberto de Torres Pachón · Nektiu",
    title: `Informe AI4Value · ${profile.company}`,
    description: `Diagnóstico personalizado de madurez IA para ${profile.company}`,
    styles: {
      default: { document: { run: { font: "Arial", size: 22 } } },
      paragraphStyles: [
        {
          id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 32, bold: true, font: "Arial", color: C.navy },
          paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 },
        },
        {
          id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 26, bold: true, font: "Arial", color: C.navy },
          paragraph: { spacing: { before: 280, after: 140 }, outlineLevel: 1 },
        },
        {
          id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 22, bold: true, font: "Arial", color: C.tealDark },
          paragraph: { spacing: { before: 220, after: 100 }, outlineLevel: 2 },
        },
      ],
    },
    numbering: {
      config: [{
        reference: "bullets",
        levels: [{
          level: 0,
          format: LevelFormat.BULLET,
          text: "•",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        }],
      }],
    },
    sections: [{
      properties: {
        page: {
          size: { width: PAGE_WIDTH, height: PAGE_HEIGHT },
          margin: { top: MARGIN, right: MARGIN, bottom: MARGIN, left: MARGIN },
        },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              spacing: { after: 0 },
              children: [
                new TextRun({
                  text: `AI4VALUE · ${profile.company.toUpperCase()} · NEKTIU`,
                  font: "Arial", size: 14, color: C.textMuted, characterSpacing: 40,
                }),
              ],
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: 80 },
              children: [
                new TextRun({ text: "Página ", font: "Arial", size: 14, color: C.textMuted }),
                new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 14, color: C.textMuted }),
                new TextRun({ text: " de ", font: "Arial", size: 14, color: C.textMuted }),
                new TextRun({ children: [PageNumber.TOTAL_PAGES], font: "Arial", size: 14, color: C.textMuted }),
              ],
            }),
          ],
        }),
      },
      children: [
        ...cover(profile, scores),
        ...executiveSummary(profile, scores),
        ...scoresBreakdown(profile, scores),
        ...deepDive(profile, scores),
        ...actionPlan(scores),
        ...budget(scores, profile),
        ...nextSteps(profile),
      ],
    }],
  });

  return await Packer.toBuffer(doc);
}
