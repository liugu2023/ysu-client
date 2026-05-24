/**
 * Demo 模式 —— 完全离线 mock 数据。
 *
 * 所有 API 调用直接返回预设数据，不发起任何网络请求。
 */

export const IS_DEMO = true;
export const DEMO_USERNAME = "2023123456";
export const DEMO_PASSWORD = "demo";

import type {
  StudentInfo,
  Grade,
  GPAStats,
  GradeStatistics,
  GradeDistribution,
  GradeRanking,
  Course,
  ClassPeriod,
  TermCalendar,
  CurrentWeek,
  Exam,
  TrainingPlan,
  AcademicCompletion,
  AcademicWarning,
  EvaluationType,
  EvaluationTask,
  EvaluationDetail,
  CurrentLesson,
  SigninActivityDetail,
  StudentSigninStatus,
  StudentSignResult,
  LoginResponse,
  Step1Response,
  StatusResponse,
  MFAChallengeResponse,
} from "./types";

// ─── Student Info ────────────────────────────────────────────────────────

export const mockStudentInfo: StudentInfo = {
  name: "李明远",
  name_pinyin: "Li Mingyuan",
  student_id: "2023123456",
  gender: "男",
  nation: "汉族",
  nationality: "中国",
  department: "信息科学与工程学院",
  major: "计算机科学与技术",
  class_name: "计科2301班",
  grade_level: "2023级",
  enrollment_date: "2023-09",
  expected_graduation: "2027-06",
  education_level: "本科",
  campus: "东校区",
  student_status: "在读",
  discipline: "工学",
  study_duration: "4",
  foreign_language: "英语",
};

// ─── Grades ──────────────────────────────────────────────────────────────

export const mockGrades: Grade[] = [
  {
    course_name: "高等数学 A(I)",
    course_code: "MATH101",
    class_id: "MATH101_01",
    score: "92",
    grade_level: "优秀",
    grade_point: "4.0",
    credit: "5.0",
    hours: "80",
    term: "2023-2024-1",
    course_type: "必修",
    course_category: "通识基础",
    exam_type: "考试",
    study_mode: "正常",
    is_major: true,
    is_retake: "正常",
    grade_level_type: "百分制",
    department: "理学院",
    is_pass: true,
    is_valid: true,
    special_reason: "",
    is_degree_course: true,
    project_name: "",
  },
  {
    course_name: "大学英语(I)",
    course_code: "ENG101",
    class_id: "ENG101_03",
    score: "88",
    grade_level: "良好",
    grade_point: "3.7",
    credit: "4.0",
    hours: "64",
    term: "2023-2024-1",
    course_type: "必修",
    course_category: "通识基础",
    exam_type: "考试",
    study_mode: "正常",
    is_major: false,
    is_retake: "正常",
    grade_level_type: "百分制",
    department: "外国语学院",
    is_pass: true,
    is_valid: true,
    special_reason: "",
    is_degree_course: true,
    project_name: "",
  },
  {
    course_name: "程序设计基础(C语言)",
    course_code: "CS101",
    class_id: "CS101_02",
    score: "95",
    grade_level: "优秀",
    grade_point: "4.0",
    credit: "4.0",
    hours: "64",
    term: "2023-2024-1",
    course_type: "必修",
    course_category: "专业基础",
    exam_type: "考试",
    study_mode: "正常",
    is_major: true,
    is_retake: "正常",
    grade_level_type: "百分制",
    department: "信息科学与工程学院",
    is_pass: true,
    is_valid: true,
    special_reason: "",
    is_degree_course: true,
    project_name: "",
  },
  {
    course_name: "线性代数",
    course_code: "MATH201",
    class_id: "MATH201_01",
    score: "89",
    grade_level: "良好",
    grade_point: "3.7",
    credit: "3.0",
    hours: "48",
    term: "2023-2024-2",
    course_type: "必修",
    course_category: "通识基础",
    exam_type: "考试",
    study_mode: "正常",
    is_major: true,
    is_retake: "正常",
    grade_level_type: "百分制",
    department: "理学院",
    is_pass: true,
    is_valid: true,
    special_reason: "",
    is_degree_course: true,
    project_name: "",
  },
  {
    course_name: "离散数学",
    course_code: "CS201",
    class_id: "CS201_01",
    score: "91",
    grade_level: "优秀",
    grade_point: "4.0",
    credit: "3.5",
    hours: "56",
    term: "2023-2024-2",
    course_type: "必修",
    course_category: "专业基础",
    exam_type: "考试",
    study_mode: "正常",
    is_major: true,
    is_retake: "正常",
    grade_level_type: "百分制",
    department: "信息科学与工程学院",
    is_pass: true,
    is_valid: true,
    special_reason: "",
    is_degree_course: true,
    project_name: "",
  },
  {
    course_name: "数据结构",
    course_code: "CS202",
    class_id: "CS202_01",
    score: "94",
    grade_level: "优秀",
    grade_point: "4.0",
    credit: "4.5",
    hours: "72",
    term: "2024-2025-1",
    course_type: "必修",
    course_category: "专业核心",
    exam_type: "考试",
    study_mode: "正常",
    is_major: true,
    is_retake: "正常",
    grade_level_type: "百分制",
    department: "信息科学与工程学院",
    is_pass: true,
    is_valid: true,
    special_reason: "",
    is_degree_course: true,
    project_name: "",
  },
  {
    course_name: "概率论与数理统计",
    course_code: "MATH301",
    class_id: "MATH301_02",
    score: "87",
    grade_level: "良好",
    grade_point: "3.7",
    credit: "3.0",
    hours: "48",
    term: "2024-2025-1",
    course_type: "必修",
    course_category: "通识基础",
    exam_type: "考试",
    study_mode: "正常",
    is_major: true,
    is_retake: "正常",
    grade_level_type: "百分制",
    department: "理学院",
    is_pass: true,
    is_valid: true,
    special_reason: "",
    is_degree_course: true,
    project_name: "",
  },
  {
    course_name: "计算机组成原理",
    course_code: "CS301",
    class_id: "CS301_01",
    score: "90",
    grade_level: "优秀",
    grade_point: "4.0",
    credit: "4.0",
    hours: "64",
    term: "2024-2025-1",
    course_type: "必修",
    course_category: "专业核心",
    exam_type: "考试",
    study_mode: "正常",
    is_major: true,
    is_retake: "正常",
    grade_level_type: "百分制",
    department: "信息科学与工程学院",
    is_pass: true,
    is_valid: true,
    special_reason: "",
    is_degree_course: true,
    project_name: "",
  },
  {
    course_name: "马克思主义基本原理",
    course_code: "POL101",
    class_id: "POL101_05",
    score: "85",
    grade_level: "良好",
    grade_point: "3.3",
    credit: "3.0",
    hours: "48",
    term: "2024-2025-2",
    course_type: "必修",
    course_category: "思政课程",
    exam_type: "考查",
    study_mode: "正常",
    is_major: false,
    is_retake: "正常",
    grade_level_type: "百分制",
    department: "马克思主义学院",
    is_pass: true,
    is_valid: true,
    special_reason: "",
    is_degree_course: false,
    project_name: "",
  },
  {
    course_name: "操作系统",
    course_code: "CS302",
    class_id: "CS302_01",
    score: "93",
    grade_level: "优秀",
    grade_point: "4.0",
    credit: "4.5",
    hours: "72",
    term: "2024-2025-2",
    course_type: "必修",
    course_category: "专业核心",
    exam_type: "考试",
    study_mode: "正常",
    is_major: true,
    is_retake: "正常",
    grade_level_type: "百分制",
    department: "信息科学与工程学院",
    is_pass: true,
    is_valid: true,
    special_reason: "",
    is_degree_course: true,
    project_name: "",
  },
  {
    course_name: "计算机网络",
    course_code: "CS303",
    class_id: "CS303_01",
    score: "91",
    grade_level: "优秀",
    grade_point: "4.0",
    credit: "4.0",
    hours: "64",
    term: "2024-2025-2",
    course_type: "必修",
    course_category: "专业核心",
    exam_type: "考试",
    study_mode: "正常",
    is_major: true,
    is_retake: "正常",
    grade_level_type: "百分制",
    department: "信息科学与工程学院",
    is_pass: true,
    is_valid: true,
    special_reason: "",
    is_degree_course: true,
    project_name: "",
  },
  {
    course_name: "数据库原理",
    course_code: "CS304",
    class_id: "CS304_01",
    score: "90",
    grade_level: "优秀",
    grade_point: "4.0",
    credit: "3.5",
    hours: "56",
    term: "2024-2025-2",
    course_type: "必修",
    course_category: "专业核心",
    exam_type: "考试",
    study_mode: "正常",
    is_major: true,
    is_retake: "正常",
    grade_level_type: "百分制",
    department: "信息科学与工程学院",
    is_pass: true,
    is_valid: true,
    special_reason: "",
    is_degree_course: true,
    project_name: "",
  },
];

// ─── GPA Stats ───────────────────────────────────────────────────────────

export const mockGpaStats: GPAStats = {
  plan_name: "2023级计算机科学与技术专业培养方案",
  study_type: "主修",
  required_credit_earned: "42.5",
  elective_credit_earned: "8.0",
  degree_credit_earned: "38.5",
  required_credit_failed: "0.0",
  gpa_initial: "3.82",
  gpa_highest: "3.82",
  required_gpa_highest: "3.85",
  degree_gpa_initial: "3.90",
  degree_gpa_highest: "3.90",
  weighted_avg: "90.3",
  arithmetic_avg: "90.8",
  degree_weighted_avg: "91.2",
};

// ─── Grade Statistics ────────────────────────────────────────────────────

export const mockGradeStatistics: GradeStatistics = {
  scope: "class",
  term: "2024-2025-2",
  class_id: "CS302_01",
  course_code: "CS302",
  highest_score: 98,
  lowest_score: 62,
  average_score: 84.5,
};

// ─── Grade Distribution ──────────────────────────────────────────────────

export const mockGradeDistribution: GradeDistribution[] = [
  { scope: "class", term: "2024-2025-2", class_id: "CS302_01", course_code: "CS302", level_code: "A", level_name: "90-100", count: 8 },
  { scope: "class", term: "2024-2025-2", class_id: "CS302_01", course_code: "CS302", level_code: "B", level_name: "80-89", count: 18 },
  { scope: "class", term: "2024-2025-2", class_id: "CS302_01", course_code: "CS302", level_code: "C", level_name: "70-79", count: 10 },
  { scope: "class", term: "2024-2025-2", class_id: "CS302_01", course_code: "CS302", level_code: "D", level_name: "60-69", count: 4 },
];

// ─── Grade Ranking ───────────────────────────────────────────────────────

export const mockGradeRanking: GradeRanking = {
  scope: "class",
  term: "2024-2025-2",
  student_id: "2023123456",
  class_id: "CS302_01",
  course_code: "CS302",
  score: 93,
  rank: 3,
  total: 40,
  ranking_type: "成绩排名",
};

// ─── Schedule ────────────────────────────────────────────────────────────

export const mockSchedule: Course[] = [
  {
    name: "操作系统",
    code: "CS302",
    teacher: "王建国教授",
    classroom: "科技楼 A301",
    week_day: 1,
    start_section: 1,
    end_section: 2,
    weeks: "1-16周",
    credit: "4.5",
    course_type: "必修",
    class_id: "CS302_01",
    syxzdm: "",
    schedule_id: "S001",
    class_type: "1",
  },
  {
    name: "计算机网络",
    code: "CS303",
    teacher: "陈志华副教授",
    classroom: "科技楼 B205",
    week_day: 1,
    start_section: 3,
    end_section: 4,
    weeks: "1-16周",
    credit: "4.0",
    course_type: "必修",
    class_id: "CS303_01",
    syxzdm: "",
    schedule_id: "S002",
    class_type: "1",
  },
  {
    name: "数据库原理",
    code: "CS304",
    teacher: "刘芳教授",
    classroom: "科技楼 A302",
    week_day: 2,
    start_section: 1,
    end_section: 2,
    weeks: "1-16周",
    credit: "3.5",
    course_type: "必修",
    class_id: "CS304_01",
    syxzdm: "",
    schedule_id: "S003",
    class_type: "1",
  },
  {
    name: "操作系统实验",
    code: "CS302L",
    teacher: "王建国教授",
    classroom: "计算机实验中心 302",
    week_day: 2,
    start_section: 5,
    end_section: 6,
    weeks: "1-16周(双周)",
    credit: "0.5",
    course_type: "必修",
    class_id: "CS302L_01",
    syxzdm: "",
    schedule_id: "S004",
    class_type: "2",
  },
  {
    name: "马克思主义基本原理",
    code: "POL101",
    teacher: "孙丽讲师",
    classroom: "文科楼 C101",
    week_day: 3,
    start_section: 3,
    end_section: 4,
    weeks: "1-12周",
    credit: "3.0",
    course_type: "必修",
    class_id: "POL101_05",
    syxzdm: "",
    schedule_id: "S005",
    class_type: "1",
  },
  {
    name: "计算机网络实验",
    code: "CS303L",
    teacher: "陈志华副教授",
    classroom: "网络实验室 401",
    week_day: 3,
    start_section: 5,
    end_section: 6,
    weeks: "1-16周(单周)",
    credit: "0.5",
    course_type: "必修",
    class_id: "CS303L_01",
    syxzdm: "",
    schedule_id: "S006",
    class_type: "2",
  },
  {
    name: "数据库原理实验",
    code: "CS304L",
    teacher: "刘芳教授",
    classroom: "计算机实验中心 305",
    week_day: 4,
    start_section: 3,
    end_section: 4,
    weeks: "1-16周",
    credit: "0.5",
    course_type: "必修",
    class_id: "CS304L_01",
    syxzdm: "",
    schedule_id: "S007",
    class_type: "2",
  },
  {
    name: "形势与政策",
    code: "POL202",
    teacher: "张强教授",
    classroom: "文科楼 C201",
    week_day: 4,
    start_section: 7,
    end_section: 8,
    weeks: "9-12周",
    credit: "0.5",
    course_type: "必修",
    class_id: "POL202_01",
    syxzdm: "",
    schedule_id: "S008",
    class_type: "1",
  },
  {
    name: "体育(IV)",
    code: "PE104",
    teacher: "赵伟教练",
    classroom: "体育馆",
    week_day: 5,
    start_section: 3,
    end_section: 4,
    weeks: "1-16周",
    credit: "1.0",
    course_type: "必修",
    class_id: "PE104_03",
    syxzdm: "",
    schedule_id: "S009",
    class_type: "1",
  },
];

// ─── Class Periods ───────────────────────────────────────────────────────

export const mockClassPeriods: ClassPeriod[] = [
  { name: "第1节", section: 1, start_time: "08:00", end_time: "08:45", is_in_use: true },
  { name: "第2节", section: 2, start_time: "08:50", end_time: "09:35", is_in_use: true },
  { name: "第3节", section: 3, start_time: "10:00", end_time: "10:45", is_in_use: true },
  { name: "第4节", section: 4, start_time: "10:50", end_time: "11:35", is_in_use: true },
  { name: "第5节", section: 5, start_time: "14:00", end_time: "14:45", is_in_use: true },
  { name: "第6节", section: 6, start_time: "14:50", end_time: "15:35", is_in_use: true },
  { name: "第7节", section: 7, start_time: "16:00", end_time: "16:45", is_in_use: true },
  { name: "第8节", section: 8, start_time: "16:50", end_time: "17:35", is_in_use: true },
  { name: "第9节", section: 9, start_time: "19:00", end_time: "19:45", is_in_use: true },
  { name: "第10节", section: 10, start_time: "19:50", end_time: "20:35", is_in_use: true },
];

// ─── Term Calendar ───────────────────────────────────────────────────────

export const mockTermCalendar: TermCalendar = {
  term: "2024-2025-2",
  start_date: "2025-02-24",
  total_weeks: 20,
  teaching_weeks: 16,
  is_in_use: true,
};

// ─── Current Week ────────────────────────────────────────────────────────

export const mockCurrentWeek: CurrentWeek = {
  week: 12,
  weekday: 3,
  term: "2024-2025-2",
  date: "2025-05-14",
};

// ─── Exams ───────────────────────────────────────────────────────────────

export const mockExams: Exam[] = [
  {
    name: "操作系统",
    exam_name: "期末考试",
    exam_date: "2025-06-25",
    exam_time: "08:00-10:00",
    exam_location: "科技楼 A301",
    seat_number: "15",
  },
  {
    name: "计算机网络",
    exam_name: "期末考试",
    exam_date: "2025-06-27",
    exam_time: "14:00-16:00",
    exam_location: "科技楼 B205",
    seat_number: "08",
  },
  {
    name: "数据库原理",
    exam_name: "期末考试",
    exam_date: "2025-06-30",
    exam_time: "10:00-12:00",
    exam_location: "科技楼 A302",
    seat_number: "22",
  },
  {
    name: "马克思主义基本原理",
    exam_name: "期末考试",
    exam_date: "2025-06-23",
    exam_time: "08:00-10:00",
    exam_location: "文科楼 C101",
    seat_number: "31",
  },
];

// ─── Training Plan ───────────────────────────────────────────────────────

export const mockTrainingPlan: TrainingPlan[] = [
  { course_name: "高等数学 A(I)", course_code: "MATH101", credit: "5.0", course_type: "必修", required: true, term: "2023-2024-1", course_group: "通识基础" },
  { course_name: "高等数学 A(II)", course_code: "MATH102", credit: "5.0", course_type: "必修", required: true, term: "2023-2024-2", course_group: "通识基础" },
  { course_name: "线性代数", course_code: "MATH201", credit: "3.0", course_type: "必修", required: true, term: "2023-2024-2", course_group: "通识基础" },
  { course_name: "概率论与数理统计", course_code: "MATH301", credit: "3.0", course_type: "必修", required: true, term: "2024-2025-1", course_group: "通识基础" },
  { course_name: "大学英语(I)", course_code: "ENG101", credit: "4.0", course_type: "必修", required: true, term: "2023-2024-1", course_group: "通识基础" },
  { course_name: "大学英语(II)", course_code: "ENG102", credit: "4.0", course_type: "必修", required: true, term: "2023-2024-2", course_group: "通识基础" },
  { course_name: "程序设计基础(C语言)", course_code: "CS101", credit: "4.0", course_type: "必修", required: true, term: "2023-2024-1", course_group: "专业基础" },
  { course_name: "离散数学", course_code: "CS201", credit: "3.5", course_type: "必修", required: true, term: "2023-2024-2", course_group: "专业基础" },
  { course_name: "数据结构", course_code: "CS202", credit: "4.5", course_type: "必修", required: true, term: "2024-2025-1", course_group: "专业核心" },
  { course_name: "计算机组成原理", course_code: "CS301", credit: "4.0", course_type: "必修", required: true, term: "2024-2025-1", course_group: "专业核心" },
  { course_name: "操作系统", course_code: "CS302", credit: "4.5", course_type: "必修", required: true, term: "2024-2025-2", course_group: "专业核心" },
  { course_name: "计算机网络", course_code: "CS303", credit: "4.0", course_type: "必修", required: true, term: "2024-2025-2", course_group: "专业核心" },
  { course_name: "数据库原理", course_code: "CS304", credit: "3.5", course_type: "必修", required: true, term: "2024-2025-2", course_group: "专业核心" },
  { course_name: "人工智能导论", course_code: "CS401", credit: "2.0", course_type: "选修", required: false, term: "2025-2026-1", course_group: "专业选修" },
  { course_name: "机器学习", course_code: "CS402", credit: "3.0", course_type: "选修", required: false, term: "2025-2026-1", course_group: "专业选修" },
];

// ─── Academic Completion ─────────────────────────────────────────────────

export const mockAcademicCompletion: AcademicCompletion = {
  plan_name: "2023级计算机科学与技术专业培养方案",
  total_required: "165.0",
  completed: "62.5",
  elective: "8.0",
  passed: true,
};

// ─── Academic Warnings ───────────────────────────────────────────────────

export const mockAcademicWarnings: AcademicWarning[] = [];

// ─── Evaluation ──────────────────────────────────────────────────────────

export const mockEvaluationTypes: EvaluationType[] = [
  { name: "学生评教", code: "01", count: 2 },
  { name: "课程反馈", code: "02", count: 0 },
];

export const mockPendingEvaluations: EvaluationTask[] = [
  {
    wid: "W001",
    wjid: "WJ001",
    name: "2024-2025-2学期学生评教",
    course_name: "操作系统",
    teacher_name: "王建国",
    teacher_id: "T001",
    term: "2024-2025-2",
    term_name: "2024-2025学年第二学期",
    eval_type: "01",
    eval_type_name: "学生评教",
    category: "01",
    category_name: "理论课",
    start_time: "2025-05-10 00:00:00",
    end_time: "2025-06-10 23:59:59",
    sequence: 1,
    class_name: "计科2301班",
    group_no: "G001",
  },
  {
    wid: "W002",
    wjid: "WJ002",
    name: "2024-2025-2学期学生评教",
    course_name: "计算机网络",
    teacher_name: "陈志华",
    teacher_id: "T002",
    term: "2024-2025-2",
    term_name: "2024-2025学年第二学期",
    eval_type: "01",
    eval_type_name: "学生评教",
    category: "01",
    category_name: "理论课",
    start_time: "2025-05-10 00:00:00",
    end_time: "2025-06-10 23:59:59",
    sequence: 1,
    class_name: "计科2301班",
    group_no: "G002",
  },
];

export const mockEvaluationDetail: EvaluationDetail = {
  wjid: "WJ001",
  name: "2024-2025-2学期学生评教",
  deadline: "2025-06-10",
  questions: [
    {
      tmid: "Q001",
      wjid: "WJ001",
      text: "教师教学态度认真负责",
      question_type: "01",
      max_score: 10,
      order: 1,
      options: [
        { wid: "O001", text: "非常满意", score: 10, score_ratio: 1.0, question_id: "Q001" },
        { wid: "O002", text: "满意", score: 8, score_ratio: 0.8, question_id: "Q001" },
        { wid: "O003", text: "一般", score: 6, score_ratio: 0.6, question_id: "Q001" },
        { wid: "O004", text: "不满意", score: 4, score_ratio: 0.4, question_id: "Q001" },
      ],
    },
    {
      tmid: "Q002",
      wjid: "WJ001",
      text: "教师授课内容充实、条理清晰",
      question_type: "01",
      max_score: 10,
      order: 2,
      options: [
        { wid: "O005", text: "非常满意", score: 10, score_ratio: 1.0, question_id: "Q002" },
        { wid: "O006", text: "满意", score: 8, score_ratio: 0.8, question_id: "Q002" },
        { wid: "O007", text: "一般", score: 6, score_ratio: 0.6, question_id: "Q002" },
        { wid: "O008", text: "不满意", score: 4, score_ratio: 0.4, question_id: "Q002" },
      ],
    },
    {
      tmid: "Q003",
      wjid: "WJ001",
      text: "对课程的整体评价和建议",
      question_type: "02",
      max_score: 10,
      order: 3,
      options: [],
    },
  ],
  teachers: [{ name: "王建国", teacherId: "T001" }],
};

// ─── Mobile Lesson / Signin ──────────────────────────────────────────────

export const mockCurrentLesson: CurrentLesson = {
  lesson_id: "L001",
  activity_list: [
    {
      activity_id: "A001",
      type: 1,
      status: 1,
      title: "课堂签到",
      icon: "signin",
      sign_type: "1",
      sign_clazz: "normal",
      is_end: false,
      is_creator: false,
      create_time: "2025-05-14 09:00:00",
    },
    {
      activity_id: "A002",
      type: 2,
      status: 1,
      title: "课堂讨论",
      icon: "discuss",
      sign_type: null,
      sign_clazz: null,
      is_end: false,
      is_creator: false,
      create_time: "2025-05-14 09:05:00",
    },
  ],
};

export const mockSigninDetail: SigninActivityDetail = {
  activity_id: "A001",
  duration: 300,
  end_time: "2025-05-14 09:10:00",
  left_seconds: 180,
  signin_type: 1,
  start_time: "2025-05-14 09:00:00",
};

export const mockStudentSigninStatus: StudentSigninStatus = {
  sign_status: 1,
  attendance_status: 1,
  sign_order: 5,
  signin_type: 1,
};

export const mockStudentSignResult: StudentSignResult = {
  sign_status: 2,
  attendance_status: 1,
  sign_order: 6,
  signin_type: 1,
};

// ─── Demo Credential ─────────────────────────────────────────────────────

export function getDemoCredential(): string {
  return JSON.stringify({
    cookies: [
      {
        name: "CASTGC",
        value: "demo-castgc-token",
        domain: "cer.ysu.edu.cn",
        path: "/authserver",
      },
    ],
  }, null, 2);
}

// ─── Demo Auth Helpers ───────────────────────────────────────────────────

export function getDemoLoginResponse(): LoginResponse {
  return { credential: getDemoCredential() };
}

export function getDemoStep1Response(username: string): Step1Response {
  return {
    authenticated: true,
    needs_mfa: false,
    username,
    credential: getDemoCredential(),
  };
}

export function getDemoStatusResponse(): StatusResponse {
  return { authenticated: true };
}

export function getDemoMFAChallenge(username: string): MFAChallengeResponse {
  return {
    method: "sms",
    method_code: "sms",
    mobile_hint: "138****5678",
    username,
  };
}
