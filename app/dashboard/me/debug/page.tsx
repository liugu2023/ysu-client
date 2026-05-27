"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuthStore } from "@/lib/auth-store";
import { useTranslation } from "@/lib/i18n/use-translation";
import { isCapacitor } from "@/lib/platform";
import { getSchoolConfig, getSchoolId, serverConfig } from "@/lib/server-config";
import { getJar as getCasJar, isAuthenticated as checkCASAuth } from "@/lib/cas";
import { getJar as getJwxtJar, resetJWXT } from "@/lib/jwxt";
import { ensureMobileAuthorized } from "@/lib/jwmobile";
import { loadCASTGC, loadRememberedCredentials } from "@/lib/secure-storage";
import {
  getStudentInfo,
  getExperimentalSchedule,
  getCurrentWeek,
  getGrades,
  getExams,
} from "@/lib/api";
import { useSettingsStore } from "@/lib/settings-store";
import { cacheGet, cacheSet, cacheKey } from "@/lib/cache";
import { diffGrades, diffExams, checkAndNotify, syncCastgcToNative, startNativePolling, stopNativePolling } from "@/lib/notify";
import { NotifyPlugin } from "@/lib/notify-plugin";
import type { Grade, Exam } from "@/lib/types";
import { RefreshCw, Trash2, Bug, Bell, Play, Send, Smartphone, Shield, Power } from "lucide-react";
import { toast } from "sonner";
import { clearAllCache } from "@/lib/cache";

interface DiagnosticResult {
  school: {
    id: string;
    name: string;
    nameEn: string;
    cerBaseUrl: string;
    jwxtBaseUrl: string;
    hasMobile: boolean;
    hasLabSchedule: boolean;
    hasMfa: boolean;
  };
  platform: {
    name: string;
    userAgent: string;
    screen: string;
    capacitorPlatform?: string;
  };
  authStore: {
    credentialExists: boolean;
    username: string | null;
    isAuthenticated: boolean;
    hasHydrated: boolean;
    jwxtSessionExists: boolean;
  };
  casJar: {
    cookieCount: number;
    cookies: { name: string; domain: string; path: string }[];
  };
  jwxtJar: {
    cookieCount: number;
    cookies: { name: string; domain: string; path: string }[];
  };
  secureStorage: {
    castgcExists: boolean;
    rememberMeExists: boolean;
  };
  apiTests: {
    casAuth: { ok: boolean | null; error?: string };
    studentInfo: { ok: boolean | null; error?: string };
    schedule: { ok: boolean | null; error?: string };
    currentWeek: { ok: boolean | null; error?: string };
    mobileAuth: { ok: boolean | null; error?: string };
  };
}

export default function DebugPage() {
  const { t } = useTranslation();
  const credential = useAuthStore((s) => s.credential);
  const username = useAuthStore((s) => s.username);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const jwxtSession = useAuthStore((s) => s.jwxtSession);

  const [diag, setDiag] = useState<DiagnosticResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [notifyTestLog, setNotifyTestLog] = useState<string[]>([]);
  const [nativeTestLog, setNativeTestLog] = useState<string[]>([]);
  const [nativePermGranted, setNativePermGranted] = useState<boolean | null>(null);

  const notifyEnabled = useSettingsStore((s) => s.notifyEnabled);
  const notifyCheckInterval = useSettingsStore((s) => s.notifyCheckInterval);
  const notifyGrades = useSettingsStore((s) => s.notifyGrades);
  const notifyExams = useSettingsStore((s) => s.notifyExams);

  function logNotify(msg: string) {
    setNotifyTestLog((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  }

  function logNative(msg: string) {
    setNativeTestLog((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  }

  async function runDiagnostics() {
    setLoading(true);
    try {
      const platformName = isCapacitor() ? "Capacitor" : "Web (dev)";
      const screenInfo = typeof window !== "undefined"
        ? `${window.screen.width}x${window.screen.height} (${window.innerWidth}x${window.innerHeight})`
        : "N/A";
      let capacitorPlatform: string | undefined;
      if (isCapacitor()) {
        try {
          const { Capacitor } = await import("@capacitor/core");
          capacitorPlatform = Capacitor.getPlatform();
        } catch {
          // ignore
        }
      }

      const casJar = getCasJar();
      const casCookies = await casJar.getAllCookies();
      const jwxtJar = getJwxtJar();
      const jwxtCookies = await jwxtJar.getAllCookies();

      const castgc = await loadCASTGC();
      const rememberMe = await loadRememberedCredentials();

      const schoolConfig = getSchoolConfig();
      const result: DiagnosticResult = {
        school: {
          id: getSchoolId(),
          name: schoolConfig.name,
          nameEn: schoolConfig.nameEn,
          cerBaseUrl: serverConfig.cerBaseUrl,
          jwxtBaseUrl: serverConfig.jwxtBaseUrl,
          hasMobile: schoolConfig.features.hasMobile,
          hasLabSchedule: schoolConfig.features.hasLabSchedule,
          hasMfa: schoolConfig.features.hasMfa,
        },
        platform: {
          name: platformName,
          userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "N/A",
          screen: screenInfo,
          capacitorPlatform,
        },
        authStore: {
          credentialExists: !!credential,
          username: username || null,
          isAuthenticated,
          hasHydrated,
          jwxtSessionExists: !!jwxtSession,
        },
        casJar: {
          cookieCount: casCookies.length,
          cookies: casCookies.map((c: { name: string; domain: string; path: string }) => ({
            name: c.name,
            domain: c.domain,
            path: c.path,
          })),
        },
        jwxtJar: {
          cookieCount: jwxtCookies.length,
          cookies: jwxtCookies.map((c: { name: string; domain: string; path: string }) => ({
            name: c.name,
            domain: c.domain,
            path: c.path,
          })),
        },
        secureStorage: {
          castgcExists: !!castgc,
          rememberMeExists: !!rememberMe,
        },
        apiTests: {
          casAuth: { ok: null },
          studentInfo: { ok: null },
          schedule: { ok: null },
          currentWeek: { ok: null },
          mobileAuth: { ok: null },
        },
      };

      // API tests (sequential to avoid overwhelming the server)
      if (credential) {
        try {
          result.apiTests.casAuth = { ok: await checkCASAuth() };
        } catch (e) {
          result.apiTests.casAuth = { ok: false, error: (e as Error).message };
        }

        try {
          await getStudentInfo(credential);
          result.apiTests.studentInfo = { ok: true };
        } catch (e) {
          result.apiTests.studentInfo = { ok: false, error: (e as Error).message };
        }

        try {
          await getExperimentalSchedule(credential);
          result.apiTests.schedule = { ok: true };
        } catch (e) {
          result.apiTests.schedule = { ok: false, error: (e as Error).message };
        }

        try {
          await getCurrentWeek(credential);
          result.apiTests.currentWeek = { ok: true };
        } catch (e) {
          result.apiTests.currentWeek = { ok: false, error: (e as Error).message };
        }

        // Mobile auth test: run the full mobile authorization flow
        try {
          await ensureMobileAuthorized();
          result.apiTests.mobileAuth = { ok: true };
        } catch (e) {
          result.apiTests.mobileAuth = { ok: false, error: (e as Error).message };
        }
      }

      setDiag(result);
    } catch (err) {
      toast.error((err as Error).message || t("debug.diagnosticsFailed"));
    } finally {
      setLoading(false);
    }
  }

  const runDiagnosticsRef = useRef(runDiagnostics);
  useEffect(() => {
    runDiagnosticsRef.current = runDiagnostics;
  });

  useEffect(() => {
    runDiagnosticsRef.current();
  }, []);

  function handleClearCache() {
    clearAllCache();
    toast.success(t("debug.cacheCleared"));
    runDiagnostics();
  }

  function handleClearJWXTJar() {
    resetJWXT();
    toast.success(t("debug.jwxtJarCleared"));
    runDiagnostics();
  }

  // ─── Notification Debug ────────────────────────────────────────────── //

  async function handleTestDiff() {
    setNotifyTestLog([]);
    logNotify("=== Diff 逻辑测试 ===");
    // 模拟 diffGrades
    const oldGrades: Grade[] = [
      { course_name: "高等数学A1", course_code: "MATH101", term: "2025-2026-1", is_major: true, is_pass: true, is_valid: true, is_degree_course: true },
    ];
    const newGrades: Grade[] = [
      { course_name: "高等数学A1", course_code: "MATH101", term: "2025-2026-1", is_major: true, is_pass: true, is_valid: true, is_degree_course: true },
      { course_name: "大学英语1", course_code: "ENG101", term: "2025-2026-1", is_major: true, is_pass: true, is_valid: true, is_degree_course: true },
    ];
    const gradeDiff = diffGrades(oldGrades, newGrades);
    logNotify(`diffGrades: old=1, new=2, diff=${gradeDiff.length} → ${gradeDiff.map(g => g.course_name).join(", ") || "无新增"}`);

    // 模拟 diffExams
    const oldExams: Exam[] = [
      { name: "高等数学A1", exam_date: "2026-01-10", exam_time: "09:00-11:00", exam_location: "主楼301" },
    ];
    const newExams: Exam[] = [
      { name: "高等数学A1", exam_date: "2026-01-10", exam_time: "09:00-11:00", exam_location: "主楼301" },
      { name: "大学英语1", exam_date: "2026-01-12", exam_time: "14:00-16:00", exam_location: "外语楼201" },
    ];
    const examDiff = diffExams(oldExams, newExams);
    logNotify(`diffExams: old=1, new=2, diff=${examDiff.length} → ${examDiff.map(e => e.name).join(", ") || "无变更"}`);

    // 模拟考试地点变更
    const changedExams: Exam[] = [
      { name: "高等数学A1", exam_date: "2026-01-10", exam_time: "09:00-11:00", exam_location: "主楼502" },
    ];
    const changeDiff = diffExams(oldExams, changedExams);
    logNotify(`diffExams(地点变更): diff=${changeDiff.length} → ${changeDiff.map(e => `${e.name}@${e.exam_location}`).join(", ") || "无变更"}`);

    logNotify("=== Diff 测试完成 ===");
  }

  async function handleTestCheckAndNotify() {
    setNotifyTestLog([]);
    logNotify("=== checkAndNotify 测试 ===");
    if (!credential) {
      logNotify("未登录，跳过");
      return;
    }
    logNotify(`notifyEnabled=${notifyEnabled}, notifyGrades=${notifyGrades}, notifyExams=${notifyExams}`);

    // 手动拉取并缓存一次数据（模拟首次运行）
    try {
      logNotify("拉取当前成绩...");
      const grades = await getGrades(credential);
      logNotify(`获取到 ${grades.length} 条成绩记录`);
      const ck = cacheKey(["notify", "grades"]);
      const cached = cacheGet<Grade[]>(ck, 365 * 24 * 60 * 60 * 1000);
      logNotify(`缓存中: ${cached?.length ?? 0} 条`);
      if (!cached) {
        cacheSet(ck, grades);
        logNotify("已写入缓存（首次运行，不会触发通知）");
      } else {
        const diff = diffGrades(cached, grades);
        logNotify(`差异: ${diff.length} 条新增`);
      }
    } catch (e) {
      logNotify(`成绩拉取失败: ${(e as Error).message}`);
    }

    try {
      logNotify("拉取当前考试...");
      const exams = await getExams(credential);
      logNotify(`获取到 ${exams.length} 条考试记录`);
      const ck = cacheKey(["notify", "exams"]);
      const cached = cacheGet<Exam[]>(ck, 365 * 24 * 60 * 60 * 1000);
      logNotify(`缓存中: ${cached?.length ?? 0} 条`);
      if (!cached) {
        cacheSet(ck, exams);
        logNotify("已写入缓存（首次运行，不会触发通知）");
      } else {
        const diff = diffExams(cached, exams);
        logNotify(`差异: ${diff.length} 条变更`);
      }
    } catch (e) {
      logNotify(`考试拉取失败: ${(e as Error).message}`);
    }
    logNotify("=== checkAndNotify 测试完成 ===");
  }

  // ─── Native Plugin Debug ─────────────────────────────────────────────── //

  async function handleNativeCheckPermission() {
    if (!isCapacitor()) {
      logNative("非 Capacitor 平台，跳过");
      return;
    }
    try {
      const result = await NotifyPlugin.checkPermissions();
      setNativePermGranted(result.granted);
      logNative(`checkPermissions: granted=${result.granted}`);
    } catch (e) {
      logNative(`checkPermissions 失败: ${(e as Error).message}`);
    }
  }

  async function handleNativeRequestPermission() {
    if (!isCapacitor()) {
      logNative("非 Capacitor 平台，跳过");
      return;
    }
    try {
      const result = await NotifyPlugin.requestPermissions();
      setNativePermGranted(result.granted);
      logNative(`requestPermissions: granted=${result.granted}`);
    } catch (e) {
      logNative(`requestPermissions 失败: ${(e as Error).message}`);
    }
  }

  async function handleNativeSetCastgc() {
    if (!isCapacitor()) {
      logNative("非 Capacitor 平台，跳过");
      return;
    }
    try {
      // 诊断：从 secure storage 直接读取 CASTGC
      const { loadCASTGC } = await import("@/lib/secure-storage");
      const storedTgc = await loadCASTGC();
      logNative(`secureStorage CASTGC: ${storedTgc ? "存在" : "无"}`);

      // 诊断：从 CapacitorCookies 读取
      const { CapacitorCookies } = await import("@capacitor/core");
      const cookies = await CapacitorCookies.getCookies({
        url: "https://cer.ysu.edu.cn/authserver",
      });
      logNative(`CapacitorCookies: ${JSON.stringify(cookies)}`);

      // 诊断：从 JS cookie jar 读取
      const casCookies = await getCasJar().getAllCookies();
      const jarCastgc = casCookies.find((c) => c.name === "CASTGC");
      logNative(`JS cookie jar CASTGC: ${jarCastgc ? `存在(len=${jarCastgc.value.length})` : "无"}`);

      // 诊断：直接调用 setCastgc
      if (jarCastgc?.value) {
        logNative(`直接调用 setCastgc, castgc len=${jarCastgc.value.length}`);
        await NotifyPlugin.setCastgc({ castgc: jarCastgc.value });
        logNative("setCastgc 调用完成");
      } else {
        logNative("跳过 setCastgc: castgc 为空");
      }
    } catch (e) {
      logNative(`syncCastgcToNative 失败: ${(e as Error).message}`);
    }
  }

  async function handleNativeStartPolling() {
    if (!isCapacitor()) {
      logNative("非 Capacitor 平台，跳过");
      return;
    }
    try {
      await startNativePolling();
      logNative(`startNativePolling: 已启动 (interval=${notifyCheckInterval}min, grades=${notifyGrades}, exams=${notifyExams})`);
    } catch (e) {
      logNative(`startNativePolling 失败: ${(e as Error).message}`);
    }
  }

  async function handleNativeStopPolling() {
    if (!isCapacitor()) {
      logNative("非 Capacitor 平台，跳过");
      return;
    }
    try {
      await stopNativePolling();
      logNative("stopNativePolling: 已停止");
    } catch (e) {
      logNative(`stopNativePolling 失败: ${(e as Error).message}`);
    }
  }

  async function handleNativeRunWorker() {
    if (!isCapacitor()) {
      logNative("非 Capacitor 平台，跳过");
      return;
    }
    try {
      logNative("正在直接触发 Worker...");
      await NotifyPlugin.executeOnce();
      logNative("Worker 已触发，稍后查看通知栏");
    } catch (e) {
      logNative(`触发 Worker 失败: ${(e as Error).message}`);
    }
  }

  async function handleNativeGetState() {
    if (!isCapacitor()) {
      logNative("非 Capacitor 平台，跳过");
      return;
    }
    try {
      const result = await NotifyPlugin.checkPermissions();
      logNative(`权限状态: granted=${result.granted}`);
    } catch (e) {
      logNative(`获取状态失败: ${(e as Error).message}`);
    }
  }

  function handleNativeClearLog() {
    setNativeTestLog([]);
  }


  function statusBadge(value: boolean | null | { ok: boolean | null; error?: string }) {
    if (typeof value === "boolean") {
      if (value === true) return <Badge variant="default" className="text-[10px]">OK</Badge>;
      if (value === false) return <Badge variant="destructive" className="text-[10px]">FAIL</Badge>;
    }
    if (typeof value === "object" && value !== null) {
      if (value.ok === true) return <Badge variant="default" className="text-[10px]">OK</Badge>;
      if (value.ok === false) return <Badge variant="destructive" className="text-[10px]">FAIL</Badge>;
    }
    return <Badge variant="secondary" className="text-[10px]">N/A</Badge>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold flex items-center gap-2">
          <Bug className="size-5" />
          Debug
        </h1>
        <div className="flex-1" />
        <Button variant="outline" size="sm" onClick={runDiagnostics} disabled={loading}>
          {loading ? <Spinner className="size-3.5" /> : <RefreshCw className="size-3.5" />}
          {t("debug.refresh")}
        </Button>
      </div>

      {!diag && loading && (
        <div className="flex items-center justify-center py-12">
          <Spinner className="size-8" />
        </div>
      )}

      {diag && (
        <>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{t("debug.platform")}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-1.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t("debug.platformType")}</span>
                <span className="font-mono text-xs">{diag.platform.name}</span>
              </div>
              {diag.platform.capacitorPlatform && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t("debug.platformCapacitor")}</span>
                  <span className="font-mono text-xs">{diag.platform.capacitorPlatform}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t("debug.platformScreen")}</span>
                <span className="font-mono text-xs">{diag.platform.screen}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-muted-foreground">{t("debug.platformUserAgent")}</span>
                <span className="break-all text-[10px] font-mono text-muted-foreground">{diag.platform.userAgent}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{t("debug.schoolInfo")}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-1.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t("debug.schoolId")}</span>
                <span className="font-mono text-xs">{diag.school.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t("debug.schoolName")}</span>
                <span className="font-mono text-xs">{diag.school.name} ({diag.school.nameEn})</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t("debug.schoolCasUrl")}</span>
                <span className="font-mono text-xs break-all">{diag.school.cerBaseUrl}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t("debug.schoolJwxtUrl")}</span>
                <span className="font-mono text-xs break-all">{diag.school.jwxtBaseUrl}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t("debug.schoolHasMobile")}</span>
                {statusBadge(diag.school.hasMobile)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t("debug.schoolHasLabSchedule")}</span>
                {statusBadge(diag.school.hasLabSchedule)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t("debug.schoolHasMfa")}</span>
                {statusBadge(diag.school.hasMfa)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{t("debug.authState")}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-1.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t("debug.credential")}</span>
                {statusBadge(diag.authStore.credentialExists)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t("debug.username")}</span>
                <span className="font-mono text-xs">{diag.authStore.username || "-"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t("debug.authenticated")}</span>
                {statusBadge(diag.authStore.isAuthenticated)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t("debug.hydrated")}</span>
                {statusBadge(diag.authStore.hasHydrated)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t("debug.jwxtSession")}</span>
                {statusBadge(diag.authStore.jwxtSessionExists)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{t("debug.secureStorage")}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-1.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t("debug.castgc")}</span>
                {statusBadge(diag.secureStorage.castgcExists)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t("debug.rememberMe")}</span>
                {statusBadge(diag.secureStorage.rememberMeExists)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{t("debug.apiTests")}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-1.5 text-sm">
              {[
                { label: t("debug.casAuth"), test: diag.apiTests.casAuth },
                { label: t("debug.studentInfo"), test: diag.apiTests.studentInfo },
                { label: t("debug.schedule"), test: diag.apiTests.schedule },
                { label: t("debug.currentWeek"), test: diag.apiTests.currentWeek },
                { label: t("debug.mobileAuth"), test: diag.apiTests.mobileAuth },
              ].map((item) => (
                <div key={item.label} className="flex flex-col gap-0.5">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{item.label}</span>
                    {statusBadge(item.test)}
                  </div>
                  {item.test.error && (
                    <span className="text-xs text-destructive break-all font-mono">
                      {item.test.error}
                    </span>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{t("debug.casJar")} ({diag.casJar.cookieCount})</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-32 rounded-md border bg-muted/30 p-2">
                {diag.casJar.cookies.length === 0 ? (
                  <span className="text-xs text-muted-foreground">{t("debug.empty")}</span>
                ) : (
                  <ul className="flex flex-col gap-1">
                    {diag.casJar.cookies.map((c, i) => (
                      <li key={i} className="text-xs font-mono">
                        {c.name} @ {c.domain}{c.path}
                      </li>
                    ))}
                  </ul>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{t("debug.jwxtJar")} ({diag.jwxtJar.cookieCount})</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-32 rounded-md border bg-muted/30 p-2">
                {diag.jwxtJar.cookies.length === 0 ? (
                  <span className="text-xs text-muted-foreground">{t("debug.empty")}</span>
                ) : (
                  <ul className="flex flex-col gap-1">
                    {diag.jwxtJar.cookies.map((c, i) => (
                      <li key={i} className="text-xs font-mono">
                        {c.name} @ {c.domain}{c.path}
                      </li>
                    ))}
                  </ul>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* ── Notification Debug ─────────────────────────────── */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Bell className="size-4" />
                通知模块状态
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-1.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">notifyEnabled</span>
                {statusBadge(notifyEnabled)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">notifyCheckInterval</span>
                <span className="font-mono text-xs">{notifyCheckInterval} 分钟</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">notifyGrades</span>
                {statusBadge(notifyGrades)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">notifyExams</span>
                {statusBadge(notifyExams)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">isCapacitor</span>
                {statusBadge(isCapacitor())}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">缓存成绩</span>
                <span className="font-mono text-xs">
                  {(() => {
                    const cached = cacheGet<Grade[]>(cacheKey(["notify", "grades"]), 365 * 24 * 60 * 60 * 1000);
                    return cached ? `${cached.length} 条` : "无";
                  })()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">缓存考试</span>
                <span className="font-mono text-xs">
                  {(() => {
                    const cached = cacheGet<Exam[]>(cacheKey(["notify", "exams"]), 365 * 24 * 60 * 60 * 1000);
                    return cached ? `${cached.length} 条` : "无";
                  })()}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Play className="size-4" />
                通知模块测试
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" onClick={handleTestDiff}>
                  Diff 逻辑
                </Button>
                <Button variant="outline" size="sm" onClick={() => toast("测试 Toast", { description: "Toast 通知工作正常" })}>
                  <Bell className="size-3.5 mr-1" />
                  Toast
                </Button>
                <Button variant="outline" size="sm" onClick={handleTestCheckAndNotify}>
                  <Play className="size-3.5 mr-1" />
                  checkAndNotify
                </Button>
              </div>

              {notifyTestLog.length > 0 && (
                <ScrollArea className="h-48 rounded-md border bg-muted/30 p-2">
                  <pre className="text-[10px] font-mono whitespace-pre-wrap">
                    {notifyTestLog.join("\n")}
                  </pre>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          {/* ── Native Plugin Debug ─────────────────────────────── */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Smartphone className="size-4" />
                原生插件测试
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" onClick={handleNativeCheckPermission}>
                  <Shield className="size-3.5 mr-1" />
                  检查权限
                </Button>
                <Button variant="outline" size="sm" onClick={handleNativeRequestPermission}>
                  <Shield className="size-3.5 mr-1" />
                  请求权限
                </Button>
                <Button variant="outline" size="sm" onClick={handleNativeSetCastgc}>
                  <Send className="size-3.5 mr-1" />
                  同步 CASTGC
                </Button>
                <Button variant="outline" size="sm" onClick={handleNativeStartPolling}>
                  <Power className="size-3.5 mr-1" />
                  启动轮询
                </Button>
                <Button variant="outline" size="sm" onClick={handleNativeStopPolling}>
                  <Power className="size-3.5 mr-1" />
                  停止轮询
                </Button>
                <Button variant="outline" size="sm" onClick={handleNativeRunWorker}>
                  <Play className="size-3.5 mr-1" />
                  立即执行
                </Button>
                <Button variant="outline" size="sm" onClick={handleNativeClearLog}>
                  <Trash2 className="size-3.5 mr-1" />
                  清空日志
                </Button>
              </div>

              {nativePermGranted !== null && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground">通知权限:</span>
                  {nativePermGranted ? (
                    <span className="text-green-600">已授予</span>
                  ) : (
                    <span className="text-destructive">未授予</span>
                  )}
                </div>
              )}

              {nativeTestLog.length > 0 && (
                <ScrollArea className="h-48 rounded-md border bg-muted/30 p-2">
                  <pre className="text-[10px] font-mono whitespace-pre-wrap">
                    {nativeTestLog.join("\n")}
                  </pre>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          <div className="flex flex-col gap-2">
            <Button variant="destructive" onClick={handleClearCache} className="w-full">
              <Trash2 className="size-4 mr-2" />
              {t("debug.clearCache")}
            </Button>
            <Button variant="outline" onClick={handleClearJWXTJar} className="w-full">
              <Trash2 className="size-4 mr-2" />
              {t("debug.clearJWXTJar")}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
