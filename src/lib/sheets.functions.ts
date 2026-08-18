import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { ConnectionTestResult } from "@/lib/sheets-diagnostics";

const SHEET_TITLE = "WorkLogs";
const SETTINGS_TITLE = "Settings";
const GOOGLE_SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets";

const HEADERS = [
  "รหัส",
  "วันที่",
  "เวลาเข้า",
  "เวลาออก",
  "ประเภทงาน",
  "สถานที่",
  "พิกัดเข้า",
  "พิกัดออก",
  "ชั่วโมงรวม",
  "ชั่วโมงปกติ",
  "ชั่วโมง OT",
  "ตัวคูณ OT",
  "ค่าแรงพื้นฐาน",
  "ค่า OT",
  "ค่าเดินทาง",
  "ค่าอาหาร",
  "รายรับอื่น",
  "รายการหัก",
  "รายได้สุทธิ",
  "จำนวนงานที่ทำเสร็จ",
  "รายละเอียดงาน",
];

type ServiceAccountCredentials = {
  client_email?: string;
  private_key?: string;
};

type GoogleError = {
  code?: number;
  response?: { status?: number; data?: { error?: { message?: string } } };
  message?: string;
};

const spreadsheetInputSchema = z.object({
  spreadsheetId: z.string().min(10).transform(normalizeSpreadsheetId),
});

export function normalizeSpreadsheetId(value: string) {
  const trimmed = value.trim();
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  return match?.[1] ?? trimmed;
}

function serviceAccountCredentials(): { clientEmail: string; privateKey: string } {
  const json = process.env["GOOGLE_SERVICE_ACCOUNT_JSON"]?.trim();
  let credentials: ServiceAccountCredentials = {};

  if (json) {
    try {
      credentials = JSON.parse(json) as ServiceAccountCredentials;
    } catch {
      throw new Error(
        "Google Sheets ยังไม่พร้อมใช้งาน: GOOGLE_SERVICE_ACCOUNT_JSON ไม่ใช่ JSON ที่ถูกต้อง",
      );
    }
  }

  const clientEmail =
    credentials.client_email ??
    process.env["GOOGLE_SERVICE_ACCOUNT_EMAIL"] ??
    process.env["GOOGLE_CLIENT_EMAIL"];
  const privateKey = credentials.private_key ?? process.env["GOOGLE_PRIVATE_KEY"];

  if (!clientEmail || !privateKey) {
    const missing = [
      !clientEmail ? "GOOGLE_SERVICE_ACCOUNT_EMAIL" : null,
      !privateKey ? "GOOGLE_PRIVATE_KEY" : null,
    ].filter((key): key is string => Boolean(key));
    throw new Error(
      `Google Sheets ยังไม่พร้อมใช้งาน: ไม่พบ ${missing.join(", ")} ใน environment ของ server`,
    );
  }

  return {
    clientEmail,
    privateKey: privateKey.replace(/\\n/g, "\n"),
  };
}

async function sheetsClient() {
  const { google } = await import("googleapis");
  const credentials = serviceAccountCredentials();
  const auth = new google.auth.JWT({
    email: credentials.clientEmail,
    key: credentials.privateKey,
    scopes: [GOOGLE_SHEETS_SCOPE],
  });

  await auth.authorize();
  return google.sheets({ version: "v4", auth });
}

function googleSheetsError(error: unknown) {
  const apiError = error as GoogleError;
  const status = apiError.response?.status ?? apiError.code;
  const apiMessage = apiError.response?.data?.error?.message;
  const message = apiMessage ?? apiError.message ?? "ไม่ทราบสาเหตุ";

  if (status === 401) {
    return "Google authentication ไม่ผ่าน: ตรวจสอบ Service Account email และ private key";
  }
  if (status === 403) {
    return "Google Sheets ปฏิเสธการเข้าถึง: แชร์ spreadsheet ให้ Service Account email ด้วยสิทธิ์ Editor และตรวจว่าเปิด Google Sheets API แล้ว";
  }
  if (status === 404) {
    return "ไม่พบ Spreadsheet หรือแท็บที่ระบุ: ตรวจสอบ Spreadsheet ID และชื่อแท็บ WorkLogs";
  }
  return `Google Sheets API error${status ? ` [${status}]` : ""}: ${message.slice(0, 400)}`;
}

async function ensureSheet(
  sheets: Awaited<ReturnType<typeof sheetsClient>>,
  spreadsheetId: string,
  title: string,
) {
  const meta = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: "spreadsheetId,spreadsheetUrl,properties.title,sheets.properties",
  });
  const existing = meta.data.sheets?.find((sheet) => sheet.properties?.title === title);
  if (existing) return meta;

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [{ addSheet: { properties: { title } } }],
    },
  });
  return meta;
}

function spreadsheetResult(
  meta: {
    data: {
      spreadsheetId?: string | null;
      spreadsheetUrl?: string | null;
      properties?: { title?: string | null } | null;
    };
  },
  spreadsheetId: string,
) {
  return {
    spreadsheetId: meta.data.spreadsheetId ?? spreadsheetId,
    url: meta.data.spreadsheetUrl ?? `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
    title: meta.data.properties?.title ?? "",
  };
}

/** Creates a new spreadsheet with the WorkLogs tab and header row. */
export const createWorkSpreadsheet = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ title: z.string().min(1).max(120).optional() }).parse(input ?? {}),
  )
  .handler(async ({ data }) => {
    try {
      const sheets = await sheetsClient();
      const created = await sheets.spreadsheets.create({
        requestBody: {
          properties: { title: data.title || `Work Tracker ${new Date().getFullYear()}` },
          sheets: [{ properties: { title: SHEET_TITLE } }],
        },
        fields: "spreadsheetId,spreadsheetUrl,properties.title",
      });
      const spreadsheetId = created.data.spreadsheetId;
      if (!spreadsheetId) throw new Error("Google Sheets ไม่ส่ง Spreadsheet ID กลับมา");

      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${SHEET_TITLE}!A1:U1`,
        valueInputOption: "RAW",
        requestBody: { values: [HEADERS] },
      });

      return {
        spreadsheetId,
        url:
          created.data.spreadsheetUrl ??
          `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
        title: created.data.properties?.title ?? "",
      };
    } catch (error) {
      throw new Error(googleSheetsError(error));
    }
  });

/** Verifies access to a spreadsheet and ensures WorkLogs plus its header row exist. */
export const prepareSpreadsheet = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => spreadsheetInputSchema.parse(input))
  .handler(async ({ data }) => {
    try {
      const sheets = await sheetsClient();
      const meta = await ensureSheet(sheets, data.spreadsheetId, SHEET_TITLE);
      const existing = await sheets.spreadsheets.values.get({
        spreadsheetId: data.spreadsheetId,
        range: `${SHEET_TITLE}!A1:U1`,
      });

      if (!existing.data.values?.length) {
        await sheets.spreadsheets.values.update({
          spreadsheetId: data.spreadsheetId,
          range: `${SHEET_TITLE}!A1:U1`,
          valueInputOption: "RAW",
          requestBody: { values: [HEADERS] },
        });
      }

      return spreadsheetResult(meta, data.spreadsheetId);
    } catch (error) {
      throw new Error(googleSheetsError(error));
    }
  });

/** Appends one or more work-log rows to the WorkLogs tab. */
export const appendWorkLogRows = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        spreadsheetId: z.string().min(10).transform(normalizeSpreadsheetId),
        rows: z
          .array(z.array(z.union([z.string(), z.number()])))
          .min(1)
          .max(500),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    try {
      const sheets = await sheetsClient();
      const result = await sheets.spreadsheets.values.append({
        spreadsheetId: data.spreadsheetId,
        range: `${SHEET_TITLE}!A:U`,
        valueInputOption: "RAW",
        insertDataOption: "INSERT_ROWS",
        requestBody: { values: data.rows },
      });
      return {
        updatedRows: result.data.updates?.updatedRows ?? 0,
        updatedRange: result.data.updates?.updatedRange ?? "",
      };
    } catch (error) {
      throw new Error(googleSheetsError(error));
    }
  });

/** Overwrites the WorkLogs tab so the sheet mirrors app history exactly. */
export const replaceWorkLogRows = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        spreadsheetId: z.string().min(10).transform(normalizeSpreadsheetId),
        rows: z.array(z.array(z.union([z.string(), z.number()]))).max(5000),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    try {
      const sheets = await sheetsClient();
      await sheets.spreadsheets.values.clear({
        spreadsheetId: data.spreadsheetId,
        range: `${SHEET_TITLE}!A2:U`,
        requestBody: {},
      });
      await sheets.spreadsheets.values.update({
        spreadsheetId: data.spreadsheetId,
        range: `${SHEET_TITLE}!A1:U1`,
        valueInputOption: "RAW",
        requestBody: { values: [HEADERS] },
      });
      if (data.rows.length > 0) {
        await sheets.spreadsheets.values.update({
          spreadsheetId: data.spreadsheetId,
          range: `${SHEET_TITLE}!A2:U${data.rows.length + 1}`,
          valueInputOption: "RAW",
          requestBody: { values: data.rows },
        });
      }
      return { writtenRows: data.rows.length };
    } catch (error) {
      throw new Error(googleSheetsError(error));
    }
  });

/** Reads the saved work-type list from the Settings tab. */
export const readCategoryList = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => spreadsheetInputSchema.parse(input))
  .handler(async ({ data }) => {
    try {
      const sheets = await sheetsClient();
      const res = await sheets.spreadsheets.values.get({
        spreadsheetId: data.spreadsheetId,
        range: `${SETTINGS_TITLE}!A2:A200`,
      });
      const rows: unknown[][] = res.data.values ?? [];
      const categories = rows.map((row) => String(row[0] ?? "").trim()).filter(Boolean);
      return { categories };
    } catch (error) {
      console.warn(googleSheetsError(error));
      return { categories: [] as string[] };
    }
  });

/** Stores the work-type list in the Settings tab. */
export const writeCategoryList = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        spreadsheetId: z.string().min(10).transform(normalizeSpreadsheetId),
        categories: z.array(z.string().min(1).max(120)).max(200),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    try {
      const sheets = await sheetsClient();
      await ensureSheet(sheets, data.spreadsheetId, SETTINGS_TITLE);
      await sheets.spreadsheets.values.clear({
        spreadsheetId: data.spreadsheetId,
        range: `${SETTINGS_TITLE}!A2:A200`,
        requestBody: {},
      });
      await sheets.spreadsheets.values.update({
        spreadsheetId: data.spreadsheetId,
        range: `${SETTINGS_TITLE}!A1:A${Math.max(1, data.categories.length + 1)}`,
        valueInputOption: "RAW",
        requestBody: {
          values: [["ประเภทงาน"], ...data.categories.map((category) => [category])],
        },
      });
      return { saved: data.categories.length };
    } catch (error) {
      throw new Error(googleSheetsError(error));
    }
  });

/** Reads every data row from the WorkLogs tab. */
export const readWorkLogRows = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => spreadsheetInputSchema.parse(input))
  .handler(async ({ data }) => {
    try {
      const sheets = await sheetsClient();
      const res = await sheets.spreadsheets.values.get({
        spreadsheetId: data.spreadsheetId,
        range: `${SHEET_TITLE}!A2:U`,
        valueRenderOption: "UNFORMATTED_VALUE",
      });
      const rows: unknown[][] = res.data.values ?? [];
      return { rows: rows.map((row) => row.map((cell) => (cell == null ? "" : String(cell)))) };
    } catch (error) {
      throw new Error(googleSheetsError(error));
    }
  });

/**
 * Runs a non-destructive diagnostic. Write/update/delete run on a temporary
 * tab that is deleted in finally, so WorkLogs never receives test rows.
 */
export const testGoogleSheetsConnection = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => spreadsheetInputSchema.parse(input))
  .handler(async ({ data }): Promise<ConnectionTestResult> => {
    const result: ConnectionTestResult = {
      googleAccount: false,
      serviceAccount: false,
      spreadsheetId: data.spreadsheetId.length >= 10,
      spreadsheetAccess: false,
      readTest: false,
      writeTest: false,
      updateTest: false,
      deleteTest: false,
      errorDetails: "",
    };

    let temporarySheetId: number | null = null;
    let sheets: Awaited<ReturnType<typeof sheetsClient>> | null = null;

    try {
      sheets = await sheetsClient();
      result.googleAccount = true;
      result.serviceAccount = true;

      const meta = await sheets.spreadsheets.get({
        spreadsheetId: data.spreadsheetId,
        fields: "spreadsheetId,spreadsheetUrl,properties.title,sheets.properties",
      });
      result.spreadsheetAccess = meta.data.spreadsheetId === data.spreadsheetId;

      const workLogsRead = await sheets.spreadsheets.values.get({
        spreadsheetId: data.spreadsheetId,
        range: `${SHEET_TITLE}!A1:U1`,
        valueRenderOption: "UNFORMATTED_VALUE",
      });
      result.readTest = Array.isArray(workLogsRead.data.values);

      const temporaryTitle = `ConnectionTest_${Date.now()}`;
      const created = await sheets.spreadsheets.batchUpdate({
        spreadsheetId: data.spreadsheetId,
        requestBody: {
          requests: [{ addSheet: { properties: { title: temporaryTitle } } }],
        },
      });
      temporarySheetId = created.data.replies?.[0]?.addSheet?.properties?.sheetId ?? null;
      if (temporarySheetId === null) {
        throw new Error("สร้างชีตชั่วคราวสำหรับ Write Test ไม่สำเร็จ");
      }

      await sheets.spreadsheets.values.update({
        spreadsheetId: data.spreadsheetId,
        range: `${temporaryTitle}!A1:C2`,
        valueInputOption: "RAW",
        requestBody: {
          values: [
            ["test_id", "operation", "value"],
            ["connection-test", "write", "created"],
          ],
        },
      });
      result.writeTest = true;

      await sheets.spreadsheets.values.update({
        spreadsheetId: data.spreadsheetId,
        range: `${temporaryTitle}!C2`,
        valueInputOption: "RAW",
        requestBody: { values: [["updated"]] },
      });
      const updated = await sheets.spreadsheets.values.get({
        spreadsheetId: data.spreadsheetId,
        range: `${temporaryTitle}!C2`,
        valueRenderOption: "UNFORMATTED_VALUE",
      });
      result.updateTest = updated.data.values?.[0]?.[0] === "updated";
    } catch (error) {
      result.errorDetails = googleSheetsError(error);
    } finally {
      if (temporarySheetId !== null && sheets) {
        try {
          await sheets.spreadsheets.batchUpdate({
            spreadsheetId: data.spreadsheetId,
            requestBody: { requests: [{ deleteSheet: { sheetId: temporarySheetId } }] },
          });
          result.deleteTest = true;
        } catch (error) {
          const cleanupError = googleSheetsError(error);
          result.errorDetails = result.errorDetails
            ? `${result.errorDetails}; Cleanup failed: ${cleanupError}`
            : `Cleanup failed: ${cleanupError}`;
        }
      }
    }

    return result;
  });
