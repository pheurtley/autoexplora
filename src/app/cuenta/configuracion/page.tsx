import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Card } from "@/components/ui";
import { PasswordForm } from "@/components/cuenta/PasswordForm";
import { LogoutButton } from "@/components/cuenta/LogoutButton";
import { User, Mail, Phone, Calendar } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mi Cuenta | AutoExplora.cl",
};

export default async function ConfiguracionPage() {
  const session = await auth();

  const user = await prisma.user.findUnique({
    where: { id: session!.user!.id },
    select: {
      name: true,
      email: true,
      phone: true,
      createdAt: true,
      password: true, // To check if user has password (credentials)
    },
  });

  const hasPassword = !!user?.password;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900">Mi Cuenta</h1>

      {/* Account Info */}
      <Card>
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">
          Información personal
        </h2>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-andino-100 flex items-center justify-center">
              <User className="w-5 h-5 text-andino-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Nombre</p>
              <p className="font-medium text-neutral-900">
                {user?.name || "Sin nombre"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-andino-100 flex items-center justify-center">
              <Mail className="w-5 h-5 text-andino-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Email</p>
              <p className="font-medium text-neutral-900">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-andino-100 flex items-center justify-center">
              <Phone className="w-5 h-5 text-andino-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Teléfono</p>
              <p className="font-medium text-neutral-900">
                {user?.phone || "No registrado"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-andino-100 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-andino-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Miembro desde</p>
              <p className="font-medium text-neutral-900">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("es-CL", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "—"}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Change Password */}
      {hasPassword && (
        <Card>
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">
            Cambiar contraseña
          </h2>
          <PasswordForm />
        </Card>
      )}

      {!hasPassword && (
        <Card>
          <h2 className="text-lg font-semibold text-neutral-900 mb-2">
            Contraseña
          </h2>
          <p className="text-neutral-500 text-sm">
            Tu cuenta fue creada con Google o Facebook. No es necesario configurar
            una contraseña.
          </p>
        </Card>
      )}

      {/* Logout */}
      <Card>
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">
          Cerrar sesión
        </h2>
        <p className="text-neutral-500 text-sm mb-4">
          Al cerrar sesión deberás volver a ingresar para acceder a tu cuenta.
        </p>
        <LogoutButton />
      </Card>
    </div>
  );
}
