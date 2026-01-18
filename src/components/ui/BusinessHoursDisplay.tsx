"use client";

import { useState, useEffect, useMemo } from "react";
import type { WeekSchedule } from "./BusinessHoursEditor";

export interface BusinessHoursDisplayProps {
  schedule: WeekSchedule | null;
  showStatus?: boolean;
  compact?: boolean;
}

const DAYS: { key: keyof WeekSchedule; label: string; shortLabel: string }[] = [
  { key: "lunes", label: "Lunes", shortLabel: "Lun" },
  { key: "martes", label: "Martes", shortLabel: "Mar" },
  { key: "miercoles", label: "Miércoles", shortLabel: "Mié" },
  { key: "jueves", label: "Jueves", shortLabel: "Jue" },
  { key: "viernes", label: "Viernes", shortLabel: "Vie" },
  { key: "sabado", label: "Sábado", shortLabel: "Sáb" },
  { key: "domingo", label: "Domingo", shortLabel: "Dom" },
];

const DAY_INDEX_TO_KEY: { [key: number]: keyof WeekSchedule } = {
  0: "domingo",
  1: "lunes",
  2: "martes",
  3: "miercoles",
  4: "jueves",
  5: "viernes",
  6: "sabado",
};

function getCurrentChileTime(): { dayKey: keyof WeekSchedule; time: string } {
  const now = new Date();
  const chileTime = new Date(
    now.toLocaleString("en-US", { timeZone: "America/Santiago" })
  );
  const dayKey = DAY_INDEX_TO_KEY[chileTime.getDay()];
  const time = `${chileTime.getHours().toString().padStart(2, "0")}:${chileTime
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
  return { dayKey, time };
}

function isCurrentlyOpen(schedule: WeekSchedule): boolean {
  const { dayKey, time } = getCurrentChileTime();
  const today = schedule[dayKey];

  if (!today?.isOpen || !today.openTime || !today.closeTime) {
    return false;
  }

  return time >= today.openTime && time < today.closeTime;
}

export function BusinessHoursDisplay({
  schedule,
  showStatus = true,
  compact = false,
}: BusinessHoursDisplayProps) {
  // Tick state to trigger recalculation every minute
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Compute values based on schedule and tick (tick triggers recalculation)
  const isOpen = useMemo(() => {
    void tick; // Reference tick to ensure recalculation
    return schedule ? isCurrentlyOpen(schedule) : false;
  }, [schedule, tick]);

  const currentDay = useMemo(() => {
    void tick; // Reference tick to ensure recalculation
    return getCurrentChileTime().dayKey;
  }, [tick]);

  if (!schedule) {
    return (
      <div className="text-sm text-neutral-500 italic">
        Horarios no disponibles
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Status Badge */}
      {showStatus && (
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${
              isOpen
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isOpen ? "bg-green-500" : "bg-red-500"
              }`}
            />
            {isOpen ? "Abierto ahora" : "Cerrado"}
          </span>
        </div>
      )}

      {/* Schedule List */}
      <div className={compact ? "space-y-1" : "space-y-2"}>
        {DAYS.map(({ key, label, shortLabel }) => {
          const day = schedule[key] || { isOpen: false, openTime: "", closeTime: "" };
          const isToday = key === currentDay;

          return (
            <div
              key={key}
              className={`flex items-center justify-between text-sm ${
                isToday ? "font-medium text-neutral-900" : "text-neutral-600"
              } ${compact ? "py-0.5" : "py-1"}`}
            >
              <span className={isToday ? "text-andino-600" : ""}>
                {compact ? shortLabel : label}
                {isToday && !compact && (
                  <span className="ml-1 text-xs text-andino-500">(Hoy)</span>
                )}
              </span>
              <span className={day.isOpen ? "" : "text-neutral-400"}>
                {day.isOpen && day.openTime && day.closeTime
                  ? `${day.openTime} - ${day.closeTime}`
                  : "Cerrado"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
