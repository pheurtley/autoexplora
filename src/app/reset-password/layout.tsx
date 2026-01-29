import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Restablecer Contraseña | AutoExplora.cl",
  robots: { index: false, follow: false },
};

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
