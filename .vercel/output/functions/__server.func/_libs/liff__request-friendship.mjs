import { Bt as a, Dt as _, It as o, Tt as T, jt as e, q as x, s as T$1, st as R$1, xt as E$1, z as c, zt as t } from "./@liff/activity+[...].mjs";
import { b as l, l as Re, v as b, y as g } from "./@liff/analytics+[...].mjs";
import { __assign, __awaiter, __extends, __generator } from "tslib";
//#region node_modules/@liff/request-friendship/lib/index.es.js
var R;
var E = Re.on;
var D = Re.off;
var I = Re.open;
var A = function() {
	function t$3(t$2, n, r) {
		var c = this;
		this.onSubmit = function(t) {
			return __awaiter(c, void 0, void 0, function() {
				return __generator(this, function(i) {
					return t.ADD_FRIEND_ERROR ? this.reject(R$1(o, t.ADD_FRIEND_ERROR_MESSAGE || t.ADD_FRIEND_ERROR)) : this.resolve(), this.teardown(), [2];
				});
			});
		}, this.onClose = function() {
			return __awaiter(c, void 0, void 0, function() {
				return __generator(this, function(t) {
					return this.resolve(), this.teardown(), [2];
				});
			});
		}, this.onCancel = function() {
			return __awaiter(c, void 0, void 0, function() {
				return __generator(this, function(t$1) {
					return this.reject(R$1(t, "user didn't complete the friend request")), this.teardown(), [2];
				});
			});
		}, this.onError = function(t) {
			return __awaiter(c, void 0, void 0, function() {
				return __generator(this, function(i) {
					return this.reject(t), this.teardown(), [2];
				});
			});
		}, this.resolve = t$2, this.reject = n, this.data = r, this.setup();
	}
	return t$3.prototype.setup = function() {
		E("submit", this.onSubmit), E("close", this.onClose), E("cancel", this.onCancel), E("error", this.onError);
	}, t$3.prototype.teardown = function() {
		D("submit", this.onSubmit), D("close", this.onClose), D("cancel", this.onCancel), D("error", this.onError), R = void 0;
	}, t$3.prototype.open = function(t) {
		var i = c().liffId;
		i ? I({
			url: "".concat("https://liff.line.me/1656032314-CWSCEjzU"),
			appData: __assign({
				liffId: i,
				accessToken: x()
			}, this.data),
			onBeforeTransition: t
		}).catch(this.reject) : this.reject(R$1(T, "liffId is required"));
	}, t$3;
}();
function F() {
	return __awaiter(this, void 0, void 0, function() {
		var t, i;
		return __generator(this, function(e$1) {
			switch (e$1.label) {
				case 0: t = c().liffId, e$1.label = 1;
				case 1: return e$1.trys.push([
					1,
					3,
					,
					4
				]), [4, l("".concat(b("oaAddFriendRateLimit"), "?liffId=").concat(t), { method: "POST" })];
				case 2: return i = e$1.sent(), [3, 4];
				case 3: throw e$1.sent(), R$1(e, "Failed to check rate limit");
				case 4:
					if (429 === i.status) throw R$1(_, "Rate limit exceeded for friend request");
					if (!i.ok) throw R$1(e, "Failed to check rate limit");
					return [2];
			}
		});
	});
}
function j(t) {
	return __awaiter(this, void 0, void 0, function() {
		var o, s, c, u, f, h = this;
		return __generator(this, function(d) {
			switch (d.label) {
				case 0:
					if (T$1.requestFriendship(), s = (o = null != t ? t : {}).officialAccount, c = o.template, s && !s.id.startsWith("@")) throw R$1(E$1, "officialAccount.id must start with \"@\".");
					return u = __assign(__assign({}, s && {
						officialAccountId: s.id,
						officialAccountFallback: s.fallback
					}), c && { templateId: c.id }), f = function() {
						return __awaiter(h, void 0, void 0, function() {
							return __generator(this, function(t) {
								switch (t.label) {
									case 0: return [4, Promise.all([g(__assign(__assign({}, u), { accessToken: x() })), F()])];
									case 1: return t.sent(), [2];
								}
							});
						});
					}, R && R.teardown(), [4, new Promise(function(t, i) {
						(R = new A(t, i, u)).open(f);
					})];
				case 1: return d.sent(), [2];
			}
		});
	});
}
var C = new (function(i) {
	function e() {
		return null !== i && i.apply(this, arguments) || this;
	}
	return __extends(e, i), Object.defineProperty(e.prototype, "name", {
		get: function() {
			return "requestFriendship";
		},
		enumerable: !1,
		configurable: !0
	}), e.prototype.install = function() {
		return j;
	}, e;
}(a))();
//#endregion
export { C as t };
