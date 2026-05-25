"use client";

import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuthStore } from "@/lib/auth-store";
import { useTranslation } from "@/lib/i18n/use-translation";
import {
  getTrainingPlan,
  getAcademicCompletion,
  getAcademicWarnings,
} from "@/lib/api";
import { useCachedData } from "@/lib/use-cached-data";
import {
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  Search,
} from "lucide-react";

const ALL = "__all__";
const REQUIRED_YES = "__required__";
const REQUIRED_NO = "__elective__";

export default function TrainingPlanPage() {
  const credential = useAuthStore((s) => s.credential);
  const { t } = useTranslation();

  const [search, setSearch] = useState("");
  const [requiredFilter, setRequiredFilter] = useState(ALL);
  const [termFilter, setTermFilter] = useState(ALL);
  const [groupFilter, setGroupFilter] = useState(ALL);

  const plans = useCachedData(["training-plan", credential], {
    fetch: () => getTrainingPlan(credential!),
  });

  const completion = useCachedData(["academic-completion", credential], {
    fetch: () => getAcademicCompletion(credential!),
    fallback: () => null,
  });

  const warnings = useCachedData(["academic-warnings", credential], {
    fetch: () => getAcademicWarnings(credential!),
    fallback: () => [],
  });

  const termOptions = useMemo(
    () =>
      Array.from(
        new Set((plans.data ?? []).map((p) => p.term).filter(Boolean) as string[]),
      ).sort(),
    [plans.data],
  );
  const groupOptions = useMemo(
    () =>
      Array.from(
        new Set((plans.data ?? []).map((p) => p.course_group).filter(Boolean) as string[]),
      ).sort(),
    [plans.data],
  );

  const activeWarnings = useMemo(
    () => (warnings.data ?? []).filter((w) => w.warning_level !== "1"),
    [warnings.data],
  );

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return (plans.data ?? []).filter((p) => {
      if (keyword) {
        const haystack = `${p.course_name ?? ""} ${p.course_code ?? ""}`.toLowerCase();
        if (!haystack.includes(keyword)) return false;
      }
      if (requiredFilter === REQUIRED_YES && !p.required) return false;
      if (requiredFilter === REQUIRED_NO && p.required) return false;
      if (termFilter !== ALL && p.term !== termFilter) return false;
      if (groupFilter !== ALL && p.course_group !== groupFilter) return false;
      return true;
    });
  }, [plans.data, search, requiredFilter, termFilter, groupFilter]);

  const hasActiveFilters =
    search.trim() !== "" ||
    requiredFilter !== ALL ||
    termFilter !== ALL ||
    groupFilter !== ALL;

  function resetFilters() {
    setSearch("");
    setRequiredFilter(ALL);
    setTermFilter(ALL);
    setGroupFilter(ALL);
  }

  if (plans.loading && !plans.data && !completion.data) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-40" />
        <Skeleton className="h-24" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  const completionItems = [
    { label: t("academic.planName"), value: completion.data?.plan_name },
    { label: t("academic.totalRequired"), value: completion.data?.total_required },
    { label: t("academic.completed"), value: completion.data?.completed },
    { label: t("academic.elective"), value: completion.data?.elective },
  ];

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>{t("academic.completionTitle")}</CardTitle>
              <CardDescription>
                {t("academic.completionDescription")}
              </CardDescription>
            </div>
            {completion.data?.passed ? (
              <Badge variant="default" className="gap-1">
                <CheckCircle2 className="size-3" />
                {t("academic.passed")}
              </Badge>
            ) : null}
          </div>
        </CardHeader>
        <CardContent>
          {completion.data ? (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-2">
              {completionItems.map((item) => (
                <div
                  key={item.label}
                  className="flex flex-col gap-1 rounded-lg border p-4"
                >
                  <span className="text-xs text-muted-foreground">
                    {item.label}
                  </span>
                  <span className="text-xl font-semibold">
                    {item.value || "-"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">
              {t("academic.noCompletionData")}
            </p>
          )}

          {activeWarnings.length === 0 ? (
            <Alert className="mt-4">
              <CheckCircle2 className="size-4" />
              <AlertTitle>{t("academic.noWarnings")}</AlertTitle>
              <AlertDescription>
                {t("academic.noWarningsDesc")}
              </AlertDescription>
            </Alert>
          ) : (
            <div className="mt-4 flex flex-col gap-2">
              {activeWarnings.map((w, idx) => (
                <Alert key={idx} variant="destructive">
                  <AlertTriangle className="size-4" />
                  <AlertTitle className="flex flex-wrap items-center gap-2">
                    <span>{w.warning_type}</span>
                    {w.warning_level && (
                      <Badge variant="destructive">{w.warning_level}</Badge>
                    )}
                    {w.term && (
                      <span className="text-xs font-normal text-muted-foreground">
                        {w.term}
                      </span>
                    )}
                  </AlertTitle>
                  {w.description && (
                    <AlertDescription>{w.description}</AlertDescription>
                  )}
                </Alert>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>{t("trainingPlan.coursesTitle")}</CardTitle>
              <CardDescription>
                {t("trainingPlan.coursesDescription")}
              </CardDescription>
            </div>
            <Badge variant="secondary">
              {hasActiveFilters
                ? t("trainingPlan.filters.filteredCount", {
                    filtered: filtered.length,
                    total: plans.data?.length ?? 0,
                  })
                : t("trainingPlan.filters.activeCount", {
                    count: plans.data?.length ?? 0,
                  })}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <FieldGroup className="grid gap-3 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="tp-search" className="text-xs font-medium text-muted-foreground">
                {t("trainingPlan.filters.searchLabel")}
              </FieldLabel>
              <InputGroup>
                <InputGroupAddon>
                  <Search />
                </InputGroupAddon>
                <InputGroupInput
                  id="tp-search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t("trainingPlan.filters.searchPlaceholder")}
                />
              </InputGroup>
            </Field>

            <Field>
              <FieldLabel htmlFor="tp-required" className="text-xs font-medium text-muted-foreground">
                {t("trainingPlan.filters.requiredLabel")}
              </FieldLabel>
              <Select value={requiredFilter} onValueChange={setRequiredFilter}>
                <SelectTrigger id="tp-required">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>
                    {t("trainingPlan.filters.all")}
                  </SelectItem>
                  <SelectItem value={REQUIRED_YES}>
                    {t("trainingPlan.filters.requiredOnly")}
                  </SelectItem>
                  <SelectItem value={REQUIRED_NO}>
                    {t("trainingPlan.filters.electiveOnly")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel htmlFor="tp-term" className="text-xs font-medium text-muted-foreground">
                {t("trainingPlan.filters.termLabel")}
              </FieldLabel>
              <Select value={termFilter} onValueChange={setTermFilter}>
                <SelectTrigger id="tp-term">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>
                    {t("trainingPlan.filters.all")}
                  </SelectItem>
                  {termOptions.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel htmlFor="tp-group" className="text-xs font-medium text-muted-foreground">
                {t("trainingPlan.filters.groupLabel")}
              </FieldLabel>
              <Select value={groupFilter} onValueChange={setGroupFilter}>
                <SelectTrigger id="tp-group">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>
                    {t("trainingPlan.filters.all")}
                  </SelectItem>
                  {groupOptions.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>

          {hasActiveFilters && (
            <div className="flex justify-end animate-in fade-in slide-in-from-top-1 duration-200">
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                <RotateCcw data-icon="inline-start" />
                {t("trainingPlan.filters.reset")}
              </Button>
            </div>
          )}

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    {t("trainingPlan.table.courseName")}
                  </TableHead>
                  <TableHead>
                    {t("trainingPlan.table.courseCode")}
                  </TableHead>
                  <TableHead>{t("trainingPlan.table.credit")}</TableHead>
                  <TableHead>{t("trainingPlan.table.required")}</TableHead>
                  <TableHead>{t("trainingPlan.table.term")}</TableHead>
                  <TableHead>{t("trainingPlan.table.group")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-muted-foreground"
                    >
                      {(plans.data?.length ?? 0) === 0
                        ? t("trainingPlan.table.noData")
                        : t("trainingPlan.table.noMatch")}
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((p, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">
                        {p.course_name}
                      </TableCell>
                      <TableCell>{p.course_code}</TableCell>
                      <TableCell>{p.credit}</TableCell>
                      <TableCell>
                        {p.required ? (
                          <Badge variant="default">
                            {t("trainingPlan.table.requiredYes")}
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            {t("trainingPlan.table.requiredNo")}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{p.term}</TableCell>
                      <TableCell>{p.course_group}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
