import { Bt as a$1, St as I, f as r, ht as l$1, it as K, l as e, st as R } from "./@liff/activity+[...].mjs";
//#region node_modules/@liff/extensions/lib/es/index.js
var u = function(t, e) {
	return u = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(t, e) {
		t.__proto__ = e;
	} || function(t, e) {
		for (var n in e) Object.prototype.hasOwnProperty.call(e, n) && (t[n] = e[n]);
	}, u(t, e);
};
function s(t, e, n, r) {
	return new (n || (n = Promise))(function(o, i) {
		function c(t) {
			try {
				s(r.next(t));
			} catch (e) {
				i(e);
			}
		}
		function u(t) {
			try {
				s(r.throw(t));
			} catch (e) {
				i(e);
			}
		}
		function s(t) {
			var e;
			t.done ? o(t.value) : (e = t.value, e instanceof n ? e : new n(function(t) {
				t(e);
			})).then(c, u);
		}
		s((r = r.apply(t, e || [])).next());
	});
}
function a(t, e) {
	var n, r, o, i = {
		label: 0,
		sent: function() {
			if (1 & o[0]) throw o[1];
			return o[1];
		},
		trys: [],
		ops: []
	}, c = Object.create(("function" == typeof Iterator ? Iterator : Object).prototype);
	return c.next = u(0), c.throw = u(1), c.return = u(2), "function" == typeof Symbol && (c[Symbol.iterator] = function() {
		return this;
	}), c;
	function u(u) {
		return function(s) {
			return function(u) {
				if (n) throw new TypeError("Generator is already executing.");
				for (; c && (c = 0, u[0] && (i = 0)), i;) try {
					if (n = 1, r && (o = 2 & u[0] ? r.return : u[0] ? r.throw || ((o = r.return) && o.call(r), 0) : r.next) && !(o = o.call(r, u[1])).done) return o;
					switch (r = 0, o && (u = [2 & u[0], o.value]), u[0]) {
						case 0:
						case 1:
							o = u;
							break;
						case 4: return i.label++, {
							value: u[1],
							done: !1
						};
						case 5:
							i.label++, r = u[1], u = [0];
							continue;
						case 7:
							u = i.ops.pop(), i.trys.pop();
							continue;
						default:
							if (!(o = i.trys, (o = o.length > 0 && o[o.length - 1]) || 6 !== u[0] && 2 !== u[0])) {
								i = 0;
								continue;
							}
							if (3 === u[0] && (!o || u[1] > o[0] && u[1] < o[3])) {
								i.label = u[1];
								break;
							}
							if (6 === u[0] && i.label < o[1]) {
								i.label = o[1], o = u;
								break;
							}
							if (o && i.label < o[2]) {
								i.label = o[2], i.ops.push(u);
								break;
							}
							o[2] && i.ops.pop(), i.trys.pop();
							continue;
					}
					u = e.call(t, i);
				} catch (s) {
					u = [6, s], r = 0;
				} finally {
					n = o = 0;
				}
				if (5 & u[0]) throw u[1];
				return {
					value: u[0] ? u[1] : void 0,
					done: !0
				};
			}([u, s]);
		};
	}
}
var f = !1;
var l = function() {
	return f;
};
var p = function(t) {
	function e() {
		return null !== t && t.apply(this, arguments) || this;
	}
	return function(t, e) {
		if ("function" != typeof e && null !== e) throw new TypeError("Class extends value " + String(e) + " is not a constructor or null");
		function n() {
			this.constructor = t;
		}
		u(t, e), t.prototype = null === e ? Object.create(e) : (n.prototype = e.prototype, new n());
	}(e, t), Object.defineProperty(e.prototype, "name", {
		get: function() {
			return "_legacyExtensionsEnabled";
		},
		enumerable: !1,
		configurable: !0
	}), e.prototype.install = function() {
		f = !0;
	}, e;
}(a$1);
function y() {
	var t;
	return "ios" === e() ? (t = r()) && l$1(t, "9.19.0") < 0 ? "https://static.line-scdn.net/liff/edge/2/ios-918-extensions_2_22_0.js" : "https://static.line-scdn.net/liff/edge/2/ios-extensions_2_22_0.js" : "https://static.line-scdn.net/liff/edge/2/non-ios-extensions_2_22_0.js";
}
function d() {
	var r = new Promise(function(n, r) {
		var o = document.createElement("script");
		o.onload = function() {
			var o = window.liffClientExtension;
			o ? n(o) : r(R(I, "Unable to load client features. (Extension is empty)"));
		}, o.onerror = function(n) {
			r(R(I, "Unable to load client features.", { cause: n }));
		}, o.src = y(), o.type = "text/javascript", document.body.appendChild(o);
	});
	return K(r, 1e4);
}
function b() {
	return l() ? function() {
		return s(this, void 0, void 0, function() {
			return a(this, function(t) {
				switch (t.label) {
					case 0: return [3, 2];
					case 1: return [2, t.sent().default];
					case 2: return [2, d()];
				}
			});
		});
	}() : Promise.resolve(void 0);
}
//#endregion
export { p as n, b as t };
