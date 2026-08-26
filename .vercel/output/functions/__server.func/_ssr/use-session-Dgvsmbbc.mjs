import { o as __toESM } from "../_runtime.mjs";
import { n as supabase } from "./client-CvOztibg.mjs";
import { i as require_react } from "../_libs/react+tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-session-Dgvsmbbc.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var GUEST_STORAGE_KEY = "work_tracker_guest_user";
var AUTH_CHANGE_EVENT = "work_tracker_auth_change";
var RECENT_GMAIL_KEY = "work_tracker_recent_gmail_accounts";
function getRecentGmailAccounts() {
	if (typeof window === "undefined") return [];
	try {
		const raw = localStorage.getItem(RECENT_GMAIL_KEY);
		return raw ? JSON.parse(raw) : [];
	} catch {
		return [];
	}
}
function saveRecentGmailAccount(account) {
	if (typeof window === "undefined") return;
	try {
		const list = getRecentGmailAccounts().filter((item) => item.email.toLowerCase() !== account.email.toLowerCase());
		const updated = [{
			email: account.email,
			name: account.name || account.email.split("@")[0] || "Google User",
			avatarUrl: account.avatarUrl,
			lastLoginAt: (/* @__PURE__ */ new Date()).toISOString()
		}, ...list].slice(0, 5);
		localStorage.setItem(RECENT_GMAIL_KEY, JSON.stringify(updated));
	} catch (err) {
		console.warn("[useSession] saveRecentGmailAccount failed:", err);
	}
}
function removeRecentGmailAccount(email) {
	if (typeof window === "undefined") return;
	try {
		const list = getRecentGmailAccounts().filter((item) => item.email.toLowerCase() !== email.toLowerCase());
		localStorage.setItem(RECENT_GMAIL_KEY, JSON.stringify(list));
	} catch (err) {
		console.warn("[useSession] removeRecentGmailAccount failed:", err);
	}
}
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
function loginWithGmail(email, name, avatarUrl) {
	const normalizedEmail = email.trim();
	const displayNameVal = name?.trim() || normalizedEmail.split("@")[0] || "Google User";
	saveRecentGmailAccount({
		email: normalizedEmail,
		name: displayNameVal,
		avatarUrl
	});
	return setGuestUser(displayNameVal, normalizedEmail, "google", avatarUrl);
}
function setGuestUser(name = "ผู้ใช้ทั่วไป (Guest)", email = "guest@worktracker.local", provider = "guest", avatarUrl) {
	const existing = getGuestUser();
	if (existing && existing.email === email && existing.app_metadata?.provider === provider) return existing;
	const guest = {
		id: `usr_${Math.random().toString(36).slice(2, 10)}`,
		email,
		app_metadata: { provider },
		user_metadata: {
			full_name: name,
			name,
			avatar_url: avatarUrl,
			picture: avatarUrl
		},
		aud: "authenticated",
		created_at: (/* @__PURE__ */ new Date()).toISOString()
	};
	localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(guest));
	if (typeof window !== "undefined") window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
	return guest;
}
function clearGuestUser() {
	if (typeof window !== "undefined") {
		localStorage.removeItem(GUEST_STORAGE_KEY);
		window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
	}
}
var SESSION_CHECK_TIMEOUT_MS = 2500;
function useSession() {
	const [session, setSession] = (0, import_react.useState)(null);
	const [guestUser, setGuestUserState] = (0, import_react.useState)(() => getGuestUser());
	const [loading, setLoading] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		let mounted = true;
		const syncUserState = () => {
			const local = getGuestUser();
			setGuestUserState(local);
		};
		window.addEventListener(AUTH_CHANGE_EVENT, syncUserState);
		window.addEventListener("storage", syncUserState);
		syncUserState();
		const timeout = setTimeout(() => {
			if (mounted) setLoading(false);
		}, SESSION_CHECK_TIMEOUT_MS);
		try {
			supabase.auth.getSession().then(({ data }) => {
				if (!mounted) return;
				clearTimeout(timeout);
				setSession(data.session);
				setLoading(false);
			}).catch((err) => {
				console.warn("[useSession] getSession error:", err);
				if (mounted) {
					clearTimeout(timeout);
					setLoading(false);
				}
			});
		} catch (err) {
			console.warn("[useSession] Supabase client access error:", err);
			if (mounted) {
				clearTimeout(timeout);
				setLoading(false);
			}
		}
		const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
			clearTimeout(timeout);
			setSession(next);
			setLoading(false);
		});
		return () => {
			mounted = false;
			clearTimeout(timeout);
			window.removeEventListener(AUTH_CHANGE_EVENT, syncUserState);
			window.removeEventListener("storage", syncUserState);
			sub?.subscription?.unsubscribe?.();
		};
	}, []);
	return {
		session,
		user: session?.user ?? guestUser ?? null,
		loading,
		isGuest: !session?.user && !!guestUser && guestUser.app_metadata?.provider === "guest"
	};
}
function displayName(user) {
	if (!user) return "";
	const meta = user.user_metadata;
	return meta?.full_name || meta?.name || user.email?.split("@")[0] || "ผู้ใช้";
}
//#endregion
export { removeRecentGmailAccount as a, loginWithGmail as i, displayName as n, setGuestUser as o, getRecentGmailAccounts as r, useSession as s, clearGuestUser as t };
