"use client";

import { useCallback, useEffect, useState } from "react";

import { Header } from "@/components/layout/Header";
import { ActiveBadge } from "@/components/ui/Badge";
import { Card, PageContent } from "@/components/ui/Card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/contexts/LanguageContext";
import { api } from "@/lib/api";
import type { Role } from "@/types/api";

export default function RolesPage() {
  const { token, hasPermission } = useAuth();
  const { t } = useTranslation();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRoles = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await api.get<Role[]>("/roles?include_inactive=true", token);
      setRoles(data);
    } catch {
      setError(t("roles.loadError"));
    } finally {
      setLoading(false);
    }
  }, [token, t]);

  useEffect(() => {
    if (hasPermission("roles:read")) loadRoles();
    else {
      setLoading(false);
      setError(t("roles.noPermission"));
    }
  }, [hasPermission, loadRoles, t]);

  return (
    <>
      <Header title={t("roles.title")} subtitle={t("roles.subtitle")} />
      <PageContent>
        {loading && (
          <div className="flex justify-center py-16">
            <LoadingSpinner />
          </div>
        )}
        {error && <div className="alert alert-error">{error}</div>}
        {!loading && !error && (
          <div className="space-y-4">
            {roles.map((role) => (
              <Card key={role.id} className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-slate-900">{role.name}</h3>
                    <p className="font-mono text-xs text-slate-400">{role.code}</p>
                  </div>
                  <ActiveBadge active={role.is_active} />
                </div>
                {role.description && (
                  <p className="mt-2 text-sm text-slate-500">{role.description}</p>
                )}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {role.permissions.map((perm) => (
                    <span key={perm.id} className="rounded-lg bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-100">
                      {perm.code}
                    </span>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}
      </PageContent>
    </>
  );
}
