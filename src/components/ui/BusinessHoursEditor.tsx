"use client";

import { Copy, Clock } from "lucide-react";
import { Button } from "./Button";

interface DaySchedule {
  isOpen: boolean;
  openTime?: string;
  closeTime?: string;
}

export interface WeekSchedule {
  lunes: DaySchedule;
  martes: DaySchedule;
  miercoles: DaySchedule;
  jueves: DaySchedule;
  viernes: DaySchedule;
  sabado: DaySchedule;
  domingo: DaySchedule;
}

export interface BusinessHoursEditorProps {
  value: WeekSchedule | null;
  onChange: (schedule: WeekSchedule) => void;
}

const DAYS: { key: keyof WeekSchedule; label: string }[] = [
  { key: "lunes", label: "Lunes" },
  { key: "martes", label: "Martes" },
  { key: "miercoles", label: "Miércoles" },
  { key: "jueves", label: "Jueves" },
  { key: "viernes", label: "Viernes" },
  { key: "sabado", label: "Sábado" },
  { key: "domingo", label: "Domingo" },
];

const WEEKDAYS: (keyof WeekSchedule)[] = [
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes",
];

function generateTimeOptions(): string[] {
  const times: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      times.push(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`);
    }
  }
  return times;
}

const TIME_OPTIONS = generateTimeOptions();

const DEFAULT_DAY_CLOSED: DaySchedule = { isOpen: false, openTime: "09:00", closeTime: "18:00" };

const DEFAULT_SCHEDULE: WeekSchedule = {
  lunes: { isOpen: true, openTime: "09:00", closeTime: "18:00" },
  martes: { isOpen: true, openTime: "09:00", closeTime: "18:00" },
  miercoles: { isOpen: true, openTime: "09:00", closeTime: "18:00" },
  jueves: { isOpen: true, openTime: "09:00", closeTime: "18:00" },
  viernes: { isOpen: true, openTime: "09:00", closeTime: "18:00" },
  sabado: { isOpen: true, openTime: "10:00", closeTime: "14:00" },
  domingo: { isOpen: false, openTime: "09:00", closeTime: "18:00" },
};

export function BusinessHoursEditor({
  value,
  onChange,
}: BusinessHoursEditorProps) {
  // Use value directly if provided, otherwise use internal state
  const schedule = value || DEFAULT_SCHEDULE;

  const updateDay = (day: keyof WeekSchedule, updates: Partial<DaySchedule>) => {
    const newSchedule = {
      ...schedule,
      [day]: { ...schedule[day], ...updates },
    };
    onChange(newSchedule);
  };

  const applyToWeekdays = () => {
    const monday = schedule.lunes;
    const newSchedule = { ...schedule };
    WEEKDAYS.forEach((day) => {
      newSchedule[day] = { ...monday };
    });
    onChange(newSchedule);
  };

  const applyToAllDays = () => {
    const monday = schedule.lunes;
    const newSchedule = { ...schedule };
    DAYS.forEach(({ key }) => {
      newSchedule[key] = { ...monday };
    });
    onChange(newSchedule);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-neutral-700" />
        <h3 className="text-lg font-semibold text-neutral-900">
          Horarios de Atención
        </h3>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={applyToWeekdays}
        >
          <Copy className="w-3 h-3 mr-1" />
          Aplicar Lunes a L-V
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={applyToAllDays}
        >
          <Copy className="w-3 h-3 mr-1" />
          Aplicar a todos
        </Button>
      </div>

      {/* Schedule Grid */}
      <div className="space-y-3">
        {DAYS.map(({ key, label }) => {
          const day = schedule[key] || DEFAULT_DAY_CLOSED;
          return (
            <div
              key={key}
              className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 bg-neutral-50 rounded-lg"
            >
              {/* Day Label + Toggle */}
              <div className="flex items-center gap-3 sm:w-36">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={day.isOpen}
                    onChange={(e) =>
                      updateDay(key, {
                        isOpen: e.target.checked,
                        openTime: e.target.checked ? (day.openTime || "09:00") : day.openTime,
                        closeTime: e.target.checked ? (day.closeTime || "18:00") : day.closeTime,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-neutral-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-andino-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-andino-600"></div>
                </label>
                <span className="text-sm font-medium text-neutral-700 min-w-[80px]">
                  {label}
                </span>
              </div>

              {/* Time Selectors */}
              {day.isOpen ? (
                <div className="flex items-center gap-2 flex-1">
                  <select
                    value={day.openTime || "09:00"}
                    onChange={(e) => updateDay(key, { openTime: e.target.value })}
                    className="flex-1 sm:w-28 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-andino-500 focus:outline-none focus:ring-2 focus:ring-andino-500/20"
                  >
                    {TIME_OPTIONS.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                  <span className="text-neutral-500 text-sm">a</span>
                  <select
                    value={day.closeTime || "18:00"}
                    onChange={(e) => updateDay(key, { closeTime: e.target.value })}
                    className="flex-1 sm:w-28 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-andino-500 focus:outline-none focus:ring-2 focus:ring-andino-500/20"
                  >
                    {TIME_OPTIONS.filter(
                      (time) => time > (day.openTime || "00:00")
                    ).map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <span className="text-sm text-neutral-400 italic">Cerrado</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
