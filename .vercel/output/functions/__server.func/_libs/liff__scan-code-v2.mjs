import { Bt as a, s as T } from "./@liff/activity+[...].mjs";
import { l as Re } from "./@liff/analytics+[...].mjs";
import { __awaiter, __extends, __generator } from "tslib";
//#region node_modules/@liff/scan-code-v2/lib/index.es.js
var s;
var u = function() {
	function o(o, t) {
		var n = this;
		this.resolve = o, this.reject = t, this.onSubmit = function(o) {
			var t = o.message;
			n.resolve({ value: t }), n.destroy();
		}, this.onClose = function() {
			n.resolve({ value: null }), n.destroy();
		}, this.onCancel = function() {
			n.resolve({ value: null }), n.destroy();
		}, this.onError = function(o) {
			n.reject(o), n.destroy();
		}, this.start();
	}
	return o.prototype.start = function() {
		Re.on("submit", this.onSubmit), Re.on("close", this.onClose), Re.on("cancel", this.onCancel), Re.on("error", this.onError);
	}, o.prototype.destroy = function() {
		Re.off("submit", this.onSubmit), Re.off("close", this.onClose), Re.off("cancel", this.onCancel), Re.off("error", this.onError), s = void 0;
	}, o;
}();
function f() {
	return __awaiter(this, void 0, void 0, function() {
		return __generator(this, function(o) {
			return T.scanCodeV2(), s && s.destroy(), [2, new Promise(function(o, t) {
				s = new u(o, t), Re.open({ url: "https://liff.line.me/1656359117-jxmx5e11" }).catch(function(o) {
					s?.destroy(), t(o);
				});
			})];
		});
	});
}
var c = new (function(t) {
	function n() {
		return null !== t && t.apply(this, arguments) || this;
	}
	return __extends(n, t), Object.defineProperty(n.prototype, "name", {
		get: function() {
			return "scanCodeV2";
		},
		enumerable: !1,
		configurable: !0
	}), n.prototype.install = function() {
		return f;
	}, n;
}(a))();
//#endregion
export { c as t };
