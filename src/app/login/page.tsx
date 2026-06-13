"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/Button";
import { EmailIcon, Input, PasswordInput } from "@/components/ui/Input";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function LoginPage() {
  const router = useRouter();
  const { login, user, isLoading } = useAuth();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const features = [t("login.feature1"), t("login.feature2"), t("login.feature3")];

  useEffect(() => {
    if (!isLoading && user) {
      router.replace(user.role.code === "CLIENT" ? "/portal" : "/dashboard");
    }
  }, [user, isLoading, router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email.trim(), password.trim());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("common.loginError"));
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading || user) {
    return (
      <div className="login-bg flex min-h-screen items-center justify-center">
        <LoadingSpinner label={t("login.verifyingSession")} />
      </div>
    );
  }

  return (
    <div className="login-bg flex min-h-screen">
      <div className="relative hidden flex-col justify-between p-12 text-white lg:flex lg:w-1/2 xl:p-16">
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm ring-1 ring-white/20">
              <span className="text-lg font-bold">eP</span>
            </div>
            <span className="text-xl font-bold">ePoint CRM</span>
          </div>
        </div>

        <div className="relative z-10 max-w-md">
          <h2 className="text-3xl font-bold leading-tight xl:text-4xl">{t("login.headline")}</h2>
          <p className="mt-4 text-base leading-relaxed text-blue-100/80">{t("login.subheadline")}</p>
          <ul className="mt-8 space-y-3">
            {features.map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm text-blue-100">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/30 ring-1 ring-blue-400/30">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-xs text-slate-400">© 2026 ePoint CRM</p>
      </div>

      <div className="flex flex-1 items-center justify-center p-6 lg:p-12">
        <div className="card-glass relative z-10 w-full max-w-md p-6 sm:p-8 lg:p-10">
          <div className="absolute right-6 top-6 lg:right-8 lg:top-8">
            <LanguageSwitcher />
          </div>

          <div className="mb-8 lg:hidden">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white">
                eP
              </div>
              <span className="text-lg font-bold text-slate-900">ePoint CRM</span>
            </div>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">{t("login.welcome")}</h1>
            <p className="mt-1 text-sm text-slate-500">{t("login.subtitle")}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <div className="alert alert-error">{error}</div>}

            <Input
              id="email"
              name="email"
              label={t("login.emailLabel")}
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              required
              icon={<EmailIcon />}
              value={email}
              onChange={(e) => setEmail(e.target.value.toLowerCase())}
              placeholder={t("login.emailPlaceholder")}
            />

            <PasswordInput
              id="password"
              name="password"
              label={t("login.passwordLabel")}
              autoComplete="current-password"
              required
              show={showPassword}
              onToggle={() => setShowPassword((v) => !v)}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("login.passwordPlaceholder")}
              showLabel={t("login.showPassword")}
              hideLabel={t("login.hidePassword")}
            />

            <Button type="submit" fullWidth size="lg" disabled={submitting}>
              {submitting ? t("login.submitting") : t("login.submit")}
            </Button>
          </form>

          <div className="mt-8 rounded-xl border border-slate-100 bg-slate-50/80 p-4">
            <p className="text-center text-xs font-medium text-slate-500">{t("login.demoAccount")}</p>
            <p className="mt-1 text-center font-mono text-xs text-slate-600">
              admin@epoint.com · Admin123!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
