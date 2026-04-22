import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Test de Madurez IA · AI4Value · Nektiu",
  description:
    "Diagnóstico gratuito de madurez IA para PYMEs en 5 minutos. Pentágono AI4Value, comparativa con media sectorial y plan de acción personalizado.",
  openGraph: {
    title: "Test de Madurez IA para PYMEs",
    description: "Descubre dónde está realmente tu empresa en IA en 5 minutos.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Manrope:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-navy-900 text-slate-100 antialiased">{children}</body>
    </html>
  );
}
