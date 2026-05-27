import { getSchoolConfig, serverConfig } from "./server-config";

export interface NativeFieldMappings {
  grade: Record<string, string[]>;
  exam: Record<string, string[]>;
}

export interface NativeApiPath {
  appId: string;
  path: string;
}

export interface NativeServerConfig {
  cerBaseUrl: string;
  jwxtBaseUrl: string;
  fieldMappings: NativeFieldMappings;
  apiPaths: {
    grades: NativeApiPath;
    exams: NativeApiPath;
    currentTerm: NativeApiPath;
  };
  configVersion: number;
}

export function buildNativeServerConfig(): NativeServerConfig {
  const config = getSchoolConfig();
  return {
    cerBaseUrl: serverConfig.cerBaseUrl,
    jwxtBaseUrl: serverConfig.jwxtBaseUrl,
    fieldMappings: {
      grade: {
        courseName: ["XSKCM", "KCM"],
        courseCode: ["XSKCH", "KCH"],
        score: ["ZCJ", "XSZCJMC"],
        gradeLevel: ["XSZCJMC"],
        gradePoint: ["XFJD"],
        credit: ["XF"],
        hours: ["XS"],
        term: ["XNXQDM"],
        courseType: ["KCXZDM_DISPLAY", "KCXZDM"],
        courseCategory: ["KCLBDM_DISPLAY"],
        examType: ["KSLXDM_DISPLAY", "KSLXDM"],
        studyMode: ["XDFSDM_DISPLAY"],
        isMajor: ["SFZX"],
        isRetake: ["CXCKDM_DISPLAY"],
        gradeLevelType: ["XSDJCJLXDM_DISPLAY"],
        department: ["KKDWDM_DISPLAY"],
        isPass: ["SFJG"],
        isValid: ["SFYX"],
        specialReason: ["TSYYDM_DISPLAY"],
        isDegreeCourse: ["SFZGKC"],
        projectName: ["TYXMDM_DISPLAY"],
      },
      exam: {
        name: ["KCM"],
        examName: ["KSMC"],
        examDate: ["KSRQ"],
        examTime: ["KSSJMS", "KSSJ"],
        examLocation: ["JASMC"],
        seatNumber: ["ZWH"],
      },
    },
    apiPaths: {
      grades: {
        appId: config.jwxt.appIds.cjcx,
        path: config.jwxt.apiPaths.cjcx,
      },
      exams: {
        appId: config.jwxt.appIds.studentWdksapApp,
        path: config.jwxt.apiPaths.wdksap,
      },
      currentTerm: {
        appId: config.jwxt.appIds.studentWdksapApp,
        path: config.jwxt.apiPaths.wdksap_dqxnxq,
      },
    },
    configVersion: 1,
  };
}
