"use client";

import { translateStatus } from "@/i18n";
import { useTranslation } from "@/contexts/LanguageContext";

const statusBadgeClass: Record<string, string> = {
  PENDIENTE_DE_REVISION: "badge-amber",
  RECHAZADO: "badge-red",
  APROBADO_PARA_ONBOARDING: "badge-green",
  EN_CARGA_DATOS: "badge-blue",
  DOCUMENTOS_EN_REVISION: "badge-blue",
  LISTO_PARA_TABLERO: "badge-green",
  ONBOARDING_EN_PROGRESO: "badge-blue",
  ONBOARDING_COMPLETADO: "badge-green",
  INACTIVO: "badge-slate",
};

export function StatusBadge({ status }: { status: string }) {
  const { locale } = useTranslation();
  const cls = statusBadgeClass[status] ?? "badge-slate";
  const label = translateStatus(locale, "clientStatus", status);
  return <span className={`badge ${cls}`}>{label}</span>;
}

export function ActiveBadge({ active }: { active: boolean }) {
  const { t } = useTranslation();
  return (
    <span className={`badge ${active ? "badge-green" : "badge-slate"}`}>
      {active ? t("common.active") : t("common.inactive")}
    </span>
  );
}

export function TaskStatusBadge({ status }: { status: string }) {
  const { locale } = useTranslation();
  const label = translateStatus(locale, "taskStatus", status);
  const statusBadge: Record<string, string> = {
    PENDIENTE: "badge-slate",
    EN_PROGRESO: "badge-blue",
    EN_REVISION: "badge-amber",
    COMPLETADA: "badge-green",
  };
  return <span className={`badge ${statusBadge[status] ?? "badge-slate"}`}>{label}</span>;
}

export function VerificationBadge({ status }: { status: string }) {
  const { locale } = useTranslation();
  const label = translateStatus(locale, "verificationStatus", status);
  const verificationBadge: Record<string, string> = {
    PENDING: "badge-amber",
    APPROVED: "badge-green",
    REJECTED: "badge-red",
    MANUAL_REVIEW: "badge-blue",
  };
  return <span className={`badge ${verificationBadge[status] ?? "badge-slate"}`}>{label}</span>;
}
