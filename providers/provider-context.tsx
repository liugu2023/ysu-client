"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useSettingsStore } from "@/lib/settings-store";
import type { AcademicProvider } from "./types";
import { getActiveProvider, setActiveProviderSchool } from "./provider-service";

export interface ProviderContextValue {
  provider: AcademicProvider;
  isReady: boolean;
}

const ProviderContext = createContext<ProviderContextValue | null>(null);

interface ProviderProviderProps {
  children: React.ReactNode;
  schoolId?: string;
}

export function ProviderProvider({ children, schoolId }: ProviderProviderProps) {
  const selectedSchoolId = useSettingsStore((state) => state.schoolId);
  const hasHydrated = useSettingsStore((state) => state.hasHydrated);
  const effectiveSchoolId = schoolId ?? (hasHydrated ? selectedSchoolId : "ysu");
  const [provider, setProvider] = useState<AcademicProvider>(() => getActiveProvider());
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!schoolId && !hasHydrated) {
      setIsReady(false);
      return;
    }

    const nextProvider = setActiveProviderSchool(effectiveSchoolId);
    setProvider(nextProvider);
    setIsReady(true);
  }, [effectiveSchoolId, hasHydrated, schoolId]);

  const value = useMemo<ProviderContextValue>(
    () => ({ provider, isReady }),
    [provider, isReady],
  );

  return <ProviderContext.Provider value={value}>{children}</ProviderContext.Provider>;
}

export function useProviderContext(): ProviderContextValue {
  const ctx = useContext(ProviderContext);
  if (ctx === null) {
    throw new Error("useProviderContext must be used within a ProviderProvider");
  }
  return ctx;
}
