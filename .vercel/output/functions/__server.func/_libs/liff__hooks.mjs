import { __awaiter, __generator, __read, __spreadArray, __values } from "tslib";
//#region node_modules/@liff/hooks/lib/index.es.js
var s = function() {
	var e = this;
	this.type = "sync", this.fns = /* @__PURE__ */ new Set(), this.on = function(n) {
		e.fns.add(n);
	}, this.call = function() {
		for (var i, s, a = [], o = 0; o < arguments.length; o++) a[o] = arguments[o];
		try {
			for (var l = __values(e.fns), c = l.next(); !c.done; c = l.next()) c.value.apply(void 0, __spreadArray([], __read(a), !1));
		} catch (f) {
			i = { error: f };
		} finally {
			try {
				c && !c.done && (s = l.return) && s.call(l);
			} finally {
				if (i) throw i.error;
			}
		}
	};
};
var a = function() {
	var s = this;
	this.type = "async", this.fns = /* @__PURE__ */ new Set(), this.on = function(n) {
		s.fns.add(n);
	}, this.call = function() {
		for (var a = [], o = 0; o < arguments.length; o++) a[o] = arguments[o];
		return __awaiter(s, void 0, void 0, function() {
			var e, s, o, l, c, f;
			return __generator(this, function(i) {
				switch (i.label) {
					case 0:
						e = [];
						try {
							for (s = __values(this.fns), o = s.next(); !o.done; o = s.next()) l = o.value, e.push(l.apply(void 0, __spreadArray([], __read(a), !1)));
						} catch (u) {
							c = { error: u };
						} finally {
							try {
								o && !o.done && (f = s.return) && f.call(s);
							} finally {
								if (c) throw c.error;
							}
						}
						return [4, Promise.all(e)];
					case 1: return i.sent(), [2];
				}
			});
		});
	};
};
//#endregion
export { s as n, a as t };
