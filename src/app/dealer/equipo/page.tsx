"use client";

import { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  Mail,
  MoreVertical,
  Trash2,
  Shield,
} from "lucide-react";
import { Button, Input, Select } from "@/components/ui";

interface TeamMember {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  dealerRole: string;
  createdAt: string;
}

const roleLabels: Record<string, string> = {
  OWNER: "Propietario",
  MANAGER: "Gerente",
  SALES: "Vendedor",
};

const roleOptions = [
  { value: "MANAGER", label: "Gerente" },
  { value: "SALES", label: "Vendedor" },
];

export default function DealerTeamPage() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  // Invite form state
  const [inviteData, setInviteData] = useState({
    name: "",
    email: "",
    role: "SALES",
  });
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState("");

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      const response = await fetch("/api/dealer/team");
      if (response.ok) {
        const data = await response.json();
        setTeam(data.team);
      }
    } catch (error) {
      console.error("Error fetching team:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    setInviteError("");

    try {
      const response = await fetch("/api/dealer/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inviteData),
      });

      if (response.ok) {
        setShowInviteModal(false);
        setInviteData({ name: "", email: "", role: "SALES" });
        fetchTeam();
      } else {
        const data = await response.json();
        setInviteError(data.error || "Error al invitar al usuario");
      }
    } catch (error) {
      console.error("Error inviting user:", error);
      setInviteError("Error al invitar al usuario");
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async (userId: string) => {
    if (!confirm("¿Estás seguro de eliminar a este usuario del equipo?")) {
      return;
    }

    try {
      const response = await fetch(`/api/dealer/team/${userId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchTeam();
      } else {
        const data = await response.json();
        alert(data.error || "Error al eliminar al usuario");
      }
    } catch (error) {
      console.error("Error removing user:", error);
      alert("Error al eliminar al usuario");
    } finally {
      setOpenMenu(null);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/dealer/team/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        fetchTeam();
      } else {
        const data = await response.json();
        alert(data.error || "Error al cambiar el rol");
      }
    } catch (error) {
      console.error("Error changing role:", error);
      alert("Error al cambiar el rol");
    } finally {
      setOpenMenu(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-andino-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Equipo</h1>
          <p className="text-neutral-600 mt-1">
            Gestiona los usuarios de tu automotora
          </p>
        </div>

        <Button onClick={() => setShowInviteModal(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Invitar Usuario
        </Button>
      </div>

      {/* Team List */}
      <div className="bg-white rounded-xl border border-neutral-200">
        {team.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
            <p className="text-neutral-500">No hay otros usuarios en tu equipo</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {team.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-andino-100 flex items-center justify-center">
                    {member.image ? (
                      <img
                        src={member.image}
                        alt={member.name || ""}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <Users className="w-5 h-5 text-andino-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900">
                      {member.name || "Sin nombre"}
                    </p>
                    <p className="text-sm text-neutral-500">{member.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full ${
                      member.dealerRole === "OWNER"
                        ? "bg-purple-100 text-purple-700"
                        : member.dealerRole === "MANAGER"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-neutral-100 text-neutral-700"
                    }`}
                  >
                    {roleLabels[member.dealerRole] || member.dealerRole}
                  </span>

                  {member.dealerRole !== "OWNER" && (
                    <div className="relative">
                      <button
                        onClick={() =>
                          setOpenMenu(openMenu === member.id ? null : member.id)
                        }
                        className="p-2 text-neutral-400 hover:text-neutral-600 rounded-lg hover:bg-neutral-100"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {openMenu === member.id && (
                        <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 py-1 z-10">
                          {member.dealerRole !== "MANAGER" && (
                            <button
                              onClick={() =>
                                handleRoleChange(member.id, "MANAGER")
                              }
                              className="w-full px-4 py-2 text-sm text-left text-neutral-600 hover:bg-neutral-50 flex items-center gap-2"
                            >
                              <Shield className="w-4 h-4" />
                              Hacer gerente
                            </button>
                          )}
                          {member.dealerRole !== "SALES" && (
                            <button
                              onClick={() =>
                                handleRoleChange(member.id, "SALES")
                              }
                              className="w-full px-4 py-2 text-sm text-left text-neutral-600 hover:bg-neutral-50 flex items-center gap-2"
                            >
                              <Users className="w-4 h-4" />
                              Hacer vendedor
                            </button>
                          )}
                          <hr className="my-1 border-neutral-100" />
                          <button
                            onClick={() => handleRemove(member.id)}
                            className="w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            Eliminar del equipo
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md mx-4">
            <div className="p-6 border-b border-neutral-200">
              <h2 className="text-lg font-semibold text-neutral-900">
                Invitar Usuario
              </h2>
              <p className="text-sm text-neutral-500 mt-1">
                Añade un nuevo miembro a tu equipo
              </p>
            </div>

            <form onSubmit={handleInvite} className="p-6 space-y-4">
              {inviteError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  {inviteError}
                </div>
              )}

              <Input
                label="Nombre"
                value={inviteData.name}
                onChange={(e) =>
                  setInviteData({ ...inviteData, name: e.target.value })
                }
                placeholder="Juan Pérez"
                required
              />

              <Input
                label="Email"
                type="email"
                value={inviteData.email}
                onChange={(e) =>
                  setInviteData({ ...inviteData, email: e.target.value })
                }
                placeholder="juan@email.com"
                leftIcon={<Mail className="w-4 h-4" />}
                required
              />

              <Select
                label="Rol"
                options={roleOptions}
                value={inviteData.role}
                onChange={(e) =>
                  setInviteData({ ...inviteData, role: e.target.value })
                }
              />

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowInviteModal(false)}
                  disabled={inviting}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1" disabled={inviting}>
                  {inviting ? "Invitando..." : "Invitar"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
