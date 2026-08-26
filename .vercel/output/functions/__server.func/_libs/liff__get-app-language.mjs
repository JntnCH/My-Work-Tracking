import { Bt as a, X as u$1, f as r, ht as l, l as e } from "./@liff/activity+[...].mjs";
import { __extends } from "tslib";
//#region node_modules/@liff/get-app-language/lib/index.es.js
function f() {
	var r$1 = r();
	if (!r$1 || !u$1() || "ios" !== e()) return navigator.language;
	if (l(r$1, "14.11.0") >= 0) {
		var t = window.prompt("LIFF:GET_APP_LANGUAGE");
		if (t) return t;
	}
	return navigator.language;
}
(function(t) {
	function i() {
		return null !== t && t.apply(this, arguments) || this;
	}
	return __extends(i, t), Object.defineProperty(i.prototype, "name", {
		get: function() {
			return "getAppLanguage";
		},
		enumerable: !1,
		configurable: !0
	}), i.prototype.install = function() {
		return function() {
			return f();
		};
	}, i;
})(a);
//#endregion
export { f as t };
