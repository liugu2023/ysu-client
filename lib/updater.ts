import { CapacitorUpdater } from "@capgo/capacitor-updater";
import { App } from "@capacitor/app";
import { APP_VERSION } from "./version";

export interface UpdateInfo {
  available: boolean;
  version: string;
  downloadUrl: string;
  body: string;
  apkUpdateAvailable: boolean;
  apkDownloadUrl: string;
}

export interface UpdateMirror {
  label: string;
  value: string;
}

export const UPDATE_MIRRORS: readonly UpdateMirror[] = [
  { label: "GitHub 直连", value: "" },
  { label: "ghproxy.com", value: "https://ghproxy.com/" },
  { label: "ghfast.top", value: "https://ghfast.top/" },
];

const GITHUB_API =
  "https://api.github.com/repos/Youwenqwq/ysu-client/releases/latest";
const ASSET_NAME = "dist.zip";
const VERSION_JSON_NAME = "version.json";
const LAST_CHECK_KEY = "ysu-last-update-check";
const CHECK_COOLDOWN_MS = 30 * 60 * 1000; // 30 minutes

/** Compare two semver strings (major.minor.patch). Returns true if target > current. */
export function isNewer(current: string, target: string): boolean {
  const c = current.split(".").map(Number);
  const t = target.split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    if ((t[i] ?? 0) > (c[i] ?? 0)) return true;
    if ((t[i] ?? 0) < (c[i] ?? 0)) return false;
  }
  return false;
}

const EMPTY_RESULT: UpdateInfo = {
  available: false,
  version: "",
  downloadUrl: "",
  body: "",
  apkUpdateAvailable: false,
  apkDownloadUrl: "",
};

/** Check GitHub Releases for a newer version. Respects 30-min cooldown when `auto` is true. */
export async function checkForUpdate(
  auto = false,
  mirrorPrefix = "",
): Promise<UpdateInfo> {
  if (auto) {
    const last = localStorage.getItem(LAST_CHECK_KEY);
    if (last && Date.now() - Number(last) < CHECK_COOLDOWN_MS) {
      return EMPTY_RESULT;
    }
  }

  const apiUrl = mirrorPrefix ? `${mirrorPrefix}${GITHUB_API}` : GITHUB_API;

  try {
    const res = await fetch(apiUrl, {
      headers: { Accept: "application/vnd.github+json" },
    });

    if (res.status === 403) {
      throw new Error("RATE_LIMIT");
    }
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    const tagName: string = data.tag_name ?? "";
    const version = tagName.replace(/^v/, "");
    const body: string = data.body ?? "";
    const assets: Array<{ name: string; browser_download_url: string }> =
      data.assets ?? [];
    const asset = assets.find((a) => a.name === ASSET_NAME);

    if (!asset || !version) {
      return EMPTY_RESULT;
    }

    localStorage.setItem(LAST_CHECK_KEY, String(Date.now()));

    const downloadUrl = mirrorPrefix
      ? `${mirrorPrefix}${asset.browser_download_url}`
      : asset.browser_download_url;

    const result: UpdateInfo = {
      available: isNewer(APP_VERSION, version),
      version,
      downloadUrl,
      body,
      apkUpdateAvailable: false,
      apkDownloadUrl: "",
    };

    // Check version.json for APK version info
    const vjAsset = assets.find((a) => a.name === VERSION_JSON_NAME);
    if (vjAsset) {
      const vjUrl = mirrorPrefix
        ? `${mirrorPrefix}${vjAsset.browser_download_url}`
        : vjAsset.browser_download_url;
      try {
        const vjRes = await fetch(vjUrl);
        if (vjRes.ok) {
          const vj = await vjRes.json();
          const installed = await App.getInfo();
          if (vj.apkVersionCode > Number(installed.build)) {
            result.apkUpdateAvailable = true;
            result.apkDownloadUrl = mirrorPrefix
              ? `${mirrorPrefix}${vj.apkDownloadUrl}`
              : vj.apkDownloadUrl;
            // If APK needs update, web update is moot — force APK-only flow
            if (result.apkUpdateAvailable && result.available) {
              result.available = false;
            }
          }
        }
      } catch {
        // version.json fetch failed — proceed with web-only check
      }
    }

    return result;
  } catch (err) {
    if (auto) return EMPTY_RESULT;
    throw err;
  }
}

/** Download the update bundle and set it as the next active bundle. */
export async function downloadAndApply(
  info: UpdateInfo,
  onProgress?: (percent: number) => void,
): Promise<void> {
  const listener = await CapacitorUpdater.addListener("download", (state) => {
    onProgress?.(state.percent);
  });

  try {
    const bundle = await CapacitorUpdater.download({
      url: info.downloadUrl,
      version: info.version,
    });
    await CapacitorUpdater.next({ id: bundle.id });
  } finally {
    await listener.remove();
  }
}

/** Immediately apply the pending bundle and restart the app. */
export async function applyAndRestart(): Promise<void> {
  await CapacitorUpdater.reload();
}

/** Reset to the original bundled assets (emergency rollback). */
export async function resetToBuiltin(): Promise<void> {
  await CapacitorUpdater.reset();
}

/** Open APK download URL in browser for system download & install. */
export function openApkDownload(url: string): void {
  window.open(url, "_system");
}
