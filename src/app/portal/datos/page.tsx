"use client";

import { FormEvent, useEffect, useState } from "react";

import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Card, PageContent } from "@/components/ui/Card";
import { Input, PasswordInput } from "@/components/ui/Input";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/contexts/LanguageContext";
import { api } from "@/lib/api";
import type { Client } from "@/types/api";

export default function PortalDatosPage() {
  const { token } = useAuth();
  const { t } = useTranslation();
  const [client, setClient] = useState<Client | null>(null);
  const [message, setMessage] = useState("");
  const [ssn, setSsn] = useState("");
  const [dob, setDob] = useState("");
  const [addr, setAddr] = useState({
    street: "",
    city: "",
    state: "",
    zip_code: "",
    residence_since_month: "",
    residence_since_year: "",
  });
  const [vehicle, setVehicle] = useState({ model: "", year: "", color: "" });

  useEffect(() => {
    if (!token) return;
    api.get<Client>("/portal/me", token).then((c) => {
      setClient(c);
      if (c.date_of_birth) setDob(c.date_of_birth);
      const a = c.addresses?.find((x) => x.type === "CURRENT");
      if (a) {
        setAddr({
          street: a.street,
          city: a.city,
          state: a.state,
          zip_code: a.zip_code,
          residence_since_month: String(a.residence_since_month ?? ""),
          residence_since_year: String(a.residence_since_year ?? ""),
        });
      }
      const v = c.vehicles?.find((x) => x.order === 1);
      if (v) setVehicle({ model: v.model, year: String(v.year), color: v.color });
    });
  }, [token]);

  async function saveProfile(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    await api.patch("/portal/profile", { ssn, date_of_birth: dob }, token);
    setMessage(t("portalData.profileUpdated"));
  }

  async function saveAddress(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    await api.post(
      "/portal/addresses",
      {
        type: "CURRENT",
        ...addr,
        residence_since_month: addr.residence_since_month ? Number(addr.residence_since_month) : null,
        residence_since_year: addr.residence_since_year ? Number(addr.residence_since_year) : null,
      },
      token,
    );
    setMessage(t("portalData.addressSaved"));
  }

  async function saveVehicle(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    await api.post(
      "/portal/vehicles",
      { order: 1, model: vehicle.model, year: Number(vehicle.year), color: vehicle.color },
      token,
    );
    setMessage(t("portalData.vehicleSaved"));
  }

  return (
    <>
      <Header title={t("portalData.title")} subtitle={t("portalData.subtitle")} />
      <PageContent className="space-y-6">
        {message && <div className="alert alert-success">{message}</div>}

        <Card className="p-6">
          <h2 className="mb-5 text-sm font-bold uppercase tracking-wider text-slate-400">{t("portalData.basicData")}</h2>
          <form onSubmit={saveProfile} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <PasswordInput
                label={t("portalData.ssn")}
                value={ssn}
                onChange={(e) => setSsn(e.target.value)}
                placeholder={client?.has_ssn ? t("portalData.ssnMasked") : t("portalData.ssnPlaceholder")}
                showLabel={t("login.showPassword")}
                hideLabel={t("login.hidePassword")}
              />
              <Input
                label={t("portalData.dateOfBirth")}
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
              />
            </div>
            <Button type="submit">{t("portalData.saveProfile")}</Button>
          </form>
        </Card>

        <Card className="p-6">
          <h2 className="mb-5 text-sm font-bold uppercase tracking-wider text-slate-400">{t("portalData.currentAddress")}</h2>
          <form onSubmit={saveAddress} className="space-y-4">
            <Input
              label={t("portalData.street")}
              value={addr.street}
              onChange={(e) => setAddr({ ...addr, street: e.target.value })}
              placeholder={t("portalData.streetPlaceholder")}
            />
            <div className="grid gap-4 sm:grid-cols-3">
              <Input label={t("portalData.city")} value={addr.city} onChange={(e) => setAddr({ ...addr, city: e.target.value })} />
              <Input label={t("portalData.state")} value={addr.state} onChange={(e) => setAddr({ ...addr, state: e.target.value })} />
              <Input label={t("portalData.zip")} value={addr.zip_code} onChange={(e) => setAddr({ ...addr, zip_code: e.target.value })} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label={t("portalData.monthSince")}
                value={addr.residence_since_month}
                onChange={(e) => setAddr({ ...addr, residence_since_month: e.target.value })}
                placeholder={t("portalData.monthPlaceholder")}
              />
              <Input
                label={t("portalData.yearSince")}
                value={addr.residence_since_year}
                onChange={(e) => setAddr({ ...addr, residence_since_year: e.target.value })}
                placeholder={t("portalData.yearPlaceholder")}
              />
            </div>
            <Button type="submit">{t("portalData.saveAddress")}</Button>
          </form>
        </Card>

        <Card className="p-6">
          <h2 className="mb-5 text-sm font-bold uppercase tracking-wider text-slate-400">{t("portalData.mainVehicle")}</h2>
          <form onSubmit={saveVehicle} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <Input label={t("portalData.model")} value={vehicle.model} onChange={(e) => setVehicle({ ...vehicle, model: e.target.value })} />
              <Input label={t("portalData.year")} value={vehicle.year} onChange={(e) => setVehicle({ ...vehicle, year: e.target.value })} />
              <Input label={t("portalData.color")} value={vehicle.color} onChange={(e) => setVehicle({ ...vehicle, color: e.target.value })} />
            </div>
            <Button type="submit">{t("portalData.saveVehicle")}</Button>
          </form>
        </Card>
      </PageContent>
    </>
  );
}
