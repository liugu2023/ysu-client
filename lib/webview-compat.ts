import { registerPlugin } from "@capacitor/core";

export interface WebViewCompatPlugin {
  check(): Promise<void>;
}

const WebViewCompat = registerPlugin<WebViewCompatPlugin>("WebViewCompat", {
  web: async () => {
    return {
      async check() {
        // No-op on web
      },
    };
  },
});

export async function checkWebViewCompat(): Promise<void> {
  try {
    await WebViewCompat.check();
  } catch {
    // Plugin check is best-effort; fail silently
  }
}
