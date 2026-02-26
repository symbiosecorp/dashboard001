"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ADMIN_PASSWORD, setSession, getProjectByClientId } from "@/lib/store";
import { ShieldCheck, User, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [modal, setModal] = useState<"admin" | "client" | null>(null);
  const [adminPassword, setAdminPassword] = useState("");
  const [clientId, setClientId] = useState("");
  const [error, setError] = useState("");

  function handleAdminLogin() {
    if (adminPassword === ADMIN_PASSWORD) {
      setSession({ role: "admin" });
      router.push("/admin");
    } else {
      setError("Contraseña incorrecta.");
    }
  }

  function handleClientLogin() {
    const project = getProjectByClientId(clientId.trim());
    if (!project) {
      setError("ID de cliente no encontrado.");
      return;
    }
    setSession({ role: "client", clientId: clientId.trim() });
    router.push("/client");
  }

  function openModal(role: "admin" | "client") {
    setModal(role);
    setError("");
    setAdminPassword("");
    setClientId("");
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-6">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-white tracking-tight">Project Dashboard</h1>
        <p className="mt-3 text-zinc-400 text-lg">Selecciona cómo quieres acceder</p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 w-full max-w-2xl">
        <Card
          className="cursor-pointer border-2 border-transparent hover:border-indigo-500 transition-all duration-200 bg-zinc-800/60 backdrop-blur text-white hover:shadow-2xl hover:shadow-indigo-500/20 group"
          onClick={() => openModal("admin")}
        >
          <CardHeader className="flex flex-col items-center gap-3 pt-8">
            <div className="p-4 rounded-full bg-indigo-600/20 group-hover:bg-indigo-600/40 transition-colors">
              <ShieldCheck className="w-10 h-10 text-indigo-400" />
            </div>
            <CardTitle className="text-2xl text-white">Administrador</CardTitle>
            <CardDescription className="text-zinc-400 text-center">
              Gestiona proyectos, asigna deadlines y monitorea el progreso de cada cliente.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-8">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white w-full max-w-[200px]">
              Entrar como Admin
            </Button>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer border-2 border-transparent hover:border-cyan-500 transition-all duration-200 bg-zinc-800/60 backdrop-blur text-white hover:shadow-2xl hover:shadow-cyan-500/20 group"
          onClick={() => openModal("client")}
        >
          <CardHeader className="flex flex-col items-center gap-3 pt-8">
            <div className="p-4 rounded-full bg-cyan-600/20 group-hover:bg-cyan-600/40 transition-colors">
              <User className="w-10 h-10 text-cyan-400" />
            </div>
            <CardTitle className="text-2xl text-white">Cliente</CardTitle>
            <CardDescription className="text-zinc-400 text-center">
              Consulta el estado de tu proyecto, el tiempo restante y la información general.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-8">
            <Button className="bg-cyan-600 hover:bg-cyan-700 text-white w-full max-w-[200px]">
              Ver mi Proyecto
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Admin Modal */}
      <Dialog open={modal === "admin"} onOpenChange={(o) => !o && setModal(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-700 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              Acceso Administrador
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Ingresa la contraseña de administrador para continuar.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {error && (
              <Alert className="bg-red-950/40 border-red-800 text-red-300">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label className="text-zinc-300">Contraseña</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdminLogin()}
                className="bg-zinc-800 border-zinc-600 text-white placeholder:text-zinc-500 focus-visible:ring-indigo-500"
              />
            </div>
            <Button onClick={handleAdminLogin} className="w-full bg-indigo-600 hover:bg-indigo-700">
              Ingresar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Client Modal */}
      <Dialog open={modal === "client"} onOpenChange={(o) => !o && setModal(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-700 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-cyan-400" />
              Acceso Cliente
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Ingresa tu ID de cliente para ver el estado de tu proyecto.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {error && (
              <Alert className="bg-red-950/40 border-red-800 text-red-300">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label className="text-zinc-300">ID de Cliente</Label>
              <Input
                placeholder="ej. CLI-001"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleClientLogin()}
                className="bg-zinc-800 border-zinc-600 text-white placeholder:text-zinc-500 focus-visible:ring-cyan-500"
              />
            </div>
            <Button onClick={handleClientLogin} className="w-full bg-cyan-600 hover:bg-cyan-700">
              Ver mi Proyecto
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
