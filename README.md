# AI4Value · Test de Madurez IA para PYMEs

Lead magnet que genera un informe Word personalizado (~8 páginas) al momento con los datos de cada lead y se lo envía por email. Tú recibes una copia + notificación + datos en Google Sheet para tener todo listo antes de la llamada.

## Flujo completo

1. El usuario responde 35 preguntas (sin dar datos personales)
2. Ve su puntuación global y nivel de madurez
3. Para "desbloquear" el informe completo rellena el formulario (nombre, email, empresa, sector, tamaño)
4. El servidor:
   - Genera un Word personalizado de 8 páginas con sus datos y puntuaciones
   - Lo envía por email al lead como adjunto
   - Te envía a ti una copia con sus datos de contacto
   - Guarda todo en tu Google Sheet (vía webhook de Make)
5. El usuario ve el informe en pantalla mientras tú ya tienes su Word listo para la llamada

## Despliegue en Vercel · 10 minutos

### Paso 1 · Subir a GitHub y conectar con Vercel

```bash
unzip ai4value-nektiu.zip
cd vercel-app
git init
git add .
git commit -m "Initial"
# Crea un repo privado en github.com y sigue las instrucciones para subirlo
```

Luego ve a [vercel.com](https://vercel.com) → Add New → Project → importa el repo. Despliega con configuración por defecto. Ya tienes URL pública.

### Paso 2 · Configurar Resend (para enviar emails)

1. Crea cuenta gratis en [resend.com](https://resend.com) (3000 emails/mes gratis)
2. En el dashboard → API Keys → Create API Key → copia la clave
3. En Vercel → tu proyecto → Settings → Environment Variables → añade:
   - `RESEND_API_KEY` = la clave que copiaste
   - `LEAD_FROM_EMAIL` = `onboarding@resend.dev` (para empezar sin verificar dominio)
   - `LEAD_NOTIFICATION_EMAIL` = `alberto@nektiu.com`
4. Redeploy el proyecto

Ya se envían emails. El lead recibe su Word personalizado, tú recibes la notificación con copia del Word.

### Paso 3 · Configurar Vercel Blob (para guardar los Word permanentemente)

1. En Vercel → tu proyecto → Storage → Create Database → Blob → "ai4value-reports"
2. Conecta al proyecto (botón Connect)
3. Vercel añade automáticamente `BLOB_READ_WRITE_TOKEN` a las variables de entorno
4. Redeploy

A partir de ahora cada informe generado se guarda en Blob y tienes URL permanente para consultarlo cuando quieras, sin tener que regenerarlo.

### Paso 4 · Configurar Google Sheet + Make (para guardar los leads)

1. Crea una hoja en Google Sheets con estas columnas en la fila 1:

```
fecha | nombre | email | empresa | rol | sector | tamaño | score_global | nivel | estrategia | datos | personas | procesos | gobernanza | respuestas_estrategia | respuestas_datos | respuestas_personas | respuestas_procesos | respuestas_gobernanza | url_informe
```

2. Ve a [make.com](https://make.com), crea cuenta gratis (1000 operaciones/mes gratis)
3. Nuevo escenario → módulo `Webhooks` → `Custom webhook` → copia la URL que te da
4. Segundo módulo: `Google Sheets · Add a row` conectado a tu cuenta
5. Mapea los campos del webhook a las columnas del Sheet:
   - `timestamp` → fecha
   - `profile.name` → nombre
   - `profile.email` → email
   - `profile.company` → empresa
   - `profile.role` → rol
   - `profile.sectorLabel` → sector
   - `profile.sizeLabel` → tamaño
   - `scores.overall` → score_global
   - `level.code + " " + level.name` → nivel
   - `scores.estrategia/datos/personas/procesos/gobernanza` → cada pilar
   - `answers.estrategia/datos/personas/procesos/gobernanza` → respuestas individuales
   - `reportUrl` → url_informe
6. Activa el escenario
7. Pega la URL del webhook en Vercel como variable `LEAD_WEBHOOK_URL`
8. Redeploy

Prueba: haz un test en tu URL de Vercel y verifica que el lead aparece en el Sheet.

## Cómo usarlo el día de la llamada

1. Abres tu Google Sheet → filtras por fecha o empresa
2. Copias la `url_informe` de esa fila → abres en el navegador → ya tienes el Word
3. En el Sheet también ves las respuestas individuales de cada pilar para identificar puntos de dolor concretos
4. Llamas al lead con todo el contexto preparado

## Personalización

- **Preguntas**: `lib/pillars.ts` (7 preguntas por pilar)
- **Benchmarks sector**: `lib/benchmarks.ts`
- **Plan de acción**: `lib/scoring.ts`
- **Contenido del informe Word**: `lib/generateReport.ts`
- **Emails**: `app/api/submit-lead/route.ts` (funciones buildUserEmail y buildAdminEmail)
- **Colores**: `tailwind.config.ts`

## Upgrade futuro · Microsoft 365

Cuando quieras enviar los emails desde `clientes@nektiu.com` (Outlook) en vez de Resend:
1. Registrar app en Azure Portal para Microsoft Graph
2. Reemplazar las llamadas `resend.emails.send()` por `graph.users().sendMail()` en `app/api/submit-lead/route.ts`

Avísame cuando lo quieras hacer y te paso el código.

## Licencia

Propiedad de Alberto de Torres Pachón · Nektiu.
