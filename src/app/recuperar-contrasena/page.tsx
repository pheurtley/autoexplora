"use client";

import { useState } from "react";
import Link from "next/link";
import { Container } from "@/components/layout";
import { Button, Input } from "@/components/ui";
import { Mail, Loader2, ArrowLeft, CheckCircle } from "lucide-react";

export default function RecuperarContrasenaPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Error al procesar la solicitud");
        return;
      }

      setIsSubmitted(true);
    } catch {
      setError("Error de conexión. Intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <main className="min-h-screen bg-neutral-50 flex items-center justify-center py-12 px-4">
        <Container className="max-w-md">
          <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-neutral-900 mb-4">
              Revisa tu email
            </h1>
            <p className="text-neutral-600 mb-6">
              Si existe una cuenta con el email <strong>{email}</strong>,
              recibirás un enlace para restablecer tu contraseña.
            </p>
            <p className="text-sm text-neutral-500 mb-6">
              El enlace expira en 1 hora. Si no encuentras el email, revisa tu carpeta de spam.
            </p>
            <Link href="/login">
              <Button variant="outline" className="w-full justify-center">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al inicio de sesión
              </Button>
            </Link>
          </div>
        </Container>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-50 flex items-center justify-center py-12 px-4">
      <Container className="max-w-md">
        <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <span className="text-2xl font-bold text-andino-600">
                AutoExplora.cl
              </span>
            </Link>
            <h1 className="mt-4 text-2xl font-bold text-neutral-900">
              Recuperar contraseña
            </h1>
            <p className="mt-2 text-neutral-600">
              Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              leftIcon={<Mail className="w-4 h-4" />}
              required
              disabled={isLoading}
            />

            <Button
              type="submit"
              className="w-full justify-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Enviando...
                </>
              ) : (
                "Enviar enlace de recuperación"
              )}
            </Button>
          </form>

          {/* Back to Login */}
          <p className="mt-6 text-center text-sm text-neutral-600">
            <Link
              href="/login"
              className="font-medium text-andino-600 hover:text-andino-700 inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al inicio de sesión
            </Link>
          </p>
        </div>
      </Container>
    </main>
  );
}
