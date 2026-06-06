import { ProviderError, ProviderErrorCode } from "./errors";
import type { AcademicProvider } from "./types";
import { YSUProvider } from "./ysu";

type ProviderFactory = () => AcademicProvider;

const registry: Record<string, ProviderFactory> = {
  ysu: () => new YSUProvider(),
};

export function registerProvider(schoolId: string, factory: ProviderFactory): void {
  registry[schoolId] = factory;
}

export function hasProvider(schoolId: string): boolean {
  return schoolId in registry;
}

export function createProvider(schoolId: string): AcademicProvider {
  const factory = registry[schoolId];
  if (!factory) {
    throw new ProviderError(
      ProviderErrorCode.FEATURE_NOT_SUPPORTED,
      `Unsupported school provider: ${schoolId}`,
      undefined,
      501,
    );
  }
  return factory();
}
