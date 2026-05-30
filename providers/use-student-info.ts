'use client';

import useSWR from 'swr';
import { useProvider } from './use-provider';
import { ProviderError, ProviderErrorCode } from './errors';
import type { StudentInfo } from './types';

export interface UseStudentInfoResult {
  data: StudentInfo | undefined;
  isLoading: boolean;
  isError: boolean;
  error: ProviderError | undefined;
  mutate: () => void;
}

/**
 * Hook to fetch student basic information from the current academic provider.
 *
 * Uses SWR for caching, deduplication, and revalidation. Only fetches if the
 * provider advertises `studentInfo` support; otherwise throws immediately.
 *
 * @returns Student info state including data, loading, error flags, and a manual mutate trigger.
 * @throws {ProviderError} If the provider does not support the `studentInfo` capability.
 */
export function useStudentInfo(): UseStudentInfoResult {
  const provider = useProvider();

  if (!provider.capabilities.studentInfo) {
    throw new ProviderError(
      ProviderErrorCode.FEATURE_NOT_SUPPORTED,
      `Provider "${provider.id}" does not support studentInfo`,
    );
  }

  const {
    data,
    error,
    isLoading,
    mutate,
  } = useSWR<StudentInfo, ProviderError>(
    ['student-info', provider.id],
    () => provider.getStudentInfo(),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
    },
  );

  return {
    data,
    isLoading,
    isError: !!error,
    error: error ?? undefined,
    mutate,
  };
}
