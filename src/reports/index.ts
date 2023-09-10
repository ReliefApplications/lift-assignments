import { InvocationContext } from '@azure/functions';
import { getCaseReport } from './case';

/** All available reports */
export const AVAILABLE_REPORTS: {
  name: string;
  fn: (
    recordID: string,
    context: InvocationContext,
    token?: string
  ) => Promise<{ pdf: any; fileName: string }>;
}[] = [{ name: 'case', fn: getCaseReport }];

/**
 * Get a report by name
 *
 * @param name The name of the report
 * @returns The report function or null if not found
 */
export const getReport = (
  name: string
): (typeof AVAILABLE_REPORTS)[number]['fn'] | null =>
  AVAILABLE_REPORTS.find((x) => x.name === name)?.fn || null;
