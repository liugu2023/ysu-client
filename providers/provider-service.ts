import { getSchoolId, setSchoolConfig } from "@/lib/server-config";
import type { AcademicProvider } from "./types";
import { createProvider } from "./provider-registry";

let activeSchoolId = getSchoolId();
let activeProvider: AcademicProvider = createProvider(activeSchoolId);

export function getActiveProvider(): AcademicProvider {
  const currentSchoolId = getSchoolId();
  if (currentSchoolId !== activeSchoolId) {
    activeSchoolId = currentSchoolId;
    activeProvider = createProvider(activeSchoolId);
  }
  return activeProvider;
}

export function setActiveProviderSchool(schoolId: string): AcademicProvider {
  if (schoolId !== activeSchoolId) {
    setSchoolConfig(schoolId);
    activeSchoolId = schoolId;
    activeProvider = createProvider(schoolId);
  }
  return activeProvider;
}

export async function initializeActiveProvider(): Promise<AcademicProvider> {
  const provider = getActiveProvider();
  await provider.initialize();
  return provider;
}

export async function resetActiveProvider(): Promise<void> {
  await getActiveProvider().reset();
}
