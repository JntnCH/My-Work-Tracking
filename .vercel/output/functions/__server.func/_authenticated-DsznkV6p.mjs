import { o as __toESM } from "./_runtime.mjs";
import { n as supabase, t as isSupabaseConfigured } from "./_ssr/client-CvOztibg.mjs";
import { i as require_react, n as useQueryClient } from "./_libs/react+tanstack__react-query.mjs";
import { b as useNavigate } from "./_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "./_libs/sonner.mjs";
import { t as require_jsx_dev_runtime } from "./_libs/react.mjs";
import { $ as Crosshair, A as MapPinned, B as ListChecks, D as Monitor, E as Moon, F as Lock, G as GripVertical, H as LayoutDashboard, I as LockOpen, J as FileSpreadsheet, K as Github, L as LocateFixed, M as Mail, N as LogOut, O as MessageCircle, P as LogIn, Q as Database, R as LoaderCircle, S as Plus, T as Palette, U as Laptop, V as Link2, W as KeyRound, X as ExternalLink, Y as FilePlusCorner, Z as Download, _ as ScanFace, _t as BedDouble, at as Clock, b as RefreshCw, c as TriangleAlert, ct as CircleX, d as Sun, dt as CircleCheck, f as Sparkles, g as Settings2, gt as Briefcase, h as ShieldCheck, ht as CalendarCheck, it as CloudDownload, j as MapPin, k as Maximize2, l as TrendingUp, m as SlidersVertical, mt as Camera, n as X, o as Unlink2, ot as Clock3, p as Smartphone, pt as Check, r as UserRound, rt as CloudUpload, s as Undo2, st as ClipboardList, tt as Coins, u as Trash2, ut as CircleMinus, v as Save, w as Pencil, x as Redo2, y as RotateCcw, z as ListPlus } from "./_libs/lucide-react.mjs";
import { n as EngineWorkingAnimation } from "./_ssr/router-C6zy0r1v.mjs";
import { a as TSS_SERVER_FUNCTION, i as createServerFn, o as getServerFnById } from "./_ssr/server-DkLM_YV6.mjs";
import { n as displayName, s as useSession, t as clearGuestUser } from "./_ssr/use-session-Dgvsmbbc.mjs";
import { a as unionType, i as stringType, n as numberType, r as objectType, t as arrayType } from "./_libs/zod.mjs";
import { a as Bar, c as ResponsiveContainer, i as XAxis, l as Tooltip, n as BarChart, o as Pie, r as YAxis, s as Cell, t as PieChart } from "./_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_authenticated-DsznkV6p.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_dev_runtime = require_jsx_dev_runtime();
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
var _jsxFileName$12 = "/app/applet/src/components/work/AppHeader.tsx";
function AppHeader({ name, email, userId, isGuest, faceEnrolled, faceSupported, onFaceChanged, onSignOut, themeMode, onToggleTheme }) {
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
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("header", {
		className: "gradient-header sticky top-0 z-40 text-primary-foreground shadow-lg",
		children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
			className: "mx-auto flex w-full max-w-4xl items-center justify-between gap-2 px-3 py-3 sm:gap-3 sm:px-4 sm:py-4",
			children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
				className: "flex min-w-0 flex-1 items-center gap-2 sm:gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "rounded-xl bg-card p-2 text-primary shadow-md",
					children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Clock3, { className: "h-5 w-5" }, void 0, false, {
						fileName: _jsxFileName$12,
						lineNumber: 66,
						columnNumber: 13
					}, this)
				}, void 0, false, {
					fileName: _jsxFileName$12,
					lineNumber: 65,
					columnNumber: 11
				}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "min-w-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "flex items-center gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h1", {
								className: "truncate text-lg leading-tight font-bold",
								children: "Work Tracker"
							}, void 0, false, {
								fileName: _jsxFileName$12,
								lineNumber: 70,
								columnNumber: 15
							}, this), email.toLowerCase().includes("@gmail.com") && /* @__PURE__ */ (void 0)("span", {
								className: "hidden xs:inline-flex items-center gap-1 rounded-full bg-card/20 px-1.5 py-0.5 text-[9px] font-bold text-primary-foreground tracking-wide",
								children: [/* @__PURE__ */ (void 0)("span", { className: "h-1.5 w-1.5 rounded-full bg-emerald-400" }, void 0, false, {
									fileName: _jsxFileName$12,
									lineNumber: 73,
									columnNumber: 19
								}, this), "Gmail"]
							}, void 0, true, {
								fileName: _jsxFileName$12,
								lineNumber: 72,
								columnNumber: 17
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName$12,
							lineNumber: 69,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
							className: "truncate text-xs opacity-80",
							children: name || email || "ระบบบันทึกงาน & Check-in"
						}, void 0, false, {
							fileName: _jsxFileName$12,
							lineNumber: 78,
							columnNumber: 13
						}, this),
						isGuest && /* @__PURE__ */ (void 0)("p", {
							className: "mt-0.5 max-w-[15rem] text-[10px] leading-tight text-primary-foreground/70 sm:max-w-none",
							title: "โหมดทดลอง: ข้อมูลจะเก็บไว้ในเบราว์เซอร์ของเครื่องนี้เท่านั้น ไม่ซิงก์ข้ามเครื่อง หากต้องการสำรองข้อมูลหรือใช้งานหลายเครื่อง กรุณาเข้าสู่ระบบด้วยบัญชีผู้ใช้",
							children: "โหมดทดลอง: ข้อมูลเก็บในเครื่องนี้เท่านั้น ไม่ซิงก์ข้ามเครื่อง"
						}, void 0, false, {
							fileName: _jsxFileName$12,
							lineNumber: 80,
							columnNumber: 15
						}, this)
					]
				}, void 0, true, {
					fileName: _jsxFileName$12,
					lineNumber: 68,
					columnNumber: 11
				}, this)]
			}, void 0, true, {
				fileName: _jsxFileName$12,
				lineNumber: 64,
				columnNumber: 9
			}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
				className: "flex shrink-0 items-center gap-1.5 sm:gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "hidden rounded-lg border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-1.5 text-right text-xs font-medium tabular-nums sm:block md:text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							suppressHydrationWarning: true,
							children: now ? now.toLocaleTimeString("th-TH", { hour12: false }) : "--:--:--"
						}, void 0, false, {
							fileName: _jsxFileName$12,
							lineNumber: 92,
							columnNumber: 13
						}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "text-[10px] font-normal opacity-80",
							suppressHydrationWarning: true,
							children: now ? now.toLocaleDateString("th-TH", {
								day: "numeric",
								month: "short",
								year: "2-digit"
							}) : ""
						}, void 0, false, {
							fileName: _jsxFileName$12,
							lineNumber: 95,
							columnNumber: 13
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName$12,
						lineNumber: 91,
						columnNumber: 11
					}, this),
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
						type: "button",
						onClick: onToggleTheme,
						title: themeMode === "dark" ? "เปลี่ยนเป็นโหมดสว่าง" : "เปลี่ยนเป็นโหมดมืด",
						"aria-label": themeMode === "dark" ? "เปลี่ยนเป็นโหมดสว่าง" : "เปลี่ยนเป็นโหมดมืด",
						className: "rounded-lg border border-primary-foreground/20 bg-primary-foreground/10 p-2 transition hover:bg-primary-foreground/20 active:scale-95",
						children: themeMode === "dark" ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Sun, { className: "h-4 w-4" }, void 0, false, {
							fileName: _jsxFileName$12,
							lineNumber: 113,
							columnNumber: 37
						}, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Moon, { className: "h-4 w-4" }, void 0, false, {
							fileName: _jsxFileName$12,
							lineNumber: 113,
							columnNumber: 67
						}, this)
					}, void 0, false, {
						fileName: _jsxFileName$12,
						lineNumber: 106,
						columnNumber: 11
					}, this),
					faceSupported && /* @__PURE__ */ (void 0)("button", {
						onClick: () => void toggleFace(),
						disabled: busy,
						title: faceEnrolled ? "ปิดล็อกด้วย Face ID" : "เปิดล็อกด้วย Face ID",
						"aria-label": faceEnrolled ? "ปิดล็อกด้วย Face ID" : "เปิดล็อกด้วย Face ID",
						className: `rounded-lg border border-primary-foreground/20 p-2 transition disabled:opacity-60 ${faceEnrolled ? "bg-primary-foreground/30" : "bg-primary-foreground/10"}`,
						children: /* @__PURE__ */ (void 0)(ScanFace, { className: "h-4 w-4" }, void 0, false, {
							fileName: _jsxFileName$12,
							lineNumber: 126,
							columnNumber: 15
						}, this)
					}, void 0, false, {
						fileName: _jsxFileName$12,
						lineNumber: 117,
						columnNumber: 13
					}, this),
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
						onClick: onSignOut,
						title: "ออกจากระบบ",
						"aria-label": "ออกจากระบบ",
						className: "rounded-lg border border-primary-foreground/20 bg-primary-foreground/10 p-2 transition hover:bg-primary-foreground/20",
						children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(LogOut, { className: "h-4 w-4" }, void 0, false, {
							fileName: _jsxFileName$12,
							lineNumber: 136,
							columnNumber: 13
						}, this)
					}, void 0, false, {
						fileName: _jsxFileName$12,
						lineNumber: 130,
						columnNumber: 11
					}, this)
				]
			}, void 0, true, {
				fileName: _jsxFileName$12,
				lineNumber: 90,
				columnNumber: 9
			}, this)]
		}, void 0, true, {
			fileName: _jsxFileName$12,
			lineNumber: 63,
			columnNumber: 7
		}, this)
	}, void 0, false, {
		fileName: _jsxFileName$12,
		lineNumber: 62,
		columnNumber: 5
	}, this);
}
var STORAGE_KEYS = {
	logs: "work_tracker_logs",
	active: "work_tracker_active",
	categories: "work_tracker_categories",
	settings: "work_tracker_settings",
	theme: "work_tracker_theme",
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
		timeZone: "Asia/Bangkok",
		day: "numeric",
		month: "short",
		year: "2-digit"
	})} ${d.toLocaleTimeString("th-TH", {
		timeZone: "Asia/Bangkok",
		hour: "2-digit",
		minute: "2-digit",
		hour12: false
	})}`;
}
function dateInBangkok(iso) {
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return "";
	return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Bangkok" }).format(d);
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
	return d.toLocaleTimeString("th-TH", {
		timeZone: "Asia/Bangkok",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hour12: false
	});
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
		log.otType ?? 0,
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
	getTheme: (fallback) => read(STORAGE_KEYS.theme, fallback),
	setTheme: (theme) => write(STORAGE_KEYS.theme, theme),
	getSheetId: () => read(STORAGE_KEYS.sheet, ""),
	setSheetId: (id) => write(STORAGE_KEYS.sheet, id)
};
/** ISO string -> value for <input type="datetime-local"> in Thailand time. */
function toLocalInput(iso) {
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return "";
	const parts = new Intl.DateTimeFormat("en-CA", {
		timeZone: "Asia/Bangkok",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		hourCycle: "h23"
	}).formatToParts(d);
	const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
	return `${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}`;
}
/** datetime-local value -> ISO string, interpreted as Asia/Bangkok (null if invalid). */
function fromLocalInput(value) {
	if (!value) return null;
	const d = /* @__PURE__ */ new Date(`${value}:00+07:00`);
	return Number.isNaN(d.getTime()) ? null : d.toISOString();
}
/** Accepts a full Google Sheets URL or a bare spreadsheet ID. */
function extractSpreadsheetId(input) {
	const trimmed = input.trim();
	const m = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
	return m ? m[1] : trimmed;
}
function num(v) {
	const n = Number(String(v ?? "").replace(/[^\d.-]/g, ""));
	return Number.isFinite(n) ? n : 0;
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
/** Google Sheets serial number (days since 1899-12-30) -> "YYYY-MM-DD". */
function dateFromSerial(serial) {
	const ms = Math.round(serial * 864e5);
	const d = new Date(Date.UTC(1899, 11, 30) + ms);
	const pad = (n) => String(n).padStart(2, "0");
	return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}
/** Normalizes a date cell that may be text or a Sheets serial number. */
function normalizeDate(cell) {
	const raw = String(cell ?? "").trim();
	if (!raw) return "";
	if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);
	const n = Number(raw);
	if (Number.isFinite(n) && n > 1e3) return dateFromSerial(n);
	const parsed = new Date(raw);
	if (!Number.isNaN(parsed.getTime())) {
		const pad = (x) => String(x).padStart(2, "0");
		return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}`;
	}
	return "";
}
/** Normalizes a time cell that may be "HH:mm[:ss]" or a Sheets day fraction. */
function normalizeTime(cell) {
	const raw = String(cell ?? "").trim();
	if (!raw) return "";
	if (raw.includes(":")) return raw;
	const n = Number(raw);
	if (!Number.isFinite(n)) return "";
	const totalSec = Math.round(n % 1 * 86400);
	const pad = (x) => String(x).padStart(2, "0");
	return `${pad(Math.floor(totalSec / 3600))}:${pad(Math.floor(totalSec % 3600 / 60))}:${pad(totalSec % 60)}`;
}
/** "2026-08-07" + "08:30:00" -> ISO string in the viewer's local timezone. */
function isoFrom(date, time) {
	const [y, mo, d] = date.split("-").map(Number);
	const [h = 0, mi = 0, s = 0] = normalizeTime(time).split(":").map(Number);
	const dt = new Date(y ?? 1970, (mo ?? 1) - 1, d ?? 1, h, mi, s);
	return Number.isNaN(dt.getTime()) ? "" : dt.toISOString();
}
/** Converts one WorkLogs sheet row back into a WorkLog (sheet is the source of truth). */
function rowToLog(row) {
	const date = normalizeDate(row[1] ?? "");
	if (!date) return null;
	const checkInTime = isoFrom(date, row[2] ?? "00:00:00");
	let checkOutTime = row[3] ? isoFrom(date, row[3]) : "";
	if (!checkInTime) return null;
	if (checkOutTime && new Date(checkOutTime).getTime() < new Date(checkInTime).getTime()) checkOutTime = new Date(new Date(checkOutTime).getTime() + 864e5).toISOString();
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
		otType: row[11] !== "" && row[11] !== void 0 ? num(row[11]) : 0,
		baseWage: num(row[12]),
		otIncome: num(row[13]),
		travelCost: num(row[14]),
		foodCost: num(row[15]),
		otherIncome: num(row[16]),
		otherDeductions: num(row[17]),
		netIncome: num(row[18]),
		dailyRate: num(row[9]) ? Math.round(num(row[12]) / num(row[9]) * 8) : 0,
		tasks: (row[20] ?? "").split("|").map((t) => t.trim()).filter(Boolean),
		syncedAt: (/* @__PURE__ */ new Date()).toISOString()
	};
}
var _jsxFileName$11 = "/app/applet/src/components/work/CategoryDialog.tsx";
function CategoryDialog({ open, categories, onSave, onClose }) {
	const [draft, setDraft] = (0, import_react.useState)(categories);
	const [value, setValue] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	const [editingIndex, setEditingIndex] = (0, import_react.useState)(null);
	const [editValue, setEditValue] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		if (open) {
			setDraft(categories);
			setValue("");
			setError("");
			setEditingIndex(null);
			setEditValue("");
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
	const startRename = (index) => {
		setEditingIndex(index);
		setEditValue(draft[index] || "");
		setError("");
	};
	const saveRename = (index) => {
		const nextName = editValue.trim();
		if (!nextName) {
			setEditingIndex(null);
			return;
		}
		if (draft.some((c, i) => i !== index && c.toLowerCase() === nextName.toLowerCase())) {
			setError("ชื่อประเภทงานนี้ซ้ำกับรายการอื่น");
			return;
		}
		const next = draft.map((c, i) => i === index ? nextName : c);
		setDraft(next);
		onSave(next);
		setEditingIndex(null);
		setEditValue("");
		setError("");
	};
	const remove = (index) => {
		if (draft.length <= 1) {
			setError("ต้องมีประเภทงานอย่างน้อย 1 รายการ");
			return;
		}
		const next = draft.filter((_, i) => i !== index);
		setDraft(next);
		onSave(next);
		if (editingIndex === index) setEditingIndex(null);
	};
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
		className: "fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-0 md:items-center md:p-4",
		children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
			className: "surface-card w-full max-w-md p-5",
			role: "dialog",
			"aria-label": "จัดการประเภทงาน",
			children: [
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "mb-4 flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h3", {
						className: "font-bold",
						children: "จัดการประเภทงาน"
					}, void 0, false, {
						fileName: _jsxFileName$11,
						lineNumber: 85,
						columnNumber: 11
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
						onClick: onClose,
						"aria-label": "ปิด",
						className: "rounded-md p-1 hover:bg-muted",
						children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(X, { className: "h-4 w-4" }, void 0, false, {
							fileName: _jsxFileName$11,
							lineNumber: 87,
							columnNumber: 13
						}, this)
					}, void 0, false, {
						fileName: _jsxFileName$11,
						lineNumber: 86,
						columnNumber: 11
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName$11,
					lineNumber: 84,
					columnNumber: 9
				}, this),
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "mb-3 flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("input", {
						value,
						onChange: (e) => setValue(e.target.value),
						onKeyDown: (e) => e.key === "Enter" && add(),
						placeholder: "เพิ่มประเภทงานใหม่",
						"aria-label": "ชื่อประเภทงานใหม่",
						className: "w-full rounded-lg border border-input bg-secondary p-2.5 text-sm"
					}, void 0, false, {
						fileName: _jsxFileName$11,
						lineNumber: 92,
						columnNumber: 11
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
						onClick: add,
						className: "flex items-center gap-1 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Plus, { className: "h-4 w-4" }, void 0, false, {
							fileName: _jsxFileName$11,
							lineNumber: 104,
							columnNumber: 13
						}, this), " เพิ่ม"]
					}, void 0, true, {
						fileName: _jsxFileName$11,
						lineNumber: 100,
						columnNumber: 11
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName$11,
					lineNumber: 91,
					columnNumber: 9
				}, this),
				error ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
					className: "mb-2 text-xs text-destructive",
					children: error
				}, void 0, false, {
					fileName: _jsxFileName$11,
					lineNumber: 107,
					columnNumber: 18
				}, this) : null,
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "max-h-64 space-y-2 overflow-y-auto",
					"data-testid": "category-list",
					children: draft.map((cat, index) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "flex items-center justify-between gap-2 rounded-lg border border-border bg-card p-2.5 text-sm",
						children: editingIndex === index ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "flex flex-1 items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("input", {
									type: "text",
									value: editValue,
									onChange: (e) => setEditValue(e.target.value),
									onKeyDown: (e) => {
										if (e.key === "Enter") saveRename(index);
										if (e.key === "Escape") setEditingIndex(null);
									},
									autoFocus: true,
									className: "w-full rounded-md border border-primary bg-background px-2 py-1 text-sm focus:outline-none"
								}, void 0, false, {
									fileName: _jsxFileName$11,
									lineNumber: 117,
									columnNumber: 19
								}, this),
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
									onClick: () => saveRename(index),
									className: "rounded-md bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground",
									children: "บันทึก"
								}, void 0, false, {
									fileName: _jsxFileName$11,
									lineNumber: 128,
									columnNumber: 19
								}, this),
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
									onClick: () => setEditingIndex(null),
									className: "rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground hover:bg-muted/80",
									children: "ยกเลิก"
								}, void 0, false, {
									fileName: _jsxFileName$11,
									lineNumber: 134,
									columnNumber: 19
								}, this)
							]
						}, void 0, true, {
							fileName: _jsxFileName$11,
							lineNumber: 116,
							columnNumber: 17
						}, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(import_jsx_dev_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
							className: "font-medium",
							children: cat
						}, void 0, false, {
							fileName: _jsxFileName$11,
							lineNumber: 143,
							columnNumber: 19
						}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "flex items-center gap-1 shrink-0",
							children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
								onClick: () => startRename(index),
								"aria-label": `แก้ไข ${cat}`,
								className: "rounded p-1.5 text-primary hover:bg-accent cursor-pointer",
								children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Pencil, { className: "h-4 w-4" }, void 0, false, {
									fileName: _jsxFileName$11,
									lineNumber: 150,
									columnNumber: 23
								}, this)
							}, void 0, false, {
								fileName: _jsxFileName$11,
								lineNumber: 145,
								columnNumber: 21
							}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
								onClick: () => remove(index),
								"aria-label": `ลบ ${cat}`,
								className: "rounded p-1.5 text-destructive hover:bg-destructive/10 cursor-pointer",
								children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Trash2, { className: "h-4 w-4" }, void 0, false, {
									fileName: _jsxFileName$11,
									lineNumber: 157,
									columnNumber: 23
								}, this)
							}, void 0, false, {
								fileName: _jsxFileName$11,
								lineNumber: 152,
								columnNumber: 21
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName$11,
							lineNumber: 144,
							columnNumber: 19
						}, this)] }, void 0, true, {
							fileName: _jsxFileName$11,
							lineNumber: 142,
							columnNumber: 17
						}, this)
					}, `${cat}-${index}`, false, {
						fileName: _jsxFileName$11,
						lineNumber: 111,
						columnNumber: 13
					}, this))
				}, void 0, false, {
					fileName: _jsxFileName$11,
					lineNumber: 109,
					columnNumber: 9
				}, this)
			]
		}, void 0, true, {
			fileName: _jsxFileName$11,
			lineNumber: 83,
			columnNumber: 7
		}, this)
	}, void 0, false, {
		fileName: _jsxFileName$11,
		lineNumber: 82,
		columnNumber: 5
	}, this);
}
var _jsxFileName$10 = "/app/applet/src/components/work/CheckInPanel.tsx";
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
	const [dailyRateInput, setDailyRateInput] = (0, import_react.useState)(() => String(rates.dailyRate ?? ""));
	const [travelCostInput, setTravelCostInput] = (0, import_react.useState)(() => rates.travelCost ? String(rates.travelCost) : "");
	const [foodCostInput, setFoodCostInput] = (0, import_react.useState)(() => rates.foodCost ? String(rates.foodCost) : "");
	const [otherIncomeInput, setOtherIncomeInput] = (0, import_react.useState)(() => rates.otherIncome ? String(rates.otherIncome) : "");
	const [otherDeductionsInput, setOtherDeductionsInput] = (0, import_react.useState)(() => rates.otherDeductions ? String(rates.otherDeductions) : "");
	const [elapsed, setElapsed] = (0, import_react.useState)(0);
	const [catOpen, setCatOpen] = (0, import_react.useState)(false);
	const [taskInput, setTaskInput] = (0, import_react.useState)("");
	const fileRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		setForm(rates);
		setDailyRateInput(String(rates.dailyRate ?? ""));
		setTravelCostInput(rates.travelCost ? String(rates.travelCost) : "");
		setFoodCostInput(rates.foodCost ? String(rates.foodCost) : "");
		setOtherIncomeInput(rates.otherIncome ? String(rates.otherIncome) : "");
		setOtherDeductionsInput(rates.otherDeductions ? String(rates.otherDeductions) : "");
	}, [rates]);
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
	const fetchGPS = (0, import_react.useCallback)(() => {
		if (typeof navigator === "undefined" || !navigator.geolocation) {
			setGps({
				...EMPTY_GPS,
				text: "อุปกรณ์ไม่รองรับ GPS"
			});
			return Promise.resolve(null);
		}
		if (typeof window !== "undefined" && !window.isSecureContext) {
			setGps({
				...EMPTY_GPS,
				text: "ต้องเปิดผ่าน https จึงจะขอพิกัดได้"
			});
			return Promise.resolve(null);
		}
		setGpsLoading(true);
		return new Promise((resolve) => {
			navigator.geolocation.getCurrentPosition(async (pos) => {
				const lat = pos.coords.latitude.toFixed(6);
				const lng = pos.coords.longitude.toFixed(6);
				const addressName = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
				const nextGPS = {
					lat,
					lng,
					text: `Lat: ${lat}, Lng: ${lng}`,
					addressName
				};
				setGps(nextGPS);
				setGpsLoading(false);
				resolve(nextGPS);
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
				resolve(null);
			}, {
				enableHighAccuracy: true,
				timeout: 2e4,
				maximumAge: 3e4
			});
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
	const tasks = active?.tasks ?? [];
	const setTasks = (next) => onEditActiveTasks(next);
	const addTask = () => {
		const value = taskInput.trim();
		if (!value || !active) return;
		setTasks([...tasks, value]);
		setTaskInput("");
	};
	const doCheckIn = () => {
		const rawDailyRate = dailyRateInput.trim();
		const dailyRate = Number(rawDailyRate);
		if (!rawDailyRate || !Number.isFinite(dailyRate) || dailyRate < 0) {
			toast.error("กรุณากรอกค่าแรงปกติเป็นตัวเลขที่ไม่ติดลบก่อน Check-in");
			return;
		}
		const travelCost = travelCostInput.trim() ? Number(travelCostInput) : 0;
		const foodCost = foodCostInput.trim() ? Number(foodCostInput) : 0;
		const otherIncome = otherIncomeInput.trim() ? Number(otherIncomeInput) : 0;
		const otherDeductions = otherDeductionsInput.trim() ? Number(otherDeductionsInput) : 0;
		onCheckIn({
			workType,
			locationName: locationName.trim() || gps.addressName || "ไม่ได้ระบุสถานที่",
			gps,
			photo,
			rates: {
				...form,
				dailyRate,
				travelCost: Number.isFinite(travelCost) ? travelCost : 0,
				foodCost: Number.isFinite(foodCost) ? foodCost : 0,
				otherIncome: Number.isFinite(otherIncome) ? otherIncome : 0,
				otherDeductions: Number.isFinite(otherDeductions) ? otherDeductions : 0
			},
			tasks: []
		});
		setTaskInput("");
		resetPhoto();
	};
	const doCheckOut = async () => {
		if (!active || gpsLoading) return;
		const checkoutGPS = await fetchGPS();
		if (!checkoutGPS) {
			toast.error("ยังบันทึก Check-out ไม่ได้", { description: "ไม่พบพิกัด GPS ณ เวลาจบงาน กรุณาเปิดสิทธิ์ตำแหน่งแล้วลองใหม่" });
			return;
		}
		onCheckOut(checkoutGPS, photo);
		setTaskInput("");
		resetPhoto();
	};
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
				className: `surface-card flex flex-col items-center justify-between gap-4 p-5 md:flex-row ${active ? "work-active-card" : ""}`,
				children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "flex w-full items-center gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(StatusMotion, { running: !!active }, void 0, false, {
						fileName: _jsxFileName$10,
						lineNumber: 289,
						columnNumber: 11
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "text-base font-bold md:text-lg",
							"data-testid": "status-title",
							children: active ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
									"aria-hidden": true,
									className: "flex h-4 items-end gap-[2px]",
									"data-testid": "working-animation",
									children: [
										/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { className: "work-bar block h-3 w-[3px] rounded-full bg-success [animation-delay:0ms]" }, void 0, false, {
											fileName: _jsxFileName$10,
											lineNumber: 300,
											columnNumber: 21
										}, this),
										/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { className: "work-bar block h-4 w-[3px] rounded-full bg-success [animation-delay:150ms]" }, void 0, false, {
											fileName: _jsxFileName$10,
											lineNumber: 301,
											columnNumber: 21
										}, this),
										/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { className: "work-bar block h-2.5 w-[3px] rounded-full bg-success [animation-delay:300ms]" }, void 0, false, {
											fileName: _jsxFileName$10,
											lineNumber: 302,
											columnNumber: 21
										}, this)
									]
								}, void 0, true, {
									fileName: _jsxFileName$10,
									lineNumber: 295,
									columnNumber: 19
								}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: ["กำลังทำงาน: ", /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
									className: "text-success",
									children: active.workType
								}, void 0, false, {
									fileName: _jsxFileName$10,
									lineNumber: 305,
									columnNumber: 33
								}, this)] }, void 0, true, {
									fileName: _jsxFileName$10,
									lineNumber: 304,
									columnNumber: 19
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName$10,
								lineNumber: 294,
								columnNumber: 17
							}, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
									className: "sleep-breathe inline-block text-muted-foreground",
									children: "😴"
								}, void 0, false, {
									fileName: _jsxFileName$10,
									lineNumber: 310,
									columnNumber: 19
								}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: "ยังไม่ได้ CHECK-IN 🥱" }, void 0, false, {
									fileName: _jsxFileName$10,
									lineNumber: 311,
									columnNumber: 19
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName$10,
								lineNumber: 309,
								columnNumber: 17
							}, this)
						}, void 0, false, {
							fileName: _jsxFileName$10,
							lineNumber: 292,
							columnNumber: 13
						}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
							className: "truncate text-xs text-muted-foreground md:text-sm",
							children: active ? `สถานที่: ${active.locationName} | Check-in เมื่อ ${new Date(active.checkInTime).toLocaleTimeString("th-TH", { hour12: false })}` : "พร้อมเริ่มงาน? กดปุ่ม ค้นหาตำแหน่ง เพื่อบันทึกพิกัดและเวลา แล้วกด Check-in"
						}, void 0, false, {
							fileName: _jsxFileName$10,
							lineNumber: 315,
							columnNumber: 13
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName$10,
						lineNumber: 291,
						columnNumber: 11
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName$10,
					lineNumber: 288,
					columnNumber: 9
				}, this), active ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "w-full rounded-xl border border-border bg-info-soft px-4 py-2 text-center md:w-auto",
					children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
						className: "flex items-center justify-center gap-2 text-xs font-medium text-primary",
						children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
							className: "work-blink h-2 w-2 rounded-full bg-success",
							"aria-hidden": true
						}, void 0, false, {
							fileName: _jsxFileName$10,
							lineNumber: 325,
							columnNumber: 15
						}, this), "เวลาทำงาน (รวมพัก)"]
					}, void 0, true, {
						fileName: _jsxFileName$10,
						lineNumber: 324,
						columnNumber: 13
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
						className: "text-xl font-bold text-primary tabular-nums",
						"data-testid": "active-timer",
						children: formatDuration(elapsed)
					}, void 0, false, {
						fileName: _jsxFileName$10,
						lineNumber: 328,
						columnNumber: 13
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName$10,
					lineNumber: 323,
					columnNumber: 11
				}, this) : null]
			}, void 0, true, {
				fileName: _jsxFileName$10,
				lineNumber: 283,
				columnNumber: 7
			}, this),
			active ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
				className: "surface-card flex flex-wrap items-end gap-3 p-4",
				children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "min-w-[220px] flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("label", {
						htmlFor: "editCheckInTime",
						className: "mb-1 block text-xs font-semibold text-muted-foreground",
						children: "แก้ไขเวลาเข้างาน"
					}, void 0, false, {
						fileName: _jsxFileName$10,
						lineNumber: 341,
						columnNumber: 13
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("input", {
						id: "editCheckInTime",
						type: "datetime-local",
						"data-testid": "edit-checkin-time",
						value: toLocalInput(active.checkInTime),
						onChange: (e) => {
							const iso = fromLocalInput(e.target.value);
							if (iso) onEditActiveTime(iso);
						},
						className: "w-full rounded-lg border border-input bg-secondary p-2.5 text-sm"
					}, void 0, false, {
						fileName: _jsxFileName$10,
						lineNumber: 347,
						columnNumber: 13
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName$10,
					lineNumber: 340,
					columnNumber: 11
				}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
					className: "text-xs text-muted-foreground",
					children: "ปรับเวลาให้ตรงกับเวลาเริ่มงานจริงได้ ตัวจับเวลาจะคำนวณใหม่ทันที"
				}, void 0, false, {
					fileName: _jsxFileName$10,
					lineNumber: 359,
					columnNumber: 11
				}, this)]
			}, void 0, true, {
				fileName: _jsxFileName$10,
				lineNumber: 339,
				columnNumber: 9
			}, this) : null,
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
				className: "surface-card space-y-6 p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "grid grid-cols-1 gap-4 md:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "mb-1 flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("label", {
								htmlFor: "workType",
								className: "text-xs font-semibold text-muted-foreground",
								children: "ประเภทงาน / ชื่องาน"
							}, void 0, false, {
								fileName: _jsxFileName$10,
								lineNumber: 370,
								columnNumber: 15
							}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
								onClick: () => setCatOpen(true),
								className: "flex items-center gap-1 text-xs text-primary hover:underline",
								children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Settings2, { className: "h-3.5 w-3.5" }, void 0, false, {
									fileName: _jsxFileName$10,
									lineNumber: 377,
									columnNumber: 17
								}, this), " จัดการประเภทงาน"]
							}, void 0, true, {
								fileName: _jsxFileName$10,
								lineNumber: 373,
								columnNumber: 15
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName$10,
							lineNumber: 369,
							columnNumber: 13
						}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("select", {
							id: "workType",
							value: workType,
							disabled: !!active,
							onChange: (e) => setWorkType(e.target.value),
							className: "w-full rounded-lg border border-input bg-secondary p-2.5 text-sm disabled:opacity-60",
							children: categories.map((c) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("option", {
								value: c,
								children: c
							}, c, false, {
								fileName: _jsxFileName$10,
								lineNumber: 388,
								columnNumber: 17
							}, this))
						}, void 0, false, {
							fileName: _jsxFileName$10,
							lineNumber: 380,
							columnNumber: 13
						}, this)] }, void 0, true, {
							fileName: _jsxFileName$10,
							lineNumber: 368,
							columnNumber: 11
						}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
								className: "mb-1 flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("label", {
									htmlFor: "locationName",
									className: "text-xs font-semibold text-muted-foreground",
									children: "สถานที่ทำงาน / ไซต์งาน"
								}, void 0, false, {
									fileName: _jsxFileName$10,
									lineNumber: 397,
									columnNumber: 15
								}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("a", {
									href: gps.lat && gps.lng ? `https://www.google.com/maps/search/?api=1&query=${gps.lat},${gps.lng}` : "https://www.google.com/maps",
									target: "_blank",
									rel: "noreferrer",
									className: "flex items-center gap-1 text-xs font-medium text-success hover:underline",
									children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(MapPin, { className: "h-3.5 w-3.5" }, void 0, false, {
										fileName: _jsxFileName$10,
										lineNumber: 410,
										columnNumber: 17
									}, this), " เปิด Google Maps"]
								}, void 0, true, {
									fileName: _jsxFileName$10,
									lineNumber: 400,
									columnNumber: 15
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName$10,
								lineNumber: 396,
								columnNumber: 13
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("input", {
								id: "locationName",
								value: locationName,
								disabled: !!active,
								onChange: (e) => handleLocationChange(e.target.value),
								placeholder: "พิมพ์สถานที่ หรือ วางลิงก์ Google Maps",
								className: "w-full rounded-lg border border-input bg-secondary p-2.5 text-sm disabled:opacity-60"
							}, void 0, false, {
								fileName: _jsxFileName$10,
								lineNumber: 413,
								columnNumber: 13
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
								className: "mt-2 rounded-xl border border-border bg-secondary/60 p-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
										className: "flex items-center justify-between gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
											className: "flex min-w-0 items-center gap-1.5 text-xs font-semibold text-muted-foreground",
											children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(LocateFixed, { className: "h-4 w-4 shrink-0 text-primary" }, void 0, false, {
												fileName: _jsxFileName$10,
												lineNumber: 424,
												columnNumber: 19
											}, this), " ตำแหน่งปัจจุบัน"]
										}, void 0, true, {
											fileName: _jsxFileName$10,
											lineNumber: 423,
											columnNumber: 17
										}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
											onClick: () => void fetchGPS(),
											disabled: gpsLoading,
											title: "ค้นหาตำแหน่งปัจจุบัน",
											"aria-label": "ค้นหาตำแหน่งปัจจุบัน",
											className: "flex shrink-0 items-center gap-1.5 rounded-lg bg-accent px-2.5 py-1.5 text-xs font-medium text-primary transition active:scale-95 disabled:opacity-60",
											children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Crosshair, { className: `h-4 w-4 ${gpsLoading ? "animate-spin" : ""}` }, void 0, false, {
												fileName: _jsxFileName$10,
												lineNumber: 433,
												columnNumber: 19
											}, this), gpsLoading ? "กำลังค้นหา…" : "ค้นหาตำแหน่ง"]
										}, void 0, true, {
											fileName: _jsxFileName$10,
											lineNumber: 426,
											columnNumber: 17
										}, this)]
									}, void 0, true, {
										fileName: _jsxFileName$10,
										lineNumber: 422,
										columnNumber: 15
									}, this),
									/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
										className: "mt-1.5 font-mono text-sm font-semibold break-words text-primary",
										"data-testid": "gps-text",
										children: gps.text
									}, void 0, false, {
										fileName: _jsxFileName$10,
										lineNumber: 437,
										columnNumber: 15
									}, this),
									gps.addressName ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
										className: "mt-1 text-xs text-muted-foreground",
										children: gps.addressName
									}, void 0, false, {
										fileName: _jsxFileName$10,
										lineNumber: 444,
										columnNumber: 17
									}, this) : null
								]
							}, void 0, true, {
								fileName: _jsxFileName$10,
								lineNumber: 421,
								columnNumber: 13
							}, this),
							quickLocations.length > 0 ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
								className: "mt-2 flex flex-wrap items-center gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
									className: "text-[10px] font-medium text-muted-foreground",
									children: "ใช้บ่อย:"
								}, void 0, false, {
									fileName: _jsxFileName$10,
									lineNumber: 450,
									columnNumber: 17
								}, this), quickLocations.map((loc) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
									onClick: () => setLocationName(loc),
									className: "rounded border border-border bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground hover:bg-accent hover:text-primary",
									children: loc
								}, loc, false, {
									fileName: _jsxFileName$10,
									lineNumber: 452,
									columnNumber: 19
								}, this))]
							}, void 0, true, {
								fileName: _jsxFileName$10,
								lineNumber: 449,
								columnNumber: 15
							}, this) : null
						] }, void 0, true, {
							fileName: _jsxFileName$10,
							lineNumber: 395,
							columnNumber: 11
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName$10,
						lineNumber: 367,
						columnNumber: 9
					}, this),
					active ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "space-y-3 rounded-xl border border-border bg-secondary/60 p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h3", {
									className: "text-xs font-bold tracking-wider text-muted-foreground uppercase",
									children: "งานที่ทำเสร็จในกะที่กำลังทำอยู่"
								}, void 0, false, {
									fileName: _jsxFileName$10,
									lineNumber: 469,
									columnNumber: 15
								}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
									className: "rounded-full bg-info-soft px-2.5 py-0.5 text-xs font-bold text-primary",
									"data-testid": "task-count",
									children: [tasks.length, " งาน"]
								}, void 0, true, {
									fileName: _jsxFileName$10,
									lineNumber: 472,
									columnNumber: 15
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName$10,
								lineNumber: 468,
								columnNumber: 13
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
								className: "flex gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("input", {
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
								}, void 0, false, {
									fileName: _jsxFileName$10,
									lineNumber: 480,
									columnNumber: 15
								}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
									onClick: addTask,
									"data-testid": "task-add",
									className: "flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground",
									children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(ListPlus, { className: "h-4 w-4" }, void 0, false, {
										fileName: _jsxFileName$10,
										lineNumber: 499,
										columnNumber: 17
									}, this), " เพิ่ม"]
								}, void 0, true, {
									fileName: _jsxFileName$10,
									lineNumber: 494,
									columnNumber: 15
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName$10,
								lineNumber: 479,
								columnNumber: 13
							}, this),
							tasks.length === 0 ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
								className: "text-xs text-muted-foreground",
								children: "ยังไม่มีรายการงาน — เพิ่มงานที่ทำเสร็จระหว่างกะนี้ได้เลย"
							}, void 0, false, {
								fileName: _jsxFileName$10,
								lineNumber: 503,
								columnNumber: 15
							}, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("ol", {
								className: "space-y-1.5",
								"data-testid": "task-list",
								children: tasks.map((t, i) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("li", {
									className: "flex items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm",
									children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
										className: "min-w-0 truncate",
										children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
											className: "mr-2 text-xs font-bold text-muted-foreground",
											children: [i + 1, "."]
										}, void 0, true, {
											fileName: _jsxFileName$10,
											lineNumber: 514,
											columnNumber: 23
										}, this), t]
									}, void 0, true, {
										fileName: _jsxFileName$10,
										lineNumber: 513,
										columnNumber: 21
									}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
										onClick: () => setTasks(tasks.filter((_, idx) => idx !== i)),
										"aria-label": `ลบงาน ${t}`,
										className: "shrink-0 text-muted-foreground hover:text-destructive",
										children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(X, { className: "h-4 w-4" }, void 0, false, {
											fileName: _jsxFileName$10,
											lineNumber: 522,
											columnNumber: 23
										}, this)
									}, void 0, false, {
										fileName: _jsxFileName$10,
										lineNumber: 517,
										columnNumber: 21
									}, this)]
								}, `${t}-${i}`, true, {
									fileName: _jsxFileName$10,
									lineNumber: 509,
									columnNumber: 19
								}, this))
							}, void 0, false, {
								fileName: _jsxFileName$10,
								lineNumber: 507,
								columnNumber: 15
							}, this)
						]
					}, void 0, true, {
						fileName: _jsxFileName$10,
						lineNumber: 467,
						columnNumber: 11
					}, this) : null,
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "space-y-4 rounded-xl border border-border bg-secondary/60 p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h3", {
								className: "text-xs font-bold tracking-wider text-muted-foreground uppercase",
								children: "การคำนวณค่าแรง & OT & รายรับ-รายหัก"
							}, void 0, false, {
								fileName: _jsxFileName$10,
								lineNumber: 533,
								columnNumber: 11
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
								className: "grid grid-cols-1 gap-3 md:grid-cols-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Field$1, {
										label: "ค่าแรงปกติ (บาท/วัน)",
										id: "dailyRate",
										children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("input", {
											id: "dailyRate",
											type: "number",
											min: "0",
											value: dailyRateInput,
											disabled: !!active,
											onChange: (e) => {
												const raw = e.target.value;
												setDailyRateInput(raw);
												if (raw === "") {
													setForm({
														...form,
														dailyRate: 0
													});
													return;
												}
												const dailyRate = Number(raw);
												if (Number.isFinite(dailyRate)) setForm({
													...form,
													dailyRate
												});
											},
											className: inputCls$1
										}, void 0, false, {
											fileName: _jsxFileName$10,
											lineNumber: 538,
											columnNumber: 15
										}, this)
									}, void 0, false, {
										fileName: _jsxFileName$10,
										lineNumber: 537,
										columnNumber: 13
									}, this),
									/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Field$1, {
										label: "ประเภท OT (ตัวคูณ)",
										id: "otType",
										children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("select", {
											id: "otType",
											value: form.otType,
											disabled: !!active,
											onChange: (e) => setForm({
												...form,
												otType: Number(e.target.value)
											}),
											className: inputCls$1,
											children: OT_OPTIONS.map((o) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("option", {
												value: o.value,
												children: o.label
											}, o.value, false, {
												fileName: _jsxFileName$10,
												lineNumber: 569,
												columnNumber: 19
											}, this))
										}, void 0, false, {
											fileName: _jsxFileName$10,
											lineNumber: 561,
											columnNumber: 15
										}, this)
									}, void 0, false, {
										fileName: _jsxFileName$10,
										lineNumber: 560,
										columnNumber: 13
									}, this),
									/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Field$1, {
										label: "การหักพักกลางวัน",
										id: "breakInfo",
										children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
											className: "flex h-[38px] items-center rounded-lg border border-border bg-info-soft px-2 text-xs font-medium text-primary",
											children: "หักเวลาพัก 1 ชม. อัตโนมัติ"
										}, void 0, false, {
											fileName: _jsxFileName$10,
											lineNumber: 576,
											columnNumber: 15
										}, this)
									}, void 0, false, {
										fileName: _jsxFileName$10,
										lineNumber: 575,
										columnNumber: 13
									}, this)
								]
							}, void 0, true, {
								fileName: _jsxFileName$10,
								lineNumber: 536,
								columnNumber: 11
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
								className: "grid grid-cols-2 gap-3 border-t border-border pt-3 md:grid-cols-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Field$1, {
										label: "ค่าเดินทาง (บาท)",
										id: "travelCost",
										children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("input", {
											id: "travelCost",
											type: "number",
											min: "0",
											step: "any",
											placeholder: "0",
											value: travelCostInput,
											disabled: !!active,
											onChange: (e) => {
												const val = e.target.value;
												setTravelCostInput(val);
												const n = Number(val);
												setForm((f) => ({
													...f,
													travelCost: Number.isFinite(n) && val !== "" ? n : 0
												}));
											},
											className: inputCls$1
										}, void 0, false, {
											fileName: _jsxFileName$10,
											lineNumber: 583,
											columnNumber: 15
										}, this)
									}, void 0, false, {
										fileName: _jsxFileName$10,
										lineNumber: 582,
										columnNumber: 13
									}, this),
									/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Field$1, {
										label: "ค่าอาหาร/เบี้ยเลี้ยง (บาท)",
										id: "foodCost",
										children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("input", {
											id: "foodCost",
											type: "number",
											min: "0",
											step: "any",
											placeholder: "0",
											value: foodCostInput,
											disabled: !!active,
											onChange: (e) => {
												const val = e.target.value;
												setFoodCostInput(val);
												const n = Number(val);
												setForm((f) => ({
													...f,
													foodCost: Number.isFinite(n) && val !== "" ? n : 0
												}));
											},
											className: inputCls$1
										}, void 0, false, {
											fileName: _jsxFileName$10,
											lineNumber: 601,
											columnNumber: 15
										}, this)
									}, void 0, false, {
										fileName: _jsxFileName$10,
										lineNumber: 600,
										columnNumber: 13
									}, this),
									/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Field$1, {
										label: "รายรับอื่นๆ (บาท)",
										id: "otherIncome",
										children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("input", {
											id: "otherIncome",
											type: "number",
											min: "0",
											step: "any",
											placeholder: "0",
											value: otherIncomeInput,
											disabled: !!active,
											onChange: (e) => {
												const val = e.target.value;
												setOtherIncomeInput(val);
												const n = Number(val);
												setForm((f) => ({
													...f,
													otherIncome: Number.isFinite(n) && val !== "" ? n : 0
												}));
											},
											className: `${inputCls$1} text-success`
										}, void 0, false, {
											fileName: _jsxFileName$10,
											lineNumber: 619,
											columnNumber: 15
										}, this)
									}, void 0, false, {
										fileName: _jsxFileName$10,
										lineNumber: 618,
										columnNumber: 13
									}, this),
									/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Field$1, {
										label: "รายการหักอื่นๆ (บาท)",
										id: "otherDeductions",
										children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("input", {
											id: "otherDeductions",
											type: "number",
											min: "0",
											step: "any",
											placeholder: "0",
											value: otherDeductionsInput,
											disabled: !!active,
											onChange: (e) => {
												const val = e.target.value;
												setOtherDeductionsInput(val);
												const n = Number(val);
												setForm((f) => ({
													...f,
													otherDeductions: Number.isFinite(n) && val !== "" ? n : 0
												}));
											},
											className: `${inputCls$1} text-destructive`
										}, void 0, false, {
											fileName: _jsxFileName$10,
											lineNumber: 640,
											columnNumber: 15
										}, this)
									}, void 0, false, {
										fileName: _jsxFileName$10,
										lineNumber: 639,
										columnNumber: 13
									}, this)
								]
							}, void 0, true, {
								fileName: _jsxFileName$10,
								lineNumber: 581,
								columnNumber: 11
							}, this)
						]
					}, void 0, true, {
						fileName: _jsxFileName$10,
						lineNumber: 532,
						columnNumber: 9
					}, this),
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "grid grid-cols-1 gap-4",
						children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "rounded-xl border-2 border-dashed border-border p-4 text-center",
							children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("input", {
								ref: fileRef,
								id: "imageInput",
								type: "file",
								accept: "image/*",
								capture: "environment",
								className: "hidden",
								onChange: onPhoto
							}, void 0, false, {
								fileName: _jsxFileName$10,
								lineNumber: 666,
								columnNumber: 13
							}, this), photo ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
								className: "flex flex-col items-center",
								children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("img", {
									src: photo,
									alt: "รูปหลักฐาน",
									className: "mb-2 h-32 rounded-lg object-cover"
								}, void 0, false, {
									fileName: _jsxFileName$10,
									lineNumber: 677,
									columnNumber: 17
								}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
									onClick: resetPhoto,
									className: "flex items-center gap-1 text-xs text-destructive",
									children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(X, { className: "h-3.5 w-3.5" }, void 0, false, {
										fileName: _jsxFileName$10,
										lineNumber: 682,
										columnNumber: 19
									}, this), " ลบรูป"]
								}, void 0, true, {
									fileName: _jsxFileName$10,
									lineNumber: 678,
									columnNumber: 17
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName$10,
								lineNumber: 676,
								columnNumber: 15
							}, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
								onClick: () => fileRef.current?.click(),
								className: "flex w-full flex-col items-center gap-2 py-4 text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Camera, { className: "h-7 w-7" }, void 0, false, {
									fileName: _jsxFileName$10,
									lineNumber: 690,
									columnNumber: 17
								}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
									className: "text-xs font-medium",
									children: "ถ่ายรูป / แนบรูปหลักฐาน (ไม่บังคับ)"
								}, void 0, false, {
									fileName: _jsxFileName$10,
									lineNumber: 691,
									columnNumber: 17
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName$10,
								lineNumber: 686,
								columnNumber: 15
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName$10,
							lineNumber: 665,
							columnNumber: 11
						}, this)
					}, void 0, false, {
						fileName: _jsxFileName$10,
						lineNumber: 664,
						columnNumber: 9
					}, this),
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "grid grid-cols-1 gap-3 md:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
							onClick: doCheckIn,
							disabled: !!active,
							className: "flex items-center justify-center gap-2 rounded-xl bg-success py-4 text-lg font-bold text-success-foreground shadow-lg transition active:scale-95 disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none",
							children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(LogIn, { className: "h-5 w-5" }, void 0, false, {
								fileName: _jsxFileName$10,
								lineNumber: 704,
								columnNumber: 13
							}, this), " Check-in เริ่มงาน"]
						}, void 0, true, {
							fileName: _jsxFileName$10,
							lineNumber: 699,
							columnNumber: 11
						}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
							onClick: () => void doCheckOut(),
							disabled: !active || gpsLoading,
							className: "flex items-center justify-center gap-2 rounded-xl bg-destructive py-4 text-lg font-bold text-destructive-foreground shadow-lg transition active:scale-95 disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none",
							children: [
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(LogOut, { className: "h-5 w-5" }, void 0, false, {
									fileName: _jsxFileName$10,
									lineNumber: 711,
									columnNumber: 13
								}, this),
								" ",
								gpsLoading ? "กำลังบันทึกพิกัด…" : "Check-out จบงาน"
							]
						}, void 0, true, {
							fileName: _jsxFileName$10,
							lineNumber: 706,
							columnNumber: 11
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName$10,
						lineNumber: 698,
						columnNumber: 9
					}, this),
					active ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
						onClick: onCancelActive,
						className: "w-full text-xs text-muted-foreground hover:text-destructive hover:underline",
						children: "ยกเลิกการ Check-in นี้ (ไม่บันทึก)"
					}, void 0, false, {
						fileName: _jsxFileName$10,
						lineNumber: 715,
						columnNumber: 11
					}, this) : null
				]
			}, void 0, true, {
				fileName: _jsxFileName$10,
				lineNumber: 366,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(CategoryDialog, {
				open: catOpen,
				categories,
				onSave: onSaveCategories,
				onClose: () => setCatOpen(false)
			}, void 0, false, {
				fileName: _jsxFileName$10,
				lineNumber: 724,
				columnNumber: 7
			}, this)
		]
	}, void 0, true, {
		fileName: _jsxFileName$10,
		lineNumber: 281,
		columnNumber: 5
	}, this);
}
/**
* Visual "engine running" vs "resting" indicator next to the shift status.
* Running: spinning gear + pumping piston. Idle: breathing sleeper with Z's.
*/
function StatusMotion({ running }) {
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
		"aria-hidden": true,
		"data-testid": running ? "engine-animation" : "resting-animation",
		className: `relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${running ? "work-pulse-ring bg-success-soft text-success" : "rest-halo bg-destructive-soft text-destructive"}`,
		children: running ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(EngineWorkingAnimation, {
			size: "md",
			label: "กำลังทำงาน",
			decorative: true,
			className: "engine-working--status"
		}, void 0, false, {
			fileName: _jsxFileName$10,
			lineNumber: 750,
			columnNumber: 9
		}, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(import_jsx_dev_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(BedDouble, { className: "sleep-breathe h-7 w-7" }, void 0, false, {
				fileName: _jsxFileName$10,
				lineNumber: 758,
				columnNumber: 11
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
				className: "sleep-z absolute -top-1 right-0 text-xs font-black [animation-delay:0ms]",
				children: "z"
			}, void 0, false, {
				fileName: _jsxFileName$10,
				lineNumber: 759,
				columnNumber: 11
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
				className: "sleep-z absolute -top-1 right-1 text-[11px] font-black [animation-delay:900ms]",
				children: "z"
			}, void 0, false, {
				fileName: _jsxFileName$10,
				lineNumber: 762,
				columnNumber: 11
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
				className: "sleep-z absolute -top-1 right-2 text-[9px] font-black [animation-delay:1800ms]",
				children: "z"
			}, void 0, false, {
				fileName: _jsxFileName$10,
				lineNumber: 765,
				columnNumber: 11
			}, this)
		] }, void 0, true, {
			fileName: _jsxFileName$10,
			lineNumber: 757,
			columnNumber: 9
		}, this)
	}, void 0, false, {
		fileName: _jsxFileName$10,
		lineNumber: 740,
		columnNumber: 5
	}, this);
}
var inputCls$1 = "w-full rounded-lg border border-input bg-card p-2 text-sm font-medium disabled:opacity-60";
function Field$1({ label, id, children }) {
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("label", {
		htmlFor: id,
		className: "mb-1 block text-xs text-muted-foreground",
		children: label
	}, void 0, false, {
		fileName: _jsxFileName$10,
		lineNumber: 780,
		columnNumber: 7
	}, this), children] }, void 0, true, {
		fileName: _jsxFileName$10,
		lineNumber: 779,
		columnNumber: 5
	}, this);
}
var _jsxFileName$9 = "/app/applet/src/lib/dashboard-card-content.tsx";
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
var DEFAULT_CHART_COLORS = [
	"#60a5fa",
	"#34d399",
	"#fbbf24",
	"#f87171",
	"#a78bfa"
];
function renderDashboardCardContent(id, summary, chartColors = DEFAULT_CHART_COLORS) {
	const colors = chartColors.length ? chartColors : DEFAULT_CHART_COLORS;
	switch (id) {
		case "net-income": return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
			className: "flex h-full min-h-24 flex-col items-center justify-center rounded-xl bg-secondary/60 p-4 text-center sm:p-5",
			children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
				className: "flex w-full items-center justify-center gap-1.5 whitespace-nowrap text-center text-xs leading-5 text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Coins, { className: "h-4 w-4" }, void 0, false, {
					fileName: _jsxFileName$9,
					lineNumber: 42,
					columnNumber: 13
				}, this), "รายได้สุทธิรวม"]
			}, void 0, true, {
				fileName: _jsxFileName$9,
				lineNumber: 41,
				columnNumber: 11
			}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
				className: "mt-2 w-full text-center text-3xl leading-tight font-bold text-success sm:text-4xl",
				"data-testid": "stat-net",
				children: formatTHB(summary.totalNet)
			}, void 0, false, {
				fileName: _jsxFileName$9,
				lineNumber: 45,
				columnNumber: 11
			}, this)]
		}, void 0, true, {
			fileName: _jsxFileName$9,
			lineNumber: 40,
			columnNumber: 9
		}, this);
		case "work-days": return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Stat, {
			compact: true,
			icon: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(CalendarCheck, { className: "h-4 w-4" }, void 0, false, {
				fileName: _jsxFileName$9,
				lineNumber: 57,
				columnNumber: 17
			}, this),
			label: "วันทำงานทั้งหมด",
			value: `${summary.workDays} วัน`,
			testId: "stat-days"
		}, void 0, false, {
			fileName: _jsxFileName$9,
			lineNumber: 55,
			columnNumber: 9
		}, this);
		case "days-with-ot": return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Stat, {
			compact: true,
			icon: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(TrendingUp, { className: "h-4 w-4" }, void 0, false, {
				fileName: _jsxFileName$9,
				lineNumber: 67,
				columnNumber: 17
			}, this),
			label: "วันที่มี OT",
			value: `${summary.daysWithOt} วัน`,
			testId: "stat-days-with-ot"
		}, void 0, false, {
			fileName: _jsxFileName$9,
			lineNumber: 65,
			columnNumber: 9
		}, this);
		case "days-without-ot": return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Stat, {
			compact: true,
			icon: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(CalendarCheck, { className: "h-4 w-4" }, void 0, false, {
				fileName: _jsxFileName$9,
				lineNumber: 77,
				columnNumber: 17
			}, this),
			label: "วันที่ไม่มี OT",
			value: `${summary.daysWithoutOt} วัน`,
			testId: "stat-days-without-ot"
		}, void 0, false, {
			fileName: _jsxFileName$9,
			lineNumber: 75,
			columnNumber: 9
		}, this);
		case "tasks": return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Stat, {
			compact: true,
			icon: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(ListChecks, { className: "h-4 w-4" }, void 0, false, {
				fileName: _jsxFileName$9,
				lineNumber: 87,
				columnNumber: 17
			}, this),
			label: "งานที่ทำเสร็จ",
			value: `${summary.totalTasks} งาน`,
			testId: "stat-tasks"
		}, void 0, false, {
			fileName: _jsxFileName$9,
			lineNumber: 85,
			columnNumber: 9
		}, this);
		case "tasks-average": return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Stat, {
			compact: true,
			icon: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(ListChecks, { className: "h-4 w-4" }, void 0, false, {
				fileName: _jsxFileName$9,
				lineNumber: 97,
				columnNumber: 17
			}, this),
			label: "เฉลี่ยต่อวัน",
			value: `${summary.avgTasksPerDay} งาน/วัน`,
			testId: "stat-tasks-avg"
		}, void 0, false, {
			fileName: _jsxFileName$9,
			lineNumber: 95,
			columnNumber: 9
		}, this);
		case "hours": return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Stat, {
			compact: true,
			icon: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Clock, { className: "h-4 w-4" }, void 0, false, {
				fileName: _jsxFileName$9,
				lineNumber: 107,
				columnNumber: 17
			}, this),
			label: "ชั่วโมงรวม",
			value: `${summary.totalHours.toFixed(1)} ชม.`,
			testId: "stat-hours"
		}, void 0, false, {
			fileName: _jsxFileName$9,
			lineNumber: 105,
			columnNumber: 9
		}, this);
		case "ot-income": return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Stat, {
			compact: true,
			icon: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(TrendingUp, { className: "h-4 w-4" }, void 0, false, {
				fileName: _jsxFileName$9,
				lineNumber: 117,
				columnNumber: 17
			}, this),
			label: `OT ${summary.totalOtHours.toFixed(1)} ชม.`,
			value: formatTHB(summary.totalOtIncome),
			testId: "stat-ot"
		}, void 0, false, {
			fileName: _jsxFileName$9,
			lineNumber: 115,
			columnNumber: 9
		}, this);
		case "allowance": return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Stat, {
			compact: true,
			icon: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Coins, { className: "h-4 w-4" }, void 0, false, {
				fileName: _jsxFileName$9,
				lineNumber: 127,
				columnNumber: 17
			}, this),
			label: "เบี้ยเลี้ยง/รายรับอื่น",
			value: formatTHB(summary.totalAllowances),
			testId: "stat-allowance"
		}, void 0, false, {
			fileName: _jsxFileName$9,
			lineNumber: 125,
			columnNumber: 9
		}, this);
		case "deductions": return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Stat, {
			compact: true,
			icon: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(CircleMinus, { className: "h-4 w-4" }, void 0, false, {
				fileName: _jsxFileName$9,
				lineNumber: 137,
				columnNumber: 17
			}, this),
			label: "รายการหักรวม",
			value: formatTHB(summary.totalDeductions),
			testId: "stat-deduction",
			tone: "destructive"
		}, void 0, false, {
			fileName: _jsxFileName$9,
			lineNumber: 135,
			columnNumber: 9
		}, this);
		case "daily-income": return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(ChartCard, {
			title: "รายได้รายวัน",
			children: summary.dailyIncome.length === 0 ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Empty, {}, void 0, false, {
				fileName: _jsxFileName$9,
				lineNumber: 148,
				columnNumber: 13
			}, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(ResponsiveContainer, {
				width: "100%",
				height: "100%",
				children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(BarChart, {
					data: summary.dailyIncome,
					children: [
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(XAxis, {
							dataKey: "label",
							tick: axisTick,
							tickLine: false,
							axisLine: false
						}, void 0, false, {
							fileName: _jsxFileName$9,
							lineNumber: 152,
							columnNumber: 17
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(YAxis, {
							tick: axisTick,
							tickLine: false,
							axisLine: false,
							width: 44
						}, void 0, false, {
							fileName: _jsxFileName$9,
							lineNumber: 153,
							columnNumber: 17
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Tooltip, {
							contentStyle: tooltipStyle,
							cursor: tooltipCursor,
							formatter: (value) => formatTHB(value)
						}, void 0, false, {
							fileName: _jsxFileName$9,
							lineNumber: 154,
							columnNumber: 17
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Bar, {
							dataKey: "value",
							fill: colors[0],
							radius: [
								6,
								6,
								0,
								0
							]
						}, void 0, false, {
							fileName: _jsxFileName$9,
							lineNumber: 159,
							columnNumber: 17
						}, this)
					]
				}, void 0, true, {
					fileName: _jsxFileName$9,
					lineNumber: 151,
					columnNumber: 15
				}, this)
			}, void 0, false, {
				fileName: _jsxFileName$9,
				lineNumber: 150,
				columnNumber: 13
			}, this)
		}, void 0, false, {
			fileName: _jsxFileName$9,
			lineNumber: 146,
			columnNumber: 9
		}, this);
		case "daily-tasks": return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(ChartCard, {
			title: "จำนวนงานที่ทำเสร็จรายวัน",
			children: summary.dailyTasks.length === 0 ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Empty, {}, void 0, false, {
				fileName: _jsxFileName$9,
				lineNumber: 169,
				columnNumber: 13
			}, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(ResponsiveContainer, {
				width: "100%",
				height: "100%",
				children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(BarChart, {
					data: summary.dailyTasks,
					children: [
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(XAxis, {
							dataKey: "label",
							tick: axisTick,
							tickLine: false,
							axisLine: false
						}, void 0, false, {
							fileName: _jsxFileName$9,
							lineNumber: 173,
							columnNumber: 17
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(YAxis, {
							tick: axisTick,
							tickLine: false,
							axisLine: false,
							width: 30,
							allowDecimals: false
						}, void 0, false, {
							fileName: _jsxFileName$9,
							lineNumber: 174,
							columnNumber: 17
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Tooltip, {
							contentStyle: tooltipStyle,
							cursor: tooltipCursor,
							formatter: (value) => `${value} งาน`
						}, void 0, false, {
							fileName: _jsxFileName$9,
							lineNumber: 181,
							columnNumber: 17
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Bar, {
							dataKey: "value",
							fill: colors[2],
							radius: [
								6,
								6,
								0,
								0
							]
						}, void 0, false, {
							fileName: _jsxFileName$9,
							lineNumber: 186,
							columnNumber: 17
						}, this)
					]
				}, void 0, true, {
					fileName: _jsxFileName$9,
					lineNumber: 172,
					columnNumber: 15
				}, this)
			}, void 0, false, {
				fileName: _jsxFileName$9,
				lineNumber: 171,
				columnNumber: 13
			}, this)
		}, void 0, false, {
			fileName: _jsxFileName$9,
			lineNumber: 167,
			columnNumber: 9
		}, this);
		case "work-type-income": return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(ChartCard, {
			title: "สัดส่วนรายได้ตามประเภทงาน",
			children: summary.byWorkType.length === 0 ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Empty, {}, void 0, false, {
				fileName: _jsxFileName$9,
				lineNumber: 196,
				columnNumber: 13
			}, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(ResponsiveContainer, {
				width: "100%",
				height: "100%",
				children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(PieChart, { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Pie, {
					data: summary.byWorkType,
					dataKey: "value",
					nameKey: "name",
					outerRadius: 80,
					stroke: "var(--card)",
					label: {
						fill: "var(--foreground)",
						fontSize: 11
					},
					children: summary.byWorkType.map((_, index) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Cell, { fill: colors[index % colors.length] }, index, false, {
						fileName: _jsxFileName$9,
						lineNumber: 209,
						columnNumber: 21
					}, this))
				}, void 0, false, {
					fileName: _jsxFileName$9,
					lineNumber: 200,
					columnNumber: 17
				}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Tooltip, {
					contentStyle: tooltipStyle,
					cursor: tooltipCursor,
					formatter: (value) => formatTHB(value)
				}, void 0, false, {
					fileName: _jsxFileName$9,
					lineNumber: 212,
					columnNumber: 17
				}, this)] }, void 0, true, {
					fileName: _jsxFileName$9,
					lineNumber: 199,
					columnNumber: 15
				}, this)
			}, void 0, false, {
				fileName: _jsxFileName$9,
				lineNumber: 198,
				columnNumber: 13
			}, this)
		}, void 0, false, {
			fileName: _jsxFileName$9,
			lineNumber: 194,
			columnNumber: 9
		}, this);
		case "frequent-location": return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(ChartCard, {
			title: "สถานที่ทำงานบ่อยที่สุด (ครั้ง)",
			children: summary.byLocation.length === 0 ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Empty, {}, void 0, false, {
				fileName: _jsxFileName$9,
				lineNumber: 226,
				columnNumber: 13
			}, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(ResponsiveContainer, {
				width: "100%",
				height: "100%",
				children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(BarChart, {
					data: summary.byLocation,
					layout: "vertical",
					children: [
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(XAxis, {
							type: "number",
							tick: axisTick,
							allowDecimals: false
						}, void 0, false, {
							fileName: _jsxFileName$9,
							lineNumber: 230,
							columnNumber: 17
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(YAxis, {
							type: "category",
							dataKey: "name",
							width: 90,
							tick: axisTick
						}, void 0, false, {
							fileName: _jsxFileName$9,
							lineNumber: 231,
							columnNumber: 17
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Tooltip, {
							contentStyle: tooltipStyle,
							cursor: tooltipCursor
						}, void 0, false, {
							fileName: _jsxFileName$9,
							lineNumber: 232,
							columnNumber: 17
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Bar, {
							dataKey: "value",
							fill: colors[1],
							radius: [
								0,
								6,
								6,
								0
							]
						}, void 0, false, {
							fileName: _jsxFileName$9,
							lineNumber: 233,
							columnNumber: 17
						}, this)
					]
				}, void 0, true, {
					fileName: _jsxFileName$9,
					lineNumber: 229,
					columnNumber: 15
				}, this)
			}, void 0, false, {
				fileName: _jsxFileName$9,
				lineNumber: 228,
				columnNumber: 13
			}, this)
		}, void 0, false, {
			fileName: _jsxFileName$9,
			lineNumber: 224,
			columnNumber: 9
		}, this);
	}
}
function ChartCard({ title, children }) {
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
		className: "surface-card flex h-full min-h-0 min-w-0 flex-col items-center justify-center overflow-visible p-5 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h3", {
			className: "mb-3 w-full shrink-0 whitespace-nowrap text-center text-sm font-bold",
			children: title
		}, void 0, false, {
			fileName: _jsxFileName$9,
			lineNumber: 245,
			columnNumber: 7
		}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
			className: "min-h-0 w-full min-w-0 flex-1 overflow-visible",
			children
		}, void 0, false, {
			fileName: _jsxFileName$9,
			lineNumber: 248,
			columnNumber: 7
		}, this)]
	}, void 0, true, {
		fileName: _jsxFileName$9,
		lineNumber: 244,
		columnNumber: 5
	}, this);
}
function Stat({ icon, label, value, testId, tone, compact = false }) {
	const toneCls = tone === "success" ? "text-success" : tone === "destructive" ? "text-destructive" : "text-foreground";
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
		className: `surface-card flex h-full min-w-0 flex-col items-center justify-center text-center ${compact ? "p-3" : "p-4"}`,
		children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
			className: "flex w-full min-w-0 items-center justify-center gap-1.5 text-center text-xs leading-5 text-muted-foreground",
			children: [icon, /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
				className: "max-w-full whitespace-nowrap",
				children: label
			}, void 0, false, {
				fileName: _jsxFileName$9,
				lineNumber: 280,
				columnNumber: 9
			}, this)]
		}, void 0, true, {
			fileName: _jsxFileName$9,
			lineNumber: 278,
			columnNumber: 7
		}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
			className: `mt-2 w-full text-center text-xl leading-tight font-bold ${toneCls}`,
			"data-testid": testId,
			children: value
		}, void 0, false, {
			fileName: _jsxFileName$9,
			lineNumber: 282,
			columnNumber: 7
		}, this)]
	}, void 0, true, {
		fileName: _jsxFileName$9,
		lineNumber: 275,
		columnNumber: 5
	}, this);
}
function Empty() {
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
		className: "w-full py-10 text-center text-xs text-muted-foreground",
		children: "ไม่มีข้อมูลในเดือนที่เลือก"
	}, void 0, false, {
		fileName: _jsxFileName$9,
		lineNumber: 294,
		columnNumber: 5
	}, this);
}
var _jsxFileName$8 = "/app/applet/src/components/work/DashboardPanel.tsx";
function DashboardPanel({ logs, layoutState, chartColors, month, onMonthChange, spreadsheetId, syncing, onRefresh }) {
	const summary = summarizeMonth(logs, month);
	const colors = chartColors?.length ? chartColors : DEFAULT_CHART_COLORS;
	const { layout, viewport, loading: layoutLoading } = layoutState;
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
		className: "space-y-5",
		"data-dashboard-viewport": viewport,
		"data-dashboard-layout-loading": layoutLoading ? "true" : "false",
		"aria-busy": layoutLoading,
		children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("section", {
			className: "surface-card mx-auto w-full p-4 sm:p-5",
			children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("header", {
				className: "flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-start sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h2", {
						className: "font-bold",
						children: "สรุปรายเดือน"
					}, void 0, false, {
						fileName: _jsxFileName$8,
						lineNumber: 43,
						columnNumber: 13
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
						className: "text-xs text-muted-foreground",
						children: spreadsheetId ? syncing ? "กำลังดึงข้อมูลจาก Google Sheets…" : "ข้อมูลดึงจาก Google Sheets" : "ยังไม่ได้เชื่อมต่อ Google Sheets — แสดงข้อมูลในเครื่อง"
					}, void 0, false, {
						fileName: _jsxFileName$8,
						lineNumber: 44,
						columnNumber: 13
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName$8,
					lineNumber: 42,
					columnNumber: 11
				}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DashboardControls, {
					spreadsheetId,
					syncing,
					onRefresh,
					month,
					onMonthChange
				}, void 0, false, {
					fileName: _jsxFileName$8,
					lineNumber: 52,
					columnNumber: 11
				}, this)]
			}, void 0, true, {
				fileName: _jsxFileName$8,
				lineNumber: 41,
				columnNumber: 9
			}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
				className: "mt-5 grid grid-cols-2 items-stretch gap-2 sm:gap-3 md:grid-cols-6",
				"data-dashboard-reflow": "true",
				children: [...layout.cards].sort(compareReflowPosition$1).map((card) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DashboardCard, {
					card,
					viewport,
					children: renderDashboardCardContent(card.id, summary, colors)
				}, card.id, false, {
					fileName: _jsxFileName$8,
					lineNumber: 66,
					columnNumber: 13
				}, this))
			}, void 0, false, {
				fileName: _jsxFileName$8,
				lineNumber: 61,
				columnNumber: 9
			}, this)]
		}, void 0, true, {
			fileName: _jsxFileName$8,
			lineNumber: 40,
			columnNumber: 7
		}, this)
	}, void 0, false, {
		fileName: _jsxFileName$8,
		lineNumber: 34,
		columnNumber: 5
	}, this);
}
function DashboardCard({ card, viewport, children }) {
	const columns = viewport === "mobile" ? 2 : 6;
	const width = getGridSpan$1(card, viewport);
	const height = getCardHeight$1(card);
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("article", {
		className: "relative min-h-0 min-w-0",
		"data-dashboard-card-id": card.id,
		"data-dashboard-card-group": card.group,
		"data-testid": `dashboard-card-${card.id}`,
		style: {
			height: `${height}px`,
			gridColumn: `span ${Math.min(width, columns)} / span ${Math.min(width, columns)}`
		},
		children
	}, void 0, false, {
		fileName: _jsxFileName$8,
		lineNumber: 90,
		columnNumber: 5
	}, this);
}
function getGridSpan$1(card, viewport) {
	if (card.group === "net") return viewport === "mobile" ? 2 : 6;
	if (card.group === "charts") return (viewport === "mobile" ? 2 : 3) * clamp$1(card.width, 1, viewport === "mobile" ? 1 : 2);
	return (viewport === "mobile" ? 1 : 2) * clamp$1(card.width, 1, viewport === "mobile" ? 2 : 3);
}
function getCardHeight$1(card) {
	const baseHeight = card.group === "charts" ? 260 : card.group === "net" ? 104 : 92;
	const maximum = card.group === "charts" ? 6 : 4;
	return baseHeight * clamp$1(card.height, 1, maximum);
}
function compareReflowPosition$1(a, b) {
	const y = a.y - b.y;
	if (Math.abs(y) > .01) return y;
	const x = a.x - b.x;
	if (Math.abs(x) > .01) return x;
	if (a.group !== b.group) return groupRank$1(a.group) - groupRank$1(b.group);
	return a.order - b.order;
}
function groupRank$1(group) {
	return group === "net" ? 0 : group === "work" ? 1 : group === "income" ? 2 : 3;
}
function clamp$1(value, min, max) {
	return Math.min(Math.max(value, min), max);
}
function DashboardControls({ spreadsheetId, syncing, onRefresh, month, onMonthChange }) {
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
		className: "flex w-full flex-wrap items-center justify-start gap-2 sm:w-auto sm:justify-end",
		children: [spreadsheetId ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
			type: "button",
			onClick: onRefresh,
			disabled: syncing,
			"data-testid": "dashboard-refresh",
			className: "flex items-center justify-center gap-1.5 rounded-lg border border-input bg-secondary px-3 py-2 text-xs font-medium transition hover:bg-accent disabled:opacity-60",
			children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(RefreshCw, { className: `h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}` }, void 0, false, {
				fileName: _jsxFileName$8,
				lineNumber: 161,
				columnNumber: 11
			}, this), "รีเฟรชจากชีต"]
		}, void 0, true, {
			fileName: _jsxFileName$8,
			lineNumber: 154,
			columnNumber: 9
		}, this) : null, /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("input", {
			type: "month",
			"aria-label": "เลือกเดือน",
			value: month,
			onChange: (e) => onMonthChange(e.target.value),
			className: "min-w-0 rounded-lg border border-input bg-secondary p-2 text-sm font-medium sm:w-auto"
		}, void 0, false, {
			fileName: _jsxFileName$8,
			lineNumber: 165,
			columnNumber: 7
		}, this)]
	}, void 0, true, {
		fileName: _jsxFileName$8,
		lineNumber: 152,
		columnNumber: 5
	}, this);
}
var _jsxFileName$7 = "/app/applet/src/components/work/HistoryPanel.tsx";
var emptyDraft = {
	inAt: "",
	outAt: "",
	workType: "",
	locationName: "",
	dailyRate: "",
	otType: "1.5",
	travelCost: "",
	foodCost: "",
	otherIncome: "",
	otherDeductions: "",
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
	const [taskSelection, setTaskSelection] = (0, import_react.useState)("");
	const startEdit = (log) => {
		setEditing(log.id);
		setTaskSelection("");
		setDraft({
			inAt: toLocalInput(log.checkInTime),
			outAt: toLocalInput(log.checkOutTime),
			workType: log.workType ?? "",
			locationName: log.locationName ?? "",
			dailyRate: log.dailyRate !== void 0 && log.dailyRate !== null ? String(log.dailyRate) : "",
			otType: String(log.otType ?? 1.5),
			travelCost: log.travelCost ? String(log.travelCost) : "",
			foodCost: log.foodCost ? String(log.foodCost) : "",
			otherIncome: log.otherIncome ? String(log.otherIncome) : "",
			otherDeductions: log.otherDeductions ? String(log.otherDeductions) : "",
			gpsIn: gpsText(log.checkInGPS) === "-" ? "" : gpsText(log.checkInGPS),
			gpsOut: gpsText(log.checkOutGPS) === "-" ? "" : gpsText(log.checkOutGPS),
			tasks: (log.tasks ?? []).join("\n")
		});
	};
	const taskItems = draft.tasks.split("\n").map((task) => task.trim()).filter(Boolean);
	const taskOptions = [.../* @__PURE__ */ new Set([...categories.filter(Boolean), ...taskItems])];
	const addTask = () => {
		const task = taskSelection.trim();
		if (!task) return;
		setDraft({
			...draft,
			tasks: [...taskItems, task].join("\n")
		});
		setTaskSelection("");
	};
	const removeTask = (index) => {
		setDraft({
			...draft,
			tasks: taskItems.filter((_, taskIndex) => taskIndex !== index).join("\n")
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
			tasks: taskItems
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
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
				className: "surface-card flex flex-wrap items-center justify-between gap-3 p-4",
				children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h2", {
					className: "font-bold",
					children: "ประวัติการทำงาน"
				}, void 0, false, {
					fileName: _jsxFileName$7,
					lineNumber: 207,
					columnNumber: 11
				}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
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
				}, void 0, true, {
					fileName: _jsxFileName$7,
					lineNumber: 208,
					columnNumber: 11
				}, this)] }, void 0, true, {
					fileName: _jsxFileName$7,
					lineNumber: 206,
					columnNumber: 9
				}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("select", {
							"aria-label": "เลือกเดือน",
							value: month,
							onChange: (e) => setMonth(e.target.value),
							className: "rounded-lg border border-input bg-secondary px-3 py-2 text-xs font-medium",
							children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("option", {
								value: "all",
								children: [
									"ทุกเดือน · ",
									logs.length,
									" รายการ"
								]
							}, void 0, true, {
								fileName: _jsxFileName$7,
								lineNumber: 220,
								columnNumber: 13
							}, this), months.map((m) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("option", {
								value: m,
								children: [
									monthLabel(m),
									" ·",
									" ",
									logs.filter((l) => String(l.checkInTime ?? "").startsWith(m)).length,
									" รายการ"
								]
							}, m, true, {
								fileName: _jsxFileName$7,
								lineNumber: 222,
								columnNumber: 15
							}, this))]
						}, void 0, true, {
							fileName: _jsxFileName$7,
							lineNumber: 214,
							columnNumber: 11
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
							onClick: onSync,
							disabled: syncing,
							className: "flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground disabled:bg-muted disabled:text-muted-foreground",
							children: [
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(CloudUpload, { className: "h-4 w-4" }, void 0, false, {
									fileName: _jsxFileName$7,
									lineNumber: 233,
									columnNumber: 13
								}, this),
								" ",
								syncing ? "กำลังซิงก์…" : "ส่งขึ้นชีต"
							]
						}, void 0, true, {
							fileName: _jsxFileName$7,
							lineNumber: 228,
							columnNumber: 11
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
							onClick: onPull,
							disabled: syncing,
							className: "flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium disabled:opacity-50",
							children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(CloudDownload, { className: "h-4 w-4" }, void 0, false, {
								fileName: _jsxFileName$7,
								lineNumber: 240,
								columnNumber: 13
							}, this), " ดึงจากชีต"]
						}, void 0, true, {
							fileName: _jsxFileName$7,
							lineNumber: 235,
							columnNumber: 11
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
							onClick: exportCSV,
							disabled: logs.length === 0,
							className: "flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium disabled:opacity-50",
							children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Download, { className: "h-4 w-4" }, void 0, false, {
								fileName: _jsxFileName$7,
								lineNumber: 247,
								columnNumber: 13
							}, this), " CSV"]
						}, void 0, true, {
							fileName: _jsxFileName$7,
							lineNumber: 242,
							columnNumber: 11
						}, this)
					]
				}, void 0, true, {
					fileName: _jsxFileName$7,
					lineNumber: 213,
					columnNumber: 9
				}, this)]
			}, void 0, true, {
				fileName: _jsxFileName$7,
				lineNumber: 205,
				columnNumber: 7
			}, this),
			visibleLogs.length === 0 ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
				className: "surface-card p-10 text-center text-sm text-muted-foreground",
				children: logs.length === 0 ? "ยังไม่มีประวัติการทำงาน" : "ไม่มีรายการในเดือนที่เลือก"
			}, void 0, false, {
				fileName: _jsxFileName$7,
				lineNumber: 253,
				columnNumber: 9
			}, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
				className: "space-y-3",
				"data-testid": "logs-container",
				children: visibleLogs.map((log) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("article", {
					className: "surface-card overflow-hidden p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "flex items-start justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
								className: "min-w-0",
								children: [
									/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
										className: "flex flex-wrap items-center gap-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h3", {
												className: "font-semibold",
												children: log.workType
											}, void 0, false, {
												fileName: _jsxFileName$7,
												lineNumber: 263,
												columnNumber: 21
											}, this),
											/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
												className: "rounded-full bg-info-soft px-2 py-0.5 text-[10px] font-bold text-primary",
												children: [taskCount(log), " งาน"]
											}, void 0, true, {
												fileName: _jsxFileName$7,
												lineNumber: 264,
												columnNumber: 21
											}, this),
											/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
												className: `rounded-full px-2 py-0.5 text-[10px] font-medium ${log.syncedAt ? "bg-success-soft text-success" : "bg-muted text-muted-foreground"}`,
												children: log.syncedAt ? "ซิงก์แล้ว" : "รอซิงก์"
											}, void 0, false, {
												fileName: _jsxFileName$7,
												lineNumber: 267,
												columnNumber: 21
											}, this)
										]
									}, void 0, true, {
										fileName: _jsxFileName$7,
										lineNumber: 262,
										columnNumber: 19
									}, this),
									/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
										className: "mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground",
										children: [
											/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(MapPin, { className: "h-3.5 w-3.5" }, void 0, false, {
												fileName: _jsxFileName$7,
												lineNumber: 278,
												columnNumber: 21
											}, this),
											" ",
											log.locationName
										]
									}, void 0, true, {
										fileName: _jsxFileName$7,
										lineNumber: 277,
										columnNumber: 19
									}, this),
									/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
										className: "mt-1 text-xs text-muted-foreground",
										children: [
											formatThaiDateTime(log.checkInTime),
											" → ",
											formatThaiDateTime(log.checkOutTime)
										]
									}, void 0, true, {
										fileName: _jsxFileName$7,
										lineNumber: 280,
										columnNumber: 19
									}, this)
								]
							}, void 0, true, {
								fileName: _jsxFileName$7,
								lineNumber: 261,
								columnNumber: 17
							}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
								className: "text-right",
								children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
									className: "text-lg font-bold text-success",
									children: formatTHB(log.netIncome)
								}, void 0, false, {
									fileName: _jsxFileName$7,
									lineNumber: 285,
									columnNumber: 19
								}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
									className: "mt-1 flex items-center justify-end gap-3",
									children: editing === log.id ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(import_jsx_dev_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
										onClick: () => saveEdit(log.id),
										className: "inline-flex items-center gap-1 text-xs text-success hover:underline",
										children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Check, { className: "h-3.5 w-3.5" }, void 0, false, {
											fileName: _jsxFileName$7,
											lineNumber: 293,
											columnNumber: 27
										}, this), " บันทึก"]
									}, void 0, true, {
										fileName: _jsxFileName$7,
										lineNumber: 289,
										columnNumber: 25
									}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
										onClick: () => setEditing(null),
										className: "inline-flex items-center gap-1 text-xs text-muted-foreground hover:underline",
										children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(X, { className: "h-3.5 w-3.5" }, void 0, false, {
											fileName: _jsxFileName$7,
											lineNumber: 299,
											columnNumber: 27
										}, this), " ยกเลิก"]
									}, void 0, true, {
										fileName: _jsxFileName$7,
										lineNumber: 295,
										columnNumber: 25
									}, this)] }, void 0, true, {
										fileName: _jsxFileName$7,
										lineNumber: 288,
										columnNumber: 23
									}, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(import_jsx_dev_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
										onClick: () => startEdit(log),
										"aria-label": `แก้ไขเวลา ${log.id}`,
										className: "inline-flex items-center gap-1 text-xs text-primary hover:underline",
										children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Pencil, { className: "h-3.5 w-3.5" }, void 0, false, {
											fileName: _jsxFileName$7,
											lineNumber: 309,
											columnNumber: 27
										}, this), " แก้ไข"]
									}, void 0, true, {
										fileName: _jsxFileName$7,
										lineNumber: 304,
										columnNumber: 25
									}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
										onClick: () => onDelete(log.id),
										"aria-label": `ลบรายการ ${log.id}`,
										className: "inline-flex items-center gap-1 text-xs text-destructive hover:underline",
										children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Trash2, { className: "h-3.5 w-3.5" }, void 0, false, {
											fileName: _jsxFileName$7,
											lineNumber: 316,
											columnNumber: 27
										}, this), " ลบ"]
									}, void 0, true, {
										fileName: _jsxFileName$7,
										lineNumber: 311,
										columnNumber: 25
									}, this)] }, void 0, true, {
										fileName: _jsxFileName$7,
										lineNumber: 303,
										columnNumber: 23
									}, this)
								}, void 0, false, {
									fileName: _jsxFileName$7,
									lineNumber: 286,
									columnNumber: 19
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName$7,
								lineNumber: 284,
								columnNumber: 17
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName$7,
							lineNumber: 260,
							columnNumber: 15
						}, this),
						editing === log.id ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "mt-4 space-y-4 rounded-xl border border-border bg-secondary/40 p-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("section", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h4", {
										className: "text-xs font-bold text-primary",
										children: "เวลาเข้างาน"
									}, void 0, false, {
										fileName: _jsxFileName$7,
										lineNumber: 327,
										columnNumber: 21
									}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
										className: "grid grid-cols-2 gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Field, {
											label: "วันที่เข้างาน",
											children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("input", {
												type: "date",
												"aria-label": "วันที่เข้างาน",
												value: datePart(draft.inAt),
												onChange: (e) => setDraft({
													...draft,
													inAt: joinDT(e.target.value, timePart(draft.inAt))
												}),
												className: inputCls
											}, void 0, false, {
												fileName: _jsxFileName$7,
												lineNumber: 330,
												columnNumber: 25
											}, this)
										}, void 0, false, {
											fileName: _jsxFileName$7,
											lineNumber: 329,
											columnNumber: 23
										}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Field, {
											label: "เวลาเข้างาน",
											children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("input", {
												type: "time",
												"aria-label": "เวลาเข้างาน",
												value: timePart(draft.inAt),
												onChange: (e) => setDraft({
													...draft,
													inAt: joinDT(datePart(draft.inAt), e.target.value)
												}),
												className: inputCls
											}, void 0, false, {
												fileName: _jsxFileName$7,
												lineNumber: 344,
												columnNumber: 25
											}, this)
										}, void 0, false, {
											fileName: _jsxFileName$7,
											lineNumber: 343,
											columnNumber: 23
										}, this)]
									}, void 0, true, {
										fileName: _jsxFileName$7,
										lineNumber: 328,
										columnNumber: 21
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName$7,
									lineNumber: 326,
									columnNumber: 19
								}, this),
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("section", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h4", {
										className: "text-xs font-bold text-primary",
										children: "เวลาออกงาน"
									}, void 0, false, {
										fileName: _jsxFileName$7,
										lineNumber: 361,
										columnNumber: 21
									}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
										className: "grid grid-cols-2 gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Field, {
											label: "วันที่ออกงาน",
											children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("input", {
												type: "date",
												"aria-label": "วันที่ออกงาน",
												value: datePart(draft.outAt),
												onChange: (e) => setDraft({
													...draft,
													outAt: joinDT(e.target.value, timePart(draft.outAt))
												}),
												className: inputCls
											}, void 0, false, {
												fileName: _jsxFileName$7,
												lineNumber: 364,
												columnNumber: 25
											}, this)
										}, void 0, false, {
											fileName: _jsxFileName$7,
											lineNumber: 363,
											columnNumber: 23
										}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Field, {
											label: "เวลาออกงาน",
											children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("input", {
												type: "time",
												"aria-label": "เวลาออกงาน",
												value: timePart(draft.outAt),
												onChange: (e) => setDraft({
													...draft,
													outAt: joinDT(datePart(draft.outAt), e.target.value)
												}),
												className: inputCls
											}, void 0, false, {
												fileName: _jsxFileName$7,
												lineNumber: 378,
												columnNumber: 25
											}, this)
										}, void 0, false, {
											fileName: _jsxFileName$7,
											lineNumber: 377,
											columnNumber: 23
										}, this)]
									}, void 0, true, {
										fileName: _jsxFileName$7,
										lineNumber: 362,
										columnNumber: 21
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName$7,
									lineNumber: 360,
									columnNumber: 19
								}, this),
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("section", {
									className: "space-y-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h4", {
											className: "text-xs font-bold text-primary",
											children: "งานและสถานที่"
										}, void 0, false, {
											fileName: _jsxFileName$7,
											lineNumber: 395,
											columnNumber: 21
										}, this),
										/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Field, {
											label: "ประเภทงาน",
											children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("select", {
												"aria-label": "ประเภทงาน",
												value: draft.workType,
												onChange: (e) => setDraft({
													...draft,
													workType: e.target.value
												}),
												className: inputCls,
												children: (categories.includes(draft.workType) || !draft.workType ? categories : [draft.workType, ...categories]).map((c) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("option", {
													value: c,
													children: c
												}, c, false, {
													fileName: _jsxFileName$7,
													lineNumber: 407,
													columnNumber: 27
												}, this))
											}, void 0, false, {
												fileName: _jsxFileName$7,
												lineNumber: 397,
												columnNumber: 23
											}, this)
										}, void 0, false, {
											fileName: _jsxFileName$7,
											lineNumber: 396,
											columnNumber: 21
										}, this),
										/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Field, {
											label: "สถานที่",
											children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("input", {
												"aria-label": "สถานที่",
												value: draft.locationName,
												onChange: (e) => setDraft({
													...draft,
													locationName: e.target.value
												}),
												className: inputCls
											}, void 0, false, {
												fileName: _jsxFileName$7,
												lineNumber: 414,
												columnNumber: 23
											}, this)
										}, void 0, false, {
											fileName: _jsxFileName$7,
											lineNumber: 413,
											columnNumber: 21
										}, this)
									]
								}, void 0, true, {
									fileName: _jsxFileName$7,
									lineNumber: 394,
									columnNumber: 19
								}, this),
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("section", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h4", {
										className: "text-xs font-bold text-primary",
										children: "ค่าแรงและเบี้ยเลี้ยง"
									}, void 0, false, {
										fileName: _jsxFileName$7,
										lineNumber: 424,
										columnNumber: 21
									}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
										className: "grid grid-cols-2 gap-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Field, {
												label: "ค่าแรง/วัน (บาท)",
												children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("input", {
													type: "number",
													inputMode: "decimal",
													min: "0",
													step: "any",
													placeholder: "0",
													"aria-label": "ค่าแรงต่อวัน",
													value: draft.dailyRate,
													onChange: (e) => setDraft({
														...draft,
														dailyRate: e.target.value
													}),
													className: inputCls
												}, void 0, false, {
													fileName: _jsxFileName$7,
													lineNumber: 427,
													columnNumber: 25
												}, this)
											}, void 0, false, {
												fileName: _jsxFileName$7,
												lineNumber: 426,
												columnNumber: 23
											}, this),
											/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Field, {
												label: "ตัวคูณ OT",
												children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("select", {
													"aria-label": "ตัวคูณ OT",
													value: draft.otType,
													onChange: (e) => setDraft({
														...draft,
														otType: e.target.value
													}),
													className: inputCls,
													children: OT_OPTIONS.map((o) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("option", {
														value: o.value,
														children: o.label
													}, o.value, false, {
														fileName: _jsxFileName$7,
														lineNumber: 447,
														columnNumber: 29
													}, this))
												}, void 0, false, {
													fileName: _jsxFileName$7,
													lineNumber: 440,
													columnNumber: 25
												}, this)
											}, void 0, false, {
												fileName: _jsxFileName$7,
												lineNumber: 439,
												columnNumber: 23
											}, this),
											/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Field, {
												label: "ค่าเดินทาง",
												children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("input", {
													type: "number",
													inputMode: "decimal",
													min: "0",
													step: "any",
													placeholder: "0",
													"aria-label": "ค่าเดินทาง",
													value: draft.travelCost,
													onChange: (e) => setDraft({
														...draft,
														travelCost: e.target.value
													}),
													className: inputCls
												}, void 0, false, {
													fileName: _jsxFileName$7,
													lineNumber: 454,
													columnNumber: 25
												}, this)
											}, void 0, false, {
												fileName: _jsxFileName$7,
												lineNumber: 453,
												columnNumber: 23
											}, this),
											/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Field, {
												label: "ค่าอาหาร",
												children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("input", {
													type: "number",
													inputMode: "decimal",
													min: "0",
													step: "any",
													placeholder: "0",
													"aria-label": "ค่าอาหาร",
													value: draft.foodCost,
													onChange: (e) => setDraft({
														...draft,
														foodCost: e.target.value
													}),
													className: inputCls
												}, void 0, false, {
													fileName: _jsxFileName$7,
													lineNumber: 467,
													columnNumber: 25
												}, this)
											}, void 0, false, {
												fileName: _jsxFileName$7,
												lineNumber: 466,
												columnNumber: 23
											}, this),
											/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Field, {
												label: "รายรับอื่น",
												children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("input", {
													type: "number",
													inputMode: "decimal",
													min: "0",
													step: "any",
													placeholder: "0",
													"aria-label": "รายรับอื่น",
													value: draft.otherIncome,
													onChange: (e) => setDraft({
														...draft,
														otherIncome: e.target.value
													}),
													className: inputCls
												}, void 0, false, {
													fileName: _jsxFileName$7,
													lineNumber: 480,
													columnNumber: 25
												}, this)
											}, void 0, false, {
												fileName: _jsxFileName$7,
												lineNumber: 479,
												columnNumber: 23
											}, this),
											/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Field, {
												label: "รายการหัก",
												children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("input", {
													type: "number",
													inputMode: "decimal",
													min: "0",
													step: "any",
													placeholder: "0",
													"aria-label": "รายการหัก",
													value: draft.otherDeductions,
													onChange: (e) => setDraft({
														...draft,
														otherDeductions: e.target.value
													}),
													className: inputCls
												}, void 0, false, {
													fileName: _jsxFileName$7,
													lineNumber: 493,
													columnNumber: 25
												}, this)
											}, void 0, false, {
												fileName: _jsxFileName$7,
												lineNumber: 492,
												columnNumber: 23
											}, this)
										]
									}, void 0, true, {
										fileName: _jsxFileName$7,
										lineNumber: 425,
										columnNumber: 21
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName$7,
									lineNumber: 423,
									columnNumber: 19
								}, this),
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("section", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h4", {
										className: "text-xs font-bold text-primary",
										children: "พิกัด"
									}, void 0, false, {
										fileName: _jsxFileName$7,
										lineNumber: 509,
										columnNumber: 21
									}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
										className: "grid grid-cols-2 gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Field, {
											label: "พิกัดเข้า (lat, lng)",
											children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("input", {
												"aria-label": "พิกัดเข้า",
												value: draft.gpsIn,
												placeholder: "13.7563, 100.5018",
												onChange: (e) => setDraft({
													...draft,
													gpsIn: e.target.value
												}),
												className: inputCls
											}, void 0, false, {
												fileName: _jsxFileName$7,
												lineNumber: 512,
												columnNumber: 25
											}, this)
										}, void 0, false, {
											fileName: _jsxFileName$7,
											lineNumber: 511,
											columnNumber: 23
										}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Field, {
											label: "พิกัดออก (lat, lng)",
											children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("input", {
												"aria-label": "พิกัดออก",
												value: draft.gpsOut,
												placeholder: "13.7563, 100.5018",
												onChange: (e) => setDraft({
													...draft,
													gpsOut: e.target.value
												}),
												className: inputCls
											}, void 0, false, {
												fileName: _jsxFileName$7,
												lineNumber: 521,
												columnNumber: 25
											}, this)
										}, void 0, false, {
											fileName: _jsxFileName$7,
											lineNumber: 520,
											columnNumber: 23
										}, this)]
									}, void 0, true, {
										fileName: _jsxFileName$7,
										lineNumber: 510,
										columnNumber: 21
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName$7,
									lineNumber: 508,
									columnNumber: 19
								}, this),
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("section", {
									className: "space-y-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h4", {
											className: "text-xs font-bold text-primary",
											children: "รายการงานที่ทำเสร็จ"
										}, void 0, false, {
											fileName: _jsxFileName$7,
											lineNumber: 533,
											columnNumber: 21
										}, this),
										/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Field, {
											label: "เลือกจากประเภทงาน",
											children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
												className: "flex gap-2",
												children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("select", {
													"aria-label": "เลือกประเภทงานที่ทำเสร็จ",
													value: taskSelection,
													onChange: (e) => setTaskSelection(e.target.value),
													className: `${inputCls} flex-1`,
													children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("option", {
														value: "",
														children: "เลือกประเภทงาน"
													}, void 0, false, {
														fileName: _jsxFileName$7,
														lineNumber: 542,
														columnNumber: 27
													}, this), taskOptions.map((task) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("option", {
														value: task,
														children: task
													}, task, false, {
														fileName: _jsxFileName$7,
														lineNumber: 544,
														columnNumber: 29
													}, this))]
												}, void 0, true, {
													fileName: _jsxFileName$7,
													lineNumber: 536,
													columnNumber: 25
												}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
													type: "button",
													onClick: addTask,
													disabled: !taskSelection,
													className: "rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50",
													children: "เพิ่ม"
												}, void 0, false, {
													fileName: _jsxFileName$7,
													lineNumber: 549,
													columnNumber: 25
												}, this)]
											}, void 0, true, {
												fileName: _jsxFileName$7,
												lineNumber: 535,
												columnNumber: 23
											}, this)
										}, void 0, false, {
											fileName: _jsxFileName$7,
											lineNumber: 534,
											columnNumber: 21
										}, this),
										taskItems.length > 0 ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("ol", {
											className: "space-y-1.5 rounded-lg border border-border bg-card p-2 text-sm",
											children: taskItems.map((task, index) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("li", {
												className: "flex items-center justify-between gap-2 rounded-md border border-border/70 px-2 py-1.5",
												children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
													className: "min-w-0 truncate",
													children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
														className: "mr-2 text-xs font-bold text-muted-foreground",
														children: [index + 1, "."]
													}, void 0, true, {
														fileName: _jsxFileName$7,
														lineNumber: 567,
														columnNumber: 31
													}, this), task]
												}, void 0, true, {
													fileName: _jsxFileName$7,
													lineNumber: 566,
													columnNumber: 29
												}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
													type: "button",
													onClick: () => removeTask(index),
													"aria-label": `ลบรายการงาน ${task}`,
													className: "shrink-0 rounded-md px-2 py-1 text-xs font-medium text-destructive hover:bg-destructive/10",
													children: "ลบ"
												}, void 0, false, {
													fileName: _jsxFileName$7,
													lineNumber: 572,
													columnNumber: 29
												}, this)]
											}, `${task}-${index}`, true, {
												fileName: _jsxFileName$7,
												lineNumber: 562,
												columnNumber: 27
											}, this))
										}, void 0, false, {
											fileName: _jsxFileName$7,
											lineNumber: 560,
											columnNumber: 23
										}, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
											className: "text-xs text-muted-foreground",
											children: "ยังไม่มีรายการงาน — เลือกประเภทงานแล้วกดเพิ่ม"
										}, void 0, false, {
											fileName: _jsxFileName$7,
											lineNumber: 584,
											columnNumber: 23
										}, this)
									]
								}, void 0, true, {
									fileName: _jsxFileName$7,
									lineNumber: 532,
									columnNumber: 19
								}, this),
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
									className: "flex gap-2 pt-1",
									children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
										onClick: () => saveEdit(log.id),
										className: "flex-1 rounded-lg bg-primary py-2 text-xs font-medium text-primary-foreground",
										children: "บันทึกการแก้ไข"
									}, void 0, false, {
										fileName: _jsxFileName$7,
										lineNumber: 591,
										columnNumber: 21
									}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
										onClick: () => setEditing(null),
										className: "flex-1 rounded-lg border border-border py-2 text-xs font-medium",
										children: "ยกเลิก"
									}, void 0, false, {
										fileName: _jsxFileName$7,
										lineNumber: 597,
										columnNumber: 21
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName$7,
									lineNumber: 590,
									columnNumber: 19
								}, this)
							]
						}, void 0, true, {
							fileName: _jsxFileName$7,
							lineNumber: 325,
							columnNumber: 17
						}, this) : null,
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("dl", {
							className: "mt-3 grid grid-cols-2 gap-2 border-t border-border pt-3 text-xs md:grid-cols-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Cell$1, {
									label: "ชั่วโมงปกติ",
									value: `${log.workingHours} ชม.`
								}, void 0, false, {
									fileName: _jsxFileName$7,
									lineNumber: 608,
									columnNumber: 17
								}, this),
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Cell$1, {
									label: `OT x${log.otType}`,
									value: `${log.otHours} ชม.`
								}, void 0, false, {
									fileName: _jsxFileName$7,
									lineNumber: 609,
									columnNumber: 17
								}, this),
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Cell$1, {
									label: "ค่าแรง+OT",
									value: formatTHB(log.baseWage + log.otIncome)
								}, void 0, false, {
									fileName: _jsxFileName$7,
									lineNumber: 610,
									columnNumber: 17
								}, this),
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Cell$1, {
									label: "เบี้ยเลี้ยง/หัก",
									value: `${formatTHB(log.travelCost + log.foodCost + log.otherIncome)} / ${formatTHB(log.otherDeductions)}`
								}, void 0, false, {
									fileName: _jsxFileName$7,
									lineNumber: 611,
									columnNumber: 17
								}, this),
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Cell$1, {
									label: "พิกัดเข้า",
									value: gpsText(log.checkInGPS)
								}, void 0, false, {
									fileName: _jsxFileName$7,
									lineNumber: 615,
									columnNumber: 17
								}, this),
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Cell$1, {
									label: "พิกัดออก",
									value: gpsText(log.checkOutGPS)
								}, void 0, false, {
									fileName: _jsxFileName$7,
									lineNumber: 616,
									columnNumber: 17
								}, this)
							]
						}, void 0, true, {
							fileName: _jsxFileName$7,
							lineNumber: 607,
							columnNumber: 15
						}, this),
						(log.tasks ?? []).length > 0 ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("ol", {
							className: "mt-3 list-decimal space-y-0.5 border-t border-border pt-3 pl-5 text-xs text-muted-foreground",
							children: (log.tasks ?? []).map((t, i) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("li", { children: t }, `${t}-${i}`, false, {
								fileName: _jsxFileName$7,
								lineNumber: 622,
								columnNumber: 21
							}, this))
						}, void 0, false, {
							fileName: _jsxFileName$7,
							lineNumber: 620,
							columnNumber: 17
						}, this) : null,
						log.checkInPhoto || log.checkOutPhoto ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "mt-3 flex gap-2",
							children: [log.checkInPhoto ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("img", {
								src: log.checkInPhoto,
								alt: "หลักฐาน Check-in",
								className: "h-16 w-16 rounded-lg object-cover"
							}, void 0, false, {
								fileName: _jsxFileName$7,
								lineNumber: 630,
								columnNumber: 21
							}, this) : null, log.checkOutPhoto ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("img", {
								src: log.checkOutPhoto,
								alt: "หลักฐาน Check-out",
								className: "h-16 w-16 rounded-lg object-cover"
							}, void 0, false, {
								fileName: _jsxFileName$7,
								lineNumber: 637,
								columnNumber: 21
							}, this) : null]
						}, void 0, true, {
							fileName: _jsxFileName$7,
							lineNumber: 628,
							columnNumber: 17
						}, this) : null
					]
				}, log.id, true, {
					fileName: _jsxFileName$7,
					lineNumber: 259,
					columnNumber: 13
				}, this))
			}, void 0, false, {
				fileName: _jsxFileName$7,
				lineNumber: 257,
				columnNumber: 9
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("datalist", {
				id: "history-work-types",
				children: categories.map((c) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("option", { value: c }, c, false, {
					fileName: _jsxFileName$7,
					lineNumber: 651,
					columnNumber: 11
				}, this))
			}, void 0, false, {
				fileName: _jsxFileName$7,
				lineNumber: 649,
				columnNumber: 7
			}, this)
		]
	}, void 0, true, {
		fileName: _jsxFileName$7,
		lineNumber: 204,
		columnNumber: 5
	}, this);
}
function Cell$1({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("dt", {
		className: "text-[10px] text-muted-foreground",
		children: label
	}, void 0, false, {
		fileName: _jsxFileName$7,
		lineNumber: 661,
		columnNumber: 7
	}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("dd", {
		className: "font-medium",
		children: value
	}, void 0, false, {
		fileName: _jsxFileName$7,
		lineNumber: 662,
		columnNumber: 7
	}, this)] }, void 0, true, {
		fileName: _jsxFileName$7,
		lineNumber: 660,
		columnNumber: 5
	}, this);
}
var inputCls = "w-full rounded-lg border border-input bg-secondary p-1.5 text-xs";
function Field({ label, children }) {
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("label", {
		className: "block",
		children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
			className: "mb-0.5 block text-[10px] text-muted-foreground",
			children: label
		}, void 0, false, {
			fileName: _jsxFileName$7,
			lineNumber: 672,
			columnNumber: 7
		}, this), children]
	}, void 0, true, {
		fileName: _jsxFileName$7,
		lineNumber: 671,
		columnNumber: 5
	}, this);
}
var GOOGLE_PRESETS = [
	{
		id: "google-blue",
		name: "Google Classic Blue (น้ำเงินคลาสสิก)",
		nameEn: "Google Blue",
		primaryColor: "#1A73E8",
		accentColor: "#D2E3FC",
		light: {
			primaryColor: "#1A73E8",
			secondaryColor: "#E8F0FE",
			accentColor: "#D2E3FC",
			backgroundColor: "#F8FAFD",
			cardColor: "#FFFFFF",
			foregroundColor: "#202124",
			borderColor: "#DADCE0",
			successColor: "#188038",
			warningColor: "#B06000",
			destructiveColor: "#D93025",
			chartColors: [
				"#188038",
				"#1A73E8",
				"#B06000",
				"#D93025",
				"#8430CE"
			]
		},
		dark: {
			primaryColor: "#8AB4F8",
			secondaryColor: "#303134",
			accentColor: "#3C4043",
			backgroundColor: "#202124",
			cardColor: "#292A2D",
			foregroundColor: "#F8F9FA",
			borderColor: "#5F6368",
			successColor: "#81C995",
			warningColor: "#FDD663",
			destructiveColor: "#F28B82",
			chartColors: [
				"#81C995",
				"#8AB4F8",
				"#FDD663",
				"#F28B82",
				"#C58AF9"
			]
		}
	},
	{
		id: "google-green",
		name: "Google Emerald Green (เขียวชีต & ไดรฟ์)",
		nameEn: "Google Green",
		primaryColor: "#188038",
		accentColor: "#CEEAD6",
		light: {
			primaryColor: "#188038",
			secondaryColor: "#E6F4EA",
			accentColor: "#CEEAD6",
			backgroundColor: "#F8FAF8",
			cardColor: "#FFFFFF",
			foregroundColor: "#202124",
			borderColor: "#DADCE0",
			successColor: "#188038",
			warningColor: "#B06000",
			destructiveColor: "#D93025",
			chartColors: [
				"#188038",
				"#1A73E8",
				"#E37400",
				"#D93025",
				"#5E35B1"
			]
		},
		dark: {
			primaryColor: "#81C995",
			secondaryColor: "#28332A",
			accentColor: "#344437",
			backgroundColor: "#1E2420",
			cardColor: "#282D29",
			foregroundColor: "#F8F9FA",
			borderColor: "#546357",
			successColor: "#81C995",
			warningColor: "#FDD663",
			destructiveColor: "#F28B82",
			chartColors: [
				"#81C995",
				"#8AB4F8",
				"#FDD663",
				"#F28B82",
				"#C58AF9"
			]
		}
	},
	{
		id: "google-amber",
		name: "Google Amber Yellow (ส้มทองคีพ & ปฏิทิน)",
		nameEn: "Google Amber",
		primaryColor: "#E37400",
		accentColor: "#FEEFC3",
		light: {
			primaryColor: "#E37400",
			secondaryColor: "#FEF7E0",
			accentColor: "#FEEFC3",
			backgroundColor: "#FAF9F6",
			cardColor: "#FFFFFF",
			foregroundColor: "#202124",
			borderColor: "#DADCE0",
			successColor: "#188038",
			warningColor: "#B06000",
			destructiveColor: "#D93025",
			chartColors: [
				"#188038",
				"#E37400",
				"#1A73E8",
				"#D93025",
				"#8430CE"
			]
		},
		dark: {
			primaryColor: "#FDD663",
			secondaryColor: "#383222",
			accentColor: "#473F28",
			backgroundColor: "#24221D",
			cardColor: "#2D2B26",
			foregroundColor: "#F8F9FA",
			borderColor: "#665F4C",
			successColor: "#81C995",
			warningColor: "#FDD663",
			destructiveColor: "#F28B82",
			chartColors: [
				"#FDD663",
				"#8AB4F8",
				"#81C995",
				"#F28B82",
				"#C58AF9"
			]
		}
	},
	{
		id: "google-red",
		name: "Google Coral Red (แดงจีเมล & สดใส)",
		nameEn: "Google Red",
		primaryColor: "#D93025",
		accentColor: "#FAD2CF",
		light: {
			primaryColor: "#D93025",
			secondaryColor: "#FCE8E6",
			accentColor: "#FAD2CF",
			backgroundColor: "#FAF8F8",
			cardColor: "#FFFFFF",
			foregroundColor: "#202124",
			borderColor: "#DADCE0",
			successColor: "#188038",
			warningColor: "#B06000",
			destructiveColor: "#D93025",
			chartColors: [
				"#188038",
				"#D93025",
				"#1A73E8",
				"#E37400",
				"#7C4DFF"
			]
		},
		dark: {
			primaryColor: "#F28B82",
			secondaryColor: "#382626",
			accentColor: "#492F2F",
			backgroundColor: "#241E1E",
			cardColor: "#2E2828",
			foregroundColor: "#F8F9FA",
			borderColor: "#695252",
			successColor: "#81C995",
			warningColor: "#FDD663",
			destructiveColor: "#F28B82",
			chartColors: [
				"#F28B82",
				"#8AB4F8",
				"#81C995",
				"#FDD663",
				"#C58AF9"
			]
		}
	},
	{
		id: "google-violet",
		name: "Google Deep Violet (ม่วงฟอร์ม & คลาวด์)",
		nameEn: "Google Violet",
		primaryColor: "#7C4DFF",
		accentColor: "#E8D4FB",
		light: {
			primaryColor: "#7C4DFF",
			secondaryColor: "#F3E8FD",
			accentColor: "#E8D4FB",
			backgroundColor: "#F9F8FC",
			cardColor: "#FFFFFF",
			foregroundColor: "#202124",
			borderColor: "#DADCE0",
			successColor: "#188038",
			warningColor: "#B06000",
			destructiveColor: "#D93025",
			chartColors: [
				"#188038",
				"#7C4DFF",
				"#1A73E8",
				"#E37400",
				"#D93025"
			]
		},
		dark: {
			primaryColor: "#C58AF9",
			secondaryColor: "#33283D",
			accentColor: "#423252",
			backgroundColor: "#221E26",
			cardColor: "#2C2733",
			foregroundColor: "#F8F9FA",
			borderColor: "#615273",
			successColor: "#81C995",
			warningColor: "#FDD663",
			destructiveColor: "#F28B82",
			chartColors: [
				"#C58AF9",
				"#8AB4F8",
				"#81C995",
				"#FDD663",
				"#F28B82"
			]
		}
	},
	{
		id: "google-teal",
		name: "Google Teal Ocean (เขียวอมฟ้า & มีท)",
		nameEn: "Google Teal",
		primaryColor: "#00796B",
		accentColor: "#B2DFDB",
		light: {
			primaryColor: "#00796B",
			secondaryColor: "#E0F2F1",
			accentColor: "#B2DFDB",
			backgroundColor: "#F7FAFA",
			cardColor: "#FFFFFF",
			foregroundColor: "#202124",
			borderColor: "#DADCE0",
			successColor: "#188038",
			warningColor: "#B06000",
			destructiveColor: "#D93025",
			chartColors: [
				"#188038",
				"#00796B",
				"#1A73E8",
				"#E37400",
				"#8430CE"
			]
		},
		dark: {
			primaryColor: "#4DB6AC",
			secondaryColor: "#223331",
			accentColor: "#2C423F",
			backgroundColor: "#1C2423",
			cardColor: "#262E2D",
			foregroundColor: "#F8F9FA",
			borderColor: "#4F6360",
			successColor: "#81C995",
			warningColor: "#FDD663",
			destructiveColor: "#F28B82",
			chartColors: [
				"#4DB6AC",
				"#8AB4F8",
				"#81C995",
				"#FDD663",
				"#C58AF9"
			]
		}
	}
];
var DEFAULT_COLORS_LIGHT = {
	themeMode: "light",
	presetName: "google-blue",
	borderRadius: "normal",
	buttonStyle: "filled",
	density: "normal",
	backgroundColor: "#F8FAFD",
	cardColor: "#FFFFFF",
	foregroundColor: "#202124",
	borderColor: "#DADCE0",
	primaryColor: "#1A73E8",
	secondaryColor: "#E8F0FE",
	accentColor: "#D2E3FC",
	successColor: "#188038",
	warningColor: "#B06000",
	destructiveColor: "#D93025",
	chartColors: [
		"#188038",
		"#1A73E8",
		"#B06000",
		"#D93025",
		"#8430CE"
	]
};
var DEFAULT_COLORS_DARK = {
	themeMode: "dark",
	presetName: "google-blue",
	borderRadius: "normal",
	buttonStyle: "filled",
	density: "normal",
	backgroundColor: "#202124",
	cardColor: "#292A2D",
	foregroundColor: "#F8F9FA",
	borderColor: "#5F6368",
	primaryColor: "#8AB4F8",
	secondaryColor: "#303134",
	accentColor: "#3C4043",
	successColor: "#81C995",
	warningColor: "#FDD663",
	destructiveColor: "#F28B82",
	chartColors: [
		"#81C995",
		"#8AB4F8",
		"#FDD663",
		"#F28B82",
		"#C58AF9"
	]
};
function hexToRgb(value) {
	const hex = value.trim().replace(/^#/, "");
	if (![3, 6].includes(hex.length) || !/^[0-9a-f]+$/i.test(hex)) return null;
	const normalized = hex.length === 3 ? hex.split("").map((c) => `${c}${c}`).join("") : hex;
	return [
		0,
		2,
		4
	].map((offset) => Number.parseInt(normalized.slice(offset, offset + 2), 16) / 255);
}
function readableForeground(color, fallback) {
	const rgb = hexToRgb(color);
	if (!rgb) return fallback;
	const linear = rgb.map((channel) => channel <= .03928 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4);
	return .2126 * (linear[0] ?? 0) + .7152 * (linear[1] ?? 0) + .0722 * (linear[2] ?? 0) > .48 ? "#202124" : "#F8F9FA";
}
function getRadiusValue(option) {
	switch (option) {
		case "sharp": return "0.25rem";
		case "compact": return "0.5rem";
		case "normal": return "0.75rem";
		case "smooth": return "1rem";
		case "pill": return "1.5rem";
		default: return "0.75rem";
	}
}
function applyTheme(colors) {
	if (typeof window === "undefined") return;
	const root = document.documentElement;
	const mode = colors.themeMode ?? "system";
	let isDark = false;
	if (mode === "dark") isDark = true;
	else if (mode === "system") isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
	if (isDark) root.classList.add("dark");
	else root.classList.remove("dark");
	const preset = GOOGLE_PRESETS.find((p) => p.id === colors.presetName) ?? GOOGLE_PRESETS[0];
	const defaults = isDark ? preset?.dark ?? DEFAULT_COLORS_DARK : preset?.light ?? DEFAULT_COLORS_LIGHT;
	const fallbackForeground = isDark ? "#F8F9FA" : "#202124";
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
	const radius = getRadiusValue(colors.borderRadius);
	root.style.setProperty("--radius", radius);
	const density = colors.density ?? "normal";
	root.setAttribute("data-density", density);
	const buttonStyle = colors.buttonStyle ?? "filled";
	root.setAttribute("data-button-style", buttonStyle);
	if (density === "compact") {
		root.style.setProperty("--density-padding", "0.5rem");
		root.style.setProperty("--density-gap", "0.5rem");
	} else if (density === "comfortable") {
		root.style.setProperty("--density-padding", "1.25rem");
		root.style.setProperty("--density-gap", "1.25rem");
	} else {
		root.style.setProperty("--density-padding", "0.75rem");
		root.style.setProperty("--density-gap", "0.75rem");
	}
	root.style.setProperty("--background", bg);
	root.style.setProperty("--foreground", fg);
	root.style.setProperty("--card", card);
	root.style.setProperty("--card-foreground", fg);
	root.style.setProperty("--popover", card);
	root.style.setProperty("--popover-foreground", fg);
	root.style.setProperty("--primary", primary);
	root.style.setProperty("--primary-foreground", readableForeground(primary, fallbackForeground));
	root.style.setProperty("--secondary", secondary);
	root.style.setProperty("--secondary-foreground", readableForeground(secondary, fallbackForeground));
	root.style.setProperty("--muted", `color-mix(in oklab, ${secondary} 72%, ${bg})`);
	root.style.setProperty("--muted-foreground", `color-mix(in oklab, ${fg} 64%, ${bg})`);
	root.style.setProperty("--accent", accent);
	root.style.setProperty("--accent-foreground", readableForeground(accent, fallbackForeground));
	root.style.setProperty("--success", success);
	root.style.setProperty("--success-foreground", readableForeground(success, fallbackForeground));
	root.style.setProperty("--success-soft", `color-mix(in oklab, ${success} 14%, ${bg})`);
	root.style.setProperty("--warning", warning);
	root.style.setProperty("--warning-foreground", readableForeground(warning, fallbackForeground));
	root.style.setProperty("--warning-soft", `color-mix(in oklab, ${warning} 14%, ${bg})`);
	root.style.setProperty("--destructive", destructive);
	root.style.setProperty("--destructive-foreground", readableForeground(destructive, fallbackForeground));
	root.style.setProperty("--destructive-soft", `color-mix(in oklab, ${destructive} 14%, ${bg})`);
	root.style.setProperty("--info-soft", `color-mix(in oklab, ${primary} 12%, ${bg})`);
	root.style.setProperty("--border", border);
	root.style.setProperty("--input", border);
	root.style.setProperty("--ring", primary);
	root.style.setProperty("--gradient-header", `linear-gradient(115deg, ${primary} 0%, color-mix(in oklab, ${primary} 70%, ${accent}) 100%)`);
	root.style.setProperty("--sidebar", card);
	root.style.setProperty("--sidebar-foreground", fg);
	root.style.setProperty("--sidebar-primary", primary);
	root.style.setProperty("--sidebar-primary-foreground", readableForeground(primary, fallbackForeground));
	root.style.setProperty("--sidebar-accent", accent);
	root.style.setProperty("--sidebar-accent-foreground", readableForeground(accent, fallbackForeground));
	root.style.setProperty("--sidebar-border", border);
	root.style.setProperty("--sidebar-ring", primary);
	charts.forEach((color, index) => {
		root.style.setProperty(`--chart-${index + 1}`, color);
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
var spreadsheetInputSchema = objectType({ spreadsheetId: stringType().min(10).transform(normalizeSpreadsheetId) });
function normalizeSpreadsheetId(value) {
	const trimmed = value.trim();
	return trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/)?.[1] ?? trimmed;
}
/** Creates a new spreadsheet with the WorkLogs tab and header row. */
var createWorkSpreadsheet = createServerFn({ method: "POST" }).validator((input) => objectType({ title: stringType().min(1).max(120).optional() }).parse(input ?? {})).handler(createSsrRpc("32f65ef324f3951a881a96063bdc7be2026db7f5d3dd0b8089c4c0f0c924b817"));
/** Verifies access to a spreadsheet and ensures WorkLogs plus its header row exist. */
var prepareSpreadsheet = createServerFn({ method: "POST" }).validator((input) => spreadsheetInputSchema.parse(input)).handler(createSsrRpc("0e23b552ff6ecad23c367f496da2eadbab438be27a8f1a7893e123f50c70f28b"));
createServerFn({ method: "POST" }).validator((input) => objectType({
	spreadsheetId: stringType().min(10).transform(normalizeSpreadsheetId),
	rows: arrayType(arrayType(unionType([stringType(), numberType()]))).min(1).max(500)
}).parse(input)).handler(createSsrRpc("e9c19062c988a91cee9f43ecdd8b781a892490ef5a741dc6c6fae4082cdf3473"));
/** Overwrites the WorkLogs tab so the sheet mirrors app history exactly. */
var replaceWorkLogRows = createServerFn({ method: "POST" }).validator((input) => objectType({
	spreadsheetId: stringType().min(10).transform(normalizeSpreadsheetId),
	rows: arrayType(arrayType(unionType([stringType(), numberType()]))).max(5e3)
}).parse(input)).handler(createSsrRpc("4fed7e79f1f4319c2965dd35e83612163943687e7353f15e9a16fdccf36df9a9"));
createServerFn({ method: "POST" }).validator((input) => spreadsheetInputSchema.parse(input)).handler(createSsrRpc("5f93a5ce45a08dbcf162d890b71239ddba6605e67c18c35716bb2d2636572985"));
/** Stores the work-type list in the Settings tab. */
var writeCategoryList = createServerFn({ method: "POST" }).validator((input) => objectType({
	spreadsheetId: stringType().min(10).transform(normalizeSpreadsheetId),
	categories: arrayType(stringType().min(1).max(120)).max(200)
}).parse(input)).handler(createSsrRpc("f1215c2972e0315b59b13a39fad5015ca4a9e6a4e18b12302fdbeb6adee0c192"));
/** Reads every data row from the WorkLogs tab. */
var readWorkLogRows = createServerFn({ method: "POST" }).validator((input) => spreadsheetInputSchema.parse(input)).handler(createSsrRpc("fa587fec76e47499ed040a5a589c570f766c47a042311ecad246e911c61f07cb"));
/**
* Runs a non-destructive diagnostic. Write/update/delete run on a temporary
* tab that is deleted in finally, so WorkLogs never receives test rows.
*/
var testGoogleSheetsConnection = createServerFn({ method: "POST" }).validator((input) => spreadsheetInputSchema.parse(input)).handler(createSsrRpc("c5097760a7b329cbe21433a673c956b8f5bf96fe88dea062afef55da53a743be"));
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
var CONNECTION_TEST_KEYS = [
	"googleAccount",
	"serviceAccount",
	"spreadsheetId",
	"spreadsheetAccess",
	"readTest",
	"writeTest",
	"updateTest",
	"deleteTest"
];
function countPassedConnectionTests(result) {
	return CONNECTION_TEST_KEYS.filter((key) => result[key]).length;
}
function allConnectionTestsPassed(result) {
	return countPassedConnectionTests(result) === CONNECTION_TEST_KEYS.length;
}
var _jsxFileName$6 = "/app/applet/src/components/work/SheetsPanel.tsx";
function SheetsPanel({ spreadsheetId, onChange }) {
	const [input, setInput] = (0, import_react.useState)(spreadsheetId);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [testing, setTesting] = (0, import_react.useState)(false);
	const [testResult, setTestResult] = (0, import_react.useState)(null);
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
	const runConnectionTest = async () => {
		const id = extractSpreadsheetId(spreadsheetId || input);
		if (!id || id.length < 10) {
			toast.error("กรุณาระบุ Spreadsheet ID หรือเชื่อมต่อชีตก่อนทดสอบ");
			return;
		}
		setTesting(true);
		setTestResult(null);
		try {
			const res = await callServer(testGoogleSheetsConnection, { data: { spreadsheetId: id } });
			setTestResult(res);
			const passed = countPassedConnectionTests(res);
			if (allConnectionTestsPassed(res)) toast.success("ทดสอบการเชื่อมต่อ Google Sheets ผ่านครบ 8 ขั้นตอน");
			else toast.error(`การทดสอบผ่าน ${passed}/8 ขั้นตอน`, { description: res.errorDetails || "เปิดรายละเอียดในผลการทดสอบเพื่อดูขั้นตอนที่ไม่ผ่าน" });
		} catch (err) {
			toast.error("การทดสอบการเชื่อมต่อขัดข้อง", { description: err instanceof Error ? err.message : String(err) });
		} finally {
			setTesting(false);
		}
	};
	const renderStatus = (passed) => passed ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
		className: "flex items-center gap-1 text-success font-semibold",
		children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(CircleCheck, { className: "h-4 w-4" }, void 0, false, {
			fileName: _jsxFileName$6,
			lineNumber: 111,
			columnNumber: 9
		}, this), " ✅ ผ่าน"]
	}, void 0, true, {
		fileName: _jsxFileName$6,
		lineNumber: 110,
		columnNumber: 7
	}, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
		className: "flex items-center gap-1 text-destructive font-semibold",
		children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(CircleX, { className: "h-4 w-4" }, void 0, false, {
			fileName: _jsxFileName$6,
			lineNumber: 115,
			columnNumber: 9
		}, this), " ❌ ไม่ผ่าน"]
	}, void 0, true, {
		fileName: _jsxFileName$6,
		lineNumber: 114,
		columnNumber: 7
	}, this);
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
		className: "surface-card min-w-0 space-y-4 p-4 sm:p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
				className: "flex min-w-0 flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h2", {
						className: "font-bold text-base",
						children: "บันทึกลง Google Sheets"
					}, void 0, false, {
						fileName: _jsxFileName$6,
						lineNumber: 123,
						columnNumber: 11
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
						className: "text-xs text-muted-foreground",
						children: "ทุกครั้งที่ Check-out ระบบจะส่งข้อมูลไปยังชีต “WorkLogs” อัตโนมัติ"
					}, void 0, false, {
						fileName: _jsxFileName$6,
						lineNumber: 124,
						columnNumber: 11
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName$6,
					lineNumber: 122,
					columnNumber: 9
				}, this), spreadsheetId ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
					className: "flex items-center gap-1 rounded-full bg-success-soft px-2.5 py-1 text-xs font-medium text-success",
					children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(CircleCheck, { className: "h-3.5 w-3.5" }, void 0, false, {
						fileName: _jsxFileName$6,
						lineNumber: 130,
						columnNumber: 13
					}, this), " เชื่อมต่อแล้ว"]
				}, void 0, true, {
					fileName: _jsxFileName$6,
					lineNumber: 129,
					columnNumber: 11
				}, this) : null]
			}, void 0, true, {
				fileName: _jsxFileName$6,
				lineNumber: 121,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
				className: "flex flex-col gap-2 md:flex-row",
				children: [
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("input", {
						value: input,
						onChange: (e) => setInput(e.target.value),
						placeholder: "วางลิงก์ Google Sheets หรือ Spreadsheet ID",
						"aria-label": "Google Sheets URL หรือ ID",
						className: "min-w-0 w-full rounded-lg border border-input bg-secondary p-2.5 text-sm"
					}, void 0, false, {
						fileName: _jsxFileName$6,
						lineNumber: 136,
						columnNumber: 9
					}, this),
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
						onClick: connect,
						disabled: busy,
						className: "flex w-full shrink-0 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60 md:w-auto",
						children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Link2, { className: "h-4 w-4" }, void 0, false, {
							fileName: _jsxFileName$6,
							lineNumber: 148,
							columnNumber: 11
						}, this), " เชื่อมต่อ"]
					}, void 0, true, {
						fileName: _jsxFileName$6,
						lineNumber: 143,
						columnNumber: 9
					}, this),
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
						onClick: createNew,
						disabled: busy,
						className: "flex w-full shrink-0 items-center justify-center gap-1.5 rounded-lg border border-border px-4 py-2.5 text-sm font-medium disabled:opacity-60 hover:bg-secondary/80 md:w-auto",
						children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(FilePlusCorner, { className: "h-4 w-4" }, void 0, false, {
							fileName: _jsxFileName$6,
							lineNumber: 155,
							columnNumber: 11
						}, this), " สร้างชีตใหม่"]
					}, void 0, true, {
						fileName: _jsxFileName$6,
						lineNumber: 150,
						columnNumber: 9
					}, this)
				]
			}, void 0, true, {
				fileName: _jsxFileName$6,
				lineNumber: 135,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
				className: "flex min-w-0 flex-col items-stretch gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between",
				children: [spreadsheetId ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("a", {
					href: url,
					target: "_blank",
					rel: "noreferrer",
					className: "inline-flex min-w-0 max-w-full items-start gap-1 break-all text-xs text-primary hover:underline",
					children: [
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(ExternalLink, { className: "h-3.5 w-3.5" }, void 0, false, {
							fileName: _jsxFileName$6,
							lineNumber: 167,
							columnNumber: 13
						}, this),
						" เปิดชีต ",
						title || spreadsheetId
					]
				}, void 0, true, {
					fileName: _jsxFileName$6,
					lineNumber: 161,
					columnNumber: 11
				}, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
					className: "text-xs text-muted-foreground",
					children: "ยังไม่ได้ระบุ Spreadsheet ID"
				}, void 0, false, {
					fileName: _jsxFileName$6,
					lineNumber: 170,
					columnNumber: 11
				}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
					onClick: runConnectionTest,
					disabled: testing,
					className: "flex w-full shrink-0 items-center justify-center gap-1.5 rounded-lg border border-border bg-secondary px-3 py-2 text-center text-xs font-medium whitespace-normal hover:bg-secondary/80 disabled:opacity-60 sm:w-auto",
					children: [testing ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(RefreshCw, { className: "h-3.5 w-3.5 animate-spin" }, void 0, false, {
						fileName: _jsxFileName$6,
						lineNumber: 178,
						columnNumber: 13
					}, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(ShieldCheck, { className: "h-3.5 w-3.5" }, void 0, false, {
						fileName: _jsxFileName$6,
						lineNumber: 180,
						columnNumber: 13
					}, this), testing ? "กำลังทดสอบ..." : "ทดสอบการเชื่อมต่อ (Connection Test)"]
				}, void 0, true, {
					fileName: _jsxFileName$6,
					lineNumber: 172,
					columnNumber: 9
				}, this)]
			}, void 0, true, {
				fileName: _jsxFileName$6,
				lineNumber: 159,
				columnNumber: 7
			}, this),
			testResult && /* @__PURE__ */ (void 0)("div", {
				className: "mt-3 min-w-0 rounded-lg border border-border bg-card p-4 text-xs space-y-2",
				children: [
					/* @__PURE__ */ (void 0)("h3", {
						className: "font-semibold text-sm mb-2 flex items-center gap-1.5 text-foreground",
						children: [/* @__PURE__ */ (void 0)(ShieldCheck, { className: "h-4 w-4 text-primary" }, void 0, false, {
							fileName: _jsxFileName$6,
							lineNumber: 189,
							columnNumber: 13
						}, this), " ผลการทดสอบ Google Sheets Connection Suite"]
					}, void 0, true, {
						fileName: _jsxFileName$6,
						lineNumber: 188,
						columnNumber: 11
					}, this),
					/* @__PURE__ */ (void 0)("div", {
						className: "grid grid-cols-1 md:grid-cols-2 gap-2",
						children: [
							/* @__PURE__ */ (void 0)("div", {
								className: "flex justify-between items-center p-1.5 rounded bg-secondary/50",
								children: [/* @__PURE__ */ (void 0)("span", { children: "Google API Authentication:" }, void 0, false, {
									fileName: _jsxFileName$6,
									lineNumber: 194,
									columnNumber: 15
								}, this), renderStatus(testResult.googleAccount)]
							}, void 0, true, {
								fileName: _jsxFileName$6,
								lineNumber: 193,
								columnNumber: 13
							}, this),
							/* @__PURE__ */ (void 0)("div", {
								className: "flex justify-between items-center p-1.5 rounded bg-secondary/50",
								children: [/* @__PURE__ */ (void 0)("span", { children: "Service Account Credentials:" }, void 0, false, {
									fileName: _jsxFileName$6,
									lineNumber: 198,
									columnNumber: 15
								}, this), renderStatus(testResult.serviceAccount)]
							}, void 0, true, {
								fileName: _jsxFileName$6,
								lineNumber: 197,
								columnNumber: 13
							}, this),
							/* @__PURE__ */ (void 0)("div", {
								className: "flex justify-between items-center p-1.5 rounded bg-secondary/50",
								children: [/* @__PURE__ */ (void 0)("span", { children: "Spreadsheet ID Validity:" }, void 0, false, {
									fileName: _jsxFileName$6,
									lineNumber: 202,
									columnNumber: 15
								}, this), renderStatus(testResult.spreadsheetId)]
							}, void 0, true, {
								fileName: _jsxFileName$6,
								lineNumber: 201,
								columnNumber: 13
							}, this),
							/* @__PURE__ */ (void 0)("div", {
								className: "flex justify-between items-center p-1.5 rounded bg-secondary/50",
								children: [/* @__PURE__ */ (void 0)("span", { children: "Spreadsheet Access (Meta):" }, void 0, false, {
									fileName: _jsxFileName$6,
									lineNumber: 206,
									columnNumber: 15
								}, this), renderStatus(testResult.spreadsheetAccess)]
							}, void 0, true, {
								fileName: _jsxFileName$6,
								lineNumber: 205,
								columnNumber: 13
							}, this),
							/* @__PURE__ */ (void 0)("div", {
								className: "flex justify-between items-center p-1.5 rounded bg-secondary/50",
								children: [/* @__PURE__ */ (void 0)("span", { children: "Read Test (WorkLogs):" }, void 0, false, {
									fileName: _jsxFileName$6,
									lineNumber: 210,
									columnNumber: 15
								}, this), renderStatus(testResult.readTest)]
							}, void 0, true, {
								fileName: _jsxFileName$6,
								lineNumber: 209,
								columnNumber: 13
							}, this),
							/* @__PURE__ */ (void 0)("div", {
								className: "flex justify-between items-center p-1.5 rounded bg-secondary/50",
								children: [/* @__PURE__ */ (void 0)("span", { children: "Write Test (Temporary Sheet):" }, void 0, false, {
									fileName: _jsxFileName$6,
									lineNumber: 214,
									columnNumber: 15
								}, this), renderStatus(testResult.writeTest)]
							}, void 0, true, {
								fileName: _jsxFileName$6,
								lineNumber: 213,
								columnNumber: 13
							}, this),
							/* @__PURE__ */ (void 0)("div", {
								className: "flex justify-between items-center p-1.5 rounded bg-secondary/50",
								children: [/* @__PURE__ */ (void 0)("span", { children: "Update Test (Cell Edit):" }, void 0, false, {
									fileName: _jsxFileName$6,
									lineNumber: 218,
									columnNumber: 15
								}, this), renderStatus(testResult.updateTest)]
							}, void 0, true, {
								fileName: _jsxFileName$6,
								lineNumber: 217,
								columnNumber: 13
							}, this),
							/* @__PURE__ */ (void 0)("div", {
								className: "flex justify-between items-center p-1.5 rounded bg-secondary/50",
								children: [/* @__PURE__ */ (void 0)("span", { children: "Delete / Cleanup Test:" }, void 0, false, {
									fileName: _jsxFileName$6,
									lineNumber: 222,
									columnNumber: 15
								}, this), renderStatus(testResult.deleteTest)]
							}, void 0, true, {
								fileName: _jsxFileName$6,
								lineNumber: 221,
								columnNumber: 13
							}, this)
						]
					}, void 0, true, {
						fileName: _jsxFileName$6,
						lineNumber: 192,
						columnNumber: 11
					}, this),
					testResult.errorDetails && /* @__PURE__ */ (void 0)("div", {
						className: "mt-2 rounded bg-destructive/10 p-2 text-destructive text-[11px]",
						children: [
							/* @__PURE__ */ (void 0)("strong", { children: "ข้อผิดพลาดที่พบ:" }, void 0, false, {
								fileName: _jsxFileName$6,
								lineNumber: 228,
								columnNumber: 15
							}, this),
							" ",
							testResult.errorDetails
						]
					}, void 0, true, {
						fileName: _jsxFileName$6,
						lineNumber: 227,
						columnNumber: 13
					}, this)
				]
			}, void 0, true, {
				fileName: _jsxFileName$6,
				lineNumber: 187,
				columnNumber: 9
			}, this)
		]
	}, void 0, true, {
		fileName: _jsxFileName$6,
		lineNumber: 120,
		columnNumber: 5
	}, this);
}
/**
* Creates a deterministic sequential save workflow for independent draft domains.
* Validation is completed for every dirty participant before the first remote write.
*/
function createSaveCoordinator(participants) {
	return {
		hasDirtyParticipants: () => participants.some((participant) => participant.dirty),
		async save() {
			const dirtyParticipants = participants.filter((participant) => participant.dirty);
			const savedScopes = [];
			try {
				for (const participant of dirtyParticipants) await participant.validate?.();
				for (const participant of dirtyParticipants) {
					await participant.save();
					savedScopes.push(participant.scope);
				}
				return { savedScopes };
			} catch (error) {
				const failedScope = dirtyParticipants[savedScopes.length]?.scope;
				const result = { savedScopes };
				if (failedScope !== void 0) result.failedScope = failedScope;
				result.error = error;
				return result;
			}
		}
	};
}
var _jsxFileName$5 = "/app/applet/src/components/work/AuthenticationSettings.tsx";
var PROVIDERS = [
	{
		id: "google",
		label: "Google",
		description: "เข้าสู่ระบบด้วยบัญชี Google",
		icon: Mail,
		className: "text-[#4285F4]"
	},
	{
		id: "github",
		label: "GitHub",
		description: "เข้าสู่ระบบด้วยบัญชี GitHub",
		icon: Github,
		className: "text-foreground"
	},
	{
		id: "custom:line",
		label: "LINE",
		description: "เข้าสู่ระบบด้วยบัญชี LINE ผ่าน Custom OIDC",
		icon: MessageCircle,
		className: "text-[#06C755]"
	}
];
function providerLabel(provider) {
	if (provider === "google") return "Google";
	if (provider === "github") return "GitHub";
	if (provider === "custom:line" || provider === "line") return "LINE";
	if (provider === "email") return "อีเมลและรหัสผ่าน";
	return provider;
}
function AuthenticationSettings({ user, isGuest = false, onSignOut }) {
	const [identities, setIdentities] = (0, import_react.useState)(user?.identities ?? []);
	const [loadingIdentities, setLoadingIdentities] = (0, import_react.useState)(false);
	const [linkingProvider, setLinkingProvider] = (0, import_react.useState)(null);
	const [unlinkingId, setUnlinkingId] = (0, import_react.useState)(null);
	const [password, setPassword] = (0, import_react.useState)("");
	const [confirmPassword, setConfirmPassword] = (0, import_react.useState)("");
	const [savingPassword, setSavingPassword] = (0, import_react.useState)(false);
	const [signingOut, setSigningOut] = (0, import_react.useState)(null);
	const loadIdentities = (0, import_react.useCallback)(async () => {
		if (isGuest || !user) return;
		setLoadingIdentities(true);
		try {
			const { data, error } = await supabase.auth.getUserIdentities();
			if (error) throw error;
			setIdentities(data.identities ?? []);
		} catch (error) {
			toast.error("โหลดช่องทางการเข้าสู่ระบบไม่สำเร็จ", { description: error instanceof Error ? error.message : String(error) });
		} finally {
			setLoadingIdentities(false);
		}
	}, [isGuest, user]);
	(0, import_react.useEffect)(() => {
		setIdentities(user?.identities ?? []);
		loadIdentities();
	}, [loadIdentities, user]);
	const connectedProviders = (0, import_react.useMemo)(() => {
		const list = identities.map((identity) => identity.provider);
		if (user?.app_metadata?.provider) list.push(user.app_metadata.provider);
		return new Set(list);
	}, [identities, user]);
	const emailConnected = Boolean(user?.email && (connectedProviders.has("email") || identities.length === 0));
	const channelCount = identities.length + (emailConnected && !connectedProviders.has("email") ? 1 : 0);
	async function connectProvider(provider) {
		if (isGuest) {
			toast.info("Guest Mode ไม่สามารถเชื่อมต่อ Provider ได้", { description: "กรุณาเข้าสู่ระบบด้วยบัญชีจริงก่อน" });
			return;
		}
		setLinkingProvider(provider);
		try {
			const { data, error } = await supabase.auth.linkIdentity({
				provider,
				options: { redirectTo: `${window.location.origin}/auth/callback` }
			});
			if (error) throw error;
			if (data?.url) {
				window.location.assign(data.url);
				return;
			}
			toast.success(`เชื่อมต่อ ${providerLabel(provider)} แล้ว`);
			await loadIdentities();
		} catch (error) {
			toast.error(`เชื่อมต่อ ${providerLabel(provider)} ไม่สำเร็จ`, { description: error instanceof Error ? error.message : String(error) });
		} finally {
			setLinkingProvider(null);
		}
	}
	async function disconnectIdentity(identity) {
		if (channelCount <= 1) {
			toast.error("ไม่สามารถยกเลิกช่องทางสุดท้ายได้", { description: "กรุณาเชื่อมต่อ Provider หรือกำหนดอีเมล/รหัสผ่านอีกช่องทางก่อน" });
			return;
		}
		setUnlinkingId(identity.identity_id);
		try {
			const { error } = await supabase.auth.unlinkIdentity(identity);
			if (error) throw error;
			toast.success(`ยกเลิกการเชื่อมต่อ ${providerLabel(identity.provider)} แล้ว`);
			await loadIdentities();
		} catch (error) {
			toast.error("ยกเลิกการเชื่อมต่อไม่สำเร็จ", { description: error instanceof Error ? error.message : String(error) });
		} finally {
			setUnlinkingId(null);
		}
	}
	async function updatePassword(event) {
		event.preventDefault();
		if (password.length < 8) {
			toast.error("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร");
			return;
		}
		if (password !== confirmPassword) {
			toast.error("รหัสผ่านใหม่ไม่ตรงกัน");
			return;
		}
		setSavingPassword(true);
		try {
			const { error } = await supabase.auth.updateUser({ password });
			if (error) throw error;
			setPassword("");
			setConfirmPassword("");
			toast.success("เปลี่ยนรหัสผ่านเรียบร้อยแล้ว");
		} catch (error) {
			toast.error("เปลี่ยนรหัสผ่านไม่สำเร็จ", { description: error instanceof Error ? error.message : String(error) });
		} finally {
			setSavingPassword(false);
		}
	}
	async function handleSignOut(scope) {
		setSigningOut(scope);
		try {
			await onSignOut(scope);
			toast.success(scope === "global" ? "ออกจากระบบทุกอุปกรณ์แล้ว" : "ออกจากระบบแล้ว");
		} catch (error) {
			toast.error("ออกจากระบบไม่สำเร็จ", { description: error instanceof Error ? error.message : String(error) });
			setSigningOut(null);
		}
	}
	if (!user) return null;
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
				className: "rounded-2xl border border-primary/20 bg-info-soft/70 p-4",
				children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "flex items-start gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(ShieldCheck, { className: "mt-0.5 h-5 w-5 shrink-0 text-primary" }, void 0, false, {
						fileName: _jsxFileName$5,
						lineNumber: 210,
						columnNumber: 11
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h3", {
						className: "text-sm font-bold",
						children: "Authentication / การเข้าสู่ระบบ"
					}, void 0, false, {
						fileName: _jsxFileName$5,
						lineNumber: 212,
						columnNumber: 13
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
						className: "mt-1 text-xs text-muted-foreground",
						children: "จัดการบัญชีและช่องทางเข้าสู่ระบบจาก Supabase Auth โดยไม่สร้างบัญชีซ้ำเมื่อเชื่อมต่อ Provider เพิ่ม"
					}, void 0, false, {
						fileName: _jsxFileName$5,
						lineNumber: 213,
						columnNumber: 13
					}, this)] }, void 0, true, {
						fileName: _jsxFileName$5,
						lineNumber: 211,
						columnNumber: 11
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName$5,
					lineNumber: 209,
					columnNumber: 9
				}, this)
			}, void 0, false, {
				fileName: _jsxFileName$5,
				lineNumber: 208,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("section", {
				className: "rounded-2xl border border-border bg-card p-4 shadow-sm",
				children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "flex flex-wrap items-start justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-primary",
							children: user.user_metadata?.["avatar_url"] || user.user_metadata?.["picture"] ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("img", {
								src: String(user.user_metadata["avatar_url"] || user.user_metadata["picture"]),
								alt: "รูปโปรไฟล์",
								className: "h-full w-full object-cover"
							}, void 0, false, {
								fileName: _jsxFileName$5,
								lineNumber: 226,
								columnNumber: 17
							}, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(UserRound, { className: "h-6 w-6" }, void 0, false, {
								fileName: _jsxFileName$5,
								lineNumber: 232,
								columnNumber: 17
							}, this)
						}, void 0, false, {
							fileName: _jsxFileName$5,
							lineNumber: 224,
							columnNumber: 13
						}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h4", {
							className: "font-bold text-foreground",
							children: String(user.user_metadata?.["full_name"] || user.user_metadata?.["name"] || "ผู้ใช้ Work Tracker")
						}, void 0, false, {
							fileName: _jsxFileName$5,
							lineNumber: 236,
							columnNumber: 15
						}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
							className: "text-xs text-muted-foreground",
							children: user.email || "ไม่มีอีเมล"
						}, void 0, false, {
							fileName: _jsxFileName$5,
							lineNumber: 243,
							columnNumber: 15
						}, this)] }, void 0, true, {
							fileName: _jsxFileName$5,
							lineNumber: 235,
							columnNumber: 13
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName$5,
						lineNumber: 223,
						columnNumber: 11
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
						className: "inline-flex items-center gap-1.5 rounded-full bg-success-soft px-2.5 py-1 text-[11px] font-bold text-success",
						children: [
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(CircleCheck, { className: "h-3.5 w-3.5" }, void 0, false, {
								fileName: _jsxFileName$5,
								lineNumber: 247,
								columnNumber: 13
							}, this),
							" ",
							isGuest ? "Guest Mode" : "บัญชีใช้งานอยู่"
						]
					}, void 0, true, {
						fileName: _jsxFileName$5,
						lineNumber: 246,
						columnNumber: 11
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName$5,
					lineNumber: 222,
					columnNumber: 9
				}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "mt-4 grid gap-3 text-xs sm:grid-cols-2",
					children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "rounded-xl bg-secondary p-3",
						children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
							className: "block text-muted-foreground",
							children: "User ID"
						}, void 0, false, {
							fileName: _jsxFileName$5,
							lineNumber: 252,
							columnNumber: 13
						}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("code", {
							className: "mt-1 block truncate text-[11px] text-foreground",
							children: user.id
						}, void 0, false, {
							fileName: _jsxFileName$5,
							lineNumber: 253,
							columnNumber: 13
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName$5,
						lineNumber: 251,
						columnNumber: 11
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "rounded-xl bg-secondary p-3",
						children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
							className: "block text-muted-foreground",
							children: "Provider หลัก"
						}, void 0, false, {
							fileName: _jsxFileName$5,
							lineNumber: 256,
							columnNumber: 13
						}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
							className: "mt-1 block font-semibold text-foreground",
							children: providerLabel(String(user.app_metadata?.provider || identities[0]?.provider || "email"))
						}, void 0, false, {
							fileName: _jsxFileName$5,
							lineNumber: 257,
							columnNumber: 13
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName$5,
						lineNumber: 255,
						columnNumber: 11
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName$5,
					lineNumber: 250,
					columnNumber: 9
				}, this)]
			}, void 0, true, {
				fileName: _jsxFileName$5,
				lineNumber: 221,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("section", {
				className: "rounded-2xl border border-border bg-card p-4 shadow-sm",
				children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "flex items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h4", {
						className: "font-bold text-sm",
						children: "ช่องทางการเข้าสู่ระบบ"
					}, void 0, false, {
						fileName: _jsxFileName$5,
						lineNumber: 269,
						columnNumber: 13
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
						className: "mt-1 text-xs text-muted-foreground",
						children: "เชื่อมต่อได้หลายช่องทาง ข้อมูลเดิมจะยังอยู่กับบัญชีเดียวกัน"
					}, void 0, false, {
						fileName: _jsxFileName$5,
						lineNumber: 270,
						columnNumber: 13
					}, this)] }, void 0, true, {
						fileName: _jsxFileName$5,
						lineNumber: 268,
						columnNumber: 11
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
						type: "button",
						onClick: () => void loadIdentities(),
						disabled: loadingIdentities || isGuest,
						className: "rounded-xl border border-border p-2 text-muted-foreground transition hover:bg-accent disabled:opacity-50",
						"aria-label": "รีเฟรชช่องทางการเข้าสู่ระบบ",
						children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(RefreshCw, { className: `h-4 w-4 ${loadingIdentities ? "animate-spin" : ""}` }, void 0, false, {
							fileName: _jsxFileName$5,
							lineNumber: 281,
							columnNumber: 13
						}, this)
					}, void 0, false, {
						fileName: _jsxFileName$5,
						lineNumber: 274,
						columnNumber: 11
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName$5,
					lineNumber: 267,
					columnNumber: 9
				}, this), isGuest ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "mt-4 flex items-start gap-2 rounded-xl border border-warning/30 bg-warning-soft p-3 text-xs text-warning-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(TriangleAlert, { className: "mt-0.5 h-4 w-4 shrink-0" }, void 0, false, {
						fileName: _jsxFileName$5,
						lineNumber: 287,
						columnNumber: 13
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: "Guest Mode ใช้ได้เฉพาะการทดลอง ระบบจะไม่บันทึก Provider หรือรหัสผ่านลงบัญชีจริง" }, void 0, false, {
						fileName: _jsxFileName$5,
						lineNumber: 288,
						columnNumber: 13
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName$5,
					lineNumber: 286,
					columnNumber: 11
				}, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "mt-4 space-y-2",
					children: [PROVIDERS.map(({ id, label, description, icon: Icon, className }) => {
						const identity = identities.find((item) => id === "custom:line" ? item.provider === "custom:line" || item.provider === "line" : item.provider === id);
						const isConnected = Boolean(identity);
						return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-3",
							children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
								className: "flex items-center gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Icon, { className: `h-5 w-5 ${className}` }, void 0, false, {
									fileName: _jsxFileName$5,
									lineNumber: 307,
									columnNumber: 21
								}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
									className: "text-sm font-semibold",
									children: label
								}, void 0, false, {
									fileName: _jsxFileName$5,
									lineNumber: 309,
									columnNumber: 23
								}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
									className: "text-[11px] text-muted-foreground",
									children: description
								}, void 0, false, {
									fileName: _jsxFileName$5,
									lineNumber: 310,
									columnNumber: 23
								}, this)] }, void 0, true, {
									fileName: _jsxFileName$5,
									lineNumber: 308,
									columnNumber: 21
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName$5,
								lineNumber: 306,
								columnNumber: 19
							}, this), isConnected ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
									className: "inline-flex items-center gap-1 rounded-full bg-success-soft px-2.5 py-1 text-[11px] font-bold text-success",
									children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(CircleCheck, { className: "h-3.5 w-3.5" }, void 0, false, {
										fileName: _jsxFileName$5,
										lineNumber: 316,
										columnNumber: 25
									}, this), " เชื่อมต่อแล้ว"]
								}, void 0, true, {
									fileName: _jsxFileName$5,
									lineNumber: 315,
									columnNumber: 23
								}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
									type: "button",
									onClick: () => identity && void disconnectIdentity(identity),
									disabled: unlinkingId === identity?.identity_id || channelCount <= 1,
									className: "inline-flex items-center gap-1 rounded-xl border border-destructive/30 px-2.5 py-1.5 text-[11px] font-semibold text-destructive transition hover:bg-destructive-soft disabled:opacity-50",
									children: [unlinkingId === identity?.identity_id ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }, void 0, false, {
										fileName: _jsxFileName$5,
										lineNumber: 325,
										columnNumber: 27
									}, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Unlink2, { className: "h-3.5 w-3.5" }, void 0, false, {
										fileName: _jsxFileName$5,
										lineNumber: 327,
										columnNumber: 27
									}, this), "ยกเลิก"]
								}, void 0, true, {
									fileName: _jsxFileName$5,
									lineNumber: 318,
									columnNumber: 23
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName$5,
								lineNumber: 314,
								columnNumber: 21
							}, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
								type: "button",
								onClick: () => void connectProvider(id),
								disabled: linkingProvider !== null,
								className: "inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-[11px] font-bold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50",
								children: [
									linkingProvider === id ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }, void 0, false, {
										fileName: _jsxFileName$5,
										lineNumber: 340,
										columnNumber: 25
									}, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Link2, { className: "h-3.5 w-3.5" }, void 0, false, {
										fileName: _jsxFileName$5,
										lineNumber: 342,
										columnNumber: 25
									}, this),
									"เชื่อมต่อ ",
									label
								]
							}, void 0, true, {
								fileName: _jsxFileName$5,
								lineNumber: 333,
								columnNumber: 21
							}, this)]
						}, id, true, {
							fileName: _jsxFileName$5,
							lineNumber: 302,
							columnNumber: 17
						}, this);
					}), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "flex items-center justify-between rounded-xl border border-border p-3",
						children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Mail, { className: "h-5 w-5 text-primary" }, void 0, false, {
								fileName: _jsxFileName$5,
								lineNumber: 352,
								columnNumber: 17
							}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
								className: "text-sm font-semibold",
								children: "อีเมลและรหัสผ่าน"
							}, void 0, false, {
								fileName: _jsxFileName$5,
								lineNumber: 354,
								columnNumber: 19
							}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
								className: "text-[11px] text-muted-foreground",
								children: user.email || "ยังไม่มีอีเมลในบัญชี"
							}, void 0, false, {
								fileName: _jsxFileName$5,
								lineNumber: 355,
								columnNumber: 19
							}, this)] }, void 0, true, {
								fileName: _jsxFileName$5,
								lineNumber: 353,
								columnNumber: 17
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName$5,
							lineNumber: 351,
							columnNumber: 15
						}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
							className: "inline-flex items-center gap-1 rounded-full bg-success-soft px-2.5 py-1 text-[11px] font-bold text-success",
							children: [
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(CircleCheck, { className: "h-3.5 w-3.5" }, void 0, false, {
									fileName: _jsxFileName$5,
									lineNumber: 361,
									columnNumber: 17
								}, this),
								" ",
								emailConnected ? "พร้อมใช้" : "ยังไม่ตั้งค่า"
							]
						}, void 0, true, {
							fileName: _jsxFileName$5,
							lineNumber: 360,
							columnNumber: 15
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName$5,
						lineNumber: 350,
						columnNumber: 13
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName$5,
					lineNumber: 293,
					columnNumber: 11
				}, this)]
			}, void 0, true, {
				fileName: _jsxFileName$5,
				lineNumber: 266,
				columnNumber: 7
			}, this),
			!isGuest && /* @__PURE__ */ (void 0)("section", {
				className: "rounded-2xl border border-border bg-card p-4 shadow-sm",
				children: [/* @__PURE__ */ (void 0)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (void 0)(KeyRound, { className: "h-5 w-5 text-primary" }, void 0, false, {
						fileName: _jsxFileName$5,
						lineNumber: 372,
						columnNumber: 13
					}, this), /* @__PURE__ */ (void 0)("div", { children: [/* @__PURE__ */ (void 0)("h4", {
						className: "font-bold text-sm",
						children: "เปลี่ยนรหัสผ่าน"
					}, void 0, false, {
						fileName: _jsxFileName$5,
						lineNumber: 374,
						columnNumber: 15
					}, this), /* @__PURE__ */ (void 0)("p", {
						className: "mt-1 text-xs text-muted-foreground",
						children: "ใช้ได้เมื่อบัญชีมีอีเมลและ Supabase Auth รองรับ password provider"
					}, void 0, false, {
						fileName: _jsxFileName$5,
						lineNumber: 375,
						columnNumber: 15
					}, this)] }, void 0, true, {
						fileName: _jsxFileName$5,
						lineNumber: 373,
						columnNumber: 13
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName$5,
					lineNumber: 371,
					columnNumber: 11
				}, this), /* @__PURE__ */ (void 0)("form", {
					onSubmit: (event) => void updatePassword(event),
					className: "mt-4 grid gap-3 sm:grid-cols-2",
					children: [
						/* @__PURE__ */ (void 0)("input", {
							type: "password",
							minLength: 8,
							value: password,
							onChange: (event) => setPassword(event.target.value),
							placeholder: "รหัสผ่านใหม่อย่างน้อย 8 ตัวอักษร",
							className: "rounded-xl border border-input bg-background px-3 py-2.5 text-sm",
							autoComplete: "new-password"
						}, void 0, false, {
							fileName: _jsxFileName$5,
							lineNumber: 384,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ (void 0)("input", {
							type: "password",
							minLength: 8,
							value: confirmPassword,
							onChange: (event) => setConfirmPassword(event.target.value),
							placeholder: "ยืนยันรหัสผ่านใหม่",
							className: "rounded-xl border border-input bg-background px-3 py-2.5 text-sm",
							autoComplete: "new-password"
						}, void 0, false, {
							fileName: _jsxFileName$5,
							lineNumber: 393,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ (void 0)("button", {
							type: "submit",
							disabled: savingPassword || !password || !confirmPassword,
							className: "inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50 sm:col-span-2 sm:justify-self-start",
							children: [savingPassword ? /* @__PURE__ */ (void 0)(LoaderCircle, { className: "h-4 w-4 animate-spin" }, void 0, false, {
								fileName: _jsxFileName$5,
								lineNumber: 408,
								columnNumber: 17
							}, this) : /* @__PURE__ */ (void 0)(KeyRound, { className: "h-4 w-4" }, void 0, false, {
								fileName: _jsxFileName$5,
								lineNumber: 410,
								columnNumber: 17
							}, this), savingPassword ? "กำลังบันทึก..." : "บันทึกรหัสผ่านใหม่"]
						}, void 0, true, {
							fileName: _jsxFileName$5,
							lineNumber: 402,
							columnNumber: 13
						}, this)
					]
				}, void 0, true, {
					fileName: _jsxFileName$5,
					lineNumber: 380,
					columnNumber: 11
				}, this)]
			}, void 0, true, {
				fileName: _jsxFileName$5,
				lineNumber: 370,
				columnNumber: 9
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("section", {
				className: "rounded-2xl border border-destructive/20 bg-destructive-soft/40 p-4",
				children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "flex items-start gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(LogOut, { className: "mt-0.5 h-5 w-5 shrink-0 text-destructive" }, void 0, false, {
						fileName: _jsxFileName$5,
						lineNumber: 420,
						columnNumber: 11
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "flex-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h4", {
								className: "font-bold text-sm",
								children: "ออกจากระบบ"
							}, void 0, false, {
								fileName: _jsxFileName$5,
								lineNumber: 422,
								columnNumber: 13
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
								className: "mt-1 text-xs text-muted-foreground",
								children: "ล้าง session ในอุปกรณ์นี้ หรือออกจากระบบทุกอุปกรณ์ที่ยังเปิดอยู่"
							}, void 0, false, {
								fileName: _jsxFileName$5,
								lineNumber: 423,
								columnNumber: 13
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
								className: "mt-3 flex flex-col gap-2 sm:flex-row",
								children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
									type: "button",
									onClick: () => void handleSignOut("local"),
									disabled: signingOut !== null,
									className: "inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5 text-xs font-bold text-foreground transition hover:bg-accent disabled:opacity-50",
									children: [signingOut === "local" ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(LoaderCircle, { className: "h-4 w-4 animate-spin" }, void 0, false, {
										fileName: _jsxFileName$5,
										lineNumber: 434,
										columnNumber: 19
									}, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(LogOut, { className: "h-4 w-4" }, void 0, false, {
										fileName: _jsxFileName$5,
										lineNumber: 436,
										columnNumber: 19
									}, this), "ออกจากอุปกรณ์นี้"]
								}, void 0, true, {
									fileName: _jsxFileName$5,
									lineNumber: 427,
									columnNumber: 15
								}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
									type: "button",
									onClick: () => void handleSignOut("global"),
									disabled: signingOut !== null,
									className: "inline-flex items-center justify-center gap-2 rounded-xl bg-destructive px-3 py-2.5 text-xs font-bold text-destructive-foreground transition hover:bg-destructive/90 disabled:opacity-50",
									children: [signingOut === "global" ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(LoaderCircle, { className: "h-4 w-4 animate-spin" }, void 0, false, {
										fileName: _jsxFileName$5,
										lineNumber: 447,
										columnNumber: 19
									}, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(LogOut, { className: "h-4 w-4" }, void 0, false, {
										fileName: _jsxFileName$5,
										lineNumber: 449,
										columnNumber: 19
									}, this), "ออกจากระบบทุกอุปกรณ์"]
								}, void 0, true, {
									fileName: _jsxFileName$5,
									lineNumber: 440,
									columnNumber: 15
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName$5,
								lineNumber: 426,
								columnNumber: 13
							}, this)
						]
					}, void 0, true, {
						fileName: _jsxFileName$5,
						lineNumber: 421,
						columnNumber: 11
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName$5,
					lineNumber: 419,
					columnNumber: 9
				}, this)
			}, void 0, false, {
				fileName: _jsxFileName$5,
				lineNumber: 418,
				columnNumber: 7
			}, this)
		]
	}, void 0, true, {
		fileName: _jsxFileName$5,
		lineNumber: 207,
		columnNumber: 5
	}, this);
}
var transactionSequence = 0;
function createEmptyHistory() {
	return {
		past: [],
		future: []
	};
}
function cloneDashboardLayout(layout) {
	return {
		version: layout.version,
		cards: layout.cards.map((card) => ({ ...card }))
	};
}
function dashboardLayoutsEqual(a, b) {
	if (a.version !== b.version || a.cards.length !== b.cards.length) return false;
	return a.cards.every((card, index) => {
		const other = b.cards[index];
		return card.id === other?.id && card.group === other.group && card.order === other.order && card.width === other.width && card.height === other.height && card.x === other.x && card.y === other.y;
	});
}
function createDashboardLayoutTransaction(before, after, viewport, label, mergeKey) {
	if (dashboardLayoutsEqual(before, after)) return null;
	transactionSequence += 1;
	const transaction = {
		id: `dashboard-layout-${Date.now()}-${transactionSequence}`,
		scope: "dashboard-layout",
		viewport,
		label,
		before: cloneDashboardLayout(before),
		after: cloneDashboardLayout(after),
		createdAt: Date.now()
	};
	if (mergeKey !== void 0) transaction.mergeKey = mergeKey;
	return transaction;
}
function isMeaningfulTransaction(transaction) {
	return !dashboardLayoutsEqual(transaction.before, transaction.after);
}
function editorHistoryReducer(state, action, maxEntries = 50) {
	const limit = Math.max(1, Math.floor(maxEntries));
	switch (action.type) {
		case "push": {
			if (!isMeaningfulTransaction(action.entry)) return state;
			const last = state.past[state.past.length - 1];
			if (last?.mergeKey && last.mergeKey === action.entry.mergeKey) {
				const merged = {
					...last,
					after: cloneDashboardLayout(action.entry.after),
					createdAt: action.entry.createdAt,
					label: action.entry.label
				};
				return {
					past: dashboardLayoutsEqual(merged.before, merged.after) ? state.past.slice(0, -1) : state.past.slice(0, -1).concat(merged),
					future: []
				};
			}
			return {
				past: state.past.concat(action.entry).slice(-limit),
				future: []
			};
		}
		case "undo": {
			const entry = state.past[state.past.length - 1];
			if (!entry) return state;
			return {
				past: state.past.slice(0, -1),
				future: state.future.concat(entry)
			};
		}
		case "redo": {
			const entry = state.future[state.future.length - 1];
			if (!entry) return state;
			return {
				past: state.past.concat(entry).slice(-limit),
				future: state.future.slice(0, -1)
			};
		}
		case "clear": return createEmptyHistory();
		default: return state;
	}
}
function useEditorHistory({ maxEntries = 50 } = {}) {
	const [state, dispatch] = (0, import_react.useReducer)((current, action) => editorHistoryReducer(current, action, maxEntries), void 0, createEmptyHistory);
	const stateRef = (0, import_react.useRef)(state);
	(0, import_react.useEffect)(() => {
		stateRef.current = state;
	}, [state]);
	const push = (0, import_react.useCallback)((transaction) => {
		dispatch({
			type: "push",
			entry: transaction
		});
	}, []);
	const undo = (0, import_react.useCallback)(() => {
		const entry = stateRef.current.past[stateRef.current.past.length - 1] ?? null;
		if (entry) dispatch({ type: "undo" });
		return entry;
	}, []);
	const redo = (0, import_react.useCallback)(() => {
		const entry = stateRef.current.future[stateRef.current.future.length - 1] ?? null;
		if (entry) dispatch({ type: "redo" });
		return entry;
	}, []);
	const clear = (0, import_react.useCallback)(() => dispatch({ type: "clear" }), []);
	return {
		past: state.past,
		future: state.future,
		canUndo: state.past.length > 0,
		canRedo: state.future.length > 0,
		push,
		undo,
		redo,
		clear
	};
}
var CARD_IDS = /* @__PURE__ */ new Set([
	"net-income",
	"work-days",
	"days-with-ot",
	"days-without-ot",
	"tasks",
	"tasks-average",
	"hours",
	"ot-income",
	"allowance",
	"deductions",
	"daily-income",
	"daily-tasks",
	"work-type-income",
	"frequent-location"
]);
var GROUPS = /* @__PURE__ */ new Set([
	"net",
	"work",
	"income",
	"charts"
]);
function createDefaultDashboardLayout(viewport) {
	const mobile = viewport === "mobile";
	return {
		version: 1,
		cards: [
			{
				id: "net-income",
				group: "net",
				order: 0,
				width: mobile ? 2 : 3,
				height: 1,
				x: 0,
				y: 0
			},
			{
				id: "work-days",
				group: "work",
				order: 0,
				width: 1,
				height: 1,
				x: 0,
				y: 9
			},
			{
				id: "tasks",
				group: "work",
				order: 1,
				width: 1,
				height: 1,
				x: mobile ? 50 : 33.333,
				y: 9
			},
			{
				id: "days-with-ot",
				group: "work",
				order: 2,
				width: 1,
				height: 1,
				x: mobile ? 0 : 66.667,
				y: mobile ? 15 : 9
			},
			{
				id: "days-without-ot",
				group: "work",
				order: 3,
				width: 1,
				height: 1,
				x: mobile ? 50 : 0,
				y: 15
			},
			{
				id: "tasks-average",
				group: "work",
				order: 4,
				width: 1,
				height: 1,
				x: mobile ? 0 : 33.333,
				y: mobile ? 21 : 15
			},
			{
				id: "hours",
				group: "work",
				order: 5,
				width: 1,
				height: 1,
				x: mobile ? 50 : 66.667,
				y: mobile ? 21 : 15
			},
			{
				id: "ot-income",
				group: "income",
				order: 0,
				width: 1,
				height: 1,
				x: 0,
				y: 27
			},
			{
				id: "allowance",
				group: "income",
				order: 1,
				width: 1,
				height: 1,
				x: mobile ? 50 : 33.333,
				y: 27
			},
			{
				id: "deductions",
				group: "income",
				order: 2,
				width: mobile ? 2 : 1,
				height: 1,
				x: mobile ? 0 : 66.667,
				y: mobile ? 33 : 27
			},
			{
				id: "daily-income",
				group: "charts",
				order: 0,
				width: 1,
				height: 1,
				x: 0,
				y: 40
			},
			{
				id: "daily-tasks",
				group: "charts",
				order: 1,
				width: 1,
				height: 1,
				x: mobile ? 0 : 50,
				y: mobile ? 55 : 40
			},
			{
				id: "work-type-income",
				group: "charts",
				order: 2,
				width: 1,
				height: 1,
				x: 0,
				y: mobile ? 70 : 62
			},
			{
				id: "frequent-location",
				group: "charts",
				order: 3,
				width: 1,
				height: 1,
				x: mobile ? 0 : 50,
				y: mobile ? 85 : 62
			}
		]
	};
}
function updateDashboardCard(layout, id, patch) {
	return {
		...layout,
		cards: layout.cards.map((card) => card.id === id ? {
			...card,
			...patch
		} : card)
	};
}
function normalizeDashboardLayout(value, viewport) {
	const defaults = createDefaultDashboardLayout(viewport);
	if (!isRecord(value) || !Array.isArray(value["cards"])) return defaults;
	const incoming = /* @__PURE__ */ new Map();
	for (const item of value["cards"]) {
		if (!isRecord(item)) continue;
		const id = item["id"];
		const group = item["group"];
		if (!isCardId(id) || !isGroup(group) || incoming.has(id)) continue;
		const defaultCard = defaults.cards.find((card) => card.id === id) ?? defaults.cards[0];
		if (!defaultCard) continue;
		incoming.set(id, {
			id,
			group,
			order: finiteInt(item["order"], defaultCard.order),
			width: Math.max(1, finiteNumber(item["width"], defaultCard.width)),
			height: Math.max(1, finiteNumber(item["height"], defaultCard.height)),
			x: clampPercentage(finiteNumber(item["x"], defaultCard.x), 100),
			y: clampPercentage(finiteNumber(item["y"], defaultCard.y), 100)
		});
	}
	const ordered = defaults.cards.map((defaultCard) => incoming.get(defaultCard.id) ?? defaultCard).map((card) => ({ ...card }));
	for (const group of GROUPS) ordered.filter((card) => card.group === group).sort((a, b) => a.order - b.order).forEach((card, index) => {
		card.order = index;
	});
	return {
		version: 1,
		cards: ordered
	};
}
async function loadDashboardLayout(userId, viewport) {
	const localKey = `dashboard_layout_${userId}_${viewport}`;
	if (!isSupabaseConfigured()) {
		try {
			const raw = localStorage.getItem(localKey);
			if (raw) return normalizeDashboardLayout(JSON.parse(raw), viewport);
		} catch {}
		return createDefaultDashboardLayout(viewport);
	}
	try {
		const { data, error } = await supabase.from("dashboard_layouts").select("layout").eq("user_id", userId).eq("viewport", viewport).maybeSingle();
		if (error) {
			console.warn("loadDashboardLayout warning:", error.message);
			const raw = localStorage.getItem(localKey);
			if (raw) return normalizeDashboardLayout(JSON.parse(raw), viewport);
			return createDefaultDashboardLayout(viewport);
		}
		return normalizeDashboardLayout(data?.layout, viewport);
	} catch (err) {
		console.warn("loadDashboardLayout network error:", err);
		try {
			const raw = localStorage.getItem(localKey);
			if (raw) return normalizeDashboardLayout(JSON.parse(raw), viewport);
		} catch {}
		return createDefaultDashboardLayout(viewport);
	}
}
async function saveDashboardLayout(userId, viewport, layout) {
	const localKey = `dashboard_layout_${userId}_${viewport}`;
	try {
		localStorage.setItem(localKey, JSON.stringify(layout));
	} catch {}
	if (!isSupabaseConfigured()) return;
	try {
		const { error } = await supabase.from("dashboard_layouts").upsert({
			user_id: userId,
			viewport,
			layout
		}, { onConflict: "user_id,viewport" });
		if (error) console.warn("saveDashboardLayout error:", error.message);
	} catch (err) {
		console.warn("saveDashboardLayout network exception:", err);
	}
}
function isRecord(value) {
	return typeof value === "object" && value !== null;
}
function isCardId(value) {
	return typeof value === "string" && CARD_IDS.has(value);
}
function isGroup(value) {
	return typeof value === "string" && GROUPS.has(value);
}
function finiteInt(value, fallback) {
	return typeof value === "number" && Number.isFinite(value) ? Math.round(value) : fallback;
}
function finiteNumber(value, fallback) {
	return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}
function clampPercentage(value, max) {
	return Math.min(Math.max(value, 0), max);
}
var _jsxFileName$4 = "/app/applet/src/components/work/DashboardCustomizationCanvas.tsx";
var NORMAL_CARD_HEIGHT = 92;
var NET_CARD_HEIGHT = 104;
var CHART_CARD_HEIGHT = 260;
var TOUCH_DRAG_DELAY = 220;
var TOUCH_MOVE_TOLERANCE = 8;
var GROUP_ORDER = [
	"net",
	"work",
	"income",
	"charts"
];
var RESIZE_HANDLES = [
	{
		direction: "nw",
		position: "-left-2 -top-2",
		cursor: "cursor-nwse-resize",
		label: "มุมซ้ายบน"
	},
	{
		direction: "n",
		position: "left-1/2 -top-2 -translate-x-1/2",
		cursor: "cursor-n-resize",
		label: "ด้านบนกลาง"
	},
	{
		direction: "ne",
		position: "-right-2 -top-2",
		cursor: "cursor-nesw-resize",
		label: "มุมขวาบน"
	},
	{
		direction: "w",
		position: "-left-2 top-1/2 -translate-y-1/2",
		cursor: "cursor-w-resize",
		label: "ด้านซ้ายกลาง"
	},
	{
		direction: "e",
		position: "-right-2 top-1/2 -translate-y-1/2",
		cursor: "cursor-e-resize",
		label: "ด้านขวากลาง"
	},
	{
		direction: "sw",
		position: "-bottom-2 -left-2",
		cursor: "cursor-nesw-resize",
		label: "มุมซ้ายล่าง"
	},
	{
		direction: "s",
		position: "-bottom-2 left-1/2 -translate-x-1/2",
		cursor: "cursor-s-resize",
		label: "ด้านล่างกลาง"
	},
	{
		direction: "se",
		position: "-bottom-2 -right-2",
		cursor: "cursor-nwse-resize",
		label: "มุมขวาล่าง"
	}
];
function DashboardCustomizationCanvas({ layout, viewport, summary, chartColors, disabled, selectedCardId, onSelectCard, onMoveCard, onResizeCard }) {
	const canvasRef = (0, import_react.useRef)(null);
	const interactionRef = (0, import_react.useRef)(null);
	const pendingTouchRef = (0, import_react.useRef)(null);
	const touchTimerRef = (0, import_react.useRef)(null);
	const [activeInteraction, setActiveInteraction] = (0, import_react.useState)(null);
	const cardsByGroup = GROUP_ORDER.map((group) => ({
		group,
		cards: layout.cards.filter((card) => card.group === group).sort(compareReflowPosition)
	}));
	const clearTouchTimer = () => {
		if (touchTimerRef.current !== null) {
			window.clearTimeout(touchTimerRef.current);
			touchTimerRef.current = null;
		}
	};
	const clearPendingTouch = () => {
		clearTouchTimer();
		pendingTouchRef.current = null;
	};
	const beginInteraction = (card, target, pointerId, startClientX, startClientY, mode, resizeDirection) => {
		const interaction = {
			pointerId,
			id: card.id,
			mode,
			resizeDirection,
			captureTarget: target,
			startClientX,
			startClientY,
			startX: card.x,
			startY: card.y,
			startWidth: card.width,
			startHeight: card.height
		};
		try {
			target.setPointerCapture(pointerId);
		} catch {}
		interactionRef.current = interaction;
		setActiveInteraction(interaction);
	};
	const handlePointerDown = (event, card, mode, resizeDirection) => {
		if (disabled) return;
		event.stopPropagation();
		onSelectCard(card.id);
		const target = event.currentTarget;
		if (mode === "drag" && event.pointerType === "touch") {
			clearPendingTouch();
			pendingTouchRef.current = {
				pointerId: event.pointerId,
				id: card.id,
				target,
				startClientX: event.clientX,
				startClientY: event.clientY
			};
			touchTimerRef.current = window.setTimeout(() => {
				const pending = pendingTouchRef.current;
				if (!pending || pending.pointerId !== event.pointerId) return;
				const pendingCard = layout.cards.find((item) => item.id === pending.id);
				if (!pendingCard) return;
				beginInteraction(pendingCard, pending.target, pending.pointerId, pending.startClientX, pending.startClientY, "drag");
				pendingTouchRef.current = null;
				touchTimerRef.current = null;
			}, TOUCH_DRAG_DELAY);
			return;
		}
		event.preventDefault();
		beginInteraction(card, target, event.pointerId, event.clientX, event.clientY, mode, resizeDirection);
	};
	const handlePointerMove = (event) => {
		const pending = pendingTouchRef.current;
		if (pending && pending.pointerId === event.pointerId) {
			if (Math.hypot(event.clientX - pending.startClientX, event.clientY - pending.startClientY) > TOUCH_MOVE_TOLERANCE) clearPendingTouch();
			return;
		}
		const interaction = interactionRef.current;
		if (!interaction || interaction.pointerId !== event.pointerId || disabled) return;
		const canvas = canvasRef.current;
		const card = layout.cards.find((item) => item.id === interaction.id);
		if (!canvas || !card) return;
		event.preventDefault();
		const rect = canvas.getBoundingClientRect();
		if (!rect.width || !rect.height) return;
		const deltaXPercent = (event.clientX - interaction.startClientX) / rect.width * 100;
		const deltaYPercent = (event.clientY - interaction.startClientY) / rect.height * 100;
		if (interaction.mode === "drag") {
			onMoveCard(card.id, {
				x: roundPosition(clamp(interaction.startX + deltaXPercent, 0, 100)),
				y: roundPosition(clamp(interaction.startY + deltaYPercent, 0, 100))
			});
			return;
		}
		const direction = interaction.resizeDirection ?? "se";
		const columns = getColumns(card, viewport);
		const horizontalDirection = direction.includes("e") ? "east" : direction.includes("w") ? "west" : null;
		const verticalDirection = direction.includes("s") ? "south" : direction.includes("n") ? "north" : null;
		const widthStep = Math.round((event.clientX - interaction.startClientX) / (rect.width / columns));
		const heightStep = Math.round((event.clientY - interaction.startClientY) / getCardBaseHeight(card));
		const maxWidth = card.group === "net" ? columns : columns;
		const nextWidth = horizontalDirection ? clamp(interaction.startWidth + (horizontalDirection === "east" ? widthStep : -widthStep), 1, maxWidth) : interaction.startWidth;
		const nextHeight = verticalDirection ? clamp(interaction.startHeight + (verticalDirection === "south" ? heightStep : -heightStep), 1, card.group === "charts" ? 6 : 4) : interaction.startHeight;
		const nextX = horizontalDirection === "west" ? interaction.startX + deltaXPercent : interaction.startX;
		const nextY = verticalDirection === "north" ? interaction.startY + deltaYPercent : interaction.startY;
		onResizeCard(card.id, {
			width: nextWidth,
			height: nextHeight,
			x: roundPosition(clamp(nextX, 0, 100)),
			y: roundPosition(clamp(nextY, 0, 100))
		});
	};
	const finishPointer = (event) => {
		if (pendingTouchRef.current?.pointerId === event.pointerId) clearPendingTouch();
		if (interactionRef.current?.pointerId !== event.pointerId) return;
		const captureTarget = interactionRef.current.captureTarget;
		try {
			if (captureTarget.hasPointerCapture(event.pointerId)) captureTarget.releasePointerCapture(event.pointerId);
		} catch {}
		interactionRef.current = null;
		setActiveInteraction(null);
	};
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
		className: "space-y-2",
		"data-testid": "dashboard-customization-canvas",
		children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
			className: "flex items-center justify-between gap-2 text-xs text-muted-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: disabled ? "ปลดล็อก Settings ก่อนจึงจะเลือก ลาก หรือปรับขนาดได้" : "แตะเพื่อเลือก · กดค้างแล้วลาก · ลากจุดรอบกรอบเพื่อปรับขนาด · พื้นที่ว่างใช้ Scroll" }, void 0, false, {
				fileName: _jsxFileName$4,
				lineNumber: 315,
				columnNumber: 9
			}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
				className: "shrink-0",
				children: viewport === "mobile" ? "Canvas Mobile" : "Canvas Desktop"
			}, void 0, false, {
				fileName: _jsxFileName$4,
				lineNumber: 320,
				columnNumber: 9
			}, this)]
		}, void 0, true, {
			fileName: _jsxFileName$4,
			lineNumber: 314,
			columnNumber: 7
		}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
			className: "max-h-[min(75vh,48rem)] overflow-y-auto overscroll-contain rounded-2xl border-2 border-dashed border-border bg-secondary/30",
			style: { touchAction: "pan-y" },
			"data-dashboard-customization-viewport": viewport,
			children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
				ref: canvasRef,
				className: "space-y-3 px-10 py-12",
				style: { touchAction: "pan-y" },
				"data-dashboard-customization-canvas-surface": viewport,
				onPointerDown: (event) => {
					if (event.target === event.currentTarget) onSelectCard(null);
				},
				onPointerMove: handlePointerMove,
				onPointerUp: finishPointer,
				onPointerCancel: finishPointer,
				children: cardsByGroup.map(({ group, cards }) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("section", {
					className: "grid min-w-0 grid-cols-2 items-stretch gap-2 sm:gap-3 md:grid-cols-6",
					"data-dashboard-card-group": group,
					style: { gridTemplateColumns: `repeat(${getSectionColumns(viewport)}, minmax(0, 1fr))` },
					children: cards.map((card) => {
						const selected = selectedCardId === card.id;
						const dragging = activeInteraction?.id === card.id && activeInteraction.mode === "drag";
						const resizing = activeInteraction?.id === card.id && activeInteraction.mode === "resize";
						const width = getGridSpan(card, viewport);
						const height = getCardHeight(card);
						return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("article", {
							className: `relative min-w-0 overflow-visible rounded-xl ${selected ? "z-30 ring-2 ring-primary ring-offset-2 ring-offset-background" : "z-10"} ${dragging ? "cursor-grabbing opacity-90" : disabled ? "cursor-default" : "cursor-grab"}`,
							"data-dashboard-card-id": card.id,
							"data-dashboard-card-selected": selected ? "true" : "false",
							"data-dashboard-card-interacting": dragging || resizing ? "true" : "false",
							style: {
								height: `${height}px`,
								gridColumn: `span ${Math.min(width, getSectionColumns(viewport))} / span ${Math.min(width, getSectionColumns(viewport))}`,
								touchAction: "none",
								userSelect: "none"
							},
							onPointerDown: (event) => handlePointerDown(event, card, "drag"),
							onClick: (event) => {
								event.stopPropagation();
								onSelectCard(card.id);
							},
							children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
								className: "pointer-events-none h-full min-h-0 min-w-0 overflow-visible rounded-xl",
								children: renderDashboardCardContent(card.id, summary, chartColors)
							}, void 0, false, {
								fileName: _jsxFileName$4,
								lineNumber: 388,
								columnNumber: 21
							}, this), selected ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(import_jsx_dev_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
								className: "pointer-events-none absolute -top-9 left-0 rounded-md bg-primary px-2 py-1 text-[10px] font-semibold text-primary-foreground shadow",
								children: [
									card.id,
									" · x ",
									roundPosition(card.x),
									"% · y ",
									roundPosition(card.y),
									"% · w",
									" ",
									card.width,
									" · h ",
									card.height
								]
							}, void 0, true, {
								fileName: _jsxFileName$4,
								lineNumber: 393,
								columnNumber: 25
							}, this), RESIZE_HANDLES.map((handle) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
								type: "button",
								"aria-label": `ปรับขนาด ${card.id} ${handle.label}`,
								className: `absolute z-40 flex h-4 w-4 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow ${handle.position} ${handle.cursor}`,
								style: { touchAction: "none" },
								onPointerDown: (event) => handlePointerDown(event, card, "resize", handle.direction),
								children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Maximize2, { className: "h-2.5 w-2.5" }, void 0, false, {
									fileName: _jsxFileName$4,
									lineNumber: 408,
									columnNumber: 29
								}, this)
							}, handle.direction, false, {
								fileName: _jsxFileName$4,
								lineNumber: 398,
								columnNumber: 27
							}, this))] }, void 0, true, {
								fileName: _jsxFileName$4,
								lineNumber: 392,
								columnNumber: 23
							}, this) : null]
						}, card.id, true, {
							fileName: _jsxFileName$4,
							lineNumber: 360,
							columnNumber: 19
						}, this);
					})
				}, group, false, {
					fileName: _jsxFileName$4,
					lineNumber: 343,
					columnNumber: 13
				}, this))
			}, void 0, false, {
				fileName: _jsxFileName$4,
				lineNumber: 330,
				columnNumber: 9
			}, this)
		}, void 0, false, {
			fileName: _jsxFileName$4,
			lineNumber: 325,
			columnNumber: 7
		}, this)]
	}, void 0, true, {
		fileName: _jsxFileName$4,
		lineNumber: 313,
		columnNumber: 5
	}, this);
}
function getSectionColumns(viewport) {
	return viewport === "mobile" ? 2 : 6;
}
function getColumns(card, viewport) {
	return getSectionColumns(viewport);
}
function getGridSpan(card, viewport) {
	const columns = getSectionColumns(viewport);
	if (card.group === "net") return columns;
	if (card.group === "charts") return viewport === "mobile" ? columns : 3 * clamp(card.width, 1, 2);
	return viewport === "mobile" ? clamp(card.width, 1, 2) : 2 * clamp(card.width, 1, 3);
}
function getCardBaseHeight(card) {
	if (card.group === "net") return NET_CARD_HEIGHT;
	return card.group === "charts" ? CHART_CARD_HEIGHT : NORMAL_CARD_HEIGHT;
}
function getCardHeight(card) {
	return getCardBaseHeight(card) * clamp(card.height, 1, card.group === "charts" ? 6 : 4);
}
function compareReflowPosition(a, b) {
	const y = a.y - b.y;
	if (Math.abs(y) > .01) return y;
	const x = a.x - b.x;
	if (Math.abs(x) > .01) return x;
	if (a.group !== b.group) return groupRank(a.group) - groupRank(b.group);
	return a.order - b.order;
}
function groupRank(group) {
	return group === "net" ? 0 : group === "work" ? 1 : group === "income" ? 2 : 3;
}
function clamp(value, min, max) {
	return Math.min(Math.max(value, min), max);
}
function roundPosition(value) {
	return Math.round(value * 100) / 100;
}
var _jsxFileName$3 = "/app/applet/src/components/work/DashboardLayoutEditor.tsx";
var CARD_LABELS = {
	"net-income": "รายได้สุทธิรวม",
	"work-days": "วันทำงานทั้งหมด",
	"days-with-ot": "วันที่มี OT",
	"days-without-ot": "วันที่ไม่มี OT",
	tasks: "งานที่ทำเสร็จ",
	"tasks-average": "เฉลี่ยงานต่อวัน",
	hours: "ชั่วโมงรวม",
	"ot-income": "ค่า OT",
	allowance: "เบี้ยเลี้ยงและรายรับอื่น",
	deductions: "รายการหักรวม",
	"daily-income": "รายได้รายวัน",
	"daily-tasks": "จำนวนงานที่ทำเสร็จรายวัน",
	"work-type-income": "สัดส่วนรายได้ตามประเภทงาน",
	"frequent-location": "สถานที่ทำงานบ่อยที่สุด"
};
var DashboardLayoutEditor = (0, import_react.forwardRef)(function DashboardLayoutEditor({ userId, isGuest, mobileLayout, desktopLayout, disabled, summary, chartColors, onDirtyChange }, ref) {
	const [selectedViewport, setSelectedViewport] = (0, import_react.useState)("mobile");
	const [selectedCardId, setSelectedCardId] = (0, import_react.useState)(null);
	const mobile = mobileLayout;
	const desktop = desktopLayout;
	const mobileHistory = useEditorHistory();
	const desktopHistory = useEditorHistory();
	const { canUndo: canUndoMobile, canRedo: canRedoMobile, push: pushMobileHistory, undo: undoMobileHistory, redo: redoMobileHistory, clear: clearMobileHistory } = mobileHistory;
	const { canUndo: canUndoDesktop, canRedo: canRedoDesktop, push: pushDesktopHistory, undo: undoDesktopHistory, redo: redoDesktopHistory, clear: clearDesktopHistory } = desktopHistory;
	const mobileSnapshotRef = (0, import_react.useRef)(mobile.layout);
	const desktopSnapshotRef = (0, import_react.useRef)(desktop.layout);
	const mobileSnapshotReadyRef = (0, import_react.useRef)(false);
	const desktopSnapshotReadyRef = (0, import_react.useRef)(false);
	(0, import_react.useEffect)(() => {
		mobileSnapshotReadyRef.current = false;
		desktopSnapshotReadyRef.current = false;
		clearMobileHistory();
		clearDesktopHistory();
	}, [
		clearDesktopHistory,
		clearMobileHistory,
		isGuest,
		userId
	]);
	(0, import_react.useEffect)(() => {
		if (!mobile.loaded || mobileSnapshotReadyRef.current) return;
		mobileSnapshotRef.current = cloneLayout(mobile.layout);
		mobileSnapshotReadyRef.current = true;
		clearMobileHistory();
	}, [
		clearMobileHistory,
		mobile.layout,
		mobile.loaded
	]);
	(0, import_react.useEffect)(() => {
		if (!desktop.loaded || desktopSnapshotReadyRef.current) return;
		desktopSnapshotRef.current = cloneLayout(desktop.layout);
		desktopSnapshotReadyRef.current = true;
		clearDesktopHistory();
	}, [
		clearDesktopHistory,
		desktop.layout,
		desktop.loaded
	]);
	const mobileDirty = mobile.loaded && mobileSnapshotReadyRef.current && !dashboardLayoutsEqual(mobile.layout, mobileSnapshotRef.current);
	const desktopDirty = desktop.loaded && desktopSnapshotReadyRef.current && !dashboardLayoutsEqual(desktop.layout, desktopSnapshotRef.current);
	const isDirty = mobileDirty || desktopDirty;
	const selected = selectedViewport === "mobile" ? mobile : desktop;
	const selectedHistory = selectedViewport === "mobile" ? mobileHistory : desktopHistory;
	(0, import_react.useEffect)(() => {
		onDirtyChange?.(isDirty);
	}, [isDirty, onDirtyChange]);
	(0, import_react.useImperativeHandle)(ref, () => ({
		async saveDraft() {
			if (!mobileDirty && !desktopDirty) return;
			if (mobileDirty) {
				await mobile.saveLayout();
				mobileSnapshotRef.current = cloneLayout(mobile.layout);
			}
			if (desktopDirty) {
				await desktop.saveLayout();
				desktopSnapshotRef.current = cloneLayout(desktop.layout);
			}
			clearMobileHistory();
			clearDesktopHistory();
			toast.success(isGuest ? "บันทึก Layout สำหรับ Session นี้แล้ว" : "บันทึก Layout ลง Supabase แล้ว");
		},
		cancelDraft() {
			if (mobileDirty && mobileSnapshotReadyRef.current) mobile.updateLayout(() => cloneLayout(mobileSnapshotRef.current));
			if (desktopDirty && desktopSnapshotReadyRef.current) desktop.updateLayout(() => cloneLayout(desktopSnapshotRef.current));
			clearMobileHistory();
			clearDesktopHistory();
			setSelectedCardId(null);
		},
		clearHistory() {
			clearMobileHistory();
			clearDesktopHistory();
		},
		getDraftStatus() {
			return {
				mobileDirty,
				desktopDirty,
				isDirty,
				canUndo: canUndoMobile || canUndoDesktop,
				canRedo: canRedoMobile || canRedoDesktop
			};
		}
	}), [
		canRedoDesktop,
		canRedoMobile,
		canUndoDesktop,
		canUndoMobile,
		clearDesktopHistory,
		clearMobileHistory,
		desktop,
		desktopDirty,
		isDirty,
		isGuest,
		mobile,
		mobileDirty
	]);
	const handleViewportChange = (nextViewport) => {
		if (nextViewport === selectedViewport) return;
		setSelectedCardId(null);
		setSelectedViewport(nextViewport);
	};
	const applySelectedLayout = (label, updater, mergeKey) => {
		if (disabled || !selected.loaded) return false;
		const before = selected.layout;
		const after = updater(before);
		const transaction = createDashboardLayoutTransaction(before, after, selectedViewport, label, mergeKey);
		if (!transaction) return false;
		selected.updateLayout(() => after);
		(selectedViewport === "mobile" ? pushMobileHistory : pushDesktopHistory)(transaction);
		return true;
	};
	const handleCanvasMove = (id, patch) => {
		applySelectedLayout(`ลาก ${CARD_LABELS[id]}`, (current) => updateDashboardCard(current, id, patch), `drag:${selectedViewport}:${id}`);
	};
	const handleCanvasResize = (id, patch) => {
		applySelectedLayout(`ปรับขนาด ${CARD_LABELS[id]}`, (current) => updateDashboardCard(current, id, patch), `resize:${selectedViewport}:${id}`);
	};
	const handleUndo = () => {
		if (disabled) return;
		const entry = (selectedViewport === "mobile" ? undoMobileHistory : undoDesktopHistory)();
		if (!entry) return;
		selected.updateLayout(() => cloneLayout(entry.before));
		setSelectedCardId(null);
	};
	const handleRedo = () => {
		if (disabled) return;
		const entry = (selectedViewport === "mobile" ? redoMobileHistory : redoDesktopHistory)();
		if (!entry) return;
		selected.updateLayout(() => cloneLayout(entry.after));
		setSelectedCardId(null);
	};
	const resetSelectedLayout = () => {
		const changed = applySelectedLayout(`รีเซ็ต Layout ${selectedViewport}`, () => createDefaultDashboardLayout(selectedViewport));
		setSelectedCardId(null);
		if (changed) toast.info(`แสดงตัวอย่าง Layout ${selectedViewport === "mobile" ? "มือถือ" : "Desktop"} ค่าเริ่มต้นแล้ว กด Save เพื่อบันทึก`);
	};
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("section", {
		className: "surface-card space-y-5 p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
				className: "flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-start sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h3", {
					className: "flex items-center gap-2 text-base font-bold",
					children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(GripVertical, { className: "h-5 w-5 text-primary" }, void 0, false, {
						fileName: _jsxFileName$3,
						lineNumber: 280,
						columnNumber: 15
					}, this), " ปรับ Layout Dashboard"]
				}, void 0, true, {
					fileName: _jsxFileName$3,
					lineNumber: 279,
					columnNumber: 13
				}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
					className: "mt-1 text-xs text-muted-foreground",
					children: "จัดลำดับ ลากขึ้นลง และปรับความกว้าง/ความสูงของการ์ดจาก Settings เท่านั้น"
				}, void 0, false, {
					fileName: _jsxFileName$3,
					lineNumber: 282,
					columnNumber: 13
				}, this)] }, void 0, true, {
					fileName: _jsxFileName$3,
					lineNumber: 278,
					columnNumber: 11
				}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
					type: "button",
					onClick: resetSelectedLayout,
					disabled: disabled || selected.loading,
					className: "flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50",
					children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(RotateCcw, { className: "h-3.5 w-3.5" }, void 0, false, {
						fileName: _jsxFileName$3,
						lineNumber: 292,
						columnNumber: 13
					}, this), " รีเซ็ต Layout นี้"]
				}, void 0, true, {
					fileName: _jsxFileName$3,
					lineNumber: 286,
					columnNumber: 11
				}, this)]
			}, void 0, true, {
				fileName: _jsxFileName$3,
				lineNumber: 277,
				columnNumber: 9
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
				className: "flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-secondary/50 p-2",
				children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "flex items-center gap-1 rounded-lg bg-card p-1",
						children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
							type: "button",
							onClick: () => handleViewportChange("mobile"),
							className: `flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold transition ${selectedViewport === "mobile" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:bg-accent"}`,
							children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Smartphone, { className: "h-3.5 w-3.5" }, void 0, false, {
								fileName: _jsxFileName$3,
								lineNumber: 308,
								columnNumber: 17
							}, this), " Mobile"]
						}, void 0, true, {
							fileName: _jsxFileName$3,
							lineNumber: 299,
							columnNumber: 15
						}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
							type: "button",
							onClick: () => handleViewportChange("desktop"),
							className: `flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold transition ${selectedViewport === "desktop" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:bg-accent"}`,
							children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Monitor, { className: "h-3.5 w-3.5" }, void 0, false, {
								fileName: _jsxFileName$3,
								lineNumber: 319,
								columnNumber: 17
							}, this), " Desktop"]
						}, void 0, true, {
							fileName: _jsxFileName$3,
							lineNumber: 310,
							columnNumber: 15
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName$3,
						lineNumber: 298,
						columnNumber: 13
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "flex items-center gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
							type: "button",
							onClick: handleUndo,
							disabled: disabled || !selectedHistory.canUndo,
							"aria-label": "ย้อนกลับการแก้ไข Layout ล่าสุด",
							className: "rounded-lg border border-border bg-card p-2 text-muted-foreground transition hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-45",
							children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Undo2, { className: "h-4 w-4" }, void 0, false, {
								fileName: _jsxFileName$3,
								lineNumber: 330,
								columnNumber: 17
							}, this)
						}, void 0, false, {
							fileName: _jsxFileName$3,
							lineNumber: 323,
							columnNumber: 15
						}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
							type: "button",
							onClick: handleRedo,
							disabled: disabled || !selectedHistory.canRedo,
							"aria-label": "ทำซ้ำการแก้ไข Layout ล่าสุด",
							className: "rounded-lg border border-border bg-card p-2 text-muted-foreground transition hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-45",
							children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Redo2, { className: "h-4 w-4" }, void 0, false, {
								fileName: _jsxFileName$3,
								lineNumber: 339,
								columnNumber: 17
							}, this)
						}, void 0, false, {
							fileName: _jsxFileName$3,
							lineNumber: 332,
							columnNumber: 15
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName$3,
						lineNumber: 322,
						columnNumber: 13
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName$3,
					lineNumber: 297,
					columnNumber: 11
				}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
					className: "flex items-center gap-1 text-[11px] text-muted-foreground",
					"aria-live": "polite",
					children: selected.loading ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(import_jsx_dev_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(RefreshCw, { className: "h-3.5 w-3.5 animate-spin" }, void 0, false, {
						fileName: _jsxFileName$3,
						lineNumber: 349,
						columnNumber: 17
					}, this), " กำลังโหลด Layout…"] }, void 0, true, {
						fileName: _jsxFileName$3,
						lineNumber: 348,
						columnNumber: 15
					}, this) : isDirty ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(import_jsx_dev_runtime.Fragment, { children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
						className: "text-warning",
						children: "ยังไม่ได้บันทึก"
					}, void 0, false, {
						fileName: _jsxFileName$3,
						lineNumber: 353,
						columnNumber: 17
					}, this) }, void 0, false, {
						fileName: _jsxFileName$3,
						lineNumber: 352,
						columnNumber: 15
					}, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(import_jsx_dev_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Check, { className: "h-3.5 w-3.5 text-success" }, void 0, false, {
						fileName: _jsxFileName$3,
						lineNumber: 357,
						columnNumber: 17
					}, this), " บันทึกแล้ว"] }, void 0, true, {
						fileName: _jsxFileName$3,
						lineNumber: 356,
						columnNumber: 15
					}, this)
				}, void 0, false, {
					fileName: _jsxFileName$3,
					lineNumber: 343,
					columnNumber: 11
				}, this)]
			}, void 0, true, {
				fileName: _jsxFileName$3,
				lineNumber: 296,
				columnNumber: 9
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DashboardCustomizationCanvas, {
				layout: selected.layout,
				viewport: selectedViewport,
				summary,
				chartColors,
				disabled: disabled || selected.loading,
				selectedCardId,
				onSelectCard: setSelectedCardId,
				onMoveCard: handleCanvasMove,
				onResizeCard: handleCanvasResize
			}, void 0, false, {
				fileName: _jsxFileName$3,
				lineNumber: 363,
				columnNumber: 9
			}, this)
		]
	}, void 0, true, {
		fileName: _jsxFileName$3,
		lineNumber: 276,
		columnNumber: 7
	}, this);
});
function cloneLayout(layout) {
	return {
		version: layout.version,
		cards: layout.cards.map((card) => ({ ...card }))
	};
}
var _jsxFileName$2 = "/app/applet/src/components/work/SettingsPanel.tsx";
var CHART_TOKEN_LABELS = [
	{
		label: "Income / รายได้",
		hint: "Google Green"
	},
	{
		label: "Balance / Primary",
		hint: "Google Blue"
	},
	{
		label: "Warning / Pending",
		hint: "Google Yellow"
	},
	{
		label: "Expense / ค่าใช้จ่าย",
		hint: "Google Red"
	},
	{
		label: "Secondary Data",
		hint: "Google Purple"
	}
];
function SettingsPanel({ userId: _userId, authUser, isGuest = false, workTypes, otTypes, rates, themeSettings, savedThemeSettings, spreadsheetId, logs, previewMonth, mobileLayout, desktopLayout, onAddWorkType, onEditWorkType, onToggleWorkType, onSoftDeleteWorkType, onSaveRates, branches, activeBranchId, branchSettings, branchSettingsLoading, onAddBranch, onUpdateBranch, onSelectBranch, onSaveBranchSettings, onPreviewThemeSettings, onSaveThemeSettings, onSetSpreadsheetId, onSyncAirtableAll, airtableSyncing, onSignOut, onDirtyChange }) {
	const [activeTab, setActiveTab] = (0, import_react.useState)("worktypes");
	const [newWorkType, setNewWorkType] = (0, import_react.useState)("");
	const [editingWtId, setEditingWtId] = (0, import_react.useState)(null);
	const [editingWtName, setEditingWtName] = (0, import_react.useState)("");
	const [isLocked, setIsLocked] = (0, import_react.useState)(true);
	const [isSaving, setIsSaving] = (0, import_react.useState)(false);
	const [rateForm, setRateForm] = (0, import_react.useState)(rates);
	const [dailyRateInput, setDailyRateInput] = (0, import_react.useState)(() => String(rates.dailyRate ?? ""));
	const [savedRateForm, setSavedRateForm] = (0, import_react.useState)(rates);
	const [sheetIdInput, setSheetIdInput] = (0, import_react.useState)(spreadsheetId);
	const [savedSheetId, setSavedSheetId] = (0, import_react.useState)(spreadsheetId);
	const [newBranchName, setNewBranchName] = (0, import_react.useState)("");
	const [newBranchCode, setNewBranchCode] = (0, import_react.useState)("");
	const [branchNameInput, setBranchNameInput] = (0, import_react.useState)("");
	const [branchCodeInput, setBranchCodeInput] = (0, import_react.useState)("");
	const [branchRateForm, setBranchRateForm] = (0, import_react.useState)(branchSettings);
	const [savedBranchRateForm, setSavedBranchRateForm] = (0, import_react.useState)(branchSettings);
	const [savedBranchNameInput, setSavedBranchNameInput] = (0, import_react.useState)("");
	const [savedBranchCodeInput, setSavedBranchCodeInput] = (0, import_react.useState)("");
	const [draftColors, setDraftColors] = (0, import_react.useState)(themeSettings);
	const [savedColors, setSavedColors] = (0, import_react.useState)(themeSettings);
	const [layoutDirty, setLayoutDirty] = (0, import_react.useState)(false);
	const layoutEditorRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		setRateForm(rates);
		setDailyRateInput(String(rates.dailyRate ?? ""));
		setSavedRateForm(rates);
	}, [rates]);
	(0, import_react.useEffect)(() => {
		setSheetIdInput(spreadsheetId);
		setSavedSheetId(spreadsheetId);
	}, [spreadsheetId]);
	(0, import_react.useEffect)(() => {
		setDraftColors(themeSettings);
	}, [themeSettings]);
	(0, import_react.useEffect)(() => {
		setSavedColors(savedThemeSettings);
	}, [savedThemeSettings]);
	(0, import_react.useEffect)(() => {
		onPreviewThemeSettings(draftColors);
	}, [draftColors, onPreviewThemeSettings]);
	(0, import_react.useEffect)(() => {
		setBranchRateForm(branchSettings);
		setSavedBranchRateForm(branchSettings);
		const selected = branches.find((branch) => branch.id === activeBranchId);
		const nextName = selected?.name ?? "";
		const nextCode = selected?.code ?? "";
		setBranchNameInput(nextName);
		setBranchCodeInput(nextCode);
		setSavedBranchNameInput(nextName);
		setSavedBranchCodeInput(nextCode);
	}, [
		activeBranchId,
		branchSettings,
		branches
	]);
	const ratesDirty = dailyRateInput !== String(savedRateForm.dailyRate ?? "") || JSON.stringify({
		...rateForm,
		dailyRate: 0
	}) !== JSON.stringify({
		...savedRateForm,
		dailyRate: 0
	});
	const isDirty = JSON.stringify(draftColors) !== JSON.stringify(savedColors) || ratesDirty || sheetIdInput !== savedSheetId || JSON.stringify(branchRateForm) !== JSON.stringify(savedBranchRateForm) || branchNameInput !== savedBranchNameInput || branchCodeInput !== savedBranchCodeInput || layoutDirty;
	(0, import_react.useEffect)(() => {
		onDirtyChange?.(isDirty);
	}, [isDirty, onDirtyChange]);
	(0, import_react.useEffect)(() => {
		if (!isDirty) return;
		const handleBeforeUnload = (event) => {
			event.preventDefault();
			event.returnValue = "";
		};
		window.addEventListener("beforeunload", handleBeforeUnload);
		return () => window.removeEventListener("beforeunload", handleBeforeUnload);
	}, [isDirty]);
	const handleUnlock = () => setIsLocked(false);
	const handleLock = () => {
		if (isDirty && typeof window !== "undefined") {
			if (!window.confirm("ยังมีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก ต้องการล็อกต่อหรือไม่?")) return;
		}
		setIsLocked(true);
	};
	const handleCancel = () => {
		setDraftColors(savedColors);
		onPreviewThemeSettings(savedColors);
		setRateForm(savedRateForm);
		setDailyRateInput(String(savedRateForm.dailyRate ?? ""));
		setSheetIdInput(savedSheetId);
		setBranchRateForm(savedBranchRateForm);
		setBranchNameInput(savedBranchNameInput);
		setBranchCodeInput(savedBranchCodeInput);
		layoutEditorRef.current?.cancelDraft();
		setIsLocked(true);
		toast.info("ยกเลิกการแก้ไขและคืนค่าที่บันทึกล่าสุดแล้ว");
	};
	const handleBranchCreate = async () => {
		if (!newBranchName.trim()) return;
		try {
			await onAddBranch(newBranchName, newBranchCode);
			setNewBranchName("");
			setNewBranchCode("");
			toast.success("สร้างและบันทึกลง Supabase แล้ว");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "สร้างไม่สำเร็จ");
		}
	};
	const handleBranchUpdate = async () => {
		if (!activeBranchId || !branchNameInput.trim()) return;
		try {
			await onUpdateBranch(activeBranchId, {
				name: branchNameInput,
				code: branchCodeInput
			});
			setSavedBranchNameInput(branchNameInput);
			setSavedBranchCodeInput(branchCodeInput);
			toast.success("แก้ไขข้อมูลสาขาแล้ว");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "แก้ไขไม่สำเร็จ");
		}
	};
	const handleBranchSettingsSave = async () => {
		try {
			await onSaveBranchSettings(branchRateForm);
			setSavedBranchRateForm(branchRateForm);
			toast.success("บันทึกค่า override แล้ว");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "บันทึกค่าไม่สำเร็จ");
		}
	};
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
	const normalizeSheetId = () => {
		const raw = sheetIdInput.trim();
		if (!raw) return "";
		const normalized = extractSpreadsheetId(raw);
		if (!normalized || normalized.length < 10) throw new Error("Spreadsheet ID หรือ URL ของ Google Sheets ไม่ถูกต้อง");
		return normalized;
	};
	const commitSavedScopes = (savedScopes, normalizedSheetId, savedRates = rateForm) => {
		if (savedScopes.includes("theme")) setSavedColors(draftColors);
		if (savedScopes.includes("rates")) {
			setRateForm(savedRates);
			setDailyRateInput(String(savedRates.dailyRate ?? ""));
			setSavedRateForm(savedRates);
		}
		if (savedScopes.includes("spreadsheet")) {
			setSheetIdInput(normalizedSheetId);
			setSavedSheetId(normalizedSheetId);
		}
		if (savedScopes.includes("branch-rates")) setSavedBranchRateForm(branchRateForm);
		if (savedScopes.includes("branch-profile")) {
			setSavedBranchNameInput(branchNameInput);
			setSavedBranchCodeInput(branchCodeInput);
		}
	};
	const getValidatedRates = () => {
		const rawDailyRate = dailyRateInput.trim();
		if (!rawDailyRate) throw new Error("กรุณากรอกค่าแรงปกติก่อนบันทึก");
		const dailyRate = Number(rawDailyRate);
		if (!Number.isFinite(dailyRate) || dailyRate < 0) throw new Error("ค่าแรงปกติต้องเป็นตัวเลขที่ไม่ติดลบ");
		return {
			...rateForm,
			dailyRate
		};
	};
	const handleRatesSave = async () => {
		setIsSaving(true);
		try {
			const nextRates = getValidatedRates();
			const result = await createSaveCoordinator([{
				scope: "rates",
				dirty: ratesDirty,
				save: () => onSaveRates(nextRates)
			}]).save();
			commitSavedScopes(result.savedScopes, savedSheetId, nextRates);
			if (result.error) throw result.error;
			toast.success("บันทึกค่าแรง Global แล้ว");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "บันทึกค่าแรงไม่สำเร็จ");
		} finally {
			setIsSaving(false);
		}
	};
	const handleSpreadsheetSave = async () => {
		setIsSaving(true);
		try {
			const normalizedSheetId = normalizeSheetId();
			const result = await createSaveCoordinator([{
				scope: "spreadsheet",
				dirty: sheetIdInput !== savedSheetId,
				save: () => onSetSpreadsheetId(normalizedSheetId)
			}]).save();
			commitSavedScopes(result.savedScopes, normalizedSheetId);
			if (result.error) throw result.error;
			toast.success("บันทึก Google Sheets ID แล้ว");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "บันทึก Google Sheets ID ไม่สำเร็จ");
		} finally {
			setIsSaving(false);
		}
	};
	const handleThemeSave = async () => {
		setIsSaving(true);
		try {
			await onSaveThemeSettings(draftColors);
			setSavedColors(draftColors);
			toast.success("บันทึกธีมและสีแล้ว");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "บันทึกธีมไม่สำเร็จ");
		} finally {
			setIsSaving(false);
		}
	};
	const handleLayoutSave = async () => {
		setIsSaving(true);
		try {
			await layoutEditorRef.current?.saveDraft();
			setLayoutDirty(false);
			toast.success("บันทึก Layout Dashboard แล้ว");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "บันทึก Layout ไม่สำเร็จ");
		} finally {
			setIsSaving(false);
		}
	};
	const handleGeneralSave = async () => {
		setIsSaving(true);
		try {
			const branchProfileDirty = Boolean(activeBranchId && (branchNameInput !== savedBranchNameInput || branchCodeInput !== savedBranchCodeInput));
			const branchRatesDirty = Boolean(activeBranchId && JSON.stringify(branchRateForm) !== JSON.stringify(savedBranchRateForm));
			const result = await createSaveCoordinator([
				{
					scope: "rates",
					dirty: ratesDirty,
					save: () => onSaveRates(getValidatedRates())
				},
				{
					scope: "branch-profile",
					dirty: branchProfileDirty,
					validate: () => {
						if (!branchNameInput.trim()) throw new Error("กรุณากรอกชื่อสาขาก่อนบันทึก");
					},
					save: async () => {
						await onUpdateBranch(activeBranchId, {
							name: branchNameInput,
							code: branchCodeInput
						});
					}
				},
				{
					scope: "branch-rates",
					dirty: branchRatesDirty,
					save: () => onSaveBranchSettings(branchRateForm)
				}
			]).save();
			commitSavedScopes(result.savedScopes, savedSheetId);
			if (result.error) {
				const scopeLabel = result.failedScope ? ` (${result.failedScope})` : "";
				throw new Error(`${result.error instanceof Error ? result.error.message : "บันทึกไม่สำเร็จ"}${scopeLabel}`);
			}
			toast.success("บันทึกค่าแรงและข้อมูลสาขาแล้ว");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "บันทึกค่าแรงและสาขาไม่สำเร็จ");
		} finally {
			setIsSaving(false);
		}
	};
	const handleSaveAll = async () => {
		switch (activeTab) {
			case "theme":
				await handleThemeSave();
				break;
			case "general":
				await handleGeneralSave();
				break;
			case "layout":
				await handleLayoutSave();
				break;
			case "integrations":
				await handleSpreadsheetSave();
				break;
			default:
				toast.info("หมวดนี้บันทึกแยกตามรายการหรือไม่มีค่าที่ต้องบันทึก");
				return;
		}
		setIsLocked(true);
	};
	const handleResetColors = () => {
		const defaults = draftColors.themeMode === "dark" ? DEFAULT_COLORS_DARK : DEFAULT_COLORS_LIGHT;
		setDraftColors(defaults);
		toast.info("แสดงตัวอย่างสี Google Material แล้ว กด Save เพื่อบันทึกถาวร");
	};
	const selectGooglePreset = (presetId) => {
		const preset = GOOGLE_PRESETS.find((p) => p.id === presetId);
		if (!preset) return;
		const palette = draftColors.themeMode === "dark" || draftColors.themeMode === "system" && typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches ? preset.dark : preset.light;
		const next = {
			...draftColors,
			presetName: preset.id,
			primaryColor: palette.primaryColor,
			secondaryColor: palette.secondaryColor,
			accentColor: palette.accentColor,
			backgroundColor: palette.backgroundColor,
			cardColor: palette.cardColor,
			foregroundColor: palette.foregroundColor,
			borderColor: palette.borderColor,
			successColor: palette.successColor,
			warningColor: palette.warningColor,
			destructiveColor: palette.destructiveColor,
			chartColors: palette.chartColors
		};
		setDraftColors(next);
		toast.info(`แสดงตัวอย่างชุดสี ${preset.nameEn} แล้ว กด Save เพื่อบันทึกถาวร`);
	};
	const updateBorderRadius = (radius) => {
		const next = {
			...draftColors,
			borderRadius: radius
		};
		setDraftColors(next);
	};
	const updateDensity = (density) => {
		const next = {
			...draftColors,
			density
		};
		setDraftColors(next);
	};
	const updateColorToken = (key, value) => {
		const next = {
			...draftColors,
			[key]: value
		};
		setDraftColors(next);
	};
	const updateChartColor = (index, value) => {
		const nextCharts = [...draftColors.chartColors || DEFAULT_COLORS_LIGHT.chartColors];
		nextCharts[index] = value;
		const next = {
			...draftColors,
			chartColors: nextCharts
		};
		setDraftColors(next);
	};
	const pendingAirtableCount = logs.filter((l) => l.airtableSyncStatus !== "synced").length;
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
				className: "surface-card space-y-4 p-5",
				children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "flex flex-wrap items-start justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h2", {
						className: "flex items-center gap-2 text-lg font-bold",
						children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Settings2, { className: "h-5 w-5 text-primary" }, void 0, false, {
							fileName: _jsxFileName$2,
							lineNumber: 571,
							columnNumber: 15
						}, this), " ตั้งค่าระบบ (Settings)"]
					}, void 0, true, {
						fileName: _jsxFileName$2,
						lineNumber: 570,
						columnNumber: 13
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
						className: "text-xs text-muted-foreground",
						children: "Settings → Unlock → Edit → Preview → Save → Lock · การเปลี่ยนแปลงจะแสดงผลทันที และจะบันทึกถาวรเมื่อกด Save"
					}, void 0, false, {
						fileName: _jsxFileName$2,
						lineNumber: 573,
						columnNumber: 13
					}, this)] }, void 0, true, {
						fileName: _jsxFileName$2,
						lineNumber: 569,
						columnNumber: 11
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "flex flex-wrap items-center justify-end gap-2 text-[11px] font-semibold",
						children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
							className: `rounded-full px-2.5 py-1 ${isLocked ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"}`,
							children: isLocked ? "🔒 Locked" : "🔓 Editing"
						}, void 0, false, {
							fileName: _jsxFileName$2,
							lineNumber: 579,
							columnNumber: 13
						}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
							className: `rounded-full px-2.5 py-1 ${isDirty ? "bg-warning/15 text-warning-foreground" : "bg-success-soft text-success"}`,
							children: isDirty ? "⚠️ Unsaved changes" : "✓ Saved"
						}, void 0, false, {
							fileName: _jsxFileName$2,
							lineNumber: 584,
							columnNumber: 13
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName$2,
						lineNumber: 578,
						columnNumber: 11
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName$2,
					lineNumber: 568,
					columnNumber: 9
				}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "flex flex-wrap items-center gap-2 border-t border-border pt-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
							type: "button",
							onClick: handleUnlock,
							disabled: !isLocked,
							className: "flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-45",
							children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(LockOpen, { className: "h-4 w-4" }, void 0, false, {
								fileName: _jsxFileName$2,
								lineNumber: 598,
								columnNumber: 13
							}, this), " Unlock"]
						}, void 0, true, {
							fileName: _jsxFileName$2,
							lineNumber: 592,
							columnNumber: 11
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
							type: "button",
							onClick: handleLock,
							disabled: isLocked,
							className: "flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-45",
							children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Lock, { className: "h-4 w-4" }, void 0, false, {
								fileName: _jsxFileName$2,
								lineNumber: 606,
								columnNumber: 13
							}, this), " Lock"]
						}, void 0, true, {
							fileName: _jsxFileName$2,
							lineNumber: 600,
							columnNumber: 11
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
							type: "button",
							onClick: handleCancel,
							disabled: !isDirty,
							className: "flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-45",
							children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(RotateCcw, { className: "h-4 w-4" }, void 0, false, {
								fileName: _jsxFileName$2,
								lineNumber: 614,
								columnNumber: 13
							}, this), " Cancel"]
						}, void 0, true, {
							fileName: _jsxFileName$2,
							lineNumber: 608,
							columnNumber: 11
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
							type: "button",
							onClick: () => void handleSaveAll(),
							disabled: isLocked || !isDirty || isSaving,
							className: "flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-50",
							children: [
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Save, { className: "h-4 w-4" }, void 0, false, {
									fileName: _jsxFileName$2,
									lineNumber: 622,
									columnNumber: 13
								}, this),
								" ",
								isSaving ? "กำลังบันทึก…" : "Save หมวดนี้"
							]
						}, void 0, true, {
							fileName: _jsxFileName$2,
							lineNumber: 616,
							columnNumber: 11
						}, this),
						isDirty && /* @__PURE__ */ (void 0)("span", {
							className: "flex items-center gap-1 text-[11px] text-warning-foreground",
							children: [/* @__PURE__ */ (void 0)(TriangleAlert, { className: "h-3.5 w-3.5" }, void 0, false, {
								fileName: _jsxFileName$2,
								lineNumber: 626,
								columnNumber: 15
							}, this), " ต้องกด Save ก่อนออกจากหน้า"]
						}, void 0, true, {
							fileName: _jsxFileName$2,
							lineNumber: 625,
							columnNumber: 13
						}, this)
					]
				}, void 0, true, {
					fileName: _jsxFileName$2,
					lineNumber: 591,
					columnNumber: 9
				}, this)]
			}, void 0, true, {
				fileName: _jsxFileName$2,
				lineNumber: 567,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
				className: "surface-card flex overflow-x-auto rounded-2xl p-1 text-xs font-medium scrollbar-none",
				children: [
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
						onClick: () => setActiveTab("worktypes"),
						className: `flex items-center gap-2 shrink-0 rounded-xl px-4 py-2.5 transition ${activeTab === "worktypes" ? "bg-primary text-primary-foreground font-bold shadow" : "text-muted-foreground hover:bg-accent"}`,
						children: [
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Briefcase, { className: "h-4 w-4" }, void 0, false, {
								fileName: _jsxFileName$2,
								lineNumber: 642,
								columnNumber: 11
							}, this),
							" ประเภทงาน (",
							workTypes.filter((w) => w.is_active).length,
							")"
						]
					}, void 0, true, {
						fileName: _jsxFileName$2,
						lineNumber: 634,
						columnNumber: 9
					}, this),
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
						onClick: () => setActiveTab("ot"),
						className: `flex items-center gap-2 shrink-0 rounded-xl px-4 py-2.5 transition ${activeTab === "ot" ? "bg-primary text-primary-foreground font-bold shadow" : "text-muted-foreground hover:bg-accent"}`,
						children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Clock, { className: "h-4 w-4" }, void 0, false, {
							fileName: _jsxFileName$2,
							lineNumber: 653,
							columnNumber: 11
						}, this), " ประเภท OT"]
					}, void 0, true, {
						fileName: _jsxFileName$2,
						lineNumber: 645,
						columnNumber: 9
					}, this),
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
						onClick: () => setActiveTab("theme"),
						className: `flex items-center gap-2 shrink-0 rounded-xl px-4 py-2.5 transition ${activeTab === "theme" ? "bg-primary text-primary-foreground font-bold shadow" : "text-muted-foreground hover:bg-accent"}`,
						children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Palette, { className: "h-4 w-4" }, void 0, false, {
							fileName: _jsxFileName$2,
							lineNumber: 663,
							columnNumber: 11
						}, this), " ธีม & สีกราฟ"]
					}, void 0, true, {
						fileName: _jsxFileName$2,
						lineNumber: 655,
						columnNumber: 9
					}, this),
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
						onClick: () => setActiveTab("general"),
						className: `flex items-center gap-2 shrink-0 rounded-xl px-4 py-2.5 transition ${activeTab === "general" ? "bg-primary text-primary-foreground font-bold shadow" : "text-muted-foreground hover:bg-accent"}`,
						children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Settings2, { className: "h-4 w-4" }, void 0, false, {
							fileName: _jsxFileName$2,
							lineNumber: 673,
							columnNumber: 11
						}, this), " ค่าแรง &"]
					}, void 0, true, {
						fileName: _jsxFileName$2,
						lineNumber: 665,
						columnNumber: 9
					}, this),
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
						onClick: () => setActiveTab("layout"),
						className: `flex items-center gap-2 shrink-0 rounded-xl px-4 py-2.5 transition ${activeTab === "layout" ? "bg-primary text-primary-foreground font-bold shadow" : "text-muted-foreground hover:bg-accent"}`,
						children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Maximize2, { className: "h-4 w-4" }, void 0, false, {
							fileName: _jsxFileName$2,
							lineNumber: 683,
							columnNumber: 11
						}, this), " Layout Dashboard"]
					}, void 0, true, {
						fileName: _jsxFileName$2,
						lineNumber: 675,
						columnNumber: 9
					}, this),
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
						onClick: () => setActiveTab("authentication"),
						className: `flex items-center gap-2 shrink-0 rounded-xl px-4 py-2.5 transition ${activeTab === "authentication" ? "bg-primary text-primary-foreground font-bold shadow" : "text-muted-foreground hover:bg-accent"}`,
						children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(ShieldCheck, { className: "h-4 w-4" }, void 0, false, {
							fileName: _jsxFileName$2,
							lineNumber: 693,
							columnNumber: 11
						}, this), " Authentication"]
					}, void 0, true, {
						fileName: _jsxFileName$2,
						lineNumber: 685,
						columnNumber: 9
					}, this),
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
						onClick: () => setActiveTab("integrations"),
						className: `flex items-center gap-2 shrink-0 rounded-xl px-4 py-2.5 transition ${activeTab === "integrations" ? "bg-primary text-primary-foreground font-bold shadow" : "text-muted-foreground hover:bg-accent"}`,
						children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Database, { className: "h-4 w-4" }, void 0, false, {
							fileName: _jsxFileName$2,
							lineNumber: 703,
							columnNumber: 11
						}, this), " Supabase & Airtable"]
					}, void 0, true, {
						fileName: _jsxFileName$2,
						lineNumber: 695,
						columnNumber: 9
					}, this)
				]
			}, void 0, true, {
				fileName: _jsxFileName$2,
				lineNumber: 633,
				columnNumber: 7
			}, this),
			activeTab === "worktypes" && /* @__PURE__ */ (void 0)("div", {
				className: "surface-card p-5",
				children: /* @__PURE__ */ (void 0)("fieldset", {
					disabled: isLocked,
					className: "space-y-4",
					children: [
						/* @__PURE__ */ (void 0)("div", {
							className: "flex flex-col gap-1",
							children: [/* @__PURE__ */ (void 0)("h3", {
								className: "font-bold text-base",
								children: "การจัดการประเภทงาน (Work Types)"
							}, void 0, false, {
								fileName: _jsxFileName$2,
								lineNumber: 712,
								columnNumber: 15
							}, this), /* @__PURE__ */ (void 0)("p", {
								className: "text-xs text-muted-foreground",
								children: "ข้อมูลประเภทงานถูกบันทึกลง Supabase เสมอ Refresh หรือเปลี่ยน Browser ข้อมูลไม่หาย (มี ID ถาวร, Soft Delete ไม่ทำลายประวัติเก่า)"
							}, void 0, false, {
								fileName: _jsxFileName$2,
								lineNumber: 713,
								columnNumber: 15
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName$2,
							lineNumber: 711,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ (void 0)("div", {
							className: "flex gap-2",
							children: [/* @__PURE__ */ (void 0)("input", {
								value: newWorkType,
								onChange: (e) => setNewWorkType(e.target.value),
								onKeyDown: (e) => e.key === "Enter" && void handleWorkTypeAdd(),
								placeholder: "เพิ่มประเภทงานใหม่ เช่น คลังสินค้า",
								"aria-label": "เพิ่มประเภทงานใหม่",
								className: "flex-1 rounded-xl border border-input bg-secondary p-2.5 text-sm"
							}, void 0, false, {
								fileName: _jsxFileName$2,
								lineNumber: 720,
								columnNumber: 15
							}, this), /* @__PURE__ */ (void 0)("button", {
								onClick: () => void handleWorkTypeAdd(),
								className: "flex items-center gap-1 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground active:scale-95",
								children: [/* @__PURE__ */ (void 0)(Plus, { className: "h-4 w-4" }, void 0, false, {
									fileName: _jsxFileName$2,
									lineNumber: 732,
									columnNumber: 17
								}, this), " เพิ่ม"]
							}, void 0, true, {
								fileName: _jsxFileName$2,
								lineNumber: 728,
								columnNumber: 15
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName$2,
							lineNumber: 719,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ (void 0)("div", {
							className: "divide-y divide-border rounded-xl border border-border bg-card",
							children: workTypes.length === 0 ? /* @__PURE__ */ (void 0)("div", {
								className: "p-6 text-center text-xs text-muted-foreground",
								children: "ยังไม่มีประเภทงานในระบบ"
							}, void 0, false, {
								fileName: _jsxFileName$2,
								lineNumber: 738,
								columnNumber: 17
							}, this) : workTypes.map((wt) => /* @__PURE__ */ (void 0)("div", {
								className: "flex items-center justify-between p-3 text-sm",
								children: [editingWtId === wt.id ? /* @__PURE__ */ (void 0)("div", {
									className: "flex flex-1 items-center gap-2 pr-2",
									children: [/* @__PURE__ */ (void 0)("input", {
										value: editingWtName,
										onChange: (e) => setEditingWtName(e.target.value),
										className: "w-full rounded-lg border border-input bg-secondary p-1.5 text-sm"
									}, void 0, false, {
										fileName: _jsxFileName$2,
										lineNumber: 746,
										columnNumber: 25
									}, this), /* @__PURE__ */ (void 0)("button", {
										onClick: () => void handleWorkTypeEditSave(wt.id),
										className: "rounded-lg bg-success px-2.5 py-1 text-xs font-semibold text-success-foreground",
										children: /* @__PURE__ */ (void 0)(Check, { className: "h-4 w-4" }, void 0, false, {
											fileName: _jsxFileName$2,
											lineNumber: 755,
											columnNumber: 27
										}, this)
									}, void 0, false, {
										fileName: _jsxFileName$2,
										lineNumber: 751,
										columnNumber: 25
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName$2,
									lineNumber: 745,
									columnNumber: 23
								}, this) : /* @__PURE__ */ (void 0)("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (void 0)("span", {
										className: `font-medium ${!wt.is_active ? "line-through text-muted-foreground" : ""}`,
										children: wt.name
									}, void 0, false, {
										fileName: _jsxFileName$2,
										lineNumber: 760,
										columnNumber: 25
									}, this), wt.is_active ? /* @__PURE__ */ (void 0)("span", {
										className: "rounded-full bg-success-soft px-2 py-0.5 text-[10px] font-semibold text-success",
										children: "ใช้งาน"
									}, void 0, false, {
										fileName: _jsxFileName$2,
										lineNumber: 766,
										columnNumber: 27
									}, this) : /* @__PURE__ */ (void 0)("span", {
										className: "rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground",
										children: "ปิดใช้งาน (Soft Deleted)"
									}, void 0, false, {
										fileName: _jsxFileName$2,
										lineNumber: 770,
										columnNumber: 27
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName$2,
									lineNumber: 759,
									columnNumber: 23
								}, this), /* @__PURE__ */ (void 0)("div", {
									className: "flex items-center gap-2",
									children: [
										/* @__PURE__ */ (void 0)("button", {
											onClick: () => void onToggleWorkType(wt.id),
											className: `text-xs font-medium px-2.5 py-1 rounded-lg border ${wt.is_active ? "border-border text-muted-foreground hover:bg-accent" : "border-success text-success hover:bg-success-soft"}`,
											children: wt.is_active ? "ปิดใช้งาน" : "เปิดใช้งาน"
										}, void 0, false, {
											fileName: _jsxFileName$2,
											lineNumber: 778,
											columnNumber: 23
										}, this),
										/* @__PURE__ */ (void 0)("button", {
											onClick: () => {
												setEditingWtId(wt.id);
												setEditingWtName(wt.name);
											},
											title: "แก้ไขชื่อประเภทงาน",
											className: "rounded-lg p-1.5 text-primary hover:bg-accent",
											children: /* @__PURE__ */ (void 0)(Pencil, { className: "h-4 w-4" }, void 0, false, {
												fileName: _jsxFileName$2,
												lineNumber: 797,
												columnNumber: 25
											}, this)
										}, void 0, false, {
											fileName: _jsxFileName$2,
											lineNumber: 789,
											columnNumber: 23
										}, this),
										/* @__PURE__ */ (void 0)("button", {
											onClick: () => void onSoftDeleteWorkType(wt.id),
											title: "Soft Delete ประเภทงาน",
											className: "rounded-lg p-1.5 text-destructive hover:bg-destructive/10",
											children: /* @__PURE__ */ (void 0)(Trash2, { className: "h-4 w-4" }, void 0, false, {
												fileName: _jsxFileName$2,
												lineNumber: 805,
												columnNumber: 25
											}, this)
										}, void 0, false, {
											fileName: _jsxFileName$2,
											lineNumber: 800,
											columnNumber: 23
										}, this)
									]
								}, void 0, true, {
									fileName: _jsxFileName$2,
									lineNumber: 777,
									columnNumber: 21
								}, this)]
							}, wt.id, true, {
								fileName: _jsxFileName$2,
								lineNumber: 743,
								columnNumber: 19
							}, this))
						}, void 0, false, {
							fileName: _jsxFileName$2,
							lineNumber: 736,
							columnNumber: 13
						}, this)
					]
				}, void 0, true, {
					fileName: _jsxFileName$2,
					lineNumber: 710,
					columnNumber: 11
				}, this)
			}, void 0, false, {
				fileName: _jsxFileName$2,
				lineNumber: 709,
				columnNumber: 9
			}, this),
			activeTab === "ot" && /* @__PURE__ */ (void 0)("div", {
				className: "surface-card space-y-4 p-5",
				children: [/* @__PURE__ */ (void 0)("div", {
					className: "flex flex-col gap-1",
					children: [/* @__PURE__ */ (void 0)("h3", {
						className: "font-bold text-base",
						children: "การจัดการประเภท OT (OT Types)"
					}, void 0, false, {
						fileName: _jsxFileName$2,
						lineNumber: 820,
						columnNumber: 13
					}, this), /* @__PURE__ */ (void 0)("p", {
						className: "text-xs text-muted-foreground",
						children: "รองรับตัวเลือก \"ไม่มี OT\" (Multiplier = 0) และคำนวณยอด OT แยกอย่างชัดเจน"
					}, void 0, false, {
						fileName: _jsxFileName$2,
						lineNumber: 821,
						columnNumber: 13
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName$2,
					lineNumber: 819,
					columnNumber: 11
				}, this), /* @__PURE__ */ (void 0)("div", {
					className: "grid grid-cols-1 gap-3 md:grid-cols-2",
					children: (otTypes.length > 0 ? otTypes : OT_OPTIONS.map((o) => ({
						id: `ot-${o.value}`,
						name: o.label,
						multiplier: o.value,
						is_active: true
					}))).map((ot) => /* @__PURE__ */ (void 0)("div", {
						className: `flex items-center justify-between rounded-xl border p-4 ${ot.multiplier === 0 ? "border-primary/40 bg-primary/5" : "border-border bg-card"}`,
						children: [/* @__PURE__ */ (void 0)("div", { children: [/* @__PURE__ */ (void 0)("div", {
							className: "font-bold text-sm flex items-center gap-2",
							children: [ot.name, ot.multiplier === 0 && /* @__PURE__ */ (void 0)("span", {
								className: "rounded-full bg-primary/20 text-primary px-2 py-0.5 text-[10px] font-bold",
								children: "ไม่มี OT (0x)"
							}, void 0, false, {
								fileName: _jsxFileName$2,
								lineNumber: 846,
								columnNumber: 23
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName$2,
							lineNumber: 843,
							columnNumber: 19
						}, this), /* @__PURE__ */ (void 0)("div", {
							className: "text-xs text-muted-foreground mt-0.5",
							children: [
								"ตัวคูณ: ",
								ot.multiplier,
								" เท่า"
							]
						}, void 0, true, {
							fileName: _jsxFileName$2,
							lineNumber: 851,
							columnNumber: 19
						}, this)] }, void 0, true, {
							fileName: _jsxFileName$2,
							lineNumber: 842,
							columnNumber: 17
						}, this), /* @__PURE__ */ (void 0)("div", {
							className: "text-right font-mono font-bold text-sm text-primary",
							children: ["x", ot.multiplier]
						}, void 0, true, {
							fileName: _jsxFileName$2,
							lineNumber: 855,
							columnNumber: 17
						}, this)]
					}, ot.id, true, {
						fileName: _jsxFileName$2,
						lineNumber: 836,
						columnNumber: 15
					}, this))
				}, void 0, false, {
					fileName: _jsxFileName$2,
					lineNumber: 826,
					columnNumber: 11
				}, this)]
			}, void 0, true, {
				fileName: _jsxFileName$2,
				lineNumber: 818,
				columnNumber: 9
			}, this),
			activeTab === "theme" && /* @__PURE__ */ (void 0)("div", {
				className: "surface-card p-5",
				children: [/* @__PURE__ */ (void 0)("fieldset", {
					disabled: isLocked,
					className: "space-y-6",
					children: [
						/* @__PURE__ */ (void 0)("div", {
							className: "flex flex-wrap items-center justify-between gap-2 border-b border-border pb-4",
							children: [/* @__PURE__ */ (void 0)("div", { children: [/* @__PURE__ */ (void 0)("h3", {
								className: "font-bold text-base flex items-center gap-2",
								children: [/* @__PURE__ */ (void 0)(Sparkles, { className: "h-5 w-5 text-primary" }, void 0, false, {
									fileName: _jsxFileName$2,
									lineNumber: 871,
									columnNumber: 19
								}, this), " ปรับแต่งธีม & ดีไซน์ (Google-style Theme System)"]
							}, void 0, true, {
								fileName: _jsxFileName$2,
								lineNumber: 870,
								columnNumber: 17
							}, this), /* @__PURE__ */ (void 0)("p", {
								className: "text-xs text-muted-foreground mt-0.5",
								children: "เลือกชุดสี Google Workspace ปรับโหมด Light / Dark ปรับแต่งมุมโค้ง ความหนาแน่น และสี Token ทั้งหมด"
							}, void 0, false, {
								fileName: _jsxFileName$2,
								lineNumber: 874,
								columnNumber: 17
							}, this)] }, void 0, true, {
								fileName: _jsxFileName$2,
								lineNumber: 869,
								columnNumber: 15
							}, this), /* @__PURE__ */ (void 0)("button", {
								onClick: () => void handleResetColors(),
								className: "flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground transition hover:bg-accent hover:text-foreground cursor-pointer",
								children: [/* @__PURE__ */ (void 0)(RotateCcw, { className: "h-3.5 w-3.5" }, void 0, false, {
									fileName: _jsxFileName$2,
									lineNumber: 883,
									columnNumber: 17
								}, this), " รีเซ็ตเป็น Google Default"]
							}, void 0, true, {
								fileName: _jsxFileName$2,
								lineNumber: 879,
								columnNumber: 15
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName$2,
							lineNumber: 868,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ (void 0)("div", {
							className: "space-y-3",
							children: [/* @__PURE__ */ (void 0)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (void 0)("label", {
									className: "text-xs font-bold text-muted-foreground uppercase tracking-wider block",
									children: "ชุดสีทางการของ Google (Google Color Presets)"
								}, void 0, false, {
									fileName: _jsxFileName$2,
									lineNumber: 890,
									columnNumber: 17
								}, this), /* @__PURE__ */ (void 0)("span", {
									className: "text-[11px] text-primary font-semibold",
									children: "6 ชุดสีมาตรฐาน"
								}, void 0, false, {
									fileName: _jsxFileName$2,
									lineNumber: 893,
									columnNumber: 17
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName$2,
								lineNumber: 889,
								columnNumber: 15
							}, this), /* @__PURE__ */ (void 0)("div", {
								className: "grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3",
								children: GOOGLE_PRESETS.map((preset) => {
									return /* @__PURE__ */ (void 0)("button", {
										type: "button",
										onClick: () => selectGooglePreset(preset.id),
										className: `flex items-center justify-between rounded-xl border p-3 text-left transition cursor-pointer ${draftColors.presetName === preset.id || !draftColors.presetName && preset.id === "google-blue" ? "border-primary bg-primary/10 ring-2 ring-primary shadow-sm" : "border-border bg-card hover:bg-accent/70"}`,
										children: [/* @__PURE__ */ (void 0)("div", {
											className: "space-y-1",
											children: [/* @__PURE__ */ (void 0)("p", {
												className: "text-xs font-bold text-foreground",
												children: preset.nameEn
											}, void 0, false, {
												fileName: _jsxFileName$2,
												lineNumber: 912,
												columnNumber: 25
											}, this), /* @__PURE__ */ (void 0)("p", {
												className: "text-[10px] text-muted-foreground",
												children: preset.name
											}, void 0, false, {
												fileName: _jsxFileName$2,
												lineNumber: 913,
												columnNumber: 25
											}, this)]
										}, void 0, true, {
											fileName: _jsxFileName$2,
											lineNumber: 911,
											columnNumber: 23
										}, this), /* @__PURE__ */ (void 0)("div", {
											className: "flex items-center gap-1.5",
											children: [/* @__PURE__ */ (void 0)("span", {
												className: "h-4 w-4 rounded-full border border-black/10 shadow-sm",
												style: { backgroundColor: preset.primaryColor },
												title: "Primary"
											}, void 0, false, {
												fileName: _jsxFileName$2,
												lineNumber: 916,
												columnNumber: 25
											}, this), /* @__PURE__ */ (void 0)("span", {
												className: "h-4 w-4 rounded-full border border-black/10 shadow-sm",
												style: { backgroundColor: preset.accentColor },
												title: "Accent"
											}, void 0, false, {
												fileName: _jsxFileName$2,
												lineNumber: 921,
												columnNumber: 25
											}, this)]
										}, void 0, true, {
											fileName: _jsxFileName$2,
											lineNumber: 915,
											columnNumber: 23
										}, this)]
									}, preset.id, true, {
										fileName: _jsxFileName$2,
										lineNumber: 901,
										columnNumber: 21
									}, this);
								})
							}, void 0, false, {
								fileName: _jsxFileName$2,
								lineNumber: 895,
								columnNumber: 15
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName$2,
							lineNumber: 888,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ (void 0)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (void 0)("label", {
								className: "text-xs font-bold text-muted-foreground uppercase tracking-wider block",
								children: "โหมดแสดงผล (Appearance Mode)"
							}, void 0, false, {
								fileName: _jsxFileName$2,
								lineNumber: 935,
								columnNumber: 15
							}, this), /* @__PURE__ */ (void 0)("div", {
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
										label: "ตามระบบ (System)",
										icon: Laptop
									}
								].map(({ mode, label, icon: Icon }) => /* @__PURE__ */ (void 0)("button", {
									type: "button",
									onClick: () => {
										const next = {
											...draftColors,
											themeMode: mode
										};
										setDraftColors(next);
									},
									className: `flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-bold transition cursor-pointer ${draftColors.themeMode === mode ? "border-primary bg-primary text-primary-foreground shadow" : "border-border bg-card text-foreground hover:bg-accent"}`,
									children: [
										/* @__PURE__ */ (void 0)(Icon, { className: "h-4 w-4" }, void 0, false, {
											fileName: _jsxFileName$2,
											lineNumber: 959,
											columnNumber: 21
										}, this),
										" ",
										label
									]
								}, mode, true, {
									fileName: _jsxFileName$2,
									lineNumber: 946,
									columnNumber: 19
								}, this))
							}, void 0, false, {
								fileName: _jsxFileName$2,
								lineNumber: 938,
								columnNumber: 15
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName$2,
							lineNumber: 934,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ (void 0)("div", {
							className: "grid grid-cols-1 gap-4 sm:grid-cols-2",
							children: [/* @__PURE__ */ (void 0)("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ (void 0)("label", {
									className: "text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5",
									children: [/* @__PURE__ */ (void 0)(SlidersVertical, { className: "h-3.5 w-3.5 text-primary" }, void 0, false, {
										fileName: _jsxFileName$2,
										lineNumber: 970,
										columnNumber: 19
									}, this), " มุมโค้งของกรอบ (Corner Radius)"]
								}, void 0, true, {
									fileName: _jsxFileName$2,
									lineNumber: 969,
									columnNumber: 17
								}, this), /* @__PURE__ */ (void 0)("div", {
									className: "grid grid-cols-5 gap-1.5",
									children: [
										{
											id: "sharp",
											label: "Sharp",
											radius: "4px"
										},
										{
											id: "compact",
											label: "Compact",
											radius: "8px"
										},
										{
											id: "normal",
											label: "Normal",
											radius: "12px"
										},
										{
											id: "smooth",
											label: "Smooth",
											radius: "16px"
										},
										{
											id: "pill",
											label: "Pill",
											radius: "24px"
										}
									].map(({ id, label, radius }) => {
										return /* @__PURE__ */ (void 0)("button", {
											type: "button",
											onClick: () => updateBorderRadius(id),
											className: `flex flex-col items-center justify-center p-2 text-center transition cursor-pointer border ${draftColors.borderRadius === id || !draftColors.borderRadius && id === "normal" ? "border-primary bg-primary/10 text-primary font-bold shadow-sm" : "border-border bg-card text-foreground hover:bg-accent"}`,
											style: { borderRadius: radius },
											children: [/* @__PURE__ */ (void 0)("span", {
												className: "text-[11px]",
												children: label
											}, void 0, false, {
												fileName: _jsxFileName$2,
												lineNumber: 997,
												columnNumber: 25
											}, this), /* @__PURE__ */ (void 0)("span", {
												className: "text-[9px] text-muted-foreground",
												children: radius
											}, void 0, false, {
												fileName: _jsxFileName$2,
												lineNumber: 998,
												columnNumber: 25
											}, this)]
										}, id, true, {
											fileName: _jsxFileName$2,
											lineNumber: 986,
											columnNumber: 23
										}, this);
									})
								}, void 0, false, {
									fileName: _jsxFileName$2,
									lineNumber: 972,
									columnNumber: 17
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName$2,
								lineNumber: 968,
								columnNumber: 15
							}, this), /* @__PURE__ */ (void 0)("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ (void 0)("label", {
									className: "text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5",
									children: [/* @__PURE__ */ (void 0)(Maximize2, { className: "h-3.5 w-3.5 text-primary" }, void 0, false, {
										fileName: _jsxFileName$2,
										lineNumber: 1008,
										columnNumber: 19
									}, this), " ความหนาแน่นของ UI (Density)"]
								}, void 0, true, {
									fileName: _jsxFileName$2,
									lineNumber: 1007,
									columnNumber: 17
								}, this), /* @__PURE__ */ (void 0)("div", {
									className: "grid grid-cols-3 gap-2",
									children: [
										{
											id: "compact",
											label: "กะทัดรัด (Compact)"
										},
										{
											id: "normal",
											label: "มาตรฐาน (Normal)"
										},
										{
											id: "comfortable",
											label: "โปร่งสบาย (Spacious)"
										}
									].map(({ id, label }) => {
										return /* @__PURE__ */ (void 0)("button", {
											type: "button",
											onClick: () => updateDensity(id),
											className: `flex items-center justify-center rounded-xl border p-2.5 text-xs font-medium transition cursor-pointer ${draftColors.density === id || !draftColors.density && id === "normal" ? "border-primary bg-primary/10 text-primary font-bold shadow-sm" : "border-border bg-card text-foreground hover:bg-accent"}`,
											children: label
										}, id, false, {
											fileName: _jsxFileName$2,
											lineNumber: 1021,
											columnNumber: 23
										}, this);
									})
								}, void 0, false, {
									fileName: _jsxFileName$2,
									lineNumber: 1010,
									columnNumber: 17
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName$2,
								lineNumber: 1006,
								columnNumber: 15
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName$2,
							lineNumber: 966,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ (void 0)("div", {
							className: "space-y-3 rounded-2xl border border-border bg-muted/30 p-4",
							children: [/* @__PURE__ */ (void 0)("div", {
								className: "flex items-center justify-between gap-2",
								children: /* @__PURE__ */ (void 0)("div", { children: [/* @__PURE__ */ (void 0)("h4", {
									className: "text-sm font-bold flex items-center gap-1.5",
									children: [/* @__PURE__ */ (void 0)(Palette, { className: "h-4 w-4 text-primary" }, void 0, false, {
										fileName: _jsxFileName$2,
										lineNumber: 1044,
										columnNumber: 21
									}, this), " ตัวอย่างการแสดงผลสด (Live Interactive Preview)"]
								}, void 0, true, {
									fileName: _jsxFileName$2,
									lineNumber: 1043,
									columnNumber: 19
								}, this), /* @__PURE__ */ (void 0)("p", {
									className: "mt-0.5 text-[11px] text-muted-foreground",
									children: "ทดสอบองค์ประกอบจริงทันทีเมื่อเปลี่ยนสี มุมโค้ง หรือความหนาแน่น"
								}, void 0, false, {
									fileName: _jsxFileName$2,
									lineNumber: 1047,
									columnNumber: 19
								}, this)] }, void 0, true, {
									fileName: _jsxFileName$2,
									lineNumber: 1042,
									columnNumber: 17
								}, this)
							}, void 0, false, {
								fileName: _jsxFileName$2,
								lineNumber: 1041,
								columnNumber: 15
							}, this), /* @__PURE__ */ (void 0)("div", {
								className: "grid grid-cols-1 gap-3 sm:grid-cols-3",
								children: [
									/* @__PURE__ */ (void 0)("div", {
										className: "rounded-xl border border-border bg-card p-3 space-y-2",
										children: [/* @__PURE__ */ (void 0)("p", {
											className: "text-[11px] font-semibold text-muted-foreground",
											children: "Button Styles"
										}, void 0, false, {
											fileName: _jsxFileName$2,
											lineNumber: 1055,
											columnNumber: 19
										}, this), /* @__PURE__ */ (void 0)("div", {
											className: "flex flex-wrap gap-2",
											children: [
												/* @__PURE__ */ (void 0)("button", {
													type: "button",
													className: "rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/90 transition",
													children: "Primary"
												}, void 0, false, {
													fileName: _jsxFileName$2,
													lineNumber: 1057,
													columnNumber: 21
												}, this),
												/* @__PURE__ */ (void 0)("button", {
													type: "button",
													className: "rounded-lg bg-secondary px-3 py-1.5 text-xs font-bold text-secondary-foreground shadow-sm hover:bg-secondary/80 transition",
													children: "Secondary"
												}, void 0, false, {
													fileName: _jsxFileName$2,
													lineNumber: 1063,
													columnNumber: 21
												}, this),
												/* @__PURE__ */ (void 0)("button", {
													type: "button",
													className: "rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-accent transition",
													children: "Outline"
												}, void 0, false, {
													fileName: _jsxFileName$2,
													lineNumber: 1069,
													columnNumber: 21
												}, this)
											]
										}, void 0, true, {
											fileName: _jsxFileName$2,
											lineNumber: 1056,
											columnNumber: 19
										}, this)]
									}, void 0, true, {
										fileName: _jsxFileName$2,
										lineNumber: 1054,
										columnNumber: 17
									}, this),
									/* @__PURE__ */ (void 0)("div", {
										className: "rounded-xl border border-border bg-card p-3 space-y-2",
										children: [/* @__PURE__ */ (void 0)("p", {
											className: "text-[11px] font-semibold text-muted-foreground",
											children: "Status Chips"
										}, void 0, false, {
											fileName: _jsxFileName$2,
											lineNumber: 1080,
											columnNumber: 19
										}, this), /* @__PURE__ */ (void 0)("div", {
											className: "flex flex-wrap gap-1.5 text-[10px] font-bold",
											children: [
												/* @__PURE__ */ (void 0)("span", {
													className: "rounded-full bg-success-soft px-2.5 py-1 text-success border border-success/20",
													children: "สำเร็จ (Success)"
												}, void 0, false, {
													fileName: _jsxFileName$2,
													lineNumber: 1082,
													columnNumber: 21
												}, this),
												/* @__PURE__ */ (void 0)("span", {
													className: "rounded-full bg-warning-soft px-2.5 py-1 text-warning-foreground border border-warning/20",
													children: "รอซิงก์ (Pending)"
												}, void 0, false, {
													fileName: _jsxFileName$2,
													lineNumber: 1085,
													columnNumber: 21
												}, this),
												/* @__PURE__ */ (void 0)("span", {
													className: "rounded-full bg-destructive-soft px-2.5 py-1 text-destructive border border-destructive/20",
													children: "แจ้งเตือน (Alert)"
												}, void 0, false, {
													fileName: _jsxFileName$2,
													lineNumber: 1088,
													columnNumber: 21
												}, this)
											]
										}, void 0, true, {
											fileName: _jsxFileName$2,
											lineNumber: 1081,
											columnNumber: 19
										}, this)]
									}, void 0, true, {
										fileName: _jsxFileName$2,
										lineNumber: 1079,
										columnNumber: 17
									}, this),
									/* @__PURE__ */ (void 0)("div", {
										className: "rounded-xl border border-border bg-card p-3 space-y-2",
										children: [/* @__PURE__ */ (void 0)("p", {
											className: "text-[11px] font-semibold text-muted-foreground",
											children: "Chart Roles (5 สีกราฟ)"
										}, void 0, false, {
											fileName: _jsxFileName$2,
											lineNumber: 1096,
											columnNumber: 19
										}, this), /* @__PURE__ */ (void 0)("div", {
											className: "flex h-7 items-end gap-1",
											"aria-label": "ตัวอย่างชุดสีกราฟ",
											children: (draftColors.chartColors || DEFAULT_COLORS_LIGHT.chartColors).map((color, index) => /* @__PURE__ */ (void 0)("span", {
												className: "min-w-0 flex-1 rounded-t-md transition-all duration-300",
												style: {
													backgroundColor: color,
													height: `${40 + index * 14}%`
												},
												title: `Chart role ${index + 1}: ${color}`
											}, index, false, {
												fileName: _jsxFileName$2,
												lineNumber: 1102,
												columnNumber: 25
											}, this))
										}, void 0, false, {
											fileName: _jsxFileName$2,
											lineNumber: 1099,
											columnNumber: 19
										}, this)]
									}, void 0, true, {
										fileName: _jsxFileName$2,
										lineNumber: 1095,
										columnNumber: 17
									}, this)
								]
							}, void 0, true, {
								fileName: _jsxFileName$2,
								lineNumber: 1052,
								columnNumber: 15
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName$2,
							lineNumber: 1040,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ (void 0)("div", {
							className: "space-y-5 pt-2",
							children: [
								/* @__PURE__ */ (void 0)("div", {
									className: "rounded-xl border border-primary/20 bg-info-soft/40 p-3",
									children: /* @__PURE__ */ (void 0)("div", {
										className: "flex items-center justify-between",
										children: [/* @__PURE__ */ (void 0)("h4", {
											className: "text-xs font-bold text-primary",
											children: "ปรับแต่งค่าสีเฉพาะตัว (Custom Semantic Tokens)"
										}, void 0, false, {
											fileName: _jsxFileName$2,
											lineNumber: 1119,
											columnNumber: 19
										}, this), /* @__PURE__ */ (void 0)("span", {
											className: "text-[10px] text-muted-foreground font-mono",
											children: "11 Tokens + 5 Chart Roles"
										}, void 0, false, {
											fileName: _jsxFileName$2,
											lineNumber: 1122,
											columnNumber: 19
										}, this)]
									}, void 0, true, {
										fileName: _jsxFileName$2,
										lineNumber: 1118,
										columnNumber: 17
									}, this)
								}, void 0, false, {
									fileName: _jsxFileName$2,
									lineNumber: 1117,
									columnNumber: 15
								}, this),
								/* @__PURE__ */ (void 0)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (void 0)("h4", {
										className: "text-xs font-bold tracking-wider text-muted-foreground uppercase",
										children: "พื้นหลังและพื้นผิว (Surfaces)"
									}, void 0, false, {
										fileName: _jsxFileName$2,
										lineNumber: 1130,
										columnNumber: 17
									}, this), /* @__PURE__ */ (void 0)("div", {
										className: "grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4",
										children: [
											/* @__PURE__ */ (void 0)(ColorPickerField, {
												label: "พื้นหลังหลัก (Background)",
												value: draftColors.backgroundColor,
												onChange: (v) => updateColorToken("backgroundColor", v)
											}, void 0, false, {
												fileName: _jsxFileName$2,
												lineNumber: 1134,
												columnNumber: 19
											}, this),
											/* @__PURE__ */ (void 0)(ColorPickerField, {
												label: "พื้นผิว Card (Surface)",
												value: draftColors.cardColor,
												onChange: (v) => updateColorToken("cardColor", v)
											}, void 0, false, {
												fileName: _jsxFileName$2,
												lineNumber: 1139,
												columnNumber: 19
											}, this),
											/* @__PURE__ */ (void 0)(ColorPickerField, {
												label: "ข้อความหลัก (Foreground)",
												value: draftColors.foregroundColor,
												onChange: (v) => updateColorToken("foregroundColor", v)
											}, void 0, false, {
												fileName: _jsxFileName$2,
												lineNumber: 1144,
												columnNumber: 19
											}, this),
											/* @__PURE__ */ (void 0)(ColorPickerField, {
												label: "เส้นขอบ / Divider (Border)",
												value: draftColors.borderColor,
												onChange: (v) => updateColorToken("borderColor", v)
											}, void 0, false, {
												fileName: _jsxFileName$2,
												lineNumber: 1149,
												columnNumber: 19
											}, this)
										]
									}, void 0, true, {
										fileName: _jsxFileName$2,
										lineNumber: 1133,
										columnNumber: 17
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName$2,
									lineNumber: 1129,
									columnNumber: 15
								}, this),
								/* @__PURE__ */ (void 0)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (void 0)("h4", {
										className: "text-xs font-bold tracking-wider text-muted-foreground uppercase",
										children: "สีแบรนด์และการโต้ตอบ (Brand & Interaction)"
									}, void 0, false, {
										fileName: _jsxFileName$2,
										lineNumber: 1159,
										columnNumber: 17
									}, this), /* @__PURE__ */ (void 0)("div", {
										className: "grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3",
										children: [
											/* @__PURE__ */ (void 0)(ColorPickerField, {
												label: "Primary (สีหลัก)",
												value: draftColors.primaryColor,
												onChange: (v) => updateColorToken("primaryColor", v)
											}, void 0, false, {
												fileName: _jsxFileName$2,
												lineNumber: 1163,
												columnNumber: 19
											}, this),
											/* @__PURE__ */ (void 0)(ColorPickerField, {
												label: "Secondary (สีรอง)",
												value: draftColors.secondaryColor,
												onChange: (v) => updateColorToken("secondaryColor", v)
											}, void 0, false, {
												fileName: _jsxFileName$2,
												lineNumber: 1168,
												columnNumber: 19
											}, this),
											/* @__PURE__ */ (void 0)(ColorPickerField, {
												label: "Accent (สีเน้น/Hover)",
												value: draftColors.accentColor,
												onChange: (v) => updateColorToken("accentColor", v)
											}, void 0, false, {
												fileName: _jsxFileName$2,
												lineNumber: 1173,
												columnNumber: 19
											}, this)
										]
									}, void 0, true, {
										fileName: _jsxFileName$2,
										lineNumber: 1162,
										columnNumber: 17
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName$2,
									lineNumber: 1158,
									columnNumber: 15
								}, this),
								/* @__PURE__ */ (void 0)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (void 0)("h4", {
										className: "text-xs font-bold tracking-wider text-muted-foreground uppercase",
										children: "สีสถานะข้อมูล (Status Colors)"
									}, void 0, false, {
										fileName: _jsxFileName$2,
										lineNumber: 1183,
										columnNumber: 17
									}, this), /* @__PURE__ */ (void 0)("div", {
										className: "grid grid-cols-1 gap-2.5 sm:grid-cols-3",
										children: [
											/* @__PURE__ */ (void 0)(ColorPickerField, {
												label: "Success / Google Green",
												value: draftColors.successColor,
												onChange: (v) => updateColorToken("successColor", v)
											}, void 0, false, {
												fileName: _jsxFileName$2,
												lineNumber: 1187,
												columnNumber: 19
											}, this),
											/* @__PURE__ */ (void 0)(ColorPickerField, {
												label: "Warning / Google Amber",
												value: draftColors.warningColor,
												onChange: (v) => updateColorToken("warningColor", v)
											}, void 0, false, {
												fileName: _jsxFileName$2,
												lineNumber: 1192,
												columnNumber: 19
											}, this),
											/* @__PURE__ */ (void 0)(ColorPickerField, {
												label: "Danger / Google Red",
												value: draftColors.destructiveColor,
												onChange: (v) => updateColorToken("destructiveColor", v)
											}, void 0, false, {
												fileName: _jsxFileName$2,
												lineNumber: 1197,
												columnNumber: 19
											}, this)
										]
									}, void 0, true, {
										fileName: _jsxFileName$2,
										lineNumber: 1186,
										columnNumber: 17
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName$2,
									lineNumber: 1182,
									columnNumber: 15
								}, this),
								/* @__PURE__ */ (void 0)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (void 0)("h4", {
										className: "text-xs font-bold tracking-wider text-muted-foreground uppercase",
										children: "ชุดสีกราฟแบบมีความหมาย (Chart Semantic Roles)"
									}, void 0, false, {
										fileName: _jsxFileName$2,
										lineNumber: 1207,
										columnNumber: 17
									}, this), /* @__PURE__ */ (void 0)("div", {
										className: "grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-5",
										children: (draftColors.chartColors || DEFAULT_COLORS_LIGHT.chartColors).map((color, index) => /* @__PURE__ */ (void 0)(ColorPickerField, {
											label: CHART_TOKEN_LABELS[index]?.label ?? `Chart ${index + 1}`,
											hint: CHART_TOKEN_LABELS[index]?.hint,
											value: color,
											onChange: (value) => updateChartColor(index, value)
										}, index, false, {
											fileName: _jsxFileName$2,
											lineNumber: 1213,
											columnNumber: 23
										}, this))
									}, void 0, false, {
										fileName: _jsxFileName$2,
										lineNumber: 1210,
										columnNumber: 17
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName$2,
									lineNumber: 1206,
									columnNumber: 15
								}, this)
							]
						}, void 0, true, {
							fileName: _jsxFileName$2,
							lineNumber: 1116,
							columnNumber: 13
						}, this)
					]
				}, void 0, true, {
					fileName: _jsxFileName$2,
					lineNumber: 867,
					columnNumber: 11
				}, this), /* @__PURE__ */ (void 0)("div", {
					className: "mt-5 flex flex-wrap items-center justify-end gap-2 border-t border-border pt-4",
					children: [/* @__PURE__ */ (void 0)("button", {
						type: "button",
						onClick: handleCancel,
						disabled: !isDirty,
						className: "rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50",
						children: "ยกเลิกการแสดงตัวอย่าง"
					}, void 0, false, {
						fileName: _jsxFileName$2,
						lineNumber: 1227,
						columnNumber: 13
					}, this), /* @__PURE__ */ (void 0)("button", {
						type: "button",
						onClick: () => void handleThemeSave(),
						disabled: isLocked || JSON.stringify(draftColors) === JSON.stringify(savedColors) || isSaving,
						className: "inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50",
						children: [/* @__PURE__ */ (void 0)(Save, { className: "h-4 w-4" }, void 0, false, {
							fileName: _jsxFileName$2,
							lineNumber: 1243,
							columnNumber: 15
						}, this), " บันทึกธีมและสี"]
					}, void 0, true, {
						fileName: _jsxFileName$2,
						lineNumber: 1235,
						columnNumber: 13
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName$2,
					lineNumber: 1226,
					columnNumber: 11
				}, this)]
			}, void 0, true, {
				fileName: _jsxFileName$2,
				lineNumber: 866,
				columnNumber: 9
			}, this),
			activeTab === "general" && /* @__PURE__ */ (void 0)("div", {
				className: "space-y-5",
				children: /* @__PURE__ */ (void 0)("fieldset", {
					disabled: isLocked,
					className: "space-y-5",
					children: [/* @__PURE__ */ (void 0)("div", {
						className: "surface-card space-y-4 p-5",
						children: [/* @__PURE__ */ (void 0)("div", { children: [/* @__PURE__ */ (void 0)("h3", {
							className: "font-bold text-base",
							children: "สาขาและค่า override"
						}, void 0, false, {
							fileName: _jsxFileName$2,
							lineNumber: 1255,
							columnNumber: 17
						}, this), /* @__PURE__ */ (void 0)("p", {
							className: "mt-1 text-xs text-muted-foreground",
							children: "Global เป็นค่าเริ่มต้น สามารถกำหนดค่าแรงได้ โดยไม่สร้างฟิลด์ซ้ำกับข้อมูลบันทึกงาน"
						}, void 0, false, {
							fileName: _jsxFileName$2,
							lineNumber: 1256,
							columnNumber: 17
						}, this)] }, void 0, true, {
							fileName: _jsxFileName$2,
							lineNumber: 1254,
							columnNumber: 15
						}, this), isGuest ? /* @__PURE__ */ (void 0)("div", {
							className: "rounded-xl border border-warning/30 bg-warning/10 p-4 text-xs text-warning-foreground",
							children: "Guest ใช้ LocalStorage ได้ตามเดิม การจัดการค่า override ต้องเข้าสู่ระบบก่อน"
						}, void 0, false, {
							fileName: _jsxFileName$2,
							lineNumber: 1261,
							columnNumber: 17
						}, this) : /* @__PURE__ */ (void 0)(import_jsx_dev_runtime.Fragment, { children: [
							/* @__PURE__ */ (void 0)("div", {
								className: "grid grid-cols-1 gap-2 md:grid-cols-[1fr_1fr_auto]",
								children: [
									/* @__PURE__ */ (void 0)("input", {
										value: newBranchName,
										onChange: (e) => setNewBranchName(e.target.value),
										placeholder: "ชื่อผู้ใช้ใหม่",
										className: "rounded-xl border border-input bg-secondary p-2.5 text-sm",
										"aria-label": "ชื่อผู้ใช้ใหม่"
									}, void 0, false, {
										fileName: _jsxFileName$2,
										lineNumber: 1267,
										columnNumber: 21
									}, this),
									/* @__PURE__ */ (void 0)("input", {
										value: newBranchCode,
										onChange: (e) => setNewBranchCode(e.target.value),
										placeholder: "รหัสผู้ใช้ (ถ้ามี)",
										className: "rounded-xl border border-input bg-secondary p-2.5 text-sm",
										"aria-label": "รหัสผู้ใช้ใหม่"
									}, void 0, false, {
										fileName: _jsxFileName$2,
										lineNumber: 1274,
										columnNumber: 21
									}, this),
									/* @__PURE__ */ (void 0)("button", {
										onClick: () => void handleBranchCreate(),
										className: "flex items-center justify-center gap-1 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground",
										children: [/* @__PURE__ */ (void 0)(Plus, { className: "h-4 w-4" }, void 0, false, {
											fileName: _jsxFileName$2,
											lineNumber: 1285,
											columnNumber: 23
										}, this), " เพิ่มสาขา"]
									}, void 0, true, {
										fileName: _jsxFileName$2,
										lineNumber: 1281,
										columnNumber: 21
									}, this)
								]
							}, void 0, true, {
								fileName: _jsxFileName$2,
								lineNumber: 1266,
								columnNumber: 19
							}, this),
							/* @__PURE__ */ (void 0)("div", {
								className: "grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto]",
								children: [/* @__PURE__ */ (void 0)("select", {
									value: activeBranchId ?? "",
									onChange: (e) => onSelectBranch(e.target.value || null),
									className: "rounded-xl border border-input bg-secondary p-2.5 text-sm",
									"aria-label": "เลือกสาขาที่ใช้งาน",
									children: [/* @__PURE__ */ (void 0)("option", {
										value: "",
										children: "ใช้ค่า Global (ไม่เลือกสาขา)"
									}, void 0, false, {
										fileName: _jsxFileName$2,
										lineNumber: 1295,
										columnNumber: 23
									}, this), branches.filter((branch) => branch.is_active).map((branch) => /* @__PURE__ */ (void 0)("option", {
										value: branch.id,
										children: [branch.name, branch.code ? ` (${branch.code})` : ""]
									}, branch.id, true, {
										fileName: _jsxFileName$2,
										lineNumber: 1299,
										columnNumber: 27
									}, this))]
								}, void 0, true, {
									fileName: _jsxFileName$2,
									lineNumber: 1289,
									columnNumber: 21
								}, this), activeBranchId && /* @__PURE__ */ (void 0)("button", {
									onClick: () => void onUpdateBranch(activeBranchId, { is_active: false }),
									className: "rounded-xl border border-destructive/40 px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10",
									children: "ปิดใช้งานสาขา"
								}, void 0, false, {
									fileName: _jsxFileName$2,
									lineNumber: 1306,
									columnNumber: 23
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName$2,
								lineNumber: 1288,
								columnNumber: 19
							}, this),
							activeBranchId && /* @__PURE__ */ (void 0)("div", {
								className: "space-y-3 rounded-xl border border-primary/20 bg-primary/5 p-4",
								children: [
									/* @__PURE__ */ (void 0)("div", {
										className: "grid grid-cols-1 gap-2 md:grid-cols-2",
										children: [/* @__PURE__ */ (void 0)("input", {
											value: branchNameInput,
											onChange: (e) => setBranchNameInput(e.target.value),
											className: "rounded-xl border border-input bg-background p-2.5 text-sm",
											"aria-label": "ชื่อสาขาที่เลือก"
										}, void 0, false, {
											fileName: _jsxFileName$2,
											lineNumber: 1317,
											columnNumber: 25
										}, this), /* @__PURE__ */ (void 0)("input", {
											value: branchCodeInput,
											onChange: (e) => setBranchCodeInput(e.target.value),
											placeholder: "รหัสสาขา",
											className: "rounded-xl border border-input bg-background p-2.5 text-sm",
											"aria-label": "รหัสสาขาที่เลือก"
										}, void 0, false, {
											fileName: _jsxFileName$2,
											lineNumber: 1323,
											columnNumber: 25
										}, this)]
									}, void 0, true, {
										fileName: _jsxFileName$2,
										lineNumber: 1316,
										columnNumber: 23
									}, this),
									/* @__PURE__ */ (void 0)("div", {
										className: "grid grid-cols-2 gap-3 md:grid-cols-3",
										children: [
											/* @__PURE__ */ (void 0)(BranchNumberField, {
												label: "ค่าแรง/วัน",
												value: branchRateForm.dailyRate,
												onChange: (value) => setBranchRateForm((current) => value === void 0 ? omitBranchRateField(current, "dailyRate") : {
													...current,
													dailyRate: value
												})
											}, void 0, false, {
												fileName: _jsxFileName$2,
												lineNumber: 1332,
												columnNumber: 25
											}, this),
											/* @__PURE__ */ (void 0)("div", { children: [/* @__PURE__ */ (void 0)("label", {
												className: "mb-1 block text-xs font-bold text-muted-foreground",
												children: "ค่า OT เริ่มต้น"
											}, void 0, false, {
												fileName: _jsxFileName$2,
												lineNumber: 1344,
												columnNumber: 27
											}, this), /* @__PURE__ */ (void 0)("select", {
												value: String(branchRateForm.defaultOtType ?? ""),
												onChange: (e) => setBranchRateForm((current) => e.target.value === "" ? omitBranchRateField(current, "defaultOtType") : {
													...current,
													defaultOtType: Number(e.target.value)
												}),
												className: "w-full rounded-xl border border-input bg-background p-2.5 text-sm",
												children: [/* @__PURE__ */ (void 0)("option", {
													value: "",
													children: "ใช้ Global"
												}, void 0, false, {
													fileName: _jsxFileName$2,
													lineNumber: 1358,
													columnNumber: 29
												}, this), OT_OPTIONS.map((option) => /* @__PURE__ */ (void 0)("option", {
													value: option.value,
													children: option.label
												}, option.value, false, {
													fileName: _jsxFileName$2,
													lineNumber: 1360,
													columnNumber: 31
												}, this))]
											}, void 0, true, {
												fileName: _jsxFileName$2,
												lineNumber: 1347,
												columnNumber: 27
											}, this)] }, void 0, true, {
												fileName: _jsxFileName$2,
												lineNumber: 1343,
												columnNumber: 25
											}, this),
											/* @__PURE__ */ (void 0)(BranchNumberField, {
												label: "ค่าเดินทาง",
												value: branchRateForm.travelCost,
												onChange: (value) => setBranchRateForm((current) => value === void 0 ? omitBranchRateField(current, "travelCost") : {
													...current,
													travelCost: value
												})
											}, void 0, false, {
												fileName: _jsxFileName$2,
												lineNumber: 1366,
												columnNumber: 25
											}, this),
											/* @__PURE__ */ (void 0)(BranchNumberField, {
												label: "ค่าอาหาร",
												value: branchRateForm.foodCost,
												onChange: (value) => setBranchRateForm((current) => value === void 0 ? omitBranchRateField(current, "foodCost") : {
													...current,
													foodCost: value
												})
											}, void 0, false, {
												fileName: _jsxFileName$2,
												lineNumber: 1377,
												columnNumber: 25
											}, this),
											/* @__PURE__ */ (void 0)(BranchNumberField, {
												label: "รายรับอื่น",
												value: branchRateForm.otherIncome,
												onChange: (value) => setBranchRateForm((current) => value === void 0 ? omitBranchRateField(current, "otherIncome") : {
													...current,
													otherIncome: value
												})
											}, void 0, false, {
												fileName: _jsxFileName$2,
												lineNumber: 1388,
												columnNumber: 25
											}, this),
											/* @__PURE__ */ (void 0)(BranchNumberField, {
												label: "รายการหัก",
												value: branchRateForm.otherDeductions,
												onChange: (value) => setBranchRateForm((current) => value === void 0 ? omitBranchRateField(current, "otherDeductions") : {
													...current,
													otherDeductions: value
												})
											}, void 0, false, {
												fileName: _jsxFileName$2,
												lineNumber: 1399,
												columnNumber: 25
											}, this)
										]
									}, void 0, true, {
										fileName: _jsxFileName$2,
										lineNumber: 1331,
										columnNumber: 23
									}, this),
									/* @__PURE__ */ (void 0)("div", {
										className: "flex flex-wrap gap-2",
										children: [/* @__PURE__ */ (void 0)("button", {
											onClick: () => void handleBranchUpdate(),
											className: "rounded-xl border border-border px-3 py-2 text-xs font-semibold hover:bg-accent",
											children: "บันทึกชื่อ"
										}, void 0, false, {
											fileName: _jsxFileName$2,
											lineNumber: 1412,
											columnNumber: 25
										}, this), /* @__PURE__ */ (void 0)("button", {
											onClick: () => void handleBranchSettingsSave(),
											disabled: branchSettingsLoading,
											className: "rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-50",
											children: branchSettingsLoading ? "กำลังโหลด…" : "บันทึกค่า override"
										}, void 0, false, {
											fileName: _jsxFileName$2,
											lineNumber: 1418,
											columnNumber: 25
										}, this)]
									}, void 0, true, {
										fileName: _jsxFileName$2,
										lineNumber: 1411,
										columnNumber: 23
									}, this)
								]
							}, void 0, true, {
								fileName: _jsxFileName$2,
								lineNumber: 1315,
								columnNumber: 21
							}, this)
						] }, void 0, true, {
							fileName: _jsxFileName$2,
							lineNumber: 1265,
							columnNumber: 17
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName$2,
						lineNumber: 1253,
						columnNumber: 13
					}, this), /* @__PURE__ */ (void 0)("div", {
						className: "surface-card space-y-4 p-5",
						children: [
							/* @__PURE__ */ (void 0)("h3", {
								className: "font-bold text-base",
								children: "ค่าแรงพื้นฐาน & ค่าเริ่มต้น (Global)"
							}, void 0, false, {
								fileName: _jsxFileName$2,
								lineNumber: 1433,
								columnNumber: 15
							}, this),
							/* @__PURE__ */ (void 0)("div", {
								className: "grid grid-cols-1 gap-4 md:grid-cols-2",
								children: [/* @__PURE__ */ (void 0)("div", { children: [/* @__PURE__ */ (void 0)("label", {
									className: "text-xs font-bold text-muted-foreground block mb-1",
									children: "ค่าแรงปกติ (บาท/วัน)"
								}, void 0, false, {
									fileName: _jsxFileName$2,
									lineNumber: 1436,
									columnNumber: 19
								}, this), /* @__PURE__ */ (void 0)("input", {
									type: "number",
									min: "0",
									value: dailyRateInput,
									onChange: (e) => {
										const raw = e.target.value;
										setDailyRateInput(raw);
										if (raw === "") {
											setRateForm({
												...rateForm,
												dailyRate: 0
											});
											return;
										}
										const dailyRate = Number(raw);
										if (Number.isFinite(dailyRate)) setRateForm({
											...rateForm,
											dailyRate
										});
									},
									className: "w-full rounded-xl border border-input bg-secondary p-2.5 text-sm"
								}, void 0, false, {
									fileName: _jsxFileName$2,
									lineNumber: 1439,
									columnNumber: 19
								}, this)] }, void 0, true, {
									fileName: _jsxFileName$2,
									lineNumber: 1435,
									columnNumber: 17
								}, this), /* @__PURE__ */ (void 0)("p", {
									className: "self-end pb-2 text-xs text-muted-foreground",
									children: [
										"Google Sheets ID อยู่ในหมวด ",
										/* @__PURE__ */ (void 0)("strong", { children: "Supabase & Airtable" }, void 0, false, {
											fileName: _jsxFileName$2,
											lineNumber: 1460,
											columnNumber: 47
										}, this),
										" ",
										"เพื่อแยกการบันทึกออกจากค่าแรง"
									]
								}, void 0, true, {
									fileName: _jsxFileName$2,
									lineNumber: 1459,
									columnNumber: 17
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName$2,
								lineNumber: 1434,
								columnNumber: 15
							}, this),
							/* @__PURE__ */ (void 0)("div", {
								className: "pt-2",
								children: /* @__PURE__ */ (void 0)("button", {
									onClick: () => void handleRatesSave(),
									className: "flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground active:scale-95",
									children: [/* @__PURE__ */ (void 0)(Save, { className: "h-4 w-4" }, void 0, false, {
										fileName: _jsxFileName$2,
										lineNumber: 1470,
										columnNumber: 19
									}, this), " บันทึกค่าแรง Global"]
								}, void 0, true, {
									fileName: _jsxFileName$2,
									lineNumber: 1466,
									columnNumber: 17
								}, this)
							}, void 0, false, {
								fileName: _jsxFileName$2,
								lineNumber: 1465,
								columnNumber: 15
							}, this)
						]
					}, void 0, true, {
						fileName: _jsxFileName$2,
						lineNumber: 1432,
						columnNumber: 13
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName$2,
					lineNumber: 1252,
					columnNumber: 11
				}, this)
			}, void 0, false, {
				fileName: _jsxFileName$2,
				lineNumber: 1251,
				columnNumber: 9
			}, this),
			activeTab === "layout" && /* @__PURE__ */ (void 0)(DashboardLayoutEditor, {
				ref: layoutEditorRef,
				userId: _userId,
				isGuest,
				mobileLayout,
				desktopLayout,
				disabled: isLocked,
				summary: summarizeMonth(logs, previewMonth),
				chartColors: draftColors.chartColors,
				onDirtyChange: setLayoutDirty
			}, void 0, false, {
				fileName: _jsxFileName$2,
				lineNumber: 1480,
				columnNumber: 9
			}, this),
			activeTab === "authentication" && /* @__PURE__ */ (void 0)(AuthenticationSettings, {
				user: authUser,
				isGuest,
				onSignOut
			}, void 0, false, {
				fileName: _jsxFileName$2,
				lineNumber: 1495,
				columnNumber: 9
			}, this),
			activeTab === "integrations" && /* @__PURE__ */ (void 0)("div", {
				className: "surface-card p-5",
				children: /* @__PURE__ */ (void 0)("fieldset", {
					disabled: isLocked,
					className: "space-y-5",
					children: [
						/* @__PURE__ */ (void 0)("div", {
							className: "flex flex-col gap-1",
							children: [/* @__PURE__ */ (void 0)("h3", {
								className: "font-bold text-base",
								children: "การเชื่อมต่อฐานข้อมูล & External Sync"
							}, void 0, false, {
								fileName: _jsxFileName$2,
								lineNumber: 1503,
								columnNumber: 15
							}, this), /* @__PURE__ */ (void 0)("p", {
								className: "text-xs text-muted-foreground",
								children: "Supabase = Primary Database (Source of Truth) · Airtable = External Sync Operational View"
							}, void 0, false, {
								fileName: _jsxFileName$2,
								lineNumber: 1504,
								columnNumber: 15
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName$2,
							lineNumber: 1502,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ (void 0)(SheetsPanel, {
							spreadsheetId: sheetIdInput,
							onChange: (id) => setSheetIdInput(id)
						}, void 0, false, {
							fileName: _jsxFileName$2,
							lineNumber: 1510,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ (void 0)("div", {
							className: "flex justify-end border-b border-border pb-4",
							children: /* @__PURE__ */ (void 0)("button", {
								type: "button",
								onClick: () => void handleSpreadsheetSave(),
								disabled: isLocked || sheetIdInput === savedSheetId || isSaving,
								className: "inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50",
								children: [/* @__PURE__ */ (void 0)(Save, { className: "h-4 w-4" }, void 0, false, {
									fileName: _jsxFileName$2,
									lineNumber: 1518,
									columnNumber: 17
								}, this), " บันทึก Google Sheets ID"]
							}, void 0, true, {
								fileName: _jsxFileName$2,
								lineNumber: 1512,
								columnNumber: 15
							}, this)
						}, void 0, false, {
							fileName: _jsxFileName$2,
							lineNumber: 1511,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ (void 0)("div", {
							className: "rounded-xl border border-border bg-card p-4 space-y-3",
							children: [/* @__PURE__ */ (void 0)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (void 0)("div", {
									className: "flex items-center gap-2 font-bold text-sm text-primary",
									children: [/* @__PURE__ */ (void 0)(Database, { className: "h-5 w-5" }, void 0, false, {
										fileName: _jsxFileName$2,
										lineNumber: 1525,
										columnNumber: 19
									}, this), " Supabase Database"]
								}, void 0, true, {
									fileName: _jsxFileName$2,
									lineNumber: 1524,
									columnNumber: 17
								}, this), /* @__PURE__ */ (void 0)("span", {
									className: "rounded-full bg-success-soft text-success px-2.5 py-0.5 text-xs font-bold",
									children: "เชื่อมต่อแล้ว (Source of Truth)"
								}, void 0, false, {
									fileName: _jsxFileName$2,
									lineNumber: 1527,
									columnNumber: 17
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName$2,
								lineNumber: 1523,
								columnNumber: 15
							}, this), /* @__PURE__ */ (void 0)("p", {
								className: "text-xs text-muted-foreground",
								children: "ข้อมูลประเภทงาน, User Settings และ Work Logs ทั้งหมดถูกจัดเก็บอย่างปลอดภัยบน Supabase พร้อม Row Level Security (RLS)"
							}, void 0, false, {
								fileName: _jsxFileName$2,
								lineNumber: 1531,
								columnNumber: 15
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName$2,
							lineNumber: 1522,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ (void 0)("div", {
							className: "rounded-xl border border-border bg-card p-4 space-y-3",
							children: [
								/* @__PURE__ */ (void 0)("div", {
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ (void 0)("div", {
										className: "flex items-center gap-2 font-bold text-sm text-primary",
										children: [/* @__PURE__ */ (void 0)(FileSpreadsheet, { className: "h-5 w-5" }, void 0, false, {
											fileName: _jsxFileName$2,
											lineNumber: 1540,
											columnNumber: 19
										}, this), " Airtable External Sync"]
									}, void 0, true, {
										fileName: _jsxFileName$2,
										lineNumber: 1539,
										columnNumber: 17
									}, this), /* @__PURE__ */ (void 0)("span", {
										className: `rounded-full px-2.5 py-0.5 text-xs font-bold ${pendingAirtableCount === 0 ? "bg-success-soft text-success" : "bg-secondary text-muted-foreground"}`,
										children: pendingAirtableCount === 0 ? "ซิงก์ครบแล้ว" : `รอซิงก์ ${pendingAirtableCount} รายการ`
									}, void 0, false, {
										fileName: _jsxFileName$2,
										lineNumber: 1542,
										columnNumber: 17
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName$2,
									lineNumber: 1538,
									columnNumber: 15
								}, this),
								/* @__PURE__ */ (void 0)("p", {
									className: "text-xs text-muted-foreground",
									children: "Airtable ทำงานผ่าน server function และใช้ค่า AIRTABLE_API_KEY, AIRTABLE_BASE_ID และ AIRTABLE_TABLE_NAME จาก environment ของ deployment หากยังไม่มีค่าเหล่านี้ การบันทึกหลักบน Supabase จะยังไม่ล้มเหลว และสามารถกดซิงก์ซ้ำภายหลังได้"
								}, void 0, false, {
									fileName: _jsxFileName$2,
									lineNumber: 1550,
									columnNumber: 15
								}, this),
								/* @__PURE__ */ (void 0)("div", {
									className: "pt-2 flex items-center justify-between border-t border-border",
									children: [/* @__PURE__ */ (void 0)("div", {
										className: "text-xs text-muted-foreground",
										children: [
											"รายการในระบบ: ",
											/* @__PURE__ */ (void 0)("span", {
												className: "font-bold text-foreground",
												children: logs.length
											}, void 0, false, {
												fileName: _jsxFileName$2,
												lineNumber: 1558,
												columnNumber: 33
											}, this),
											" ",
											"รายการ"
										]
									}, void 0, true, {
										fileName: _jsxFileName$2,
										lineNumber: 1557,
										columnNumber: 17
									}, this), /* @__PURE__ */ (void 0)("button", {
										onClick: () => void onSyncAirtableAll(),
										disabled: airtableSyncing,
										className: "flex items-center gap-1.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground px-3 py-2 text-xs font-bold disabled:opacity-50",
										children: [/* @__PURE__ */ (void 0)(RefreshCw, { className: `h-4 w-4 ${airtableSyncing ? "animate-spin" : ""}` }, void 0, false, {
											fileName: _jsxFileName$2,
											lineNumber: 1566,
											columnNumber: 19
										}, this), airtableSyncing ? "กำลังตรวจสอบ..." : "ทดสอบซิงก์ Airtable"]
									}, void 0, true, {
										fileName: _jsxFileName$2,
										lineNumber: 1561,
										columnNumber: 17
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName$2,
									lineNumber: 1556,
									columnNumber: 15
								}, this)
							]
						}, void 0, true, {
							fileName: _jsxFileName$2,
							lineNumber: 1537,
							columnNumber: 13
						}, this)
					]
				}, void 0, true, {
					fileName: _jsxFileName$2,
					lineNumber: 1501,
					columnNumber: 11
				}, this)
			}, void 0, false, {
				fileName: _jsxFileName$2,
				lineNumber: 1500,
				columnNumber: 9
			}, this)
		]
	}, void 0, true, {
		fileName: _jsxFileName$2,
		lineNumber: 565,
		columnNumber: 5
	}, this);
}
function omitBranchRateField(current, key) {
	const next = { ...current };
	delete next[key];
	return next;
}
function BranchNumberField({ label, value, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("label", {
		className: "mb-1 block text-xs font-bold text-muted-foreground",
		children: label
	}, void 0, false, {
		fileName: _jsxFileName$2,
		lineNumber: 1598,
		columnNumber: 7
	}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("input", {
		type: "number",
		min: "0",
		value: value ?? "",
		onChange: (event) => onChange(event.target.value === "" ? void 0 : Number(event.target.value)),
		placeholder: "ใช้ Global",
		className: "w-full rounded-xl border border-input bg-background p-2.5 text-sm"
	}, void 0, false, {
		fileName: _jsxFileName$2,
		lineNumber: 1599,
		columnNumber: 7
	}, this)] }, void 0, true, {
		fileName: _jsxFileName$2,
		lineNumber: 1597,
		columnNumber: 5
	}, this);
}
function ColorPickerField({ label, hint, value, onChange }) {
	const pickerValue = value && /^#[0-9a-f]{6}$/i.test(value) ? value : "#1A73E8";
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
		className: "rounded-xl border border-border bg-card p-3 shadow-sm",
		children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
			className: "mb-2 min-w-0",
			children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
				className: "block truncate text-[11px] font-semibold text-foreground",
				children: label
			}, void 0, false, {
				fileName: _jsxFileName$2,
				lineNumber: 1629,
				columnNumber: 9
			}, this), hint ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
				className: "mt-0.5 block truncate text-[10px] text-muted-foreground",
				children: hint
			}, void 0, false, {
				fileName: _jsxFileName$2,
				lineNumber: 1631,
				columnNumber: 11
			}, this) : null]
		}, void 0, true, {
			fileName: _jsxFileName$2,
			lineNumber: 1628,
			columnNumber: 7
		}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
			className: "flex items-center gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("input", {
				type: "color",
				value: pickerValue,
				onChange: (event) => onChange(event.target.value),
				"aria-label": `${label} color picker`,
				className: "h-9 w-9 shrink-0 cursor-pointer rounded-lg border border-border bg-transparent p-0.5"
			}, void 0, false, {
				fileName: _jsxFileName$2,
				lineNumber: 1635,
				columnNumber: 9
			}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("input", {
				type: "text",
				value,
				onChange: (event) => onChange(event.target.value),
				"aria-label": `${label} color value`,
				inputMode: "text",
				spellCheck: false,
				className: "min-w-0 w-full rounded-lg border border-input bg-secondary px-2 py-2 font-mono text-xs text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
			}, void 0, false, {
				fileName: _jsxFileName$2,
				lineNumber: 1642,
				columnNumber: 9
			}, this)]
		}, void 0, true, {
			fileName: _jsxFileName$2,
			lineNumber: 1634,
			columnNumber: 7
		}, this)]
	}, void 0, true, {
		fileName: _jsxFileName$2,
		lineNumber: 1627,
		columnNumber: 5
	}, this);
}
var _jsxFileName$1 = "/app/applet/src/components/work/FaceLock.tsx";
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
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4 py-8",
		children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
			className: "surface-card w-full max-w-sm space-y-6 p-7 text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "mx-auto w-fit rounded-2xl bg-primary/10 p-3 text-primary",
					children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Lock, { className: "h-7 w-7" }, void 0, false, {
						fileName: _jsxFileName$1,
						lineNumber: 116,
						columnNumber: 11
					}, this)
				}, void 0, false, {
					fileName: _jsxFileName$1,
					lineNumber: 115,
					columnNumber: 9
				}, this),
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "space-y-1",
					children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h1", {
						className: "text-lg font-bold",
						children: "แอปถูกล็อกอยู่ (Face ID)"
					}, void 0, false, {
						fileName: _jsxFileName$1,
						lineNumber: 120,
						columnNumber: 11
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
						className: "text-xs text-muted-foreground",
						children: name
					}, void 0, false, {
						fileName: _jsxFileName$1,
						lineNumber: 121,
						columnNumber: 11
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName$1,
					lineNumber: 119,
					columnNumber: 9
				}, this),
				inIframe && /* @__PURE__ */ (void 0)("div", {
					className: "rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-left text-xs text-amber-600 dark:text-amber-400",
					children: [/* @__PURE__ */ (void 0)("p", {
						className: "font-semibold flex items-center gap-1.5 mb-1",
						children: [/* @__PURE__ */ (void 0)(ExternalLink, { className: "h-4 w-4 shrink-0" }, void 0, false, {
							fileName: _jsxFileName$1,
							lineNumber: 127,
							columnNumber: 15
						}, this), " เปิดในกรอบพรีวิว (iframe)"]
					}, void 0, true, {
						fileName: _jsxFileName$1,
						lineNumber: 126,
						columnNumber: 13
					}, this), /* @__PURE__ */ (void 0)("p", {
						className: "opacity-90 leading-relaxed",
						children: "เบราว์เซอร์จะบล็อก Face ID เมื่อเปิดในกรอบพรีวิว กรุณากดปุ่มเปิดในแท็บใหม่ (New Tab) ด้านบน หรือกดปุ่มปลดล็อกด้วยสิทธิ์เข้าใช้งานด้านล่าง"
					}, void 0, false, {
						fileName: _jsxFileName$1,
						lineNumber: 129,
						columnNumber: 13
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName$1,
					lineNumber: 125,
					columnNumber: 11
				}, this),
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
						onClick: () => void attempt(),
						disabled: busy,
						className: "flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow transition hover:bg-primary/90 disabled:opacity-60",
						children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(ScanFace, { className: "h-4 w-4" }, void 0, false, {
							fileName: _jsxFileName$1,
							lineNumber: 142,
							columnNumber: 13
						}, this), busy ? "กำลังยืนยัน Face ID…" : "ปลดล็อกด้วย Face ID / Touch ID"]
					}, void 0, true, {
						fileName: _jsxFileName$1,
						lineNumber: 137,
						columnNumber: 11
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
						onClick: () => {
							onBypassUnlock();
							toast.success("ปลดล็อกผ่านสิทธิ์บัญชีที่เข้าใช้งานสำเร็จ");
						},
						className: "flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-secondary py-2.5 text-xs font-semibold text-foreground transition hover:bg-secondary/80",
						children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(KeyRound, { className: "h-3.5 w-3.5 text-primary" }, void 0, false, {
							fileName: _jsxFileName$1,
							lineNumber: 153,
							columnNumber: 13
						}, this), "ปลดล็อกด้วยสิทธิ์บัญชีปัจจุบัน"]
					}, void 0, true, {
						fileName: _jsxFileName$1,
						lineNumber: 146,
						columnNumber: 11
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName$1,
					lineNumber: 136,
					columnNumber: 9
				}, this),
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "border-t border-border pt-4 flex items-center justify-between text-xs",
					children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
						onClick: () => {
							onRemoveFaceLock();
							toast.info("ยกเลิกการล็อกด้วย Face ID เรียบร้อยแล้ว");
						},
						className: "flex items-center gap-1 text-muted-foreground hover:text-destructive transition",
						children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Trash2, { className: "h-3.5 w-3.5" }, void 0, false, {
							fileName: _jsxFileName$1,
							lineNumber: 166,
							columnNumber: 13
						}, this), " ยกเลิก Face ID"]
					}, void 0, true, {
						fileName: _jsxFileName$1,
						lineNumber: 159,
						columnNumber: 11
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
						onClick: onSignOut,
						className: "text-muted-foreground underline-offset-2 hover:underline",
						children: "ออกจากระบบ"
					}, void 0, false, {
						fileName: _jsxFileName$1,
						lineNumber: 169,
						columnNumber: 11
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName$1,
					lineNumber: 158,
					columnNumber: 9
				}, this)
			]
		}, void 0, true, {
			fileName: _jsxFileName$1,
			lineNumber: 114,
			columnNumber: 7
		}, this)
	}, void 0, false, {
		fileName: _jsxFileName$1,
		lineNumber: 113,
		columnNumber: 5
	}, this);
}
async function fetchDBWorkTypes(userId) {
	const { data, error } = await supabase.from("work_types").select("*").eq("user_id", userId).order("created_at", { ascending: true });
	if (error) {
		console.warn("Supabase fetch work_types warning:", error.message);
		throw error;
	}
	return data || [];
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
/**
* Merges local categories into Supabase without deleting or overwriting existing rows.
* This is intentionally idempotent so a refresh or a second browser cannot erase work types.
*/
async function syncDBWorkTypes(userId, categories) {
	const current = await fetchDBWorkTypes(userId);
	const existingNames = new Set(current.map((item) => item.name.trim().toLocaleLowerCase("th-TH")));
	const namesToInsert = [...new Set((categories.length > 0 ? categories : DEFAULT_CATEGORIES).map((name) => name.trim()).filter(Boolean))].filter((name) => !existingNames.has(name.toLocaleLowerCase("th-TH")));
	if (namesToInsert.length > 0) {
		const { error } = await supabase.from("work_types").insert(namesToInsert.map((name) => ({
			user_id: userId,
			name,
			is_active: true
		})));
		if (error && error.code !== "23505") throw error;
	}
	return fetchDBWorkTypes(userId);
}
/**
* Persists the list edited in the original CategoryDialog.
* Existing rows are soft-disabled rather than deleted so historical logs remain valid.
*/
async function saveDBWorkTypeList(userId, categories) {
	const names = [...new Set(categories.map((name) => name.trim()).filter(Boolean))];
	const current = await fetchDBWorkTypes(userId);
	const wanted = new Set(names.map((name) => name.toLocaleLowerCase("th-TH")));
	for (const item of current) {
		const shouldBeActive = wanted.has(item.name.trim().toLocaleLowerCase("th-TH"));
		if (item.is_active !== shouldBeActive) {
			const { error } = await supabase.from("work_types").update({
				is_active: shouldBeActive,
				updated_at: (/* @__PURE__ */ new Date()).toISOString()
			}).eq("id", item.id);
			if (error) throw error;
		}
	}
	const currentNames = new Set(current.map((item) => item.name.trim().toLocaleLowerCase("th-TH")));
	for (const name of names) if (!currentNames.has(name.toLocaleLowerCase("th-TH"))) {
		const { error } = await supabase.from("work_types").insert({
			user_id: userId,
			name,
			is_active: true
		});
		if (error && error.code !== "23505") throw error;
	}
	return fetchDBWorkTypes(userId);
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
async function fetchDBBranches(userId) {
	const { data, error } = await supabase.from("branches").select("*").eq("user_id", userId).order("created_at", { ascending: true });
	if (error) throw error;
	return data || [];
}
async function addDBBranch(userId, name, code) {
	const trimmedName = name.trim();
	if (!trimmedName) throw new Error("กรุณาระบุชื่อสาขา");
	const { data, error } = await supabase.from("branches").insert({
		user_id: userId,
		name: trimmedName,
		code: code?.trim() || null,
		is_active: true
	}).select("*").single();
	if (error) throw error;
	return data;
}
async function updateDBBranch(id, patch) {
	const payload = {
		...patch,
		...patch.name !== void 0 ? { name: patch.name.trim() } : {},
		...patch.code !== void 0 ? { code: patch.code?.trim() || null } : {},
		updated_at: (/* @__PURE__ */ new Date()).toISOString()
	};
	const { data, error } = await supabase.from("branches").update(payload).eq("id", id).select("*").single();
	if (error) throw error;
	return data;
}
async function fetchDBBranchSettings(branchId, userId) {
	const { data, error } = await supabase.from("branch_settings").select("*").eq("branch_id", branchId).eq("user_id", userId).maybeSingle();
	if (error) throw error;
	if (!data) return null;
	return {
		...data,
		settings: data.settings || {}
	};
}
async function saveDBBranchSettings(branchId, userId, settings) {
	const { data, error } = await supabase.from("branch_settings").upsert({
		branch_id: branchId,
		user_id: userId,
		settings,
		updated_at: (/* @__PURE__ */ new Date()).toISOString()
	}, { onConflict: "branch_id" }).select("*").single();
	if (error) throw error;
	return {
		...data,
		settings: data.settings || {}
	};
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
			airtableSyncedAt: row.airtable_synced_at || null,
			airtableSyncStatus: row.sync_status || "pending",
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
			airtable_record_id: log.airtableRecordId || null,
			airtable_synced_at: log.airtableSyncedAt || null,
			sync_status: log.airtableSyncStatus || "pending",
			synced_at: log.syncedAt || null,
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
var syncRecordToAirtable = createServerFn({ method: "POST" }).validator((input) => objectType({ log: workLogSchema }).parse(input)).handler(createSsrRpc("b27b66c81e0bce6a7c2448eb0572d77194d967e9904cd9c71a7b1aa3cef6d66d"));
function mergeBranchRates(base, settings) {
	return {
		...base,
		dailyRate: settings.dailyRate ?? base.dailyRate,
		otType: settings.defaultOtType ?? base.otType,
		travelCost: settings.travelCost ?? base.travelCost,
		foodCost: settings.foodCost ?? base.foodCost,
		otherIncome: settings.otherIncome ?? base.otherIncome,
		otherDeductions: settings.otherDeductions ?? base.otherDeductions
	};
}
function useWorkTracker(userId, isGuest = false) {
	const [ready, setReady] = (0, import_react.useState)(false);
	const [logs, setLogs] = (0, import_react.useState)([]);
	const [active, setActive] = (0, import_react.useState)(null);
	const [categories, setCategories] = (0, import_react.useState)(DEFAULT_CATEGORIES);
	const [dbWorkTypes, setDbWorkTypes] = (0, import_react.useState)([]);
	const [otTypes, setOtTypes] = (0, import_react.useState)([]);
	const [rates, setRates] = (0, import_react.useState)(DEFAULT_RATES);
	const [globalRates, setGlobalRates] = (0, import_react.useState)(DEFAULT_RATES);
	const [branches, setBranches] = (0, import_react.useState)([]);
	const [activeBranchId, setActiveBranchId] = (0, import_react.useState)(null);
	const [branchSettings, setBranchSettings] = (0, import_react.useState)({});
	const [branchSettingsLoading, setBranchSettingsLoading] = (0, import_react.useState)(false);
	const [spreadsheetId, setSpreadsheetIdState] = (0, import_react.useState)("");
	const [syncing, setSyncing] = (0, import_react.useState)(false);
	const [airtableSyncing, setAirtableSyncing] = (0, import_react.useState)(false);
	const [themeSettings, setThemeSettings] = (0, import_react.useState)(DEFAULT_COLORS_LIGHT);
	const [savedThemeSettings, setSavedThemeSettings] = (0, import_react.useState)(DEFAULT_COLORS_LIGHT);
	const useSupabase = Boolean(userId && !isGuest && isSupabaseConfigured());
	(0, import_react.useEffect)(() => {
		setReady(false);
		setStorageNamespace(useSupabase ? userId : null);
		if (!userId) return;
		let isMounted = true;
		async function initFromSupabase() {
			const localLogs = storage.getLogs();
			const localActive = storage.getActive();
			const localCategories = storage.getCategories();
			const localRates = storage.getRates();
			const localSheetId = storage.getSheetId();
			const localTheme = storage.getTheme(DEFAULT_COLORS_LIGHT);
			setLogs(localLogs);
			setActive(localActive);
			setCategories(localCategories);
			setRates(localRates);
			setGlobalRates(localRates);
			setSpreadsheetIdState(localSheetId);
			setThemeSettings(localTheme);
			setSavedThemeSettings(localTheme);
			applyTheme(localTheme);
			setDbWorkTypes(localCategories.map((name, index) => ({
				id: `guest-work-type-${index}-${name}`,
				user_id: userId,
				name,
				is_active: true,
				created_at: "",
				updated_at: ""
			})));
			setOtTypes(OT_OPTIONS.map((option, index) => ({
				id: `guest-ot-type-${index}`,
				user_id: null,
				name: option.label,
				multiplier: option.value,
				is_active: true
			})));
			if (!useSupabase) {
				if (isMounted) setReady(true);
				return;
			}
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
						chartColors: dbSettings.chart_colors?.length ? dbSettings.chart_colors : DEFAULT_COLORS_LIGHT.chartColors,
						presetName: dbSettings.preset_name || "google-blue",
						borderRadius: dbSettings.border_radius || "normal",
						buttonStyle: dbSettings.button_style || "filled",
						density: dbSettings.density || "normal"
					};
					setThemeSettings(colors);
					setSavedThemeSettings(colors);
					applyTheme(colors);
					if (dbSettings.daily_rate !== null && dbSettings.daily_rate !== void 0) {
						const nextRates = {
							dailyRate: dbSettings.daily_rate,
							otType: dbSettings.default_ot_type ?? 0,
							travelCost: dbSettings.travel_cost || 0,
							foodCost: dbSettings.food_cost || 0,
							otherIncome: dbSettings.other_income || 0,
							otherDeductions: dbSettings.other_deductions || 0
						};
						setRates(nextRates);
						setGlobalRates(nextRates);
						storage.setRates(nextRates);
					}
					if (dbSettings.spreadsheet_id) {
						setSpreadsheetIdState(dbSettings.spreadsheet_id);
						storage.setSheetId(dbSettings.spreadsheet_id);
					}
				} else applyTheme(DEFAULT_COLORS_LIGHT);
				const dbBranches = await fetchDBBranches(userId);
				if (isMounted) {
					setBranches(dbBranches);
					if (dbBranches.length > 0) setActiveBranchId((current) => current ?? dbBranches[0].id);
				}
				const mergedTypes = await syncDBWorkTypes(userId, localCategories);
				if (isMounted) {
					setDbWorkTypes(mergedTypes);
					const activeNames = mergedTypes.filter((w) => w.is_active).map((w) => w.name);
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
					} else if (localLogs.length > 0) {
						for (const l of localLogs) await saveDBWorkLog(userId, l);
						const migratedLogs = await fetchDBWorkLogs(userId);
						setLogs(migratedLogs.length > 0 ? migratedLogs : localLogs);
						storage.setLogs(migratedLogs.length > 0 ? migratedLogs : localLogs);
					}
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
	}, [
		isGuest,
		useSupabase,
		userId
	]);
	const persistLogs = (0, import_react.useCallback)((next) => {
		setLogs(next);
		storage.setLogs(next);
	}, []);
	const saveRates = (0, import_react.useCallback)(async (next) => {
		setRates(next);
		setGlobalRates(next);
		storage.setRates(next);
		if (useSupabase && userId) await saveDBUserSettings(userId, {
			daily_rate: next.dailyRate,
			default_ot_type: next.otType,
			travel_cost: next.travelCost,
			food_cost: next.foodCost,
			other_income: next.otherIncome,
			other_deductions: next.otherDeductions
		});
	}, [useSupabase, userId]);
	(0, import_react.useEffect)(() => {
		if (!useSupabase || !userId || !activeBranchId) {
			setBranchSettings({});
			setRates(globalRates);
			return;
		}
		let cancelled = false;
		setBranchSettingsLoading(true);
		fetchDBBranchSettings(activeBranchId, userId).then((row) => {
			if (cancelled) return;
			const settings = row?.settings ?? {};
			setBranchSettings(settings);
			setRates(mergeBranchRates(globalRates, settings));
			if (settings.spreadsheetId) {
				setSpreadsheetIdState(settings.spreadsheetId);
				storage.setSheetId(settings.spreadsheetId);
			}
		}).catch((error) => {
			if (!cancelled) {
				setBranchSettings({});
				setRates(globalRates);
				toast.error("โหลดการตั้งค่าสาขาไม่สำเร็จ", { description: error instanceof Error ? error.message : String(error) });
			}
		}).finally(() => {
			if (!cancelled) setBranchSettingsLoading(false);
		});
		return () => {
			cancelled = true;
		};
	}, [
		activeBranchId,
		globalRates,
		useSupabase,
		userId
	]);
	const addBranch = (0, import_react.useCallback)(async (name, code) => {
		if (!useSupabase || !userId) throw new Error("ต้องเข้าสู่ระบบก่อนจัดการสาขา");
		const created = await addDBBranch(userId, name, code);
		setBranches((current) => [...current, created]);
		setActiveBranchId(created.id);
		return created;
	}, [useSupabase, userId]);
	const updateBranch = (0, import_react.useCallback)(async (id, patch) => {
		if (!useSupabase || !userId) throw new Error("ต้องเข้าสู่ระบบก่อนจัดการสาขา");
		const updated = await updateDBBranch(id, patch);
		setBranches((current) => current.map((branch) => branch.id === id ? updated : branch));
		if (!updated.is_active && activeBranchId === id) {
			setActiveBranchId(null);
			setBranchSettings({});
			setRates(globalRates);
		}
		return updated;
	}, [
		activeBranchId,
		globalRates,
		useSupabase,
		userId
	]);
	const selectBranch = (0, import_react.useCallback)((branchId) => {
		setActiveBranchId(branchId);
	}, []);
	const saveBranchSettings = (0, import_react.useCallback)(async (next) => {
		if (!useSupabase || !userId || !activeBranchId) throw new Error("กรุณาเลือกสาขาและเข้าสู่ระบบก่อนบันทึก");
		const saved = await saveDBBranchSettings(activeBranchId, userId, next);
		setBranchSettings(saved.settings);
		setRates(mergeBranchRates(globalRates, saved.settings));
		if (saved.settings.spreadsheetId !== void 0) {
			setSpreadsheetIdState(saved.settings.spreadsheetId || "");
			storage.setSheetId(saved.settings.spreadsheetId || "");
		}
	}, [
		activeBranchId,
		globalRates,
		useSupabase,
		userId
	]);
	const previewThemeSettings = (0, import_react.useCallback)((colors) => {
		setThemeSettings(colors);
		applyTheme(colors);
	}, []);
	const saveThemeSettings = (0, import_react.useCallback)(async (colors) => {
		setThemeSettings(colors);
		setSavedThemeSettings(colors);
		storage.setTheme(colors);
		applyTheme(colors);
		if (useSupabase && userId) await saveDBUserSettings(userId, {
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
			chart_colors: colors.chartColors,
			preset_name: colors.presetName ?? null,
			border_radius: colors.borderRadius ?? "normal",
			button_style: colors.buttonStyle ?? "filled",
			density: colors.density ?? "normal"
		});
	}, [useSupabase, userId]);
	const resetThemeSettings = (0, import_react.useCallback)(async () => {
		setThemeSettings(DEFAULT_COLORS_LIGHT);
		setSavedThemeSettings(DEFAULT_COLORS_LIGHT);
		storage.setTheme(DEFAULT_COLORS_LIGHT);
		applyTheme(DEFAULT_COLORS_LIGHT);
		if (useSupabase && userId) await saveDBUserSettings(userId, {
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
			chart_colors: DEFAULT_COLORS_LIGHT.chartColors,
			preset_name: "google-blue",
			border_radius: "normal",
			button_style: "filled",
			density: "normal"
		});
	}, [useSupabase, userId]);
	const saveCategories = (0, import_react.useCallback)(async (next) => {
		const normalized = [...new Set(next.map((name) => name.trim()).filter(Boolean))];
		if (normalized.length === 0) return;
		setCategories(normalized);
		storage.setCategories(normalized);
		if (useSupabase && userId) {
			const updated = await saveDBWorkTypeList(userId, normalized);
			const activeNames = updated.filter((item) => item.is_active).map((item) => item.name);
			setDbWorkTypes(updated);
			setCategories(activeNames);
			storage.setCategories(activeNames);
		}
		if (spreadsheetId) callServer(writeCategoryList, { data: {
			spreadsheetId,
			categories: normalized
		} }).catch((error) => {
			console.warn("Google Sheets category mirror warning:", error);
		});
	}, [
		spreadsheetId,
		useSupabase,
		userId
	]);
	const addWorkType = (0, import_react.useCallback)(async (name) => {
		const trimmed = name.trim();
		if (!trimmed) return;
		if (!useSupabase || !userId) {
			await saveCategories([...categories, trimmed]);
			return;
		}
		if (await addDBWorkType(userId, trimmed)) {
			const updatedList = await fetchDBWorkTypes(userId);
			setDbWorkTypes(updatedList);
			const activeNames = updatedList.filter((w) => w.is_active).map((w) => w.name);
			setCategories(activeNames);
			storage.setCategories(activeNames);
		}
	}, [
		categories,
		saveCategories,
		useSupabase,
		userId
	]);
	const editWorkType = (0, import_react.useCallback)(async (id, name) => {
		if (!useSupabase || !userId) {
			const target = dbWorkTypes.find((item) => item.id === id);
			if (target) await saveCategories(categories.map((item) => item === target.name ? name.trim() : item));
			return;
		}
		await updateDBWorkType(id, name);
		const updatedList = await fetchDBWorkTypes(userId);
		setDbWorkTypes(updatedList);
		const activeNames = updatedList.filter((w) => w.is_active).map((w) => w.name);
		setCategories(activeNames);
		storage.setCategories(activeNames);
	}, [
		categories,
		dbWorkTypes,
		saveCategories,
		useSupabase,
		userId
	]);
	const toggleWorkType = (0, import_react.useCallback)(async (id) => {
		const target = dbWorkTypes.find((w) => w.id === id);
		if (!target) return;
		if (!useSupabase || !userId) {
			const next = target.is_active ? categories.filter((item) => item !== target.name) : [...categories, target.name];
			await saveCategories(next.length > 0 ? next : categories);
			return;
		}
		if (target.is_active) await softDeleteDBWorkType(id);
		else await addDBWorkType(userId, target.name);
		const updatedList = await fetchDBWorkTypes(userId);
		setDbWorkTypes(updatedList);
		const activeNames = updatedList.filter((w) => w.is_active).map((w) => w.name);
		setCategories(activeNames);
		storage.setCategories(activeNames);
	}, [
		categories,
		dbWorkTypes,
		saveCategories,
		useSupabase,
		userId
	]);
	const softDeleteWorkType = (0, import_react.useCallback)(async (id) => {
		const target = dbWorkTypes.find((item) => item.id === id);
		if (!target) return;
		if (!useSupabase || !userId) {
			const next = categories.filter((item) => item !== target.name);
			await saveCategories(next.length > 0 ? next : categories);
			return;
		}
		await softDeleteDBWorkType(id);
		const updatedList = await fetchDBWorkTypes(userId);
		setDbWorkTypes(updatedList);
		const activeNames = updatedList.filter((w) => w.is_active).map((w) => w.name);
		setCategories(activeNames);
		storage.setCategories(activeNames);
		toast.success("ปิดใช้งานประเภทงานแล้ว (Soft Delete)");
	}, [
		categories,
		dbWorkTypes,
		saveCategories,
		useSupabase,
		userId
	]);
	const setSpreadsheetId = (0, import_react.useCallback)(async (id) => {
		setSpreadsheetIdState(id);
		storage.setSheetId(id);
		if (useSupabase && userId) await saveDBUserSettings(userId, { spreadsheet_id: id });
	}, [useSupabase, userId]);
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
		mirrorToSheet(allLogs, spreadsheetId).then(async () => {
			const syncedAt = (/* @__PURE__ */ new Date()).toISOString();
			const marked = allLogs.map((l) => ({
				...l,
				syncedAt
			}));
			setLogs(marked);
			storage.setLogs(marked);
			if (useSupabase && userId) await Promise.all(marked.map((log) => saveDBWorkLog(userId, log)));
		}).catch((err) => {
			toast.error("อัปเดต Google Sheets ไม่สำเร็จ", { description: err instanceof Error ? err.message : String(err) });
		}).finally(() => setSyncing(false));
	}, [
		mirrorToSheet,
		spreadsheetId,
		useSupabase,
		userId
	]);
	const syncAirtableSingle = (0, import_react.useCallback)(async (log) => {
		try {
			const res = await callServer(syncRecordToAirtable, { data: { log } });
			if (res.success && res.recordId) {
				const updated = {
					...log,
					airtableRecordId: res.recordId,
					airtableSyncedAt: res.syncedAt ?? (/* @__PURE__ */ new Date()).toISOString(),
					airtableSyncStatus: "synced"
				};
				if (useSupabase && userId) await updateDBAirtableStatus(log.id, res.recordId, "synced");
				setLogs((current) => {
					const next = current.map((item) => item.id === log.id ? updated : item);
					storage.setLogs(next);
					return next;
				});
				return {
					success: true,
					recordId: res.recordId
				};
			}
			const failed = {
				...log,
				airtableSyncStatus: "failed"
			};
			if (useSupabase && userId) await updateDBAirtableStatus(log.id, log.airtableRecordId ?? null, "failed");
			setLogs((current) => {
				const next = current.map((item) => item.id === log.id ? failed : item);
				storage.setLogs(next);
				return next;
			});
			return {
				success: false,
				error: res.error
			};
		} catch (err) {
			const failed = {
				...log,
				airtableSyncStatus: "failed"
			};
			if (useSupabase && userId) await updateDBAirtableStatus(log.id, log.airtableRecordId ?? null, "failed");
			setLogs((current) => {
				const next = current.map((item) => item.id === log.id ? failed : item);
				storage.setLogs(next);
				return next;
			});
			return {
				success: false,
				error: err instanceof Error ? err.message : String(err)
			};
		}
	}, [useSupabase, userId]);
	const syncAirtableAll = (0, import_react.useCallback)(async () => {
		setAirtableSyncing(true);
		let successCount = 0;
		try {
			for (const log of logs) if ((await syncAirtableSingle(log)).success) successCount++;
			if (useSupabase && userId) {
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
		useSupabase,
		userId
	]);
	const checkIn = (0, import_react.useCallback)((input) => {
		const now = /* @__PURE__ */ new Date();
		const record = {
			id: `LOG-${now.getTime()}`,
			date: dateInBangkok(now.toISOString()),
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
		if (useSupabase && userId) await saveDBWorkLog(userId, completed);
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
		useSupabase,
		userId
	]);
	const deleteLog = (0, import_react.useCallback)((id) => {
		const next = logs.filter((l) => l.id !== id);
		persistLogs(next);
		if (useSupabase && userId) deleteDBWorkLog(id);
		autoMirror(next);
		toast.success("ลบรายการแล้ว");
	}, [
		autoMirror,
		logs,
		persistLogs,
		useSupabase,
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
			date: dateInBangkok(checkInISO)
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
			date: dateInBangkok(merged.checkInTime),
			...payroll,
			syncedAt: null
		};
		const next = logs.map((l) => l.id === id ? updated : l);
		persistLogs(next);
		if (useSupabase && userId) saveDBWorkLog(userId, updated);
		autoMirror(next);
		toast.success("บันทึกการแก้ไขแล้ว");
	}, [
		autoMirror,
		logs,
		persistLogs,
		useSupabase,
		userId
	]);
	const pullFromSheet = (0, import_react.useCallback)(async (_force = false) => {
		if (!spreadsheetId) {
			toast.info("กรุณาเชื่อมต่อ Google Sheets ก่อน");
			return;
		}
		setSyncing(true);
		try {
			const pulled = (await callServer(readWorkLogRows, { data: { spreadsheetId } })).rows.map(rowToLog).filter((item) => item !== null);
			if (pulled.length === 0) {
				toast.info("ไม่พบรายการใน Google Sheets จึงไม่ล้างข้อมูลเดิม");
				return;
			}
			const mergedById = new Map(logs.map((log) => [log.id, log]));
			for (const log of pulled) mergedById.set(log.id, log);
			const merged = [...mergedById.values()].sort((a, b) => new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime());
			persistLogs(merged);
			if (useSupabase && userId) await Promise.all(pulled.map((log) => saveDBWorkLog(userId, log)));
			toast.success(`ดึงข้อมูลจาก Google Sheets สำเร็จ ${pulled.length} รายการ`);
		} catch (error) {
			toast.error("ดึงข้อมูลจาก Google Sheets ไม่สำเร็จ", { description: error instanceof Error ? error.message : String(error) });
		} finally {
			setSyncing(false);
		}
	}, [
		logs,
		persistLogs,
		spreadsheetId,
		useSupabase,
		userId
	]);
	const syncPending = (0, import_react.useCallback)(() => {
		if (!spreadsheetId) {
			toast.info("กรุณาเชื่อมต่อ Google Sheets ก่อน");
			return;
		}
		autoMirror(logs);
	}, [
		autoMirror,
		logs,
		spreadsheetId
	]);
	return {
		ready,
		logs,
		active,
		categories,
		dbWorkTypes,
		otTypes,
		rates,
		globalRates,
		branches,
		activeBranchId,
		branchSettings,
		branchSettingsLoading,
		themeSettings,
		savedThemeSettings,
		spreadsheetId,
		syncing,
		airtableSyncing,
		pendingCount: logs.filter((l) => !l.syncedAt).length,
		saveCategories,
		addWorkType,
		editWorkType,
		toggleWorkType,
		softDeleteWorkType,
		saveRates,
		addBranch,
		updateBranch,
		selectBranch,
		saveBranchSettings,
		previewThemeSettings,
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
		pullFromSheet,
		syncPending,
		syncAirtableAll
	};
}
var MOBILE_MEDIA_QUERY = "(max-width: 639px)";
function useDashboardLayout(userId, isGuest, viewportOverride) {
	const [detectedViewport, setDetectedViewport] = (0, import_react.useState)(() => getViewport$1());
	const viewport = viewportOverride ?? detectedViewport;
	const [layout, setLayout] = (0, import_react.useState)(() => createDefaultDashboardLayout(viewport));
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [loaded, setLoaded] = (0, import_react.useState)(false);
	const [saving, setSaving] = (0, import_react.useState)(false);
	const loadedKeyRef = (0, import_react.useRef)(null);
	const layoutRef = (0, import_react.useRef)(layout);
	(0, import_react.useEffect)(() => {
		layoutRef.current = layout;
	}, [layout]);
	(0, import_react.useEffect)(() => {
		if (viewportOverride) return;
		const mediaQuery = window.matchMedia(MOBILE_MEDIA_QUERY);
		const updateViewport = () => setDetectedViewport(mediaQuery.matches ? "mobile" : "desktop");
		updateViewport();
		mediaQuery.addEventListener("change", updateViewport);
		return () => mediaQuery.removeEventListener("change", updateViewport);
	}, [viewportOverride]);
	(0, import_react.useEffect)(() => {
		const key = `${userId ?? "guest"}:${viewport}`;
		loadedKeyRef.current = null;
		setLoaded(false);
		setLayout(createDefaultDashboardLayout(viewport));
		if (!userId || isGuest) {
			setLoading(false);
			setLoaded(true);
			return;
		}
		let active = true;
		setLoading(true);
		loadDashboardLayout(userId, viewport).then((nextLayout) => {
			if (!active) return;
			setLayout(nextLayout);
			loadedKeyRef.current = key;
			setLoaded(true);
		}).catch((error) => {
			console.warn("[dashboard-layout] load failed:", error);
			if (active) {
				loadedKeyRef.current = key;
				setLoaded(true);
			}
		}).finally(() => {
			if (active) setLoading(false);
		});
		return () => {
			active = false;
		};
	}, [
		isGuest,
		userId,
		viewport
	]);
	const updateLayout = (0, import_react.useCallback)((updater) => {
		setLayout((current) => updater(current));
	}, []);
	const resetLayout = (0, import_react.useCallback)(() => {
		setLayout(createDefaultDashboardLayout(viewport));
	}, [viewport]);
	const saveLayout = (0, import_react.useCallback)(async () => {
		if (!userId || isGuest || loadedKeyRef.current === null) return;
		setSaving(true);
		try {
			await saveDashboardLayout(userId, viewport, layoutRef.current);
		} finally {
			setSaving(false);
		}
	}, [
		isGuest,
		userId,
		viewport
	]);
	return (0, import_react.useMemo)(() => ({
		layout,
		viewport,
		loading,
		loaded,
		saving,
		updateLayout,
		saveLayout,
		resetLayout
	}), [
		layout,
		loaded,
		loading,
		resetLayout,
		saveLayout,
		saving,
		updateLayout,
		viewport
	]);
}
function getViewport$1() {
	return typeof window !== "undefined" && window.matchMedia(MOBILE_MEDIA_QUERY).matches ? "mobile" : "desktop";
}
var _jsxFileName = "/app/applet/src/routes/_authenticated/index.tsx?tsr-split=component";
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
	const { user, loading, isGuest } = useSession();
	const userId = user?.id ?? null;
	const tracker = useWorkTracker(userId, isGuest);
	const mobileLayout = useDashboardLayout(userId, isGuest, "mobile");
	const desktopLayout = useDashboardLayout(userId, isGuest, "desktop");
	const [dashboardViewport, setDashboardViewport] = (0, import_react.useState)(() => getViewport());
	const lock = useFaceLock(userId);
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [tab, setTab] = (0, import_react.useState)("checkin");
	const [month, setMonth] = (0, import_react.useState)(() => new Intl.DateTimeFormat("en-CA", {
		timeZone: "Asia/Bangkok",
		year: "numeric",
		month: "2-digit"
	}).format(/* @__PURE__ */ new Date()));
	const pulledRef = (0, import_react.useRef)(false);
	const settingsDirtyRef = (0, import_react.useRef)(false);
	(0, import_react.useEffect)(() => {
		const mediaQuery = window.matchMedia("(max-width: 639px)");
		const updateViewport = () => setDashboardViewport(mediaQuery.matches ? "mobile" : "desktop");
		updateViewport();
		mediaQuery.addEventListener("change", updateViewport);
		return () => mediaQuery.removeEventListener("change", updateViewport);
	}, []);
	const requestTabChange = (nextTab) => {
		if (nextTab === tab) return;
		if (tab === "settings" && settingsDirtyRef.current) {
			if (!window.confirm("หน้านี้มีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก ต้องการออกจาก Settings หรือไม่?")) return;
			settingsDirtyRef.current = false;
		}
		setTab(nextTab);
	};
	const [isHeaderVisible, setIsHeaderVisible] = (0, import_react.useState)(true);
	const lastScrollY = (0, import_react.useRef)(0);
	(0, import_react.useEffect)(() => {
		const handleScroll = () => {
			const currentScrollY = window.scrollY;
			if (currentScrollY <= 10) {
				setIsHeaderVisible(true);
				lastScrollY.current = currentScrollY;
				return;
			}
			if (currentScrollY > lastScrollY.current + 5) setIsHeaderVisible(false);
			else if (currentScrollY < lastScrollY.current - 5) setIsHeaderVisible(true);
			lastScrollY.current = currentScrollY;
		};
		window.addEventListener("scroll", handleScroll, { passive: true });
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);
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
	(0, import_react.useEffect)(() => {
		if (!loading && !userId) navigate({
			to: "/auth",
			replace: true
		});
	}, [
		loading,
		userId,
		navigate
	]);
	async function signOut(scope = "local") {
		if (settingsDirtyRef.current) {
			if (!window.confirm("หน้านี้มีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก ต้องการออกจากระบบหรือไม่?")) return;
			settingsDirtyRef.current = false;
		}
		await queryClient.cancelQueries();
		queryClient.clear();
		clearGuestUser();
		try {
			await supabase.auth.signOut({ scope });
		} catch (e) {
			console.warn("SignOut notice:", e);
		}
		navigate({
			to: "/auth",
			replace: true
		});
	}
	if (loading || !userId) return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
		className: "flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-4 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent" }, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 142,
				columnNumber: 9
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
				className: "text-sm font-medium text-muted-foreground",
				children: "กำลังตรวจสอบข้อมูลผู้ใช้…"
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 143,
				columnNumber: 9
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
				onClick: () => void navigate({
					to: "/auth",
					replace: true
				}),
				className: "mt-2 rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-accent transition",
				children: "ไปหน้าเข้าสู่ระบบ (Sign In)"
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 144,
				columnNumber: 9
			}, this)
		]
	}, void 0, true, {
		fileName: _jsxFileName,
		lineNumber: 141,
		columnNumber: 12
	}, this);
	if (lock.checked && lock.locked) return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(FaceLockScreen, {
		name: displayName(user),
		userId,
		onUnlock: lock.unlock,
		onBypassUnlock: lock.forceBypassUnlock,
		onRemoveFaceLock: lock.removeFaceLock,
		onSignOut: () => void signOut()
	}, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 153,
		columnNumber: 12
	}, this);
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
		className: "min-h-screen bg-background pb-16",
		children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
			className: `sticky top-0 z-50 bg-background/95 backdrop-blur-md transition-transform duration-300 ease-in-out ${isHeaderVisible ? "translate-y-0 shadow-sm" : "-translate-y-full"}`,
			children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(AppHeader, {
				name: displayName(user),
				email: user?.email ?? "",
				isGuest,
				faceEnrolled: lock.enrolled,
				faceSupported: lock.supported,
				userId,
				onFaceChanged: lock.refresh,
				onSignOut: () => void signOut(),
				themeMode: tracker.themeSettings.themeMode,
				onToggleTheme: () => tracker.previewThemeSettings({
					...tracker.themeSettings,
					themeMode: tracker.themeSettings.themeMode === "dark" ? "light" : "dark"
				})
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 158,
				columnNumber: 9
			}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
				className: "mx-auto max-w-4xl px-3 pt-2 pb-2 sm:px-4",
				children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "surface-card overflow-x-auto rounded-2xl p-1.5",
					children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "flex min-w-max gap-1",
						children: TABS.map(({ id, label, icon: Icon }) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
							onClick: () => requestTabChange(id),
							"aria-current": tab === id,
							className: `flex min-w-[7.25rem] items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-medium transition md:min-w-0 md:flex-1 md:text-sm ${tab === id ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:bg-accent"}`,
							children: [
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Icon, { className: "h-4 w-4" }, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 172,
									columnNumber: 19
								}, this),
								" ",
								label
							]
						}, id, true, {
							fileName: _jsxFileName,
							lineNumber: 171,
							columnNumber: 19
						}, this))
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 166,
						columnNumber: 13
					}, this)
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 165,
					columnNumber: 11
				}, this)
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 164,
				columnNumber: 9
			}, this)]
		}, void 0, true, {
			fileName: _jsxFileName,
			lineNumber: 157,
			columnNumber: 7
		}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("main", {
			className: "mx-auto max-w-4xl px-3 py-4 sm:px-4 sm:py-5",
			children: !tracker.ready ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
				className: "surface-card p-10 text-center text-sm text-muted-foreground",
				children: "กำลังโหลดข้อมูล…"
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 180,
				columnNumber: 27
			}, this) : tab === "checkin" ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
				className: "space-y-5",
				children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(CheckInPanel, {
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
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 183,
					columnNumber: 13
				}, this)
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 182,
				columnNumber: 40
			}, this) : tab === "dashboard" ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DashboardPanel, {
				logs: tracker.logs,
				layoutState: dashboardViewport === "mobile" ? mobileLayout : desktopLayout,
				chartColors: tracker.themeSettings.chartColors,
				month,
				onMonthChange: setMonth,
				spreadsheetId: tracker.spreadsheetId,
				syncing: tracker.syncing,
				onRefresh: () => void tracker.pullFromSheet()
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 184,
				columnNumber: 42
			}, this) : tab === "history" ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(HistoryPanel, {
				logs: tracker.logs,
				syncing: tracker.syncing,
				pendingCount: tracker.pendingCount,
				categories: tracker.categories,
				onDelete: tracker.deleteLog,
				onSync: () => void tracker.syncPending(),
				onPull: () => void tracker.pullFromSheet(),
				onUpdate: tracker.updateLog
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 184,
				columnNumber: 377
			}, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(SettingsPanel, {
				userId,
				authUser: user,
				isGuest,
				workTypes: tracker.dbWorkTypes,
				otTypes: tracker.otTypes,
				rates: tracker.rates,
				themeSettings: tracker.themeSettings,
				savedThemeSettings: tracker.savedThemeSettings,
				spreadsheetId: tracker.spreadsheetId,
				logs: tracker.logs,
				previewMonth: month,
				mobileLayout,
				desktopLayout,
				onAddWorkType: tracker.addWorkType,
				onEditWorkType: tracker.editWorkType,
				onToggleWorkType: tracker.toggleWorkType,
				onSoftDeleteWorkType: tracker.softDeleteWorkType,
				onSaveRates: tracker.saveRates,
				branches: tracker.branches,
				activeBranchId: tracker.activeBranchId,
				branchSettings: tracker.branchSettings,
				branchSettingsLoading: tracker.branchSettingsLoading,
				onAddBranch: tracker.addBranch,
				onUpdateBranch: tracker.updateBranch,
				onSelectBranch: tracker.selectBranch,
				onSaveBranchSettings: tracker.saveBranchSettings,
				onPreviewThemeSettings: tracker.previewThemeSettings,
				onSaveThemeSettings: tracker.saveThemeSettings,
				onSetSpreadsheetId: tracker.setSpreadsheetId,
				onDirtyChange: (isDirty) => {
					settingsDirtyRef.current = isDirty;
				},
				onSyncAirtableAll: tracker.syncAirtableAll,
				airtableSyncing: tracker.airtableSyncing,
				onSignOut: signOut
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 184,
				columnNumber: 654
			}, this)
		}, void 0, false, {
			fileName: _jsxFileName,
			lineNumber: 179,
			columnNumber: 7
		}, this)]
	}, void 0, true, {
		fileName: _jsxFileName,
		lineNumber: 155,
		columnNumber: 10
	}, this);
}
function getViewport() {
	return typeof window !== "undefined" && window.matchMedia("(max-width: 639px)").matches ? "mobile" : "desktop";
}
//#endregion
export { Index as component };
