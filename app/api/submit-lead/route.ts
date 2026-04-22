import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { put } from "@vercel/blob";
import { generatePersonalizedReport } from "@/lib/generateReport";
import { SECTORS, SIZES } from "@/lib/benchmarks";
import { computeScores, getLevel } from "@/lib/scoring";
import type { Answers } from "@/lib/pillars";

export const maxDuration = 60;

type SubmitPayload = {
  profile: {
    name: string;
    email: string;
    company: string;
    role: string;
    sector: string;
    size: string;
  };
  answers: Answers;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SubmitPayload;

    if (!body.profile?.email || !body.profile?.company) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    const { profile, answers } = body;
    const scores = computeScores(answers);
    const level = getLevel(scores.overall);

    const sectorLabel = SECTORS.find(s => s.id === profile.sector)?.label || profile.sector;
    const sizeLabel = SIZES.find(s => s.id === profile.size)?.label || profile.size;

    // 1. Generate personalized Word document
    let reportBuffer: Buffer;
    try {
      reportBuffer = await generatePersonalizedReport(profile, scores, answers);
    } catch (err) {
      console.error("Error generating report:", err);
      return NextResponse.json({ error: "Error generando el informe" }, { status: 500 });
    }

    // 2. Upload to Vercel Blob (optional - only if configured)
    let reportUrl = "";
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const safeCompany = profile.company.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 40);
        const filename = `informes/AI4Value_${safeCompany}_${timestamp}.docx`;
        const blob = await put(filename, reportBuffer, {
          access: "public",
          contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        });
        reportUrl = blob.url;
      } catch (err) {
        console.error("Blob upload failed:", err);
      }
    }

    // 3. Build payload for webhook (Google Sheet via Make)
    const webhookPayload = {
      timestamp: new Date().toISOString(),
      profile: {
        ...profile,
        sectorLabel,
        sizeLabel,
      },
      scores: {
        overall: scores.overall,
        estrategia: scores.estrategia,
        datos: scores.datos,
        personas: scores.personas,
        procesos: scores.procesos,
        gobernanza: scores.gobernanza,
      },
      level: { code: level.code, name: level.name },
      answers: {
        estrategia: answers.estrategia.join(","),
        datos: answers.datos.join(","),
        personas: answers.personas.join(","),
        procesos: answers.procesos.join(","),
        gobernanza: answers.gobernanza.join(","),
      },
      reportUrl,
      source: "ai4value-diagnostic",
    };

    // 4. Send to webhook (Google Sheets via Make / n8n / Zapier)
    const webhookUrl = process.env.LEAD_WEBHOOK_URL;
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(webhookPayload),
        });
      } catch (err) {
        console.error("Webhook failed:", err);
      }
    }

    // 5. Send emails
    const resendKey = process.env.RESEND_API_KEY;
    const notifyEmail = process.env.LEAD_NOTIFICATION_EMAIL;
    const fromEmail = process.env.LEAD_FROM_EMAIL || "onboarding@resend.dev";

    if (resendKey) {
      const resend = new Resend(resendKey);
      const safeCompany = profile.company.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 40);
      const filename = `Informe_AI4Value_${safeCompany}.docx`;

      // Email to lead - with personalized Word attached
      try {
        await resend.emails.send({
          from: fromEmail,
          to: profile.email,
          subject: `Tu informe AI4Value personalizado · ${profile.company}`,
          html: buildUserEmail(profile, scores, level),
          attachments: [{
            filename,
            content: reportBuffer,
          }],
        });
      } catch (err) {
        console.error("User email failed:", err);
      }

      // Notification to admin
      if (notifyEmail) {
        try {
          await resend.emails.send({
            from: fromEmail,
            to: notifyEmail,
            subject: `Nuevo lead AI4Value: ${profile.company} (${scores.overall}/100 · ${level.code})`,
            html: buildAdminEmail(profile, scores, level, reportUrl, sectorLabel, sizeLabel),
            attachments: [{
              filename,
              content: reportBuffer,
            }],
          });
        } catch (err) {
          console.error("Admin notification failed:", err);
        }
      }
    }

    return NextResponse.json({
      ok: true,
      scores,
      level: { code: level.code, name: level.name },
    });
  } catch (err) {
    console.error("Submit lead error:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

function buildUserEmail(profile: any, scores: any, level: any): string {
  return `
<!DOCTYPE html>
<html><body style="font-family: -apple-system, system-ui, sans-serif; color: #1a1a1a; max-width: 560px; margin: 0 auto; padding: 32px 24px;">
  <div style="color: #00a896; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 8px;">AI4Value · Nektiu</div>
  <h1 style="font-size: 28px; margin: 0 0 16px; color: #0a1228;">Hola ${profile.name.split(" ")[0]},</h1>
  <p style="font-size: 16px; line-height: 1.6; color: #444;">
    Gracias por completar el diagnóstico AI4Value para <strong>${profile.company}</strong>.
    Adjunto a este email encontrarás tu <strong>informe personalizado</strong> en formato Word,
    con el análisis detallado de cada pilar, tu comparativa sectorial y tu plan de acción a 90 días.
  </p>
  <div style="background: #f5f5f5; border-radius: 12px; padding: 20px; margin: 24px 0;">
    <div style="font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px;">Tu puntuación</div>
    <div style="font-size: 36px; font-weight: 600; color: #00a896; line-height: 1;">${scores.overall}<span style="font-size: 18px; color: #888;">/100</span></div>
    <div style="font-size: 14px; font-weight: 600; color: #0F6E56; margin-top: 4px;">${level.code} · ${level.name}</div>
    <table style="width: 100%; font-size: 14px; margin-top: 16px;">
      <tr><td style="padding: 4px 0; color: #555;">Estrategia y liderazgo</td><td style="text-align: right; font-weight: 600;">${scores.estrategia}/100</td></tr>
      <tr><td style="padding: 4px 0; color: #555;">Datos y tecnología</td><td style="text-align: right; font-weight: 600;">${scores.datos}/100</td></tr>
      <tr><td style="padding: 4px 0; color: #555;">Personas y cultura</td><td style="text-align: right; font-weight: 600;">${scores.personas}/100</td></tr>
      <tr><td style="padding: 4px 0; color: #555;">Procesos y casos de uso</td><td style="text-align: right; font-weight: 600;">${scores.procesos}/100</td></tr>
      <tr><td style="padding: 4px 0; color: #555;">Gobernanza y ética</td><td style="text-align: right; font-weight: 600;">${scores.gobernanza}/100</td></tr>
    </table>
  </div>
  <p style="font-size: 16px; line-height: 1.6; color: #444;">
    Si quieres profundizar en cómo aplicar este plan a tu empresa concreta, te invito
    a una <strong>sesión estratégica de 45 minutos</strong> sin compromiso. Responde a este email
    y buscamos hueco.
  </p>
  <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e5e5; font-size: 13px; color: #888;">
    <strong style="color: #1a1a1a;">Alberto de Torres Pachón</strong><br>
    AI Strategy · Nektiu | Professor · ESIC | President I4.0 · AMETIC<br>
    <a href="mailto:alberto@nektiu.com" style="color: #00a896;">alberto@nektiu.com</a>
  </div>
</body></html>`;
}

function buildAdminEmail(
  profile: any, scores: any, level: any,
  reportUrl: string, sectorLabel: string, sizeLabel: string
): string {
  return `
<!DOCTYPE html>
<html><body style="font-family: -apple-system, system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
  <h2 style="color: #0a1228; margin-top: 0;">Nuevo lead cualificado</h2>
  <p style="color: #555; font-size: 14px;">Adjunto encontrarás el informe personalizado generado para este lead (idéntico al que él recibe).</p>

  <div style="background: #f5f5f5; padding: 16px 20px; border-radius: 8px; margin: 20px 0;">
    <div style="font-size: 20px; font-weight: 600; color: #0a1228;">${profile.company}</div>
    <div style="font-size: 13px; color: #666; margin-top: 4px;">${sectorLabel} · ${sizeLabel}</div>
    <div style="margin-top: 12px; font-size: 28px; font-weight: 700; color: #00a896;">
      ${scores.overall}<span style="font-size: 16px; color: #666;">/100</span>
      <span style="font-size: 14px; font-weight: 600; color: #0F6E56; margin-left: 8px;">${level.code} · ${level.name}</span>
    </div>
  </div>

  <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
    <tr><td style="padding: 8px; background: #f5f5f5; width: 120px;"><strong>Contacto</strong></td><td style="padding: 8px;">${profile.name}${profile.role ? ` (${profile.role})` : ""}</td></tr>
    <tr><td style="padding: 8px;"><strong>Email</strong></td><td style="padding: 8px;"><a href="mailto:${profile.email}" style="color: #00a896;">${profile.email}</a></td></tr>
  </table>

  <h3 style="margin-top: 24px; color: #0a1228;">Puntuaciones por pilar</h3>
  <table style="width: 100%; font-size: 14px;">
    <tr><td style="padding: 4px 0;">Estrategia</td><td style="text-align: right; font-weight: 600;">${scores.estrategia}</td></tr>
    <tr><td style="padding: 4px 0;">Datos</td><td style="text-align: right; font-weight: 600;">${scores.datos}</td></tr>
    <tr><td style="padding: 4px 0;">Personas</td><td style="text-align: right; font-weight: 600;">${scores.personas}</td></tr>
    <tr><td style="padding: 4px 0;">Procesos</td><td style="text-align: right; font-weight: 600;">${scores.procesos}</td></tr>
    <tr><td style="padding: 4px 0;">Gobernanza</td><td style="text-align: right; font-weight: 600;">${scores.gobernanza}</td></tr>
  </table>

  ${reportUrl ? `
  <div style="margin-top: 24px; padding: 16px; background: #E1F5EE; border-radius: 8px;">
    <div style="font-size: 12px; color: #0F6E56; margin-bottom: 4px;">Informe permanente:</div>
    <a href="${reportUrl}" style="color: #00a896; word-break: break-all;">${reportUrl}</a>
  </div>
  ` : ""}

  <div style="margin-top: 24px;">
    <a href="mailto:${profile.email}?subject=Tu%20informe%20AI4Value%20%C2%B7%20${encodeURIComponent(profile.company)}"
       style="background: #00a896; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
       Contactar ahora →
    </a>
  </div>
</body></html>`;
}
