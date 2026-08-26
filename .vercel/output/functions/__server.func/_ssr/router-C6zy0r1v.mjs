import { o as __toESM } from "../_runtime.mjs";
import { t as __exportAll } from "./rolldown-runtime-D7D4PA-g.mjs";
import { n as supabase } from "./client-CvOztibg.mjs";
import { i as require_react, t as QueryClientProvider } from "../_libs/react+tanstack__react-query.mjs";
import { _ as createFileRoute, d as HeadContent, g as lazyRouteComponent, h as Outlet, m as createRouter, u as Scripts, v as createRootRouteWithContext, x as useRouter, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { n as toast, t as Toaster } from "../_libs/sonner.mjs";
import { t as require_jsx_dev_runtime } from "../_libs/react.mjs";
import { t as liff } from "../_libs/line__liff+whatwg-fetch.mjs";
import { nt as Cog, q as Gauge, t as Zap } from "../_libs/lucide-react.mjs";
import { t as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-C6zy0r1v.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_dev_runtime = require_jsx_dev_runtime();
var _jsxFileName$2 = "/app/applet/src/components/ui/sonner.tsx";
var Toaster$1 = ({ ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Toaster, {
		className: "toaster group",
		toastOptions: { classNames: {
			toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
			description: "group-[.toast]:text-muted-foreground",
			actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
			cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
		} },
		...props
	}, void 0, false, {
		fileName: _jsxFileName$2,
		lineNumber: 7,
		columnNumber: 5
	}, void 0);
};
var LINE_PROVIDER = "custom:line";
var LIFF_ID = String({
	"BASE_URL": "/",
	"DEV": true,
	"MODE": "production",
	"PROD": false,
	"SSR": true,
	"TSS_DEV_SERVER": "false",
	"TSS_DEV_SSR_STYLES_BASEPATH": "/",
	"TSS_DEV_SSR_STYLES_ENABLED": "true",
	"TSS_DISABLE_CSRF_MIDDLEWARE_WARNING": "false",
	"TSS_INLINE_CSS_ENABLED": "false",
	"TSS_ROUTER_BASEPATH": "",
	"TSS_SERVER_FN_BASE": "/_serverFn/"
}["VITE_LINE_LIFF_ID"] ?? "").trim();
var LINE_RETURN_PARAM = "line_login";
function getCurrentOrigin() {
	if (typeof window === "undefined") return "";
	return window.location.origin;
}
function getLiffReturnUrl() {
	return `${getCurrentOrigin()}/auth?${LINE_RETURN_PARAM}=1`;
}
function isLineLiffCallback() {
	if (typeof window === "undefined") return false;
	return new URLSearchParams(window.location.search).get(LINE_RETURN_PARAM) === "1";
}
function isLineLiffPrimaryRedirect() {
	if (typeof window === "undefined") return false;
	return new URLSearchParams(window.location.search).has("liff.state");
}
async function initializeLiff() {
	if (!LIFF_ID) throw new Error("ยังไม่ได้ตั้งค่า VITE_LINE_LIFF_ID สำหรับ LINE LIFF");
	await liff.init({ liffId: LIFF_ID });
}
async function initializeLineLiffOnPrimaryRedirect() {
	if (!LIFF_ID || !isLineLiffPrimaryRedirect()) return;
	await initializeLiff();
}
async function startLineLogin() {
	if (!LIFF_ID) {
		const { data, error } = await supabase.auth.signInWithOAuth({
			provider: LINE_PROVIDER,
			options: { redirectTo: `${getCurrentOrigin()}/auth/callback` }
		});
		if (error) throw error;
		if (data?.url) window.location.assign(data.url);
		return { redirected: true };
	}
	await initializeLiff();
	if (!liff.isLoggedIn()) {
		liff.login({ redirectUri: getLiffReturnUrl() });
		return { redirected: true };
	}
	const idToken = liff.getIDToken();
	if (!idToken) throw new Error("ไม่พบ LINE ID token กรุณาอนุญาตการเข้าสู่ระบบใหม่อีกครั้ง");
	const { error } = await supabase.auth.signInWithIdToken({
		provider: LINE_PROVIDER,
		token: idToken
	});
	if (error) throw error;
	return { redirected: false };
}
async function completeLineLiffLoginIfNeeded() {
	if (!LIFF_ID || !isLineLiffCallback()) return { redirected: false };
	await initializeLiff();
	if (!liff.isLoggedIn()) throw new Error("การเข้าสู่ระบบ LINE ไม่เสร็จสมบูรณ์ กรุณาลองใหม่อีกครั้ง");
	const idToken = liff.getIDToken();
	if (!idToken) throw new Error("ไม่พบ LINE ID token หลังกลับจาก LIFF");
	const { error } = await supabase.auth.signInWithIdToken({
		provider: LINE_PROVIDER,
		token: idToken
	});
	if (error) throw error;
	if (typeof window !== "undefined") {
		const cleanUrl = `${window.location.origin}${window.location.pathname}`;
		window.history.replaceState({}, document.title, cleanUrl);
	}
	return { redirected: false };
}
var styles_default = "/assets/styles-Bo5EgQtT.css";
function reportLovableError(error, context = {}) {
	if (typeof window === "undefined") return;
	window.__lovableEvents?.captureException?.(error, {
		source: "react_error_boundary",
		route: window.location.pathname,
		...context
	}, {
		mechanism: "react_error_boundary",
		handled: false,
		severity: "error"
	});
	const message = error instanceof Response ? `Response ${error.status}${error.url ? ` at ${error.url}` : ""}` : error instanceof Error ? error.message : String(error);
	const stack = error instanceof Error ? error.stack : void 0;
	window.__lovableReportRuntimeError?.({
		message,
		...stack !== void 0 && { stack },
		filename: window.location.pathname
	});
}
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var _jsxFileName$1 = "/app/applet/src/components/ui/engine-working-animation.tsx";
var sizeClasses = {
	sm: "engine-working--sm",
	md: "engine-working--md",
	lg: "engine-working--lg"
};
function EngineWorkingAnimation({ label = "กำลังทำงาน", size = "md", showLabel = false, decorative = false, className }) {
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
		className: cn("engine-working", sizeClasses[size], className),
		role: decorative ? void 0 : "status",
		"aria-label": decorative ? void 0 : label,
		"aria-live": decorative ? void 0 : "polite",
		children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
			className: "engine-working__visual",
			"aria-hidden": "true",
			children: [
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
					className: "engine-working__machine",
					children: [
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { className: "engine-working__cylinder engine-working__cylinder--one" }, void 0, false, {
							fileName: _jsxFileName$1,
							lineNumber: 34,
							columnNumber: 11
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { className: "engine-working__cylinder engine-working__cylinder--two" }, void 0, false, {
							fileName: _jsxFileName$1,
							lineNumber: 35,
							columnNumber: 11
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { className: "engine-working__cylinder engine-working__cylinder--three" }, void 0, false, {
							fileName: _jsxFileName$1,
							lineNumber: 36,
							columnNumber: 11
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { className: "engine-working__cylinder engine-working__cylinder--four" }, void 0, false, {
							fileName: _jsxFileName$1,
							lineNumber: 37,
							columnNumber: 11
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { className: "engine-working__piston engine-working__piston--one" }, void 0, false, {
							fileName: _jsxFileName$1,
							lineNumber: 38,
							columnNumber: 11
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { className: "engine-working__piston engine-working__piston--two" }, void 0, false, {
							fileName: _jsxFileName$1,
							lineNumber: 39,
							columnNumber: 11
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { className: "engine-working__piston engine-working__piston--three" }, void 0, false, {
							fileName: _jsxFileName$1,
							lineNumber: 40,
							columnNumber: 11
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { className: "engine-working__piston engine-working__piston--four" }, void 0, false, {
							fileName: _jsxFileName$1,
							lineNumber: 41,
							columnNumber: 11
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { className: "engine-working__port" }, void 0, false, {
							fileName: _jsxFileName$1,
							lineNumber: 42,
							columnNumber: 11
						}, this)
					]
				}, void 0, true, {
					fileName: _jsxFileName$1,
					lineNumber: 33,
					columnNumber: 9
				}, this),
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Cog, { className: "engine-working__gear engine-working__gear--back" }, void 0, false, {
					fileName: _jsxFileName$1,
					lineNumber: 44,
					columnNumber: 9
				}, this),
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Gauge, { className: "engine-working__gauge" }, void 0, false, {
					fileName: _jsxFileName$1,
					lineNumber: 45,
					columnNumber: 9
				}, this),
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Zap, { className: "engine-working__spark" }, void 0, false, {
					fileName: _jsxFileName$1,
					lineNumber: 46,
					columnNumber: 9
				}, this),
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
					className: "engine-working__exhaust",
					children: [
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("i", {}, void 0, false, {
							fileName: _jsxFileName$1,
							lineNumber: 48,
							columnNumber: 11
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("i", {}, void 0, false, {
							fileName: _jsxFileName$1,
							lineNumber: 49,
							columnNumber: 11
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("i", {}, void 0, false, {
							fileName: _jsxFileName$1,
							lineNumber: 50,
							columnNumber: 11
						}, this)
					]
				}, void 0, true, {
					fileName: _jsxFileName$1,
					lineNumber: 47,
					columnNumber: 9
				}, this)
			]
		}, void 0, true, {
			fileName: _jsxFileName$1,
			lineNumber: 32,
			columnNumber: 7
		}, this), showLabel && /* @__PURE__ */ (void 0)("span", {
			className: "engine-working__label",
			children: label
		}, void 0, false, {
			fileName: _jsxFileName$1,
			lineNumber: 53,
			columnNumber: 21
		}, this)]
	}, void 0, true, {
		fileName: _jsxFileName$1,
		lineNumber: 26,
		columnNumber: 5
	}, this);
}
var _jsxFileName = "/app/applet/src/routes/__root.tsx";
function NotFoundComponent() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		if (typeof window !== "undefined") router.navigate({
			to: "/",
			replace: true
		});
	}, [router]);
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
			className: "max-w-md text-center space-y-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(EngineWorkingAnimation, {
					size: "lg",
					label: "กำลังนำคุณไปยังหน้าหลัก",
					className: "mx-auto"
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 35,
					columnNumber: 9
				}, this),
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h2", {
					className: "text-lg font-semibold text-foreground",
					children: "กำลังนำคุณไปยังหน้าหลัก..."
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 36,
					columnNumber: 9
				}, this),
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "pt-2",
					children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Link, {
						to: "/",
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "กลับหน้าหลัก"
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 38,
						columnNumber: 11
					}, this)
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 37,
					columnNumber: 9
				}, this)
			]
		}, void 0, true, {
			fileName: _jsxFileName,
			lineNumber: 34,
			columnNumber: 7
		}, this)
	}, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 33,
		columnNumber: 5
	}, this);
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		reportLovableError(error, { boundary: "tanstack_root_error_component" });
	}, [error]);
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h1", {
					className: "text-xl font-semibold tracking-tight text-foreground",
					children: "This page didn't load"
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 60,
					columnNumber: 9
				}, this),
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Something went wrong on our end. You can try refreshing or head back home."
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 63,
					columnNumber: 9
				}, this),
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Try again"
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 67,
						columnNumber: 11
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("a", {
						href: "/",
						className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
						children: "Go home"
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 76,
						columnNumber: 11
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 66,
					columnNumber: 9
				}, this)
			]
		}, void 0, true, {
			fileName: _jsxFileName,
			lineNumber: 59,
			columnNumber: 7
		}, this)
	}, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 58,
		columnNumber: 5
	}, this);
}
var Route$5 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "Work Tracker — ระบบบันทึกงาน & Check-in" },
			{
				name: "description",
				content: "บันทึกเวลาเข้า-ออกงาน พิกัด GPS ค่าแรง OT และซิงก์ลง Google Sheets"
			},
			{
				property: "og:title",
				content: "Work Tracker — ระบบบันทึกงาน & Check-in"
			},
			{
				property: "og:description",
				content: "บันทึกเวลาเข้า-ออกงาน พิกัด GPS ค่าแรง OT และซิงก์ลง Google Sheets"
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			},
			{
				name: "twitter:title",
				content: "Work Tracker — ระบบบันทึกงาน & Check-in"
			},
			{
				name: "twitter:description",
				content: "บันทึกเวลาเข้า-ออกงาน พิกัด GPS ค่าแรง OT และซิงก์ลง Google Sheets"
			},
			{
				property: "og:image",
				content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/18cd3937-beb4-41d7-ac0f-214b6401b89c/id-preview-710e52f7--291cc49f-164d-41b8-bc71-ccebcac01bf4.lovable.app-1785875522608.png"
			},
			{
				name: "twitter:image",
				content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/18cd3937-beb4-41d7-ac0f-214b6401b89c/id-preview-710e52f7--291cc49f-164d-41b8-bc71-ccebcac01bf4.lovable.app-1785875522608.png"
			}
		],
		links: [
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&display=swap"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "icon",
				href: "/favicon.ico",
				type: "image/x-icon"
			}
		]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("html", {
		lang: "en",
		children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("head", { children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(HeadContent, {}, void 0, false, {
			fileName: _jsxFileName,
			lineNumber: 146,
			columnNumber: 9
		}, this) }, void 0, false, {
			fileName: _jsxFileName,
			lineNumber: 145,
			columnNumber: 7
		}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("body", { children: [children, /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Scripts, {}, void 0, false, {
			fileName: _jsxFileName,
			lineNumber: 150,
			columnNumber: 9
		}, this)] }, void 0, true, {
			fileName: _jsxFileName,
			lineNumber: 148,
			columnNumber: 7
		}, this)]
	}, void 0, true, {
		fileName: _jsxFileName,
		lineNumber: 144,
		columnNumber: 5
	}, this);
}
function RootComponent() {
	const { queryClient } = Route$5.useRouteContext();
	const router = useRouter();
	const [isLiffPrimaryRedirectPending, setIsLiffPrimaryRedirectPending] = (0, import_react.useState)(() => isLineLiffPrimaryRedirect());
	(0, import_react.useEffect)(() => {
		if (!isLiffPrimaryRedirectPending) return;
		let cancelled = false;
		initializeLineLiffOnPrimaryRedirect().catch((error) => {
			if (cancelled) return;
			const message = error instanceof Error ? error.message : String(error);
			toast.error("เชื่อมต่อ LINE ไม่สำเร็จ", { description: message });
			window.history.replaceState({}, document.title, window.location.pathname);
		}).finally(() => {
			if (!cancelled) setIsLiffPrimaryRedirectPending(false);
		});
		return () => {
			cancelled = true;
		};
	}, [isLiffPrimaryRedirectPending]);
	(0, import_react.useEffect)(() => {
		try {
			const { data } = supabase.auth.onAuthStateChange((event) => {
				if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
				router.invalidate();
				if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
			});
			return () => data?.subscription?.unsubscribe?.();
		} catch (err) {
			console.warn("[Root] onAuthStateChange error:", err);
		}
	}, [queryClient, router]);
	if (isLiffPrimaryRedirectPending) return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(QueryClientProvider, {
		client: queryClient,
		children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
			className: "flex min-h-screen items-center justify-center bg-background px-4 text-center",
			children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
					className: "text-lg font-semibold text-foreground",
					children: "กำลังเชื่อมต่อ LINE..."
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 202,
					columnNumber: 13
				}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
					className: "text-sm text-muted-foreground",
					children: "กรุณารอสักครู่"
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 203,
					columnNumber: 13
				}, this)]
			}, void 0, true, {
				fileName: _jsxFileName,
				lineNumber: 201,
				columnNumber: 11
			}, this)
		}, void 0, false, {
			fileName: _jsxFileName,
			lineNumber: 200,
			columnNumber: 9
		}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Toaster$1, {
			position: "top-center",
			richColors: true
		}, void 0, false, {
			fileName: _jsxFileName,
			lineNumber: 206,
			columnNumber: 9
		}, this)]
	}, void 0, true, {
		fileName: _jsxFileName,
		lineNumber: 199,
		columnNumber: 7
	}, this);
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(QueryClientProvider, {
		client: queryClient,
		children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Outlet, {}, void 0, false, {
			fileName: _jsxFileName,
			lineNumber: 214,
			columnNumber: 7
		}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Toaster$1, {
			position: "top-center",
			richColors: true
		}, void 0, false, {
			fileName: _jsxFileName,
			lineNumber: 215,
			columnNumber: 7
		}, this)]
	}, void 0, true, {
		fileName: _jsxFileName,
		lineNumber: 212,
		columnNumber: 5
	}, this);
}
var $$splitComponentImporter$4 = () => import("../_-CajThwGx.mjs");
var Route$4 = createFileRoute("/$")({ component: lazyRouteComponent($$splitComponentImporter$4, "component") });
var $$splitComponentImporter$3 = () => import("./route-no34F-2F.mjs");
var Route$3 = createFileRoute("/_authenticated")({ component: lazyRouteComponent($$splitComponentImporter$3, "component") });
var $$splitComponentImporter$2 = () => import("./auth-CYDvtFRo.mjs");
var Route$2 = createFileRoute("/auth")({
	head: () => ({ meta: [
		{ title: "เข้าสู่ระบบ — Work Tracker" },
		{
			name: "description",
			content: "เข้าสู่ระบบด้วย Google, GitHub, อีเมล หรือเบอร์โทร เพื่อบันทึกงานและซิงก์ Google Sheets ของคุณเอง"
		},
		{
			property: "og:title",
			content: "เข้าสู่ระบบ — Work Tracker"
		},
		{
			property: "og:description",
			content: "เข้าสู่ระบบด้วย Google, GitHub, อีเมล หรือเบอร์โทร พร้อม Face ID บน iPhone"
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
var $$splitComponentImporter$1 = () => import("../_authenticated-DsznkV6p.mjs");
var Route$1 = createFileRoute("/_authenticated/")({
	head: () => ({ meta: [
		{ title: "Work Tracker — บันทึกงาน Check-in/Check-out & Google Sheets" },
		{
			name: "description",
			content: "บันทึกเวลาเข้า-ออกงาน พิกัด GPS ค่าแรง OT เบี้ยเลี้ยง พร้อมสรุปรายเดือนและบันทึกลง Google Sheets ของแต่ละผู้ใช้"
		},
		{
			property: "og:title",
			content: "Work Tracker — ระบบบันทึกงาน & Check-in"
		},
		{
			property: "og:description",
			content: "Check-in/Check-out พร้อม GPS คำนวณค่าแรง OT และซิงก์ลง Google Sheets"
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
var $$splitComponentImporter = () => import("./auth.callback-HcepQSfv.mjs");
var Route = createFileRoute("/auth/callback")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
var SplatRoute = Route$4.update({
	id: "/$",
	path: "/$",
	getParentRoute: () => Route$5
});
var AuthenticatedRouteRoute = Route$3.update({
	id: "/_authenticated",
	getParentRoute: () => Route$5
});
var AuthRoute = Route$2.update({
	id: "/auth",
	path: "/auth",
	getParentRoute: () => Route$5
});
var AuthenticatedIndexRoute = Route$1.update({
	id: "/",
	path: "/",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthCallbackRoute = Route.update({
	id: "/callback",
	path: "/callback",
	getParentRoute: () => AuthRoute
});
var AuthenticatedRouteRouteChildren = { AuthenticatedIndexRoute };
var AuthenticatedRouteRouteWithChildren = AuthenticatedRouteRoute._addFileChildren(AuthenticatedRouteRouteChildren);
var AuthRouteChildren = { AuthCallbackRoute };
var rootRouteChildren = {
	AuthenticatedRouteRoute: AuthenticatedRouteRouteWithChildren,
	SplatRoute,
	AuthRoute: AuthRoute._addFileChildren(AuthRouteChildren)
};
var routeTree = Route$5._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
var getRouter = () => {
	const queryClient = new QueryClient();
	return createRouter({
		routeTree,
		context: { queryClient },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { startLineLogin as a, isLineLiffCallback as i, EngineWorkingAnimation as n, completeLineLiffLoginIfNeeded as r, router_exports as t };
