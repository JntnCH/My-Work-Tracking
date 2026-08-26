import { Bt as a, o as w, ot as O, s as T, st as R, xt as E } from "./@liff/activity+[...].mjs";
import { __awaiter, __extends, __generator } from "tslib";
//#region node_modules/@liff/calendar/lib/index.es.js
var m = function(e) {
	return e instanceof Date && !Number.isNaN(e.getTime());
};
function d(i) {
	return __awaiter(this, void 0, void 0, function() {
		var e;
		return __generator(this, function(t) {
			switch (t.label) {
				case 0:
					if (T["calendar.getEvents"](), !i || !m(i.startTime) || !m(i.endTime)) throw R(E, "'startTime' and 'endTime' must be valid Date objects");
					if (i.startTime.getTime() > i.endTime.getTime()) throw R(E, "'startTime' must not be later than 'endTime'");
					return [4, w("calendar.getEvents", {
						startTime: i.startTime.getTime(),
						endTime: i.endTime.getTime()
					}).catch(function(e) {
						return O(e, "Failed to call the calendar bridge API");
					})];
				case 1: return [2, {
					events: (e = t.sent()).events.map(function(e) {
						return {
							title: e.title,
							startTime: new Date(e.startTime),
							endTime: new Date(e.endTime)
						};
					}),
					isThirdPartyCalendarAccessGranted: e.isThirdPartyCalendarAccessGranted
				}];
			}
		});
	});
}
function c() {
	return __awaiter(this, arguments, void 0, function(e) {
		var i, n, d, c;
		return void 0 === e && (e = {}), __generator(this, function(t) {
			switch (t.label) {
				case 0:
					if (T["calendar.showEventCreationModal"](), i = e.title, n = e.startTime, d = e.endTime, c = e.isAllDay, void 0 !== n && !m(n)) throw R(E, "'startTime' must be a valid Date object");
					if (void 0 !== d && !m(d)) throw R(E, "'endTime' must be a valid Date object");
					return [4, w("calendar.showEventCreationModal", {
						title: i,
						mentionedDate: n ? n.getTime() : void 0,
						endTime: d ? d.getTime() : void 0,
						isAllDay: c
					}).catch(function(e) {
						return O(e, "Failed to call the calendar bridge API");
					})];
				case 1: return t.sent(), [2];
			}
		});
	});
}
var f = new (function(e) {
	function t() {
		return null !== e && e.apply(this, arguments) || this;
	}
	return __extends(t, e), Object.defineProperty(t.prototype, "name", {
		get: function() {
			return "calendar";
		},
		enumerable: !1,
		configurable: !0
	}), t.prototype.install = function() {
		return {
			getEvents: d,
			showEventCreationModal: c
		};
	}, t;
}(a))();
//#endregion
export { f as t };
