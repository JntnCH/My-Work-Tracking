export const CONNECTION_TEST_KEYS = [
  "googleAccount",
  "serviceAccount",
  "spreadsheetId",
  "spreadsheetAccess",
  "readTest",
  "writeTest",
  "updateTest",
  "deleteTest",
] as const;

export type ConnectionTestKey = (typeof CONNECTION_TEST_KEYS)[number];

export type ConnectionTestResult = Record<ConnectionTestKey, boolean> & {
  errorDetails: string;
};

export function countPassedConnectionTests(
  result: Pick<ConnectionTestResult, ConnectionTestKey>,
): number {
  return CONNECTION_TEST_KEYS.filter((key) => result[key]).length;
}

export function allConnectionTestsPassed(
  result: Pick<ConnectionTestResult, ConnectionTestKey>,
): boolean {
  return countPassedConnectionTests(result) === CONNECTION_TEST_KEYS.length;
}
