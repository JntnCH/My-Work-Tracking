import { o as __toESM } from "../_runtime.mjs";
import { i as createServerFn } from "./server-DkLM_YV6.mjs";
import { a as unionType, i as stringType, n as numberType, r as objectType, t as arrayType } from "../_libs/zod.mjs";
import { t as createServerRpc } from "./createServerRpc-CIN28TQO.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/sheets.functions-ayRmqcQH.js
var SHEET_TITLE = "WorkLogs";
var SETTINGS_TITLE = "Settings";
var GOOGLE_SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets";
var HEADERS = [
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
	"รายละเอียดงาน"
];
var spreadsheetInputSchema = objectType({ spreadsheetId: stringType().min(10).transform(normalizeSpreadsheetId) });
function normalizeSpreadsheetId(value) {
	const trimmed = value.trim();
	return trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/)?.[1] ?? trimmed;
}
function serviceAccountCredentials() {
	const json = process.env["GOOGLE_SERVICE_ACCOUNT_JSON"]?.trim();
	let credentials = {};
	if (json) try {
		credentials = JSON.parse(json);
	} catch {
		throw new Error("Google Sheets ยังไม่พร้อมใช้งาน: GOOGLE_SERVICE_ACCOUNT_JSON ไม่ใช่ JSON ที่ถูกต้อง");
	}
	const clientEmail = credentials.client_email ?? process.env["GOOGLE_SERVICE_ACCOUNT_EMAIL"] ?? process.env["GOOGLE_CLIENT_EMAIL"];
	const privateKey = credentials.private_key ?? process.env["GOOGLE_PRIVATE_KEY"];
	if (!clientEmail || !privateKey) {
		const missing = [!clientEmail ? "GOOGLE_SERVICE_ACCOUNT_EMAIL" : null, !privateKey ? "GOOGLE_PRIVATE_KEY" : null].filter((key) => Boolean(key));
		throw new Error(`Google Sheets ยังไม่พร้อมใช้งาน: ไม่พบ ${missing.join(", ")} ใน environment ของ server`);
	}
	return {
		clientEmail,
		privateKey: privateKey.replace(/\\n/g, "\n")
	};
}
async function sheetsClient() {
	const { google } = await import("../_libs/googleapis+[...].mjs").then((n) => /* @__PURE__ */ __toESM(n.t()));
	const credentials = serviceAccountCredentials();
	const auth = new google.auth.JWT({
		email: credentials.clientEmail,
		key: credentials.privateKey,
		scopes: [GOOGLE_SHEETS_SCOPE]
	});
	await auth.authorize();
	return google.sheets({
		version: "v4",
		auth
	});
}
function googleSheetsError(error) {
	const apiError = error;
	const status = apiError.response?.status ?? apiError.code;
	const message = apiError.response?.data?.error?.message ?? apiError.message ?? "ไม่ทราบสาเหตุ";
	if (status === 401) return "Google authentication ไม่ผ่าน: ตรวจสอบ Service Account email และ private key";
	if (status === 403) return "Google Sheets ปฏิเสธการเข้าถึง: แชร์ spreadsheet ให้ Service Account email ด้วยสิทธิ์ Editor และตรวจว่าเปิด Google Sheets API แล้ว";
	if (status === 404) return "ไม่พบ Spreadsheet หรือแท็บที่ระบุ: ตรวจสอบ Spreadsheet ID และชื่อแท็บ WorkLogs";
	return `Google Sheets API error${status ? ` [${status}]` : ""}: ${message.slice(0, 400)}`;
}
async function ensureSheet(sheets, spreadsheetId, title) {
	const meta = await sheets.spreadsheets.get({
		spreadsheetId,
		fields: "spreadsheetId,spreadsheetUrl,properties.title,sheets.properties"
	});
	if (meta.data.sheets?.find((sheet) => sheet.properties?.title === title)) return meta;
	await sheets.spreadsheets.batchUpdate({
		spreadsheetId,
		requestBody: { requests: [{ addSheet: { properties: { title } } }] }
	});
	return meta;
}
function spreadsheetResult(meta, spreadsheetId) {
	return {
		spreadsheetId: meta.data.spreadsheetId ?? spreadsheetId,
		url: meta.data.spreadsheetUrl ?? `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
		title: meta.data.properties?.title ?? ""
	};
}
/** Creates a new spreadsheet with the WorkLogs tab and header row. */
var createWorkSpreadsheet_createServerFn_handler = createServerRpc({
	id: "32f65ef324f3951a881a96063bdc7be2026db7f5d3dd0b8089c4c0f0c924b817",
	name: "createWorkSpreadsheet",
	filename: "src/lib/sheets.functions.ts"
}, (opts) => createWorkSpreadsheet.__executeServer(opts));
var createWorkSpreadsheet = createServerFn({ method: "POST" }).validator((input) => objectType({ title: stringType().min(1).max(120).optional() }).parse(input ?? {})).handler(createWorkSpreadsheet_createServerFn_handler, async ({ data }) => {
	try {
		const sheets = await sheetsClient();
		const created = await sheets.spreadsheets.create({
			requestBody: {
				properties: { title: data.title || `Work Tracker ${(/* @__PURE__ */ new Date()).getFullYear()}` },
				sheets: [{ properties: { title: SHEET_TITLE } }]
			},
			fields: "spreadsheetId,spreadsheetUrl,properties.title"
		});
		const spreadsheetId = created.data.spreadsheetId;
		if (!spreadsheetId) throw new Error("Google Sheets ไม่ส่ง Spreadsheet ID กลับมา");
		await sheets.spreadsheets.values.update({
			spreadsheetId,
			range: `${SHEET_TITLE}!A1:U1`,
			valueInputOption: "RAW",
			requestBody: { values: [HEADERS] }
		});
		return {
			spreadsheetId,
			url: created.data.spreadsheetUrl ?? `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
			title: created.data.properties?.title ?? ""
		};
	} catch (error) {
		throw new Error(googleSheetsError(error));
	}
});
var prepareSpreadsheet_createServerFn_handler = createServerRpc({
	id: "0e23b552ff6ecad23c367f496da2eadbab438be27a8f1a7893e123f50c70f28b",
	name: "prepareSpreadsheet",
	filename: "src/lib/sheets.functions.ts"
}, (opts) => prepareSpreadsheet.__executeServer(opts));
var prepareSpreadsheet = createServerFn({ method: "POST" }).validator((input) => spreadsheetInputSchema.parse(input)).handler(prepareSpreadsheet_createServerFn_handler, async ({ data }) => {
	try {
		const sheets = await sheetsClient();
		const meta = await ensureSheet(sheets, data.spreadsheetId, SHEET_TITLE);
		if (!(await sheets.spreadsheets.values.get({
			spreadsheetId: data.spreadsheetId,
			range: `${SHEET_TITLE}!A1:U1`
		})).data.values?.length) await sheets.spreadsheets.values.update({
			spreadsheetId: data.spreadsheetId,
			range: `${SHEET_TITLE}!A1:U1`,
			valueInputOption: "RAW",
			requestBody: { values: [HEADERS] }
		});
		return spreadsheetResult(meta, data.spreadsheetId);
	} catch (error) {
		throw new Error(googleSheetsError(error));
	}
});
var appendWorkLogRows_createServerFn_handler = createServerRpc({
	id: "e9c19062c988a91cee9f43ecdd8b781a892490ef5a741dc6c6fae4082cdf3473",
	name: "appendWorkLogRows",
	filename: "src/lib/sheets.functions.ts"
}, (opts) => appendWorkLogRows.__executeServer(opts));
var appendWorkLogRows = createServerFn({ method: "POST" }).validator((input) => objectType({
	spreadsheetId: stringType().min(10).transform(normalizeSpreadsheetId),
	rows: arrayType(arrayType(unionType([stringType(), numberType()]))).min(1).max(500)
}).parse(input)).handler(appendWorkLogRows_createServerFn_handler, async ({ data }) => {
	try {
		const result = await (await sheetsClient()).spreadsheets.values.append({
			spreadsheetId: data.spreadsheetId,
			range: `${SHEET_TITLE}!A:U`,
			valueInputOption: "RAW",
			insertDataOption: "INSERT_ROWS",
			requestBody: { values: data.rows }
		});
		return {
			updatedRows: result.data.updates?.updatedRows ?? 0,
			updatedRange: result.data.updates?.updatedRange ?? ""
		};
	} catch (error) {
		throw new Error(googleSheetsError(error));
	}
});
var replaceWorkLogRows_createServerFn_handler = createServerRpc({
	id: "4fed7e79f1f4319c2965dd35e83612163943687e7353f15e9a16fdccf36df9a9",
	name: "replaceWorkLogRows",
	filename: "src/lib/sheets.functions.ts"
}, (opts) => replaceWorkLogRows.__executeServer(opts));
var replaceWorkLogRows = createServerFn({ method: "POST" }).validator((input) => objectType({
	spreadsheetId: stringType().min(10).transform(normalizeSpreadsheetId),
	rows: arrayType(arrayType(unionType([stringType(), numberType()]))).max(5e3)
}).parse(input)).handler(replaceWorkLogRows_createServerFn_handler, async ({ data }) => {
	try {
		const sheets = await sheetsClient();
		await sheets.spreadsheets.values.clear({
			spreadsheetId: data.spreadsheetId,
			range: `${SHEET_TITLE}!A2:U`,
			requestBody: {}
		});
		await sheets.spreadsheets.values.update({
			spreadsheetId: data.spreadsheetId,
			range: `${SHEET_TITLE}!A1:U1`,
			valueInputOption: "RAW",
			requestBody: { values: [HEADERS] }
		});
		if (data.rows.length > 0) await sheets.spreadsheets.values.update({
			spreadsheetId: data.spreadsheetId,
			range: `${SHEET_TITLE}!A2:U${data.rows.length + 1}`,
			valueInputOption: "RAW",
			requestBody: { values: data.rows }
		});
		return { writtenRows: data.rows.length };
	} catch (error) {
		throw new Error(googleSheetsError(error));
	}
});
var readCategoryList_createServerFn_handler = createServerRpc({
	id: "5f93a5ce45a08dbcf162d890b71239ddba6605e67c18c35716bb2d2636572985",
	name: "readCategoryList",
	filename: "src/lib/sheets.functions.ts"
}, (opts) => readCategoryList.__executeServer(opts));
var readCategoryList = createServerFn({ method: "POST" }).validator((input) => spreadsheetInputSchema.parse(input)).handler(readCategoryList_createServerFn_handler, async ({ data }) => {
	try {
		return { categories: ((await (await sheetsClient()).spreadsheets.values.get({
			spreadsheetId: data.spreadsheetId,
			range: `${SETTINGS_TITLE}!A2:A200`
		})).data.values ?? []).map((row) => String(row[0] ?? "").trim()).filter(Boolean) };
	} catch (error) {
		console.warn(googleSheetsError(error));
		return { categories: [] };
	}
});
var writeCategoryList_createServerFn_handler = createServerRpc({
	id: "f1215c2972e0315b59b13a39fad5015ca4a9e6a4e18b12302fdbeb6adee0c192",
	name: "writeCategoryList",
	filename: "src/lib/sheets.functions.ts"
}, (opts) => writeCategoryList.__executeServer(opts));
var writeCategoryList = createServerFn({ method: "POST" }).validator((input) => objectType({
	spreadsheetId: stringType().min(10).transform(normalizeSpreadsheetId),
	categories: arrayType(stringType().min(1).max(120)).max(200)
}).parse(input)).handler(writeCategoryList_createServerFn_handler, async ({ data }) => {
	try {
		const sheets = await sheetsClient();
		await ensureSheet(sheets, data.spreadsheetId, SETTINGS_TITLE);
		await sheets.spreadsheets.values.clear({
			spreadsheetId: data.spreadsheetId,
			range: `${SETTINGS_TITLE}!A2:A200`,
			requestBody: {}
		});
		await sheets.spreadsheets.values.update({
			spreadsheetId: data.spreadsheetId,
			range: `${SETTINGS_TITLE}!A1:A${Math.max(1, data.categories.length + 1)}`,
			valueInputOption: "RAW",
			requestBody: { values: [["ประเภทงาน"], ...data.categories.map((category) => [category])] }
		});
		return { saved: data.categories.length };
	} catch (error) {
		throw new Error(googleSheetsError(error));
	}
});
var readWorkLogRows_createServerFn_handler = createServerRpc({
	id: "fa587fec76e47499ed040a5a589c570f766c47a042311ecad246e911c61f07cb",
	name: "readWorkLogRows",
	filename: "src/lib/sheets.functions.ts"
}, (opts) => readWorkLogRows.__executeServer(opts));
var readWorkLogRows = createServerFn({ method: "POST" }).validator((input) => spreadsheetInputSchema.parse(input)).handler(readWorkLogRows_createServerFn_handler, async ({ data }) => {
	try {
		return { rows: ((await (await sheetsClient()).spreadsheets.values.get({
			spreadsheetId: data.spreadsheetId,
			range: `${SHEET_TITLE}!A2:U`,
			valueRenderOption: "UNFORMATTED_VALUE"
		})).data.values ?? []).map((row) => row.map((cell) => cell == null ? "" : String(cell))) };
	} catch (error) {
		throw new Error(googleSheetsError(error));
	}
});
var testGoogleSheetsConnection_createServerFn_handler = createServerRpc({
	id: "c5097760a7b329cbe21433a673c956b8f5bf96fe88dea062afef55da53a743be",
	name: "testGoogleSheetsConnection",
	filename: "src/lib/sheets.functions.ts"
}, (opts) => testGoogleSheetsConnection.__executeServer(opts));
var testGoogleSheetsConnection = createServerFn({ method: "POST" }).validator((input) => spreadsheetInputSchema.parse(input)).handler(testGoogleSheetsConnection_createServerFn_handler, async ({ data }) => {
	const result = {
		googleAccount: false,
		serviceAccount: false,
		spreadsheetId: data.spreadsheetId.length >= 10,
		spreadsheetAccess: false,
		readTest: false,
		writeTest: false,
		updateTest: false,
		deleteTest: false,
		errorDetails: ""
	};
	let temporarySheetId = null;
	let sheets = null;
	try {
		sheets = await sheetsClient();
		result.googleAccount = true;
		result.serviceAccount = true;
		result.spreadsheetAccess = (await sheets.spreadsheets.get({
			spreadsheetId: data.spreadsheetId,
			fields: "spreadsheetId,spreadsheetUrl,properties.title,sheets.properties"
		})).data.spreadsheetId === data.spreadsheetId;
		const workLogsRead = await sheets.spreadsheets.values.get({
			spreadsheetId: data.spreadsheetId,
			range: `${SHEET_TITLE}!A1:U1`,
			valueRenderOption: "UNFORMATTED_VALUE"
		});
		result.readTest = Array.isArray(workLogsRead.data.values);
		const temporaryTitle = `ConnectionTest_${Date.now()}`;
		temporarySheetId = (await sheets.spreadsheets.batchUpdate({
			spreadsheetId: data.spreadsheetId,
			requestBody: { requests: [{ addSheet: { properties: { title: temporaryTitle } } }] }
		})).data.replies?.[0]?.addSheet?.properties?.sheetId ?? null;
		if (temporarySheetId === null) throw new Error("สร้างชีตชั่วคราวสำหรับ Write Test ไม่สำเร็จ");
		await sheets.spreadsheets.values.update({
			spreadsheetId: data.spreadsheetId,
			range: `${temporaryTitle}!A1:C2`,
			valueInputOption: "RAW",
			requestBody: { values: [[
				"test_id",
				"operation",
				"value"
			], [
				"connection-test",
				"write",
				"created"
			]] }
		});
		result.writeTest = true;
		await sheets.spreadsheets.values.update({
			spreadsheetId: data.spreadsheetId,
			range: `${temporaryTitle}!C2`,
			valueInputOption: "RAW",
			requestBody: { values: [["updated"]] }
		});
		result.updateTest = (await sheets.spreadsheets.values.get({
			spreadsheetId: data.spreadsheetId,
			range: `${temporaryTitle}!C2`,
			valueRenderOption: "UNFORMATTED_VALUE"
		})).data.values?.[0]?.[0] === "updated";
	} catch (error) {
		result.errorDetails = googleSheetsError(error);
	} finally {
		if (temporarySheetId !== null && sheets) try {
			await sheets.spreadsheets.batchUpdate({
				spreadsheetId: data.spreadsheetId,
				requestBody: { requests: [{ deleteSheet: { sheetId: temporarySheetId } }] }
			});
			result.deleteTest = true;
		} catch (error) {
			const cleanupError = googleSheetsError(error);
			result.errorDetails = result.errorDetails ? `${result.errorDetails}; Cleanup failed: ${cleanupError}` : `Cleanup failed: ${cleanupError}`;
		}
	}
	return result;
});
//#endregion
export { appendWorkLogRows_createServerFn_handler, createWorkSpreadsheet_createServerFn_handler, prepareSpreadsheet_createServerFn_handler, readCategoryList_createServerFn_handler, readWorkLogRows_createServerFn_handler, replaceWorkLogRows_createServerFn_handler, testGoogleSheetsConnection_createServerFn_handler, writeCategoryList_createServerFn_handler };
