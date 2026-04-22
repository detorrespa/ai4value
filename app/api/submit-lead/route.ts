import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

type LeadPayload = {
  profile: {
    name: string;
    email: string;
    company: string;
    role: string;
    sector: string;
    size: string;
  };
  scores: {
    estrategia: number;
    datos: number;
    personas: number;
    procesos: number;
    gobernanza: number;
    overall: number;
  };
  level: { code: string; name: string };
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as LeadPayload;

    if (!body.profile?.email || !body.profile?.company) {
      return NextResponse.json(
        { error: "Datos incompletos" },
        { status: 400 }
      );
    }

    const record = {
      ...body,
      createdAt: new Date().toISOString(),
      source: "ai4value-diagnostic",
    };

    const webhookUrl = process.env.LEAD_WEBHOOK_URL;
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(record),
        });
      } catch (err) {
        console.error("Webhook failed:", err);
      }
    }

    const resendKey = process.env.RESEND_API_KEY;
    const notifyEmail = process.env.LEAD_NOTIFICATION_EMAIL;
    const fromEmail = process.env.LEAD_FROM_EMAIL || "onboarding@resend.dev";

    if (resendKey) {
      const resend = new Resend(resendKey);

      try {
        await resend.emails.send({
          from: fromEmail,
          to: body.profile.email,
          subject: `Tu informe AI4Value personalizado · ${body.profile.company}`,
          html: buildUserEmail(body),
        });
      } catch (err) {
        console.error("User email failed:", err);
      }

      if (notifyEmail) {
        try {
          await resend.emails.send({
            from: fromEmail,
            to: notifyEmail,
            subject: `Nuevo lead AI4Value: ${body.profile.company} (${body.scores.overall}/100)`,
            html: buildAdminEmail(body),
          });
        } catch (err) {
          console.error("Admin notification failed:", err);
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Submit lead error:", err);
    return NextResponse.json(
      { error: "Error interno" },
      { status: 500 }
    );
  }
}

function buildUserEmail(lead: LeadPayload): string {
  const p = lead.profile;
  const s = lead.scores;
  const l = lead.level;
  return `
<!DOCTYPE html>
<html><body style="font-family: -apple-system, system-ui, sans-serif; color: #1a1a1a; max-width: 560px; margin: 0 auto; padding: 32px 24px;">
  <div style="color: #00a896; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 8px;">AI4Value · Nektiu</div>
  <h1 style="font-size: 28px; margin: 0 0 16px; color: #0a1228;">Hola ${p.name},</h1>
  <p style="font-size: 16px; line-height: 1.6; color: #444;">
    Gracias por completar el diagnóstico AI4Value para <strong>${p.company}</strong>.
    Tu puntuación global es <strong style="color: #00a896;">${s.overall}/100</strong>
    (nivel <strong>${l.code} ${l.name}</strong>).
  </p>
  <div style="background: #f5f5f5; border-radius: 12px; padding: 20px; margin: 24px 0;">
    <h2 style="font-size: 16px; margin: 0 0 12px;">Resumen por pilar</h2>
    <table style="width: 100%; font-size: 14px;">
      <tr><td style="padding: 4px 0;">Estrategia y liderazgo</td><td style="text-align: right; font-weight: 600;">${s.estrategia}/100</td></tr>
      <tr><td style="padding: 4px 0;">Datos y tecnología</td><td style="text-align: right; font-weight: 600;">${s.datos}/100</td></tr>
      <tr><td style="padding: 4px 0;">Personas y cultura</td><td style="text-align: right; font-weight: 600;">${s.personas}/100</td></tr>
      <tr><td style="padding: 4px 0;">Procesos y casos de uso</td><td style="text-align: right; font-weight: 600;">${s.procesos}/100</td></tr>
      <tr><td style="padding: 4px 0;">Gobernanza y ética</td><td style="text-align: right; font-weight: 600;">${s.gobernanza}/100</td></tr>
    </table>
  </div>
  <p style="font-size: 16px; line-height: 1.6; color: #444;">
    Adjunto encontrarás el <strong>informe detallado</strong> con tu plan de acción a 90 días,
    presupuesto estimado, KPIs y los pasos concretos para subir al siguiente nivel de madurez.
  </p>
  <p style="font-size: 16px; line-height: 1.6; color: #444; margin-top: 24px;">
    Si quieres profundizar en cómo aplicar este plan a tu empresa, responde a este email
    o agenda una sesión estratégica de 30 minutos conmigo.
  </p>
  <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e5e5; font-size: 13px; color: #888;">
    <strong>Alberto de Torres Pachón</strong><br>
    AI Strategy · Nektiu | Professor · ESIC | President I4.0 · AMETIC<br>
    <a href="mailto:alberto@nektiu.com" style="color: #00a896;">alberto@nektiu.com</a>
  </div>
</body></html>`;
}

function buildAdminEmail(lead: LeadPayload): string {
  const p = lead.profile;
  const s = lead.scores;
  return `
<!DOCTYPE html>
<html><body style="font-family: -apple-system, system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
  <h2>Nuevo lead cualificado · AI4Value</h2>
  <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
    <tr><td style="padding: 8px; background: #f5f5f5;"><strong>Empresa</strong></td><td style="padding: 8px;">${p.company}</td></tr>
    <tr><td style="padding: 8px;"><strong>Contacto</strong></td><td style="padding: 8px;">${p.name} (${p.role || "—"})</td></tr>
    <tr><td style="padding: 8px; background: #f5f5f5;"><strong>Email</strong></td><td style="padding: 8px;"><a href="mailto:${p.email}">${p.email}</a></td></tr>
    <tr><td style="padding: 8px;"><strong>Sector</strong></td><td style="padding: 8px;">${p.sector}</td></tr>
    <tr><td style="padding: 8px; background: #f5f5f5;"><strong>Tamaño</strong></td><td style="padding: 8px;">${p.size}</td></tr>
    <tr><td style="padding: 8px;"><strong>Puntuación global</strong></td><td style="padding: 8px;"><strong>${s.overall}/100 · ${lead.level.code} ${lead.level.name}</strong></td></tr>
  </table>
  <h3 style="margin-top: 24px;">Desglose por pilar</h3>
  <ul style="font-size: 14px;">
    <li>Estrategia: ${s.estrategia}</li>
    <li>Datos: ${s.datos}</li>
    <li>Personas: ${s.personas}</li>
    <li>Procesos: ${s.procesos}</li>
    <li>Gobernanza: ${s.gobernanza}</li>
  </ul>
</body></html>`;
}
