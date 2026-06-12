"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { Sidebar } from "@/components/layout/Sidebar";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useAuth } from "@/contexts/AuthContext";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role.code === "CLIENT") {
      router.replace("/portal");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role.code === "CLIENT") {
    return (
      <div className="flex min-h-screen items-center justify-center app-shell-bg">
        <LoadingSpinner label="Cargando..." />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen app-shell-bg">
      <Sidebar />
      <main className="flex min-w-0 flex-1 flex-col">{children}</main>
    </div>
  );
}
