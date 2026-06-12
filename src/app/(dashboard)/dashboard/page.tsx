"use client";

import Link from "next/link";

import { Header } from "@/components/layout/Header";
import { Card, PageContent } from "@/components/ui/Card";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/contexts/LanguageContext";

export default function DashboardPage() {
  const { user } = useAuth();
  const { t } = useTranslation();

  return (
    <>
      <Header
        title={t("dashboard.greeting", { name: user?.first_name ?? "" })}
        subtitle={t("dashboard.subtitle")}
      />
      <PageContent>
        <Card hover className="p-6 lg:p-8">
          <div className="flex items-start gap-4">
            <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25 sm:flex">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{t("dashboard.summaryTitle")}</h2>
              <p className="mt-2 max-w-2xl leading-relaxed text-slate-600">{t("dashboard.summaryBody")}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/clientes" className="btn btn-primary btn-sm">
                  {t("dashboard.viewClients")}
                </Link>
                <Link href="/notificaciones" className="btn btn-secondary btn-sm">
                  {t("nav.notifications")}
                </Link>
              </div>
            </div>
          </div>
        </Card>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard title={t("dashboard.yourRole")} value={user?.role.name ?? t("common.dash")} accent="blue" />
          <StatCard title={t("dashboard.yourArea")} value={user?.area?.name ?? t("common.noArea")} accent="indigo" />
          <StatCard
            title={t("dashboard.yourStatus")}
            value={user?.is_active ? t("common.active") : t("common.inactive")}
            accent={user?.is_active ? "green" : "slate"}
          />
        </div>
      </PageContent>
    </>
  );
}

function StatCard({
  title,
  value,
  accent = "blue",
}: {
  title: string;
  value: string;
  accent?: "blue" | "indigo" | "green" | "slate";
}) {
  const accentColors = {
    blue: "from-blue-500 to-blue-600",
    indigo: "from-indigo-500 to-indigo-600",
    green: "from-emerald-500 to-emerald-600",
    slate: "from-slate-400 to-slate-500",
  };

  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
          <p className="mt-2 text-xl font-bold text-slate-900">{value}</p>
        </div>
        <div className={`h-2 w-2 rounded-full bg-gradient-to-r ${accentColors[accent]}`} />
      </div>
    </div>
  );
}
