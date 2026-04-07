/**
 * Normalize `project_progress.steps` from the API to six UI stages aligned with
 * second-party fields: papers → plans → logo → prices → marketing license → advertiser.
 *
 * Legacy 7-step API: 1 papers, 2 plans, 3 logo, 4 completion cert, 5 prices,
 * 6 warranties, 7 advertiser → UI step 5 is completed only when both old 4 and 6 are done.
 *
 * @param {Array<{ step_number?: number, completed?: boolean, label_ar?: string }>|undefined|null} steps
 * @returns {Array<{ step_number: number, completed?: boolean, label_ar?: string }>}
 */
export function normalizeProjectProgressSteps(steps) {
  if (!Array.isArray(steps) || steps.length === 0) return [];
  const sorted = [...steps].sort((a, b) => Number(a.step_number) - Number(b.step_number));
  if (sorted.length === 7) {
    const by = Object.fromEntries(sorted.map(s => [Number(s.step_number), s]));
    return [
      by[1],
      by[2],
      by[3],
      by[5] ? { ...by[5], step_number: 4 } : null,
      {
        step_number: 5,
        label_ar: 'شهادة اتمام و ضمانات',
        completed: !!(by[4]?.completed && by[6]?.completed),
      },
      by[7] ? { ...by[7], step_number: 6 } : null,
    ].filter(Boolean);
  }
  if (sorted.length > 6) return sorted.slice(0, 6);
  return sorted;
}

/**
 * @param {{ steps?: Array<{ completed?: boolean }> }|null|undefined} progress
 */
export function isProjectProgressFullyCompleted(progress) {
  const norm = normalizeProjectProgressSteps(progress?.steps);
  return norm.length > 0 && norm.every(s => s.completed);
}
