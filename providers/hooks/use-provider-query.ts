"use client";

import useSWR, { type KeyedMutator, type SWRConfiguration } from "swr";
import { assertCapability } from "../capabilities";
import { ProviderError } from "../errors";
import { useProvider, useProviderReady } from "../use-provider";
import type { AcademicCapabilities } from "../types";

export interface ProviderQueryResult<T> {
  data: T | undefined;
  isLoading: boolean;
  isValidating: boolean;
  isError: boolean;
  error: ProviderError | undefined;
  mutate: KeyedMutator<T>;
}

export function providerQueryKey(
  providerId: string,
  feature: string,
  params?: unknown,
): readonly unknown[] {
  return ["provider", providerId, feature, params ?? null] as const;
}

export function useProviderQuery<T>(
  capability: keyof AcademicCapabilities,
  feature: string,
  fetcher: () => Promise<T>,
  params?: unknown,
  config?: SWRConfiguration<T, ProviderError>,
): ProviderQueryResult<T> {
  const provider = useProvider();
  const isReady = useProviderReady();

  assertCapability(provider, capability);

  const { data, error, isLoading, isValidating, mutate } = useSWR<T, ProviderError>(
    isReady ? providerQueryKey(provider.id, feature, params) : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
      ...config,
    },
  );

  return {
    data,
    isLoading,
    isValidating,
    isError: !!error,
    error: error ?? undefined,
    mutate,
  };
}
