import { getProjects, saveProjects, type Project } from "./store";

const now = Date.now();
const d = (days: number) => new Date(now + days * 86400000).toISOString();

const DEMO_PROJECTS: Project[] = [
  {
    id: "proj-1",
    name: "Rediseño Web Corporativo",
    description: "Modernización completa del sitio con nuevo branding, sistema de diseño y mejoras de UX.",
    clientName: "Carlos Mendoza",
    clientId: "CLI-001",
    deadline: d(2),
    status: "active",
    notes: "Entrega incluye: homepage, about, contacto y 3 páginas internas. Revisar paleta de colores antes de presentar.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "proj-2",
    name: "App Mobile E-commerce",
    description: "Desarrollo de aplicación iOS y Android para tienda en línea con carrito, pagos y notificaciones push.",
    clientName: "Sofía Ramírez",
    clientId: "CLI-002",
    deadline: d(18),
    status: "active",
    notes: "Sprint 1 completado (autenticación, catálogo). Sprint 2 en progreso: carrito y checkout.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "proj-3",
    name: "Sistema de Facturación CFDI",
    description: "Integración con SAT para generación y timbrado de CFDI 4.0, descarga y envío automático por email.",
    clientName: "Luis Torres",
    clientId: "CLI-003",
    deadline: d(5),
    status: "active",
    notes: "Pendiente: validaciones fiscales y certificados. El cliente debe enviar su CSD actualizado.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "proj-4",
    name: "Dashboard Analytics en Tiempo Real",
    description: "Panel de métricas con gráficas interactivas, exportación a Excel y alertas automáticas.",
    clientName: "Ana Flores",
    clientId: "CLI-004",
    deadline: d(-1),
    status: "active",
    notes: "⚠️ Revisión urgente requerida. Pendiente integración con API de Google Analytics 4.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "proj-5",
    name: "Plataforma de Cursos Online",
    description: "LMS con video streaming, evaluaciones, certificados digitales y panel de progreso por alumno.",
    clientName: "Mariana Vega",
    clientId: "CLI-005",
    deadline: d(30),
    status: "active",
    notes: "Contenido del primer módulo listo. Esperando grabaciones de video del cliente.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "proj-6",
    name: "CRM para Agencia Inmobiliaria",
    description: "Sistema de gestión de clientes, propiedades, seguimiento de ventas y reportes automáticos.",
    clientName: "Roberto Salinas",
    clientId: "CLI-006",
    deadline: d(-0.5),
    status: "active",
    notes: "Entrega final. Subir a servidor de producción antes de las 6pm.",
    createdAt: new Date().toISOString(),
  },
];

export function seedDemoData() {
  if (typeof window === "undefined") return;
  const existing = getProjects();
  if (existing.length === 0) {
    saveProjects(DEMO_PROJECTS);
  }
}
