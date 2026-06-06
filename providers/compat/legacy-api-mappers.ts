import type * as Legacy from "@/lib/types";
import type * as Provider from "../types";

export function toLegacyStudentInfo(info: Provider.StudentInfo): Legacy.StudentInfo {
  return {
    name: info.name,
    name_pinyin: info.namePinyin,
    student_id: info.studentId,
    gender: info.gender,
    nation: info.nation,
    nationality: info.nationality,
    department: info.department,
    major: info.major,
    class_name: info.className,
    grade_level: info.gradeLevel,
    enrollment_date: info.enrollmentDate,
    expected_graduation: info.expectedGraduation,
    education_level: info.educationLevel,
    campus: info.campus,
    student_status: info.studentStatus,
    discipline: info.discipline,
    study_duration: info.studyDuration,
    foreign_language: info.foreignLanguage,
  };
}

export function toLegacyGrade(grade: Provider.Grade): Legacy.Grade {
  return {
    course_name: grade.courseName,
    course_code: grade.courseCode,
    class_id: grade.classId,
    score: grade.score,
    grade_level: grade.gradeLevel,
    grade_point: grade.gradePoint,
    credit: grade.credit,
    hours: grade.hours,
    term: grade.semester,
    course_type: grade.courseType,
    course_category: grade.courseCategory,
    exam_type: grade.examType,
    study_mode: grade.studyMode,
    is_major: grade.isMajor,
    is_retake: grade.isRetake,
    grade_level_type: grade.gradeLevelType,
    department: grade.department,
    is_pass: grade.isPass,
    is_valid: grade.isValid,
    special_reason: grade.specialReason,
    is_degree_course: grade.isDegreeCourse,
    project_name: grade.projectName,
  };
}

export function toLegacyGPAStats(stats: Provider.GPAStats): Legacy.GPAStats {
  return {
    plan_name: stats.planName,
    study_type: stats.studyType,
    required_credit_earned: stats.requiredCreditEarned,
    elective_credit_earned: stats.electiveCreditEarned,
    degree_credit_earned: stats.degreeCreditEarned,
    required_credit_failed: stats.requiredCreditFailed,
    gpa_initial: stats.gpaInitial,
    gpa_highest: stats.gpaHighest,
    required_gpa_highest: stats.requiredGpaHighest,
    degree_gpa_initial: stats.degreeGpaInitial,
    degree_gpa_highest: stats.degreeGpaHighest,
    weighted_avg: stats.weightedAvg,
    arithmetic_avg: stats.arithmeticAvg,
    degree_weighted_avg: stats.degreeWeightedAvg,
  };
}

export function toLegacyGradeStatistics(stats: Provider.GradeStatistics): Legacy.GradeStatistics {
  return {
    scope: stats.scope,
    term: stats.semester,
    class_id: stats.classId,
    course_code: stats.courseCode,
    highest_score: stats.highestScore,
    lowest_score: stats.lowestScore,
    average_score: stats.averageScore,
  };
}

export function toLegacyGradeDistribution(row: Provider.GradeDistribution): Legacy.GradeDistribution {
  return {
    scope: row.scope,
    term: row.semester,
    class_id: row.classId,
    course_code: row.courseCode,
    level_code: row.levelCode,
    level_name: row.levelName,
    count: row.count,
  };
}

export function toLegacyGradeRanking(ranking: Provider.GradeRanking): Legacy.GradeRanking {
  return {
    scope: ranking.scope,
    term: ranking.semester,
    student_id: ranking.studentId,
    class_id: ranking.classId,
    course_code: ranking.courseCode,
    score: ranking.score,
    rank: ranking.rank,
    total: ranking.total,
    ranking_type: ranking.rankingType,
  };
}

export function toLegacyCourse(course: Provider.Course): Legacy.Course {
  return {
    name: course.name,
    code: course.code,
    teacher: course.teacher,
    classroom: course.classroom,
    week_day: course.weekDay,
    start_section: course.startSection,
    end_section: course.endSection,
    weeks: course.weeks,
    credit: course.credit,
    course_type: course.courseType,
    class_id: course.classId,
    syxzdm: course.syxzdm,
    schedule_id: course.scheduleId,
    class_type: course.classType,
    raw: course.raw,
  };
}

export function toLegacyClassPeriod(period: Provider.ClassPeriod): Legacy.ClassPeriod {
  return {
    name: period.name,
    section: period.section,
    start_time: period.startTime,
    end_time: period.endTime,
    is_in_use: period.isInUse,
  };
}

export function toLegacyTermCalendar(calendar: Provider.TermCalendar): Legacy.TermCalendar {
  return {
    term: calendar.semester,
    start_date: calendar.startDate,
    total_weeks: calendar.totalWeeks,
    teaching_weeks: calendar.teachingWeeks,
    is_in_use: calendar.isInUse,
  };
}

export function toLegacyCurrentWeek(week: Provider.CurrentWeek): Legacy.CurrentWeek {
  return {
    week: week.week,
    weekday: week.weekday,
    term: week.semester,
    date: week.date,
  };
}

export function toLegacyExam(exam: Provider.Exam): Legacy.Exam {
  return {
    name: exam.name,
    exam_name: exam.examName,
    exam_date: exam.examDate,
    exam_time: exam.examTime,
    exam_location: exam.examLocation,
    seat_number: exam.seatNumber,
  };
}

export function toLegacyTrainingPlan(plan: Provider.TrainingPlan): Legacy.TrainingPlan {
  return {
    course_name: plan.courseName,
    course_code: plan.courseCode,
    credit: plan.credit,
    course_type: plan.courseType,
    required: plan.required,
    term: plan.term,
    course_group: plan.courseGroup,
  };
}

export function toLegacyAcademicCompletion(completion: Provider.AcademicCompletion): Legacy.AcademicCompletion {
  return {
    plan_name: completion.planName,
    total_required: completion.totalRequired,
    completed: completion.completed,
    elective: completion.elective,
    passed: completion.passed,
  };
}

export function toLegacyAcademicWarning(warning: Provider.AcademicWarning): Legacy.AcademicWarning {
  return {
    warning_type: warning.warningType,
    warning_level: warning.warningLevel,
    description: warning.description,
    term: warning.term,
  };
}

export function toLegacyEvaluationType(type: Provider.EvaluationType): Legacy.EvaluationType {
  return {
    name: type.name,
    code: type.code,
    count: type.count,
  };
}

export function toLegacyEvaluationTask(task: Provider.EvaluationTask): Legacy.EvaluationTask {
  return {
    wid: task.wid,
    wjid: task.wjid,
    name: task.name,
    course_name: task.courseName,
    teacher_name: task.teacherName,
    teacher_id: task.teacherId,
    term: task.term,
    term_name: task.termName,
    eval_type: task.evalType,
    eval_type_name: task.evalTypeName,
    category: task.category,
    category_name: task.categoryName,
    start_time: task.startTime,
    end_time: task.endTime,
    sequence: task.sequence,
    class_name: task.className,
    group_no: task.groupNo,
  };
}

export function toLegacyEvaluationDetail(detail: Provider.EvaluationDetail): Legacy.EvaluationDetail {
  return {
    wjid: detail.wjid,
    name: detail.name,
    deadline: detail.deadline,
    questions: detail.questions.map((question) => ({
      tmid: question.tmid,
      wjid: question.wjid,
      text: question.text,
      question_type: question.questionType,
      max_score: question.maxScore,
      order: question.order,
      options: question.options.map((option) => ({
        wid: option.wid,
        text: option.text,
        score: option.score,
        score_ratio: option.scoreRatio,
        question_id: option.questionId,
      })),
    })),
    teachers: detail.teachers,
  };
}

export function toProviderEvaluationAnswer(answer: Legacy.EvaluationAnswer): Provider.EvaluationAnswer {
  return {
    tmid: answer.tmid,
    questionType: answer.question_type,
    optionIds: answer.option_ids,
    text: answer.text,
  };
}

export function toLegacyCurrentLesson(lesson: Provider.CurrentLesson): Legacy.CurrentLesson {
  return {
    lesson_id: lesson.lessonId,
    activity_list: lesson.activityList.map((activity) => ({
      activity_id: activity.activityId,
      type: activity.type,
      status: activity.status,
      title: activity.title,
      icon: activity.icon,
      sign_type: activity.signType,
      sign_clazz: activity.signClazz,
      is_end: activity.isEnd,
      is_creator: activity.isCreator,
      create_time: activity.createTime,
      raw: activity.raw,
    })),
    raw: lesson.raw,
  };
}

export function toLegacySigninActivityDetail(detail: Provider.SigninActivityDetail): Legacy.SigninActivityDetail {
  return {
    activity_id: detail.activityId,
    duration: detail.duration,
    end_time: detail.endTime,
    left_seconds: detail.leftSeconds,
    signin_type: detail.signinType,
    start_time: detail.startTime,
    raw: detail.raw,
  };
}

export function toLegacyStudentSigninStatus(status: Provider.StudentSigninStatus): Legacy.StudentSigninStatus {
  return {
    sign_status: status.signStatus,
    attendance_status: status.attendanceStatus,
    sign_order: status.signOrder,
    signin_type: status.signinType,
    raw: status.raw,
  };
}

export function toLegacyStudentSignResult(result: Provider.StudentSignResult): Legacy.StudentSignResult {
  return {
    sign_status: result.signStatus,
    attendance_status: result.attendanceStatus,
    sign_order: result.signOrder,
    signin_type: result.signinType,
    raw: result.raw,
  };
}
