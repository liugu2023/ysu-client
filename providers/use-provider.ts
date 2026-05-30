/**
 * @fileoverview Convenience hooks for accessing AcademicProvider from React Context.
 *
 * These hooks wrap `useProviderContext` to provide a cleaner API for components
 * that only need a subset of the context value.
 */

import {
  useProviderContext,
  type ProviderContextValue,
} from "./provider-context";
import type { AcademicProvider, AcademicCapabilities } from "./types";

/**
 * Hook to get the current AcademicProvider instance.
 *
 * @returns The active AcademicProvider.
 * @throws If used outside of a ProviderProvider tree.
 */
export function useProvider(): AcademicProvider {
  return useProviderContext().provider;
}

/**
 * Hook to check whether the provider is ready.
 *
 * @returns `true` if the provider has finished initialization.
 * @throws If used outside of a ProviderProvider tree.
 */
export function useProviderReady(): boolean {
  return useProviderContext().isReady;
}

/**
 * Hook to get the capabilities of the current provider.
 *
 * @returns The capability flags object from the active provider.
 * @throws If used outside of a ProviderProvider tree.
 */
export function useProviderCapabilities(): AcademicCapabilities {
  return useProviderContext().provider.capabilities;
}

/**
 * Hook to check if the current provider supports a specific capability.
 *
 * @param capability - The capability key to check.
 * @returns `true` if the provider supports the given capability.
 * @throws If used outside of a ProviderProvider tree.
 */
export function useHasCapability(
  capability: keyof AcademicCapabilities
): boolean {
  return useProviderContext().provider.capabilities[capability] === true;
}
