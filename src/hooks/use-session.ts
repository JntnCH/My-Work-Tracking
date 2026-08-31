import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "@/integrations/supabase/client";
import {
  subscribeToFirebaseAuthState,
  signOutFirebase,
  isFirebaseConfigured,
} from "@/lib/firebase";
import type { User as FirebaseUser } from "firebase/auth";

const GUEST_STORAGE_KEY = "work_tracker_guest_user";
const AUTH_CHANGE_EVENT = "work_tracker_auth_change";
const RECENT_GMAIL_KEY = "work_tracker_recent_gmail_accounts";
const USER_SCOPED_STORAGE_KEYS = [
  "work_tracker_logs",
  "work_tracker_active",
  "work_tracker_categories",
  "work_tracker_settings",
  "work_tracker_theme",
  "work_tracker_sheet",
] as const;

/** Move legacy local data into the real user's namespace once. */
export function migrateLocalUserData(fromUserId: string, toUserId: string) {
  if (typeof window === "undefined" || !fromUserId || !toUserId || fromUserId === toUserId) return;
  try {
    for (const key of USER_SCOPED_STORAGE_KEYS) {
      const sourceKey = `${key}::${fromUserId}`;
      const targetKey = `${key}::${toUserId}`;
      const sourceValue = localStorage.getItem(sourceKey);
      if (sourceValue !== null && localStorage.getItem(targetKey) === null) {
        localStorage.setItem(targetKey, sourceValue);
      }
    }
    localStorage.removeItem(GUEST_STORAGE_KEY);
  } catch (error) {
    console.warn("[useSession] migrateLocalUserData failed:", error);
  }
}

export type RecentGmailAccount = {
  email: string;
  name: string;
  avatarUrl?: string;
  lastLoginAt: string;
};

export function getRecentGmailAccounts(): RecentGmailAccount[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_GMAIL_KEY);
    return raw ? (JSON.parse(raw) as RecentGmailAccount[]) : [];
  } catch {
    return [];
  }
}

export function saveRecentGmailAccount(account: {
  email: string;
  name?: string;
  avatarUrl?: string;
  lastLoginAt?: string;
}) {
  if (typeof window === "undefined" || !account.email) return;
  try {
    const list = getRecentGmailAccounts().filter(
      (item) => item.email.toLowerCase() !== account.email.toLowerCase(),
    );
    list.unshift({
      email: account.email,
      name: account.name || account.email.split("@")[0] || "ผู้ใช้ Google",
      avatarUrl: account.avatarUrl,
      lastLoginAt: account.lastLoginAt || new Date().toISOString(),
    });
    localStorage.setItem(RECENT_GMAIL_KEY, JSON.stringify(list.slice(0, 5)));
  } catch (err) {
    console.warn("[useSession] saveRecentGmailAccount failed:", err);
  }
}

export function removeRecentGmailAccount(email: string) {
  if (typeof window === "undefined") return;
  try {
    const list = getRecentGmailAccounts().filter(
      (item) => item.email.toLowerCase() !== email.toLowerCase(),
    );
    localStorage.setItem(RECENT_GMAIL_KEY, JSON.stringify(list));
  } catch (err) {
    console.warn("[useSession] removeRecentGmailAccount failed:", err);
  }
}

export function isLocalGuestUser(user: User | null): boolean {
  if (!user) return false;
  const provider = user.app_metadata?.provider;
  if (provider === "guest") return true;
  if (user.email === "guest@worktracker.local" || user.email?.startsWith("guest_")) return true;
  return false;
}

export function isFirebaseUser(user: User | null): boolean {
  return (
    user?.app_metadata?.provider?.startsWith("firebase") ||
    user?.app_metadata?.provider === "google" ||
    user?.app_metadata?.provider === "password" ||
    user?.app_metadata?.provider === "phone"
  );
}

export function firebaseUserToAdapterUser(fbUser: FirebaseUser): User {
  const providerId =
    fbUser.providerData[0]?.providerId || (fbUser.isAnonymous ? "guest" : "firebase:email");
  const fallbackName =
    fbUser.displayName ||
    fbUser.email?.split("@")[0] ||
    (fbUser.phoneNumber ? `เบอร์โทร ${fbUser.phoneNumber}` : "ผู้ใช้งาน");

  return {
    id: fbUser.uid,
    app_metadata: {
      provider: fbUser.isAnonymous ? "guest" : `firebase:${providerId}`,
      providers: fbUser.providerData.map((p) => p.providerId).concat(["firebase"]),
    },
    user_metadata: {
      full_name: fallbackName,
      name: fallbackName,
      avatar_url: fbUser.photoURL || undefined,
      picture: fbUser.photoURL || undefined,
      email: fbUser.email || undefined,
      phone: fbUser.phoneNumber || undefined,
    },
    aud: "authenticated",
    created_at: fbUser.metadata?.creationTime || new Date().toISOString(),
    email: fbUser.email || undefined,
    phone: fbUser.phoneNumber || undefined,
    role: "authenticated",
    updated_at: fbUser.metadata?.lastSignInTime || new Date().toISOString(),
  } as unknown as User;
}

export function getGuestUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(GUEST_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function setLocalUser(
  name: string = "ผู้ใช้ทั่วไป (Guest)",
  email: string = "guest@worktracker.local",
  provider: string = "guest",
  avatarUrl?: string,
  phone?: string,
): User {
  const cleanId = `usr_${email.replace(/[^a-zA-Z0-9]/g, "_") || Math.random().toString(36).slice(2, 10)}`;
  const localUser: Partial<User> = {
    id: cleanId,
    email: email,
    phone: phone,
    app_metadata: { provider, providers: [provider] },
    user_metadata: {
      full_name: name || email.split("@")[0] || "ผู้ใช้งาน",
      name: name || email.split("@")[0] || "ผู้ใช้งาน",
      avatar_url: avatarUrl,
      picture: avatarUrl,
      email: email,
    },
    aud: "authenticated",
    role: "authenticated",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(localUser));
  if (email && (email.includes("@gmail.com") || provider === "google")) {
    saveRecentGmailAccount({
      email,
      name: name || email.split("@")[0] || "ผู้ใช้ Google",
      avatarUrl,
      lastLoginAt: new Date().toISOString(),
    });
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  }
  return localUser as User;
}

export function setGuestUser(
  name: string = "ผู้ใช้ทั่วไป (Guest)",
  email: string = "guest@worktracker.local",
  provider: string = "guest",
  avatarUrl?: string,
): User {
  return setLocalUser(name, email, provider, avatarUrl);
}

export function clearGuestUser() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(GUEST_STORAGE_KEY);
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  }
}

const SESSION_CHECK_TIMEOUT_MS = 2500;

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [guestUser, setGuestUserState] = useState<User | null>(() => getGuestUser());
  const [loading, setLoading] = useState(() => {
    // If local user exists, or no cloud auth is configured, do not block with loading
    if (typeof window !== "undefined" && getGuestUser()) return false;
    if (!isSupabaseConfigured() && !isFirebaseConfigured()) return false;
    return true;
  });

  useEffect(() => {
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

    // 1. Supabase Session Check
    try {
      supabase.auth
        .getSession()
        .then(({ data }) => {
          if (!mounted) return;
          clearTimeout(timeout);
          setSession(data.session);
          setLoading(false);
        })
        .catch((err) => {
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

    // 2. Firebase Auth State Listener
    const unsubscribeFirebase = subscribeToFirebaseAuthState((fbUser) => {
      if (!mounted) return;
      if (fbUser) {
        const adapted = firebaseUserToAdapterUser(fbUser);
        setFirebaseUser(adapted);
        if (fbUser.email) {
          saveRecentGmailAccount({
            email: fbUser.email,
            name: fbUser.displayName || undefined,
            avatarUrl: fbUser.photoURL || undefined,
          });
        }
      } else {
        setFirebaseUser(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      clearTimeout(timeout);
      window.removeEventListener(AUTH_CHANGE_EVENT, syncUserState);
      window.removeEventListener("storage", syncUserState);
      sub?.subscription?.unsubscribe?.();
      unsubscribeFirebase();
    };
  }, []);

  const activeRealUser = session?.user ?? firebaseUser;

  const localUser = guestUser;
  const user: User | null = activeRealUser ?? localUser;
  const isGuest = Boolean(user && isLocalGuestUser(user));

  useEffect(() => {
    if (!activeRealUser || !localUser) return;
    if (activeRealUser.id !== localUser.id) {
      migrateLocalUserData(localUser.id, activeRealUser.id);
    }
  }, [localUser, activeRealUser]);

  return {
    session,
    firebaseUser,
    user,
    loading,
    isGuest,
    isFirebase: Boolean(firebaseUser && !session?.user),
  };
}

export function displayName(user: User | null) {
  if (!user) return "";
  const meta = user.user_metadata as { full_name?: string; name?: string } | undefined;
  return meta?.full_name || meta?.name || user.email?.split("@")[0] || "ผู้ใช้";
}
