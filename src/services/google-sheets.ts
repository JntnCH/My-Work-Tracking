import { google, sheets_v4 } from "googleapis";

export interface GoogleSheetsCredentials {
  clientEmail: string;
  privateKey: string;
}

export interface FetchSpreadsheetDataOptions {
  spreadsheetId: string;
  range?: string;
  accessToken?: string;
  valueRenderOption?: "FORMATTED_VALUE" | "UNFORMATTED_VALUE" | "FORMULA";
  dateTimeRenderOption?: "SERIAL_NUMBER" | "FORMATTED_STRING";
}

export interface SpreadsheetDataResponse {
  spreadsheetId: string;
  range: string;
  majorDimension: "ROWS" | "COLUMNS";
  values: (string | number | boolean | null)[][];
}

export interface SpreadsheetMetadata {
  spreadsheetId: string;
  title: string;
  locale?: string;
  timeZone?: string;
  sheets: {
    sheetId: number;
    title: string;
    index: number;
    rowCount?: number;
    columnCount?: number;
  }[];
}

const DEFAULT_SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive.readonly",
];

/**
 * Normalizes spreadsheet URL or ID into a clean ID string.
 */
export function normalizeSpreadsheetId(value: string): string {
  if (!value) return "";
  const trimmed = value.trim();
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  return match?.[1] ?? trimmed;
}

/**
 * Parses and retrieves Google service account credentials from environment variables.
 * Supports GOOGLE_SERVICE_ACCOUNT_JSON or (GOOGLE_SERVICE_ACCOUNT_EMAIL / GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY).
 */
export function getGoogleCredentialsFromEnv(): GoogleSheetsCredentials {
  const jsonStr = process.env["GOOGLE_SERVICE_ACCOUNT_JSON"]?.trim();

  if (jsonStr && jsonStr.startsWith("{")) {
    try {
      const parsed = JSON.parse(jsonStr) as {
        client_email?: string;
        private_key?: string;
      };
      if (parsed.client_email && parsed.private_key) {
        return {
          clientEmail: parsed.client_email,
          privateKey: parsed.private_key.replace(/\\n/g, "\n"),
        };
      }
    } catch {
      throw new Error(
        "Invalid GOOGLE_SERVICE_ACCOUNT_JSON environment variable: Failed to parse JSON.",
      );
    }
  }

  const clientEmail =
    process.env["GOOGLE_SERVICE_ACCOUNT_EMAIL"]?.trim() ||
    process.env["GOOGLE_CLIENT_EMAIL"]?.trim();

  const rawPrivateKey = process.env["GOOGLE_PRIVATE_KEY"]?.trim();

  if (!clientEmail || !rawPrivateKey) {
    const missingKeys: string[] = [];
    if (!clientEmail) missingKeys.push("GOOGLE_SERVICE_ACCOUNT_EMAIL / GOOGLE_CLIENT_EMAIL");
    if (!rawPrivateKey) missingKeys.push("GOOGLE_PRIVATE_KEY");

    throw new Error(
      `Missing Google credentials in environment variables: ${missingKeys.join(", ")}. Please set them in your environment or provide an OAuth access token.`,
    );
  }

  return {
    clientEmail,
    privateKey: rawPrivateKey.replace(/\\n/g, "\n"),
  };
}

/**
 * Authenticates and returns a connected Google Sheets API client (v4).
 * Uses OAuth2 access token if provided, or JWT service account credentials from environment variables.
 */
export async function getGoogleSheetsClient(options?: {
  accessToken?: string;
  scopes?: string[];
}): Promise<sheets_v4.Sheets> {
  const { accessToken, scopes = DEFAULT_SCOPES } = options ?? {};

  // 1. If an OAuth access token is provided, use it directly
  if (accessToken && accessToken.trim().length > 10) {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken.trim() });
    return google.sheets({ version: "v4", auth: oauth2Client });
  }

  // 2. Otherwise, authenticate with Service Account credentials from environment variables
  const credentials = getGoogleCredentialsFromEnv();

  const jwtClient = new google.auth.JWT({
    email: credentials.clientEmail,
    key: credentials.privateKey,
    scopes,
  });

  await jwtClient.authorize();

  return google.sheets({ version: "v4", auth: jwtClient });
}

/**
 * Fetches data (cell values) from a specific Google Spreadsheet and range.
 *
 * @param options Object containing spreadsheetId, optional range, and optional accessToken
 * @returns Object containing spreadsheetId, range, and 2D array of cell values
 *
 * @example
 * ```ts
 * const data = await fetchSpreadsheetData({
 *   spreadsheetId: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
 *   range: "Sheet1!A1:E20",
 * });
 * console.log(data.values);
 * ```
 */
export async function fetchSpreadsheetData(
  options: FetchSpreadsheetDataOptions,
): Promise<SpreadsheetDataResponse> {
  const spreadsheetId = normalizeSpreadsheetId(options.spreadsheetId);
  if (!spreadsheetId) {
    throw new Error("Invalid spreadsheetId: ID cannot be empty.");
  }

  const range = options.range?.trim() || "A:Z";

  try {
    const sheets = await getGoogleSheetsClient({
      accessToken: options.accessToken,
    });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
      valueRenderOption: options.valueRenderOption ?? "FORMATTED_VALUE",
      dateTimeRenderOption: options.dateTimeRenderOption ?? "FORMATTED_STRING",
    });

    return {
      spreadsheetId,
      range: response.data.range ?? range,
      majorDimension: (response.data.majorDimension as "ROWS" | "COLUMNS") ?? "ROWS",
      values: (response.data.values ?? []) as (string | number | boolean | null)[][],
    };
  } catch (error: unknown) {
    throw formatGoogleSheetsError(error, spreadsheetId, range);
  }
}

/**
 * Fetches structured rows (parsed as objects based on the first row's header names).
 */
export async function fetchSpreadsheetRowsAsObjects<T = Record<string, string | number | null>>(
  options: FetchSpreadsheetDataOptions,
): Promise<{ headers: string[]; rows: T[] }> {
  const data = await fetchSpreadsheetData(options);
  if (!data.values || data.values.length === 0) {
    return { headers: [], rows: [] };
  }

  const headerRow = (data.values[0] ?? []).map((h) => String(h ?? "").trim());
  const rows: T[] = [];

  for (let i = 1; i < data.values.length; i++) {
    const rawRow = data.values[i];
    if (!rawRow || rawRow.every((cell) => cell === null || cell === "" || cell === undefined)) {
      continue;
    }

    const rowObj: Record<string, unknown> = {};
    for (let colIdx = 0; colIdx < headerRow.length; colIdx++) {
      const headerName = headerRow[colIdx];
      if (headerName) {
        rowObj[headerName] = rawRow[colIdx] ?? null;
      }
    }
    rows.push(rowObj as T);
  }

  return { headers: headerRow, rows };
}

/**
 * Fetches metadata about the spreadsheet including title and sheet/tab names.
 */
export async function fetchSpreadsheetMetadata(options: {
  spreadsheetId: string;
  accessToken?: string;
}): Promise<SpreadsheetMetadata> {
  const spreadsheetId = normalizeSpreadsheetId(options.spreadsheetId);
  if (!spreadsheetId) {
    throw new Error("Invalid spreadsheetId: ID cannot be empty.");
  }

  try {
    const sheets = await getGoogleSheetsClient({
      accessToken: options.accessToken,
    });

    const res = await sheets.spreadsheets.get({
      spreadsheetId,
      fields:
        "spreadsheetId,properties.title,properties.locale,properties.timeZone,sheets.properties",
    });

    const sheetList = (res.data.sheets ?? []).map((s) => ({
      sheetId: s.properties?.sheetId ?? 0,
      title: s.properties?.title ?? "Sheet",
      index: s.properties?.index ?? 0,
      rowCount: s.properties?.gridProperties?.rowCount ?? 0,
      columnCount: s.properties?.gridProperties?.columnCount ?? 0,
    }));

    return {
      spreadsheetId: res.data.spreadsheetId ?? spreadsheetId,
      title: res.data.properties?.title ?? "Untitled Spreadsheet",
      locale: res.data.properties?.locale ?? undefined,
      timeZone: res.data.properties?.timeZone ?? undefined,
      sheets: sheetList,
    };
  } catch (error: unknown) {
    throw formatGoogleSheetsError(error, spreadsheetId);
  }
}

/**
 * Appends rows to a spreadsheet.
 */
export async function appendSpreadsheetRows(options: {
  spreadsheetId: string;
  range?: string;
  rows: (string | number | boolean | null)[][];
  accessToken?: string;
}): Promise<{ updatedRows: number; updatedRange: string }> {
  const spreadsheetId = normalizeSpreadsheetId(options.spreadsheetId);
  const range = options.range?.trim() || "A:Z";

  try {
    const sheets = await getGoogleSheetsClient({
      accessToken: options.accessToken,
    });

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: options.rows,
      },
    });

    return {
      updatedRows: response.data.updates?.updatedRows ?? options.rows.length,
      updatedRange: response.data.updates?.updatedRange ?? range,
    };
  } catch (error: unknown) {
    throw formatGoogleSheetsError(error, spreadsheetId, range);
  }
}

/**
 * Helper to produce human-friendly error messages from Google Sheets API errors.
 */
function formatGoogleSheetsError(error: unknown, spreadsheetId?: string, range?: string): Error {
  const apiError = error as {
    code?: number;
    status?: number;
    response?: { status?: number; data?: { error?: { message?: string; status?: string } } };
    message?: string;
  };

  const status = apiError.response?.status ?? apiError.status ?? apiError.code;
  const rawMsg = apiError.response?.data?.error?.message ?? apiError.message ?? "Unknown error";

  if (status === 401) {
    return new Error(
      `Google Authentication failed (401): Check Service Account credentials or OAuth access token. Details: ${rawMsg}`,
    );
  }

  if (status === 403) {
    return new Error(
      `Google Sheets access denied (403): Please ensure the Spreadsheet${
        spreadsheetId ? ` (ID: ${spreadsheetId})` : ""
      } is shared with your Service Account email as Editor, and the Google Sheets API is enabled in Google Cloud Console. Details: ${rawMsg}`,
    );
  }

  if (status === 404) {
    return new Error(
      `Google Spreadsheet not found (404): No spreadsheet found with ID "${spreadsheetId}". Details: ${rawMsg}`,
    );
  }

  if (status === 400 && range && rawMsg.includes("Unable to parse range")) {
    return new Error(
      `Invalid Google Sheets range "${range}": Please verify the sheet name and cell coordinates. Details: ${rawMsg}`,
    );
  }

  return new Error(`Google Sheets API error: ${rawMsg}`);
}
