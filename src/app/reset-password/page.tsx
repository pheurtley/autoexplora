"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/layout";
import { Button, Input, Spinner } from "@/components/ui";
import { Lock, Loader2, CheckCircle, AlertCircle } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  // If no token, show error
  if (!token) {
    return (
      <main className="min-h-screen bg-neutral-50 flex items-center justify-center py-12 px-4">
        <Container className="max-w-md">
          <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-neutral-900 mb-4">
              Enlace inválido
            </h1>
            <p className="text-neutral-600 mb-6">
              El enlace de recuperación no es válido o ha expirado.
            </p>
            <Link href="/recuperar-contrasena">
              <Button className="w-full justify-center">
                Solicitar nuevo enlace
              </Button>
            </Link>
          </div>
        </Container>
      </main>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    // Validate password length
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Error al restablecer la contraseña");
        return;
      }

      setIsSuccess(true);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/login?success=Contraseña actualizada. Ya puedes iniciar sesión.");
      }, 3000);
    } catch {
      setError("Error de conexión. Intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <main className="min-h-screen bg-neutral-50 flex items-center justify-center py-12 px-4">
        <Container className="max-w-md">
          <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-neutral-900 mb-4">
              Contraseña actualizada
            </h1>
            <p className="text-neutral-600 mb-6">
              Tu contraseña ha sido restablecida exitosamente.
              Serás redirigido al inicio de sesión...
            </p>
            <Spinner size="md" />
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
              Nueva contraseña
            </h1>
            <p className="mt-2 text-neutral-600">
              Ingresa tu nueva contraseña.
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
              type="password"
              label="Nueva contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              leftIcon={<Lock className="w-4 h-4" />}
              required
              disabled={isLoading}
            />

            <Input
              type="password"
              label="Confirmar contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repite tu contraseña"
              leftIcon={<Lock className="w-4 h-4" />}
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
                  Guardando...
                </>
              ) : (
                "Restablecer contraseña"
              )}
            </Button>
          </form>
        </div>
      </Container>
    </main>
  );
}

function ResetPasswordLoading() {
  return (
    <main className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <Spinner size="lg" />
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordLoading />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
