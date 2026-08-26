import { i as createServerFn } from "./server-DkLM_YV6.mjs";
import { i as stringType, n as numberType, r as objectType, t as arrayType } from "../_libs/zod.mjs";
import { t as createServerRpc } from "./createServerRpc-CIN28TQO.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/airtable.functions-CKFz4XQO.js
var workLogSchema = objectType({
	id: stringType(),
	date: stringType(),
	checkInTime: stringType(),
	checkOutTime: stringType().optional().nullable(),
	workType: stringType(),
	locationName: stringType(),
	checkInGPS: objectType({
		lat: stringType().nullable().optional(),
		lng: stringType().nullable().optional(),
		text: stringType().optional()
	}).optional().nullable(),
	checkOutGPS: objectType({
		lat: stringType().nullable().optional(),
		lng: stringType().nullable().optional(),
		text: stringType().optional()
	}).optional().nullable(),
	grossHours: numberType().optional().default(0),
	workingHours: numberType().optional().default(0),
	otHours: numberType().optional().default(0),
	otType: numberType().optional().default(0),
	baseWage: numberType().optional().default(0),
	otIncome: numberType().optional().default(0),
	travelCost: numberType().optional().default(0),
	foodCost: numberType().optional().default(0),
	otherIncome: numberType().optional().default(0),
	otherDeductions: numberType().optional().default(0),
	netIncome: numberType().optional().default(0),
	tasks: arrayType(stringType()).optional().default([]),
	airtableRecordId: stringType().optional().nullable()
});
function gpsStr(gps) {
	if (!gps) return "-";
	if (gps.lat && gps.lng) return `${gps.lat}, ${gps.lng}`;
	return gps.text || "-";
}
function bangkokDateTime(iso) {
	if (!iso) return "";
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return "";
	return new Intl.DateTimeFormat("sv-SE", {
		timeZone: "Asia/Bangkok",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hour12: false
	}).format(date);
}
var syncRecordToAirtable_createServerFn_handler = createServerRpc({
	id: "b27b66c81e0bce6a7c2448eb0572d77194d967e9904cd9c71a7b1aa3cef6d66d",
	name: "syncRecordToAirtable",
	filename: "src/lib/airtable.functions.ts"
}, (opts) => syncRecordToAirtable.__executeServer(opts));
var syncRecordToAirtable = createServerFn({ method: "POST" }).validator((input) => objectType({ log: workLogSchema }).parse(input)).handler(syncRecordToAirtable_createServerFn_handler, async ({ data }) => {
	const apiKey = process.env.AIRTABLE_API_KEY;
	const baseId = process.env.AIRTABLE_BASE_ID;
	const tableName = process.env.AIRTABLE_TABLE_NAME || "WorkLogs";
	if (!apiKey || !baseId) return {
		success: false,
		error: "ยังไม่ได้ตั้งค่า AIRTABLE_API_KEY หรือ AIRTABLE_BASE_ID ในระบบ"
	};
	const { log } = data;
	const taskDetails = (log.tasks || []).filter(Boolean).join(" | ");
	const fields = {
		"#รหัส": log.id,
		"#วันที่": log.date,
		"#เวลาเข้า": bangkokDateTime(log.checkInTime),
		"#เวลาออก": bangkokDateTime(log.checkOutTime),
		"#ประเภทงาน": log.workType,
		"#สถานที่": log.locationName,
		"#พิกัดเข้า": gpsStr(log.checkInGPS),
		"#พิกัดออก": gpsStr(log.checkOutGPS),
		"#ชั่วโมงรวม": log.grossHours,
		"#ชั่วโมงปกติ": log.workingHours,
		"#ชั่วโมงOT": log.otHours,
		"#ตัวคูณOT": log.otType,
		"#ค่าแรงพื้นฐาน": log.baseWage,
		"#ค่าOT": log.otIncome,
		"#ค่าเดินทาง": log.travelCost,
		"#ค่าอาหาร": log.foodCost,
		"#รายรับอื่น": log.otherIncome,
		"#รายการหัก": log.otherDeductions,
		"#รายได้สุทธิ": log.netIncome,
		"#จำนวนงานที่ทำเสร็จ": (log.tasks || []).length,
		"#รายละเอียดงาน": taskDetails
	};
	try {
		let recordId = log.airtableRecordId || null;
		if (!recordId) {
			const escapedId = log.id.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
			const lookupUrl = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}?maxRecords=1&filterByFormula=${encodeURIComponent(`{#รหัส}='${escapedId}'`)}`;
			const lookup = await fetch(lookupUrl, { headers: { Authorization: `Bearer ${apiKey}` } });
			if (lookup.ok) recordId = (await lookup.json()).records?.[0]?.id || null;
		}
		const url = recordId ? `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}/${recordId}` : `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`;
		const res = await fetch(url, {
			method: recordId ? "PATCH" : "POST",
			headers: {
				Authorization: `Bearer ${apiKey}`,
				"Content-Type": "application/json"
			},
			body: JSON.stringify(recordId ? { fields } : { records: [{ fields }] })
		});
		if (!res.ok) {
			const errText = await res.text();
			console.error("Airtable sync error:", res.status, errText);
			return {
				success: false,
				error: `Airtable API HTTP ${res.status}: ${errText.slice(0, 200)}`
			};
		}
		const resJson = await res.json();
		return {
			success: true,
			recordId: recordId || resJson.id || resJson.records?.[0]?.id,
			syncedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
	} catch (err) {
		console.error("Airtable request exception:", err);
		return {
			success: false,
			error: err instanceof Error ? err.message : String(err)
		};
	}
});
//#endregion
export { syncRecordToAirtable_createServerFn_handler };
