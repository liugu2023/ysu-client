import type { AcademicCapabilities, AcademicProvider } from "./types";

export abstract class BaseProvider implements AcademicProvider {
  abstract readonly id: string;
  abstract readonly name: string;
  abstract readonly capabilities: AcademicCapabilities;

  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;
    await this.onInitialize();
    this.initialized = true;
  }

  async reset(): Promise<void> {
    await this.onReset();
    this.initialized = false;
  }

  protected async onInitialize(): Promise<void> {}

  protected async onReset(): Promise<void> {}

  abstract prepareLogin(): Promise<void>;
  abstract resetLoginSession(): Promise<void> | void;
  abstract getCaptchaUrl(): string | null;
  abstract checkCaptchaNeeded(username: string): Promise<boolean>;
  abstract login(credential: import("./types").Credential): Promise<void>;
  abstract loginStep1(input: import("./types").LoginStep1Input): Promise<import("./types").LoginStep1Result>;
  abstract requestMfaCode(input: import("./types").MfaRequestInput): Promise<import("./types").MfaChallenge>;
  abstract submitMfaCode(input: import("./types").MfaSubmitInput): Promise<string>;
  abstract initiateWechatMfa(): Promise<import("./types").WechatMfaContext>;
  abstract pollWechatMfaQr(uuid: string, lastErrcode?: number): Promise<import("./types").WechatQrPollResult>;
  abstract completeWechatMfa(code: string, state: string): Promise<string>;
  abstract checkAuthStatus(): Promise<import("./types").AuthStatus>;
  abstract logout(): Promise<void>;
  abstract isAuthenticated(): boolean;
  abstract getStudentInfo(): Promise<import("./types").StudentInfo>;
  abstract getGrades(options?: import("./types").GradeQueryOptions): Promise<import("./types").Grade[]>;
  abstract getGPAStats(options?: import("./types").GPAQueryOptions): Promise<import("./types").GPAStats>;
  abstract getGradeStatistics(options?: import("./types").GradeAnalyticsQueryOptions): Promise<import("./types").GradeStatistics>;
  abstract getGradeDistribution(options?: import("./types").GradeAnalyticsQueryOptions): Promise<import("./types").GradeDistribution[]>;
  abstract getGradeRanking(options?: import("./types").GradeRankingQueryOptions): Promise<import("./types").GradeRanking>;
  abstract getSchedule(options?: import("./types").ScheduleQueryOptions): Promise<import("./types").Course[]>;
  abstract getUnscheduledCourses(options?: import("./types").UnscheduledCourseQueryOptions): Promise<import("./types").Course[]>;
  abstract getClassPeriods(): Promise<import("./types").ClassPeriod[]>;
  abstract getTermCalendar(options?: import("./types").TermCalendarQueryOptions): Promise<import("./types").TermCalendar>;
  abstract getCurrentWeek(options?: import("./types").CurrentWeekQueryOptions): Promise<import("./types").CurrentWeek>;
  abstract getCurrentWeekNumber(options?: import("./types").CurrentWeekQueryOptions): Promise<number>;
  abstract getExams(options?: import("./types").ExamQueryOptions): Promise<import("./types").Exam[]>;
  abstract getTrainingPlan(options?: import("./types").PageQueryOptions): Promise<import("./types").TrainingPlan[]>;
  abstract getAcademicCompletion(): Promise<import("./types").AcademicCompletion>;
  abstract getAcademicWarnings(): Promise<import("./types").AcademicWarning[]>;
  abstract getEvaluationTypes(options?: import("./types").TermQueryOptions): Promise<import("./types").EvaluationType[]>;
  abstract getPendingEvaluations(evalType: string, options?: import("./types").TermQueryOptions): Promise<import("./types").EvaluationTask[]>;
  abstract getEvaluationTasks(options?: import("./types").TermQueryOptions): Promise<import("./types").EvaluationTask[]>;
  abstract getEvaluationDetail(query: import("./types").EvaluationDetailQuery): Promise<import("./types").EvaluationDetail>;
  abstract calculateEvaluationScore(input: import("./types").EvaluationScoreInput): Promise<Record<string, unknown>>;
  abstract submitEvaluation(input: import("./types").EvaluationSubmitInput): Promise<void>;
}
