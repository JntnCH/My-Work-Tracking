import { i as __toESM } from "../_runtime.mjs";
import { i as require_react, r as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as supabase } from "./client-CFjc3-zE.mjs";
import { i as useSession, r as setGuestUser } from "./use-session-CMgn6U0v.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { B as Clock3, b as LogIn, c as ScanFace, n as UserPlus, r as UserCheck, v as Mail } from "../_libs/lucide-react.mjs";
import { t as createLovableAuth } from "../_libs/lovable.dev__cloud-auth-js.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-C7Rg-Pwt.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var lovableAuth = createLovableAuth();
var lovable = { auth: { signInWithOAuth: async (provider, opts) => {
	const result = await lovableAuth.signInWithOAuth(provider, {
		redirect_uri: opts?.redirect_uri ?? window.location.origin,
		extraParams: { ...opts?.extraParams }
	});
	if (result.redirected) return result;
	if (result.error) return result;
	try {
		await supabase.auth.setSession(result.tokens);
	} catch (e) {
		return { error: e instanceof Error ? e : new Error(String(e)) };
	}
	return result;
} } };
function AuthPage() {
	const { user, loading } = useSession();
	const navigate = useNavigate();
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [mode, setMode] = (0, import_react.useState)("google");
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [name, setName] = (0, import_react.useState)("");
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
	async function signInGoogle() {
		setBusy(true);
		try {
			const redirectUri = window.location.origin + "/";
			const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: redirectUri });
			if (result.error) {
				toast.error("เข้าสู่ระบบ Google ไม่สำเร็จ", { description: result.error.message });
				return;
			}
			if (result.redirected) return;
			navigate({
				to: "/",
				replace: true
			});
		} catch (err) {
			toast.error("เข้าสู่ระบบไม่สำเร็จ", { description: err instanceof Error ? err.message : String(err) });
		} finally {
			setBusy(false);
		}
	}
	async function handleEmailAuth(e) {
		e.preventDefault();
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
				if (error) throw error;
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
				if (error) throw error;
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
	function handleGuestLogin() {
		setGuestUser("ผู้ใช้ทั่วไป (Guest Mode)");
		toast.success("ยินดีต้อนรับสู่โหมดทดลองใช้งาน");
		navigate({
			to: "/",
			replace: true
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4 py-8",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "surface-card w-full max-w-sm space-y-6 p-7 text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto w-fit rounded-2xl bg-primary/10 p-3 text-primary",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock3, { className: "h-7 w-7" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-xl font-bold",
						children: "Work Tracker"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: "ระบบบันทึกเวลาทำงาน GPS ค่าแรง OT และ Google Sheets"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex rounded-xl bg-muted p-1 text-xs font-semibold",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setMode("google"),
							className: `flex-1 rounded-lg py-1.5 transition ${mode === "google" ? "bg-card text-foreground shadow" : "text-muted-foreground"}`,
							children: "Google"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setMode("email"),
							className: `flex-1 rounded-lg py-1.5 transition ${mode === "email" ? "bg-card text-foreground shadow" : "text-muted-foreground"}`,
							children: "อีเมล"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setMode("signup"),
							className: `flex-1 rounded-lg py-1.5 transition ${mode === "signup" ? "bg-card text-foreground shadow" : "text-muted-foreground"}`,
							children: "สมัครสมาชิก"
						})
					]
				}),
				mode === "google" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-3 pt-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => void signInGoogle(),
						disabled: busy,
						className: "flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow transition hover:bg-primary/90 disabled:opacity-60",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogIn, { className: "h-4 w-4" }), busy ? "กำลังเชื่อมต่อ..." : "เข้าสู่ระบบด้วย Google"]
					})
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: (e) => void handleEmailAuth(e),
					className: "space-y-3 pt-1 text-left",
					children: [
						mode === "signup" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "text-xs font-medium text-muted-foreground",
							children: "ชื่อผู้ใช้งาน"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "text",
							placeholder: "เช่น สมชาย ใจดี",
							value: name,
							onChange: (e) => setName(e.target.value),
							className: "mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "text-xs font-medium text-muted-foreground",
							children: "อีเมล"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "email",
							required: true,
							placeholder: "name@example.com",
							value: email,
							onChange: (e) => setEmail(e.target.value),
							className: "mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "text-xs font-medium text-muted-foreground",
							children: "รหัสผ่าน"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "password",
							required: true,
							placeholder: "••••••••",
							value: password,
							onChange: (e) => setPassword(e.target.value),
							className: "mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "submit",
							disabled: busy,
							className: "flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow transition hover:bg-primary/90 disabled:opacity-60",
							children: mode === "signup" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { className: "h-4 w-4" }), busy ? "กำลังสมัคร..." : "ลงทะเบียนใหม่"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "h-4 w-4" }), busy ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบด้วยอีเมล"] })
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "border-t border-border pt-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: handleGuestLogin,
						className: "flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-secondary py-2.5 text-xs font-semibold text-foreground transition hover:bg-secondary/80",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserCheck, { className: "h-3.5 w-3.5 text-primary" }), "ทดลองใช้งานโดยไม่ลงทะเบียน (Guest)"]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScanFace, { className: "h-3.5 w-3.5" }), " รองรับปลดล็อกด้วย Face ID บน iPhone หลังเข้าสู่ระบบ"]
				})
			]
		})
	});
}
//#endregion
export { AuthPage as component };
