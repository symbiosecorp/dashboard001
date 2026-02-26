export interface Project {
  id: string;
  name: string;
  description: string;
  clientName: string;
  clientId: string;
  deadline: string; // ISO date string
  status: "active" | "completed" | "paused";
  notes: string;
  createdAt: string;
}

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

export const colorStyles: Record<DeadlineColor, { bg: string; border: string; badge: string; text: string; ring: string }> = {
  green: {
    bg: "bg-emerald-50 dark:bg-emerald-950/20",
    border: "border-emerald-300 dark:border-emerald-700",
    badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
    text: "text-emerald-700 dark:text-emerald-400",
    ring: "ring-emerald-400",
  },
  yellow: {
    bg: "bg-yellow-50 dark:bg-yellow-950/20",
    border: "border-yellow-300 dark:border-yellow-700",
    badge: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    text: "text-yellow-700 dark:text-yellow-400",
    ring: "ring-yellow-400",
  },
  orange: {
    bg: "bg-orange-50 dark:bg-orange-950/20",
    border: "border-orange-300 dark:border-orange-700",
    badge: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    text: "text-orange-700 dark:text-orange-400",
    ring: "ring-orange-400",
  },
  red: {
    bg: "bg-red-50 dark:bg-red-950/20",
    border: "border-red-300 dark:border-red-700",
    badge: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    text: "text-red-700 dark:text-red-400",
    ring: "ring-red-400",
  },
  gray: {
    bg: "bg-zinc-50 dark:bg-zinc-900/20",
    border: "border-zinc-300 dark:border-zinc-700",
    badge: "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200",
    text: "text-zinc-500 dark:text-zinc-400",
    ring: "ring-zinc-400",
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
