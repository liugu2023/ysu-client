import { zh, en } from "./dict";

const STORAGE_KEY = "ysu-locale";

export function getText(key: string): string {
  if (typeof window === "undefined") return key;
  const locale = localStorage.getItem(STORAGE_KEY) === "en" ? "en" : "zh";
  const dict = locale === "en" ? en : zh;

  const keys = key.split(".");
  let current: unknown = dict;
  for (const k of keys) {
    if (current === null || current === undefined || typeof current !== "object") {
      return key;
    }
    current = (current as Record<string, unknown>)[k];
  }
  if (typeof current === "string") return current;
  return key;
}
