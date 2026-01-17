import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header, Footer } from "@/components/layout";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { SiteConfigProvider } from "@/components/providers/SiteConfigProvider";
import { getSiteConfig } from "@/lib/config";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();

  const siteName = config.siteName || "AutoExplora.cl";
  const description = config.metaDescription || config.siteTagline ||
    "El marketplace de vehículos más grande de Chile. Encuentra autos, motos y vehículos comerciales nuevos y usados.";
  const logo = config.logo;
  const favicon = config.favicon || config.logo;

  return {
    title: {
      default: `${siteName} - Compra y Venta de Vehículos en Chile`,
      template: `%s | ${siteName}`,
    },
    description,
    keywords: [
      "autos",
      "vehículos",
      "Chile",
      "comprar auto",
      "vender auto",
      "autos usados",
      "autos nuevos",
      "motos",
      "camionetas",
    ],
    authors: [{ name: siteName }],
    creator: siteName,
    icons: favicon ? {
      icon: [{ url: favicon }],
      apple: favicon,
    } : undefined,
    openGraph: {
      type: "website",
      locale: "es_CL",
      url: "https://autoexplora.cl",
      siteName: siteName,
      title: `${siteName} - Compra y Venta de Vehículos en Chile`,
      description,
      images: logo ? [logo] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${siteName} - Compra y Venta de Vehículos`,
      description,
      images: logo ? [logo] : undefined,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-CL" className={inter.variable}>
      <body className="min-h-screen flex flex-col bg-background text-foreground antialiased">
        <SessionProvider>
          <SiteConfigProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </SiteConfigProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
