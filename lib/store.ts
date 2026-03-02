export interface Project {
  id: string;
  name: string;
  description: string;
  clientName: string;
  clientId: string;
  deadline: string; // ISO date string
  status: "active" | "completed" | "paused";
  clientViewColorOverride?: ClientViewColorOverride;
  notes: string;
  createdAt: string;
}

export type ClientViewColorOverride = "green" | "yellow" | "red";
export type DeadlineColor = "green" | "yellow" | "orange" | "red" | "gray";

export function getDeadlineColor(deadline: string): DeadlineColor {
  const now = new Date();
  const end = new Date(deadline);
  const diffMs = end.getTime() - now.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffMs < 0) return "red";
  if (diffDays <= 1) return "red";
  if (diffDays <= 3) return "orange";
  if (diffDays <= 7) return "yellow";
  return "green";
}

export function getProjectDisplayColor(project: Pick<Project, "deadline" | "clientViewColorOverride">): DeadlineColor {
  if (project.clientViewColorOverride) return project.clientViewColorOverride;
  if (!project.deadline) return "gray";
  return getDeadlineColor(project.deadline);
}

export const colorStyles: Record<DeadlineColor, { bg: string; border: string; badge: string; text: string; ring: string }> = {
  green: {
    bg: "bg-emerald-950/30",
    border: "border-emerald-500/45",
    badge: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/35",
    text: "text-emerald-300",
    ring: "ring-emerald-500/30",
  },
  yellow: {
    bg: "bg-yellow-950/25",
    border: "border-yellow-500/45",
    badge: "bg-yellow-500/15 text-yellow-300 border border-yellow-500/35",
    text: "text-yellow-300",
    ring: "ring-yellow-500/30",
  },
  orange: {
    bg: "bg-orange-950/25",
    border: "border-orange-500/45",
    badge: "bg-orange-500/15 text-orange-300 border border-orange-500/35",
    text: "text-orange-300",
    ring: "ring-orange-500/30",
  },
  red: {
    bg: "bg-red-950/25",
    border: "border-red-500/45",
    badge: "bg-red-500/15 text-red-300 border border-red-500/35",
    text: "text-red-300",
    ring: "ring-red-500/30",
  },
  gray: {
    bg: "bg-zinc-900/70",
    border: "border-zinc-600/70",
    badge: "bg-zinc-800 text-zinc-200 border border-zinc-600/70",
    text: "text-zinc-300",
    ring: "ring-zinc-500/30",
  },
};

const STORAGE_KEY = "dashboard_projects";
const SESSION_KEY = "dashboard_session";

export function getProjects(): Project[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Project[];
  } catch {
    return [];
  }
}

export function saveProjects(projects: Project[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function getProjectById(id: string): Project | undefined {
  return getProjects().find((p) => p.id === id);
}

export function getProjectByClientId(clientId: string): Project | undefined {
  return getProjects().find((p) => p.clientId === clientId);
}

export function upsertProject(project: Project): void {
  const projects = getProjects();
  const idx = projects.findIndex((p) => p.id === project.id);
  if (idx >= 0) {
    projects[idx] = project;
  } else {
    projects.push(project);
  }
  saveProjects(projects);
}

export function deleteProject(id: string): void {
  const projects = getProjects().filter((p) => p.id !== id);
  saveProjects(projects);
}

export type Session = { role: "admin" } | { role: "client"; clientId: string };

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export function setSession(session: Session): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(SESSION_KEY);
}

export const ADMIN_PASSWORD = "admin123";

export function formatCountdown(deadline: string): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
} {
  const now = new Date();
  const end = new Date(deadline);
  const diffMs = end.getTime() - now.getTime();

  if (diffMs <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, expired: false };
}
