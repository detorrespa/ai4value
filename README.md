# AI4Value · Test de Madurez IA para PYMEs

Lead magnet interactivo para captar contactos cualificados con un diagnóstico de madurez en IA. El usuario responde 35 preguntas (7 por cada uno de los 5 pilares), ve su pentágono comparado con la media del sector y recibe un informe personalizado por email a cambio de dejar sus datos.

## Stack

- **Next.js 14** (App Router) — el framework de Vercel, sin configuración
- **React 18** — componentes de UI
- **Recharts** — radar chart nativo y editable
- **Tailwind CSS** — estilos
- **Resend** (opcional) — envío del email con el informe
- **Vercel Postgres** (opcional) — almacenamiento de leads

## Opciones de captura de leads

El proyecto soporta tres modos, se configura con variables de entorno:

1. **Webhook a Make / n8n / Zapier** — el más flexible. Envía el lead a tu automatización y tú decides qué hacer (guardar en Airtable, añadir a HubSpot, disparar email personalizado, etc.)
2. **Resend + email directo** — envía un email al usuario con un enlace al informe y a ti una copia con los datos del lead
3. **Solo localStorage** — sin backend, para una demo rápida. No recomendado para producción.

## Despliegue en Vercel · 3 pasos

### 1. Clonar e instalar

```bash
npm install
```

### 2. Configurar variables de entorno

Crea un archivo `.env.local` con (elige las que uses):

```env
# Opción A: Webhook (recomendado)
LEAD_WEBHOOK_URL=https://hook.eu2.make.com/XXXXXX

# Opción B: Resend para emails
RESEND_API_KEY=re_XXXXXXXX
LEAD_NOTIFICATION_EMAIL=alberto@nektiu.com
LEAD_FROM_EMAIL=diagnostico@nektiu.com

# Público (se verá en el cliente)
NEXT_PUBLIC_COMPANY_NAME=Nektiu
NEXT_PUBLIC_CONTACT_EMAIL=alberto@nektiu.com
```

### 3. Desplegar

```bash
npx vercel
```

O vía GitHub: sube el repo a GitHub, conecta Vercel al repo y se despliega automáticamente en cada push.

Una vez en producción obtienes una URL como `ai4value-nektiu.vercel.app`. Para usar tu dominio (`ai4value.nektiu.com`), configura el DNS con un CNAME apuntando a `cname.vercel-dns.com` desde el panel de Vercel.

## Estructura del proyecto

```
/
├── app/
│   ├── page.tsx                 # Landing + diagnóstico + resultados (toda la SPA)
│   ├── api/
│   │   └── submit-lead/
│   │       └── route.ts         # Endpoint que recibe el lead y lo envía al webhook/email
│   ├── layout.tsx
│   └── globals.css
├── lib/
│   ├── pillars.ts               # Las 35 preguntas y la definición de pilares
│   ├── benchmarks.ts            # Medias por sector (10 sectores)
│   ├── actions.ts               # Biblioteca de acciones para el plan
│   └── scoring.ts               # Cálculo de puntuaciones y comparativas
├── components/
│   ├── DiagnosticForm.tsx
│   ├── Questionnaire.tsx
│   ├── Results.tsx
│   ├── RadarChart.tsx
│   └── LeadCaptureModal.tsx
├── public/
│   └── informe-ai4value.pdf     # El informe Word/PDF que enviarás a los leads
├── package.json
├── next.config.mjs
├── tailwind.config.ts
└── README.md
```

## Cómo funciona el lead magnet

1. Usuario entra y responde las 35 preguntas (sin dar datos personales aún)
2. Ve su puntuación global + radar + comparativa vs sector + 3 insights clave
3. Para ver el plan de acción detallado y recibir el informe personalizado debe dejar: nombre, email, empresa, sector, tamaño, rol
4. Al enviar, se dispara `POST /api/submit-lead` con todos los datos + puntuaciones
5. El endpoint reenvía al webhook configurado (o a Resend) y el usuario ve el plan en pantalla

## Integración con Make (recomendado)

Crea un escenario en Make con este trigger:

- **Webhook** → recibe el JSON del lead
- **Google Sheets / Airtable** → guarda el lead
- **Gmail / Resend** → envía el email con el informe adjunto
- **HubSpot / Pipedrive** → crea el contacto en tu CRM

El JSON que llega al webhook tiene esta forma:

```json
{
  "profile": {
    "name": "Juan García",
    "email": "juan@empresa.com",
    "company": "Empresa SL",
    "role": "Director General",
    "sector": "industria",
    "size": "pequena"
  },
  "scores": {
    "estrategia": 45,
    "datos": 38,
    "personas": 52,
    "procesos": 41,
    "gobernanza": 35,
    "overall": 42
  },
  "level": { "code": "L2", "name": "Adoptadora" },
  "createdAt": "2026-04-21T10:30:00.000Z"
}
```

## Personalización

- **Preguntas**: edita `lib/pillars.ts`. 7 preguntas por pilar por defecto.
- **Benchmarks**: ajusta valores en `lib/benchmarks.ts` conforme acumules datos reales.
- **Acciones del plan**: edita la biblioteca en `lib/actions.ts`.
- **Colores**: `tailwind.config.ts` tiene la paleta principal (teal, navy, gold, coral).
- **Copy**: todo el texto en castellano está en los componentes React, directo en JSX.

## Licencia

Propiedad de Alberto de Torres Pachón · Nektiu. Uso interno.
