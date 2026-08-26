import { Bt as a } from "./@liff/activity+[...].mjs";
import { __extends } from "tslib";
//#region node_modules/@liff/get-language/lib/index.es.js
function r() {
	return navigator.language;
}
(function(n) {
	function e() {
		return null !== n && n.apply(this, arguments) || this;
	}
	return __extends(e, n), Object.defineProperty(e.prototype, "name", {
		get: function() {
			return "getLanguage";
		},
		enumerable: !1,
		configurable: !0
	}), e.prototype.install = function() {
		return function() {
			return r();
		};
	}, e;
})(a);
//#endregion
export { r as t };
