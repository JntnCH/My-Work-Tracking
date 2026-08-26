import { Bt as a, jt as e, o as w, s as T, st as R, y as E } from "./@liff/activity+[...].mjs";
import { v as b, x as m$1 } from "./@liff/analytics+[...].mjs";
import { __awaiter, __extends, __generator, __read, __spreadArray } from "tslib";
//#region node_modules/@liff/iap/lib/index.es.js
function l(e$2) {
	return __awaiter(this, arguments, void 0, function(t) {
		var e$1 = t.productIds;
		return __generator(this, function(t) {
			switch (t.label) {
				case 0: return [4, w("iap.getPlatformProducts", { productIds: e$1 }).catch(function(t) {
					if (t.code && t.description) throw R(t.code, t.description);
					throw R(e, "Failed to get platform products", { cause: t });
				})];
				case 1: return [2, t.sent().products];
			}
		});
	});
}
var h = function(e) {
	return __awaiter(void 0, [e], void 0, function(t) {
		var e = t.productId, o = t.orderId;
		return __generator(this, function(t) {
			switch (t.label) {
				case 0:
					if (!window.confirm("Proceed with a test in-app purchase?")) throw R("CANCELED", "Transaction was canceled.");
					return [4, m$1(b("iapVirtualConfirm"), {
						method: "POST",
						body: JSON.stringify({
							productId: e,
							orderId: o
						})
					})];
				case 1: return t.sent(), [2];
			}
		});
	});
};
var m = function(e$4) {
	return __awaiter(void 0, [e$4], void 0, function(t) {
		var e$3, o = t.productId, n = t.orderId;
		return __generator(this, function(t) {
			switch (t.label) {
				case 0: return (null == (e$3 = E()) ? void 0 : e$3.isIapSandbox) ? [4, h({
					productId: o,
					orderId: n
				})] : [3, 2];
				case 1:
				case 3: return t.sent(), [2];
				case 2: return [4, w("iap.createPayment", {
					productId: o,
					orderId: n
				}).catch(function(t) {
					if (t.code && t.description) throw R(t.code, t.description);
					throw R(e, "Failed to get platform products", { cause: t });
				})];
			}
		});
	});
};
var v = function(i) {
	function s() {
		return null !== i && i.apply(this, arguments) || this;
	}
	return __extends(s, i), Object.defineProperty(s.prototype, "name", {
		get: function() {
			return "iap";
		},
		enumerable: !1,
		configurable: !0
	}), s.prototype.install = function() {
		var e$6 = this;
		return {
			getPlatformProducts: function() {
				for (var i = [], u = 0; u < arguments.length; u++) i[u] = arguments[u];
				return __awaiter(e$6, void 0, void 0, function() {
					return __generator(this, function(t) {
						return T.iap(), [2, l.apply(void 0, __spreadArray([], __read(i), !1))];
					});
				});
			},
			createPayment: function() {
				for (var i = [], u = 0; u < arguments.length; u++) i[u] = arguments[u];
				return __awaiter(e$6, void 0, void 0, function() {
					return __generator(this, function(t) {
						return T.iap(), [2, m.apply(void 0, __spreadArray([], __read(i), !1))];
					});
				});
			},
			requestConsentAgreement: function() {
				return __awaiter(e$6, void 0, void 0, function() {
					return __generator(this, function(e$5) {
						return T.iap(), [2, __awaiter(void 0, void 0, void 0, function() {
							return __generator(this, function(t) {
								switch (t.label) {
									case 0: return [4, w("iap.requestConsentAgreement").catch(function(t) {
										if (t.code && t.description) throw R(t.code, t.description);
										throw R(e, "Failed to request consent agreement", { cause: t });
									})];
									case 1: return t.sent(), [2];
								}
							});
						})];
					});
				});
			}
		};
	}, s;
}(a);
//#endregion
export { v as t };
