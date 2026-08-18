import { i as __toESM } from "./_runtime.mjs";
import { i as require_react, n as useQueryClient, r as require_jsx_runtime } from "./_libs/react+tanstack__react-query.mjs";
import { y as useNavigate } from "./_libs/@tanstack/react-router+[...].mjs";
import { i as getServerFnById, n as createServerFn, r as TSS_SERVER_FUNCTION } from "./_ssr/server-C_NStXiV.mjs";
import { t as supabase } from "./_ssr/client-CFjc3-zE.mjs";
import { i as useSession, n as displayName, t as clearGuestUser } from "./_ssr/use-session-CMgn6U0v.mjs";
import { a as unionType, i as stringType, n as numberType, r as objectType, t as arrayType } from "./_libs/zod.mjs";
import { n as toast } from "./_libs/sonner.mjs";
import { A as FilePlusCorner, B as Clock3, C as ListPlus, D as Laptop, E as LayoutDashboard, F as Coins, G as Camera, H as CircleMinus, I as Cog, J as BedDouble, K as CalendarCheck, L as CloudUpload, M as Download, N as Database, O as KeyRound, P as Crosshair, R as CloudDownload, S as LocateFixed, T as Link2, U as CircleCheck, V as ClipboardList, W as Check, _ as MapPin, a as Trash2, b as LogIn, c as ScanFace, d as RefreshCw, f as Plus, g as MapPinned, h as Moon, i as TrendingUp, j as ExternalLink, k as FileSpreadsheet, l as Save, m as Palette, o as Sun, p as Pencil, q as Briefcase, s as Settings2, t as X, u as RotateCcw, w as ListChecks, x as Lock, y as LogOut, z as Clock } from "./_libs/lucide-react.mjs";
import { a as Bar, c as ResponsiveContainer, i as XAxis, l as Tooltip, n as BarChart, o as Pie, r as YAxis, s as Cell, t as PieChart } from "./_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_authenticated-C1QModZJ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* "ปลดล็อกด้วย Face ID / Touch ID" — WebAuthn platform authenticator used as a
* local app lock after the user has already signed in.
* The credential id is stored per user id on this device only.
*/
var KEY = "work_tracker_face_unlock";
function readAll() {
	if (typeof window === "undefined") return {};
	try {
		return JSON.parse(window.localStorage.getItem(KEY) ?? "{}");
	} catch {
		return {};
	}
}
function writeAll(value) {
	window.localStorage.setItem(KEY, JSON.stringify(value));
}
function isFaceUnlockSupported() {
	return typeof window !== "undefined" && !!window.PublicKeyCredential;
}
function isIframeEnvironment() {
	return typeof window !== "undefined" && window.self !== window.top;
}
function getFaceCredentialId(userId) {
	return readAll()[userId] ?? null;
}
function clearFaceCredential(userId) {
	const all = readAll();
	delete all[userId];
	writeAll(all);
}
function toBase64Url(buffer) {
	const bytes = new Uint8Array(buffer);
	let binary = "";
	bytes.forEach((b) => binary += String.fromCharCode(b));
	return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function fromBase64Url(value) {
	const padded = value.replace(/-/g, "+").replace(/_/g, "/");
	const binary = atob(padded + "=".repeat((4 - padded.length % 4) % 4));
	return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}
function randomChallenge() {
	const bytes = /* @__PURE__ */ new Uint8Array(32);
	crypto.getRandomValues(bytes);
	return bytes;
}
function getRelyingPartyId() {
	if (typeof window === "undefined") return "localhost";
	return window.location.hostname;
}
function formatError(err, action) {
	if (isIframeEnvironment()) return "เนื่องจากกำลังเปิดแอปในกรอบตัวอย่าง (iframe) เบราว์เซอร์จะบล็อก Face ID ด้วยเหตุผลด้านความปลอดภัย กรุณากดปุ่มเปิดในแท็บใหม่ (Open in New Tab) เพื่อใช้งาน Face ID";
	if (err instanceof Error) {
		if (err.name === "NotAllowedError") return action === "enroll" ? "การตั้งค่า Face ID ถูกยกเลิก หรือไม่ได้เปิดสิทธิ์สแกนใบหน้าบนเบราว์เซอร์/อุปกรณ์นี้" : "การสแกน Face ID / Touch ID ถูกยกเลิก หรือไม่ตรงกับข้อมูลในเครื่อง";
		if (err.name === "SecurityError") return "เบราว์เซอร์ไม่อนุญาตให้ใช้ Face ID ในหน้านี้ กรุณาเปิดแอปในแท็บใหม่ผ่าน HTTPS";
		if (err.name === "NotSupportedError") return "อุปกรณ์หรือเบราว์เซอร์นี้ยังไม่รองรับระบบสแกนใบหน้า/ลายนิ้วมือ";
		if (err.name === "InvalidStateError") return "บัญชีนี้ได้ลงทะเบียน Face ID บนอุปกรณ์นี้เรียบร้อยแล้ว";
		return err.message;
	}
	return String(err);
}
/** Registers a platform credential (Face ID / Touch ID) for this user + device. */
async function enrollFaceUnlock(userId, displayName) {
	if (!isFaceUnlockSupported()) throw new Error("อุปกรณ์หรือเบราว์เซอร์นี้ไม่รองรับ Face ID / Touch ID");
	if (isIframeEnvironment()) throw new Error("เนื่องจากเปิดแอปอยู่ในกรอบพรีวิว (iframe) เบราว์เซอร์จึงบล็อก Face ID กรุณากดเปิดแอปในแท็บใหม่ (New Tab) เพื่อเปิดใช้ Face ID");
	try {
		const rpId = getRelyingPartyId();
		const credential = await navigator.credentials.create({ publicKey: {
			challenge: randomChallenge(),
			rp: {
				name: "Work Tracker",
				id: rpId
			},
			user: {
				id: Uint8Array.from(userId.slice(0, 32), (c) => c.charCodeAt(0)),
				name: displayName || "User",
				displayName: displayName || "User"
			},
			pubKeyCredParams: [{
				type: "public-key",
				alg: -7
			}, {
				type: "public-key",
				alg: -257
			}],
			authenticatorSelection: { userVerification: "preferred" },
			timeout: 6e4,
			attestation: "none"
		} });
		if (!credential) throw new Error("ไม่ได้รับข้อมูลการยืนยันตัวตนจากอุปกรณ์");
		const all = readAll();
		all[userId] = toBase64Url(credential.rawId);
		writeAll(all);
	} catch (err) {
		throw new Error(formatError(err, "enroll"));
	}
}
/** Prompts Face ID / Touch ID. Resolves when the device verifies the user. */
async function verifyFaceUnlock(userId) {
	const stored = getFaceCredentialId(userId);
	if (!stored) throw new Error("ยังไม่ได้ตั้งค่า Face ID บนอุปกรณ์นี้");
	if (isIframeEnvironment()) throw new Error("เนื่องจากเปิดแอปอยู่ในกรอบพรีวิว (iframe) เบราว์เซอร์จึงบล็อก Face ID กรุณากดเปิดแอปในแท็บใหม่ (New Tab) เพื่อปลดล็อกด้วย Face ID");
	try {
		const rpId = getRelyingPartyId();
		if (!await navigator.credentials.get({ publicKey: {
			challenge: randomChallenge(),
			rpId,
			allowCredentials: [{
				type: "public-key",
				id: fromBase64Url(stored)
			}],
			userVerification: "preferred",
			timeout: 6e4
		} })) throw new Error("การยืนยันตัวตนด้วย Face ID ไม่สำเร็จ");
	} catch (err) {
		throw new Error(formatError(err, "verify"));
	}
}
function AppHeader({ name, email, userId, faceEnrolled, faceSupported, onFaceChanged, onSignOut }) {
	const [now, setNow] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setNow(/* @__PURE__ */ new Date());
		const id = setInterval(() => setNow(/* @__PURE__ */ new Date()), 1e3);
		return () => clearInterval(id);
	}, []);
	async function toggleFace() {
		setBusy(true);
		try {
			if (faceEnrolled) {
				clearFaceCredential(userId);
				toast.success("ปิดการล็อกด้วย Face ID เรียบร้อยแล้ว");
			} else {
				await enrollFaceUnlock(userId, name || email || "user");
				toast.success("ตั้งค่า Face ID / Touch ID บนอุปกรณ์นี้สำเร็จแล้ว!");
			}
			onFaceChanged();
		} catch (err) {
			toast.error("ตั้งค่า Face ID ไม่สำเร็จ", {
				description: err instanceof Error ? err.message : String(err),
				duration: 8e3
			});
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
		className: "gradient-header sticky top-0 z-40 text-primary-foreground shadow-lg",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-w-0 items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "rounded-xl bg-card p-2 text-primary shadow-md",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock3, { className: "h-5 w-5" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-lg leading-tight font-bold",
						children: "Work Tracker"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "truncate text-xs opacity-80",
						children: name || "ระบบบันทึกงาน & Check-in"
					})]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "hidden rounded-lg border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-1.5 text-right text-xs font-medium tabular-nums sm:block md:text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							suppressHydrationWarning: true,
							children: now ? now.toLocaleTimeString("th-TH", { hour12: false }) : "--:--:--"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[10px] font-normal opacity-80",
							suppressHydrationWarning: true,
							children: now ? now.toLocaleDateString("th-TH", {
								day: "numeric",
								month: "short",
								year: "2-digit"
							}) : ""
						})]
					}),
					faceSupported && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => void toggleFace(),
						disabled: busy,
						title: faceEnrolled ? "ปิดล็อกด้วย Face ID" : "เปิดล็อกด้วย Face ID",
						"aria-label": faceEnrolled ? "ปิดล็อกด้วย Face ID" : "เปิดล็อกด้วย Face ID",
						className: `rounded-lg border border-primary-foreground/20 p-2 transition disabled:opacity-60 ${faceEnrolled ? "bg-primary-foreground/30" : "bg-primary-foreground/10"}`,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScanFace, { className: "h-4 w-4" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: onSignOut,
						title: "ออกจากระบบ",
						"aria-label": "ออกจากระบบ",
						className: "rounded-lg border border-primary-foreground/20 bg-primary-foreground/10 p-2 transition hover:bg-primary-foreground/20",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "h-4 w-4" })
					})
				]
			})]
		})
	});
}
var STORAGE_KEYS = {
	logs: "work_tracker_logs",
	active: "work_tracker_active",
	categories: "work_tracker_categories",
	settings: "work_tracker_settings",
	sheet: "work_tracker_sheet"
};
var DEFAULT_CATEGORIES = [
	"งานติดตั้ง",
	"งานซ่อมบำรุง",
	"งานสำรวจหน้างาน",
	"งานเอกสาร / ออฟฟิศ",
	"งานอื่นๆ"
];
var OT_OPTIONS = [
	{
		value: 0,
		label: "ไม่มี OT"
	},
	{
		value: 1.5,
		label: "OT 1.5 เท่า (วันทำงานปกติ)"
	},
	{
		value: 2,
		label: "OT 2.0 เท่า (วันหยุดทำงาน)"
	},
	{
		value: 3,
		label: "OT 3.0 เท่า (วันหยุดนักขัตฤกษ์)"
	}
];
var DEFAULT_RATES = {
	dailyRate: 500,
	otType: 0,
	travelCost: 0,
	foodCost: 0,
	otherIncome: 0,
	otherDeductions: 0
};
/** Calculates hours & money for one shift. Break of 1h deducted automatically. */
function calculatePayroll(checkInISO, checkOutISO, rates) {
	const diffMs = new Date(checkOutISO).getTime() - new Date(checkInISO).getTime();
	const grossHours = Math.max(diffMs, 0) / 36e5;
	let net = grossHours >= 1 ? grossHours - 1 : grossHours;
	net = Math.max(round2(net), 0);
	let workingHours = net;
	let otHours = 0;
	if (net > 8) {
		workingHours = 8;
		otHours = round2(net - 8);
	}
	const hourlyRate = rates.dailyRate / 8;
	const baseWage = workingHours * hourlyRate;
	const otMultiplier = rates.otType !== void 0 ? rates.otType : 0;
	const otIncome = otHours * hourlyRate * otMultiplier;
	const netIncome = baseWage + otIncome + rates.travelCost + rates.foodCost + rates.otherIncome - rates.otherDeductions;
	return {
		grossHours: round2(grossHours),
		workingHours,
		otHours,
		baseWage: Math.round(baseWage),
		otIncome: Math.round(otIncome),
		netIncome: Math.round(netIncome)
	};
}
function round2(n) {
	return Math.round(n * 100) / 100;
}
function formatDuration(ms) {
	const safe = Math.max(ms, 0);
	return [
		Math.floor(safe / 36e5),
		Math.floor(safe % 36e5 / 6e4),
		Math.floor(safe % 6e4 / 1e3)
	].map((v) => String(v).padStart(2, "0")).join(":");
}
function formatTHB(n) {
	return `฿${Math.round(n).toLocaleString("th-TH")}`;
}
function formatThaiDateTime(iso) {
	const d = new Date(iso);
	return `${d.toLocaleDateString("th-TH", {
		day: "numeric",
		month: "short",
		year: "2-digit"
	})} ${d.toLocaleTimeString("th-TH", {
		hour: "2-digit",
		minute: "2-digit",
		hour12: false
	})}`;
}
/** Extracts lat/lng from a pasted Google Maps URL, if present. */
function parseMapsUrl(value) {
	if (!/maps\.google\.com|goo\.gl|google\.com\/maps/.test(value)) return null;
	const at = value.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
	if (at) return {
		lat: at[1],
		lng: at[2]
	};
	const q = value.match(/(?:query|q|ll)=(-?\d+\.\d+),(-?\d+\.\d+)/);
	if (q) return {
		lat: q[1],
		lng: q[2]
	};
	return null;
}
function summarizeMonth(logs, yearMonth) {
	const filtered = logs.filter((l) => l.date?.startsWith(yearMonth));
	const days = /* @__PURE__ */ new Set();
	const dailyMap = /* @__PURE__ */ new Map();
	const typeMap = /* @__PURE__ */ new Map();
	const locMap = /* @__PURE__ */ new Map();
	const taskDayMap = /* @__PURE__ */ new Map();
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
		if ((l.otHours ?? 0) > 0 && (l.otType ?? 0) > 0) daysWithOt += 1;
		else daysWithoutOt += 1;
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
		dailyTasks: [...taskDayMap.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([date, value]) => ({
			label: date.slice(8),
			value
		})),
		dailyIncome: [...dailyMap.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([date, value]) => ({
			label: date.slice(8),
			value
		})),
		byWorkType: [...typeMap.entries()].map(([name, value]) => ({
			name,
			value
		})),
		byLocation: [...locMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, value]) => ({
			name,
			value
		}))
	};
}
var CSV_HEADERS = [
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
/** Local "HH:mm:ss" (locale-independent so the sheet round-trips exactly). */
function clockText(iso) {
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return "";
	const pad = (n) => String(n).padStart(2, "0");
	return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
function logToRow(log) {
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
		log.otType ?? 1.5,
		log.baseWage ?? 0,
		log.otIncome ?? 0,
		log.travelCost ?? 0,
		log.foodCost ?? 0,
		log.otherIncome ?? 0,
		log.otherDeductions ?? 0,
		log.netIncome ?? 0,
		taskCount(log),
		(log.tasks ?? []).join(" | ")
	];
}
function taskCount(log) {
	return (log.tasks ?? []).filter((t) => t.trim()).length;
}
function gpsText(gps) {
	if (!gps?.lat || !gps?.lng) return "-";
	return `${gps.lat}, ${gps.lng}`;
}
function buildCSV(logs) {
	return [CSV_HEADERS, ...logs.map(logToRow)].map((r) => r.map((cell) => `"${String(cell).replace(/"/g, "\"\"")}"`).join(",")).join("\n");
}
/**
* All data is namespaced per signed-in user so two accounts on the same device
* never overwrite each other (including their Google Sheets target).
*/
var namespace = "";
function setStorageNamespace(userId) {
	namespace = userId ?? "";
}
function nsKey(key) {
	return namespace ? `${key}::${namespace}` : key;
}
function read(key, fallback) {
	if (typeof window === "undefined") return fallback;
	try {
		const raw = window.localStorage.getItem(nsKey(key));
		return raw ? JSON.parse(raw) : fallback;
	} catch {
		return fallback;
	}
}
function write(key, value) {
	if (typeof window === "undefined") return;
	window.localStorage.setItem(nsKey(key), JSON.stringify(value));
}
var storage = {
	getLogs: () => read(STORAGE_KEYS.logs, []),
	setLogs: (logs) => write(STORAGE_KEYS.logs, logs),
	getActive: () => read(STORAGE_KEYS.active, null),
	setActive: (a) => {
		if (typeof window === "undefined") return;
		if (a) write(STORAGE_KEYS.active, a);
		else window.localStorage.removeItem(nsKey(STORAGE_KEYS.active));
	},
	getCategories: () => read(STORAGE_KEYS.categories, DEFAULT_CATEGORIES),
	setCategories: (c) => write(STORAGE_KEYS.categories, c),
	getRates: () => read(STORAGE_KEYS.settings, DEFAULT_RATES),
	setRates: (r) => write(STORAGE_KEYS.settings, r),
	getSheetId: () => read(STORAGE_KEYS.sheet, ""),
	setSheetId: (id) => write(STORAGE_KEYS.sheet, id)
};
/** ISO string -> value for <input type="datetime-local"> (local time). */
function toLocalInput(iso) {
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return "";
	const pad = (n) => String(n).padStart(2, "0");
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
/** datetime-local value -> ISO string (null if invalid). */
function fromLocalInput(value) {
	if (!value) return null;
	const d = new Date(value);
	return Number.isNaN(d.getTime()) ? null : d.toISOString();
}
/** Accepts a full Google Sheets URL or a bare spreadsheet ID. */
function extractSpreadsheetId(input) {
	const trimmed = input.trim();
	const m = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
	return m ? m[1] : trimmed;
}
function gpsFromText(text) {
	const m = String(text ?? "").match(/(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/);
	if (!m) return {
		lat: null,
		lng: null,
		text: text && text !== "-" ? text : ""
	};
	return {
		lat: m[1],
		lng: m[2],
		text: `${m[1]}, ${m[2]}`
	};
}
function CategoryDialog({ open, categories, onSave, onClose }) {
	const [draft, setDraft] = (0, import_react.useState)(categories);
	const [value, setValue] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		if (open) {
			setDraft(categories);
			setValue("");
			setError("");
		}
	}, [open, categories]);
	if (!open) return null;
	const add = () => {
		const v = value.trim();
		if (!v) return;
		if (draft.includes(v)) {
			setError("ประเภทงานนี้มีอยู่แล้ว");
			return;
		}
		const next = [...draft, v];
		setDraft(next);
		onSave(next);
		setValue("");
		setError("");
	};
	const rename = (index) => {
		const current = draft[index];
		const nextName = window.prompt("แก้ไขชื่อประเภทงาน:", current);
		if (!nextName?.trim()) return;
		const next = draft.map((c, i) => i === index ? nextName.trim() : c);
		setDraft(next);
		onSave(next);
	};
	const remove = (index) => {
		if (draft.length <= 1) {
			setError("ต้องมีประเภทงานอย่างน้อย 1 รายการ");
			return;
		}
		const next = draft.filter((_, i) => i !== index);
		setDraft(next);
		onSave(next);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-0 md:items-center md:p-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "surface-card w-full max-w-md p-5",
			role: "dialog",
			"aria-label": "จัดการประเภทงาน",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-4 flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-bold",
						children: "จัดการประเภทงาน"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: onClose,
						"aria-label": "ปิด",
						className: "rounded-md p-1 hover:bg-muted",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-3 flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value,
						onChange: (e) => setValue(e.target.value),
						onKeyDown: (e) => e.key === "Enter" && add(),
						placeholder: "เพิ่มประเภทงานใหม่",
						"aria-label": "ชื่อประเภทงานใหม่",
						className: "w-full rounded-lg border border-input bg-secondary p-2.5 text-sm"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: add,
						className: "flex items-center gap-1 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " เพิ่ม"]
					})]
				}),
				error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-2 text-xs text-destructive",
					children: error
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "max-h-64 space-y-2 overflow-y-auto",
					"data-testid": "category-list",
					children: draft.map((cat, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between rounded-lg border border-border bg-card p-2.5 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-medium",
							children: cat
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => rename(index),
								"aria-label": `แก้ไข ${cat}`,
								className: "rounded p-1.5 text-primary hover:bg-accent",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-4 w-4" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => remove(index),
								"aria-label": `ลบ ${cat}`,
								className: "rounded p-1.5 text-destructive hover:bg-destructive/10",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" })
							})]
						})]
					}, cat))
				})
			]
		})
	});
}
var EMPTY_GPS = {
	lat: null,
	lng: null,
	text: "ยังไม่ได้ดึงพิกัด",
	addressName: ""
};
async function reverseGeocode(lat, lng) {
	try {
		const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=th`);
		if (!res.ok) return "";
		const a = (await res.json()).address ?? {};
		return [
			a["building"] || a["amenity"] || a["road"] || "",
			a["subdistrict"] || a["suburb"] || a["village"] || "",
			a["district"] || a["city"] || a["town"] || "",
			a["state"] || ""
		].filter(Boolean).join(", ");
	} catch {
		return "";
	}
}
function CheckInPanel({ active, logs, categories, rates, onSaveCategories, onCheckIn, onCheckOut, onCancelActive, onEditActiveTime, onEditActiveTasks }) {
	const [workType, setWorkType] = (0, import_react.useState)(categories[0] ?? "");
	const [locationName, setLocationName] = (0, import_react.useState)("");
	const [gps, setGps] = (0, import_react.useState)(EMPTY_GPS);
	const [gpsLoading, setGpsLoading] = (0, import_react.useState)(false);
	const [photo, setPhoto] = (0, import_react.useState)(null);
	const [form, setForm] = (0, import_react.useState)(rates);
	const [elapsed, setElapsed] = (0, import_react.useState)(0);
	const [catOpen, setCatOpen] = (0, import_react.useState)(false);
	const [taskInput, setTaskInput] = (0, import_react.useState)("");
	const fileRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => setForm(rates), [rates]);
	(0, import_react.useEffect)(() => {
		if (!categories.includes(workType)) setWorkType(categories[0] ?? "");
	}, [categories, workType]);
	(0, import_react.useEffect)(() => {
		if (!active) return;
		const tick = () => setElapsed(Date.now() - new Date(active.checkInTime).getTime());
		tick();
		const id = setInterval(tick, 1e3);
		return () => clearInterval(id);
	}, [active]);
	const fetchGPS = (0, import_react.useCallback)(async () => {
		if (typeof navigator === "undefined" || !navigator.geolocation) {
			setGps({
				...EMPTY_GPS,
				text: "อุปกรณ์ไม่รองรับ GPS"
			});
			return;
		}
		if (typeof window !== "undefined" && !window.isSecureContext) {
			setGps({
				...EMPTY_GPS,
				text: "ต้องเปิดผ่าน https จึงจะขอพิกัดได้"
			});
			return;
		}
		setGpsLoading(true);
		navigator.geolocation.getCurrentPosition(async (pos) => {
			const lat = pos.coords.latitude.toFixed(6);
			const lng = pos.coords.longitude.toFixed(6);
			const addressName = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
			setGps({
				lat,
				lng,
				text: `Lat: ${lat}, Lng: ${lng}`,
				addressName
			});
			setGpsLoading(false);
		}, (err) => {
			const embedded = typeof window !== "undefined" && window.self !== window.top;
			let text = "ไม่สามารถเข้าถึงพิกัดได้";
			if (err.code === err.PERMISSION_DENIED) text = embedded ? "ถูกบล็อกในหน้าตัวอย่าง — เปิดเว็บในแท็บใหม่ของ Safari แล้วลองอีกครั้ง" : "ปฏิเสธสิทธิ์ — เปิด ตั้งค่า > Safari > ตำแหน่งที่ตั้ง เป็น “ถาม” แล้วโหลดหน้าใหม่";
			else if (err.code === err.POSITION_UNAVAILABLE) text = "หาสัญญาณตำแหน่งไม่ได้ — เปิด Location Services แล้วลองใหม่";
			else if (err.code === err.TIMEOUT) text = "หมดเวลาในการขอพิกัด — แตะไอคอนเป้าเพื่อลองอีกครั้ง";
			setGps({
				...EMPTY_GPS,
				text
			});
			setGpsLoading(false);
		}, {
			enableHighAccuracy: true,
			timeout: 2e4,
			maximumAge: 3e4
		});
	}, []);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		(async () => {
			try {
				const status = await navigator.permissions?.query({ name: "geolocation" });
				if (!cancelled && status?.state === "granted") fetchGPS();
				else if (!cancelled) setGps({
					...EMPTY_GPS,
					text: "แตะไอคอนเป้าเพื่อขอตำแหน่งปัจจุบัน"
				});
			} catch {
				if (!cancelled) setGps({
					...EMPTY_GPS,
					text: "แตะไอคอนเป้าเพื่อขอตำแหน่งปัจจุบัน"
				});
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [fetchGPS]);
	const quickLocations = Array.from(new Set(logs.map((l) => l.locationName).filter((l) => l && l !== "ไม่ได้ระบุสถานที่"))).slice(0, 6);
	const handleLocationChange = (value) => {
		setLocationName(value);
		const parsed = parseMapsUrl(value);
		if (parsed) setGps({
			lat: parsed.lat,
			lng: parsed.lng,
			text: `Lat: ${parsed.lat}, Lng: ${parsed.lng}`,
			addressName: "จากลิงก์ Google Maps"
		});
	};
	const onPhoto = (e) => {
		const file = e.target.files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = (ev) => setPhoto(String(ev.target?.result ?? ""));
		reader.readAsDataURL(file);
	};
	const resetPhoto = () => {
		setPhoto(null);
		if (fileRef.current) fileRef.current.value = "";
	};
	const num = (v) => v === "" ? 0 : Number(v);
	const tasks = active?.tasks ?? [];
	const setTasks = (next) => onEditActiveTasks(next);
	const addTask = () => {
		const value = taskInput.trim();
		if (!value || !active) return;
		setTasks([...tasks, value]);
		setTaskInput("");
	};
	const doCheckIn = () => {
		onCheckIn({
			workType,
			locationName: locationName.trim() || gps.addressName || "ไม่ได้ระบุสถานที่",
			gps,
			photo,
			rates: form,
			tasks: []
		});
		setTaskInput("");
		resetPhoto();
	};
	const doCheckOut = () => {
		onCheckOut(gps, photo);
		setTaskInput("");
		resetPhoto();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: `surface-card flex flex-col items-center justify-between gap-4 p-5 md:flex-row ${active ? "work-active-card" : ""}`,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex w-full items-center gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusMotion, { running: !!active }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-base font-bold md:text-lg",
							"data-testid": "status-title",
							children: active ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									"aria-hidden": true,
									className: "flex h-4 items-end gap-[2px]",
									"data-testid": "working-animation",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "work-bar block h-3 w-[3px] rounded-full bg-success [animation-delay:0ms]" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "work-bar block h-4 w-[3px] rounded-full bg-success [animation-delay:150ms]" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "work-bar block h-2.5 w-[3px] rounded-full bg-success [animation-delay:300ms]" })
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["กำลังทำงาน: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-success",
									children: active.workType
								})] })]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "sleep-breathe inline-block text-muted-foreground",
									children: "💤"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "กำลังพักผ่อน\\nยังไม่ได้ Check-in" })]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate text-xs text-muted-foreground md:text-sm",
							children: active ? `สถานที่: ${active.locationName} | Check-in เมื่อ ${new Date(active.checkInTime).toLocaleTimeString("th-TH", { hour12: false })}` : "พร้อมเริ่มงาน? กดปุ่ม Check-in ด้านล่างเพื่อบันทึกพิกัดและเวลา"
						})]
					})]
				}), active ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "w-full rounded-xl border border-border bg-info-soft px-4 py-2 text-center md:w-auto",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex items-center justify-center gap-2 text-xs font-medium text-primary",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "work-blink h-2 w-2 rounded-full bg-success",
							"aria-hidden": true
						}), "เวลาทำงาน (รวมพัก)"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xl font-bold text-primary tabular-nums",
						"data-testid": "active-timer",
						children: formatDuration(elapsed)
					})]
				}) : null]
			}),
			active ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "surface-card flex flex-wrap items-end gap-3 p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-[220px] flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						htmlFor: "editCheckInTime",
						className: "mb-1 block text-xs font-semibold text-muted-foreground",
						children: "แก้ไขเวลาเข้างาน"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						id: "editCheckInTime",
						type: "datetime-local",
						"data-testid": "edit-checkin-time",
						value: toLocalInput(active.checkInTime),
						onChange: (e) => {
							const iso = fromLocalInput(e.target.value);
							if (iso) onEditActiveTime(iso);
						},
						className: "w-full rounded-lg border border-input bg-secondary p-2.5 text-sm"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "ปรับเวลาให้ตรงกับเวลาเริ่มงานจริงได้ ตัวจับเวลาจะคำนวณใหม่ทันที"
				})]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "surface-card space-y-6 p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-1 gap-4 md:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-1 flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								htmlFor: "workType",
								className: "text-xs font-semibold text-muted-foreground",
								children: "ประเภทงาน / ชื่องาน"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => setCatOpen(true),
								className: "flex items-center gap-1 text-xs text-primary hover:underline",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings2, { className: "h-3.5 w-3.5" }), " จัดการประเภทงาน"]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							id: "workType",
							value: workType,
							disabled: !!active,
							onChange: (e) => setWorkType(e.target.value),
							className: "w-full rounded-lg border border-input bg-secondary p-2.5 text-sm disabled:opacity-60",
							children: categories.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: c,
								children: c
							}, c))
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-1 flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									htmlFor: "locationName",
									className: "text-xs font-semibold text-muted-foreground",
									children: "สถานที่ทำงาน / ไซต์งาน"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
									href: gps.lat && gps.lng ? `https://www.google.com/maps/search/?api=1&query=${gps.lat},${gps.lng}` : "https://www.google.com/maps",
									target: "_blank",
									rel: "noreferrer",
									className: "flex items-center gap-1 text-xs font-medium text-success hover:underline",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-3.5 w-3.5" }), " เปิด Google Maps"]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								id: "locationName",
								value: locationName,
								disabled: !!active,
								onChange: (e) => handleLocationChange(e.target.value),
								placeholder: "พิมพ์สถานที่ หรือ วางลิงก์ Google Maps",
								className: "w-full rounded-lg border border-input bg-secondary p-2.5 text-sm disabled:opacity-60"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-2 rounded-xl border border-border bg-secondary/60 p-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex min-w-0 items-center gap-1.5 text-xs font-semibold text-muted-foreground",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocateFixed, { className: "h-4 w-4 shrink-0 text-primary" }), " ตำแหน่งปัจจุบัน"]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											onClick: () => void fetchGPS(),
											disabled: gpsLoading,
											title: "ค้นหาตำแหน่งปัจจุบัน",
											"aria-label": "ค้นหาตำแหน่งปัจจุบัน",
											className: "flex shrink-0 items-center gap-1.5 rounded-lg bg-accent px-2.5 py-1.5 text-xs font-medium text-primary transition active:scale-95 disabled:opacity-60",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crosshair, { className: `h-4 w-4 ${gpsLoading ? "animate-spin" : ""}` }), gpsLoading ? "กำลังค้นหา…" : "ค้นหาตำแหน่ง"]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-1.5 font-mono text-sm font-semibold break-words text-primary",
										"data-testid": "gps-text",
										children: gps.text
									}),
									gps.addressName ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-xs text-muted-foreground",
										children: gps.addressName
									}) : null
								]
							}),
							quickLocations.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-2 flex flex-wrap items-center gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[10px] font-medium text-muted-foreground",
									children: "ใช้บ่อย:"
								}), quickLocations.map((loc) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => setLocationName(loc),
									className: "rounded border border-border bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground hover:bg-accent hover:text-primary",
									children: loc
								}, loc))]
							}) : null
						] })]
					}),
					active ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-3 rounded-xl border border-border bg-secondary/60 p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "text-xs font-bold tracking-wider text-muted-foreground uppercase",
									children: "งานที่ทำเสร็จในกะที่กำลังทำอยู่"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "rounded-full bg-info-soft px-2.5 py-0.5 text-xs font-bold text-primary",
									"data-testid": "task-count",
									children: [tasks.length, " งาน"]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: taskInput,
									"aria-label": "เพิ่มรายการงานที่ทำเสร็จ",
									"data-testid": "task-input",
									onChange: (e) => setTaskInput(e.target.value),
									onKeyDown: (e) => {
										if (e.key === "Enter") {
											e.preventDefault();
											addTask();
										}
									},
									placeholder: "เช่น ติดตั้งกล้อง 2 ตัว ชั้น 3",
									className: "flex-1 rounded-lg border border-input bg-card p-2 text-sm"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									onClick: addTask,
									"data-testid": "task-add",
									className: "flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListPlus, { className: "h-4 w-4" }), " เพิ่ม"]
								})]
							}),
							tasks.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: "ยังไม่มีรายการงาน — เพิ่มงานที่ทำเสร็จระหว่างกะนี้ได้เลย"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
								className: "space-y-1.5",
								"data-testid": "task-list",
								children: tasks.map((t, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "min-w-0 truncate",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "mr-2 text-xs font-bold text-muted-foreground",
											children: [i + 1, "."]
										}), t]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => setTasks(tasks.filter((_, idx) => idx !== i)),
										"aria-label": `ลบงาน ${t}`,
										className: "shrink-0 text-muted-foreground hover:text-destructive",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
									})]
								}, `${t}-${i}`))
							})
						]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-4 rounded-xl border border-border bg-secondary/60 p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "text-xs font-bold tracking-wider text-muted-foreground uppercase",
								children: "การคำนวณค่าแรง & OT & รายรับ-รายหัก"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-1 gap-3 md:grid-cols-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$1, {
										label: "ค่าแรงปกติ (บาท/วัน)",
										id: "dailyRate",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											id: "dailyRate",
											type: "number",
											value: form.dailyRate,
											disabled: !!active,
											onChange: (e) => setForm({
												...form,
												dailyRate: num(e.target.value)
											}),
											className: inputCls$1
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$1, {
										label: "ประเภท OT (ตัวคูณ)",
										id: "otType",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
											id: "otType",
											value: form.otType,
											disabled: !!active,
											onChange: (e) => setForm({
												...form,
												otType: Number(e.target.value)
											}),
											className: inputCls$1,
											children: OT_OPTIONS.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: o.value,
												children: o.label
											}, o.value))
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$1, {
										label: "การหักพักกลางวัน",
										id: "breakInfo",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "flex h-[38px] items-center rounded-lg border border-border bg-info-soft px-2 text-xs font-medium text-primary",
											children: "หักเวลาพัก 1 ชม. อัตโนมัติ"
										})
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-3 border-t border-border pt-3 md:grid-cols-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$1, {
										label: "ค่าเดินทาง (บาท)",
										id: "travelCost",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											id: "travelCost",
											type: "number",
											value: form.travelCost,
											disabled: !!active,
											onChange: (e) => setForm({
												...form,
												travelCost: num(e.target.value)
											}),
											className: inputCls$1
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$1, {
										label: "ค่าอาหาร/เบี้ยเลี้ยง (บาท)",
										id: "foodCost",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											id: "foodCost",
											type: "number",
											value: form.foodCost,
											disabled: !!active,
											onChange: (e) => setForm({
												...form,
												foodCost: num(e.target.value)
											}),
											className: inputCls$1
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$1, {
										label: "รายรับอื่นๆ (บาท)",
										id: "otherIncome",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											id: "otherIncome",
											type: "number",
											value: form.otherIncome,
											disabled: !!active,
											onChange: (e) => setForm({
												...form,
												otherIncome: num(e.target.value)
											}),
											className: `${inputCls$1} text-success`
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$1, {
										label: "รายการหักอื่นๆ (บาท)",
										id: "otherDeductions",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											id: "otherDeductions",
											type: "number",
											value: form.otherDeductions,
											disabled: !!active,
											onChange: (e) => setForm({
												...form,
												otherDeductions: num(e.target.value)
											}),
											className: `${inputCls$1} text-destructive`
										})
									})
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-1 gap-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-xl border-2 border-dashed border-border p-4 text-center",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								ref: fileRef,
								id: "imageInput",
								type: "file",
								accept: "image/*",
								capture: "environment",
								className: "hidden",
								onChange: onPhoto
							}), photo ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col items-center",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: photo,
									alt: "รูปหลักฐาน",
									className: "mb-2 h-32 rounded-lg object-cover"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									onClick: resetPhoto,
									className: "flex items-center gap-1 text-xs text-destructive",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-3.5 w-3.5" }), " ลบรูป"]
								})]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => fileRef.current?.click(),
								className: "flex w-full flex-col items-center gap-2 py-4 text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, { className: "h-7 w-7" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs font-medium",
									children: "ถ่ายรูป / แนบรูปหลักฐาน (ไม่บังคับ)"
								})]
							})]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-1 gap-3 md:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: doCheckIn,
							disabled: !!active,
							className: "flex items-center justify-center gap-2 rounded-xl bg-success py-4 text-lg font-bold text-success-foreground shadow-lg transition active:scale-95 disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogIn, { className: "h-5 w-5" }), " Check-in เริ่มงาน"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: doCheckOut,
							disabled: !active,
							className: "flex items-center justify-center gap-2 rounded-xl bg-destructive py-4 text-lg font-bold text-destructive-foreground shadow-lg transition active:scale-95 disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "h-5 w-5" }), " Check-out จบงาน"]
						})]
					}),
					active ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: onCancelActive,
						className: "w-full text-xs text-muted-foreground hover:text-destructive hover:underline",
						children: "ยกเลิกการ Check-in นี้ (ไม่บันทึก)"
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategoryDialog, {
				open: catOpen,
				categories,
				onSave: onSaveCategories,
				onClose: () => setCatOpen(false)
			})
		]
	});
}
/**
* Visual "engine running" vs "resting" indicator next to the shift status.
* Running: spinning gear + pumping piston. Idle: breathing sleeper with Z's.
*/
function StatusMotion({ running }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		"aria-hidden": true,
		"data-testid": running ? "engine-animation" : "resting-animation",
		className: `relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${running ? "work-pulse-ring bg-success-soft text-success" : "rest-halo bg-muted text-muted-foreground"}`,
		children: running ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cog, { className: "engine-spin h-6 w-6" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "engine-piston absolute right-1 bottom-1 h-2.5 w-[3px] rounded-full bg-success" })] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BedDouble, { className: "sleep-breathe h-7 w-7" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "sleep-z absolute -top-1 right-0 text-xs font-black [animation-delay:0ms]",
				children: "z"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "sleep-z absolute -top-1 right-1 text-[11px] font-black [animation-delay:900ms]",
				children: "z"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "sleep-z absolute -top-1 right-2 text-[9px] font-black [animation-delay:1800ms]",
				children: "z"
			})
		] })
	});
}
var inputCls$1 = "w-full rounded-lg border border-input bg-card p-2 text-sm font-medium disabled:opacity-60";
function Field$1({ label, id, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
		htmlFor: id,
		className: "mb-1 block text-xs text-muted-foreground",
		children: label
	}), children] });
}
var axisTick = {
	fill: "var(--muted-foreground)",
	fontSize: 11
};
var tooltipStyle = {
	backgroundColor: "var(--popover)",
	border: "1px solid var(--border)",
	borderRadius: "0.75rem",
	color: "var(--popover-foreground)",
	fontSize: "12px"
};
var tooltipCursor = { fill: "color-mix(in oklab, var(--muted-foreground) 12%, transparent)" };
var PIE_COLORS = [
	"var(--chart-1)",
	"var(--chart-2)",
	"var(--chart-3)",
	"var(--chart-4)",
	"var(--chart-5)"
];
function DashboardPanel({ logs, month, onMonthChange, spreadsheetId, syncing, onRefresh }) {
	const s = summarizeMonth(logs, month);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "surface-card flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-bold",
					children: "สรุปรายเดือน"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: spreadsheetId ? syncing ? "กำลังดึงข้อมูลจาก Google Sheets…" : "ข้อมูลดึงจาก Google Sheets" : "ยังไม่ได้เชื่อมต่อ Google Sheets — แสดงข้อมูลในเครื่อง"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [spreadsheetId ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: onRefresh,
						disabled: syncing,
						"data-testid": "dashboard-refresh",
						className: "flex items-center gap-1.5 rounded-lg border border-input bg-secondary px-3 py-2 text-xs font-medium transition hover:bg-accent disabled:opacity-60",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: `h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}` }), "รีเฟรชจากชีต"]
					}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "month",
						"aria-label": "เลือกเดือน",
						value: month,
						onChange: (e) => onMonthChange(e.target.value),
						className: "rounded-lg border border-input bg-secondary p-2 text-sm font-medium"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-3 md:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Coins, { className: "h-4 w-4" }),
						label: "รายได้สุทธิรวม",
						value: formatTHB(s.totalNet),
						testId: "stat-net",
						tone: "success"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarCheck, { className: "h-4 w-4" }),
						label: "วันทำงานทั้งหมด",
						value: `${s.workDays} วัน (${s.daysWithOt} มี OT / ${s.daysWithoutOt} ไม่มี OT)`,
						testId: "stat-days"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListChecks, { className: "h-4 w-4" }),
						label: "งานที่ทำเสร็จ",
						value: `${s.totalTasks} งาน`,
						testId: "stat-tasks"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListChecks, { className: "h-4 w-4" }),
						label: "เฉลี่ยต่อวัน",
						value: `${s.avgTasksPerDay} งาน/วัน`,
						testId: "stat-tasks-avg"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-4 w-4" }),
						label: "ชั่วโมงรวม",
						value: `${s.totalHours.toFixed(1)} ชม.`,
						testId: "stat-hours"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "h-4 w-4" }),
						label: `OT ${s.totalOtHours.toFixed(1)} ชม.`,
						value: formatTHB(s.totalOtIncome),
						testId: "stat-ot"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Coins, { className: "h-4 w-4" }),
						label: "เบี้ยเลี้ยง/รายรับอื่น",
						value: formatTHB(s.totalAllowances),
						testId: "stat-allowance"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleMinus, { className: "h-4 w-4" }),
						label: "รายการหักรวม",
						value: formatTHB(s.totalDeductions),
						testId: "stat-deduction",
						tone: "destructive"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "surface-card p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "mb-3 text-sm font-bold",
					children: "รายได้รายวัน"
				}), s.dailyIncome.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-56",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
						width: "100%",
						height: "100%",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
							data: s.dailyIncome,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
									dataKey: "label",
									tick: axisTick,
									tickLine: false,
									axisLine: false
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
									tick: axisTick,
									tickLine: false,
									axisLine: false,
									width: 44
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
									contentStyle: tooltipStyle,
									cursor: tooltipCursor,
									formatter: (v) => formatTHB(v)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
									dataKey: "value",
									fill: "var(--chart-1)",
									radius: [
										6,
										6,
										0,
										0
									]
								})
							]
						})
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "surface-card p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "mb-3 text-sm font-bold",
					children: "จำนวนงานที่ทำเสร็จรายวัน"
				}), s.dailyTasks.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-56",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
						width: "100%",
						height: "100%",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
							data: s.dailyTasks,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
									dataKey: "label",
									tick: axisTick,
									tickLine: false,
									axisLine: false
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
									tick: axisTick,
									tickLine: false,
									axisLine: false,
									width: 30,
									allowDecimals: false
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
									contentStyle: tooltipStyle,
									cursor: tooltipCursor,
									formatter: (v) => `${v} งาน`
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
									dataKey: "value",
									fill: "var(--chart-3)",
									radius: [
										6,
										6,
										0,
										0
									]
								})
							]
						})
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 gap-4 md:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "surface-card p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "mb-3 text-sm font-bold",
						children: "สัดส่วนรายได้ตามประเภทงาน"
					}), s.byWorkType.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-56",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
							width: "100%",
							height: "100%",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PieChart, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pie, {
								data: s.byWorkType,
								dataKey: "value",
								nameKey: "name",
								outerRadius: 80,
								stroke: "var(--card)",
								label: {
									fill: "var(--foreground)",
									fontSize: 11
								},
								children: s.byWorkType.map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, { fill: PIE_COLORS[i % PIE_COLORS.length] }, i))
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
								contentStyle: tooltipStyle,
								cursor: tooltipCursor,
								formatter: (v) => formatTHB(v)
							})] })
						})
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "surface-card p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "mb-3 text-sm font-bold",
						children: "สถานที่ทำงานบ่อยที่สุด (ครั้ง)"
					}), s.byLocation.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-56",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
							width: "100%",
							height: "100%",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
								data: s.byLocation,
								layout: "vertical",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
										type: "number",
										tick: axisTick,
										allowDecimals: false
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
										type: "category",
										dataKey: "name",
										width: 90,
										tick: axisTick
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
										contentStyle: tooltipStyle,
										cursor: tooltipCursor
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
										dataKey: "value",
										fill: "var(--chart-2)",
										radius: [
											0,
											6,
											6,
											0
										]
									})
								]
							})
						})
					})]
				})]
			})
		]
	});
}
function Empty() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "py-10 text-center text-xs text-muted-foreground",
		children: "ไม่มีข้อมูลในเดือนที่เลือก"
	});
}
function Stat({ icon, label, value, testId, tone }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "surface-card p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-1.5 text-xs text-muted-foreground",
			children: [icon, label]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: `mt-1 text-lg font-bold ${tone === "success" ? "text-success" : tone === "destructive" ? "text-destructive" : "text-foreground"}`,
			"data-testid": testId,
			children: value
		})]
	});
}
var emptyDraft = {
	inAt: "",
	outAt: "",
	workType: "",
	locationName: "",
	dailyRate: "0",
	otType: "1.5",
	travelCost: "0",
	foodCost: "0",
	otherIncome: "0",
	otherDeductions: "0",
	gpsIn: "",
	gpsOut: "",
	tasks: ""
};
var toNum = (v) => {
	const n = Number(String(v).replace(/[^\d.-]/g, ""));
	return Number.isFinite(n) ? n : 0;
};
var TH_MONTHS = [
	"มกราคม",
	"กุมภาพันธ์",
	"มีนาคม",
	"เมษายน",
	"พฤษภาคม",
	"มิถุนายน",
	"กรกฎาคม",
	"สิงหาคม",
	"กันยายน",
	"ตุลาคม",
	"พฤศจิกายน",
	"ธันวาคม"
];
/** "2026-08" -> "สิงหาคม 2026" */
var monthLabel = (key) => {
	const [y, m] = key.split("-");
	return `${TH_MONTHS[Number(m) - 1] ?? m} ${y}`;
};
var datePart = (v) => v.split("T")[0] ?? "";
var timePart = (v) => v.split("T")[1] ?? "";
var joinDT = (date, time) => date && time ? `${date}T${time}` : "";
function HistoryPanel({ logs, syncing, pendingCount, categories, onDelete, onSync, onPull, onUpdate }) {
	const [editing, setEditing] = (0, import_react.useState)(null);
	const [month, setMonth] = (0, import_react.useState)("all");
	const [draft, setDraft] = (0, import_react.useState)(emptyDraft);
	const startEdit = (log) => {
		setEditing(log.id);
		setDraft({
			inAt: toLocalInput(log.checkInTime),
			outAt: toLocalInput(log.checkOutTime),
			workType: log.workType ?? "",
			locationName: log.locationName ?? "",
			dailyRate: String(log.dailyRate ?? 0),
			otType: String(log.otType ?? 1.5),
			travelCost: String(log.travelCost ?? 0),
			foodCost: String(log.foodCost ?? 0),
			otherIncome: String(log.otherIncome ?? 0),
			otherDeductions: String(log.otherDeductions ?? 0),
			gpsIn: gpsText(log.checkInGPS) === "-" ? "" : gpsText(log.checkInGPS),
			gpsOut: gpsText(log.checkOutGPS) === "-" ? "" : gpsText(log.checkOutGPS),
			tasks: (log.tasks ?? []).join("\n")
		});
	};
	const saveEdit = (id) => {
		const inISO = fromLocalInput(draft.inAt);
		const outISO = fromLocalInput(draft.outAt);
		if (!inISO || !outISO) return;
		onUpdate(id, {
			checkInTime: inISO,
			checkOutTime: outISO,
			workType: draft.workType.trim(),
			locationName: draft.locationName.trim(),
			dailyRate: toNum(draft.dailyRate),
			otType: draft.otType !== "" && draft.otType !== void 0 ? toNum(draft.otType) : 0,
			travelCost: toNum(draft.travelCost),
			foodCost: toNum(draft.foodCost),
			otherIncome: toNum(draft.otherIncome),
			otherDeductions: toNum(draft.otherDeductions),
			checkInGPS: gpsFromText(draft.gpsIn),
			checkOutGPS: gpsFromText(draft.gpsOut),
			tasks: draft.tasks.split("\n").map((t) => t.trim()).filter(Boolean)
		});
		setEditing(null);
	};
	/** Month keys (YYYY-MM) present in the history, newest first. */
	const months = (0, import_react.useMemo)(() => {
		const set = /* @__PURE__ */ new Set();
		for (const l of logs) {
			const key = String(l.checkInTime ?? "").slice(0, 7);
			if (key) set.add(key);
		}
		return [...set].sort().reverse();
	}, [logs]);
	const visibleLogs = (0, import_react.useMemo)(() => month === "all" ? logs : logs.filter((l) => String(l.checkInTime ?? "").startsWith(month)), [logs, month]);
	const exportCSV = () => {
		const blob = new Blob(["﻿" + buildCSV(visibleLogs)], { type: "text/csv;charset=utf-8;" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `work-logs-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv`;
		a.click();
		URL.revokeObjectURL(url);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "surface-card flex flex-wrap items-center justify-between gap-3 p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-bold",
					children: "ประวัติการทำงาน"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-muted-foreground",
					children: [
						"แสดง ",
						visibleLogs.length,
						" จาก ",
						logs.length,
						" รายการ · รอซิงก์ ",
						pendingCount,
						" รายการ · ชีตจะถูกเขียนใหม่ให้ตรงกับรายการนี้เสมอ"
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							"aria-label": "เลือกเดือน",
							value: month,
							onChange: (e) => setMonth(e.target.value),
							className: "rounded-lg border border-input bg-secondary px-3 py-2 text-xs font-medium",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
								value: "all",
								children: [
									"ทุกเดือน · ",
									logs.length,
									" รายการ"
								]
							}), months.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
								value: m,
								children: [
									monthLabel(m),
									" ·",
									" ",
									logs.filter((l) => String(l.checkInTime ?? "").startsWith(m)).length,
									" รายการ"
								]
							}, m))]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: onSync,
							disabled: syncing,
							className: "flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground disabled:bg-muted disabled:text-muted-foreground",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CloudUpload, { className: "h-4 w-4" }),
								" ",
								syncing ? "กำลังซิงก์…" : "ส่งขึ้นชีต"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: onPull,
							disabled: syncing,
							className: "flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium disabled:opacity-50",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CloudDownload, { className: "h-4 w-4" }), " ดึงจากชีต"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: exportCSV,
							disabled: logs.length === 0,
							className: "flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium disabled:opacity-50",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-4 w-4" }), " CSV"]
						})
					]
				})]
			}),
			visibleLogs.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "surface-card p-10 text-center text-sm text-muted-foreground",
				children: logs.length === 0 ? "ยังไม่มีประวัติการทำงาน" : "ไม่มีรายการในเดือนที่เลือก"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-3",
				"data-testid": "logs-container",
				children: visibleLogs.map((log) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "surface-card overflow-hidden p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap items-center gap-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
												className: "font-semibold",
												children: log.workType
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "rounded-full bg-info-soft px-2 py-0.5 text-[10px] font-bold text-primary",
												children: [taskCount(log), " งาน"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: `rounded-full px-2 py-0.5 text-[10px] font-medium ${log.syncedAt ? "bg-success-soft text-success" : "bg-muted text-muted-foreground"}`,
												children: log.syncedAt ? "ซิงก์แล้ว" : "รอซิงก์"
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-3.5 w-3.5" }),
											" ",
											log.locationName
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-1 text-xs text-muted-foreground",
										children: [
											formatThaiDateTime(log.checkInTime),
											" → ",
											formatThaiDateTime(log.checkOutTime)
										]
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-right",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-lg font-bold text-success",
									children: formatTHB(log.netIncome)
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-1 flex items-center justify-end gap-3",
									children: editing === log.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										onClick: () => saveEdit(log.id),
										className: "inline-flex items-center gap-1 text-xs text-success hover:underline",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-3.5 w-3.5" }), " บันทึก"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										onClick: () => setEditing(null),
										className: "inline-flex items-center gap-1 text-xs text-muted-foreground hover:underline",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-3.5 w-3.5" }), " ยกเลิก"]
									})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										onClick: () => startEdit(log),
										"aria-label": `แก้ไขเวลา ${log.id}`,
										className: "inline-flex items-center gap-1 text-xs text-primary hover:underline",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-3.5 w-3.5" }), " แก้ไข"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										onClick: () => onDelete(log.id),
										"aria-label": `ลบรายการ ${log.id}`,
										className: "inline-flex items-center gap-1 text-xs text-destructive hover:underline",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" }), " ลบ"]
									})] })
								})]
							})]
						}),
						editing === log.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 space-y-4 rounded-xl border border-border bg-secondary/40 p-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
										className: "text-xs font-bold text-primary",
										children: "เวลาเข้างาน"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid grid-cols-2 gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "วันที่เข้างาน",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "date",
												"aria-label": "วันที่เข้างาน",
												value: datePart(draft.inAt),
												onChange: (e) => setDraft({
													...draft,
													inAt: joinDT(e.target.value, timePart(draft.inAt))
												}),
												className: inputCls
											})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "เวลาเข้างาน",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "time",
												"aria-label": "เวลาเข้างาน",
												value: timePart(draft.inAt),
												onChange: (e) => setDraft({
													...draft,
													inAt: joinDT(datePart(draft.inAt), e.target.value)
												}),
												className: inputCls
											})
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
										className: "text-xs font-bold text-primary",
										children: "เวลาออกงาน"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid grid-cols-2 gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "วันที่ออกงาน",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "date",
												"aria-label": "วันที่ออกงาน",
												value: datePart(draft.outAt),
												onChange: (e) => setDraft({
													...draft,
													outAt: joinDT(e.target.value, timePart(draft.outAt))
												}),
												className: inputCls
											})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "เวลาออกงาน",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "time",
												"aria-label": "เวลาออกงาน",
												value: timePart(draft.outAt),
												onChange: (e) => setDraft({
													...draft,
													outAt: joinDT(datePart(draft.outAt), e.target.value)
												}),
												className: inputCls
											})
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
									className: "space-y-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
											className: "text-xs font-bold text-primary",
											children: "งานและสถานที่"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "ประเภทงาน",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
												"aria-label": "ประเภทงาน",
												value: draft.workType,
												onChange: (e) => setDraft({
													...draft,
													workType: e.target.value
												}),
												className: inputCls,
												children: (categories.includes(draft.workType) || !draft.workType ? categories : [draft.workType, ...categories]).map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: c,
													children: c
												}, c))
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "สถานที่",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												"aria-label": "สถานที่",
												value: draft.locationName,
												onChange: (e) => setDraft({
													...draft,
													locationName: e.target.value
												}),
												className: inputCls
											})
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
										className: "text-xs font-bold text-primary",
										children: "ค่าแรงและเบี้ยเลี้ยง"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid grid-cols-2 gap-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "ค่าแรง/วัน (บาท)",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													type: "number",
													inputMode: "decimal",
													"aria-label": "ค่าแรงต่อวัน",
													value: draft.dailyRate,
													onChange: (e) => setDraft({
														...draft,
														dailyRate: e.target.value
													}),
													className: inputCls
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "ตัวคูณ OT",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
													"aria-label": "ตัวคูณ OT",
													value: draft.otType,
													onChange: (e) => setDraft({
														...draft,
														otType: e.target.value
													}),
													className: inputCls,
													children: OT_OPTIONS.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: o.value,
														children: o.label
													}, o.value))
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "ค่าเดินทาง",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													type: "number",
													inputMode: "decimal",
													"aria-label": "ค่าเดินทาง",
													value: draft.travelCost,
													onChange: (e) => setDraft({
														...draft,
														travelCost: e.target.value
													}),
													className: inputCls
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "ค่าอาหาร",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													type: "number",
													inputMode: "decimal",
													"aria-label": "ค่าอาหาร",
													value: draft.foodCost,
													onChange: (e) => setDraft({
														...draft,
														foodCost: e.target.value
													}),
													className: inputCls
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "รายรับอื่น",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													type: "number",
													inputMode: "decimal",
													"aria-label": "รายรับอื่น",
													value: draft.otherIncome,
													onChange: (e) => setDraft({
														...draft,
														otherIncome: e.target.value
													}),
													className: inputCls
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "รายการหัก",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													type: "number",
													inputMode: "decimal",
													"aria-label": "รายการหัก",
													value: draft.otherDeductions,
													onChange: (e) => setDraft({
														...draft,
														otherDeductions: e.target.value
													}),
													className: inputCls
												})
											})
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
										className: "text-xs font-bold text-primary",
										children: "พิกัด"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid grid-cols-2 gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "พิกัดเข้า (lat, lng)",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												"aria-label": "พิกัดเข้า",
												value: draft.gpsIn,
												placeholder: "13.7563, 100.5018",
												onChange: (e) => setDraft({
													...draft,
													gpsIn: e.target.value
												}),
												className: inputCls
											})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "พิกัดออก (lat, lng)",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												"aria-label": "พิกัดออก",
												value: draft.gpsOut,
												placeholder: "13.7563, 100.5018",
												onChange: (e) => setDraft({
													...draft,
													gpsOut: e.target.value
												}),
												className: inputCls
											})
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
										className: "text-xs font-bold text-primary",
										children: "รายการงานที่ทำเสร็จ"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "บรรทัดละ 1 งาน",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
											"aria-label": "รายการงานที่ทำเสร็จ",
											value: draft.tasks,
											rows: 3,
											onChange: (e) => setDraft({
												...draft,
												tasks: e.target.value
											}),
											placeholder: "รายการงาน บรรทัดละ 1 งาน",
											className: inputCls
										})
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex gap-2 pt-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => saveEdit(log.id),
										className: "flex-1 rounded-lg bg-primary py-2 text-xs font-medium text-primary-foreground",
										children: "บันทึกการแก้ไข"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => setEditing(null),
										className: "flex-1 rounded-lg border border-border py-2 text-xs font-medium",
										children: "ยกเลิก"
									})]
								})
							]
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
							className: "mt-3 grid grid-cols-2 gap-2 border-t border-border pt-3 text-xs md:grid-cols-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell$1, {
									label: "ชั่วโมงปกติ",
									value: `${log.workingHours} ชม.`
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell$1, {
									label: `OT x${log.otType}`,
									value: `${log.otHours} ชม.`
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell$1, {
									label: "ค่าแรง+OT",
									value: formatTHB(log.baseWage + log.otIncome)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell$1, {
									label: "เบี้ยเลี้ยง/หัก",
									value: `${formatTHB(log.travelCost + log.foodCost + log.otherIncome)} / ${formatTHB(log.otherDeductions)}`
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell$1, {
									label: "พิกัดเข้า",
									value: gpsText(log.checkInGPS)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell$1, {
									label: "พิกัดออก",
									value: gpsText(log.checkOutGPS)
								})
							]
						}),
						(log.tasks ?? []).length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
							className: "mt-3 list-decimal space-y-0.5 border-t border-border pt-3 pl-5 text-xs text-muted-foreground",
							children: (log.tasks ?? []).map((t, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: t }, `${t}-${i}`))
						}) : null,
						log.checkInPhoto || log.checkOutPhoto ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 flex gap-2",
							children: [log.checkInPhoto ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: log.checkInPhoto,
								alt: "หลักฐาน Check-in",
								className: "h-16 w-16 rounded-lg object-cover"
							}) : null, log.checkOutPhoto ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: log.checkOutPhoto,
								alt: "หลักฐาน Check-out",
								className: "h-16 w-16 rounded-lg object-cover"
							}) : null]
						}) : null
					]
				}, log.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("datalist", {
				id: "history-work-types",
				children: categories.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: c }, c))
			})
		]
	});
}
function Cell$1({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
		className: "text-[10px] text-muted-foreground",
		children: label
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
		className: "font-medium",
		children: value
	})] });
}
var inputCls = "w-full rounded-lg border border-input bg-secondary p-1.5 text-xs";
function Field({ label, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "block",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "mb-0.5 block text-[10px] text-muted-foreground",
			children: label
		}), children]
	});
}
var DEFAULT_COLORS_LIGHT = {
	themeMode: "light",
	backgroundColor: "#f8fafc",
	cardColor: "#ffffff",
	foregroundColor: "#1e293b",
	borderColor: "#e2e8f0",
	primaryColor: "#3b82f6",
	secondaryColor: "#f1f5f9",
	accentColor: "#e0e7ff",
	successColor: "#10b981",
	warningColor: "#f59e0b",
	destructiveColor: "#ef4444",
	chartColors: [
		"#3b82f6",
		"#10b981",
		"#f59e0b",
		"#ef4444",
		"#8b5cf6"
	]
};
var DEFAULT_COLORS_DARK = {
	themeMode: "dark",
	backgroundColor: "#0f172a",
	cardColor: "#1e293b",
	foregroundColor: "#f8fafc",
	borderColor: "#334155",
	primaryColor: "#60a5fa",
	secondaryColor: "#334155",
	accentColor: "#1e1b4b",
	successColor: "#34d399",
	warningColor: "#fbbf24",
	destructiveColor: "#f87171",
	chartColors: [
		"#60a5fa",
		"#34d399",
		"#fbbf24",
		"#f87171",
		"#a78bfa"
	]
};
function applyTheme(colors) {
	if (typeof window === "undefined") return;
	const root = document.documentElement;
	const mode = colors.themeMode ?? "system";
	let isDark = false;
	if (mode === "dark") isDark = true;
	else if (mode === "system") isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
	if (isDark) root.classList.add("dark");
	else root.classList.remove("dark");
	const defaults = isDark ? DEFAULT_COLORS_DARK : DEFAULT_COLORS_LIGHT;
	const bg = colors.backgroundColor || defaults.backgroundColor;
	const card = colors.cardColor || defaults.cardColor;
	const fg = colors.foregroundColor || defaults.foregroundColor;
	const border = colors.borderColor || defaults.borderColor;
	const primary = colors.primaryColor || defaults.primaryColor;
	const secondary = colors.secondaryColor || defaults.secondaryColor;
	const accent = colors.accentColor || defaults.accentColor;
	const success = colors.successColor || defaults.successColor;
	const warning = colors.warningColor || defaults.warningColor;
	const destructive = colors.destructiveColor || defaults.destructiveColor;
	const charts = colors.chartColors?.length ? colors.chartColors : defaults.chartColors;
	root.style.setProperty("--background", bg);
	root.style.setProperty("--card", card);
	root.style.setProperty("--foreground", fg);
	root.style.setProperty("--border", border);
	root.style.setProperty("--primary", primary);
	root.style.setProperty("--secondary", secondary);
	root.style.setProperty("--accent", accent);
	root.style.setProperty("--success", success);
	root.style.setProperty("--warning", warning);
	root.style.setProperty("--destructive", destructive);
	charts.forEach((c, i) => {
		root.style.setProperty(`--chart-${i + 1}`, c);
	});
}
function SettingsPanel({ workTypes, otTypes, rates, themeSettings, spreadsheetId, logs, onAddWorkType, onEditWorkType, onToggleWorkType, onSoftDeleteWorkType, onSaveRates, onSaveThemeSettings, onResetThemeSettings, onSetSpreadsheetId, onSyncAirtableAll, airtableSyncing }) {
	const [activeTab, setActiveTab] = (0, import_react.useState)("worktypes");
	const [newWorkType, setNewWorkType] = (0, import_react.useState)("");
	const [editingWtId, setEditingWtId] = (0, import_react.useState)(null);
	const [editingWtName, setEditingWtName] = (0, import_react.useState)("");
	const [rateForm, setRateForm] = (0, import_react.useState)(rates);
	const [sheetIdInput, setSheetIdInput] = (0, import_react.useState)(spreadsheetId);
	const [draftColors, setDraftColors] = (0, import_react.useState)(themeSettings);
	const handleWorkTypeAdd = async () => {
		if (!newWorkType.trim()) return;
		try {
			await onAddWorkType(newWorkType.trim());
			setNewWorkType("");
			toast.success("เพิ่มประเภทงานลง Supabase สำเร็จ");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "เพิ่มประเภทงานไม่สำเร็จ");
		}
	};
	const handleWorkTypeEditSave = async (id) => {
		if (!editingWtName.trim()) return;
		try {
			await onEditWorkType(id, editingWtName.trim());
			setEditingWtId(null);
			toast.success("แก้ไขชื่อประเภทงานสำเร็จ");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "แก้ไขไม่สำเร็จ");
		}
	};
	const handleThemeSave = async () => {
		try {
			await onSaveThemeSettings(draftColors);
			toast.success("บันทึกธีมและการตั้งค่าสีลง Supabase เรียบร้อยแล้ว");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "บันทึกธีมไม่สำเร็จ");
		}
	};
	const handleRatesSave = async () => {
		try {
			await onSaveRates(rateForm);
			onSetSpreadsheetId(sheetIdInput);
			toast.success("บันทึกการตั้งค่าค่าแรงพื้นฐานแล้ว");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "บันทึกไม่สำเร็จ");
		}
	};
	const handleResetColors = async () => {
		const defaults = draftColors.themeMode === "dark" ? DEFAULT_COLORS_DARK : DEFAULT_COLORS_LIGHT;
		setDraftColors(defaults);
		await onResetThemeSettings();
		toast.info("รีเซ็ตสีของระบบเป็นค่าเริ่มต้นแล้ว");
	};
	logs.filter((l) => !l.syncedAt).length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "surface-card flex flex-wrap items-center justify-between gap-3 p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
					className: "flex items-center gap-2 text-lg font-bold",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings2, { className: "h-5 w-5 text-primary" }), " ตั้งค่าระบบ (Settings)"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "จัดการข้อมูลประเภทงาน, OT, สีของธีม และการเชื่อมต่อ Supabase / Airtable ในที่เดียว"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex items-center gap-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => void handleThemeSave(),
						className: "flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow transition active:scale-95",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "h-4 w-4" }), " บันทึกการตั้งค่าทั้งหมด"]
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "surface-card flex overflow-x-auto rounded-2xl p-1 text-xs font-medium scrollbar-none",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setActiveTab("worktypes"),
						className: `flex items-center gap-2 shrink-0 rounded-xl px-4 py-2.5 transition ${activeTab === "worktypes" ? "bg-primary text-primary-foreground font-bold shadow" : "text-muted-foreground hover:bg-accent"}`,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Briefcase, { className: "h-4 w-4" }),
							" ประเภทงาน (",
							workTypes.filter((w) => w.is_active).length,
							")"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setActiveTab("ot"),
						className: `flex items-center gap-2 shrink-0 rounded-xl px-4 py-2.5 transition ${activeTab === "ot" ? "bg-primary text-primary-foreground font-bold shadow" : "text-muted-foreground hover:bg-accent"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-4 w-4" }), " ประเภท OT"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setActiveTab("theme"),
						className: `flex items-center gap-2 shrink-0 rounded-xl px-4 py-2.5 transition ${activeTab === "theme" ? "bg-primary text-primary-foreground font-bold shadow" : "text-muted-foreground hover:bg-accent"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Palette, { className: "h-4 w-4" }), " ธีม & สีกราฟ"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setActiveTab("general"),
						className: `flex items-center gap-2 shrink-0 rounded-xl px-4 py-2.5 transition ${activeTab === "general" ? "bg-primary text-primary-foreground font-bold shadow" : "text-muted-foreground hover:bg-accent"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings2, { className: "h-4 w-4" }), " ค่าแรงพื้นฐาน"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setActiveTab("integrations"),
						className: `flex items-center gap-2 shrink-0 rounded-xl px-4 py-2.5 transition ${activeTab === "integrations" ? "bg-primary text-primary-foreground font-bold shadow" : "text-muted-foreground hover:bg-accent"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Database, { className: "h-4 w-4" }), " Supabase & Airtable"]
					})
				]
			}),
			activeTab === "worktypes" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "surface-card space-y-4 p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-bold text-base",
							children: "การจัดการประเภทงาน (Work Types)"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "ข้อมูลประเภทงานถูกบันทึกลง Supabase เสมอ Refresh หรือเปลี่ยน Browser ข้อมูลไม่หาย (มี ID ถาวร, Soft Delete ไม่ทำลายประวัติเก่า)"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: newWorkType,
							onChange: (e) => setNewWorkType(e.target.value),
							onKeyDown: (e) => e.key === "Enter" && void handleWorkTypeAdd(),
							placeholder: "เพิ่มประเภทงานใหม่ เช่น งานติดตั้งสายสัญญาณ",
							"aria-label": "เพิ่มประเภทงานใหม่",
							className: "flex-1 rounded-xl border border-input bg-secondary p-2.5 text-sm"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => void handleWorkTypeAdd(),
							className: "flex items-center gap-1 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground active:scale-95",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " เพิ่ม"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "divide-y divide-border rounded-xl border border-border bg-card",
						children: workTypes.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "p-6 text-center text-xs text-muted-foreground",
							children: "ยังไม่มีประเภทงานในระบบ"
						}) : workTypes.map((wt) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between p-3 text-sm",
							children: [editingWtId === wt.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-1 items-center gap-2 pr-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: editingWtName,
									onChange: (e) => setEditingWtName(e.target.value),
									className: "w-full rounded-lg border border-input bg-secondary p-1.5 text-sm"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => void handleWorkTypeEditSave(wt.id),
									className: "rounded-lg bg-success px-2.5 py-1 text-xs font-semibold text-success-foreground",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" })
								})]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: `font-medium ${!wt.is_active ? "line-through text-muted-foreground" : ""}`,
									children: wt.name
								}), wt.is_active ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "rounded-full bg-success-soft px-2 py-0.5 text-[10px] font-semibold text-success",
									children: "ใช้งาน"
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground",
									children: "ปิดใช้งาน (Soft Deleted)"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => void onToggleWorkType(wt.id),
										className: `text-xs font-medium px-2.5 py-1 rounded-lg border ${wt.is_active ? "border-border text-muted-foreground hover:bg-accent" : "border-success text-success hover:bg-success-soft"}`,
										children: wt.is_active ? "ปิดใช้งาน" : "เปิดใช้งาน"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => {
											setEditingWtId(wt.id);
											setEditingWtName(wt.name);
										},
										title: "แก้ไขชื่อประเภทงาน",
										className: "rounded-lg p-1.5 text-primary hover:bg-accent",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-4 w-4" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => void onSoftDeleteWorkType(wt.id),
										title: "Soft Delete ประเภทงาน",
										className: "rounded-lg p-1.5 text-destructive hover:bg-destructive/10",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" })
									})
								]
							})]
						}, wt.id))
					})
				]
			}),
			activeTab === "ot" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "surface-card space-y-4 p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-bold text-base",
						children: "การจัดการประเภท OT (OT Types)"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: "รองรับตัวเลือก \"ไม่มี OT\" (Multiplier = 0) และคำนวณยอด OT แยกอย่างชัดเจน"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-1 gap-3 md:grid-cols-2",
					children: (otTypes.length > 0 ? otTypes : OT_OPTIONS.map((o) => ({
						id: `ot-${o.value}`,
						name: o.label,
						multiplier: o.value,
						is_active: true
					}))).map((ot) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: `flex items-center justify-between rounded-xl border p-4 ${ot.multiplier === 0 ? "border-primary/40 bg-primary/5" : "border-border bg-card"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "font-bold text-sm flex items-center gap-2",
							children: [ot.name, ot.multiplier === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "rounded-full bg-primary/20 text-primary px-2 py-0.5 text-[10px] font-bold",
								children: "ไม่มี OT (0x)"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-xs text-muted-foreground mt-0.5",
							children: [
								"ตัวคูณ: ",
								ot.multiplier,
								" เท่า"
							]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-right font-mono font-bold text-sm text-primary",
							children: ["x", ot.multiplier]
						})]
					}, ot.id))
				})]
			}),
			activeTab === "theme" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "surface-card space-y-6 p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-bold text-base",
							children: "ปรับแต่งธีม & สีกราฟ (Theme Customization)"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "เปลี่ยนโหมด Light / Dark / System และปรับแต่งสีของระบบกับกราฟแท่ง/พาย แสดงผลทันทีและเซฟลง Supabase"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "text-xs font-bold text-muted-foreground uppercase tracking-wider block",
							children: "โหมดแสดงผล (Theme Mode)"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid grid-cols-3 gap-3",
							children: [
								{
									mode: "light",
									label: "Light Mode",
									icon: Sun
								},
								{
									mode: "dark",
									label: "Dark Mode",
									icon: Moon
								},
								{
									mode: "system",
									label: "ตามระบบ",
									icon: Laptop
								}
							].map(({ mode, label, icon: Icon }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => {
									const next = {
										...draftColors,
										themeMode: mode
									};
									setDraftColors(next);
									onSaveThemeSettings(next);
								},
								className: `flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-bold transition ${draftColors.themeMode === mode ? "border-primary bg-primary text-primary-foreground shadow" : "border-border bg-card text-foreground hover:bg-accent"}`,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-4 w-4" }),
									" ",
									label
								]
							}, mode))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
							className: "text-xs font-bold text-muted-foreground uppercase tracking-wider block",
							children: "สีหลักของระบบ (System Color Tokens)"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-3 md:grid-cols-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ColorPickerField, {
									label: "พื้นหลังหลัก (Background)",
									value: draftColors.backgroundColor,
									onChange: (v) => {
										const next = {
											...draftColors,
											backgroundColor: v
										};
										setDraftColors(next);
										onSaveThemeSettings(next);
									}
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ColorPickerField, {
									label: "พื้นหลัง Card",
									value: draftColors.cardColor,
									onChange: (v) => {
										const next = {
											...draftColors,
											cardColor: v
										};
										setDraftColors(next);
										onSaveThemeSettings(next);
									}
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ColorPickerField, {
									label: "สีข้อความหลัก (Text)",
									value: draftColors.foregroundColor,
									onChange: (v) => {
										const next = {
											...draftColors,
											foregroundColor: v
										};
										setDraftColors(next);
										onSaveThemeSettings(next);
									}
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ColorPickerField, {
									label: "สีเส้นขอบ (Border)",
									value: draftColors.borderColor,
									onChange: (v) => {
										const next = {
											...draftColors,
											borderColor: v
										};
										setDraftColors(next);
										onSaveThemeSettings(next);
									}
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ColorPickerField, {
									label: "Primary Color",
									value: draftColors.primaryColor,
									onChange: (v) => {
										const next = {
											...draftColors,
											primaryColor: v
										};
										setDraftColors(next);
										onSaveThemeSettings(next);
									}
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ColorPickerField, {
									label: "Secondary Color",
									value: draftColors.secondaryColor,
									onChange: (v) => {
										const next = {
											...draftColors,
											secondaryColor: v
										};
										setDraftColors(next);
										onSaveThemeSettings(next);
									}
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ColorPickerField, {
									label: "Accent Color",
									value: draftColors.accentColor,
									onChange: (v) => {
										const next = {
											...draftColors,
											accentColor: v
										};
										setDraftColors(next);
										onSaveThemeSettings(next);
									}
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ColorPickerField, {
									label: "สถานะ สำเร็จ (Success)",
									value: draftColors.successColor,
									onChange: (v) => {
										const next = {
											...draftColors,
											successColor: v
										};
										setDraftColors(next);
										onSaveThemeSettings(next);
									}
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
							className: "text-xs font-bold text-muted-foreground uppercase tracking-wider block",
							children: "สีกราฟแท่ง / กราฟวงกลม (Chart Colors)"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid grid-cols-2 gap-3 md:grid-cols-5",
							children: (draftColors.chartColors || DEFAULT_COLORS_LIGHT.chartColors).map((c, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ColorPickerField, {
								label: `ชุดข้อมูลสีกราฟ ${i + 1}`,
								value: c,
								onChange: (v) => {
									const nextCharts = [...draftColors.chartColors || DEFAULT_COLORS_LIGHT.chartColors];
									nextCharts[i] = v;
									const next = {
										...draftColors,
										chartColors: nextCharts
									};
									setDraftColors(next);
									onSaveThemeSettings(next);
								}
							}, i))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex justify-end pt-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => void handleResetColors(),
							className: "flex items-center gap-1.5 rounded-xl border border-border px-4 py-2 text-xs font-medium hover:bg-accent text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "h-4 w-4" }), " รีเซ็ตเป็นสีเริ่มต้น (Reset Defaults)"]
						})
					})
				]
			}),
			activeTab === "general" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "surface-card space-y-4 p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-bold text-base",
						children: "ค่าแรงพื้นฐาน & ค่าเริ่มต้น"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-1 gap-4 md:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "text-xs font-bold text-muted-foreground block mb-1",
							children: "ค่าแรงปกติ (บาท/วัน)"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "number",
							value: rateForm.dailyRate,
							onChange: (e) => setRateForm({
								...rateForm,
								dailyRate: Number(e.target.value)
							}),
							className: "w-full rounded-xl border border-input bg-secondary p-2.5 text-sm"
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "text-xs font-bold text-muted-foreground block mb-1",
							children: "Google Sheets Spreadsheet ID"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: sheetIdInput,
							onChange: (e) => setSheetIdInput(e.target.value),
							placeholder: "วาง Spreadsheet ID หรือ URL เต็มของ Google Sheets",
							className: "w-full rounded-xl border border-input bg-secondary p-2.5 text-sm"
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "pt-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => void handleRatesSave(),
							className: "flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground active:scale-95",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "h-4 w-4" }), " บันทึกค่าแรงและ Google Sheets ID"]
						})
					})
				]
			}),
			activeTab === "integrations" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "surface-card space-y-5 p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-bold text-base",
							children: "การเชื่อมต่อฐานข้อมูล & External Sync"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "Supabase = Primary Database (Source of Truth) · Airtable = External Sync Operational View"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border border-border bg-card p-4 space-y-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 font-bold text-sm text-primary",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Database, { className: "h-5 w-5" }), " Supabase Database"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "rounded-full bg-success-soft text-success px-2.5 py-0.5 text-xs font-bold",
								children: "เชื่อมต่อแล้ว (Source of Truth)"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "ข้อมูลประเภทงาน, User Settings และ Work Logs ทั้งหมดถูกจัดเก็บอย่างปลอดภัยบน Supabase พร้อม Row Level Security (RLS)"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border border-border bg-card p-4 space-y-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2 font-bold text-sm text-primary",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileSpreadsheet, { className: "h-5 w-5" }), " Airtable External Sync"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "rounded-full bg-secondary text-muted-foreground px-2.5 py-0.5 text-xs font-bold",
									children: "ปิดใช้งานชั่วคราว (รอ API Key)"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: "ระบบข้ามการซิงก์ไป Airtable โดยอัตโนมัติหากยังไม่ได้ใส่ AIRTABLE_API_KEY โดยข้อมูลหลักของคุณทั้งหมดจะถูกบันทึกอย่างปลอดภัยบน Supabase และ Google Sheets เป็นหลัก"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "pt-2 flex items-center justify-between border-t border-border",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-xs text-muted-foreground",
									children: [
										"รายการในระบบ: ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-bold text-foreground",
											children: logs.length
										}),
										" ",
										"รายการ"
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									onClick: () => void onSyncAirtableAll(),
									disabled: airtableSyncing,
									className: "flex items-center gap-1.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground px-3 py-2 text-xs font-bold disabled:opacity-50",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: `h-4 w-4 ${airtableSyncing ? "animate-spin" : ""}` }), airtableSyncing ? "กำลังตรวจสอบ..." : "ทดสอบซิงก์ Airtable"]
								})]
							})
						]
					})
				]
			})
		]
	});
}
function ColorPickerField({ label, value, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl border border-border bg-card p-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-[11px] font-semibold text-muted-foreground block mb-1.5 truncate",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				type: "color",
				value: value && value.startsWith("#") ? value : "#3b82f6",
				onChange: (e) => onChange(e.target.value),
				className: "h-8 w-8 cursor-pointer rounded border-0 bg-transparent"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				type: "text",
				value,
				onChange: (e) => onChange(e.target.value),
				className: "w-full rounded-lg border border-input bg-secondary p-1.5 font-mono text-xs"
			})]
		})]
	});
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
/** Creates a new spreadsheet with the WorkLogs tab + header row. */
var createWorkSpreadsheet = createServerFn({ method: "POST" }).inputValidator((input) => objectType({ title: stringType().min(1).max(120).optional() }).parse(input ?? {})).handler(createSsrRpc("32f65ef324f3951a881a96063bdc7be2026db7f5d3dd0b8089c4c0f0c924b817"));
/** Verifies access to a spreadsheet and makes sure the WorkLogs tab + header exist. */
var prepareSpreadsheet = createServerFn({ method: "POST" }).inputValidator((input) => objectType({ spreadsheetId: stringType().min(10) }).parse(input)).handler(createSsrRpc("0e23b552ff6ecad23c367f496da2eadbab438be27a8f1a7893e123f50c70f28b"));
createServerFn({ method: "POST" }).inputValidator((input) => objectType({
	spreadsheetId: stringType().min(10),
	rows: arrayType(arrayType(unionType([stringType(), numberType()]))).min(1).max(500)
}).parse(input)).handler(createSsrRpc("e9c19062c988a91cee9f43ecdd8b781a892490ef5a741dc6c6fae4082cdf3473"));
/** Overwrites the WorkLogs tab so the sheet mirrors app history exactly. */
var replaceWorkLogRows = createServerFn({ method: "POST" }).inputValidator((input) => objectType({
	spreadsheetId: stringType().min(10),
	rows: arrayType(arrayType(unionType([stringType(), numberType()]))).max(5e3)
}).parse(input)).handler(createSsrRpc("4fed7e79f1f4319c2965dd35e83612163943687e7353f15e9a16fdccf36df9a9"));
createServerFn({ method: "POST" }).inputValidator((input) => objectType({ spreadsheetId: stringType().min(10) }).parse(input)).handler(createSsrRpc("5f93a5ce45a08dbcf162d890b71239ddba6605e67c18c35716bb2d2636572985"));
createServerFn({ method: "POST" }).inputValidator((input) => objectType({
	spreadsheetId: stringType().min(10),
	categories: arrayType(stringType().min(1).max(120)).max(200)
}).parse(input)).handler(createSsrRpc("f1215c2972e0315b59b13a39fad5015ca4a9e6a4e18b12302fdbeb6adee0c192"));
createServerFn({ method: "POST" }).inputValidator((input) => objectType({ spreadsheetId: stringType().min(10) }).parse(input)).handler(createSsrRpc("fa587fec76e47499ed040a5a589c570f766c47a042311ecad246e911c61f07cb"));
/**
* Wrapper for server-function calls.
*
* The preview/published host can answer a server-function request with an HTML
* shell (e.g. a `FORCE_RELOAD` page) while a new build is being swapped in.
* That HTML then surfaces to the user as a raw markup blob inside a toast.
* Here we detect it, retry once, and otherwise raise a readable Thai message.
*/
function isHtmlPayload(message) {
	return /<html|FORCE_RELOAD|<!doctype/i.test(message);
}
function toMessage(err) {
	return err instanceof Error ? err.message : String(err);
}
var sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function callServer(fn, args) {
	try {
		return await fn(args);
	} catch (err) {
		const message = toMessage(err);
		if (!isHtmlPayload(message)) throw new Error(message);
		await sleep(1200);
		try {
			return await fn(args);
		} catch (retryErr) {
			const retryMessage = toMessage(retryErr);
			if (isHtmlPayload(retryMessage)) throw new Error("แอปกำลังอัปเดตเวอร์ชันใหม่ กรุณารีเฟรชหน้าแล้วลองอีกครั้ง");
			throw new Error(retryMessage);
		}
	}
}
function SheetsPanel({ spreadsheetId, onChange }) {
	const [input, setInput] = (0, import_react.useState)(spreadsheetId);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [title, setTitle] = (0, import_react.useState)("");
	const url = spreadsheetId ? `https://docs.google.com/spreadsheets/d/${spreadsheetId}` : "";
	const connect = async () => {
		const id = extractSpreadsheetId(input);
		if (!id || id.length < 10) {
			toast.error("กรุณาวางลิงก์หรือ ID ของ Google Sheets");
			return;
		}
		setBusy(true);
		try {
			const res = await callServer(prepareSpreadsheet, { data: { spreadsheetId: id } });
			onChange(res.spreadsheetId);
			setInput(res.spreadsheetId);
			setTitle(res.title ?? "");
			toast.success("เชื่อมต่อชีตสำเร็จ", { description: res.title });
		} catch (err) {
			toast.error("เชื่อมต่อไม่สำเร็จ", { description: err instanceof Error ? err.message : String(err) });
		} finally {
			setBusy(false);
		}
	};
	const createNew = async () => {
		setBusy(true);
		try {
			const res = await callServer(createWorkSpreadsheet, { data: { title: `Work Tracker ${(/* @__PURE__ */ new Date()).getFullYear()}` } });
			onChange(res.spreadsheetId);
			setInput(res.spreadsheetId);
			setTitle(res.title ?? "");
			toast.success("สร้างสเปรดชีตใหม่แล้ว", { description: res.title });
		} catch (err) {
			toast.error("สร้างสเปรดชีตไม่สำเร็จ", { description: err instanceof Error ? err.message : String(err) });
		} finally {
			setBusy(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "surface-card space-y-3 p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-bold",
					children: "บันทึกลง Google Sheets"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "ทุกครั้งที่ Check-out ระบบจะส่งข้อมูลไปยังชีต “WorkLogs” อัตโนมัติ"
				})] }), spreadsheetId ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "flex items-center gap-1 rounded-full bg-success-soft px-2 py-1 text-[11px] font-medium text-success",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-3.5 w-3.5" }), " เชื่อมต่อแล้ว"]
				}) : null]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-2 md:flex-row",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: input,
						onChange: (e) => setInput(e.target.value),
						placeholder: "วางลิงก์ Google Sheets หรือ Spreadsheet ID",
						"aria-label": "Google Sheets URL หรือ ID",
						className: "w-full rounded-lg border border-input bg-secondary p-2.5 text-sm"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: connect,
						disabled: busy,
						className: "flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link2, { className: "h-4 w-4" }), " เชื่อมต่อ"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: createNew,
						disabled: busy,
						className: "flex items-center justify-center gap-1.5 rounded-lg border border-border px-4 py-2.5 text-sm font-medium disabled:opacity-60",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilePlusCorner, { className: "h-4 w-4" }), " สร้างชีตใหม่"]
					})
				]
			}),
			spreadsheetId ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
				href: url,
				target: "_blank",
				rel: "noreferrer",
				className: "inline-flex items-center gap-1 text-xs text-primary hover:underline",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "h-3.5 w-3.5" }),
					" เปิดชีต ",
					title || spreadsheetId
				]
			}) : null
		]
	});
}
var flagKey = (userId) => `work_tracker_unlocked::${userId}`;
/** Requires a Face ID / Touch ID check once per browser session when enrolled. */
function useFaceLock(userId) {
	const [enrolled, setEnrolled] = (0, import_react.useState)(false);
	const [locked, setLocked] = (0, import_react.useState)(false);
	const [checked, setChecked] = (0, import_react.useState)(false);
	const refresh = (0, import_react.useCallback)(() => {
		if (!userId) return;
		const has = !!getFaceCredentialId(userId);
		setEnrolled(has);
		const unlockedThisSession = window.sessionStorage.getItem(flagKey(userId)) === "1";
		setLocked(has && !unlockedThisSession);
		setChecked(true);
	}, [userId]);
	(0, import_react.useEffect)(() => {
		refresh();
	}, [refresh]);
	return {
		enrolled,
		locked,
		checked,
		unlock: (0, import_react.useCallback)(async () => {
			if (!userId) return;
			await verifyFaceUnlock(userId);
			window.sessionStorage.setItem(flagKey(userId), "1");
			setLocked(false);
		}, [userId]),
		forceBypassUnlock: (0, import_react.useCallback)(() => {
			if (!userId) return;
			window.sessionStorage.setItem(flagKey(userId), "1");
			setLocked(false);
		}, [userId]),
		removeFaceLock: (0, import_react.useCallback)(() => {
			if (!userId) return;
			clearFaceCredential(userId);
			window.sessionStorage.setItem(flagKey(userId), "1");
			setEnrolled(false);
			setLocked(false);
			refresh();
		}, [refresh, userId]),
		refresh,
		supported: isFaceUnlockSupported(),
		inIframe: isIframeEnvironment()
	};
}
function FaceLockScreen({ name, userId, onUnlock, onBypassUnlock, onRemoveFaceLock, onSignOut }) {
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [autoAttempted, setAutoAttempted] = (0, import_react.useState)(false);
	const inIframe = isIframeEnvironment();
	const attempt = (0, import_react.useCallback)(async () => {
		setBusy(true);
		try {
			await onUnlock();
			toast.success("ปลดล็อกเรียบร้อยแล้ว");
		} catch (err) {
			toast.error("ปลดล็อกไม่สำเร็จ", { description: err instanceof Error ? err.message : String(err) });
		} finally {
			setBusy(false);
		}
	}, [onUnlock]);
	(0, import_react.useEffect)(() => {
		if (!autoAttempted && !inIframe) {
			setAutoAttempted(true);
			const timer = setTimeout(() => {
				attempt();
			}, 400);
			return () => clearTimeout(timer);
		}
	}, [
		attempt,
		autoAttempted,
		inIframe
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4 py-8",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "surface-card w-full max-w-sm space-y-6 p-7 text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto w-fit rounded-2xl bg-primary/10 p-3 text-primary",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "h-7 w-7" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-lg font-bold",
						children: "แอปถูกล็อกอยู่ (Face ID)"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: name
					})]
				}),
				inIframe && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-left text-xs text-amber-600 dark:text-amber-400",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-semibold flex items-center gap-1.5 mb-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "h-4 w-4 shrink-0" }), " เปิดในกรอบพรีวิว (iframe)"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "opacity-90 leading-relaxed",
						children: "เบราว์เซอร์จะบล็อก Face ID เมื่อเปิดในกรอบพรีวิว กรุณากดปุ่มเปิดในแท็บใหม่ (New Tab) ด้านบน หรือกดปุ่มปลดล็อกด้วยสิทธิ์เข้าใช้งานด้านล่าง"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => void attempt(),
						disabled: busy,
						className: "flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow transition hover:bg-primary/90 disabled:opacity-60",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScanFace, { className: "h-4 w-4" }), busy ? "กำลังยืนยัน Face ID…" : "ปลดล็อกด้วย Face ID / Touch ID"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => {
							onBypassUnlock();
							toast.success("ปลดล็อกผ่านสิทธิ์บัญชีที่เข้าใช้งานสำเร็จ");
						},
						className: "flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-secondary py-2.5 text-xs font-semibold text-foreground transition hover:bg-secondary/80",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyRound, { className: "h-3.5 w-3.5 text-primary" }), "ปลดล็อกด้วยสิทธิ์บัญชีปัจจุบัน"]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "border-t border-border pt-4 flex items-center justify-between text-xs",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => {
							onRemoveFaceLock();
							toast.info("ยกเลิกการล็อกด้วย Face ID เรียบร้อยแล้ว");
						},
						className: "flex items-center gap-1 text-muted-foreground hover:text-destructive transition",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" }), " ยกเลิก Face ID"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: onSignOut,
						className: "text-muted-foreground underline-offset-2 hover:underline",
						children: "ออกจากระบบ"
					})]
				})
			]
		})
	});
}
async function fetchDBWorkTypes(userId) {
	try {
		const { data, error } = await supabase.from("work_types").select("*").eq("user_id", userId).order("created_at", { ascending: true });
		if (error) {
			console.warn("Supabase fetch work_types warning:", error.message);
			return [];
		}
		return data || [];
	} catch (err) {
		console.warn("fetchDBWorkTypes exception:", err);
		return [];
	}
}
async function addDBWorkType(userId, name) {
	const trimmed = name.trim();
	if (!trimmed) return null;
	try {
		const dup = (await fetchDBWorkTypes(userId)).find((w) => w.name.toLowerCase() === trimmed.toLowerCase());
		if (dup) {
			if (!dup.is_active) {
				const { data, error } = await supabase.from("work_types").update({
					is_active: true,
					updated_at: (/* @__PURE__ */ new Date()).toISOString()
				}).eq("id", dup.id).select().single();
				if (error) throw error;
				return data;
			}
			throw new Error(`ประเภทงาน "${trimmed}" มีอยู่แล้วในระบบ`);
		}
		const { data, error } = await supabase.from("work_types").insert({
			user_id: userId,
			name: trimmed,
			is_active: true
		}).select().single();
		if (error) throw error;
		return data;
	} catch (err) {
		console.error("addDBWorkType failed:", err);
		throw err;
	}
}
async function updateDBWorkType(id, name) {
	const trimmed = name.trim();
	if (!trimmed) return false;
	try {
		const { error } = await supabase.from("work_types").update({
			name: trimmed,
			updated_at: (/* @__PURE__ */ new Date()).toISOString()
		}).eq("id", id);
		if (error) throw error;
		return true;
	} catch (err) {
		console.error("updateDBWorkType failed:", err);
		throw err;
	}
}
async function softDeleteDBWorkType(id) {
	try {
		const { error } = await supabase.from("work_types").update({
			is_active: false,
			updated_at: (/* @__PURE__ */ new Date()).toISOString()
		}).eq("id", id);
		if (error) throw error;
		return true;
	} catch (err) {
		console.error("softDeleteDBWorkType failed:", err);
		throw err;
	}
}
/** Syncs local storage categories into Supabase if DB is currently empty for user. */
async function seedDBWorkTypesIfEmpty(userId, categories) {
	const current = await fetchDBWorkTypes(userId);
	if (current.length > 0) return current;
	const toInsert = (categories.length > 0 ? categories : DEFAULT_CATEGORIES).map((c) => ({
		user_id: userId,
		name: c,
		is_active: true
	}));
	try {
		const { data, error } = await supabase.from("work_types").insert(toInsert).select();
		if (error) {
			console.warn("seedDBWorkTypesIfEmpty failed:", error.message);
			return [];
		}
		return data || [];
	} catch (err) {
		console.warn("seedDBWorkTypesIfEmpty exception:", err);
		return [];
	}
}
async function fetchDBOtTypes(userId) {
	try {
		const { data, error } = await supabase.from("ot_types").select("*").or(`user_id.eq.${userId},user_id.is.null`).order("multiplier", { ascending: true });
		if (error || !data || data.length === 0) return OT_OPTIONS.map((o) => ({
			id: `ot-${o.value}`,
			name: o.label,
			multiplier: o.value,
			is_active: true
		}));
		return data;
	} catch {
		return OT_OPTIONS.map((o) => ({
			id: `ot-${o.value}`,
			name: o.label,
			multiplier: o.value,
			is_active: true
		}));
	}
}
async function fetchDBUserSettings(userId) {
	try {
		const { data, error } = await supabase.from("user_settings").select("*").eq("user_id", userId).maybeSingle();
		if (error) {
			console.warn("fetchDBUserSettings warning:", error.message);
			return null;
		}
		return data || null;
	} catch (err) {
		console.warn("fetchDBUserSettings exception:", err);
		return null;
	}
}
async function saveDBUserSettings(userId, settings) {
	try {
		const payload = {
			user_id: userId,
			...settings,
			updated_at: (/* @__PURE__ */ new Date()).toISOString()
		};
		const { error } = await supabase.from("user_settings").upsert(payload, { onConflict: "user_id" });
		if (error) throw error;
		return true;
	} catch (err) {
		console.error("saveDBUserSettings failed:", err);
		throw err;
	}
}
async function fetchDBWorkLogs(userId) {
	try {
		const { data, error } = await supabase.from("work_logs").select("*").eq("user_id", userId).order("check_in_time", { ascending: false });
		if (error) {
			console.warn("fetchDBWorkLogs warning:", error.message);
			return [];
		}
		return (data || []).map((row) => ({
			id: String(row.id || ""),
			date: String(row.date || ""),
			checkInTime: String(row.check_in_time || ""),
			checkOutTime: String(row.check_out_time || ""),
			workType: String(row.work_type || ""),
			locationName: String(row.location_name || ""),
			checkInGPS: row.check_in_gps || {
				lat: null,
				lng: null,
				text: ""
			},
			checkOutGPS: row.check_out_gps || {
				lat: null,
				lng: null,
				text: ""
			},
			checkInPhoto: row.check_in_photo || null,
			checkOutPhoto: row.check_out_photo || null,
			grossHours: Number(row.gross_hours || 0),
			workingHours: Number(row.working_hours || 0),
			otHours: Number(row.ot_hours || 0),
			otType: Number(row.ot_type ?? 0),
			dailyRate: Number(row.daily_rate || 0),
			baseWage: Number(row.base_wage || 0),
			otIncome: Number(row.ot_income || 0),
			travelCost: Number(row.travel_cost || 0),
			foodCost: Number(row.food_cost || 0),
			otherIncome: Number(row.other_income || 0),
			otherDeductions: Number(row.other_deductions || 0),
			netIncome: Number(row.net_income || 0),
			tasks: row.tasks || [],
			airtableRecordId: row.airtable_record_id || null,
			syncedAt: row.synced_at || null
		}));
	} catch (err) {
		console.warn("fetchDBWorkLogs exception:", err);
		return [];
	}
}
async function saveDBWorkLog(userId, log) {
	try {
		const payload = {
			id: log.id,
			user_id: userId,
			date: log.date,
			check_in_time: log.checkInTime,
			check_out_time: log.checkOutTime || null,
			work_type: log.workType,
			location_name: log.locationName,
			check_in_gps: log.checkInGPS || null,
			check_out_gps: log.checkOutGPS || null,
			check_in_photo: log.checkInPhoto || null,
			check_out_photo: log.checkOutPhoto || null,
			gross_hours: log.grossHours || 0,
			working_hours: log.workingHours || 0,
			ot_hours: log.otHours || 0,
			ot_type: log.otType ?? 0,
			daily_rate: log.dailyRate || 0,
			base_wage: log.baseWage || 0,
			ot_income: log.otIncome || 0,
			travel_cost: log.travelCost || 0,
			food_cost: log.foodCost || 0,
			other_income: log.otherIncome || 0,
			other_deductions: log.otherDeductions || 0,
			net_income: log.netIncome || 0,
			tasks: log.tasks || [],
			updated_at: (/* @__PURE__ */ new Date()).toISOString()
		};
		const { error } = await supabase.from("work_logs").upsert(payload, { onConflict: "id" });
		if (error) throw error;
		return true;
	} catch (err) {
		console.error("saveDBWorkLog failed:", err);
		return false;
	}
}
async function deleteDBWorkLog(id) {
	try {
		const { error } = await supabase.from("work_logs").delete().eq("id", id);
		if (error) throw error;
		return true;
	} catch (err) {
		console.error("deleteDBWorkLog failed:", err);
		return false;
	}
}
async function updateDBAirtableStatus(logId, airtableRecordId, syncStatus) {
	try {
		const { error } = await supabase.from("work_logs").update({
			airtable_record_id: airtableRecordId,
			airtable_synced_at: syncStatus === "synced" ? (/* @__PURE__ */ new Date()).toISOString() : null,
			sync_status: syncStatus,
			updated_at: (/* @__PURE__ */ new Date()).toISOString()
		}).eq("id", logId);
		if (error) throw error;
		return true;
	} catch (err) {
		console.error("updateDBAirtableStatus failed:", err);
		return false;
	}
}
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
var syncRecordToAirtable = createServerFn({ method: "POST" }).inputValidator((input) => objectType({ log: workLogSchema }).parse(input)).handler(createSsrRpc("b27b66c81e0bce6a7c2448eb0572d77194d967e9904cd9c71a7b1aa3cef6d66d"));
function useWorkTracker(userId) {
	const [ready, setReady] = (0, import_react.useState)(false);
	const [logs, setLogs] = (0, import_react.useState)([]);
	const [active, setActive] = (0, import_react.useState)(null);
	const [categories, setCategories] = (0, import_react.useState)(DEFAULT_CATEGORIES);
	const [dbWorkTypes, setDbWorkTypes] = (0, import_react.useState)([]);
	const [otTypes, setOtTypes] = (0, import_react.useState)([]);
	const [rates, setRates] = (0, import_react.useState)(DEFAULT_RATES);
	const [spreadsheetId, setSpreadsheetIdState] = (0, import_react.useState)("");
	const [syncing, setSyncing] = (0, import_react.useState)(false);
	const [airtableSyncing, setAirtableSyncing] = (0, import_react.useState)(false);
	const [themeSettings, setThemeSettings] = (0, import_react.useState)(DEFAULT_COLORS_LIGHT);
	(0, import_react.useEffect)(() => {
		setReady(false);
		setStorageNamespace(userId);
		if (!userId) return;
		let isMounted = true;
		async function initFromSupabase() {
			const localLogs = storage.getLogs();
			const localActive = storage.getActive();
			const localCategories = storage.getCategories();
			const localRates = storage.getRates();
			const localSheetId = storage.getSheetId();
			setLogs(localLogs);
			setActive(localActive);
			setCategories(localCategories);
			setRates(localRates);
			setSpreadsheetIdState(localSheetId);
			try {
				const dbSettings = await fetchDBUserSettings(userId);
				if (dbSettings && isMounted) {
					const colors = {
						themeMode: dbSettings.theme || "light",
						backgroundColor: dbSettings.background_color || DEFAULT_COLORS_LIGHT.backgroundColor,
						cardColor: dbSettings.card_color || DEFAULT_COLORS_LIGHT.cardColor,
						foregroundColor: dbSettings.foreground_color || DEFAULT_COLORS_LIGHT.foregroundColor,
						borderColor: dbSettings.border_color || DEFAULT_COLORS_LIGHT.borderColor,
						primaryColor: dbSettings.primary_color || DEFAULT_COLORS_LIGHT.primaryColor,
						secondaryColor: dbSettings.secondary_color || DEFAULT_COLORS_LIGHT.secondaryColor,
						accentColor: dbSettings.accent_color || DEFAULT_COLORS_LIGHT.accentColor,
						successColor: dbSettings.success_color || DEFAULT_COLORS_LIGHT.successColor,
						warningColor: dbSettings.warning_color || DEFAULT_COLORS_LIGHT.warningColor,
						destructiveColor: dbSettings.destructive_color || DEFAULT_COLORS_LIGHT.destructiveColor,
						chartColors: dbSettings.chart_colors?.length ? dbSettings.chart_colors : DEFAULT_COLORS_LIGHT.chartColors
					};
					setThemeSettings(colors);
					applyTheme(colors);
					if (dbSettings.daily_rate) {
						const nextRates = {
							dailyRate: dbSettings.daily_rate,
							otType: dbSettings.default_ot_type ?? 0,
							travelCost: dbSettings.travel_cost || 0,
							foodCost: dbSettings.food_cost || 0,
							otherIncome: dbSettings.other_income || 0,
							otherDeductions: dbSettings.other_deductions || 0
						};
						setRates(nextRates);
						storage.setRates(nextRates);
					}
					if (dbSettings.spreadsheet_id) {
						setSpreadsheetIdState(dbSettings.spreadsheet_id);
						storage.setSheetId(dbSettings.spreadsheet_id);
					}
				} else applyTheme(DEFAULT_COLORS_LIGHT);
				const seedTypes = await seedDBWorkTypesIfEmpty(userId, localCategories);
				if (isMounted) {
					setDbWorkTypes(seedTypes);
					const activeNames = seedTypes.filter((w) => w.is_active).map((w) => w.name);
					if (activeNames.length > 0) {
						setCategories(activeNames);
						storage.setCategories(activeNames);
					}
				}
				const dbOt = await fetchDBOtTypes(userId);
				if (isMounted) setOtTypes(dbOt);
				const dbLogs = await fetchDBWorkLogs(userId);
				if (isMounted) {
					if (dbLogs.length > 0) {
						setLogs(dbLogs);
						storage.setLogs(dbLogs);
					} else if (localLogs.length > 0) for (const l of localLogs) await saveDBWorkLog(userId, l);
				}
			} catch (err) {
				console.warn("Supabase initialization fallback:", err);
			} finally {
				if (isMounted) setReady(true);
			}
		}
		initFromSupabase();
		return () => {
			isMounted = false;
		};
	}, [userId]);
	const persistLogs = (0, import_react.useCallback)((next) => {
		setLogs(next);
		storage.setLogs(next);
	}, []);
	const saveRates = (0, import_react.useCallback)(async (next) => {
		setRates(next);
		storage.setRates(next);
		if (userId) await saveDBUserSettings(userId, {
			daily_rate: next.dailyRate,
			default_ot_type: next.otType,
			travel_cost: next.travelCost,
			food_cost: next.foodCost,
			other_income: next.otherIncome,
			other_deductions: next.otherDeductions
		});
	}, [userId]);
	const saveThemeSettings = (0, import_react.useCallback)(async (colors) => {
		setThemeSettings(colors);
		applyTheme(colors);
		if (userId) await saveDBUserSettings(userId, {
			theme: colors.themeMode,
			background_color: colors.backgroundColor,
			card_color: colors.cardColor,
			foreground_color: colors.foregroundColor,
			border_color: colors.borderColor,
			primary_color: colors.primaryColor,
			secondary_color: colors.secondaryColor,
			accent_color: colors.accentColor,
			success_color: colors.successColor,
			warning_color: colors.warningColor,
			destructive_color: colors.destructiveColor,
			chart_colors: colors.chartColors
		});
	}, [userId]);
	const resetThemeSettings = (0, import_react.useCallback)(async () => {
		setThemeSettings(DEFAULT_COLORS_LIGHT);
		applyTheme(DEFAULT_COLORS_LIGHT);
		if (userId) await saveDBUserSettings(userId, {
			theme: "light",
			background_color: DEFAULT_COLORS_LIGHT.backgroundColor,
			card_color: DEFAULT_COLORS_LIGHT.cardColor,
			foreground_color: DEFAULT_COLORS_LIGHT.foregroundColor,
			border_color: DEFAULT_COLORS_LIGHT.borderColor,
			primary_color: DEFAULT_COLORS_LIGHT.primaryColor,
			secondary_color: DEFAULT_COLORS_LIGHT.secondaryColor,
			accent_color: DEFAULT_COLORS_LIGHT.accentColor,
			success_color: DEFAULT_COLORS_LIGHT.successColor,
			warning_color: DEFAULT_COLORS_LIGHT.warningColor,
			destructive_color: DEFAULT_COLORS_LIGHT.destructiveColor,
			chart_colors: DEFAULT_COLORS_LIGHT.chartColors
		});
	}, [userId]);
	const addWorkType = (0, import_react.useCallback)(async (name) => {
		if (!userId) return;
		if (await addDBWorkType(userId, name)) {
			const updatedList = await fetchDBWorkTypes(userId);
			setDbWorkTypes(updatedList);
			const activeNames = updatedList.filter((w) => w.is_active).map((w) => w.name);
			setCategories(activeNames);
			storage.setCategories(activeNames);
		}
	}, [userId]);
	const editWorkType = (0, import_react.useCallback)(async (id, name) => {
		if (!userId) return;
		await updateDBWorkType(id, name);
		const updatedList = await fetchDBWorkTypes(userId);
		setDbWorkTypes(updatedList);
		const activeNames = updatedList.filter((w) => w.is_active).map((w) => w.name);
		setCategories(activeNames);
		storage.setCategories(activeNames);
	}, [userId]);
	const toggleWorkType = (0, import_react.useCallback)(async (id) => {
		if (!userId) return;
		const target = dbWorkTypes.find((w) => w.id === id);
		if (!target) return;
		if (target.is_active) await softDeleteDBWorkType(id);
		else await addDBWorkType(userId, target.name);
		const updatedList = await fetchDBWorkTypes(userId);
		setDbWorkTypes(updatedList);
		const activeNames = updatedList.filter((w) => w.is_active).map((w) => w.name);
		setCategories(activeNames);
		storage.setCategories(activeNames);
	}, [dbWorkTypes, userId]);
	const softDeleteWorkType = (0, import_react.useCallback)(async (id) => {
		if (!userId) return;
		await softDeleteDBWorkType(id);
		const updatedList = await fetchDBWorkTypes(userId);
		setDbWorkTypes(updatedList);
		const activeNames = updatedList.filter((w) => w.is_active).map((w) => w.name);
		setCategories(activeNames);
		storage.setCategories(activeNames);
		toast.success("ปิดใช้งานประเภทงานแล้ว (Soft Delete)");
	}, [userId]);
	const setSpreadsheetId = (0, import_react.useCallback)((id) => {
		setSpreadsheetIdState(id);
		storage.setSheetId(id);
		if (userId) saveDBUserSettings(userId, { spreadsheet_id: id });
	}, [userId]);
	const mirrorToSheet = (0, import_react.useCallback)(async (allLogs, sheetId) => {
		if (!sheetId) return;
		await callServer(replaceWorkLogRows, { data: {
			spreadsheetId: sheetId,
			rows: allLogs.slice().reverse().map(logToRow)
		} });
	}, []);
	const autoMirror = (0, import_react.useCallback)((allLogs) => {
		if (!spreadsheetId) return;
		setSyncing(true);
		mirrorToSheet(allLogs, spreadsheetId).then(() => {
			const syncedAt = (/* @__PURE__ */ new Date()).toISOString();
			const marked = allLogs.map((l) => ({
				...l,
				syncedAt
			}));
			setLogs(marked);
			storage.setLogs(marked);
		}).catch((err) => {
			toast.error("อัปเดต Google Sheets ไม่สำเร็จ", { description: err instanceof Error ? err.message : String(err) });
		}).finally(() => setSyncing(false));
	}, [mirrorToSheet, spreadsheetId]);
	const syncAirtableSingle = (0, import_react.useCallback)(async (log) => {
		try {
			const res = await callServer(syncRecordToAirtable, { data: { log } });
			if (res.success && res.recordId) {
				await updateDBAirtableStatus(log.id, res.recordId, "synced");
				return {
					success: true,
					recordId: res.recordId
				};
			} else return {
				success: false,
				error: res.error
			};
		} catch (err) {
			return {
				success: false,
				error: err instanceof Error ? err.message : String(err)
			};
		}
	}, []);
	const syncAirtableAll = (0, import_react.useCallback)(async () => {
		setAirtableSyncing(true);
		let successCount = 0;
		try {
			for (const log of logs) if ((await syncAirtableSingle(log)).success) successCount++;
			if (userId) {
				const refreshed = await fetchDBWorkLogs(userId);
				if (refreshed.length > 0) {
					setLogs(refreshed);
					storage.setLogs(refreshed);
				}
			}
			if (successCount > 0) toast.success(`ซิงก์ข้อมูลไป Airtable สำเร็จ ${successCount} รายการ`);
			else toast.info("Airtable ถูกปิดใช้งานชั่วคราว (ยังไม่ได้ตั้งค่า API Key ในระบบ)");
		} catch (err) {
			toast.error("การซิงก์ Airtable เกิดข้อผิดพลาด", { description: err instanceof Error ? err.message : String(err) });
		} finally {
			setAirtableSyncing(false);
		}
	}, [
		logs,
		syncAirtableSingle,
		userId
	]);
	const checkIn = (0, import_react.useCallback)((input) => {
		const now = /* @__PURE__ */ new Date();
		const record = {
			id: `LOG-${now.getTime()}`,
			date: now.toISOString().split("T")[0],
			checkInTime: now.toISOString(),
			workType: input.workType,
			locationName: input.locationName,
			checkInGPS: input.gps,
			checkInPhoto: input.photo,
			dailyRate: input.rates.dailyRate,
			otType: input.rates.otType,
			travelCost: input.rates.travelCost,
			foodCost: input.rates.foodCost,
			otherIncome: input.rates.otherIncome,
			otherDeductions: input.rates.otherDeductions,
			tasks: input.tasks.filter((t) => t.trim())
		};
		setActive(record);
		storage.setActive(record);
		saveRates(input.rates);
		toast.success("Check-in สำเร็จ", { description: `${record.workType} @ ${record.locationName}` });
		return record;
	}, [saveRates]);
	const updateActiveTasks = (0, import_react.useCallback)((tasks) => {
		setActive((prev) => {
			if (!prev) return prev;
			const next = {
				...prev,
				tasks
			};
			storage.setActive(next);
			return next;
		});
	}, []);
	const updateLogTasks = (0, import_react.useCallback)((id, tasks) => {
		const next = logs.map((l) => l.id === id ? {
			...l,
			tasks,
			syncedAt: null
		} : l);
		persistLogs(next);
		const target = next.find((l) => l.id === id);
		if (target && userId) saveDBWorkLog(userId, target);
		autoMirror(next);
	}, [
		autoMirror,
		logs,
		persistLogs,
		userId
	]);
	const checkOut = (0, import_react.useCallback)(async (gps, photo) => {
		if (!active) return null;
		const now = (/* @__PURE__ */ new Date()).toISOString();
		const payroll = calculatePayroll(active.checkInTime, now, active);
		const doneTasks = (active.tasks ?? []).filter((t) => t.trim());
		const completed = {
			...active,
			tasks: doneTasks.length > 0 ? doneTasks : [active.workType || "งานที่ทำเสร็จ"],
			checkOutTime: now,
			checkOutGPS: gps,
			checkOutPhoto: photo,
			...payroll,
			syncedAt: null
		};
		const next = [completed, ...logs];
		persistLogs(next);
		setActive(null);
		storage.setActive(null);
		if (userId) await saveDBWorkLog(userId, completed);
		toast.success("Check-out สำเร็จ", { description: `รายได้สุทธิ ฿${completed.netIncome.toLocaleString("th-TH")}` });
		if (spreadsheetId) {
			setSyncing(true);
			try {
				await mirrorToSheet(next, spreadsheetId);
				const syncedAt = (/* @__PURE__ */ new Date()).toISOString();
				persistLogs(next.map((l) => ({
					...l,
					syncedAt
				})));
			} catch (err) {
				console.warn("Google Sheets mirror warning:", err);
			} finally {
				setSyncing(false);
			}
		}
		return completed;
	}, [
		active,
		logs,
		mirrorToSheet,
		persistLogs,
		spreadsheetId,
		userId
	]);
	const deleteLog = (0, import_react.useCallback)((id) => {
		const next = logs.filter((l) => l.id !== id);
		persistLogs(next);
		if (userId) deleteDBWorkLog(id);
		autoMirror(next);
		toast.success("ลบรายการแล้ว");
	}, [
		autoMirror,
		logs,
		persistLogs,
		userId
	]);
	const cancelActive = (0, import_react.useCallback)(() => {
		setActive(null);
		storage.setActive(null);
		toast.info("ยกเลิกการ Check-in แล้ว");
	}, []);
	const updateActiveTime = (0, import_react.useCallback)((checkInISO) => {
		if (!active) return;
		const next = {
			...active,
			checkInTime: checkInISO,
			date: checkInISO.split("T")[0]
		};
		setActive(next);
		storage.setActive(next);
		toast.success("แก้ไขเวลาเข้างานแล้ว");
	}, [active]);
	const updateLog = (0, import_react.useCallback)((id, patch) => {
		const target = logs.find((l) => l.id === id);
		if (!target) return;
		const merged = {
			...target,
			...patch
		};
		if (merged.checkOutTime && new Date(merged.checkOutTime).getTime() <= new Date(merged.checkInTime).getTime()) {
			toast.error("เวลาออกงานต้องอยู่หลังเวลาเข้างาน");
			return;
		}
		const payroll = merged.checkOutTime ? calculatePayroll(merged.checkInTime, merged.checkOutTime, merged) : {};
		const updated = {
			...merged,
			date: merged.checkInTime.split("T")[0],
			...payroll,
			syncedAt: null
		};
		const next = logs.map((l) => l.id === id ? updated : l);
		persistLogs(next);
		if (userId) saveDBWorkLog(userId, updated);
		autoMirror(next);
		toast.success("บันทึกการแก้ไขแล้ว");
	}, [
		autoMirror,
		logs,
		persistLogs,
		userId
	]);
	return {
		ready,
		logs,
		active,
		categories,
		dbWorkTypes,
		otTypes,
		rates,
		themeSettings,
		spreadsheetId,
		syncing,
		airtableSyncing,
		pendingCount: logs.filter((l) => !l.syncedAt).length,
		addWorkType,
		editWorkType,
		toggleWorkType,
		softDeleteWorkType,
		saveRates,
		saveThemeSettings,
		resetThemeSettings,
		setSpreadsheetId,
		checkIn,
		checkOut,
		deleteLog,
		cancelActive,
		updateActiveTime,
		updateActiveTasks,
		updateLogTasks,
		updateLog,
		syncAirtableAll
	};
}
var TABS = [
	{
		id: "checkin",
		label: "Check-in / Out",
		icon: MapPinned
	},
	{
		id: "dashboard",
		label: "Dashboard",
		icon: LayoutDashboard
	},
	{
		id: "history",
		label: "ประวัติการทำงาน",
		icon: ClipboardList
	},
	{
		id: "settings",
		label: "ตั้งค่าระบบ",
		icon: Settings2
	}
];
function Index() {
	const { user, loading } = useSession();
	const userId = user?.id ?? null;
	const tracker = useWorkTracker(userId);
	const lock = useFaceLock(userId);
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [tab, setTab] = (0, import_react.useState)("checkin");
	const [month, setMonth] = (0, import_react.useState)(() => (/* @__PURE__ */ new Date()).toISOString().slice(0, 7));
	const pulledRef = (0, import_react.useRef)(false);
	const { ready, spreadsheetId, pullFromSheet } = tracker;
	(0, import_react.useEffect)(() => {
		if (tab !== "dashboard" || !ready || !spreadsheetId || pulledRef.current) return;
		pulledRef.current = true;
		pullFromSheet(true);
	}, [
		tab,
		ready,
		spreadsheetId,
		pullFromSheet
	]);
	async function signOut() {
		await queryClient.cancelQueries();
		queryClient.clear();
		clearGuestUser();
		await supabase.auth.signOut();
		navigate({
			to: "/auth",
			replace: true
		});
	}
	if (loading || !userId) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center text-sm text-muted-foreground",
		children: "กำลังโหลด…"
	});
	if (lock.checked && lock.locked) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FaceLockScreen, {
		name: displayName(user),
		userId,
		onUnlock: lock.unlock,
		onBypassUnlock: lock.forceBypassUnlock,
		onRemoveFaceLock: lock.removeFaceLock,
		onSignOut: () => void signOut()
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-background pb-16",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppHeader, {
			name: displayName(user),
			email: user?.email ?? "",
			faceEnrolled: lock.enrolled,
			faceSupported: lock.supported,
			userId,
			onFaceChanged: lock.refresh,
			onSignOut: () => void signOut()
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
			className: "mx-auto max-w-4xl px-4 py-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "surface-card mb-5 flex overflow-hidden rounded-2xl p-1",
				children: TABS.map(({ id, label, icon: Icon }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => setTab(id),
					"aria-current": tab === id,
					className: `flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-medium transition md:text-sm ${tab === id ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:bg-accent"}`,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-4 w-4" }),
						" ",
						label
					]
				}, id))
			}), !tracker.ready ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "surface-card p-10 text-center text-sm text-muted-foreground",
				children: "กำลังโหลดข้อมูล…"
			}) : tab === "checkin" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckInPanel, {
					active: tracker.active,
					logs: tracker.logs,
					categories: tracker.categories,
					rates: tracker.rates,
					onSaveCategories: tracker.saveCategories,
					onCheckIn: tracker.checkIn,
					onCheckOut: (gps, photo) => void tracker.checkOut(gps, photo),
					onCancelActive: tracker.cancelActive,
					onEditActiveTime: tracker.updateActiveTime,
					onEditActiveTasks: tracker.updateActiveTasks
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetsPanel, {
					spreadsheetId: tracker.spreadsheetId,
					onChange: tracker.setSpreadsheetId
				})]
			}) : tab === "dashboard" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardPanel, {
				logs: tracker.logs,
				month,
				onMonthChange: setMonth,
				spreadsheetId: tracker.spreadsheetId,
				syncing: tracker.syncing,
				onRefresh: () => void tracker.pullFromSheet()
			}) : tab === "history" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HistoryPanel, {
				logs: tracker.logs,
				syncing: tracker.syncing,
				pendingCount: tracker.pendingCount,
				categories: tracker.categories,
				onDelete: tracker.deleteLog,
				onSync: () => void tracker.syncPending(),
				onPull: () => void tracker.pullFromSheet(),
				onUpdate: tracker.updateLog
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsPanel, {
				userId,
				workTypes: tracker.dbWorkTypes,
				otTypes: tracker.otTypes,
				rates: tracker.rates,
				themeSettings: tracker.themeSettings,
				spreadsheetId: tracker.spreadsheetId,
				logs: tracker.logs,
				onAddWorkType: tracker.addWorkType,
				onEditWorkType: tracker.editWorkType,
				onToggleWorkType: tracker.toggleWorkType,
				onSoftDeleteWorkType: tracker.softDeleteWorkType,
				onSaveRates: tracker.saveRates,
				onSaveThemeSettings: tracker.saveThemeSettings,
				onResetThemeSettings: tracker.resetThemeSettings,
				onSetSpreadsheetId: tracker.setSpreadsheetId,
				onSyncAirtableAll: tracker.syncAirtableAll,
				airtableSyncing: tracker.airtableSyncing
			})]
		})]
	});
}
//#endregion
export { Index as component };
