"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { initSDK } from "@/lib/sdk";
import { checkAuthStatus } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { useTranslation } from "@/lib/i18n/use-translation";

export function SDKProvider({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const didInit = useRef(false);

  useEffect(() => {
    if (!hasHydrated || didInit.current) return;
    didInit.current = true;

    initSDK()
      .then(() => checkAuthStatus())
      .then((status) => {
        if (!status.authenticated) {
          toast.error(t("app.sessionExpired"));
        }
      })
      .catch((err) => {
        const e = err as Error & { code?: string; status?: number };
        if (e.code === "AUTH_REQUIRED" || e.status === 401) {
          toast.error(t("app.sessionExpired"));
        } else {
          toast.error(t("app.networkError"));
        }
      });
  }, [hasHydrated, t]);

  return children;
}
