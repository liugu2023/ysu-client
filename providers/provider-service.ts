import { getSchoolId, setSchoolConfig } from "@/lib/server-config";
import { DEFAULT_SCHOOL_ID, hasSchoolConfig } from "@/lib/school-configs";
import type { AcademicProvider } from "./types";
import { createProvider, hasProvider } from "./provider-registry";

function resolveSupportedSchoolId(schoolId: string): string {
  if (hasSchoolConfig(schoolId) && hasProvider(schoolId)) {
    return schoolId;
  }
  return DEFAULT_SCHOOL_ID;
}

let activeSchoolId = resolveSupportedSchoolId(getSchoolId());
let activeProvider: AcademicProvider = createProvider(activeSchoolId);
setSchoolConfig(activeSchoolId);

export function getActiveProvider(): AcademicProvider {
  const currentSchoolId = getSchoolId();
  const nextSchoolId = resolveSupportedSchoolId(currentSchoolId);
  if (nextSchoolId !== currentSchoolId) {
    setSchoolConfig(nextSchoolId);
  }
  if (nextSchoolId !== activeSchoolId) {
    activeSchoolId = nextSchoolId;
    activeProvider = createProvider(activeSchoolId);
  }
  return activeProvider;
}

export function setActiveProviderSchool(schoolId: string): AcademicProvider {
  const nextSchoolId = resolveSupportedSchoolId(schoolId);
  if (nextSchoolId !== getSchoolId()) {
    setSchoolConfig(nextSchoolId);
  }
  if (nextSchoolId !== activeSchoolId) {
    activeSchoolId = nextSchoolId;
    activeProvider = createProvider(nextSchoolId);
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

export async function logoutActiveProvider(): Promise<void> {
  await getActiveProvider().logout();
}

export async function reloginActiveProvider(): Promise<boolean> {
  return (await getActiveProvider().relogin?.()) ?? false;
}
