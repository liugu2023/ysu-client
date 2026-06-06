/**
 * Legacy API compatibility facade.
 *
 * UI code is being migrated to the provider layer. This module keeps the old
 * snake_case API surface stable while delegating business logic to the active
 * AcademicProvider.
 */
import type {
  CalculateScoreRequest,
  Course,
  CurrentWeek,
  EvaluationDetail,
  EvaluationTask,
  EvaluationType,
  Exam,
  GPAStats,
  Grade,
  GradeDistribution,
  GradeRanking,
  GradeStatistics,
  LoginRequest,
  LoginResponse,
  MFAChallengeResponse,
  MFARequestCodeRequest,
  MFASubmitRequest,
  StatusResponse,
  Step1Request,
  Step1Response,
  StudentInfo,
  SubmitEvaluationRequest,
  TermCalendar,
  AcademicCompletion,
  AcademicWarning,
  TrainingPlan,
  ClassPeriod,
  CurrentLesson,
  SigninActivityDetail,
  StudentSigninStatus,
  StudentSignResult,
} from "./types";
import { getText } from "./i18n/get-text";
import { getActiveProvider } from "@/providers/provider-service";
import { ProviderError, ProviderErrorCode } from "@/providers/errors";
import {
  toLegacyAcademicCompletion,
  toLegacyAcademicWarning,
  toLegacyClassPeriod,
  toLegacyCourse,
  toLegacyCurrentLesson,
  toLegacyCurrentWeek,
  toLegacyEvaluationDetail,
  toLegacyEvaluationTask,
  toLegacyEvaluationType,
  toLegacyExam,
  toLegacyGPAStats,
  toLegacyGrade,
  toLegacyGradeDistribution,
  toLegacyGradeRanking,
  toLegacyGradeStatistics,
  toLegacySigninActivityDetail,
  toLegacyStudentInfo,
  toLegacyStudentSignResult,
  toLegacyStudentSigninStatus,
  toLegacyTermCalendar,
  toLegacyTrainingPlan,
  toProviderEvaluationAnswer,
} from "@/providers/compat/legacy-api-mappers";

function apiError(message: string, code?: string, status?: number): Error {
  const err = new Error(message);
  (err as Error & { code?: string; status?: number }).code = code;
  (err as Error & { code?: string; status?: number }).status = status;
  return err;
}

function mapProviderError(error: unknown): Error {
  if (error instanceof ProviderError) {
    switch (error.code) {
      case ProviderErrorCode.AUTH_REQUIRED:
      case ProviderErrorCode.AUTH_SESSION_EXPIRED:
        return apiError(getText("app.sessionExpired"), "AUTH_REQUIRED", 401);
      case ProviderErrorCode.AUTH_CAPTCHA_REQUIRED:
        return apiError(error.message, "NEED_CAPTCHA", 403);
      case ProviderErrorCode.AUTH_MFA_REQUIRED:
        return apiError(error.message, "MFA_REQUIRED", error.status ?? 400);
      case ProviderErrorCode.AUTH_INVALID_CREDENTIAL:
        return apiError(error.message, "AUTH_INVALID_CREDENTIAL", error.status ?? 401);
      case ProviderErrorCode.FEATURE_NOT_SUPPORTED:
        return apiError(error.message, "FEATURE_NOT_SUPPORTED", error.status ?? 501);
      case ProviderErrorCode.RATE_LIMITED:
        return apiError(error.message, "RATE_LIMITED", error.status ?? 429);
      case ProviderErrorCode.BACKEND_BUSINESS_ERROR:
        return apiError(error.message, "JWXT_BUSINESS_ERROR", error.status ?? 400);
      case ProviderErrorCode.BACKEND_PROTOCOL_ERROR:
        return apiError(error.message, "JWXT_PROTOCOL_ERROR", error.status ?? 500);
      default:
        return apiError(error.message, error.code, error.status ?? 500);
    }
  }
  if (
    error instanceof Error &&
    (error as Error & { code?: string }).code === "RATE_LIMITED"
  ) {
    return apiError(error.message, "RATE_LIMITED", 429);
  }
  if (error instanceof Error) {
    return apiError(error.message, "SDK_ERROR", 500);
  }
  return apiError(String(error), "UNKNOWN_ERROR", 500);
}

async function withProvider<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    throw mapProviderError(error);
  }
}

function provider() {
  return getActiveProvider();
}

// ── Auth ────────────────────────────────────────────────

export async function prepareLogin(): Promise<void> {
  return withProvider(() => provider().prepareLogin());
}

export async function checkCaptchaNeeded(username: string): Promise<boolean> {
  try {
    return await provider().checkCaptchaNeeded(username);
  } catch {
    return false;
  }
}

export async function loginStep1(payload: Step1Request): Promise<Step1Response> {
  return withProvider(async () => {
    const result = await provider().loginStep1({
      username: payload.username,
      password: payload.password,
      captcha: payload.captcha,
      skipRateLimit: payload.skip_rate_limit,
    });
    return {
      authenticated: result.authenticated,
      needs_mfa: result.needsMfa,
      username: result.username,
      credential: result.credential,
    };
  });
}

export async function requestMFACode(
  payload: MFARequestCodeRequest,
  _credential?: string,
): Promise<MFAChallengeResponse> {
  return withProvider(async () => {
    const challenge = await provider().requestMfaCode({
      username: payload.username,
      method: payload.method,
    });
    return {
      method: challenge.method,
      method_code: challenge.methodCode,
      mobile_hint: challenge.mobileHint,
      username: challenge.username,
    };
  });
}

export async function submitMFACode(
  payload: MFASubmitRequest,
  _credential?: string,
): Promise<LoginResponse> {
  return withProvider(async () => {
    const credential = await provider().submitMfaCode({
      challenge: {
        method: payload.method,
        methodCode: payload.method_code,
        mobileHint: "",
        username: payload.username,
      },
      code: payload.code,
    });
    return { credential };
  });
}

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  return withProvider(async () => {
    const activeProvider = provider();
    const step1 = await activeProvider.loginStep1({
      username: payload.username,
      password: payload.password,
      captcha: payload.captcha,
    });
    if (step1.authenticated && step1.credential) {
      return { credential: step1.credential };
    }
    if (step1.needsMfa && payload.mfa_code && payload.mfa_method) {
      const credential = await activeProvider.submitMfaCode({
        challenge: {
          method: payload.mfa_method,
          methodCode: payload.mfa_method,
          mobileHint: "",
          username: payload.username,
        },
        code: payload.mfa_code,
      });
      return { credential };
    }
    throw new ProviderError(
      ProviderErrorCode.AUTH_MFA_REQUIRED,
      "登录未完成,需要 MFA",
      undefined,
      400,
    );
  });
}

export async function checkAuthStatus(_credential?: string): Promise<StatusResponse> {
  return withProvider(() => provider().checkAuthStatus());
}

// ── Student Info ────────────────────────────────────────

export async function getStudentInfo(_credential?: string): Promise<StudentInfo> {
  return withProvider(async () => toLegacyStudentInfo(await provider().getStudentInfo()));
}

// ── Grades ──────────────────────────────────────────────

export async function getGrades(
  _credential: string,
  params?: {
    term?: string;
    course_name?: string;
    page_size?: number;
    page_number?: number;
  },
): Promise<Grade[]> {
  return withProvider(async () => {
    const rows = await provider().getGrades({
      semester: params?.term,
      courseName: params?.course_name,
      pageSize: params?.page_size ?? 999,
      pageNumber: params?.page_number ?? 1,
    });
    return rows.map(toLegacyGrade);
  });
}

export async function getGPAStats(
  _credential: string,
  student_id?: string,
): Promise<GPAStats> {
  return withProvider(async () =>
    toLegacyGPAStats(await provider().getGPAStats({ studentId: student_id })),
  );
}

export async function getGradeStatistics(
  _credential: string,
  params?: { class_id?: string; course_code?: string; term?: string },
): Promise<GradeStatistics> {
  return withProvider(async () =>
    toLegacyGradeStatistics(
      await provider().getGradeStatistics({
        semester: params?.term,
        classId: params?.class_id,
        courseCode: params?.course_code,
      }),
    ),
  );
}

export async function getGradeDistribution(
  _credential: string,
  params?: { class_id?: string; course_code?: string; term?: string },
): Promise<GradeDistribution[]> {
  return withProvider(async () => {
    const rows = await provider().getGradeDistribution({
      semester: params?.term,
      classId: params?.class_id,
      courseCode: params?.course_code,
    });
    return rows.map(toLegacyGradeDistribution);
  });
}

export async function getGradeRanking(
  _credential: string,
  params?: {
    class_id?: string;
    course_code?: string;
    term?: string;
    student_id?: string;
  },
): Promise<GradeRanking> {
  return withProvider(async () =>
    toLegacyGradeRanking(
      await provider().getGradeRanking({
        semester: params?.term,
        studentId: params?.student_id,
        classId: params?.class_id,
        courseCode: params?.course_code,
      }),
    ),
  );
}

// ── Schedule ────────────────────────────────────────────

export async function getSchedule(
  _credential: string,
  term?: string,
): Promise<Course[]> {
  return withProvider(async () => {
    const rows = await provider().getSchedule({
      semester: term,
      includeLabSchedule: false,
    });
    return rows.map(toLegacyCourse);
  });
}

export async function getExperimentalSchedule(
  _credential: string,
  term?: string,
  course_category = "all",
): Promise<Course[]> {
  return withProvider(async () => {
    const rows = await provider().getSchedule({
      semester: term,
      courseCategory: course_category,
      includeLabSchedule: true,
    });
    return rows.map(toLegacyCourse);
  });
}

export async function getUnscheduledCourses(
  _credential: string,
  term?: string,
  course_category = "all",
): Promise<Course[]> {
  return withProvider(async () => {
    const rows = await provider().getUnscheduledCourses({
      semester: term,
      courseCategory: course_category,
    });
    return rows.map(toLegacyCourse);
  });
}

export async function getClassPeriods(_credential?: string): Promise<ClassPeriod[]> {
  return withProvider(async () =>
    (await provider().getClassPeriods()).map(toLegacyClassPeriod),
  );
}

export async function getTermCalendar(
  _credential: string,
  term?: string,
): Promise<TermCalendar> {
  return withProvider(async () =>
    toLegacyTermCalendar(await provider().getTermCalendar({ semester: term })),
  );
}

export async function getCurrentWeek(
  _credential: string,
  term?: string,
  date?: string,
): Promise<CurrentWeek> {
  return withProvider(async () =>
    toLegacyCurrentWeek(await provider().getCurrentWeek({ semester: term, date })),
  );
}

// ── Exams ───────────────────────────────────────────────

export async function getExams(
  _credential: string,
  term?: string,
): Promise<Exam[]> {
  return withProvider(async () =>
    (await provider().getExams({ semester: term })).map(toLegacyExam),
  );
}

// ── Training Plan / Academic ────────────────────────────

export async function getTrainingPlan(
  _credential: string,
  params?: { page_size?: number; page_number?: number },
): Promise<TrainingPlan[]> {
  return withProvider(async () => {
    const rows = await provider().getTrainingPlan({
      pageSize: params?.page_size ?? 999,
      pageNumber: params?.page_number ?? 1,
    });
    return rows.map(toLegacyTrainingPlan);
  });
}

export async function getAcademicCompletion(
  _credential: string,
): Promise<AcademicCompletion> {
  return withProvider(async () =>
    toLegacyAcademicCompletion(await provider().getAcademicCompletion()),
  );
}

export async function getAcademicWarnings(
  _credential: string,
): Promise<AcademicWarning[]> {
  return withProvider(async () =>
    (await provider().getAcademicWarnings()).map(toLegacyAcademicWarning),
  );
}

// ── Evaluation ──────────────────────────────────────────

export async function getEvaluationTypes(
  _credential: string,
  term?: string,
): Promise<EvaluationType[]> {
  return withProvider(async () =>
    (await provider().getEvaluationTypes({ semester: term })).map(
      toLegacyEvaluationType,
    ),
  );
}

export async function getPendingEvaluations(
  _credential: string,
  eval_type: string,
  term?: string,
): Promise<EvaluationTask[]> {
  return withProvider(async () =>
    (await provider().getPendingEvaluations(eval_type, { semester: term })).map(
      toLegacyEvaluationTask,
    ),
  );
}

export async function getEvaluationDetail(
  _credential: string,
  group_no: string,
  eval_type: string,
  sequence = 1,
): Promise<EvaluationDetail> {
  return withProvider(async () =>
    toLegacyEvaluationDetail(
      await provider().getEvaluationDetail({
        groupNo: group_no,
        evalType: eval_type,
        sequence,
      }),
    ),
  );
}

export async function calculateScore(
  _credential: string,
  payload: CalculateScoreRequest,
): Promise<Record<string, unknown>> {
  return withProvider(() =>
    provider().calculateEvaluationScore({
      groupNo: payload.group_no,
      wjid: payload.wjid,
      evalType: payload.eval_type,
      answers: payload.answers.map(toProviderEvaluationAnswer),
      teacherRelationId: payload.teacher_relation_id,
      courseName: payload.course_name,
      teacherName: payload.teacher_name,
      sequence: payload.sequence,
    }),
  );
}

export async function submitEvaluation(
  _credential: string,
  payload: SubmitEvaluationRequest,
): Promise<{ detail: string }> {
  return withProvider(async () => {
    await provider().submitEvaluation({
      groupNo: payload.group_no,
      wjid: payload.wjid,
      evalType: payload.eval_type,
      answers: payload.answers.map(toProviderEvaluationAnswer),
      teacherRelationId: payload.teacher_relation_id,
      courseName: payload.course_name,
      teacherName: payload.teacher_name,
      sequence: payload.sequence,
    });
    return { detail: "ok" };
  });
}

// ── Lesson / Activity ────────────────────────────────────

function requireMobile() {
  const activeProvider = provider();
  if (!activeProvider.mobile) {
    throw apiError("当前学校不支持移动端签到功能", "MOBILE_NOT_AVAILABLE");
  }
  return activeProvider.mobile;
}

export async function getCurrentLesson(
  _credential: string,
  params: {
    teach_class_id: string;
    teach_class_type: string;
    schedule_id: string;
    week: number;
    week_day: number;
    start_node: number;
    end_node: number;
  },
): Promise<CurrentLesson> {
  return withProvider(async () =>
    toLegacyCurrentLesson(
      await requireMobile().getCurrentLesson({
        teachClassId: params.teach_class_id,
        teachClassType: params.teach_class_type,
        scheduleId: params.schedule_id,
        week: params.week,
        weekDay: params.week_day,
        startNode: params.start_node,
        endNode: params.end_node,
      }),
    ),
  );
}

export async function getSigninDetail(
  _credential: string,
  params: {
    activity_id: string;
    title?: string;
  },
): Promise<SigninActivityDetail> {
  return withProvider(async () =>
    toLegacySigninActivityDetail(
      await requireMobile().getSigninDetail({
        activityId: params.activity_id,
        title: params.title,
      }),
    ),
  );
}

export async function getStudentSigninStatus(
  _credential: string,
  params: {
    activity_id: string;
    title?: string;
  },
): Promise<StudentSigninStatus> {
  return withProvider(async () =>
    toLegacyStudentSigninStatus(
      await requireMobile().getStudentSigninStatus({
        activityId: params.activity_id,
        title: params.title,
      }),
    ),
  );
}

export async function doStudentSign(
  _credential: string,
  params: {
    activity_id: string;
    accuracy?: number;
    latitude?: number;
    longitude?: number;
    code?: string;
  },
): Promise<StudentSignResult> {
  return withProvider(async () =>
    toLegacyStudentSignResult(
      await requireMobile().doStudentSign({
        activityId: params.activity_id,
        accuracy: params.accuracy,
        latitude: params.latitude,
        longitude: params.longitude,
        code: params.code,
      }),
    ),
  );
}
