"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  getSession,
  clearSession,
  getProjects,
  upsertProject,
  deleteProject,
  getDeadlineColor,
  colorStyles,
  type Project,
} from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  ShieldCheck,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  Clock,
  CalendarDays,
  User,
  FolderOpen,
} from "lucide-react";

const EMPTY_FORM: Omit<Project, "id" | "createdAt"> = {
  name: "",
  description: "",
  clientName: "",
  clientId: "",
  deadline: "",
  status: "active",
  notes: "",
};

function deadlineDaysLeft(deadline: string): string {
  const diffMs = new Date(deadline).getTime() - Date.now();
  if (diffMs < 0) return "Vencido";
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days === 0) return "Hoy";
  if (days === 1) return "1 día";
  return `${days} días`;
}

function statusLabel(status: Project["status"]) {
  return { active: "Activo", completed: "Completado", paused: "Pausado" }[status];
}

export default function AdminDashboard() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [form, setForm] = useState<Omit<Project, "id" | "createdAt">>(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const refresh = useCallback(() => setProjects(getProjects()), []);

  useEffect(() => {
    const session = getSession();
    if (!session || session.role !== "admin") {
      router.replace("/");
      return;
    }
    refresh();
  }, [router, refresh]);

  function handleLogout() {
    clearSession();
    router.replace("/");
  }

  function openCreate() {
    setEditingProject(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEdit(project: Project) {
    setEditingProject(project);
    setForm({
      name: project.name,
      description: project.description,
      clientName: project.clientName,
      clientId: project.clientId,
      deadline: project.deadline,
      status: project.status,
      notes: project.notes,
    });
    setModalOpen(true);
  }

  function handleSave() {
    if (!form.name || !form.clientId || !form.deadline) return;
    const project: Project = editingProject
      ? { ...editingProject, ...form }
      : {
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          ...form,
        };
    upsertProject(project);
    refresh();
    setModalOpen(false);
  }

  function handleDelete(id: string) {
    deleteProject(id);
    refresh();
    setDeleteConfirm(null);
  }

  const colorDot: Record<string, string> = {
    green: "bg-emerald-500",
    yellow: "bg-yellow-400",
    orange: "bg-orange-500",
    red: "bg-red-500",
    gray: "bg-zinc-400",
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Navbar */}
      <header className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-indigo-400" />
            <span className="font-semibold text-lg">Panel Administrador</span>
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

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Total Proyectos", value: projects.length, icon: FolderOpen, color: "text-indigo-400" },
            { label: "Activos", value: projects.filter((p) => p.status === "active").length, icon: Clock, color: "text-emerald-400" },
            { label: "Completados", value: projects.filter((p) => p.status === "completed").length, icon: CalendarDays, color: "text-cyan-400" },
            { label: "Vencidos", value: projects.filter((p) => p.deadline && getDeadlineColor(p.deadline) === "red" && p.status === "active").length, icon: Clock, color: "text-red-400" },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label} className="bg-zinc-800/50 border-zinc-700">
              <CardContent className="pt-5 pb-4 flex items-center gap-4">
                <Icon className={`w-8 h-8 ${color}`} />
                <div>
                  <p className="text-2xl font-bold text-white">{value}</p>
                  <p className="text-xs text-zinc-400">{label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Header row */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Proyectos</h2>
          <Button onClick={openCreate} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
            <Plus className="w-4 h-4" />
            Nuevo Proyecto
          </Button>
        </div>

        {/* Projects grid */}
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-zinc-500">
            <FolderOpen className="w-16 h-16 mb-4 opacity-30" />
            <p className="text-lg">No hay proyectos aún.</p>
            <p className="text-sm mt-1">Crea uno nuevo para comenzar.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {projects.map((project) => {
              const color = project.deadline ? getDeadlineColor(project.deadline) : "gray";
              const styles = colorStyles[color];
              const daysLeft = project.deadline ? deadlineDaysLeft(project.deadline) : "Sin deadline";

              return (
                <Card
                  key={project.id}
                  className={`border-2 ${styles.border} ${styles.bg} transition-all duration-200 relative overflow-hidden`}
                >
                  {/* Color strip */}
                  <div className={`absolute top-0 left-0 right-0 h-1 ${colorDot[color]}`} />

                  <CardHeader className="pb-3 pt-5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${colorDot[color]}`} />
                        <CardTitle className="text-white text-base truncate">{project.name}</CardTitle>
                      </div>
                      <Badge className={`${styles.badge} text-xs flex-shrink-0`}>
                        {statusLabel(project.status)}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3 pb-5">
                    {project.description && (
                      <p className="text-zinc-400 text-sm line-clamp-2">{project.description}</p>
                    )}

                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                      <span className="text-zinc-300">{project.clientName}</span>
                      <span className="text-zinc-600 text-xs">({project.clientId})</span>
                    </div>

                    {project.deadline && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className={`w-4 h-4 ${styles.text} flex-shrink-0`} />
                        <span className={`font-semibold ${styles.text}`}>{daysLeft}</span>
                        <span className="text-zinc-500 text-xs">
                          · {new Date(project.deadline).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" })}
                        </span>
                      </div>
                    )}

                    {project.notes && (
                      <p className="text-zinc-500 text-xs italic line-clamp-2">{project.notes}</p>
                    )}

                    <Separator className="bg-zinc-700/50" />

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEdit(project)}
                        className="flex-1 text-zinc-300 hover:text-white hover:bg-zinc-700 gap-1.5"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleteConfirm(project.id)}
                        className="flex-1 text-red-400 hover:text-red-300 hover:bg-red-950/30 gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Eliminar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* Create / Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={(o) => !o && setModalOpen(false)}>
        <DialogContent className="bg-zinc-900 border-zinc-700 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingProject ? "Editar Proyecto" : "Nuevo Proyecto"}</DialogTitle>
            <DialogDescription className="text-zinc-400">
              {editingProject ? "Modifica los datos del proyecto." : "Completa la información para crear un nuevo proyecto."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1.5">
                <Label className="text-zinc-300">Nombre del proyecto *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Rediseño web Acme Inc."
                  className="bg-zinc-800 border-zinc-600 text-white placeholder:text-zinc-500"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-zinc-300">Nombre del cliente *</Label>
                <Input
                  value={form.clientName}
                  onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                  placeholder="Juan García"
                  className="bg-zinc-800 border-zinc-600 text-white placeholder:text-zinc-500"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-zinc-300">ID del cliente *</Label>
                <Input
                  value={form.clientId}
                  onChange={(e) => setForm({ ...form, clientId: e.target.value })}
                  placeholder="CLI-001"
                  className="bg-zinc-800 border-zinc-600 text-white placeholder:text-zinc-500"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-zinc-300">Deadline *</Label>
                <Input
                  type="datetime-local"
                  value={form.deadline}
                  onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                  className="bg-zinc-800 border-zinc-600 text-white"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-zinc-300">Estado</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm({ ...form, status: v as Project["status"] })}
                >
                  <SelectTrigger className="bg-zinc-800 border-zinc-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="completed">Completado</SelectItem>
                    <SelectItem value="paused">Pausado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2 space-y-1.5">
                <Label className="text-zinc-300">Descripción</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Breve descripción del proyecto..."
                  className="bg-zinc-800 border-zinc-600 text-white placeholder:text-zinc-500 resize-none"
                  rows={2}
                />
              </div>

              <div className="col-span-2 space-y-1.5">
                <Label className="text-zinc-300">Notas internas</Label>
                <Textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Notas visibles para el cliente..."
                  className="bg-zinc-800 border-zinc-600 text-white placeholder:text-zinc-500 resize-none"
                  rows={2}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <Button
                variant="ghost"
                onClick={() => setModalOpen(false)}
                className="flex-1 text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={!form.name || !form.clientId || !form.deadline}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40"
              >
                {editingProject ? "Guardar cambios" : "Crear proyecto"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirm modal */}
      <Dialog open={!!deleteConfirm} onOpenChange={(o) => !o && setDeleteConfirm(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-700 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle>¿Eliminar proyecto?</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 pt-2">
            <Button
              variant="ghost"
              onClick={() => setDeleteConfirm(null)}
              className="flex-1 text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              Cancelar
            </Button>
            <Button
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
