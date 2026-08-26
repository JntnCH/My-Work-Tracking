import { ht as l, s as T } from "./@liff/activity+[...].mjs";
import { C as r$1 } from "./@liff/analytics+[...].mjs";
//#region node_modules/@liff/check-availability/lib/index.es.js
var e = function() {
	function t() {}
	return t.prototype.invoke = function(t) {
		var i = T[t];
		return !!i && (i(), !0);
	}, t;
}();
var r = function() {
	function t(t) {
		this.liff = t;
	}
	return t.prototype.invoke = function(t) {
		return this.liff.checkFeature(t);
	}, t;
}();
var o = function() {
	function n(o) {
		l(r$1(), n.SDK_VERSION_SUPPORTING_NEW) >= 0 ? this.impl = new e() : this.impl = new r(o);
	}
	return Object.defineProperty(n, "SDK_VERSION_SUPPORTING_NEW", {
		get: function() {
			return "2.11.0";
		},
		enumerable: !1,
		configurable: !0
	}), n.prototype.invoke = function(t) {
		return this.impl.invoke(t);
	}, n;
}();
//#endregion
export { o as t };
