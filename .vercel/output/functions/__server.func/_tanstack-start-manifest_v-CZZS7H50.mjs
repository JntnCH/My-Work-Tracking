//#region node_modules/.nitro/vite/services/ssr/assets/_tanstack-start-manifest_v-CZZS7H50.js
var tsrStartManifest = () => ({ routes: {
	__root__: {
		filePath: "/app/applet/src/routes/__root.tsx",
		children: [
			"/_authenticated",
			"/$",
			"/auth"
		],
		preloads: [
			"/assets/index-DHH1TK0o.js",
			"/assets/rolldown-runtime-hePW80VL.js",
			"/assets/jsx-dev-runtime-DNb4waIk.js",
			"/assets/jsx-runtime-CKUfCowd.js",
			"/assets/Match-DESMWBaU.js",
			"/assets/createLucideIcon-BpHPJnwk.js"
		],
		scripts: [{ attrs: {
			type: "module",
			async: !0,
			src: "/assets/index-DHH1TK0o.js"
		} }]
	},
	"/_authenticated": {
		filePath: "/app/applet/src/routes/_authenticated/route.tsx",
		children: ["/_authenticated/"],
		preloads: ["/assets/route-DCzCTivr.js", "/assets/use-session-Dxnkieqy.js"]
	},
	"/$": {
		filePath: "/app/applet/src/routes/$.tsx",
		children: void 0,
		preloads: ["/assets/_-DJbtr9-7.js"]
	},
	"/auth": {
		filePath: "/app/applet/src/routes/auth.tsx",
		children: ["/auth/callback"],
		preloads: [
			"/assets/auth-BgzYLkx_.js",
			"/assets/trash-2-rRiOUzge.js",
			"/assets/use-session-Dxnkieqy.js"
		]
	},
	"/auth/callback": {
		filePath: "/app/applet/src/routes/auth.callback.tsx",
		children: void 0,
		preloads: ["/assets/auth.callback-uPS8FRlZ.js", "/assets/loader-circle-bt5B35zc.js"]
	},
	"/_authenticated/": {
		filePath: "/app/applet/src/routes/_authenticated/index.tsx",
		children: void 0,
		preloads: [
			"/assets/_authenticated-MPXO9_I4.js",
			"/assets/trash-2-rRiOUzge.js",
			"/assets/loader-circle-bt5B35zc.js"
		]
	}
} });
//#endregion
export { tsrStartManifest };
