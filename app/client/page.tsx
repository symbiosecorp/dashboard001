"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  getSession,
  clearSession,
  getProjectByClientId,
  getDeadlineColor,
  colorStyles,
  formatCountdown,
  type Project,
  type DeadlineColor,
} from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { LogOut, Clock, CalendarDays, User, FileText, AlertTriangle, CheckCircle2, PauseCircle } from "lucide-react";

function CountdownBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-5xl sm:text-7xl font-bold tabular-nums tracking-tight">
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-xs sm:text-sm uppercase tracking-widest opacity-60">{label}</span>
    </div>
  );
}

function Colon() {
  return <span className="text-4xl sm:text-6xl font-light opacity-40 mb-4">:</span>;
}

const statusIcon = {
  active: <Clock className="w-4 h-4" />,
  completed: <CheckCircle2 className="w-4 h-4" />,
  paused: <PauseCircle className="w-4 h-4" />,
};

const statusLabel = {
  active: "En progreso",
  completed: "Completado",
  paused: "Pausado",
};

const colorLabel: Record<DeadlineColor, string> = {
  green: "En tiempo",
  yellow: "Pronto",
  orange: "Urgente",
  red: "Crítico",
  gray: "Sin deadline",
};

export default function ClientView() {
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [color, setColor] = useState<DeadlineColor>("gray");
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: false });
  const [loading, setLoading] = useState(true);

  const refreshCountdown = useCallback((p: Project) => {
    if (p.deadline) {
      setColor(getDeadlineColor(p.deadline));
      setCountdown(formatCountdown(p.deadline));
    }
  }, []);

  useEffect(() => {
    const session = getSession();
    if (!session || session.role !== "client") {
      router.replace("/");
      return;
    }
    const found = getProjectByClientId(session.clientId);
    if (!found) {
      router.replace("/");
      return;
    }
    setProject(found);
    refreshCountdown(found);
    setLoading(false);
  }, [router, refreshCountdown]);

  // Live countdown ticker
  useEffect(() => {
    if (!project?.deadline) return;
    const interval = setInterval(() => {
      refreshCountdown(project);
    }, 1000);
    return () => clearInterval(interval);
  }, [project, refreshCountdown]);

  function handleLogout() {
    clearSession();
    router.replace("/");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!project) return null;

  const styles = colorStyles[color];
  const hasDead = !!project.deadline;

  const bgGradient: Record<DeadlineColor, string> = {
    green: "from-emerald-950 via-zinc-950 to-zinc-950",
    yellow: "from-yellow-950 via-zinc-950 to-zinc-950",
    orange: "from-orange-950 via-zinc-950 to-zinc-950",
    red: "from-red-950 via-zinc-950 to-zinc-950",
    gray: "from-zinc-800 via-zinc-950 to-zinc-950",
  };

  const accentColor: Record<DeadlineColor, string> = {
    green: "text-emerald-400",
    yellow: "text-yellow-400",
    orange: "text-orange-400",
    red: "text-red-400",
    gray: "text-zinc-400",
  };

  const ringColor: Record<DeadlineColor, string> = {
    green: "ring-emerald-500/30",
    yellow: "ring-yellow-500/30",
    orange: "ring-orange-500/30",
    red: "ring-red-500/30",
    gray: "ring-zinc-500/30",
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${bgGradient[color]} text-white`}>
      {/* Navbar */}
      <header className="border-b border-zinc-800 bg-zinc-900/60 backdrop-blur sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-cyan-400" />
            <span className="font-medium text-zinc-300">{project.clientName}</span>
          </div>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="text-zinc-400 hover:text-white hover:bg-zinc-800 gap-2"
          >
            <LogOut className="w-4 h-4" />
            Salir
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 flex flex-col items-center gap-10">
        {/* Project header */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <h1 className="text-3xl sm:text-4xl font-bold text-white">{project.name}</h1>
            <Badge className={`${styles.badge} text-sm`}>
              <span className="flex items-center gap-1.5">
                {statusIcon[project.status]}
                {statusLabel[project.status]}
              </span>
            </Badge>
          </div>
          {project.description && (
            <p className="text-zinc-400 max-w-lg text-base">{project.description}</p>
          )}
        </div>

        {/* Countdown section */}
        {hasDead && (
          <div className={`w-full max-w-2xl rounded-2xl border-2 ${styles.border} bg-zinc-900/60 backdrop-blur p-8 sm:p-12 ring-4 ${ringColor[color]} shadow-2xl`}>
            {countdown.expired ? (
              <div className="flex flex-col items-center gap-4">
                <AlertTriangle className={`w-16 h-16 ${accentColor[color]}`} />
                <p className={`text-3xl font-bold ${accentColor[color]}`}>Deadline vencido</p>
                <p className="text-zinc-500 text-sm">
                  Venció el {new Date(project.deadline).toLocaleString("es-MX")}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${accentColor[color].replace("text-", "bg-")} animate-pulse`} />
                  <span className={`text-sm font-medium uppercase tracking-widest ${accentColor[color]}`}>
                    {colorLabel[color]} · Tiempo restante
                  </span>
                </div>
                <div className="flex items-end gap-3 sm:gap-5">
                  <CountdownBlock value={countdown.days} label="días" />
                  <Colon />
                  <CountdownBlock value={countdown.hours} label="horas" />
                  <Colon />
                  <CountdownBlock value={countdown.minutes} label="min" />
                  <Colon />
                  <CountdownBlock value={countdown.seconds} label="seg" />
                </div>
                <p className="text-zinc-500 text-xs mt-2">
                  Deadline: {new Date(project.deadline).toLocaleString("es-MX", {
                    weekday: "long",
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Info cards */}
        <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Client info */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-zinc-400 text-sm font-medium uppercase tracking-wider">
              <User className="w-4 h-4" />
              Cliente
            </div>
            <Separator className="bg-zinc-800" />
            <div className="space-y-1">
              <p className="text-white font-medium">{project.clientName}</p>
              <p className="text-zinc-500 text-sm">ID: {project.clientId}</p>
            </div>
          </div>

          {/* Deadline info */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-zinc-400 text-sm font-medium uppercase tracking-wider">
              <CalendarDays className="w-4 h-4" />
              Fecha límite
            </div>
            <Separator className="bg-zinc-800" />
            {hasDead ? (
              <div className="space-y-1">
                <p className={`font-semibold ${accentColor[color]}`}>{colorLabel[color]}</p>
                <p className="text-zinc-400 text-sm">
                  {new Date(project.deadline).toLocaleDateString("es-MX", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            ) : (
              <p className="text-zinc-500 text-sm">Sin deadline asignado</p>
            )}
          </div>

          {/* Notes */}
          {project.notes && (
            <div className="sm:col-span-2 bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-zinc-400 text-sm font-medium uppercase tracking-wider">
                <FileText className="w-4 h-4" />
                Notas del proyecto
              </div>
              <Separator className="bg-zinc-800" />
              <p className="text-zinc-300 text-sm leading-relaxed">{project.notes}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
