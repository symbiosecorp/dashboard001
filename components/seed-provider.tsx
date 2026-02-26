"use client";

import { useEffect } from "react";
import { seedDemoData } from "@/lib/seed";

export function SeedProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    seedDemoData();
  }, []);

  return <>{children}</>;
}
