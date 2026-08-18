import { i as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { t as supabase } from "./client-CFjc3-zE.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-session-CMgn6U0v.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var GUEST_STORAGE_KEY = "work_tracker_guest_user";
function getGuestUser() {
	if (typeof window === "undefined") return null;
	const raw = localStorage.getItem(GUEST_STORAGE_KEY);
	if (!raw) return null;
	try {
		return JSON.parse(raw);
	} catch {
		return null;
	}
}
function setGuestUser(name = "ผู้ใช้ทั่วไป (Guest)") {
	const existing = getGuestUser();
	if (existing) return existing;
	const guest = {
		id: `guest_${Math.random().toString(36).slice(2, 10)}`,
		email: "guest@worktracker.local",
		app_metadata: { provider: "guest" },
		user_metadata: {
			full_name: name,
			name
		},
		aud: "authenticated",
		created_at: (/* @__PURE__ */ new Date()).toISOString()
	};
	localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(guest));
	return guest;
}
function clearGuestUser() {
	if (typeof window !== "undefined") localStorage.removeItem(GUEST_STORAGE_KEY);
}
function useSession() {
	const [session, setSession] = (0, import_react.useState)(null);
	const [guestUser, setGuestUserState] = (0, import_react.useState)(() => getGuestUser());
	const [loading, setLoading] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		let mounted = true;
		const localGuest = getGuestUser();
		if (localGuest) setGuestUserState(localGuest);
		supabase.auth.getSession().then(({ data }) => {
			if (!mounted) return;
			setSession(data.session);
			setLoading(false);
		}).catch(() => {
			if (mounted) setLoading(false);
		});
		const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
			setSession(next);
			setLoading(false);
		});
		return () => {
			mounted = false;
			sub.subscription.unsubscribe();
		};
	}, []);
	return {
		session,
		user: session?.user ?? guestUser ?? null,
		loading,
		isGuest: !session?.user && !!guestUser
	};
}
function displayName(user) {
	if (!user) return "";
	const meta = user.user_metadata;
	return meta?.full_name || meta?.name || user.email || "ผู้ใช้";
}
//#endregion
export { useSession as i, displayName as n, setGuestUser as r, clearGuestUser as t };
