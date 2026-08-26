import { Bt as a, St as I, Wt as i, it as K, st as R } from "./@liff/activity+[...].mjs";
import { x as m$1 } from "./@liff/analytics+[...].mjs";
import { __awaiter, __extends, __generator } from "tslib";
//#region node_modules/@liff/i18n/lib/index.es.js
var u;
var c = "undefined" == typeof navigator ? "en" : null !== (u = navigator.language) && void 0 !== u ? u : "en";
var f = null;
var p = !1;
function d(n) {
	return __awaiter(this, void 0, void 0, function() {
		return __generator(this, function(t) {
			switch (t.label) {
				case 0: return c = n, [4, h()];
				case 1: return t.sent(), [2];
			}
		});
	});
}
function h() {
	return __awaiter(this, void 0, void 0, function() {
		var n, t, r, i;
		return __generator(this, function(e) {
			switch (e.label) {
				case 0: return e.trys.push([
					0,
					,
					3,
					4
				]), n = new AbortController(), [4, K(m$1("".concat("https://liffsdk.line-scdn.net/xlt/manifest.json"), {
					method: "GET",
					headers: { Accept: "application/json" },
					signal: n.signal
				}), 5e3, n)];
				case 1: return t = e.sent(), r = "".concat(c), !t.languages[r] && c.includes("-") && (r = c.split("-")[0]), t.languages[r] || (r = "en"), i = new AbortController(), [4, K(m$1("".concat("https://liffsdk.line-scdn.net/xlt", "/").concat(t.languages[r]), {
					method: "GET",
					headers: { Accept: "application/json" },
					signal: i.signal
				}), 5e3, i)];
				case 2: return f = e.sent(), [3, 4];
				case 3: return p = !0, [7];
				case 4: return [2];
			}
		});
	});
}
function g(n) {
	if (null === f) {
		if (p) return n;
		throw R(I, "please call xlt after liff.init");
	}
	return f[n];
}
var b = new (function(r) {
	function i$1() {
		return null !== r && r.apply(this, arguments) || this;
	}
	return __extends(i$1, r), Object.defineProperty(i$1.prototype, "name", {
		get: function() {
			return "i18n";
		},
		enumerable: !1,
		configurable: !0
	}), i$1.prototype.install = function(n) {
		return n.internalHooks.init.beforeFinished(this.beforeInitFinished.bind(this)), { setLang: d };
	}, i$1.prototype.beforeInitFinished = function() {
		return __awaiter(this, void 0, void 0, function() {
			var n;
			return __generator(this, function(t) {
				switch (t.label) {
					case 0: return t.trys.push([
						0,
						2,
						,
						3
					]), [4, h()];
					case 1: return t.sent(), [3, 3];
					case 2: return n = t.sent(), i.warn("[LIFF I18n] failed to load XLT data, falling back to raw keys", n), [3, 3];
					case 3: return [2];
				}
			});
		});
	}, i$1;
}(a))();
//#endregion
export { g as n, b as t };
