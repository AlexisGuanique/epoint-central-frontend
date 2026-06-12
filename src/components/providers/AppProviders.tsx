"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ModalProvider } from "@/contexts/ModalContext";
import { NotificationsProvider } from "@/contexts/NotificationsContext";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <ModalProvider>
        <AuthProvider>
          <NotificationsProvider>{children}</NotificationsProvider>
        </AuthProvider>
      </ModalProvider>
    </LanguageProvider>
  );
}
