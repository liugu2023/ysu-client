/** 缓存版本 —— 数据结构变更时递增，旧版本缓存将被自动丢弃。 */
const CACHE_VERSION = 1;

/** 缓存键前缀 */
const CACHE_PREFIX = "ysu-cache:";

import { toast } from "sonner";
import { getText } from "./i18n/get-text";

/** 默认 TTL: 24 小时 */
export const DEFAULT_TTL_MS = 1000 * 60 * 60 * 24;

/** 学生信息等基本不变的数据: 7 天 */
export const LONG_TTL_MS = 1000 * 60 * 60 * 24 * 7;

let quotaErrorShown = false;

interface CacheEntry<T> {
  v: number;
  data: T;
  ts: number;
}

/**
 * 对凭据类长字符串做简单哈希，避免敏感数据明文出现在 localStorage 键名中，
 * 同时压缩键名长度节省配额。
 */
function hashPart(part: string): string {
  if (part.length < 80) return part;
  let hash = 0;
  for (let i = 0; i < part.length; i++) {
    const char = part.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return `h${Math.abs(hash).toString(36)}`;
}

export function cacheKey(parts: string[]): string {
  return parts.map(hashPart).join("|");
}

export function cacheGet<T>(key: string, ttl = DEFAULT_TTL_MS): T | null {
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    if (entry.v !== CACHE_VERSION) {
      localStorage.removeItem(`${CACHE_PREFIX}${key}`);
      return null;
    }
    if (Date.now() - entry.ts > ttl) return null;
    return entry.data;
  } catch {
    return null;
  }
}

/**
 * 读取缓存数据（即使已过期）。
 * 返回 `{ data, stale }` —— stale 为 true 表示数据已过期但可用作占位。
 */
export function cacheGetStale<T>(
  key: string,
  ttl = DEFAULT_TTL_MS,
): { data: T; stale: boolean } | null {
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    if (entry.v !== CACHE_VERSION) {
      localStorage.removeItem(`${CACHE_PREFIX}${key}`);
      return null;
    }
    const stale = Date.now() - entry.ts > ttl;
    return { data: entry.data, stale };
  } catch {
    return null;
  }
}

export function cacheSet<T>(key: string, data: T): void {
  try {
    const entry: CacheEntry<T> = { v: CACHE_VERSION, data, ts: Date.now() };
    localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(entry));
  } catch {
    if (!quotaErrorShown) {
      quotaErrorShown = true;
      toast.error(getText("app.cacheStorageFull"), {
        description: getText("app.cacheStorageFullDesc"),
      });
    }
  }
}

// ─── 请求去重 ────────────────────────────────────────────────────────────

const inflight = new Map<string, Promise<unknown>>();

/** 确保同一 key 的并发请求只发一次。 */
export async function dedupedFetch<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const inflightKey = `if:${key}`;
  const existing = inflight.get(inflightKey);
  if (existing) return existing as Promise<T>;

  const promise = fetcher().finally(() => {
    inflight.delete(inflightKey);
  });
  inflight.set(inflightKey, promise);
  return promise;
}

// ─── 清理 ────────────────────────────────────────────────────────────────

export function clearAllCache(): void {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CACHE_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    for (const key of keysToRemove) {
      localStorage.removeItem(key);
    }
  } catch {
    // ignore
  }
}
