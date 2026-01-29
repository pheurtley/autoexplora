"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Check, Clock, Flag, User } from "lucide-react";
import { Button } from "@/components/ui";
import { LeadTaskForm } from "./LeadTaskForm";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  description: string | null;
  dueAt: string;
  completedAt: string | null;
  priority: string;
  assignedTo: {
    id: string;
    name: string | null;
  };
}

interface TeamMember {
  id: string;
  name: string | null;
}

interface LeadTaskListProps {
  leadId: string;
  teamMembers: TeamMember[];
}

const PRIORITY_COLORS: Record<string, string> = {
  HIGH: "text-red-600",
  MEDIUM: "text-amber-600",
  LOW: "text-neutral-500",
};

function formatDueDate(dateString: string): { text: string; isOverdue: boolean } {
  const date = new Date(dateString);
  const now = new Date();
  const isOverdue = date < now;

  const diffMs = Math.abs(date.getTime() - now.getTime());
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 24) {
    return {
      text: date.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" }),
      isOverdue,
    };
  }

  if (diffDays < 7) {
    return {
      text: `${diffDays}d`,
      isOverdue,
    };
  }

  return {
    text: date.toLocaleDateString("es-CL", { day: "numeric", month: "short" }),
    isOverdue,
  };
}

export function LeadTaskList({ leadId, teamMembers }: LeadTaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch(`/api/dealer/leads/${leadId}/tasks`);
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks || []);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  }, [leadId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleComplete = async (taskId: string) => {
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

  const pendingTasks = tasks.filter((t) => !t.completedAt);
  const completedTasks = tasks.filter((t) => t.completedAt);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin h-6 w-6 border-2 border-andino-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Add Task Button */}
      {!showForm && (
        <Button
          variant="outline"
          onClick={() => setShowForm(true)}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Tarea
        </Button>
      )}

      {/* Task Form */}
      {showForm && (
        <LeadTaskForm
          leadId={leadId}
          teamMembers={teamMembers}
          onTaskCreated={() => {
            setShowForm(false);
            fetchTasks();
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Pending Tasks */}
      {pendingTasks.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">
            Pendientes ({pendingTasks.length})
          </h4>
          <ul className="space-y-2">
            {pendingTasks.map((task) => {
              const { text: dueText, isOverdue } = formatDueDate(task.dueAt);
              return (
                <li
                  key={task.id}
                  className="flex items-start gap-3 p-3 bg-white rounded-lg border border-neutral-200"
                >
                  <button
                    onClick={() => handleComplete(task.id)}
                    className="mt-0.5 w-5 h-5 rounded-full border-2 border-neutral-300 hover:border-andino-500 hover:bg-andino-50 transition-colors flex-shrink-0"
                    title="Marcar completada"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900">
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-xs text-neutral-500 mt-0.5">
                        {task.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs">
                      <span
                        className={cn(
                          "flex items-center gap-1",
                          isOverdue ? "text-red-600" : "text-neutral-500"
                        )}
                      >
                        <Clock className="h-3 w-3" />
                        {isOverdue && "Vencida: "}
                        {dueText}
                      </span>
                      <span className="flex items-center gap-1 text-neutral-500">
                        <User className="h-3 w-3" />
                        {task.assignedTo.name?.split(" ")[0]}
                      </span>
                      <span className={cn("flex items-center gap-1", PRIORITY_COLORS[task.priority])}>
                        <Flag className="h-3 w-3" />
                        {task.priority === "HIGH" ? "Alta" : task.priority === "MEDIUM" ? "Media" : "Baja"}
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">
            Completadas ({completedTasks.length})
          </h4>
          <ul className="space-y-2">
            {completedTasks.map((task) => (
              <li
                key={task.id}
                className="flex items-start gap-3 p-3 bg-neutral-50 rounded-lg border border-neutral-100"
              >
                <div className="mt-0.5 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                  <Check className="h-3 w-3 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-neutral-500 line-through">
                    {task.title}
                  </p>
                  <p className="text-xs text-neutral-400 mt-1">
                    Completada el{" "}
                    {new Date(task.completedAt!).toLocaleDateString("es-CL")}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Empty State */}
      {tasks.length === 0 && !showForm && (
        <div className="text-center py-8 text-sm text-neutral-500">
          No hay tareas para este lead
        </div>
      )}
    </div>
  );
}
