import { a as TSS_SERVER_FUNCTION } from "./server-DkLM_YV6.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/createServerRpc-CIN28TQO.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
//#endregion
export { createServerRpc as t };
