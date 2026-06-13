"use client";

import { useCallback, useEffect, useState } from "react";

import { Header } from "@/components/layout/Header";
import { ActiveBadge } from "@/components/ui/Badge";
import { Card, PageContent } from "@/components/ui/Card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/contexts/LanguageContext";
import { api } from "@/lib/api";
import type { Area } from "@/types/api";

export default function AreasPage() {
  const { token, hasPermission } = useAuth();
  const { t } = useTranslation();
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAreas = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await api.get<Area[]>("/areas?include_inactive=true", token);
      setAreas(data);
    } catch {
      setError(t("areas.loadError"));
    } finally {
      setLoading(false);
    }
  }, [token, t]);

  useEffect(() => {
    if (hasPermission("areas:read")) loadAreas();
    else {
      setLoading(false);
      setError(t("areas.noPermission"));
    }
  }, [hasPermission, loadAreas, t]);

  return (
    <>
      <Header title={t("areas.title")} subtitle={t("areas.subtitle")} />
      <PageContent>
        {loading && (
          <div className="flex justify-center py-16">
            <LoadingSpinner />
          </div>
        )}
        {error && <div className="alert alert-error">{error}</div>}
        {!loading && !error && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {areas.map((area) => (
              <Card key={area.id} hover className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-slate-900">{area.name}</h3>
                    <p className="mt-1 font-mono text-xs text-slate-400">{area.code}</p>
                  </div>
                  <ActiveBadge active={area.is_active} />
                </div>
                {area.description && (
                  <p className="mt-3 text-sm leading-relaxed text-slate-500">{area.description}</p>
                )}
              </Card>
            ))}
          </div>
        )}
      </PageContent>
    </>
  );
}
