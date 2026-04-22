"use client";

import { useState, useMemo } from "react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, Legend, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Compass, Database, Users, Workflow, ShieldCheck,
  ChevronRight, ChevronLeft, ArrowRight, Sparkles, Lock,
  Clock, Target, Rocket, CheckCircle2, TrendingUp, TrendingDown, Minus,
  Mail, X, FileDown,
} from "lucide-react";

import { PILLARS, LIKERT_LABELS, emptyAnswers, type Answers, type PillarId } from "@/lib/pillars";
import { SECTORS, SIZES, MATURITY_LEVELS } from "@/lib/benchmarks";
import {
  computeScores, getSectorAverages, getLevel, getDeltaStatus,
  buildActionPlan, type Scores,
} from "@/lib/scoring";

const PILLAR_ICONS: Record<PillarId, any> = {
  estrategia: Compass,
  datos: Database,
  personas: Users,
  procesos: Workflow,
  gobernanza: ShieldCheck,
};

type Screen = "intro" | "questionnaire" | "preview" | "results";

type Profile = {
  name: string;
  email: string;
  company: string;
  role: string;
  sector: string;
  size: string;
  consent: boolean;
};

const emptyProfile = (): Profile => ({
  name: "", email: "", company: "", role: "",
  sector: "", size: "", consent: false,
});

export default function Home() {
  const [screen, setScreen] = useState<Screen>("intro");
  const [answers, setAnswers] = useState<Answers>(emptyAnswers());
  const [pillarIdx, setPillarIdx] = useState(0);
  const [scores, setScores] = useState<Scores | null>(null);
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [profile, setProfile] = useState<Profile>(emptyProfile());
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function startQuestionnaire() {
    setAnswers(emptyAnswers());
    setPillarIdx(0);
    setScreen("questionnaire");
  }

  function finishQuestionnaire() {
    const computed = computeScores(answers);
    setScores(computed);
    setScreen("preview");
  }

  async function submitLead() {
    if (!scores) return;
    const level = getLevel(scores.overall);
    setSubmitting(true);
    try {
      const res = await fetch("/api/submit-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: {
            name: profile.name,
            email: profile.email,
            company: profile.company,
            role: profile.role,
            sector: profile.sector,
            size: profile.size,
          },
          scores,
          level: { code: level.code, name: level.name },
        }),
      });
      if (res.ok) {
        setSubmitted(true);
        setTimeout(() => {
          setLeadModalOpen(false);
          setScreen("results");
        }, 1500);
      } else {
        alert("Error al enviar. Inténtalo de nuevo.");
      }
    } catch (err) {
      alert("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen">
      <TopNav />

      {screen === "intro" && <IntroScreen onStart={startQuestionnaire} />}

      {screen === "questionnaire" && (
        <QuestionnaireScreen
          answers={answers}
          setAnswers={setAnswers}
          pillarIdx={pillarIdx}
          setPillarIdx={setPillarIdx}
          onBack={() => setScreen("intro")}
          onFinish={finishQuestionnaire}
        />
      )}

      {screen === "preview" && scores && (
        <PreviewScreen
          scores={scores}
          onUnlock={() => setLeadModalOpen(true)}
        />
      )}

      {screen === "results" && scores && (
        <ResultsScreen
          scores={scores}
          profile={profile}
        />
      )}

      {leadModalOpen && (
        <LeadCaptureModal
          profile={profile}
          setProfile={setProfile}
          submitting={submitting}
          submitted={submitted}
          onClose={() => setLeadModalOpen(false)}
          onSubmit={submitLead}
        />
      )}

      <Footer />
    </main>
  );
}

function TopNav() {
  return (
    <nav className="border-b border-white/5">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <svg width="28" height="28" viewBox="0 0 32 32">
            <polygon points="16,3 28,12 23,27 9,27 4,12" fill="none" stroke="#00d9b2" strokeWidth="2" />
          </svg>
          <div>
            <div className="font-serif text-base font-semibold leading-none">
              Framework <span className="text-teal-500">AI4Value</span>
            </div>
            <div className="text-[10px] text-slate-400 tracking-widest uppercase mt-1">
              by Nektiu
            </div>
          </div>
        </div>
        <a
          href="mailto:alberto@nektiu.com"
          className="text-xs text-slate-400 hover:text-teal-500 transition-colors"
        >
          alberto@nektiu.com
        </a>
      </div>
    </nav>
  );
}

function IntroScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="max-w-5xl mx-auto px-6 py-20 animate-fade-in">
      <div className="inline-flex items-center gap-2 bg-teal-500/10 text-teal-500 px-3 py-1 rounded-full mb-8">
        <Sparkles size={12} />
        <span className="text-[11px] font-semibold tracking-wider uppercase">
          Diagnóstico · 7 minutos
        </span>
      </div>

      <h1 className="font-serif text-5xl md:text-6xl leading-[1.05] max-w-3xl mb-6">
        Descubre dónde está <em className="text-teal-500">realmente</em> tu empresa en el camino de la IA.
      </h1>

      <p className="text-slate-400 text-lg leading-relaxed max-w-2xl">
        35 preguntas sobre los 5 pilares de madurez IA. Verás tu pentágono AI4Value
        comparado con la media de tu sector y recibirás un informe personalizado
        con tu plan de acción a 90 días, presupuesto estimado y KPIs concretos.
      </p>

      <div className="mt-12 grid grid-cols-3 gap-8 max-w-2xl border-t border-white/5 pt-8">
        <div>
          <div className="font-serif text-4xl text-teal-500">5</div>
          <div className="text-[11px] text-slate-400 tracking-wider uppercase mt-1">Pilares evaluados</div>
        </div>
        <div>
          <div className="font-serif text-4xl text-teal-500">35</div>
          <div className="text-[11px] text-slate-400 tracking-wider uppercase mt-1">Preguntas calibradas</div>
        </div>
        <div>
          <div className="font-serif text-4xl text-teal-500">10</div>
          <div className="text-[11px] text-slate-400 tracking-wider uppercase mt-1">Sectores con benchmark</div>
        </div>
      </div>

      <button onClick={onStart} className="btn-primary mt-12 text-base">
        Empezar diagnóstico <ArrowRight size={18} />
      </button>

      <p className="text-xs text-slate-500 mt-4 flex items-center gap-1.5">
        <Lock size={11} /> Sin email para hacer el test. Solo para recibir el informe completo.
      </p>
    </div>
  );
}

function QuestionnaireScreen({
  answers, setAnswers, pillarIdx, setPillarIdx, onBack, onFinish,
}: {
  answers: Answers;
  setAnswers: (a: Answers) => void;
  pillarIdx: number;
  setPillarIdx: (i: number) => void;
  onBack: () => void;
  onFinish: () => void;
}) {
  const pillar = PILLARS[pillarIdx];
  const Icon = PILLAR_ICONS[pillar.id];
  const pillarAnswers = answers[pillar.id];
  const allAnswered = pillarAnswers.every(v => v >= 1);

  const totalQuestions = PILLARS.reduce((acc, p) => acc + p.questions.length, 0);
  const answeredCount = PILLARS.reduce((acc, p) =>
    acc + answers[p.id].filter(v => v >= 1).length, 0);
  const progress = Math.round((answeredCount / totalQuestions) * 100);

  function setAnswer(qi: number, v: number) {
    const next = { ...answers, [pillar.id]: [...pillarAnswers] };
    next[pillar.id][qi] = v;
    setAnswers(next);
  }

  function handleNext() {
    if (pillarIdx < PILLARS.length - 1) setPillarIdx(pillarIdx + 1);
    else onFinish();
  }

  function handlePrev() {
    if (pillarIdx === 0) onBack();
    else setPillarIdx(pillarIdx - 1);
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 animate-fade-in">
      <div className="mb-10">
        <div className="flex justify-between text-[11px] text-slate-400 uppercase tracking-wider mb-2">
          <span>Pilar {pillarIdx + 1} de {PILLARS.length}</span>
          <span>{progress}% completado</span>
        </div>
        <div className="h-[3px] bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-teal-500 transition-all duration-400"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div key={pillar.id} className="mb-10 flex gap-5 items-start animate-fade-in">
        <div className="w-14 h-14 rounded-2xl bg-teal-500/15 flex items-center justify-center flex-shrink-0">
          <Icon size={26} className="text-teal-500" />
        </div>
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-widest text-teal-500 mb-1.5">
            Pilar {pillarIdx + 1} · {pillar.short}
          </div>
          <h2 className="font-serif text-3xl mb-1.5">{pillar.name}</h2>
          <p className="text-slate-400 italic">{pillar.desc}</p>
        </div>
      </div>

      <div className="space-y-4">
        {pillar.questions.map((q, qi) => {
          const selected = pillarAnswers[qi];
          return (
            <div key={qi} className="card p-5">
              <div className="flex gap-3 mb-4 items-start">
                <span className="text-[11px] font-bold text-slate-500 mt-1 flex-shrink-0 tabular-nums">
                  {String(pillarIdx * 100 + qi + 1).padStart(2, "0")}
                </span>
                <span className="text-[15px] leading-relaxed">{q}</span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map(v => {
                  const isSelected = selected === v;
                  return (
                    <button
                      key={v}
                      onClick={() => setAnswer(qi, v)}
                      className={`p-3 rounded-lg border text-center transition-all flex flex-col items-center gap-1 ${
                        isSelected
                          ? "bg-teal-500 border-teal-500 text-navy-900 shadow-[0_0_0_4px_rgba(0,217,178,0.18)]"
                          : "bg-white/[0.02] border-white/8 text-slate-400 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <span className="text-lg font-semibold">{v}</span>
                      <span className={`text-[9px] leading-tight ${
                        isSelected ? "text-navy-900/70" : "text-slate-500"
                      }`}>
                        {LIKERT_LABELS[v - 1]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between mt-10 gap-4">
        <button onClick={handlePrev} className="btn-ghost">
          <ChevronLeft size={16} /> {pillarIdx === 0 ? "Volver" : "Pilar anterior"}
        </button>
        <button onClick={handleNext} disabled={!allAnswered} className="btn-primary">
          {pillarIdx === PILLARS.length - 1 ? "Ver resultados" : "Siguiente pilar"}
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

function PreviewScreen({
  scores, onUnlock,
}: {
  scores: Scores;
  onUnlock: () => void;
}) {
  const level = getLevel(scores.overall);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 animate-fade-in">
      <div className="text-center mb-10">
        <div className="text-[11px] font-semibold uppercase tracking-widest text-teal-500 mb-2">
          Diagnóstico completado
        </div>
        <h1 className="font-serif text-4xl md:text-5xl mb-4">
          Tu puntuación de madurez IA
        </h1>
      </div>

      <div className="card p-10 text-center mb-8">
        <div className="flex items-baseline justify-center gap-2 mb-4">
          <span className="font-serif text-7xl md:text-8xl text-teal-500 leading-none tabular-nums">
            {scores.overall}
          </span>
          <span className="text-2xl text-slate-400">/ 100</span>
        </div>
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border"
          style={{ borderColor: `${level.color}40` }}
        >
          <span className="w-2 h-2 rounded-full" style={{ background: level.color }} />
          <span className="text-sm font-bold tracking-wider" style={{ color: level.color }}>
            {level.code} · {level.name}
          </span>
        </div>
        <p className="text-slate-400 mt-4 max-w-md mx-auto text-sm leading-relaxed">
          {level.desc}
        </p>
      </div>

      <div className="relative">
        <div className="card p-8 space-y-4 backdrop-blur-sm">
          <h2 className="font-serif text-2xl text-center">
            Desbloquea tu informe personalizado
          </h2>
          <p className="text-slate-400 text-center max-w-xl mx-auto">
            A cambio de tus datos de contacto recibirás por email tu informe completo
            con el pentágono AI4Value, comparativa sectorial, plan de acción a 90 días,
            presupuesto estimado y KPIs operativos para subir de nivel.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 py-6">
            <PreviewFeature icon={Target} label="Pentágono vs sector" />
            <PreviewFeature icon={FileDown} label="Informe Word descargable" />
            <PreviewFeature icon={Clock} label="Plan 90 días" />
            <PreviewFeature icon={Rocket} label="KPIs operativos" />
          </div>

          <div className="text-center">
            <button onClick={onUnlock} className="btn-primary text-base">
              Desbloquear informe completo <ArrowRight size={18} />
            </button>
            <p className="text-xs text-slate-500 mt-3 flex items-center gap-1.5 justify-center">
              <Lock size={11} /> Solo necesitamos tus datos de contacto. Sin spam.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewFeature({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <div className="w-10 h-10 rounded-full bg-teal-500/10 flex items-center justify-center">
        <Icon size={18} className="text-teal-500" />
      </div>
      <span className="text-xs text-slate-400 leading-tight">{label}</span>
    </div>
  );
}

function LeadCaptureModal({
  profile, setProfile, submitting, submitted, onClose, onSubmit,
}: {
  profile: Profile;
  setProfile: (p: Profile) => void;
  submitting: boolean;
  submitted: boolean;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!profile.name.trim()) e.name = "Campo obligatorio";
    if (!profile.email.trim()) e.email = "Campo obligatorio";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) e.email = "Email no válido";
    if (!profile.company.trim()) e.company = "Campo obligatorio";
    if (!profile.sector) e.sector = "Selecciona un sector";
    if (!profile.size) e.size = "Selecciona un tamaño";
    if (!profile.consent) e.consent = "Necesario para enviarte el informe";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit() {
    if (validate()) onSubmit();
  }

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-navy-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
        <div className="card p-10 max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-teal-500/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="text-teal-500" />
          </div>
          <h2 className="font-serif text-2xl mb-2">¡Gracias, {profile.name.split(" ")[0]}!</h2>
          <p className="text-slate-400">
            Te hemos enviado el informe a <span className="text-white font-semibold">{profile.email}</span>.
            Cargando tus resultados…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-navy-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="card p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-white"
        >
          <X size={20} />
        </button>

        <div className="mb-6">
          <h2 className="font-serif text-2xl mb-1">Casi tenemos tu informe listo</h2>
          <p className="text-sm text-slate-400">
            Dinos a quién se lo enviamos y desbloqueamos todo el contenido.
          </p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nombre" required error={errors.name}>
              <input
                className="input"
                placeholder="Nombre y apellidos"
                value={profile.name}
                onChange={e => setProfile({ ...profile, name: e.target.value })}
              />
            </Field>
            <Field label="Rol">
              <input
                className="input"
                placeholder="Director General"
                value={profile.role}
                onChange={e => setProfile({ ...profile, role: e.target.value })}
              />
            </Field>
          </div>

          <Field label="Email profesional" required error={errors.email}>
            <input
              className="input"
              type="email"
              placeholder="tu@empresa.com"
              value={profile.email}
              onChange={e => setProfile({ ...profile, email: e.target.value })}
            />
          </Field>

          <Field label="Empresa" required error={errors.company}>
            <input
              className="input"
              placeholder="Nombre de la empresa"
              value={profile.company}
              onChange={e => setProfile({ ...profile, company: e.target.value })}
            />
          </Field>

          <Field label="Sector" required error={errors.sector}>
            <select
              className="input"
              value={profile.sector}
              onChange={e => setProfile({ ...profile, sector: e.target.value })}
            >
              <option value="">— Selecciona —</option>
              {SECTORS.map(s => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </Field>

          <Field label="Tamaño de la empresa" required error={errors.size}>
            <div className="grid grid-cols-2 gap-2">
              {SIZES.map(s => {
                const sel = profile.size === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setProfile({ ...profile, size: s.id })}
                    className={`text-left px-3 py-2.5 rounded-lg border transition-all ${
                      sel
                        ? "bg-teal-500/10 border-teal-500 text-teal-400"
                        : "border-white/8 hover:border-white/20"
                    }`}
                  >
                    <div className="text-sm font-semibold">{s.label}</div>
                    <div className={`text-[11px] mt-0.5 ${
                      sel ? "text-teal-400/70" : "text-slate-500"
                    }`}>{s.detail}</div>
                  </button>
                );
              })}
            </div>
          </Field>

          <label className="flex gap-2 items-start cursor-pointer pt-2">
            <input
              type="checkbox"
              checked={profile.consent}
              onChange={e => setProfile({ ...profile, consent: e.target.checked })}
              className="mt-1 accent-teal-500"
            />
            <span className="text-xs text-slate-400 leading-relaxed">
              Acepto recibir el informe por email y futuras comunicaciones de Nektiu sobre IA y
              transformación digital. Puedo darme de baja en cualquier momento.
            </span>
          </label>
          {errors.consent && (
            <p className="text-xs text-coral-500">{errors.consent}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="btn-primary w-full justify-center mt-4"
          >
            {submitting ? "Enviando…" : (
              <>Enviar y ver mi informe <Mail size={16} /></>
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        .input {
          width: 100%;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          color: #f5f7fa;
          padding: 10px 12px;
          border-radius: 8px;
          font-size: 14px;
          font-family: inherit;
          outline: none;
          transition: all 150ms;
        }
        .input:focus {
          border-color: #00d9b2;
          background: rgba(0, 217, 178, 0.05);
        }
      `}</style>
    </div>
  );
}

function Field({
  label, required, error, children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
        {label}{required && <span className="text-coral-500">*</span>}
      </label>
      {children}
      {error && <p className="text-[11px] text-coral-500 mt-1">{error}</p>}
    </div>
  );
}

function ResultsScreen({
  scores, profile,
}: {
  scores: Scores;
  profile: Profile;
}) {
  const level = getLevel(scores.overall);
  const sectorLabel = SECTORS.find(s => s.id === profile.sector)?.label || "Otros";
  const sizeLabel = SIZES.find(s => s.id === profile.size)?.label || "";

  const sectorAvgs = useMemo(() => getSectorAverages(profile.sector), [profile.sector]);

  const radarData = PILLARS.map(p => ({
    pillar: p.short,
    "Tu empresa": scores[p.id],
    "Media sector": sectorAvgs[p.id],
    fullMark: 100,
  }));

  const plan = useMemo(() => buildActionPlan(scores), [scores]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 animate-fade-in">
      <div className="mb-8">
        <div className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-2">
          Diagnóstico AI4Value · {sectorLabel} · {sizeLabel}
        </div>
        <h1 className="font-serif text-4xl md:text-5xl">
          Así está hoy <em className="text-teal-500">{profile.company}</em>
        </h1>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <div className="card p-8">
          <div className="text-[11px] uppercase tracking-widest text-slate-400 mb-3">
            Madurez IA global
          </div>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="font-serif text-7xl text-teal-500 leading-none tabular-nums">
              {scores.overall}
            </span>
            <span className="text-xl text-slate-400">/ 100</span>
          </div>
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border"
            style={{ borderColor: `${level.color}40` }}
          >
            <span className="w-2 h-2 rounded-full" style={{ background: level.color }} />
            <span className="text-xs font-bold tracking-wider" style={{ color: level.color }}>
              {level.code} · {level.name}
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-4 leading-relaxed">{level.desc}</p>
        </div>

        <div className="card p-4">
          <div className="text-[11px] uppercase tracking-widest text-slate-400 mb-2 px-2">
            Pentágono AI4Value · tú vs media sector
          </div>
          <ResponsiveContainer width="100%" height={340}>
            <RadarChart data={radarData} margin={{ top: 20, right: 40, bottom: 10, left: 40 }}>
              <PolarGrid stroke="rgba(255,255,255,0.12)" />
              <PolarAngleAxis
                dataKey="pillar"
                tick={{ fill: "#f5f7fa", fontSize: 12, fontWeight: 600 }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={{ fill: "#64748b", fontSize: 10 }}
                stroke="rgba(255,255,255,0.08)"
              />
              <Radar
                name="Tu empresa"
                dataKey="Tu empresa"
                stroke="#00d9b2"
                fill="#00d9b2"
                fillOpacity={0.35}
                strokeWidth={2.5}
              />
              <Radar
                name="Media sector"
                dataKey="Media sector"
                stroke="#f5b700"
                fill="#f5b700"
                fillOpacity={0.15}
                strokeWidth={2}
                strokeDasharray="4 4"
              />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
              <Tooltip contentStyle={{
                background: "#141f3e",
                border: "1px solid rgba(255,255,255,0.14)",
                borderRadius: 8,
                fontSize: 13,
              }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mb-10">
        <div className="text-[11px] uppercase tracking-widest text-slate-400 mb-3">
          Análisis por pilar
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {PILLARS.map(p => {
            const Icon = PILLAR_ICONS[p.id];
            const score = scores[p.id];
            const avg = sectorAvgs[p.id];
            const status = getDeltaStatus(score, avg);
            const delta = score - avg;
            const statusData = {
              above: { c: "#00d9b2", label: "Por encima", icon: TrendingUp },
              below: { c: "#ff6b6b", label: "Por debajo", icon: TrendingDown },
              inline: { c: "#f5b700", label: "En la media", icon: Minus },
            }[status];
            const StatusIcon = statusData.icon;
            return (
              <div key={p.id} className="card p-4">
                <Icon size={16} className="text-slate-400" />
                <div className="text-xs font-semibold mt-2">{p.short}</div>
                <div className="font-serif text-3xl mt-1 tabular-nums leading-none">
                  {score}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">sector: {avg}</div>
                <div className="relative h-1 bg-white/5 rounded-full mt-3 overflow-hidden">
                  <div
                    className="absolute top-[-2px] w-[1.5px] h-[8px] bg-gold-500"
                    style={{ left: `${avg}%` }}
                  />
                  <div
                    className="h-full bg-teal-500 rounded-full"
                    style={{ width: `${score}%` }}
                  />
                </div>
                <div
                  className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold"
                  style={{ color: statusData.c }}
                >
                  <StatusIcon size={11} />
                  <span>{delta > 0 ? "+" : ""}{delta}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mb-10">
        <h2 className="font-serif text-2xl mb-1">Tu plan de acción, priorizado</h2>
        <p className="text-sm text-slate-400 mb-6">
          Cada acción está enfocada al pilar donde más necesitas moverte, ordenado por horizonte.
        </p>

        <div className="grid md:grid-cols-3 gap-4">
          <ActionColumn
            icon={Clock}
            color="#ff6b6b"
            horizon="CORTO PLAZO"
            subtitle="30 días · quick wins"
            actions={plan.short}
          />
          <ActionColumn
            icon={Target}
            color="#f5b700"
            horizon="MEDIO PLAZO"
            subtitle="3 – 6 meses · estructura"
            actions={plan.medium}
          />
          <ActionColumn
            icon={Rocket}
            color="#00d9b2"
            horizon="LARGO PLAZO"
            subtitle="6 – 18 meses · transformación"
            actions={plan.long}
          />
        </div>
      </div>

      <div className="card p-8 flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-br from-teal-500/10 to-gold-500/5">
        <div>
          <h2 className="font-serif text-xl mb-1">¿Quieres pasar del diagnóstico al resultado?</h2>
          <p className="text-sm text-slate-400">
            En Nektiu ayudamos a PYMEs a subir 2 niveles de madurez en 6 meses, con KPIs de negocio.
          </p>
        </div>
        <a
          href={`mailto:alberto@nektiu.com?subject=Sesión estratégica AI4Value - ${encodeURIComponent(profile.company)}`}
          className="btn-primary flex-shrink-0"
        >
          <Mail size={16} /> Reservar sesión estratégica
        </a>
      </div>
    </div>
  );
}

function ActionColumn({
  icon: Icon, color, horizon, subtitle, actions,
}: {
  icon: any;
  color: string;
  horizon: string;
  subtitle: string;
  actions: Array<{ pillar: string; text: string }>;
}) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-2.5 mb-1">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: `${color}26` }}
        >
          <Icon size={15} style={{ color }} />
        </div>
        <div>
          <div
            className="text-[10px] font-bold tracking-widest"
            style={{ color }}
          >
            {horizon}
          </div>
          <div className="text-[11px] text-slate-400">{subtitle}</div>
        </div>
      </div>
      <div className="mt-4 space-y-3">
        {actions.map((a, i) => (
          <div key={i} className="flex gap-2 items-start">
            <span
              className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
              style={{ background: color }}
            />
            <div className="text-[13px] leading-relaxed">
              <span
                className="text-[9px] font-bold tracking-wider uppercase mr-1.5"
                style={{ color }}
              >
                {a.pillar}
              </span>
              <span className="text-slate-400">{a.text}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="mt-20 py-8 border-t border-white/5 text-center">
      <p className="text-xs text-slate-400">
        Framework AI4Value · <span className="text-teal-500">Nektiu</span> · Alberto de Torres Pachón
      </p>
      <p className="text-[10px] text-slate-500 mt-2 inline-flex items-center gap-1.5">
        <Lock size={10} /> Tus datos son privados y solo se usan para enviarte el informe.
      </p>
    </footer>
  );
}
