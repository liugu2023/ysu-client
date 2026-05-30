/**
 * @fileoverview Capability declaration utilities for AcademicProvider.
 *
 * Provides constant objects representing full and empty capability sets,
 * along with helper functions for inspecting capability flags.
 */

import { AcademicCapabilities } from "./types";

/** All capabilities enabled. */
export const ALL_CAPABILITIES: AcademicCapabilities = {
  grades: true,
  schedule: true,
  exams: true,
  gpa: true,
  evaluation: true,
  trainingPlan: true,
  studentInfo: true,
  currentWeek: true,
};

/** All capabilities disabled. */
export const NO_CAPABILITIES: AcademicCapabilities = {
  grades: false,
  schedule: false,
  exams: false,
  gpa: false,
  evaluation: false,
  trainingPlan: false,
  studentInfo: false,
  currentWeek: false,
};

/**
 * Check whether a specific capability is enabled.
 *
 * @param capabilities - The capability flags object to inspect.
 * @param key - The capability key to check.
 * @returns `true` if the capability is enabled.
 */
export function hasCapability(
  capabilities: AcademicCapabilities,
  key: keyof AcademicCapabilities
): boolean {
  return capabilities[key] === true;
}

/**
 * Return a list of all enabled capability keys.
 *
 * @param capabilities - The capability flags object to inspect.
 * @returns Array of keys whose values are `true`.
 */
export function getEnabledCapabilities(
  capabilities: AcademicCapabilities
): string[] {
  return (Object.keys(capabilities) as (keyof AcademicCapabilities)[]).filter(
    (key) => capabilities[key] === true
  );
}
