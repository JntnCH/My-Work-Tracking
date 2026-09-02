/**
 * Domain types + pure business logic + localStorage persistence
 * for the Work Tracker (Check-in / Check-out) app.
 */

export type GPSPoint = {
  lat: string | null;
  lng: string | null;
  text: string;
  addressName?: string;
  accuracy?: number | null;
};

export type ActiveCheckIn = {
  id: string;
  date: string;
  checkInTime: string;
  workType: string;
  locationName: string;
  checkInGPS: GPSPoint;
  checkInPhoto: string | null;
  dailyRate: number;
  otType: number;
  travelCost: number;
  foodCost: number;
  otherIncome: number;
  otherDeductions: number;
  /** Jobs finished during this shift (free-text list). */
  tasks?: string[];
};

export type WorkLog = ActiveCheckIn & {
  checkOutTime: string;
  checkOutGPS: GPSPoint;
  checkOutPhoto: string | null;
  grossHours: number;
  workingHours: number;
  otHours: number;
  baseWage: number;
  otIncome: number;
  netIncome: number;
  /** Timestamp of the last successful Google Sheets mirror. */
  syncedAt?: string | null;
  /** Airtable sync lifecycle is independent from the Google Sheets mirror. */
  airtableRecordId?: string | null;
  airtableSyncedAt?: string | null;
  airtableSyncStatus?: "synced" | "failed" | "pending";
};

export const STORAGE_KEYS = {
  logs: "work_tracker_logs",
  active: "work_tracker_active",
  categories: "work_tracker_categories",
  settings: "work_tracker_settings",
  theme: "work_tracker_theme",
  sheet: "work_tracker_sheet",
  serviceAccount: "work_tracker_service_account",
} as const;

export const DEFAULT_CATEGORIES = [
  "ร้านก๋วยเตี๋ยว (จ่ามุน)",
  "ร้านก๋วยเตี๋ยว",
  "คลัง QT",
  "ACOM",
  "คลัง ACOM",
  "คลังเซ็นทรัล",
  "M SENKO",
  "SHOPEE (คลังเก่า)",
  "คลังคูเน่",
  "คลังอีฟแอนด์บอย",
];

export const OT_OPTIONS = [
  { value: 0, label: "ไม่มี OT" },
  { value: 1.5, label: "OT 1.5 เท่า (วันทำงานปกติ)" },
  { value: 2, label: "OT 2.0 เท่า (วันหยุดทำงาน)" },
  { value: 3, label: "OT 3.0 เท่า (วันหยุดนักขัตฤกษ์)" },
];

export const BREAK_OPTIONS = [
  { value: 1, label: "หักเวลาพัก 1 ชม. (อัตโนมัติ)" },
  { value: 0, label: "ไม่หักเวลาพัก (0 ชม.)" },
  { value: 0.5, label: "หักเวลาพัก 30 นาที (0.5 ชม.)" },
  { value: 1.5, label: "หักเวลาพัก 1.5 ชม." },
  { value: 2, label: "หักเวลาพัก 2 ชม." },
];

export type RateSettings = {
  dailyRate: number;
  otType: number;
  travelCost: number;
  foodCost: number;
  otherIncome: number;
  otherDeductions: number;
  breakHours?: number;
};

export const DEFAULT_RATES: RateSettings = {
  dailyRate: 500,
  otType: 0,
  travelCost: 0,
  foodCost: 0,
  otherIncome: 0,
  otherDeductions: 0,
  breakHours: 1,
};

/* ------------------------------------------------------------------ */
/* Pure calculations                                                    */
/* ------------------------------------------------------------------ */

export const BREAK_HOURS = 1;
export const NORMAL_HOURS_PER_DAY = 8;

export type PayrollResult = {
  grossHours: number;
  workingHours: number;
  otHours: number;
  baseWage: number;
  otIncome: number;
  netIncome: number;
};

/** Calculates hours & money for one shift. Break deduction configurable (defaults to 1h). */
export function calculatePayroll(
  checkInISO: string,
  checkOutISO: string,
  rates: Pick<
    RateSettings,
    "dailyRate" | "otType" | "travelCost" | "foodCost" | "otherIncome" | "otherDeductions"
  > & { breakHours?: number },
): PayrollResult {
  const diffMs = new Date(checkOutISO).getTime() - new Date(checkInISO).getTime();
  const grossHours = Math.max(diffMs, 0) / (1000 * 60 * 60);

  const breakDeduction =
    typeof rates.breakHours === "number" ? Math.max(rates.breakHours, 0) : BREAK_HOURS;
  let net = grossHours >= breakDeduction ? grossHours - breakDeduction : grossHours;
  net = Math.max(round2(net), 0);

  let workingHours = net;
  let otHours = 0;
  if (net > NORMAL_HOURS_PER_DAY) {
    workingHours = NORMAL_HOURS_PER_DAY;
    otHours = round2(net - NORMAL_HOURS_PER_DAY);
  }

  const hourlyRate = rates.dailyRate / NORMAL_HOURS_PER_DAY;
  const baseWage = workingHours * hourlyRate;
  const otMultiplier = rates.otType !== undefined ? rates.otType : 0;
  const otIncome = otHours * hourlyRate * otMultiplier;
  const netIncome =
    baseWage +
    otIncome +
    rates.travelCost +
    rates.foodCost +
    rates.otherIncome -
    rates.otherDeductions;

  return {
    grossHours: round2(grossHours),
    workingHours,
    otHours,
    baseWage: Math.round(baseWage),
    otIncome: Math.round(otIncome),
    netIncome: Math.round(netIncome),
  };
}

export function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export function formatDuration(ms: number) {
  const safe = Math.max(ms, 0);
  const h = Math.floor(safe / 3_600_000);
  const m = Math.floor((safe % 3_600_000) / 60_000);
  const s = Math.floor((safe % 60_000) / 1000);
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

export function formatTHB(n: number) {
  return `฿${Math.round(n).toLocaleString("th-TH")}`;
}

export function formatThaiDateTime(iso: string) {
  const d = new Date(iso);
  return `${d.toLocaleDateString("th-TH", { timeZone: "Asia/Bangkok", day: "numeric", month: "short", year: "2-digit" })} ${d.toLocaleTimeString("th-TH", { timeZone: "Asia/Bangkok", hour: "2-digit", minute: "2-digit", hour12: false })}`;
}

export function dateInBangkok(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Bangkok" }).format(d);
}

/** Extracts lat/lng from a pasted Google Maps URL, if present. */
export function parseMapsUrl(value: string): { lat: string; lng: string } | null {
  if (!/maps\.google\.com|goo\.gl|google\.com\/maps/.test(value)) return null;
  const at = value.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (at) return { lat: at[1]!, lng: at[2]! };
  const q = value.match(/(?:query|q|ll)=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (q) return { lat: q[1]!, lng: q[2]! };
  return null;
}

/* ------------------------------------------------------------------ */
/* Monthly aggregation                                                  */
/* ------------------------------------------------------------------ */

export type MonthlySummary = {
  logs: WorkLog[];
  totalNet: number;
  workDays: number;
  daysWithOt: number;
  daysWithoutOt: number;
  totalHours: number;
  totalOtHours: number;
  totalOtIncome: number;
  totalAllowances: number;
  totalDeductions: number;
  totalTasks: number;
  avgTasksPerDay: number;
  dailyTasks: { label: string; value: number }[];
  dailyIncome: { label: string; value: number }[];
  byWorkType: { name: string; value: number }[];
  byLocation: { name: string; value: number }[];
};

export function summarizeMonth(logs: WorkLog[], yearMonth: string): MonthlySummary {
  const filtered = logs.filter((l) => l.date?.startsWith(yearMonth));
  const days = new Set<string>();
  const dailyMap = new Map<string, number>();
  const typeMap = new Map<string, number>();
  const locMap = new Map<string, number>();
  const taskDayMap = new Map<string, number>();

  let totalNet = 0;
  let totalHours = 0;
  let totalOtHours = 0;
  let totalOtIncome = 0;
  let totalAllowances = 0;
  let totalDeductions = 0;
  let totalTasks = 0;
  let daysWithOt = 0;
  let daysWithoutOt = 0;

  for (const l of filtered) {
    days.add(l.date);
    totalNet += l.netIncome ?? 0;
    totalHours += (l.workingHours ?? 0) + (l.otHours ?? 0);
    totalOtHours += l.otHours ?? 0;
    totalOtIncome += l.otIncome ?? 0;
    totalAllowances += (l.travelCost ?? 0) + (l.foodCost ?? 0) + (l.otherIncome ?? 0);
    totalDeductions += l.otherDeductions ?? 0;

    if ((l.otHours ?? 0) > 0 && (l.otType ?? 0) > 0) {
      daysWithOt += 1;
    } else {
      daysWithoutOt += 1;
    }

    dailyMap.set(l.date, (dailyMap.get(l.date) ?? 0) + (l.netIncome ?? 0));
    typeMap.set(l.workType, (typeMap.get(l.workType) ?? 0) + (l.netIncome ?? 0));
    locMap.set(l.locationName, (locMap.get(l.locationName) ?? 0) + 1);
    const tc = taskCount(l);
    totalTasks += tc;
    taskDayMap.set(l.date, (taskDayMap.get(l.date) ?? 0) + tc);
  }

  return {
    logs: filtered,
    totalNet,
    workDays: days.size,
    daysWithOt,
    daysWithoutOt,
    totalHours: round2(totalHours),
    totalOtHours: round2(totalOtHours),
    totalOtIncome,
    totalAllowances,
    totalDeductions,
    totalTasks,
    avgTasksPerDay: days.size ? round2(totalTasks / days.size) : 0,
    dailyTasks: [...taskDayMap.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, value]) => ({ label: date.slice(8), value })),
    dailyIncome: [...dailyMap.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, value]) => ({ label: date.slice(8), value })),
    byWorkType: [...typeMap.entries()].map(([name, value]) => ({ name, value })),
    byLocation: [...locMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value]) => ({ name, value })),
  };
}

/* ------------------------------------------------------------------ */
/* CSV export                                                           */
/* ------------------------------------------------------------------ */

export const CSV_HEADERS = [
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

/** Local "HH:mm:ss" (locale-independent so the sheet round-trips exactly). */
function clockText(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("th-TH", {
    timeZone: "Asia/Bangkok",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export function logToRow(log: WorkLog): (string | number)[] {
  return [
    log.id,
    log.date,
    clockText(log.checkInTime),
    log.checkOutTime ? clockText(log.checkOutTime) : "",
    log.workType,
    log.locationName,
    gpsText(log.checkInGPS),
    gpsText(log.checkOutGPS),
    log.grossHours ?? 0,
    log.workingHours ?? 0,
    log.otHours ?? 0,
    log.otType ?? 0,
    log.baseWage ?? 0,
    log.otIncome ?? 0,
    log.travelCost ?? 0,
    log.foodCost ?? 0,
    log.otherIncome ?? 0,
    log.otherDeductions ?? 0,
    log.netIncome ?? 0,
    taskCount(log),
    (log.tasks ?? []).join(" | "),
  ];
}

export function taskCount(log: { tasks?: string[] }) {
  return (log.tasks ?? []).filter((t) => t.trim()).length;
}

export function gpsText(gps?: GPSPoint | null) {
  if (!gps?.lat || !gps?.lng) return "-";
  return `${gps.lat}, ${gps.lng}`;
}

export function buildCSV(logs: WorkLog[]) {
  const rows = [CSV_HEADERS, ...logs.map(logToRow)];
  return rows
    .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");
}

/* ------------------------------------------------------------------ */
/* Storage (browser only — call from effects/handlers)                  */
/* ------------------------------------------------------------------ */

/**
 * All data is namespaced per signed-in user so two accounts on the same device
 * never overwrite each other (including their Google Sheets target).
 */
let namespace = "";

export function setStorageNamespace(userId: string | null) {
  namespace = userId ?? "";
}

function nsKey(key: string) {
  return namespace ? `${key}::${namespace}` : key;
}

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(nsKey(key));
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(nsKey(key), JSON.stringify(value));
}

export const DEFAULT_SEED_CSV = `รหัส,วันที่,เวลาเข้า,เวลาออก,ประเภทงาน,สถานที่,พิกัดเข้า,พิกัดออก,ชั่วโมงรวม,ชั่วโมงปกติ,ชั่วโมง OT,ตัวคูณ OT,ค่าแรงพื้นฐาน,ค่า OT,ค่าเดินทาง,ค่าอาหาร,รายรับอื่น,รายการหัก,รายได้สุทธิ,จำนวนงานที่ทำเสร็จ,รายละเอียดงาน
LOG-1786264136771,2026-08-02,08:30:00,17:30:00,คลัง QT,"บ้านคลองสกัด 25, ตำบลบางเสาธง","13.648316, 100.787597","13.648316, 100.787597",9,8,0,0,500,0,0,0,0,0,500,1,สำเร็จ
LOG-1785935864297,2026-08-05,08:30:00,17:30:00,คลัง QT,"บ้านเกาะพิจิตร์, ตำบลศีรษะจรเข้ใหญ่","13.606908, 100.801796","13.606995, 100.801919",9,8,0,0,500,0,0,0,0,0,500,1,สำเร็จ
LOG-1785900110110,2026-08-05,20:30:00,05:30:00,คลัง ACOM,"บ้านคลองสกัด 25, ตำบลบางเสาธง","13.581257, 100.807049","13.581257, 100.807049",9,8,0,0,500,0,0,0,0,0,500,1,สำเร็จ
LOG-1786114166311,2026-08-06,08:30:00,17:30:00,คลัง QT,"บ้านคลองสกัด 25, ตำบลบางเสาธง","13.581257, 100.807049","13.581257, 100.807049",9,8,0,0,500,0,0,0,0,0,500,1,สำเร็จ
LOG-1786262209022,2026-08-07,08:30:00,17:30:00,คลัง QT,"บ้านคลองสกัด 25, ตำบลบางเสาธง","13.648316, 100.787597","13.648316, 100.787597",9,8,0,0,500,0,0,0,0,0,500,1,สำเร็จ
LOG-1786262564293,2026-08-08,08:30:00,17:30:00,คลัง QT,"บ้านคลองสกัด 25, ตำบลบางเสาธง","13.648316, 100.787597","13.648316, 100.787597",9,8,0,0,500,0,0,0,0,0,500,1,สำเร็จ
LOG-1786773363268,2026-08-13,20:30:00,07:30:00,ACOM,"บ้านคลองสกัด 25, ตำบลบางเสาธง","13.567874, 100.762624","13.567874, 100.762624",11,8,2,1.5,400,150,50,50,0,5,645,1,ACOM
LOG-1786780139250,2026-08-15,08:30:00,17:30:00,คลังเซ็นทรัล,"บ้านบางกะสี, ตำบลบางปลา","13.567446, 100.764616","13.567446, 100.764616",9,8,0,0,550,0,0,0,0,0,550,1,คลังเซ็นทรัล
LOG-1786887740964,2026-08-16,21:00:00,06:00:00,M SENKO,"บ้านคลองสำโรง, ตำบลบางเสาธง","13.595654, 100.784874","13.595654, 100.784874",9,8,0,0,550,0,0,0,0,0,550,1,M SENKO
LOG-1787214329477,2026-08-20,08:00:00,17:00:00,ร้านก๋วยเตี๋ยว,"บ้านสามแพรก, ตำบลบางเมือง","13.587066, 100.636960","13.649656, 100.790960",9,8,0,0,400,0,0,0,0,0,400,1,ร้านก๋วยเตี๋ยว
LOG-1787297780521,2026-08-21,08:00:00,17:00:00,ร้านก๋วยเตี๋ยว,"บ้านสามแพรก, ตำบลบางเมือง","13.587037, 100.636937","13.587037, 100.636937",9,8,0,0,400,0,0,0,2100,0,2500,1,ร้านก๋วยเตี๋ยว
LOG-1787370162088,2026-08-22,08:00:00,17:00:00,ร้านก๋วยเตี๋ยว,"บ้านสามแพรก, ตำบลบางเมือง","13.587033, 100.636939","13.649079, 100.790757",9,8,0,0,400,0,0,0,1600,0,2000,1,ร้านก๋วยเตี๋ยว
LOG-1787481710848,2026-08-23,08:30:00,17:30:00,ร้านก๋วยเตี๋ยว,"บ้านสามแพรก, ตำบลบางเมือง","13.587675, 100.637525","13.587489, 100.637413",9,8,0,0,400,0,0,0,0,0,400,1,ร้านก๋วยเตี๋ยว
LOG-1787534692099,2026-08-24,08:00:00,17:00:00,ร้านก๋วยเตี๋ยว,"บ้านสามแพรก, ตำบลบางเมือง","13.587676, 100.637517","13.649139, 100.790686",9,8,0,0,200,0,0,0,0,0,200,1,ร้านก๋วยเตี๋ยว
LOG-1787649152521,2026-08-25,08:00:00,17:00:00,คลังเซ็นทรัล,"บ้านเกาะบางกวาด, ตำบลศีรษะจรเข้ใหญ่","13.649653, 100.790959","13.649205, 100.790744",9,8,0,0,400,0,50,50,0,0,500,1,คลังเซ็นทรัล
LOG-1787752751546,2026-08-26,09:00:00,18:00:00,ACOM,"บ้านเกาะพิจิตร์, ตำบลศีรษะจรเข้ใหญ่","13.607132, 100.802002","13.607128, 100.802005",9,8,0,0,400,0,50,0,0,0,450,1,ACOM
LOG-1787975316002,2026-08-28,08:00:00,17:00:00,ร้านก๋วยเตี๋ยว (จ่ามุน),"บ้านสามแพรก, ตำบลบางเมือง","13.587675, 100.637525","13.587675, 100.637525",9,8,0,0,400,0,0,0,0,0,400,1,ร้านก๋วยเตี๋ยว (จ่ามุน)
LOG-1788088011558,2026-08-30,09:00:00,18:00:00,ร้านก๋วยเตี๋ยว (จ่ามุน),"บ้านสามแพรก, ตำบลบางเมือง","13.587678, 100.637542","13.587636, 100.637508",9,8,0,0,300,0,0,0,0,0,300,1,ร้านก๋วยเตี๋ยว (จ่ามุน)`;

export const DEFAULT_SEED_LOGS = parseCSVToLogs(DEFAULT_SEED_CSV);

export const storage = {
  getLogs: () => read<WorkLog[]>(STORAGE_KEYS.logs, DEFAULT_SEED_LOGS),
  setLogs: (logs: WorkLog[]) => write(STORAGE_KEYS.logs, logs),
  getActive: () => read<ActiveCheckIn | null>(STORAGE_KEYS.active, null),
  setActive: (a: ActiveCheckIn | null) => {
    if (typeof window === "undefined") return;
    if (a) write(STORAGE_KEYS.active, a);
    else window.localStorage.removeItem(nsKey(STORAGE_KEYS.active));
  },
  getCategories: () => read<string[]>(STORAGE_KEYS.categories, DEFAULT_CATEGORIES),
  setCategories: (c: string[]) => write(STORAGE_KEYS.categories, c),
  getRates: () => read<RateSettings>(STORAGE_KEYS.settings, DEFAULT_RATES),
  setRates: (r: RateSettings) => write(STORAGE_KEYS.settings, r),
  getTheme: <T>(fallback: T) => read<T>(STORAGE_KEYS.theme, fallback),
  setTheme: (theme: unknown) => write(STORAGE_KEYS.theme, theme),
  getSheetId: () => read<string>(STORAGE_KEYS.sheet, ""),
  setSheetId: (id: string) => write(STORAGE_KEYS.sheet, id),
  getServiceAccount: () => read<string>(STORAGE_KEYS.serviceAccount, ""),
  setServiceAccount: (jsonOrKey: string) => write(STORAGE_KEYS.serviceAccount, jsonOrKey),
};

/* ------------------------------------------------------------------ */
/* datetime-local helpers                                               */
/* ------------------------------------------------------------------ */

/** ISO string -> value for <input type="datetime-local"> in Thailand time. */
export function toLocalInput(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(d);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}`;
}

/** datetime-local value -> ISO string, interpreted as Asia/Bangkok (null if invalid). */
export function fromLocalInput(value: string): string | null {
  if (!value) return null;
  const d = new Date(`${value}:00+07:00`);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/** Accepts a full Google Sheets URL or a bare spreadsheet ID. */
export function extractSpreadsheetId(input: string) {
  const trimmed = input.trim();
  const m = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return m ? m[1]! : trimmed;
}

/* ------------------------------------------------------------------ */
/* Google Sheets round-trip                                             */
/* ------------------------------------------------------------------ */

function num(v: string | undefined) {
  const n = Number(String(v ?? "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

export function gpsFromText(text: string | undefined): GPSPoint {
  const m = String(text ?? "").match(/(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/);
  if (!m) return { lat: null, lng: null, text: text && text !== "-" ? text : "" };
  return { lat: m[1]!, lng: m[2]!, text: `${m[1]}, ${m[2]}` };
}

/** Google Sheets serial number (days since 1899-12-30) -> "YYYY-MM-DD". */
function dateFromSerial(serial: number) {
  const ms = Math.round(serial * 86400000);
  const d = new Date(Date.UTC(1899, 11, 30) + ms);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

/** Normalizes a date cell that may be text or a Sheets serial number. */
function normalizeDate(cell: string) {
  const raw = String(cell ?? "").trim();
  if (!raw) return "";
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);
  const n = Number(raw);
  if (Number.isFinite(n) && n > 1000) return dateFromSerial(n);
  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) {
    const pad = (x: number) => String(x).padStart(2, "0");
    return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}`;
  }
  return "";
}

/** Normalizes a time cell that may be "HH:mm[:ss]" or a Sheets day fraction. */
function normalizeTime(cell: string) {
  const raw = String(cell ?? "").trim();
  if (!raw) return "";
  if (raw.includes(":")) return raw;
  const n = Number(raw);
  if (!Number.isFinite(n)) return "";
  const totalSec = Math.round((n % 1) * 86400);
  const pad = (x: number) => String(x).padStart(2, "0");
  return `${pad(Math.floor(totalSec / 3600))}:${pad(Math.floor((totalSec % 3600) / 60))}:${pad(totalSec % 60)}`;
}

/** "2026-08-07" + "08:30:00" -> ISO string in the viewer's local timezone. */
function isoFrom(date: string, time: string) {
  const [y, mo, d] = date.split("-").map(Number);
  const [h = 0, mi = 0, s = 0] = normalizeTime(time).split(":").map(Number);
  const dt = new Date(y ?? 1970, (mo ?? 1) - 1, d ?? 1, h, mi, s);
  return Number.isNaN(dt.getTime()) ? "" : dt.toISOString();
}

/** Converts one WorkLogs sheet row back into a WorkLog (sheet is the source of truth). */
export function rowToLog(row: string[]): WorkLog | null {
  const date = normalizeDate(row[1] ?? "");
  if (!date) return null;
  const checkInTime = isoFrom(date, row[2] ?? "00:00:00");
  let checkOutTime = row[3] ? isoFrom(date, row[3]) : "";
  if (!checkInTime) return null;
  // Shift that ends after midnight: the sheet only stores a clock time.
  if (checkOutTime && new Date(checkOutTime).getTime() < new Date(checkInTime).getTime()) {
    checkOutTime = new Date(new Date(checkOutTime).getTime() + 86400000).toISOString();
  }
  return {
    id: (row[0] ?? "").trim() || `LOG-${new Date(checkInTime).getTime()}`,
    date,
    checkInTime,
    checkOutTime,

    workType: row[4] ?? "",
    locationName: row[5] ?? "",
    checkInGPS: gpsFromText(row[6]),
    checkOutGPS: gpsFromText(row[7]),
    checkInPhoto: null,
    checkOutPhoto: null,
    grossHours: num(row[8]),
    workingHours: num(row[9]),
    otHours: num(row[10]),
    otType: row[11] !== "" && row[11] !== undefined ? num(row[11]) : 0,
    baseWage: num(row[12]),
    otIncome: num(row[13]),
    travelCost: num(row[14]),
    foodCost: num(row[15]),
    otherIncome: num(row[16]),
    otherDeductions: num(row[17]),
    netIncome: num(row[18]),
    dailyRate: num(row[9]) ? Math.round((num(row[12]) / num(row[9])) * NORMAL_HOURS_PER_DAY) : 0,
    tasks: (row[20] ?? "")
      .split("|")
      .map((t) => t.trim())
      .filter(Boolean),
    syncedAt: new Date().toISOString(),
  };
}

/** Parses a single CSV line with support for double-quoted comma values. */
export function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(cur.trim());
      cur = "";
    } else {
      cur += char;
    }
  }
  result.push(cur.trim());
  return result;
}

/** Parses raw CSV text containing WorkLogs into an array of WorkLog objects. */
export function parseCSVToLogs(csvText: string): WorkLog[] {
  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) return [];

  const headers = parseCSVLine(lines[0] ?? "");
  const isHeaderRow =
    headers[0]?.includes("รหัส") ||
    headers[1]?.includes("วันที่") ||
    headers[0]?.toLowerCase().includes("id") ||
    headers[1]?.toLowerCase().includes("date");
  const startIndex = isHeaderRow ? 1 : 0;

  const logs: WorkLog[] = [];
  for (let i = startIndex; i < lines.length; i++) {
    const row = parseCSVLine(lines[i]!);
    const log = rowToLog(row);
    if (log) {
      logs.push(log);
    }
  }
  return logs;
}
