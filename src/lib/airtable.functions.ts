import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const workLogSchema = z.object({
  id: z.string(),
  date: z.string(),
  checkInTime: z.string(),
  checkOutTime: z.string().optional().nullable(),
  workType: z.string(),
  locationName: z.string(),
  checkInGPS: z
    .object({
      lat: z.string().nullable().optional(),
      lng: z.string().nullable().optional(),
      text: z.string().optional(),
    })
    .optional()
    .nullable(),
  checkOutGPS: z
    .object({
      lat: z.string().nullable().optional(),
      lng: z.string().nullable().optional(),
      text: z.string().optional(),
    })
    .optional()
    .nullable(),
  grossHours: z.number().optional().default(0),
  workingHours: z.number().optional().default(0),
  otHours: z.number().optional().default(0),
  otType: z.number().optional().default(0),
  baseWage: z.number().optional().default(0),
  otIncome: z.number().optional().default(0),
  travelCost: z.number().optional().default(0),
  foodCost: z.number().optional().default(0),
  otherIncome: z.number().optional().default(0),
  otherDeductions: z.number().optional().default(0),
  netIncome: z.number().optional().default(0),
  tasks: z.array(z.string()).optional().default([]),
  airtableRecordId: z.string().optional().nullable(),
});

function gpsStr(gps?: { lat?: string | null; lng?: string | null; text?: string } | null) {
  if (!gps) return "-";
  if (gps.lat && gps.lng) return `${gps.lat}, ${gps.lng}`;
  return gps.text || "-";
}

function bangkokDateTime(iso?: string | null) {
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
    hour12: false,
  }).format(date);
}

export const syncRecordToAirtable = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z
      .object({
        log: workLogSchema,
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const apiKey = process.env.AIRTABLE_API_KEY;
    const baseId = process.env.AIRTABLE_BASE_ID;
    const tableName = process.env.AIRTABLE_TABLE_NAME || "WorkLogs";

    if (!apiKey || !baseId) {
      return {
        success: false,
        error: "ยังไม่ได้ตั้งค่า AIRTABLE_API_KEY หรือ AIRTABLE_BASE_ID ในระบบ",
      };
    }

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
      "#รายละเอียดงาน": taskDetails,
    };

    try {
      let recordId = log.airtableRecordId || null;

      // Look up by the stable Work Tracker id before POST to make retries idempotent.
      if (!recordId) {
        const escapedId = log.id.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
        const lookupUrl = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}?maxRecords=1&filterByFormula=${encodeURIComponent(`{#รหัส}='${escapedId}'`)}`;
        const lookup = await fetch(lookupUrl, {
          headers: { Authorization: `Bearer ${apiKey}` },
        });
        if (lookup.ok) {
          const lookupJson = (await lookup.json()) as { records?: { id: string }[] };
          recordId = lookupJson.records?.[0]?.id || null;
        }
      }

      const url = recordId
        ? `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}/${recordId}`
        : `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`;
      const method = recordId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(recordId ? { fields } : { records: [{ fields }] }),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error("Airtable sync error:", res.status, errText);
        return {
          success: false,
          error: `Airtable API HTTP ${res.status}: ${errText.slice(0, 200)}`,
        };
      }

      const resJson = (await res.json()) as { id?: string; records?: { id: string }[] };
      const savedRecordId = recordId || resJson.id || resJson.records?.[0]?.id;

      return {
        success: true,
        recordId: savedRecordId,
        syncedAt: new Date().toISOString(),
      };
    } catch (err) {
      console.error("Airtable request exception:", err);
      return {
        success: false,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  });
