import { Bt as a } from "./@liff/activity+[...].mjs";
import { __extends } from "tslib";
//#region node_modules/@liff/get-origins/lib/index.es.js
function e() {
	return {
		liffApp: "https://liff.".concat("line.me"),
		liffServer: "https://api.".concat("line.me"),
		miniApp: "https://miniapp.".concat("line.me")
	};
}
(function(n) {
	function i() {
		return null !== n && n.apply(this, arguments) || this;
	}
	return __extends(i, n), Object.defineProperty(i.prototype, "name", {
		get: function() {
			return "getOrigins";
		},
		enumerable: !1,
		configurable: !0
	}), i.prototype.install = function() {
		return function() {
			return e();
		};
	}, i;
})(a);
//#endregion
export { e as t };
