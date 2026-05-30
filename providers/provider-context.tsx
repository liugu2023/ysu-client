/**
 * @fileoverview React Context for providing the current AcademicProvider instance.
 *
 * This module creates a context that holds the active provider and its readiness
 * state. The provider instance is memoized to avoid unnecessary re-renders.
 */

"use client";

import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
} from "react";
import type { AcademicProvider } from "./types";
import { YSUProvider } from "./ysu";

/** Context value shape: the provider instance and its readiness flag. */
export interface ProviderContextValue {
  /** The active academic provider instance. */
  provider: AcademicProvider;
  /** Whether the provider has finished async initialization. */
  isReady: boolean;
}

const ProviderContext = createContext<ProviderContextValue | null>(null);

/**
 * Factory function that creates an AcademicProvider for the given school.
 *
 * @param schoolId - School identifier, e.g. "ysu".
 * @returns An AcademicProvider implementation.
 * @throws If the school identifier is not supported.
 */
export function createProvider(schoolId: string): AcademicProvider {
  if (schoolId === "ysu") {
    return new YSUProvider();
  }
  throw new Error(`Unsupported school provider: ${schoolId}`);
}

/** Props for the ProviderProvider component. */
interface ProviderProviderProps {
  /** React children. */
  children: React.ReactNode;
  /** School identifier; defaults to "ysu". */
  schoolId?: string;
}

/**
 * React component that provides an AcademicProvider instance to its subtree.
 *
 * The provider instance is memoized by `schoolId` so it is only recreated when
 * the school changes. `isReady` starts as `false` and flips to `true` after
 * mount to allow any async provider initialization to complete.
 */
export function ProviderProvider({
  children,
  schoolId = "ysu",
}: ProviderProviderProps) {
  const provider = useMemo(() => createProvider(schoolId), [schoolId]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  const value = useMemo<ProviderContextValue>(
    () => ({ provider, isReady }),
    [provider, isReady]
  );

  return (
    <ProviderContext.Provider value={value}>
      {children}
    </ProviderContext.Provider>
  );
}

/**
 * Hook to access the ProviderContext value.
 *
 * @returns The context value containing the provider and readiness flag.
 * @throws If called outside of a ProviderProvider tree.
 */
export function useProviderContext(): ProviderContextValue {
  const ctx = useContext(ProviderContext);
  if (ctx === null) {
    throw new Error(
      "useProviderContext must be used within a ProviderProvider"
    );
  }
  return ctx;
}
