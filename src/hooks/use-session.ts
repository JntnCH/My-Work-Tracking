import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

const GUEST_STORAGE_KEY = "work_tracker_guest_user";
const AUTH_CHANGE_EVENT = "work_tracker_auth_change";
const RECENT_GMAIL_KEY = "work_tracker_recent_gmail_accounts";

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

export function saveRecentGmailAccount(account: { email: string; name: string; avatarUrl?: string }) {
  if (typeof window === "undefined") return;
  try {
    const list = getRecentGmailAccounts().filter(
      (item) => item.email.toLowerCase() !== account.email.toLowerCase(),
    );
    const updated: RecentGmailAccount[] = [
      {
        email: account.email,
        name: account.name || account.email.split("@")[0] || "Google User",
        avatarUrl: account.avatarUrl,
        lastLoginAt: new Date().toISOString(),
      },
      ...list,
    ].slice(0, 5); // Keep up to 5 accounts
    localStorage.setItem(RECENT_GMAIL_KEY, JSON.stringify(updated));
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

export function loginWithGmail(
  email: string,
  name?: string,
  avatarUrl?: string,
): User {
  const normalizedEmail = email.trim();
  const displayNameVal = name?.trim() || normalizedEmail.split("@")[0] || "Google User";
  
  // Save to recent accounts
  saveRecentGmailAccount({
    email: normalizedEmail,
    name: displayNameVal,
    avatarUrl,
  });

  return setGuestUser(displayNameVal, normalizedEmail, "google", avatarUrl);
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

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [guestUser, setGuestUserState] = useState<User | null>(() => getGuestUser());
  const [loading, setLoading] = useState(true);

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

    return () => {
      mounted = false;
      clearTimeout(timeout);
      window.removeEventListener(AUTH_CHANGE_EVENT, syncUserState);
      window.removeEventListener("storage", syncUserState);
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  const user: User | null = session?.user ?? guestUser ?? null;
  return {
    session,
    user,
    loading,
    isGuest: !session?.user && !!guestUser && guestUser.app_metadata?.provider === "guest",
  };
}

export function displayName(user: User | null) {
  if (!user) return "";
  const meta = user.user_metadata as { full_name?: string; name?: string } | undefined;
  return meta?.full_name || meta?.name || user.email?.split("@")[0] || "ผู้ใช้";
}

