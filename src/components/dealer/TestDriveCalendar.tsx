"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Clock,
  Car,
  User,
  Check,
  X,
  AlertTriangle,
} from "lucide-react";
import { Button, Select, Badge } from "@/components/ui";
import { cn } from "@/lib/utils";

interface TestDrive {
  id: string;
  scheduledAt: string;
  duration: number;
  status: string;
  notes: string | null;
  lead: {
    id: string;
    name: string;
    phone: string | null;
  };
  vehicle: {
    id: string;
    title: string;
  };
}

const STATUS_CONFIG: Record<string, { label: string; icon: typeof Check; color: string }> = {
  SCHEDULED: { label: "Programado", icon: Clock, color: "text-blue-600 bg-blue-100" },
  COMPLETED: { label: "Completado", icon: Check, color: "text-green-600 bg-green-100" },
  CANCELLED: { label: "Cancelado", icon: X, color: "text-neutral-600 bg-neutral-100" },
  NO_SHOW: { label: "No asistió", icon: AlertTriangle, color: "text-red-600 bg-red-100" },
};

function getWeekDays(date: Date): Date[] {
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay() + 1); // Monday

  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    days.push(day);
  }
  return days;
}

function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function TestDriveCalendar() {
  const [testDrives, setTestDrives] = useState<TestDrive[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"week" | "list">("week");

  const fetchTestDrives = useCallback(async () => {
    setLoading(true);
    try {
      const weekDays = getWeekDays(currentDate);
      const startDate = weekDays[0].toISOString();
      const endDate = new Date(weekDays[6]);
      endDate.setHours(23, 59, 59);

      const res = await fetch(
        `/api/dealer/test-drives?startDate=${startDate}&endDate=${endDate.toISOString()}`
      );
      if (res.ok) {
        const data = await res.json();
        setTestDrives(data.testDrives || []);
      }
    } catch (error) {
      console.error("Error fetching test drives:", error);
    } finally {
      setLoading(false);
    }
  }, [currentDate]);

  useEffect(() => {
    fetchTestDrives();
  }, [fetchTestDrives]);

  const handleUpdateStatus = async (testDriveId: string, leadId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/dealer/leads/${leadId}/test-drives/${testDriveId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        fetchTestDrives();
      }
    } catch (error) {
      console.error("Error updating test drive:", error);
    }
  };

  const goToPreviousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const weekDays = getWeekDays(currentDate);
  const today = new Date().toDateString();

  const getTestDrivesForDay = (day: Date) => {
    return testDrives.filter((td) => {
      const tdDate = new Date(td.scheduledAt);
      return tdDate.toDateString() === day.toDateString();
    }).sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  };

  const weekStartFormatted = weekDays[0].toLocaleDateString("es-CL", {
    day: "numeric",
    month: "short",
  });
  const weekEndFormatted = weekDays[6].toLocaleDateString("es-CL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Test Drives</h1>
          <p className="text-neutral-600 text-sm mt-1">
            Calendario de pruebas de manejo programadas.
          </p>
        </div>
        <Button onClick={fetchTestDrives} variant="outline" disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Actualizar
        </Button>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mb-4 bg-white rounded-lg border border-neutral-200 p-3">
        <div className="flex items-center gap-2">
          <button
            onClick={goToPreviousWeek}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={goToNextWeek}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Hoy
          </Button>
        </div>

        <span className="font-medium text-neutral-900">
          {weekStartFormatted} - {weekEndFormatted}
        </span>

        <Select
          options={[
            { value: "week", label: "Semana" },
            { value: "list", label: "Lista" },
          ]}
          value={viewMode}
          onChange={(e) => setViewMode(e.target.value as "week" | "list")}
          className="w-28"
        />
      </div>

      {/* Calendar View */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin h-8 w-8 border-2 border-andino-600 border-t-transparent rounded-full" />
        </div>
      ) : viewMode === "week" ? (
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day) => {
            const dayTestDrives = getTestDrivesForDay(day);
            const isToday = day.toDateString() === today;

            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "bg-white rounded-lg border min-h-[200px]",
                  isToday ? "border-andino-400" : "border-neutral-200"
                )}
              >
                {/* Day Header */}
                <div
                  className={cn(
                    "px-2 py-1.5 border-b text-center",
                    isToday ? "bg-andino-50 border-andino-200" : "border-neutral-100"
                  )}
                >
                  <p className="text-xs text-neutral-500">
                    {day.toLocaleDateString("es-CL", { weekday: "short" })}
                  </p>
                  <p
                    className={cn(
                      "font-semibold",
                      isToday ? "text-andino-600" : "text-neutral-900"
                    )}
                  >
                    {day.getDate()}
                  </p>
                </div>

                {/* Events */}
                <div className="p-1 space-y-1">
                  {dayTestDrives.map((td) => {
                    const config = STATUS_CONFIG[td.status];
                    return (
                      <Link
                        key={td.id}
                        href={`/dealer/leads?leadId=${td.lead.id}`}
                        className={cn(
                          "block p-1.5 rounded text-xs hover:opacity-80 transition-opacity",
                          config.color
                        )}
                      >
                        <p className="font-medium truncate">{formatTime(td.scheduledAt)}</p>
                        <p className="truncate text-[10px] opacity-80">{td.lead.name}</p>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="space-y-2">
          {testDrives.length === 0 ? (
            <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
              <Car className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                Sin test drives esta semana
              </h3>
              <p className="text-sm text-neutral-500">
                Agenda test drives desde los leads para verlos aquí.
              </p>
            </div>
          ) : (
            testDrives
              .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
              .map((td) => {
                const config = STATUS_CONFIG[td.status];
                const Icon = config.icon;
                const isPast = new Date(td.scheduledAt) < new Date();

                return (
                  <div
                    key={td.id}
                    className={cn(
                      "bg-white rounded-lg border p-4",
                      isPast && td.status === "SCHEDULED" ? "border-amber-300" : "border-neutral-200"
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge
                            variant={
                              td.status === "COMPLETED"
                                ? "success"
                                : td.status === "CANCELLED" || td.status === "NO_SHOW"
                                ? "error"
                                : "info"
                            }
                          >
                            <Icon className="h-3 w-3 mr-1" />
                            {config.label}
                          </Badge>
                          {isPast && td.status === "SCHEDULED" && (
                            <Badge variant="warning">Pendiente de actualizar</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1.5 text-neutral-900 font-medium">
                            <Clock className="h-4 w-4" />
                            {new Date(td.scheduledAt).toLocaleString("es-CL", {
                              weekday: "short",
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          <span className="text-neutral-500">({td.duration} min)</span>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <Link
                            href={`/dealer/leads?leadId=${td.lead.id}`}
                            className="flex items-center gap-1.5 text-andino-600 hover:underline"
                          >
                            <User className="h-4 w-4" />
                            {td.lead.name}
                          </Link>
                          <span className="flex items-center gap-1.5 text-neutral-600">
                            <Car className="h-4 w-4" />
                            {td.vehicle.title}
                          </span>
                        </div>
                        {td.notes && (
                          <p className="mt-2 text-xs text-neutral-500">{td.notes}</p>
                        )}
                      </div>

                      {td.status === "SCHEDULED" && (
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => handleUpdateStatus(td.id, td.lead.id, "COMPLETED")}
                            className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                          >
                            Completado
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(td.id, td.lead.id, "NO_SHOW")}
                            className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                          >
                            No asistió
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(td.id, td.lead.id, "CANCELLED")}
                            className="text-xs px-2 py-1 bg-neutral-100 text-neutral-700 rounded hover:bg-neutral-200 transition-colors"
                          >
                            Cancelar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
          )}
        </div>
      )}
    </div>
  );
}
