import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Recuperar Contraseña | AutoExplora.cl",
  robots: { index: false, follow: false },
};

export default function RecuperarContrasenaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
