"use client";

import { useCallback, useEffect, useState } from "react";

import { Header } from "@/components/layout/Header";
import { ActiveBadge } from "@/components/ui/Badge";
import { Card, PageContent } from "@/components/ui/Card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/contexts/LanguageContext";
import { api } from "@/lib/api";
import type { Paginated, User } from "@/types/api";

export default function UsuariosPage() {
  const { token, hasPermission } = useAuth();
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadUsers = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await api.get<Paginated<User>>("/users", token);
      setUsers(data.items);
    } catch {
      setError(t("users.loadError"));
    } finally {
      setLoading(false);
    }
  }, [token, t]);

  useEffect(() => {
    if (hasPermission("users:read")) loadUsers();
    else {
      setLoading(false);
      setError(t("users.noPermission"));
    }
  }, [hasPermission, loadUsers, t]);

  return (
    <>
      <Header title={t("users.title")} subtitle={t("users.subtitle")} />
      <PageContent>
        {loading && (
          <div className="flex justify-center py-16">
            <LoadingSpinner />
          </div>
        )}
        {error && <div className="alert alert-error">{error}</div>}
        {!loading && !error && (
          <>
            <div className="space-y-3 md:hidden">
              {users.map((user) => (
                <Card key={user.id} className="p-4">
                  <p className="font-semibold text-slate-800">
                    {user.first_name} {user.last_name}
                  </p>
                  <p className="mt-1 break-all text-sm text-slate-500">{user.email}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="badge badge-blue">{user.role.name}</span>
                    <span className="text-sm text-slate-600">{user.area?.name ?? t("common.dash")}</span>
                    <ActiveBadge active={user.is_active} />
                  </div>
                </Card>
              ))}
            </div>

            <div className="hidden md:block table-wrap">
            <table className="table-modern">
              <thead>
                <tr>
                  <th>{t("common.name")}</th>
                  <th>{t("common.email")}</th>
                  <th>{t("common.role")}</th>
                  <th>{t("common.area")}</th>
                  <th>{t("common.status")}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="font-semibold text-slate-800">
                      {user.first_name} {user.last_name}
                    </td>
                    <td className="text-slate-500">{user.email}</td>
                    <td>
                      <span className="badge badge-blue">{user.role.name}</span>
                    </td>
                    <td>{user.area?.name ?? t("common.dash")}</td>
                    <td><ActiveBadge active={user.is_active} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </>
        )}
      </PageContent>
    </>
  );
}
