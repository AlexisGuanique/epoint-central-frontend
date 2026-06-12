"use client";

import { ReactNode } from "react";

import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/Button";

export function Header({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  const { logout, user } = useAuth();
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/80 px-6 py-4 backdrop-blur-md lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 lg:text-2xl">{title}</h1>
          {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3">
          {actions}
          <LanguageSwitcher compact />
          {user && (
            <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 sm:flex">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-medium text-slate-600">{user.role.name}</span>
            </div>
          )}
          <Button variant="secondary" size="sm" onClick={logout}>
            {t("common.logout")}
          </Button>
        </div>
      </div>
    </header>
  );
}
