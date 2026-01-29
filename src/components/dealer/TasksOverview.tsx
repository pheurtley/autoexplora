"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  RefreshCw,
  Clock,
  Flag,
  User,
  Check,
  AlertTriangle,
  Calendar,
} from "lucide-react";
import { Button, Select } from "@/components/ui";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  description: string | null;
  dueAt: string;
  completedAt: string | null;
  priority: string;
  lead: {
    id: string;
    name: string;
  };
  assignedTo: {
    id: string;
    name: string | null;
  };
}

interface TeamMember {
  id: string;
  name: string | null;
}

const PRIORITY_COLORS: Record<string, string> = {
  HIGH: "text-red-600 bg-red-50 border-red-200",
  MEDIUM: "text-amber-600 bg-amber-50 border-amber-200",
  LOW: "text-neutral-600 bg-neutral-50 border-neutral-200",
};

function formatDueDate(dateString: string): { text: string; isOverdue: boolean; isSoon: boolean } {
  const date = new Date(dateString);
  const now = new Date();
  const isOverdue = date < now;
  const diffMs = date.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  const isSoon = !isOverdue && diffHours < 24;

  return {
    text: date.toLocaleString("es-CL", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }),
    isOverdue,
    isSoon,
  };
}

export function TasksOverview() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter && filter !== "all") {
        params.append("assignedTo", filter);
      }
      const res = await fetch(`/api/dealer/tasks?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks || []);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  const fetchTeamMembers = useCallback(async () => {
    try {
      const res = await fetch("/api/dealer/team");
      if (res.ok) {
        const data = await res.json();
        setTeamMembers(data.members || []);
      }
    } catch (error) {
      console.error("Error fetching team:", error);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
    fetchTeamMembers();
  }, [fetchTasks, fetchTeamMembers]);

  const handleComplete = async (taskId: string, leadId: string) => {
    try {
      const res = await fetch(`/api/dealer/leads/${leadId}/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completedAt: new Date().toISOString() }),
      });

      if (res.ok) {
        fetchTasks();
      }
    } catch (error) {
      console.error("Error completing task:", error);
    }
  };

  const filterOptions = [
    { value: "all", label: "Todas" },
    { value: "me", label: "Mis tareas" },
    ...teamMembers.map((m) => ({
      value: m.id,
      label: m.name || "Sin nombre",
    })),
  ];

  // Group tasks
  const overdueTasks = tasks.filter((t) => !t.completedAt && new Date(t.dueAt) < new Date());
  const todayTasks = tasks.filter((t) => {
    if (t.completedAt) return false;
    const dueDate = new Date(t.dueAt);
    const now = new Date();
    return dueDate >= now && dueDate.toDateString() === now.toDateString();
  });
  const upcomingTasks = tasks.filter((t) => {
    if (t.completedAt) return false;
    const dueDate = new Date(t.dueAt);
    const now = new Date();
    return dueDate > now && dueDate.toDateString() !== now.toDateString();
  });

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Tareas</h1>
          <p className="text-neutral-600 text-sm mt-1">
            Gestiona las tareas de seguimiento de todos los leads.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            options={filterOptions}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-40"
          />
          <Button onClick={fetchTasks} variant="outline" disabled={loading}>
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Actualizar
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin h-8 w-8 border-2 border-andino-600 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Overdue Section */}
          {overdueTasks.length > 0 && (
            <div>
              <h2 className="flex items-center gap-2 text-sm font-semibold text-red-600 mb-3">
                <AlertTriangle className="h-4 w-4" />
                Vencidas ({overdueTasks.length})
              </h2>
              <TaskList
                tasks={overdueTasks}
                onComplete={handleComplete}
                variant="overdue"
              />
            </div>
          )}

          {/* Today Section */}
          {todayTasks.length > 0 && (
            <div>
              <h2 className="flex items-center gap-2 text-sm font-semibold text-amber-600 mb-3">
                <Clock className="h-4 w-4" />
                Hoy ({todayTasks.length})
              </h2>
              <TaskList
                tasks={todayTasks}
                onComplete={handleComplete}
                variant="today"
              />
            </div>
          )}

          {/* Upcoming Section */}
          {upcomingTasks.length > 0 && (
            <div>
              <h2 className="flex items-center gap-2 text-sm font-semibold text-neutral-600 mb-3">
                <Calendar className="h-4 w-4" />
                Próximas ({upcomingTasks.length})
              </h2>
              <TaskList
                tasks={upcomingTasks}
                onComplete={handleComplete}
                variant="upcoming"
              />
            </div>
          )}

          {/* Empty State */}
          {tasks.length === 0 && (
            <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
              <Clock className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                Sin tareas pendientes
              </h3>
              <p className="text-sm text-neutral-500 max-w-md mx-auto">
                Las tareas creadas desde los leads aparecerán aquí.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TaskList({
  tasks,
  onComplete,
  variant,
}: {
  tasks: Task[];
  onComplete: (taskId: string, leadId: string) => void;
  variant: "overdue" | "today" | "upcoming";
}) {
  return (
    <ul className="space-y-2">
      {tasks.map((task) => {
        const { text: dueText, isOverdue } = formatDueDate(task.dueAt);
        return (
          <li
            key={task.id}
            className={cn(
              "flex items-start gap-3 p-4 rounded-lg border bg-white",
              variant === "overdue" && "border-red-200 bg-red-50/50",
              variant === "today" && "border-amber-200 bg-amber-50/50"
            )}
          >
            <button
              onClick={() => onComplete(task.id, task.lead.id)}
              className={cn(
                "mt-0.5 w-5 h-5 rounded-full border-2 transition-colors flex-shrink-0",
                variant === "overdue"
                  ? "border-red-400 hover:border-red-500 hover:bg-red-100"
                  : "border-neutral-300 hover:border-andino-500 hover:bg-andino-50"
              )}
              title="Marcar completada"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-neutral-900">
                    {task.title}
                  </p>
                  <Link
                    href={`/dealer/leads?leadId=${task.lead.id}`}
                    className="text-xs text-andino-600 hover:underline"
                  >
                    {task.lead.name}
                  </Link>
                </div>
                <span
                  className={cn(
                    "text-xs font-medium px-2 py-1 rounded",
                    PRIORITY_COLORS[task.priority]
                  )}
                >
                  <Flag className="h-3 w-3 inline mr-1" />
                  {task.priority === "HIGH"
                    ? "Alta"
                    : task.priority === "MEDIUM"
                    ? "Media"
                    : "Baja"}
                </span>
              </div>
              {task.description && (
                <p className="text-xs text-neutral-500 mt-1">
                  {task.description}
                </p>
              )}
              <div className="flex items-center gap-3 mt-2 text-xs text-neutral-500">
                <span
                  className={cn(
                    "flex items-center gap-1",
                    isOverdue && "text-red-600"
                  )}
                >
                  <Clock className="h-3 w-3" />
                  {dueText}
                </span>
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {task.assignedTo.name}
                </span>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
