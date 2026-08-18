import { n as createServerFn } from "./server-C_NStXiV.mjs";
import { a as unionType, i as stringType, n as numberType, r as objectType, t as arrayType } from "../_libs/zod.mjs";
import { t as createServerRpc } from "./createServerRpc-CGXd2iCq.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/sheets.functions-DB8fULIV.js
var GATEWAY = "https://connector-gateway.lovable.dev/google_sheets/v4";
var SHEET_TITLE = "WorkLogs";
var SETTINGS_TITLE = "Settings";
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
function authHeaders() {
	const lovableKey = process.env["LOVABLE_API_KEY"];
	const connectionKey = process.env["GOOGLE_SHEETS_API_KEY"];
	if (!lovableKey || !connectionKey) throw new Error("ยังไม่ได้เชื่อมต่อ Google Sheets กับโปรเจกต์นี้");
	return {
		Authorization: `Bearer ${lovableKey}`,
		"X-Connection-Api-Key": connectionKey,
		"Content-Type": "application/json"
	};
}
async function gateway(path, init) {
	const res = await fetch(`${GATEWAY}${path}`, {
		...init,
		headers: authHeaders()
	});
	const text = await res.text();
	if (!res.ok) {
		console.error(`Google Sheets gateway failed [${res.status}]: ${text}`);
		throw new Error(`Google Sheets error [${res.status}]: ${text.slice(0, 400)}`);
	}
	return text ? JSON.parse(text) : {};
}
/** Creates a new spreadsheet with the WorkLogs tab + header row. */
var createWorkSpreadsheet_createServerFn_handler = createServerRpc({
	id: "32f65ef324f3951a881a96063bdc7be2026db7f5d3dd0b8089c4c0f0c924b817",
	name: "createWorkSpreadsheet",
	filename: "src/lib/sheets.functions.ts"
}, (opts) => createWorkSpreadsheet.__executeServer(opts));
var createWorkSpreadsheet = createServerFn({ method: "POST" }).inputValidator((input) => objectType({ title: stringType().min(1).max(120).optional() }).parse(input ?? {})).handler(createWorkSpreadsheet_createServerFn_handler, async ({ data }) => {
	const created = await gateway("/spreadsheets", {
		method: "POST",
		body: JSON.stringify({
			properties: { title: data.title || `Work Tracker ${(/* @__PURE__ */ new Date()).getFullYear()}` },
			sheets: [{ properties: { title: SHEET_TITLE } }]
		})
	});
	const spreadsheetId = created.spreadsheetId;
	await gateway(`/spreadsheets/${spreadsheetId}/values/${SHEET_TITLE}!A1?valueInputOption=RAW`, {
		method: "PUT",
		body: JSON.stringify({ values: [HEADERS] })
	});
	return {
		spreadsheetId,
		url: created.spreadsheetUrl,
		title: created.properties?.title
	};
});
var prepareSpreadsheet_createServerFn_handler = createServerRpc({
	id: "0e23b552ff6ecad23c367f496da2eadbab438be27a8f1a7893e123f50c70f28b",
	name: "prepareSpreadsheet",
	filename: "src/lib/sheets.functions.ts"
}, (opts) => prepareSpreadsheet.__executeServer(opts));
var prepareSpreadsheet = createServerFn({ method: "POST" }).inputValidator((input) => objectType({ spreadsheetId: stringType().min(10) }).parse(input)).handler(prepareSpreadsheet_createServerFn_handler, async ({ data }) => {
	const meta = await gateway(`/spreadsheets/${data.spreadsheetId}?fields=spreadsheetId,spreadsheetUrl,properties.title,sheets.properties.title`);
	if (!(meta.sheets ?? []).map((s) => s.properties.title).includes(SHEET_TITLE)) await gateway(`/spreadsheets/${data.spreadsheetId}:batchUpdate`, {
		method: "POST",
		body: JSON.stringify({ requests: [{ addSheet: { properties: { title: SHEET_TITLE } } }] })
	});
	const existing = await gateway(`/spreadsheets/${data.spreadsheetId}/values/${SHEET_TITLE}!A1:U1`);
	if (!existing.values || existing.values.length === 0) await gateway(`/spreadsheets/${data.spreadsheetId}/values/${SHEET_TITLE}!A1?valueInputOption=RAW`, {
		method: "PUT",
		body: JSON.stringify({ values: [HEADERS] })
	});
	return {
		spreadsheetId: meta.spreadsheetId,
		url: meta.spreadsheetUrl,
		title: meta.properties?.title
	};
});
var appendWorkLogRows_createServerFn_handler = createServerRpc({
	id: "e9c19062c988a91cee9f43ecdd8b781a892490ef5a741dc6c6fae4082cdf3473",
	name: "appendWorkLogRows",
	filename: "src/lib/sheets.functions.ts"
}, (opts) => appendWorkLogRows.__executeServer(opts));
var appendWorkLogRows = createServerFn({ method: "POST" }).inputValidator((input) => objectType({
	spreadsheetId: stringType().min(10),
	rows: arrayType(arrayType(unionType([stringType(), numberType()]))).min(1).max(500)
}).parse(input)).handler(appendWorkLogRows_createServerFn_handler, async ({ data }) => {
	const result = await gateway(`/spreadsheets/${data.spreadsheetId}/values/${SHEET_TITLE}!A:U:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`, {
		method: "POST",
		body: JSON.stringify({ values: data.rows })
	});
	return {
		updatedRows: result.updates?.updatedRows ?? 0,
		updatedRange: result.updates?.updatedRange ?? ""
	};
});
var replaceWorkLogRows_createServerFn_handler = createServerRpc({
	id: "4fed7e79f1f4319c2965dd35e83612163943687e7353f15e9a16fdccf36df9a9",
	name: "replaceWorkLogRows",
	filename: "src/lib/sheets.functions.ts"
}, (opts) => replaceWorkLogRows.__executeServer(opts));
var replaceWorkLogRows = createServerFn({ method: "POST" }).inputValidator((input) => objectType({
	spreadsheetId: stringType().min(10),
	rows: arrayType(arrayType(unionType([stringType(), numberType()]))).max(5e3)
}).parse(input)).handler(replaceWorkLogRows_createServerFn_handler, async ({ data }) => {
	await gateway(`/spreadsheets/${data.spreadsheetId}/values/${SHEET_TITLE}!A2:U:clear`, {
		method: "POST",
		body: "{}"
	});
	await gateway(`/spreadsheets/${data.spreadsheetId}/values/${SHEET_TITLE}!A1?valueInputOption=RAW`, {
		method: "PUT",
		body: JSON.stringify({ values: [HEADERS] })
	});
	if (data.rows.length > 0) await gateway(`/spreadsheets/${data.spreadsheetId}/values/${SHEET_TITLE}!A2?valueInputOption=RAW`, {
		method: "PUT",
		body: JSON.stringify({ values: data.rows })
	});
	return { writtenRows: data.rows.length };
});
var readCategoryList_createServerFn_handler = createServerRpc({
	id: "5f93a5ce45a08dbcf162d890b71239ddba6605e67c18c35716bb2d2636572985",
	name: "readCategoryList",
	filename: "src/lib/sheets.functions.ts"
}, (opts) => readCategoryList.__executeServer(opts));
var readCategoryList = createServerFn({ method: "POST" }).inputValidator((input) => objectType({ spreadsheetId: stringType().min(10) }).parse(input)).handler(readCategoryList_createServerFn_handler, async ({ data }) => {
	try {
		return { categories: ((await gateway(`/spreadsheets/${data.spreadsheetId}/values/${SETTINGS_TITLE}!A2:A200`)).values ?? []).map((r) => String(r[0] ?? "").trim()).filter((v) => v.length > 0) };
	} catch {
		return { categories: [] };
	}
});
var writeCategoryList_createServerFn_handler = createServerRpc({
	id: "f1215c2972e0315b59b13a39fad5015ca4a9e6a4e18b12302fdbeb6adee0c192",
	name: "writeCategoryList",
	filename: "src/lib/sheets.functions.ts"
}, (opts) => writeCategoryList.__executeServer(opts));
var writeCategoryList = createServerFn({ method: "POST" }).inputValidator((input) => objectType({
	spreadsheetId: stringType().min(10),
	categories: arrayType(stringType().min(1).max(120)).max(200)
}).parse(input)).handler(writeCategoryList_createServerFn_handler, async ({ data }) => {
	if (!((await gateway(`/spreadsheets/${data.spreadsheetId}?fields=sheets.properties.title`)).sheets ?? []).map((s) => s.properties.title).includes(SETTINGS_TITLE)) await gateway(`/spreadsheets/${data.spreadsheetId}:batchUpdate`, {
		method: "POST",
		body: JSON.stringify({ requests: [{ addSheet: { properties: { title: SETTINGS_TITLE } } }] })
	});
	await gateway(`/spreadsheets/${data.spreadsheetId}/values/${SETTINGS_TITLE}!A2:A200:clear`, {
		method: "POST",
		body: "{}"
	});
	await gateway(`/spreadsheets/${data.spreadsheetId}/values/${SETTINGS_TITLE}!A1?valueInputOption=RAW`, {
		method: "PUT",
		body: JSON.stringify({ values: [["ประเภทงาน"], ...data.categories.map((c) => [c])] })
	});
	return { saved: data.categories.length };
});
var readWorkLogRows_createServerFn_handler = createServerRpc({
	id: "fa587fec76e47499ed040a5a589c570f766c47a042311ecad246e911c61f07cb",
	name: "readWorkLogRows",
	filename: "src/lib/sheets.functions.ts"
}, (opts) => readWorkLogRows.__executeServer(opts));
var readWorkLogRows = createServerFn({ method: "POST" }).inputValidator((input) => objectType({ spreadsheetId: stringType().min(10) }).parse(input)).handler(readWorkLogRows_createServerFn_handler, async ({ data }) => {
	return { rows: ((await gateway(`/spreadsheets/${data.spreadsheetId}/values/${SHEET_TITLE}!A2:U?valueRenderOption=UNFORMATTED_VALUE`)).values ?? []).map((r) => r.map((c) => c == null ? "" : String(c))) };
});
//#endregion
export { appendWorkLogRows_createServerFn_handler, createWorkSpreadsheet_createServerFn_handler, prepareSpreadsheet_createServerFn_handler, readCategoryList_createServerFn_handler, readWorkLogRows_createServerFn_handler, replaceWorkLogRows_createServerFn_handler, writeCategoryList_createServerFn_handler };
