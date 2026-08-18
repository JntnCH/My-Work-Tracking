import { i as __toESM } from "../_runtime.mjs";
import { i as require_react, r as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { p as Outlet, y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as useSession } from "./use-session-CMgn6U0v.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/route-DnWr9-nh.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AuthenticatedLayout() {
	const { user, loading } = useSession();
	const navigate = useNavigate();
	(0, import_react.useEffect)(() => {
		if (!loading && !user) navigate({
			to: "/auth",
			replace: true
		});
	}, [
		loading,
		user,
		navigate
	]);
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col items-center gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-medium text-muted-foreground",
				children: "กำลังตรวจสอบสิทธิ์การใช้งาน…"
			})]
		})
	});
	if (!user) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {});
}
//#endregion
export { AuthenticatedLayout as component };
