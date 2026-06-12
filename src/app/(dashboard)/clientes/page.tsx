"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";

import { Header } from "@/components/layout/Header";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, PageContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useAuth } from "@/contexts/AuthContext";
import { useModal } from "@/contexts/ModalContext";
import { useTranslation } from "@/contexts/LanguageContext";
import { formatClientConflict, useClientAvailabilityCheck } from "@/hooks/useClientAvailabilityCheck";
import { useClientWorkflow } from "@/hooks/useClientWorkflow";
import { ApiError, api, isUnauthorizedError } from "@/lib/api";
import type { Client, Paginated } from "@/types/api";

export default function ClientesPage() {
  const { token, hasPermission, isLoading: authLoading } = useAuth();
  const { t } = useTranslation();
  const modal = useModal();
  const { approveClient, rejectClient, resubmitClient } = useClientWorkflow(token);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", phone: "" });
  const [submitting, setSubmitting] = useState(false);
  const { availability, checking, hasConflict } = useClientAvailabilityCheck(
    token,
    form.email,
    form.phone,
    { enabled: showForm },
  );

  const emailError = availability?.email
    ? formatClientConflict(t, "email", availability.email)
    : undefined;
  const phoneError = availability?.phone
    ? formatClientConflict(t, "phone", availability.phone)
    : undefined;

  const load = useCallback(async () => {
    if (authLoading || !token) return;
    setLoading(true);
    try {
      const data = await api.get<Paginated<Client>>("/clients", token);
      setClients(data.items);
    } catch (err) {
      if (!isUnauthorizedError(err)) {
        throw err;
      }
    } finally {
      setLoading(false);
    }
  }, [authLoading, token]);

  useEffect(() => {
    void load().catch(() => {});
  }, [load]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!token || hasConflict) return;
    setSubmitting(true);
    try {
      await api.post("/clients", form, token);
      setShowForm(false);
      setForm({ first_name: "", last_name: "", email: "", phone: "" });
      await load();
    } catch (err) {
      await modal.alert({
        title: t("common.error"),
        message: err instanceof ApiError ? err.message : t("common.error"),
        variant: "error",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Header
        title={t("clients.title")}
        subtitle={t("clients.subtitle")}
        actions={
          hasPermission("clients:create") ? (
            <Button size="sm" onClick={() => setShowForm(!showForm)}>
              {showForm ? t("common.cancel") : t("clients.register")}
            </Button>
          ) : undefined
        }
      />
      <PageContent>
        {showForm && (
          <Card className="mb-6 p-6">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-400">
              {t("clients.newClient")}
            </h3>
            <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2">
              <Input label={t("common.firstName")} required value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} placeholder="Juan" />
              <Input label={t("common.lastName")} required value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} placeholder="Pérez" />
              <Input label={t("common.email")} type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="cliente@email.com" error={emailError} />
              <Input label={t("common.phone")} required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="1131432490" error={phoneError} />
              <div className="sm:col-span-2 flex flex-wrap items-center gap-3">
                {checking && (
                  <p className="text-xs text-slate-400">{t("clients.checkingAvailability")}</p>
                )}
                <Button type="submit" disabled={submitting || checking || hasConflict}>
                  {submitting ? t("common.loading") : t("clients.saveClient")}
                </Button>
              </div>
            </form>
          </Card>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner label={t("clients.loading")} />
          </div>
        ) : (
          <div className="table-wrap">
            <table className="table-modern">
              <thead>
                <tr>
                  <th>{t("common.client")}</th>
                  <th>{t("common.email")}</th>
                  <th>{t("common.status")}</th>
                  <th>{t("common.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((c) => {
                  const name = `${c.first_name} ${c.last_name}`;
                  return (
                    <tr key={c.id}>
                      <td>
                        <Link href={`/clientes/${c.id}`} className="font-semibold text-blue-600 hover:text-blue-800 hover:underline">
                          {name}
                        </Link>
                      </td>
                      <td className="text-slate-500">{c.email}</td>
                      <td><StatusBadge status={c.status} /></td>
                      <td>
                        <div className="flex flex-wrap gap-2">
                          <Link href={`/clientes/${c.id}`} className="btn btn-secondary btn-sm">
                            {t("common.view")}
                          </Link>
                          {c.status === "PENDIENTE_DE_REVISION" && hasPermission("clients:approve") && (
                            <>
                              <button type="button" onClick={async () => { if (await approveClient(c.id, name)) load(); }} className="btn btn-primary btn-sm">{t("clients.approve")}</button>
                              <button type="button" onClick={async () => { if (await rejectClient(c.id, name)) load(); }} className="btn btn-danger btn-sm">{t("clients.reject")}</button>
                            </>
                          )}
                          {c.status === "RECHAZADO" && hasPermission("clients:update") && (
                            <button type="button" onClick={async () => { if (await resubmitClient(c.id, name)) load(); }} className="btn btn-secondary btn-sm">
                              {t("clients.resubmit")}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {clients.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-400">
                      {t("clients.empty")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </PageContent>
    </>
  );
}
