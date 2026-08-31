import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowRight,
  Check,
  Clock3,
  Copy,
  ExternalLink,
  Flame,
  Github,
  HelpCircle,
  LogIn,
  Mail,
  MessageCircle,
  Phone,
  ScanFace,
  Settings,
  Sparkles,
  Trash2,
  User,
  UserCheck,
  UserPlus,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import {
  getRecentGmailAccounts,
  removeRecentGmailAccount,
  setGuestUser,
  setLocalUser,
  useSession,
  type RecentGmailAccount,
} from "@/hooks/use-session";
import { isSupabaseConfigured, supabase } from "@/integrations/supabase/client";
import {
  completeLineLiffLoginIfNeeded,
  getLineAuthErrorMessage,
  isLineLiffCallback,
  startLineLogin,
} from "@/lib/line-auth";
import { EngineWorkingAnimation } from "@/components/ui/engine-working-animation";
import {
  isFirebaseConfigured,
  signInWithGoogleFirebase,
  checkFirebaseRedirectResult,
  getFirebaseConfig,
} from "@/lib/firebase";
import { FirebaseConfigDialog } from "@/components/work/FirebaseConfigDialog";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "เข้าสู่ระบบ — Work Tracker" },
      {
        name: "description",
        content:
          "เข้าสู่ระบบด้วย Google, GitHub, อีเมล หรือเบอร์โทร เพื่อบันทึกงานและซิงก์ Google Sheets ของคุณเอง",
      },
      { property: "og:title", content: "เข้าสู่ระบบ — Work Tracker" },
      {
        property: "og:description",
        content: "เข้าสู่ระบบด้วย Google, GitHub, อีเมล หรือเบอร์โทร พร้อม Face ID บน iPhone",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthRoute,
});

function GoogleIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.94 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

function AuthRoute() {
  const location = useLocation();

  return (
    <>
      {location.pathname === "/auth" ? <AuthPage /> : null}
      <Outlet />
    </>
  );
}

function AuthPage() {
  const { user, loading } = useSession();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"google" | "phone" | "email" | "signup">("google");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [showConfigHelp, setShowConfigHelp] = useState(false);
  const [showFirebaseDialog, setShowFirebaseDialog] = useState(false);
  const [firebaseConfigured, setFirebaseConfigured] = useState(() => isFirebaseConfigured());
  const [supabaseConfigured] = useState(() => isSupabaseConfigured());
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Gmail-specific state
  const [gmailAddress, setGmailAddress] = useState("jayautobot.dev@gmail.com");
  const [gmailName, setGmailName] = useState("Jay Autobot");
  const [recentAccounts, setRecentAccounts] = useState<RecentGmailAccount[]>([]);

  useEffect(() => {
    setRecentAccounts(getRecentGmailAccounts());
    void checkFirebaseRedirectResult().catch(() => {});
  }, []);

  useEffect(() => {
    if (!loading && user) void navigate({ to: "/", replace: true });
  }, [loading, user, navigate]);

  useEffect(() => {
    let cancelled = false;

    async function completeLiffCallback() {
      if (!isLineLiffCallback()) return;
      setBusy(true);
      try {
        await completeLineLiffLoginIfNeeded();
        if (!cancelled) {
          toast.success("เข้าสู่ระบบด้วย LINE สำเร็จ");
          void navigate({ to: "/", replace: true });
        }
      } catch (error) {
        if (!cancelled) {
          toast.error("เข้าสู่ระบบด้วย LINE ไม่สำเร็จ", {
            description: getLineAuthErrorMessage(error),
          });
        }
      } finally {
        if (!cancelled) setBusy(false);
      }
    }

    void completeLiffCallback();

    // Handle OAuth callback parameters or error codes.
    const searchParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const oauthError =
      searchParams.get("error_description") ||
      searchParams.get("error") ||
      hashParams.get("error_description") ||
      hashParams.get("error");

    if (oauthError) {
      toast.error("เข้าสู่ระบบผ่าน OAuth ไม่สำเร็จ", {
        description: oauthError.replace(/\+/g, " "),
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  function normalizeGmailInput(raw: string): string {
    const trimmed = raw.trim();
    if (!trimmed) return "";
    if (!trimmed.includes("@")) {
      return `${trimmed}@gmail.com`;
    }
    return trimmed;
  }

  const [localGeneratedOtp, setLocalGeneratedOtp] = useState<string | null>(null);

  async function handleDirectGmailLogin(targetEmail?: string, targetName?: string) {
    if (busy) return;
    const finalEmail = normalizeGmailInput(targetEmail || gmailAddress);
    if (!finalEmail || !finalEmail.includes("@")) {
      toast.error("กรุณาระบุอีเมล Gmail เช่น yourname@gmail.com");
      return;
    }
    setGmailAddress(finalEmail);
    const finalName = targetName || gmailName || finalEmail.split("@")[0] || "ผู้ใช้ Google";
    if (targetName) setGmailName(targetName);

    setBusy(true);
    try {
      setLocalUser(finalName, finalEmail, "google");
      toast.success(`เข้าสู่ระบบสำเร็จในชื่อ ${finalName}`);
      void navigate({ to: "/", replace: true });
    } catch (err) {
      toast.error("เข้าสู่ระบบไม่สำเร็จ", {
        description: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setBusy(false);
    }
  }

  function handleRemoveRecent(e: React.MouseEvent, accountEmail: string) {
    e.stopPropagation();
    removeRecentGmailAccount(accountEmail);
    setRecentAccounts(getRecentGmailAccounts());
    toast.success("ลบบัญชีออกจากประวัติแล้ว");
  }

  async function signInWithGoogleViaFirebase() {
    if (busy) return;
    if (!isFirebaseConfigured() && !isSupabaseConfigured()) {
      toast.error("ยังไม่ได้ตั้งค่าระบบยืนยันตัวตน Google (Firebase / Supabase)", {
        description:
          "กรุณากด 'ตั้งค่า Firebase' หรือเข้าใช้งานผ่าน 'โหมดไม่ระบุตัวตน (Guest Mode)'",
      });
      setShowFirebaseDialog(true);
      return;
    }

    setBusy(true);
    try {
      if (isFirebaseConfigured()) {
        const res = await signInWithGoogleFirebase();
        if (res?.user) {
          toast.success(`เข้าสู่ระบบสำเร็จ: ${res.user.displayName || res.user.email || ""}`);
          void navigate({ to: "/", replace: true });
          return;
        }
      } else if (isSupabaseConfigured()) {
        await signInGoogle();
        return;
      }
    } catch (err: unknown) {
      const errorObj = err as { message?: string; code?: string };
      if (errorObj?.message === "REDIRECTING") {
        return;
      }
      if (errorObj?.code === "auth/popup-closed-by-user") {
        toast.info("ยกเลิกการเข้าสู่ระบบ Google");
        return;
      }
      toast.error("เข้าสู่ระบบด้วย Google ไม่สำเร็จ", {
        description:
          errorObj?.message || "กรุณาตรวจสอบการตั้งค่า Google Auth ใน Firebase / Supabase",
      });
    } finally {
      setBusy(false);
    }
  }

  async function signInGoogle(loginHint?: string) {
    if (busy) return;
    if (!isSupabaseConfigured()) {
      if (isFirebaseConfigured()) {
        await signInWithGoogleViaFirebase();
        return;
      }
      toast.error("ยังไม่ได้ตั้งค่า Supabase Google OAuth", {
        description: "กรุณาตั้งค่า Google Provider ใน Supabase หรือใช้ Firebase Auth",
      });
      return;
    }

    setBusy(true);
    try {
      const redirectOrigin = typeof window !== "undefined" ? window.location.origin : "";
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${redirectOrigin}/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
            ...(loginHint ? { login_hint: loginHint } : {}),
          },
        },
      });

      if (error) {
        throw error;
      }
      if (data?.url) {
        window.location.assign(data.url);
        return;
      }
    } catch (err) {
      toast.error("เข้าสู่ระบบ Supabase Google OAuth ไม่สำเร็จ", {
        description: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setBusy(false);
    }
  }

  async function signInGithub() {
    if (busy) return;
    if (!isSupabaseConfigured()) {
      toast.error("ยังไม่ได้ตั้งค่า Supabase สำหรับ GitHub OAuth", {
        description: "กรุณาเปิดใช้งาน GitHub Provider ใน Supabase Dashboard หรือใช้โหมดทดลอง",
      });
      return;
    }
    setBusy(true);
    try {
      const redirectOrigin = typeof window !== "undefined" ? window.location.origin : "";
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: { redirectTo: `${redirectOrigin}/auth/callback` },
      });
      if (error) throw error;
      if (data?.url) {
        window.location.assign(data.url);
        return;
      }
    } catch (err) {
      toast.error("เข้าสู่ระบบด้วย GitHub ไม่สำเร็จ", {
        description: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setBusy(false);
    }
  }

  async function signInLine() {
    if (busy) return;
    setBusy(true);
    try {
      if (isLineLiffConfigured()) {
        const result = await startLineLogin();
        if (!result.redirected) {
          toast.success("เข้าสู่ระบบด้วย LINE สำเร็จ");
          void navigate({ to: "/", replace: true });
          return;
        }
      } else if (isSupabaseConfigured()) {
        const result = await startLineLogin();
        if (result.redirected) return;
      } else {
        toast.error("ยังไม่ได้ตั้งค่า LINE Login / LIFF ID", {
          description: "กรุณาระบุ VITE_LINE_LIFF_ID หรือตั้งค่า OIDC Provider ใน Supabase",
        });
      }
    } catch (err) {
      toast.error("เข้าสู่ระบบด้วย LINE ไม่สำเร็จ", {
        description: getLineAuthErrorMessage(err),
      });
    } finally {
      setBusy(false);
    }
  }

  function normalizePhoneNumber(value: string) {
    const compact = value.replace(/[^\d+]/g, "");
    if (compact.startsWith("+")) return compact;
    if (compact.startsWith("0")) return `+66${compact.slice(1)}`;
    if (compact.startsWith("66")) return `+${compact}`;
    return `+${compact}`;
  }

  function getValidatedPhone() {
    const normalized = normalizePhoneNumber(phone);
    if (!/^\+\d{8,15}$/.test(normalized)) {
      toast.error("กรุณากรอกเบอร์โทรให้ถูกต้อง", {
        description: "ใช้เบอร์ไทย เช่น 0812345678 หรือรูปแบบสากล เช่น +66812345678",
      });
      return null;
    }
    return normalized;
  }

  async function sendPhoneOtp() {
    const normalizedPhone = getValidatedPhone();
    if (!normalizedPhone || busy) return;

    if (!isSupabaseConfigured()) {
      toast.error("ยังไม่ได้ตั้งค่าระบบ SMS ใน Supabase", {
        description:
          "โปรดเชื่อมต่อ Supabase SMS Gateway (Twilio/MessageBird) หรือเข้าสู่ระบบด้วย Google/อีเมล",
      });
      return;
    }

    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone: normalizedPhone });
      if (error) {
        throw error;
      }
      setPhone(normalizedPhone);
      setPhoneOtp("");
      setPhoneOtpSent(true);
      toast.success("ส่งรหัส OTP เรียบร้อยแล้ว", {
        description: "กรุณาตรวจสอบ SMS และกรอกรหัส 6 หลัก",
      });
    } catch (err) {
      toast.error("ส่งรหัส OTP ไม่สำเร็จ", {
        description:
          err instanceof Error ? err.message : "โปรดตรวจสอบการตั้งค่า SMS Provider ใน Supabase",
      });
    } finally {
      setBusy(false);
    }
  }

  async function verifyPhoneOtp(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    const normalizedPhone = getValidatedPhone();
    if (!normalizedPhone) return;
    if (!/^\d{6}$/.test(phoneOtp)) {
      toast.error("กรุณากรอกรหัส OTP 6 หลัก");
      return;
    }

    if (!isSupabaseConfigured()) {
      toast.error("ยังไม่ได้เชื่อมต่อระบบตรวจสอบ OTP");
      return;
    }

    setBusy(true);
    try {
      const { error, data } = await supabase.auth.verifyOtp({
        phone: normalizedPhone,
        token: phoneOtp,
        type: "sms",
      });
      if (error) {
        throw error;
      }
      if (data?.session || data?.user) {
        toast.success("ยืนยันตัวตนสำเร็จ เข้าสู่ระบบเรียบร้อย");
        void navigate({ to: "/", replace: true });
        return;
      }
      toast.success("เข้าสู่ระบบสำเร็จ");
      void navigate({ to: "/", replace: true });
    } catch (err) {
      toast.error("รหัส OTP ไม่ถูกต้องหรือหมดอายุ", {
        description: err instanceof Error ? err.message : "กรุณาตรวจสอบรหัส OTP อีกครั้ง",
      });
    } finally {
      setBusy(false);
    }
  }

  async function resetPassword() {
    if (!email) {
      toast.error("กรุณากรอกอีเมลก่อนขอรีเซ็ตรหัสผ่าน");
      return;
    }
    if (!isSupabaseConfigured()) {
      toast.error("ยังไม่ได้ตั้งค่าระบบอีเมลใน Supabase", {
        description: "กรุณาตรวจสอบการตั้งค่า Supabase Authentication",
      });
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?reset=1`,
      });
      if (error) {
        throw error;
      }
      toast.success("ส่งลิงก์รีเซ็ตรหัสผ่านแล้ว", {
        description: "กรุณาตรวจสอบกล่องจดหมายและโฟลเดอร์ Spam ในอีเมลของคุณ",
      });
      setResetMode(false);
    } catch (err) {
      toast.error("ส่งลิงก์รีเซ็ตรหัสผ่านไม่สำเร็จ", {
        description: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setBusy(false);
    }
  }

  async function handleEmailAuth(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    if (resetMode) {
      await resetPassword();
      return;
    }
    if (!email || !password) {
      toast.error("กรุณากรอกอีเมลและรหัสผ่าน");
      return;
    }

    if (!isSupabaseConfigured()) {
      toast.error("ยังไม่ได้ตั้งค่า Supabase Authentication สำหรับอีเมล", {
        description: "กรุณาเข้าใช้งานผ่าน Google Auth หรือใช้โหมดทดลอง (Guest Mode)",
      });
      return;
    }

    setBusy(true);
    try {
      if (mode === "signup") {
        const { error, data } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name || email.split("@")[0] },
          },
        });
        if (error) {
          throw error;
        }
        if (data.session) {
          toast.success("สมัครสมาชิกและเข้าสู่ระบบสำเร็จ!");
          void navigate({ to: "/", replace: true });
          return;
        }
        if (data.user && !data.session) {
          toast.success("สมัครสมาชิกสำเร็จ!", {
            description: "ระบบได้ส่งอีเมลยืนยันไปยังอีเมลของคุณ กรุณากดยืนยันก่อนเข้าสู่ระบบ",
            duration: 6000,
          });
          setMode("email");
          return;
        }
      } else {
        const { error, data } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          throw error;
        }
        if (data.session || data.user) {
          toast.success("เข้าสู่ระบบสำเร็จ");
          void navigate({ to: "/", replace: true });
          return;
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      let thaiMsg = msg;
      if (msg.includes("Invalid login credentials")) {
        thaiMsg = "อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง";
      } else if (msg.includes("Email not confirmed")) {
        thaiMsg = "ยังไม่ได้ยืนยันอีเมล กรุณาตรวจสอบกล่องจดหมายของคุณ";
      } else if (msg.includes("User already registered")) {
        thaiMsg = "อีเมลนี้ลงทะเบียนไว้แล้ว กรุณาเลือกเข้าสู่ระบบ";
      } else if (msg.includes("Password should be at least")) {
        thaiMsg = "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร";
      }
      toast.error(mode === "signup" ? "สมัครสมาชิกไม่สำเร็จ" : "เข้าสู่ระบบไม่สำเร็จ", {
        description: thaiMsg,
      });
    } finally {
      setBusy(false);
    }
  }

  function selectMode(nextMode: "google" | "phone" | "email" | "signup") {
    setMode(nextMode);
    setResetMode(false);
    setPhoneOtpSent(false);
    setPhoneOtp("");
  }

  function handleGuestLogin() {
    setGuestUser("ผู้ใช้ทั่วไป (Guest Mode)", "guest@worktracker.local", "guest");
    toast.success("ยินดีต้อนรับสู่โหมดทดลองใช้งาน");
    void navigate({ to: "/", replace: true });
  }

  function copyRedirectUrl() {
    if (typeof window === "undefined") return;
    navigator.clipboard.writeText(`${window.location.origin}/auth/callback`);
    setCopiedUrl(true);
    toast.success("คัดลอก Redirect URL แล้ว");
    setTimeout(() => setCopiedUrl(false), 2500);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <div className="surface-card w-full max-w-md space-y-6 p-7 text-center shadow-lg border border-border">
        <div className="mx-auto w-fit rounded-2xl bg-primary/10 p-3.5 text-primary">
          <Clock3 className="h-8 w-8" />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Google Workspace Ready</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Work Tracker</h1>
          <p className="text-xs text-muted-foreground">
            ระบบบันทึกเวลาทำงาน GPS ค่าแรง OT ซิงก์ Google Sheets &amp; Airtable
          </p>
        </div>

        <div className="grid grid-cols-4 gap-1 rounded-xl bg-muted p-1 text-[11px] font-semibold">
          <button
            type="button"
            onClick={() => selectMode("google")}
            className={`rounded-lg py-1.5 transition ${
              mode === "google"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Google
          </button>
          <button
            type="button"
            onClick={() => selectMode("phone")}
            className={`rounded-lg py-1.5 transition ${
              mode === "phone"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            โทรศัพท์
          </button>
          <button
            type="button"
            onClick={() => selectMode("email")}
            className={`rounded-lg py-1.5 transition ${
              mode === "email"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            อีเมล
          </button>
          <button
            type="button"
            onClick={() => selectMode("signup")}
            className={`rounded-lg py-1.5 transition ${
              mode === "signup"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            สมัคร
          </button>
        </div>

        {mode === "google" ? (
          <div className="space-y-4 pt-1 text-left">
            {/* Primary Google Auth Button */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => void signInWithGoogleViaFirebase()}
                disabled={busy}
                aria-label="Sign in with Google"
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-primary/30 bg-primary/5 py-3.5 px-4 text-sm font-bold text-foreground shadow-sm transition hover:bg-primary/10 hover:border-primary/60 active:scale-[0.99] disabled:opacity-60 cursor-pointer"
              >
                {busy ? (
                  <>
                    <EngineWorkingAnimation size="sm" label="กำลังเชื่อมต่อ Google" />
                    <span>กำลังเข้าสู่ระบบ Google...</span>
                  </>
                ) : (
                  <>
                    <GoogleIcon className="h-5 w-5 shrink-0" />
                    <span className="flex items-center gap-1.5">
                      เข้าสู่ระบบด้วย Google Account จริง
                      <Flame className="h-4 w-4 text-amber-500" />
                    </span>
                  </>
                )}
              </button>

              <div className="rounded-xl border border-border bg-muted/40 p-3 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        firebaseConfigured || supabaseConfigured
                          ? "bg-emerald-500 animate-pulse"
                          : "bg-amber-500"
                      }`}
                    />
                    <span>
                      สถานะระบบยืนยันตัวตน:{" "}
                      {firebaseConfigured || supabaseConfigured ? (
                        <strong className="text-emerald-600 dark:text-emerald-400">
                          พร้อมใช้งาน (Real Auth)
                        </strong>
                      ) : (
                        <span className="text-amber-600 dark:text-amber-400">
                          ยังไม่ได้เชื่อมต่อ Firebase / Supabase
                        </span>
                      )}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowFirebaseDialog(true)}
                    className="inline-flex items-center gap-1 font-semibold text-primary hover:underline cursor-pointer"
                  >
                    <Settings className="h-3 w-3" />
                    <span>ตั้งค่า Firebase</span>
                  </button>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  ระบบจะเปิดหน้าต่าง Google Sign-In อย่างเป็นทางการเพื่อยืนยันบัญชีจริงของคุณ
                  ข้อมูลทั้งหมดจะเชื่อมโยงกับบัญชี Google โดยตรง
                </p>
              </div>
            </div>

            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-semibold text-muted-foreground">
                <span className="bg-card px-2">หรือเข้าสู่ระบบด้วยผู้ให้บริการอื่น</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => void signInGithub()}
                disabled={busy}
                className="flex items-center justify-center gap-2 rounded-xl border border-border bg-secondary/50 py-2.5 px-3 text-xs font-semibold text-foreground transition hover:bg-secondary active:scale-[0.99] disabled:opacity-60 cursor-pointer"
              >
                <Github className="h-3.5 w-3.5 shrink-0" />
                <span>GitHub OAuth</span>
              </button>

              <button
                type="button"
                onClick={() => void signInLine()}
                disabled={busy}
                aria-label="เข้าสู่ระบบด้วย LINE LIFF"
                className="flex items-center justify-center gap-2 rounded-xl border border-[#06C755]/40 bg-[#06C755]/10 py-2.5 px-3 text-xs font-bold text-foreground transition hover:bg-[#06C755]/20 active:scale-[0.99] disabled:opacity-60 cursor-pointer"
              >
                <MessageCircle className="h-3.5 w-3.5 text-[#06C755] shrink-0" />
                <span>LINE Official Login</span>
              </button>
            </div>
          </div>
        ) : mode === "phone" ? (
          <form
            onSubmit={(event) => void verifyPhoneOtp(event)}
            className="space-y-3 pt-1 text-left"
          >
            <div className="rounded-xl border border-primary/20 bg-info-soft/60 p-3 text-xs text-muted-foreground">
              {!phoneOtpSent
                ? "กรอกเบอร์โทรศัพท์จริงของคุณเพื่อรับรหัสยืนยัน OTP ทาง SMS"
                : "กรอกรหัส OTP 6 หลักที่ส่งไปยังโทรศัพท์ของคุณทาง SMS จริง"}
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground" htmlFor="phone-number">
                เบอร์โทรศัพท์
              </label>
              <input
                id="phone-number"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                required
                placeholder="0812345678 หรือ +66812345678"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                disabled={phoneOtpSent || busy}
                className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
              <p className="mt-1 text-[11px] text-muted-foreground">
                ระบบจะส่ง SMS OTP ไปยังหมายเลขโทรศัพท์จริงของคุณ
              </p>
            </div>
            {phoneOtpSent ? (
              <>
                <div>
                  <label className="text-xs font-medium text-muted-foreground" htmlFor="phone-otp">
                    รหัส OTP
                  </label>
                  <input
                    id="phone-otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    required
                    maxLength={6}
                    pattern="[0-9]{6}"
                    placeholder="กรอกรหัส 6 หลัก"
                    value={phoneOtp}
                    onChange={(event) =>
                      setPhoneOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-center text-lg tracking-[0.35em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>
                <button
                  type="submit"
                  disabled={busy}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow transition hover:bg-primary/90 disabled:opacity-60"
                >
                  {busy ? (
                    <>
                      <EngineWorkingAnimation size="sm" label="กำลังตรวจสอบ OTP" />
                      กำลังตรวจสอบ...
                    </>
                  ) : (
                    <>
                      <Phone className="h-4 w-4" />
                      ยืนยันและเข้าสู่ระบบ
                    </>
                  )}
                </button>
                <div className="flex items-center justify-between gap-3 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setPhoneOtpSent(false);
                      setPhoneOtp("");
                    }}
                    className="font-semibold text-primary hover:underline"
                  >
                    เปลี่ยนเบอร์โทร
                  </button>
                  <button
                    type="button"
                    onClick={() => void sendPhoneOtp()}
                    disabled={busy}
                    className="font-semibold text-primary hover:underline disabled:opacity-60"
                  >
                    ส่ง OTP อีกครั้ง
                  </button>
                </div>
              </>
            ) : (
              <button
                type="button"
                onClick={() => void sendPhoneOtp()}
                disabled={busy}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow transition hover:bg-primary/90 disabled:opacity-60"
              >
                {busy ? (
                  <>
                    <EngineWorkingAnimation size="sm" label="กำลังส่งรหัส OTP" />
                    กำลังส่งรหัส OTP...
                  </>
                ) : (
                  <>
                    <Phone className="h-4 w-4" />
                    ส่งรหัส OTP ทาง SMS
                  </>
                )}
              </button>
            )}
          </form>
        ) : (
          <form
            onSubmit={(event) => void handleEmailAuth(event)}
            className="space-y-3 pt-1 text-left"
          >
            {resetMode ? (
              <div className="rounded-xl border border-primary/20 bg-info-soft/60 p-3 text-xs text-muted-foreground">
                กรอกอีเมลของคุณเพื่อรับลิงก์ตั้งรหัสผ่านใหม่
              </div>
            ) : null}
            {!resetMode && mode === "signup" ? (
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  ชื่อ-นามสกุล หรือชื่อเรียก
                </label>
                <input
                  type="text"
                  placeholder="เช่น สมชาย ใจดี"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                />
              </div>
            ) : null}
            <div>
              <label className="text-xs font-medium text-muted-foreground">อีเมล</label>
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>
            {!resetMode ? (
              <div>
                <label className="text-xs font-medium text-muted-foreground">รหัสผ่าน</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                />
              </div>
            ) : null}
            {!resetMode && mode === "email" ? (
              <button
                type="button"
                onClick={() => setResetMode(true)}
                className="text-left text-xs font-semibold text-primary hover:underline"
              >
                ลืมรหัสผ่าน?
              </button>
            ) : null}
            {resetMode ? (
              <button
                type="button"
                onClick={() => setResetMode(false)}
                className="text-left text-xs font-semibold text-primary hover:underline"
              >
                กลับไปเข้าสู่ระบบ
              </button>
            ) : null}
            <button
              type="submit"
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow transition hover:bg-primary/90 disabled:opacity-60"
            >
              {busy ? (
                <>
                  <EngineWorkingAnimation
                    size="sm"
                    label={
                      resetMode
                        ? "กำลังส่งลิงก์"
                        : mode === "signup"
                          ? "กำลังสมัคร"
                          : "กำลังเข้าสู่ระบบ"
                    }
                  />
                  {resetMode
                    ? "กำลังส่งลิงก์..."
                    : mode === "signup"
                      ? "กำลังสมัคร..."
                      : "กำลังเข้าสู่ระบบ..."}
                </>
              ) : resetMode ? (
                <>
                  <Mail className="h-4 w-4" />
                  ส่งลิงก์รีเซ็ตรหัสผ่าน
                </>
              ) : mode === "signup" ? (
                <>
                  <UserPlus className="h-4 w-4" />
                  ลงทะเบียนบัญชีใหม่
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4" />
                  เข้าสู่ระบบด้วยอีเมล
                </>
              )}
            </button>
          </form>
        )}

        <div className="border-t border-border pt-4 space-y-2">
          <button
            type="button"
            onClick={handleGuestLogin}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-secondary py-2.5 text-xs font-semibold text-foreground transition hover:bg-secondary/80"
          >
            <UserCheck className="h-3.5 w-3.5 text-primary" />
            ทดลองใช้งานโดยไม่ลงทะเบียน (Guest Mode)
          </button>
        </div>

        <p className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
          <ScanFace className="h-3.5 w-3.5" /> รองรับปลดล็อกด้วย Face ID / Touch ID
          บนอุปกรณ์ที่รองรับ
        </p>
      </div>

      <FirebaseConfigDialog
        open={showFirebaseDialog}
        onOpenChange={setShowFirebaseDialog}
        onConfigSaved={() => setFirebaseConfigured(isFirebaseConfigured())}
      />
    </div>
  );
}
