import { o as __toESM } from "../_runtime.mjs";
import { n as supabase } from "./client-CvOztibg.mjs";
import { i as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { b as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as require_jsx_dev_runtime } from "../_libs/react.mjs";
import { R as LoaderCircle, ft as CircleAlert, yt as ArrowLeft } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth.callback-HcepQSfv.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_dev_runtime = require_jsx_dev_runtime();
var _jsxFileName = "/app/applet/src/routes/auth.callback.tsx?tsr-split=component";
function getCallbackErrorMessage(error) {
	const normalized = (error instanceof Error ? error.message : String(error)).toLowerCase();
	if (normalized.includes("denied") || normalized.includes("cancel") || normalized.includes("access_denied")) return "คุณยกเลิกการเข้าสู่ระบบแล้ว หากต้องการใช้งานต่อ กรุณากลับไปกด Continue with GitHub ใหม่อีกครั้ง";
	if (normalized.includes("expired") || normalized.includes("invalid") || normalized.includes("code")) return "ลิงก์เข้าสู่ระบบหมดอายุหรือถูกใช้ไปแล้ว กรุณากลับไปเริ่มเข้าสู่ระบบใหม่อีกครั้ง";
	if (normalized.includes("provider") || normalized.includes("github")) return "ยังไม่ได้เปิดใช้งาน Provider นี้ใน Supabase หรือการตั้งค่า OAuth ไม่ถูกต้อง";
	return "ไม่สามารถยืนยันการเข้าสู่ระบบได้ กรุณาลองใหม่อีกครั้ง";
}
function AuthCallbackPage() {
	const navigate = useNavigate();
	const [status, setStatus] = (0, import_react.useState)("loading");
	const [errorMessage, setErrorMessage] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		async function completeOAuth() {
			const params = new URLSearchParams(window.location.search);
			const providerError = params.get("error_description") || params.get("error");
			const code = params.get("code");
			if (providerError) throw new Error(providerError.replace(/\+/g, " "));
			if (code) {
				const { error } = await supabase.auth.exchangeCodeForSession(code);
				if (error) {
					const { data } = await supabase.auth.getSession();
					if (!data.session?.user) throw error;
				}
			}
			const { data: { user }, error: userError } = await supabase.auth.getUser();
			if (userError || !user) throw userError ?? /* @__PURE__ */ new Error("No authenticated user found after OAuth callback");
			if (cancelled) return;
			toast.success("เข้าสู่ระบบสำเร็จ");
			navigate({
				to: "/",
				replace: true
			});
		}
		completeOAuth().catch((error) => {
			if (cancelled) return;
			console.error("[AuthCallback] OAuth callback failed", error);
			setErrorMessage(getCallbackErrorMessage(error));
			setStatus("error");
		});
		return () => {
			cancelled = true;
		};
	}, [navigate]);
	if (status === "error") return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4 py-8",
		children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
			className: "surface-card w-full max-w-md space-y-5 border border-destructive/20 p-7 text-center shadow-lg",
			children: [
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive",
					children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(CircleAlert, {
						className: "h-6 w-6",
						"aria-hidden": "true"
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 78,
						columnNumber: 13
					}, this)
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 77,
					columnNumber: 11
				}, this),
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h1", {
						className: "text-xl font-bold text-foreground",
						children: "เข้าสู่ระบบไม่สำเร็จ"
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 81,
						columnNumber: 13
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
						className: "text-sm leading-relaxed text-muted-foreground",
						children: errorMessage
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 82,
						columnNumber: 13
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 80,
					columnNumber: 11
				}, this),
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
					type: "button",
					onClick: () => void navigate({
						to: "/auth",
						replace: true
					}),
					className: "inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90",
					children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(ArrowLeft, {
						className: "h-4 w-4",
						"aria-hidden": "true"
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 88,
						columnNumber: 13
					}, this), "กลับไปหน้าเข้าสู่ระบบ"]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 84,
					columnNumber: 11
				}, this)
			]
		}, void 0, true, {
			fileName: _jsxFileName,
			lineNumber: 76,
			columnNumber: 9
		}, this)
	}, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 75,
		columnNumber: 12
	}, this);
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4 py-8",
		children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
			className: "surface-card flex w-full max-w-md flex-col items-center gap-4 border border-border p-7 text-center shadow-lg",
			children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(LoaderCircle, {
				className: "h-8 w-8 animate-spin text-primary",
				"aria-hidden": "true"
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 96,
				columnNumber: 9
			}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
				className: "space-y-1",
				children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h1", {
					className: "text-lg font-bold text-foreground",
					children: "กำลังยืนยันการเข้าสู่ระบบ"
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 98,
					columnNumber: 11
				}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
					className: "text-sm text-muted-foreground",
					children: "กรุณารอสักครู่ ระบบกำลังเชื่อมต่อบัญชีของคุณ"
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 99,
					columnNumber: 11
				}, this)]
			}, void 0, true, {
				fileName: _jsxFileName,
				lineNumber: 97,
				columnNumber: 9
			}, this)]
		}, void 0, true, {
			fileName: _jsxFileName,
			lineNumber: 95,
			columnNumber: 7
		}, this)
	}, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 94,
		columnNumber: 10
	}, this);
}
//#endregion
export { AuthCallbackPage as component };
