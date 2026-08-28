import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { getFirebaseAuth, isFirebaseConfigured } from "@/integrations/firebase/client";

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

/** Move legacy local data into the real Supabase user's namespace once. */
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
  return user?.app_metadata?.provider === "guest";
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

export function setGuestUser(
  name: string = "ผู้ใช้ทั่วไป (Guest)",
  email: string = "guest@worktracker.local",
  provider: string = "guest",
  avatarUrl?: string,
): User {
  const existing = getGuestUser();
  if (existing && existing.email === email && existing.app_metadata?.provider === provider) {
    return existing;
  }
  const cleanId = `usr_${Math.random().toString(36).slice(2, 10)}`;
  const guest: Partial<User> = {
    id: cleanId,
    email: email,
    app_metadata: { provider },
    user_metadata: {
      full_name: name,
      name,
      avatar_url: avatarUrl,
      picture: avatarUrl,
    },
    aud: "authenticated",
    created_at: new Date().toISOString(),
  };
  localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(guest));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  }
  return guest as User;
}

export function clearGuestUser() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(GUEST_STORAGE_KEY);
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  }
}

const SESSION_CHECK_TIMEOUT_MS = 2500;

function mapFirebaseUser(firebaseUser: FirebaseUser): User {
  const providerId = firebaseUser.providerData[0]?.providerId ?? "firebase";
  const createdAt = firebaseUser.metadata.creationTime ?? new Date().toISOString();
  const avatarUrl = firebaseUser.photoURL ?? undefined;
  const displayName = firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "ผู้ใช้";

  return {
    id: firebaseUser.uid,
    aud: "authenticated",
    role: "authenticated",
    email: firebaseUser.email,
    phone: firebaseUser.phoneNumber,
    created_at: createdAt,
    app_metadata: {
      provider: providerId,
      providers: [providerId],
    },
    user_metadata: {
      full_name: displayName,
      name: displayName,
      avatar_url: avatarUrl,
      picture: avatarUrl,
    },
  } as User;
}

export function useSession() {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [guestUser, setGuestUserState] = useState<User | null>(() => getGuestUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const syncUserState = () => setGuestUserState(getGuestUser());

    window.addEventListener(AUTH_CHANGE_EVENT, syncUserState);
    window.addEventListener("storage", syncUserState);
    syncUserState();

    const auth = getFirebaseAuth();
    if (!auth || !isFirebaseConfigured()) {
      setLoading(false);
      return () => {
        window.removeEventListener(AUTH_CHANGE_EVENT, syncUserState);
        window.removeEventListener("storage", syncUserState);
      };
    }

    const timeout = setTimeout(() => {
      if (mounted) setLoading(false);
    }, SESSION_CHECK_TIMEOUT_MS);

    const unsubscribe = onAuthStateChanged(
      auth,
      (nextFirebaseUser) => {
        if (!mounted) return;
        clearTimeout(timeout);
        setFirebaseUser(nextFirebaseUser ? mapFirebaseUser(nextFirebaseUser) : null);
        setLoading(false);
      },
      (error) => {
        console.warn("[useSession] Firebase auth state error:", error);
        if (mounted) {
          clearTimeout(timeout);
          setLoading(false);
        }
      },
    );

    return () => {
      mounted = false;
      clearTimeout(timeout);
      unsubscribe();
      window.removeEventListener(AUTH_CHANGE_EVENT, syncUserState);
      window.removeEventListener("storage", syncUserState);
    };
  }, []);

  useEffect(() => {
    if (!firebaseUser || !guestUser || isLocalGuestUser(guestUser)) return;
    migrateLocalUserData(guestUser.id, firebaseUser.id);
  }, [firebaseUser, guestUser]);

  const localGuest = isLocalGuestUser(guestUser) ? guestUser : null;
  const user: User | null = firebaseUser ?? localGuest;
  return {
    session: null,
    user,
    loading,
    isGuest: !firebaseUser && !!localGuest,
  };
}

export function displayName(user: User | null) {
  if (!user) return "";
  const meta = user.user_metadata as { full_name?: string; name?: string } | undefined;
  return meta?.full_name || meta?.name || user.email?.split("@")[0] || "ผู้ใช้";
}
