import { i as __toESM } from "./_runtime.mjs";
import { i as require_react, r as require_jsx_runtime } from "./_libs/react+tanstack__react-query.mjs";
import { y as useNavigate } from "./_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_-CnmD93rP.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function SplatPage() {
	const navigate = useNavigate();
	(0, import_react.useEffect)(() => {
		navigate({
			to: "/",
			replace: true
		});
	}, [navigate]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4 text-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col items-center gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-medium text-muted-foreground",
				children: "กำลังนำคุณกลับสู่ระบบ..."
			})]
		})
	});
}
//#endregion
export { SplatPage as component };
