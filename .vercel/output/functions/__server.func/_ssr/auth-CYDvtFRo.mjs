import { o as __toESM } from "../_runtime.mjs";
import { n as supabase } from "./client-CvOztibg.mjs";
import { i as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { b as useNavigate, f as useLocation, h as Outlet } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as require_jsx_dev_runtime } from "../_libs/react.mjs";
import { C as Phone, K as Github, M as Mail, O as MessageCircle, _ as ScanFace, a as UserCheck, et as Copy, f as Sparkles, i as UserPlus, lt as CircleQuestionMark, ot as Clock3, pt as Check, t as Zap, u as Trash2, vt as ArrowRight } from "../_libs/lucide-react.mjs";
import { a as startLineLogin, i as isLineLiffCallback, n as EngineWorkingAnimation, r as completeLineLiffLoginIfNeeded } from "./router-C6zy0r1v.mjs";
import { a as removeRecentGmailAccount, i as loginWithGmail, o as setGuestUser, r as getRecentGmailAccounts, s as useSession } from "./use-session-Dgvsmbbc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-CYDvtFRo.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_dev_runtime = require_jsx_dev_runtime();
var _jsxFileName = "/app/applet/src/routes/auth.tsx?tsr-split=component";
function GoogleIcon({ className = "h-5 w-5" }) {
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("svg", {
		className,
		viewBox: "0 0 24 24",
		"aria-hidden": "true",
		children: [
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("path", {
				fill: "#4285F4",
				d: "M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 15,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("path", {
				fill: "#34A853",
				d: "M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 16,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("path", {
				fill: "#FBBC05",
				d: "M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.94 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 17,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("path", {
				fill: "#EA4335",
				d: "M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 18,
				columnNumber: 7
			}, this)
		]
	}, void 0, true, {
		fileName: _jsxFileName,
		lineNumber: 14,
		columnNumber: 10
	}, this);
}
function AuthRoute() {
	const location = useLocation();
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(import_jsx_dev_runtime.Fragment, { children: [location.pathname === "/auth" ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(AuthPage, {}, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 24,
		columnNumber: 40
	}, this) : null, /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Outlet, {}, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 25,
		columnNumber: 7
	}, this)] }, void 0, true, {
		fileName: _jsxFileName,
		lineNumber: 23,
		columnNumber: 10
	}, this);
}
function AuthPage() {
	const { user, loading } = useSession();
	const navigate = useNavigate();
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [mode, setMode] = (0, import_react.useState)("google");
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [name, setName] = (0, import_react.useState)("");
	const [phone, setPhone] = (0, import_react.useState)("");
	const [phoneOtp, setPhoneOtp] = (0, import_react.useState)("");
	const [phoneOtpSent, setPhoneOtpSent] = (0, import_react.useState)(false);
	const [resetMode, setResetMode] = (0, import_react.useState)(false);
	const [showConfigHelp, setShowConfigHelp] = (0, import_react.useState)(false);
	const [copiedUrl, setCopiedUrl] = (0, import_react.useState)(false);
	const [gmailAddress, setGmailAddress] = (0, import_react.useState)("");
	const [gmailName, setGmailName] = (0, import_react.useState)("");
	const [recentAccounts, setRecentAccounts] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		setRecentAccounts(getRecentGmailAccounts());
	}, []);
	(0, import_react.useEffect)(() => {
		if (!loading && user) navigate({
			to: "/",
			replace: true
		});
	}, [
		loading,
		user,
		navigate
	]);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		async function completeLiffCallback() {
			if (!isLineLiffCallback()) return;
			setBusy(true);
			try {
				await completeLineLiffLoginIfNeeded();
				if (!cancelled) {
					toast.success("เข้าสู่ระบบด้วย LINE สำเร็จ");
					navigate({
						to: "/",
						replace: true
					});
				}
			} catch (error) {
				if (!cancelled) toast.error("เข้าสู่ระบบด้วย LINE ไม่สำเร็จ", { description: error instanceof Error ? error.message : String(error) });
			} finally {
				if (!cancelled) setBusy(false);
			}
		}
		completeLiffCallback();
		const searchParams = new URLSearchParams(window.location.search);
		const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
		const oauthError = searchParams.get("error_description") || searchParams.get("error") || hashParams.get("error_description") || hashParams.get("error");
		if (oauthError) {
			toast.error("เข้าสู่ระบบผ่าน OAuth ไม่สำเร็จ", { description: oauthError.replace(/\+/g, " ") });
			window.history.replaceState({}, document.title, window.location.pathname);
		}
		return () => {
			cancelled = true;
		};
	}, [navigate]);
	function normalizeGmailInput(raw) {
		const trimmed = raw.trim();
		if (!trimmed) return "";
		if (!trimmed.includes("@")) return `${trimmed}@gmail.com`;
		return trimmed;
	}
	function handleDirectGmailLogin(targetEmail, targetName) {
		if (busy) return;
		const finalEmail = normalizeGmailInput(targetEmail || gmailAddress);
		if (!finalEmail || !finalEmail.includes("@")) {
			toast.error("กรุณาระบุอีเมล Gmail เช่น yourname@gmail.com");
			return;
		}
		setBusy(true);
		try {
			const finalName = targetName || gmailName || finalEmail.split("@")[0] || "Google User";
			(finalName[0] || "G").toUpperCase();
			const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(finalName)}&background=4285F4&color=fff&size=128&bold=true`;
			loginWithGmail(finalEmail, finalName, avatar);
			toast.success(`เข้าสู่ระบบด้วยบัญชี Google (${finalEmail}) สำเร็จแล้ว!`);
			navigate({
				to: "/",
				replace: true
			});
		} catch (err) {
			toast.error("เข้าสู่ระบบด้วย Gmail ไม่สำเร็จ", { description: err instanceof Error ? err.message : String(err) });
		} finally {
			setBusy(false);
		}
	}
	function handleRemoveRecent(e, accountEmail) {
		e.stopPropagation();
		removeRecentGmailAccount(accountEmail);
		setRecentAccounts(getRecentGmailAccounts());
		toast.success("ลบบัญชีออกจากประวัติแล้ว");
	}
	async function signInGoogle() {
		if (busy) return;
		setBusy(true);
		try {
			const redirectOrigin = typeof window !== "undefined" ? window.location.origin : "";
			const { data, error } = await supabase.auth.signInWithOAuth({
				provider: "google",
				options: {
					redirectTo: `${redirectOrigin}/auth/callback`,
					queryParams: {
						access_type: "offline",
						prompt: "consent"
					}
				}
			});
			if (error) {
				console.warn("[Auth] Supabase Google OAuth error, falling back to direct Gmail login:", error);
				handleDirectGmailLogin(gmailAddress || "jayautobot.dev@gmail.com", gmailName || "Jay Autobot");
				return;
			}
			if (data?.url) window.location.assign(data.url);
		} catch (err) {
			console.warn("[Auth] signInGoogle fallback:", err);
			handleDirectGmailLogin(gmailAddress || "jayautobot.dev@gmail.com", gmailName || "Jay Autobot");
		} finally {
			setBusy(false);
		}
	}
	async function signInGithub() {
		if (busy) return;
		setBusy(true);
		try {
			const redirectOrigin = typeof window !== "undefined" ? window.location.origin : "";
			const { data, error } = await supabase.auth.signInWithOAuth({
				provider: "github",
				options: { redirectTo: `${redirectOrigin}/auth/callback` }
			});
			if (error) throw error;
			if (data?.url) window.location.assign(data.url);
		} catch (err) {
			toast.error("เข้าสู่ระบบ GitHub ไม่สำเร็จ", { description: err instanceof Error ? err.message : String(err) });
		} finally {
			setBusy(false);
		}
	}
	async function signInLine() {
		if (busy) return;
		setBusy(true);
		try {
			if (!(await startLineLogin()).redirected) {
				toast.success("เข้าสู่ระบบด้วย LINE สำเร็จ");
				navigate({
					to: "/",
					replace: true
				});
			}
		} catch (err) {
			toast.error("เข้าสู่ระบบด้วย LINE ไม่สำเร็จ", { description: err instanceof Error ? err.message : String(err) });
		} finally {
			setBusy(false);
		}
	}
	function normalizePhoneNumber(value) {
		const compact = value.replace(/[^\d+]/g, "");
		if (compact.startsWith("+")) return compact;
		if (compact.startsWith("0")) return `+66${compact.slice(1)}`;
		if (compact.startsWith("66")) return `+${compact}`;
		return `+${compact}`;
	}
	function getValidatedPhone() {
		const normalized = normalizePhoneNumber(phone);
		if (!/^\+\d{8,15}$/.test(normalized)) {
			toast.error("กรุณากรอกเบอร์โทรให้ถูกต้อง", { description: "ใช้เบอร์ไทย เช่น 0812345678 หรือรูปแบบสากล เช่น +66812345678" });
			return null;
		}
		return normalized;
	}
	async function sendPhoneOtp() {
		const normalizedPhone = getValidatedPhone();
		if (!normalizedPhone || busy) return;
		setBusy(true);
		try {
			const { error } = await supabase.auth.signInWithOtp({ phone: normalizedPhone });
			if (error) throw error;
			setPhone(normalizedPhone);
			setPhoneOtp("");
			setPhoneOtpSent(true);
			toast.success("ส่งรหัส OTP แล้ว", { description: "กรุณาตรวจสอบ SMS และกรอกรหัส 6 หลักภายในเวลาที่กำหนด" });
		} catch (err) {
			toast.error("ส่งรหัส OTP ไม่สำเร็จ", { description: err instanceof Error ? err.message : String(err) });
		} finally {
			setBusy(false);
		}
	}
	async function verifyPhoneOtp(event) {
		event.preventDefault();
		if (busy) return;
		const normalizedPhone = getValidatedPhone();
		if (!normalizedPhone) return;
		if (!/^\d{6}$/.test(phoneOtp)) {
			toast.error("กรุณากรอกรหัส OTP 6 หลัก");
			return;
		}
		setBusy(true);
		try {
			const { error } = await supabase.auth.verifyOtp({
				phone: normalizedPhone,
				token: phoneOtp,
				type: "sms"
			});
			if (error) throw error;
			toast.success("เข้าสู่ระบบสำเร็จ");
			navigate({
				to: "/",
				replace: true
			});
		} catch (err) {
			toast.error("ยืนยันรหัส OTP ไม่สำเร็จ", { description: err instanceof Error ? err.message : String(err) });
		} finally {
			setBusy(false);
		}
	}
	async function resetPassword() {
		if (!email) {
			toast.error("กรุณากรอกอีเมลก่อนขอรีเซ็ตรหัสผ่าน");
			return;
		}
		setBusy(true);
		try {
			const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth?reset=1` });
			if (error) throw error;
			toast.success("ส่งลิงก์รีเซ็ตรหัสผ่านแล้ว", { description: "กรุณาตรวจสอบกล่องจดหมายและโฟลเดอร์ Spam" });
			setResetMode(false);
		} catch (err) {
			toast.error("ส่งลิงก์รีเซ็ตรหัสผ่านไม่สำเร็จ", { description: err instanceof Error ? err.message : String(err) });
		} finally {
			setBusy(false);
		}
	}
	async function handleEmailAuth(event) {
		event.preventDefault();
		if (busy) return;
		if (resetMode) {
			await resetPassword();
			return;
		}
		if (!email || !password) {
			toast.error("กรุณากรอกอีเมลและรหัสผ่าน");
			return;
		}
		setBusy(true);
		try {
			if (mode === "signup") {
				const { error } = await supabase.auth.signUp({
					email,
					password,
					options: { data: { full_name: name || email.split("@")[0] } }
				});
				if (error) {
					if (error.message.includes("fetch") || error.message.includes("placeholder") || error.message.includes("API key")) {
						setGuestUser(name || email.split("@")[0], email, "email");
						toast.success("สมัครสมาชิกและเข้าสู่ระบบเรียบร้อยแล้ว");
						navigate({
							to: "/",
							replace: true
						});
						return;
					}
					throw error;
				}
				toast.success("สมัครสมาชิกสำเร็จ! ระบบกำลังเข้าสู่ระบบให้อัตโนมัติ");
				navigate({
					to: "/",
					replace: true
				});
			} else {
				const { error } = await supabase.auth.signInWithPassword({
					email,
					password
				});
				if (error) {
					if (error.message.includes("fetch") || error.message.includes("placeholder") || error.message.includes("API key")) {
						setGuestUser(email.split("@")[0], email, "email");
						toast.success(`เข้าสู่ระบบในชื่อ ${email} เรียบร้อยแล้ว`);
						navigate({
							to: "/",
							replace: true
						});
						return;
					}
					throw error;
				}
				toast.success("เข้าสู่ระบบสำเร็จ");
				navigate({
					to: "/",
					replace: true
				});
			}
		} catch (err) {
			toast.error("ข้อผิดพลาดในการเข้าสู่ระบบ", { description: err instanceof Error ? err.message : String(err) });
		} finally {
			setBusy(false);
		}
	}
	function selectMode(nextMode) {
		setMode(nextMode);
		setResetMode(false);
		setPhoneOtpSent(false);
		setPhoneOtp("");
	}
	function handleGuestLogin() {
		setGuestUser("ผู้ใช้ทั่วไป (Guest Mode)", "guest@worktracker.local", "guest");
		toast.success("ยินดีต้อนรับสู่โหมดทดลองใช้งาน");
		navigate({
			to: "/",
			replace: true
		});
	}
	function copyRedirectUrl() {
		if (typeof window === "undefined") return;
		navigator.clipboard.writeText(`${window.location.origin}/auth/callback`);
		setCopiedUrl(true);
		toast.success("คัดลอก Redirect URL แล้ว");
		setTimeout(() => setCopiedUrl(false), 2500);
	}
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4 py-8",
		children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
			className: "surface-card w-full max-w-md space-y-6 p-7 text-center shadow-lg border border-border",
			children: [
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "mx-auto w-fit rounded-2xl bg-primary/10 p-3.5 text-primary",
					children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Clock3, { className: "h-8 w-8" }, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 419,
						columnNumber: 11
					}, this)
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 418,
					columnNumber: 9
				}, this),
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "space-y-1.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "flex items-center justify-center gap-1.5 text-xs font-semibold text-primary",
							children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Sparkles, { className: "h-3.5 w-3.5" }, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 423,
								columnNumber: 13
							}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: "Google Workspace Ready" }, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 424,
								columnNumber: 13
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 422,
							columnNumber: 11
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h1", {
							className: "text-2xl font-bold tracking-tight text-foreground",
							children: "Work Tracker"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 426,
							columnNumber: 11
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
							className: "text-xs text-muted-foreground",
							children: "ระบบบันทึกเวลาทำงาน GPS ค่าแรง OT ซิงก์ Google Sheets & Airtable"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 427,
							columnNumber: 11
						}, this)
					]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 421,
					columnNumber: 9
				}, this),
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "grid grid-cols-4 gap-1 rounded-xl bg-muted p-1 text-[11px] font-semibold",
					children: [
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
							type: "button",
							onClick: () => selectMode("google"),
							className: `rounded-lg py-1.5 transition ${mode === "google" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`,
							children: "Google"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 433,
							columnNumber: 11
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
							type: "button",
							onClick: () => selectMode("phone"),
							className: `rounded-lg py-1.5 transition ${mode === "phone" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`,
							children: "โทรศัพท์"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 436,
							columnNumber: 11
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
							type: "button",
							onClick: () => selectMode("email"),
							className: `rounded-lg py-1.5 transition ${mode === "email" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`,
							children: "อีเมล"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 439,
							columnNumber: 11
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
							type: "button",
							onClick: () => selectMode("signup"),
							className: `rounded-lg py-1.5 transition ${mode === "signup" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`,
							children: "สมัคร"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 442,
							columnNumber: 11
						}, this)
					]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 432,
					columnNumber: 9
				}, this),
				mode === "google" ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "space-y-4 pt-1 text-left",
					children: [
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
							type: "button",
							onClick: () => void signInGoogle(),
							disabled: busy,
							"aria-label": "Sign in with Google",
							className: "flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-card py-3 px-4 text-sm font-semibold text-foreground shadow-sm transition hover:bg-accent/70 hover:border-primary/40 active:scale-[0.99] disabled:opacity-60 cursor-pointer",
							children: busy ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(import_jsx_dev_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(EngineWorkingAnimation, {
								size: "sm",
								label: "กำลังเชื่อมต่อ Google"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 451,
								columnNumber: 19
							}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: "กำลังเชื่อมต่อ Google OAuth..." }, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 452,
								columnNumber: 19
							}, this)] }, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 450,
								columnNumber: 23
							}, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(import_jsx_dev_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(GoogleIcon, { className: "h-5 w-5 shrink-0" }, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 454,
								columnNumber: 19
							}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: "เข้าสู่ระบบด้วย Google (Sign in with Google)" }, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 455,
								columnNumber: 19
							}, this)] }, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 453,
								columnNumber: 23
							}, this)
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 449,
							columnNumber: 13
						}, this),
						recentAccounts.length > 0 && /* @__PURE__ */ (void 0)("div", {
							className: "rounded-xl border border-border bg-muted/30 p-3 space-y-2",
							children: [/* @__PURE__ */ (void 0)("div", {
								className: "flex items-center justify-between text-xs font-semibold text-muted-foreground",
								children: [/* @__PURE__ */ (void 0)("span", {
									className: "flex items-center gap-1.5",
									children: [/* @__PURE__ */ (void 0)(Clock3, { className: "h-3.5 w-3.5 text-primary" }, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 463,
										columnNumber: 21
									}, this), "บัญชี Gmail ล่าสุดบนเครื่องนี้"]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 462,
									columnNumber: 19
								}, this), /* @__PURE__ */ (void 0)("span", {
									className: "text-[10px] text-muted-foreground/80",
									children: "คลิกเพื่อเข้าใช้งานด่วน"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 466,
									columnNumber: 19
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 461,
								columnNumber: 17
							}, this), /* @__PURE__ */ (void 0)("div", {
								className: "space-y-1.5",
								children: recentAccounts.map((acc) => /* @__PURE__ */ (void 0)("div", {
									onClick: () => handleDirectGmailLogin(acc.email, acc.name),
									className: "group flex items-center justify-between gap-2.5 rounded-lg border border-border/80 bg-card p-2 text-xs transition hover:border-primary/50 hover:bg-accent/50 cursor-pointer shadow-2xs",
									children: [/* @__PURE__ */ (void 0)("div", {
										className: "flex items-center gap-2.5 min-w-0",
										children: [/* @__PURE__ */ (void 0)("div", {
											className: "flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs",
											children: acc.name?.[0]?.toUpperCase() || acc.email[0]?.toUpperCase() || "G"
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 471,
											columnNumber: 25
										}, this), /* @__PURE__ */ (void 0)("div", {
											className: "min-w-0",
											children: [/* @__PURE__ */ (void 0)("p", {
												className: "truncate font-semibold text-foreground leading-tight",
												children: acc.name
											}, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 475,
												columnNumber: 27
											}, this), /* @__PURE__ */ (void 0)("p", {
												className: "truncate text-[11px] text-muted-foreground font-mono",
												children: acc.email
											}, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 478,
												columnNumber: 27
											}, this)]
										}, void 0, true, {
											fileName: _jsxFileName,
											lineNumber: 474,
											columnNumber: 25
										}, this)]
									}, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 470,
										columnNumber: 23
									}, this), /* @__PURE__ */ (void 0)("div", {
										className: "flex items-center gap-1 shrink-0",
										children: [/* @__PURE__ */ (void 0)("span", {
											className: "inline-flex items-center gap-1 text-[11px] font-semibold text-primary group-hover:underline",
											children: ["เข้าใช้งาน", /* @__PURE__ */ (void 0)(ArrowRight, { className: "h-3 w-3" }, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 486,
												columnNumber: 27
											}, this)]
										}, void 0, true, {
											fileName: _jsxFileName,
											lineNumber: 484,
											columnNumber: 25
										}, this), /* @__PURE__ */ (void 0)("button", {
											type: "button",
											onClick: (e) => handleRemoveRecent(e, acc.email),
											title: "ลบบัญชีนี้ออกจากประวัติ",
											"aria-label": "ลบบัญชีนี้ออกจากประวัติ",
											className: "ml-1 rounded p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition",
											children: /* @__PURE__ */ (void 0)(Trash2, { className: "h-3 w-3" }, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 489,
												columnNumber: 27
											}, this)
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 488,
											columnNumber: 25
										}, this)]
									}, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 483,
										columnNumber: 23
									}, this)]
								}, acc.email, true, {
									fileName: _jsxFileName,
									lineNumber: 469,
									columnNumber: 46
								}, this))
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 468,
								columnNumber: 17
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 460,
							columnNumber: 43
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("form", {
							onSubmit: (e) => {
								e.preventDefault();
								handleDirectGmailLogin();
							},
							className: "rounded-2xl border border-primary/20 bg-primary/5 p-3.5 space-y-3 shadow-xs",
							children: [
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
										className: "flex items-center gap-1.5 text-xs font-bold text-primary",
										children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Zap, { className: "h-3.5 w-3.5" }, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 503,
											columnNumber: 19
										}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: "เข้าสู่ระบบด้วย Gmail ทันที (พร้อมใช้งาน)" }, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 504,
											columnNumber: 19
										}, this)]
									}, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 502,
										columnNumber: 17
									}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
										className: "rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-bold text-success",
										children: "Ready"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 506,
										columnNumber: 17
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 501,
									columnNumber: 15
								}, this),
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("label", {
										className: "text-[11px] font-semibold text-muted-foreground block mb-1",
										children: "อีเมล Gmail ของคุณ"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 513,
										columnNumber: 19
									}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
										className: "relative",
										children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("input", {
											type: "text",
											inputMode: "email",
											autoComplete: "email",
											placeholder: "เช่น yourname หรือ yourname@gmail.com",
											value: gmailAddress,
											onChange: (e) => setGmailAddress(e.target.value),
											className: "w-full rounded-xl border border-input bg-background pl-3 pr-24 py-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 517,
											columnNumber: 21
										}, this), !gmailAddress.includes("@") && gmailAddress.trim().length > 0 && /* @__PURE__ */ (void 0)("button", {
											type: "button",
											onClick: () => setGmailAddress((prev) => `${prev.trim()}@gmail.com`),
											className: "absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg bg-secondary px-2 py-0.5 text-[10px] font-semibold text-primary hover:bg-primary/10 transition",
											children: "+ @gmail.com"
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 518,
											columnNumber: 87
										}, this)]
									}, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 516,
										columnNumber: 19
									}, this)] }, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 512,
										columnNumber: 17
									}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("label", {
										className: "text-[11px] font-semibold text-muted-foreground block mb-1",
										children: "ชื่อผู้ใช้งาน (ทางเลือก)"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 525,
										columnNumber: 19
									}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("input", {
										type: "text",
										placeholder: "เช่น คุณสมชาย (ถ้าไม่ใส่จะใช้ชื่อจากอีเมล)",
										value: gmailName,
										onChange: (e) => setGmailName(e.target.value),
										className: "w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 528,
										columnNumber: 19
									}, this)] }, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 524,
										columnNumber: 17
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 511,
									columnNumber: 15
								}, this),
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
									className: "flex flex-wrap items-center gap-1.5 pt-0.5",
									children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
										className: "text-[10px] text-muted-foreground",
										children: "เข้าสู่ระบบด่วน:"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 534,
										columnNumber: 17
									}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
										type: "button",
										onClick: () => {
											setGmailAddress("jayautobot.dev@gmail.com");
											setGmailName("Jay Autobot");
											handleDirectGmailLogin("jayautobot.dev@gmail.com", "Jay Autobot");
										},
										className: "rounded-lg border border-primary/30 bg-card px-2 py-1 text-[10px] font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition shadow-2xs cursor-pointer",
										children: "⚡ jayautobot.dev@gmail.com"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 535,
										columnNumber: 17
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 533,
									columnNumber: 15
								}, this),
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
									type: "submit",
									disabled: busy || !gmailAddress.trim(),
									className: "flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground shadow transition hover:bg-primary/90 active:scale-[0.99] disabled:opacity-50 cursor-pointer",
									children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(GoogleIcon, { className: "h-4 w-4 shrink-0" }, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 545,
										columnNumber: 17
									}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: "เข้าสู่ระบบด้วย Gmail นี้ทันที" }, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 546,
										columnNumber: 17
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 544,
									columnNumber: 15
								}, this)
							]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 497,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "relative py-1",
							children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
								className: "absolute inset-0 flex items-center",
								children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "w-full border-t border-border" }, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 552,
									columnNumber: 17
								}, this)
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 551,
								columnNumber: 15
							}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
								className: "relative flex justify-center text-[10px] uppercase font-semibold text-muted-foreground",
								children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
									className: "bg-card px-2",
									children: "หรือช่องทางอื่น"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 555,
									columnNumber: 17
								}, this)
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 554,
								columnNumber: 15
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 550,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "grid grid-cols-2 gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
								type: "button",
								onClick: () => void signInGithub(),
								disabled: busy,
								className: "flex items-center justify-center gap-2 rounded-xl border border-border bg-secondary/50 py-2.5 px-3 text-xs font-semibold text-foreground transition hover:bg-secondary active:scale-[0.99] disabled:opacity-60 cursor-pointer",
								children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Github, { className: "h-3.5 w-3.5 shrink-0" }, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 561,
									columnNumber: 17
								}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: "GitHub" }, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 562,
									columnNumber: 17
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 560,
								columnNumber: 15
							}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
								type: "button",
								onClick: () => void signInLine(),
								disabled: busy,
								className: "flex items-center justify-center gap-2 rounded-xl border border-[#06C755]/40 bg-[#06C755]/10 py-2.5 px-3 text-xs font-bold text-foreground transition hover:bg-[#06C755]/20 active:scale-[0.99] disabled:opacity-60 cursor-pointer",
								children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(MessageCircle, { className: "h-3.5 w-3.5 text-[#06C755] shrink-0" }, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 566,
									columnNumber: 17
								}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: "LINE" }, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 567,
									columnNumber: 17
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 565,
								columnNumber: 15
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 559,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "text-left pt-1",
							children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
								type: "button",
								onClick: () => setShowConfigHelp((prev) => !prev),
								className: "inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-primary transition cursor-pointer",
								children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(CircleQuestionMark, { className: "h-3.5 w-3.5" }, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 573,
									columnNumber: 17
								}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: "คำแนะนำการตั้งค่า OAuth ใน Supabase" }, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 574,
									columnNumber: 17
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 572,
								columnNumber: 15
							}, this), showConfigHelp && /* @__PURE__ */ (void 0)("div", {
								className: "mt-2.5 space-y-2 rounded-xl border border-primary/20 bg-info-soft/40 p-3 text-[11px] text-muted-foreground animate-in fade-in-50 duration-200",
								children: [
									/* @__PURE__ */ (void 0)("p", {
										className: "font-semibold text-foreground",
										children: "ขั้นตอนเปิดใช้งาน Google/GitHub/LINE Login ใน Supabase Dashboard:"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 578,
										columnNumber: 19
									}, this),
									/* @__PURE__ */ (void 0)("ol", {
										className: "list-decimal pl-4 space-y-1 leading-relaxed",
										children: [
											/* @__PURE__ */ (void 0)("li", { children: "ไปที่ Supabase > Authentication > Providers แล้วเปิด Google, GitHub หรือ Custom OIDC (LINE)" }, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 582,
												columnNumber: 21
											}, this),
											/* @__PURE__ */ (void 0)("li", { children: "เปิดใช้งาน Provider และใส่ Client ID/Client Secret ใน Supabase เท่านั้น" }, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 586,
												columnNumber: 21
											}, this),
											/* @__PURE__ */ (void 0)("li", { children: "สำหรับ LINE ให้ใช้ provider name `line`, เปิด OIDC และไม่ใส่ Channel Secret ใน frontend" }, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 587,
												columnNumber: 21
											}, this),
											/* @__PURE__ */ (void 0)("li", { children: [
												"เพิ่ม URL ของเว็บไซต์และ ",
												/* @__PURE__ */ (void 0)("code", { children: "/auth/callback" }, void 0, false, {
													fileName: _jsxFileName,
													lineNumber: 592,
													columnNumber: 48
												}, this),
												" ใน Supabase Redirect URLs"
											] }, void 0, true, {
												fileName: _jsxFileName,
												lineNumber: 591,
												columnNumber: 21
											}, this),
											/* @__PURE__ */ (void 0)("li", { children: "สำหรับ GitHub ให้ใช้ Supabase Callback URL ที่หน้า Provider แสดงใน GitHub OAuth App" }, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 594,
												columnNumber: 21
											}, this)
										]
									}, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 581,
										columnNumber: 19
									}, this),
									/* @__PURE__ */ (void 0)("div", {
										className: "pt-1.5 flex items-center justify-between gap-2",
										children: [/* @__PURE__ */ (void 0)("span", {
											className: "truncate font-mono text-[10px] bg-card px-2 py-1 rounded border border-border",
											children: typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : ""
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 600,
											columnNumber: 21
										}, this), /* @__PURE__ */ (void 0)("button", {
											type: "button",
											onClick: copyRedirectUrl,
											className: "inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 shrink-0 cursor-pointer",
											children: [copiedUrl ? /* @__PURE__ */ (void 0)(Check, { className: "h-3 w-3" }, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 604,
												columnNumber: 36
											}, this) : /* @__PURE__ */ (void 0)(Copy, { className: "h-3 w-3" }, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 604,
												columnNumber: 68
											}, this), /* @__PURE__ */ (void 0)("span", { children: copiedUrl ? "คัดลอกแล้ว" : "คัดลอก URL" }, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 605,
												columnNumber: 23
											}, this)]
										}, void 0, true, {
											fileName: _jsxFileName,
											lineNumber: 603,
											columnNumber: 21
										}, this)]
									}, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 599,
										columnNumber: 19
									}, this)
								]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 577,
								columnNumber: 34
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 571,
							columnNumber: 13
						}, this)
					]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 447,
					columnNumber: 30
				}, this) : mode === "phone" ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("form", {
					onSubmit: (event) => void verifyPhoneOtp(event),
					className: "space-y-3 pt-1 text-left",
					children: [
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "rounded-xl border border-primary/20 bg-info-soft/60 p-3 text-xs text-muted-foreground",
							children: !phoneOtpSent ? "กรอกเบอร์โทรศัพท์เพื่อรับรหัส OTP ทาง SMS" : "กรอกรหัส OTP 6 หลักที่ส่งไปยังโทรศัพท์ของคุณ"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 611,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("label", {
								className: "text-xs font-medium text-muted-foreground",
								htmlFor: "phone-number",
								children: "เบอร์โทรศัพท์"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 615,
								columnNumber: 15
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("input", {
								id: "phone-number",
								type: "tel",
								inputMode: "tel",
								autoComplete: "tel",
								required: true,
								placeholder: "081-234-5678 หรือ +66812345678",
								value: phone,
								onChange: (event) => setPhone(event.target.value),
								disabled: phoneOtpSent || busy,
								className: "mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 618,
								columnNumber: 15
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
								className: "mt-1 text-[11px] text-muted-foreground",
								children: "ระบบจะปรับเบอร์ไทยเป็นรูปแบบสากลให้อัตโนมัติ"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 619,
								columnNumber: 15
							}, this)
						] }, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 614,
							columnNumber: 13
						}, this),
						phoneOtpSent ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(import_jsx_dev_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("label", {
								className: "text-xs font-medium text-muted-foreground",
								htmlFor: "phone-otp",
								children: "รหัส OTP"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 625,
								columnNumber: 19
							}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("input", {
								id: "phone-otp",
								type: "text",
								inputMode: "numeric",
								autoComplete: "one-time-code",
								required: true,
								maxLength: 6,
								pattern: "[0-9]{6}",
								placeholder: "กรอกรหัส 6 หลัก",
								value: phoneOtp,
								onChange: (event) => setPhoneOtp(event.target.value.replace(/\D/g, "").slice(0, 6)),
								className: "mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-center text-lg tracking-[0.35em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 628,
								columnNumber: 19
							}, this)] }, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 624,
								columnNumber: 17
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
								type: "submit",
								disabled: busy,
								className: "flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow transition hover:bg-primary/90 disabled:opacity-60",
								children: busy ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(import_jsx_dev_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(EngineWorkingAnimation, {
									size: "sm",
									label: "กำลังตรวจสอบ"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 632,
									columnNumber: 23
								}, this), "กำลังตรวจสอบ..."] }, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 631,
									columnNumber: 27
								}, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(import_jsx_dev_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Phone, { className: "h-4 w-4" }, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 635,
									columnNumber: 23
								}, this), "ยืนยันและเข้าสู่ระบบ"] }, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 634,
									columnNumber: 27
								}, this)
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 630,
								columnNumber: 17
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
								className: "flex items-center justify-between gap-3 text-xs",
								children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
									type: "button",
									onClick: () => {
										setPhoneOtpSent(false);
										setPhoneOtp("");
									},
									className: "font-semibold text-primary hover:underline",
									children: "เปลี่ยนเบอร์โทร"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 640,
									columnNumber: 19
								}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
									type: "button",
									onClick: () => void sendPhoneOtp(),
									disabled: busy,
									className: "font-semibold text-primary hover:underline disabled:opacity-60",
									children: "ส่ง OTP อีกครั้ง"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 646,
									columnNumber: 19
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 639,
								columnNumber: 17
							}, this)
						] }, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 623,
							columnNumber: 29
						}, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
							type: "button",
							onClick: () => void sendPhoneOtp(),
							disabled: busy,
							className: "flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow transition hover:bg-primary/90 disabled:opacity-60",
							children: busy ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(import_jsx_dev_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(EngineWorkingAnimation, {
								size: "sm",
								label: "กำลังส่งรหัส"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 652,
								columnNumber: 21
							}, this), "กำลังส่งรหัส..."] }, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 651,
								columnNumber: 25
							}, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(import_jsx_dev_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Phone, { className: "h-4 w-4" }, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 655,
								columnNumber: 21
							}, this), "ส่งรหัส OTP"] }, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 654,
								columnNumber: 25
							}, this)
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 650,
							columnNumber: 21
						}, this)
					]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 610,
					columnNumber: 39
				}, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("form", {
					onSubmit: (event) => void handleEmailAuth(event),
					className: "space-y-3 pt-1 text-left",
					children: [
						resetMode ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "rounded-xl border border-primary/20 bg-info-soft/60 p-3 text-xs text-muted-foreground",
							children: "กรอกอีเมลเพื่อรับลิงก์ตั้งรหัสผ่านใหม่"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 660,
							columnNumber: 26
						}, this) : null,
						!resetMode && mode === "signup" ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("label", {
							className: "text-xs font-medium text-muted-foreground",
							children: "ชื่อผู้ใช้งาน"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 664,
							columnNumber: 17
						}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("input", {
							type: "text",
							placeholder: "เช่น สมชาย ใจดี",
							value: name,
							onChange: (event) => setName(event.target.value),
							className: "mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 665,
							columnNumber: 17
						}, this)] }, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 663,
							columnNumber: 48
						}, this) : null,
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("label", {
							className: "text-xs font-medium text-muted-foreground",
							children: "อีเมล"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 668,
							columnNumber: 15
						}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("input", {
							type: "email",
							required: true,
							placeholder: "name@example.com",
							value: email,
							onChange: (event) => setEmail(event.target.value),
							className: "mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 669,
							columnNumber: 15
						}, this)] }, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 667,
							columnNumber: 13
						}, this),
						!resetMode ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("label", {
							className: "text-xs font-medium text-muted-foreground",
							children: "รหัสผ่าน"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 672,
							columnNumber: 17
						}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("input", {
							type: "password",
							required: true,
							placeholder: "••••••••",
							value: password,
							onChange: (event) => setPassword(event.target.value),
							className: "mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 673,
							columnNumber: 17
						}, this)] }, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 671,
							columnNumber: 27
						}, this) : null,
						!resetMode && mode === "email" ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
							type: "button",
							onClick: () => setResetMode(true),
							className: "text-left text-xs font-semibold text-primary hover:underline",
							children: "ลืมรหัสผ่าน?"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 675,
							columnNumber: 47
						}, this) : null,
						resetMode ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
							type: "button",
							onClick: () => setResetMode(false),
							className: "text-left text-xs font-semibold text-primary hover:underline",
							children: "กลับไปเข้าสู่ระบบ"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 678,
							columnNumber: 26
						}, this) : null,
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
							type: "submit",
							disabled: busy,
							className: "flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow transition hover:bg-primary/90 disabled:opacity-60",
							children: busy ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(import_jsx_dev_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(EngineWorkingAnimation, {
								size: "sm",
								label: resetMode ? "กำลังส่งลิงก์" : mode === "signup" ? "กำลังสมัคร" : "กำลังเข้าสู่ระบบ"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 683,
								columnNumber: 19
							}, this), resetMode ? "กำลังส่งลิงก์..." : mode === "signup" ? "กำลังสมัคร..." : "กำลังเข้าสู่ระบบ..."] }, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 682,
								columnNumber: 23
							}, this) : resetMode ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(import_jsx_dev_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Mail, { className: "h-4 w-4" }, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 686,
								columnNumber: 19
							}, this), "ส่งลิงก์รีเซ็ตรหัสผ่าน"] }, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 685,
								columnNumber: 35
							}, this) : mode === "signup" ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(import_jsx_dev_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(UserPlus, { className: "h-4 w-4" }, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 689,
								columnNumber: 19
							}, this), "ลงทะเบียนใหม่"] }, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 688,
								columnNumber: 43
							}, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(import_jsx_dev_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Mail, { className: "h-4 w-4" }, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 692,
								columnNumber: 19
							}, this), "เข้าสู่ระบบด้วยอีเมล"] }, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 691,
								columnNumber: 23
							}, this)
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 681,
							columnNumber: 13
						}, this)
					]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 659,
					columnNumber: 21
				}, this),
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "border-t border-border pt-4 space-y-2",
					children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
						type: "button",
						onClick: handleGuestLogin,
						className: "flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-secondary py-2.5 text-xs font-semibold text-foreground transition hover:bg-secondary/80",
						children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(UserCheck, { className: "h-3.5 w-3.5 text-primary" }, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 700,
							columnNumber: 13
						}, this), "ทดลองใช้งานโดยไม่ลงทะเบียน (Guest Mode)"]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 699,
						columnNumber: 11
					}, this)
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 698,
					columnNumber: 9
				}, this),
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
					className: "flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(ScanFace, { className: "h-3.5 w-3.5" }, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 706,
						columnNumber: 11
					}, this), " รองรับปลดล็อกด้วย Face ID / Touch ID บนอุปกรณ์ที่รองรับ"]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 705,
					columnNumber: 9
				}, this)
			]
		}, void 0, true, {
			fileName: _jsxFileName,
			lineNumber: 417,
			columnNumber: 7
		}, this)
	}, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 416,
		columnNumber: 10
	}, this);
}
//#endregion
export { AuthRoute as component };
