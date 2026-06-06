import { initSDK, resetSDK } from "@/lib/sdk";
import { warmupWEU } from "@/lib/jwxt";
import { ensureMobileAuthorized } from "@/lib/jwmobile";
import { isFeatureAvailable } from "@/lib/server-config";

export async function initializeSession(): Promise<void> {
  await initSDK();
}

export async function warmupSession(): Promise<void> {
  await warmupWEU();
  if (isFeatureAvailable("hasMobile")) {
    ensureMobileAuthorized(true).catch(() => {});
  }
}

export function resetSession(): void {
  resetSDK();
}
