import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Registro | AutoExplora.cl",
  robots: { index: false, follow: false },
};

export default function RegistroLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
