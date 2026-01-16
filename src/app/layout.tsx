import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header, Footer } from "@/components/layout";
import { SessionProvider } from "@/components/providers/SessionProvider";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "PortalAndino - Compra y Venta de Vehículos en Chile",
    template: "%s | PortalAndino",
  },
  description:
    "El marketplace de vehículos más grande de Chile. Encuentra autos, motos y vehículos comerciales nuevos y usados. Publica gratis tu vehículo.",
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
  authors: [{ name: "PortalAndino" }],
  creator: "PortalAndino",
  openGraph: {
    type: "website",
    locale: "es_CL",
    url: "https://portalandino.cl",
    siteName: "PortalAndino",
    title: "PortalAndino - Compra y Venta de Vehículos en Chile",
    description:
      "El marketplace de vehículos más grande de Chile. Encuentra autos, motos y vehículos comerciales.",
  },
  twitter: {
    card: "summary_large_image",
    title: "PortalAndino - Compra y Venta de Vehículos",
    description: "El marketplace de vehículos más grande de Chile.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-CL" className={inter.variable}>
      <body className="min-h-screen flex flex-col bg-background text-foreground antialiased">
        <SessionProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
