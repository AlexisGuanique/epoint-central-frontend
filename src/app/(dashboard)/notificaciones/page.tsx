"use client";

import { useEffect, useState } from "react";

import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Card, PageContent } from "@/components/ui/Card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/contexts/LanguageContext";
import { api } from "@/lib/api";
import type { Notification, Paginated } from "@/types/api";

export default function NotificacionesPage() {
  const { token } = useAuth();
  const { t, locale } = useTranslation();
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    api
      .get<Paginated<Notification>>("/notifications", token)
      .then((d) => setItems(d.items))
      .finally(() => setLoading(false));
  }, [token]);

  async function markRead(ids: number[]) {
    if (!token) return;
    await api.post("/notifications/mark-read", { notification_ids: ids }, token);
    setItems((prev) =>
      prev.map((n) => (ids.includes(n.id) ? { ...n, read_at: new Date().toISOString() } : n)),
    );
  }

  const dateLocale = locale === "en" ? "en-US" : "es-AR";

  return (
    <>
      <Header title={t("notifications.title")} subtitle={t("notifications.subtitle")} />
      <PageContent>
        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="space-y-3">
            {items.length === 0 && (
              <Card className="p-12 text-center text-slate-400">{t("notifications.empty")}</Card>
            )}
            {items.map((n) => (
              <Card
                key={n.id}
                className={`p-5 transition-all ${!n.read_at ? "ring-2 ring-blue-100" : ""}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      {!n.read_at && <span className="h-2 w-2 rounded-full bg-blue-500" />}
                      <p className="font-semibold text-slate-900">{n.title}</p>
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{n.body}</p>
                    <p className="mt-2 text-xs text-slate-400">
                      {new Date(n.created_at).toLocaleString(dateLocale)}
                    </p>
                  </div>
                  {!n.read_at && (
                    <Button variant="ghost" size="sm" onClick={() => markRead([n.id])}>
                      {t("notifications.markRead")}
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </PageContent>
    </>
  );
}
