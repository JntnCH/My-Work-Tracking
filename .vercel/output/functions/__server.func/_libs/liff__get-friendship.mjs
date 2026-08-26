import { Bt as a, st as R, xt as E } from "./@liff/activity+[...].mjs";
import { a as O, v as b, x as m } from "./@liff/analytics+[...].mjs";
import { __extends } from "tslib";
//#region node_modules/@liff/get-friendship/lib/index.es.js
function l(t) {
	var o = new URL(b("friendship")), f = (null != t ? t : {}).officialAccountId;
	if (void 0 !== f) {
		if (!f.startsWith("@")) throw R(E, "officialAccountId must start with \"@\".");
		o.searchParams.set("officialAccountId", f);
	}
	return m(o.toString());
}
(function(i) {
	function r() {
		return null !== i && i.apply(this, arguments) || this;
	}
	return __extends(r, i), Object.defineProperty(r.prototype, "name", {
		get: function() {
			return "getFriendship";
		},
		enumerable: !1,
		configurable: !0
	}), r.prototype.install = function() {
		return O(l, "profile");
	}, r;
})(a);
//#endregion
export { l as t };
