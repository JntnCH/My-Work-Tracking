import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowRight,
  Check,
  Clock3,
  Copy,
  ExternalLink,
  Github,
  HelpCircle,
  LogIn,
  Mail,
  MessageCircle,
  Phone,
  ScanFace,
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

function ensureSupabaseAuthConfigured() {
  if (isSupabaseConfigured()) return true;

  toast.error("ระบบยังไม่ได้ตั้งค่าการเชื่อมต่อ Supabase", {
    description:
      "กรุณาตั้ง VITE_SUPABASE_URL และ VITE_SUPABASE_PUBLISHABLE_KEY (หรือ VITE_SUPABASE_ANON_KEY) ใน Netlify แล้ว trigger deploy ใหม่",
  });
  return false;
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
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Gmail-specific state
  const [gmailAddress, setGmailAddress] = useState("");
  const [gmailName, setGmailName] = useState("");
  const [recentAccounts, setRecentAccounts] = useState<RecentGmailAccount[]>([]);
  const supabaseConfigured = isSupabaseConfigured();

  useEffect(() => {
    setRecentAccounts(getRecentGmailAccounts());
  }, []);

  useEffect(() => {
    if (!loading && user) void navigate({ to: "/", replace: true });
  }, [loading, user, navigate]);

  useEffect(() => {
    let cancelled = false;

    async function completeLiffCallback() {
      if (!isLineLiffCallback()) return;
      if (!ensureSupabaseAuthConfigured()) return;
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

  async function handleDirectGmailLogin(targetEmail?: string, targetName?: string) {
    if (busy) return;
    const finalEmail = normalizeGmailInput(targetEmail || gmailAddress);
    if (!finalEmail || !finalEmail.includes("@")) {
      toast.error("กรุณาระบุอีเมล Gmail เช่น yourname@gmail.com");
      return;
    }
    setGmailAddress(finalEmail);
    if (targetName) setGmailName(targetName);
    // The email is only a hint for the account chooser. Identity and session
    // must come from Supabase OAuth, never from a local pseudo-user.
    await signInGoogle(finalEmail);
  }

  function handleRemoveRecent(e: React.MouseEvent, accountEmail: string) {
    e.stopPropagation();
    removeRecentGmailAccount(accountEmail);
    setRecentAccounts(getRecentGmailAccounts());
    toast.success("ลบบัญชีออกจากประวัติแล้ว");
  }

  async function signInGoogle(loginHint?: string) {
    if (busy) return;
    if (!ensureSupabaseAuthConfigured()) return;
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
      }
    } catch (err) {
      toast.error("เข้าสู่ระบบ Google ไม่สำเร็จ", {
        description: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setBusy(false);
    }
  }

  async function signInGithub() {
    if (busy) return;
    if (!ensureSupabaseAuthConfigured()) return;
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
      }
    } catch (err) {
      toast.error("เข้าสู่ระบบ GitHub ไม่สำเร็จ", {
        description: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setBusy(false);
    }
  }

  async function signInLine() {
    if (busy) return;
    if (!ensureSupabaseAuthConfigured()) return;
    setBusy(true);
    try {
      const result = await startLineLogin();
      if (!result.redirected) {
        toast.success("เข้าสู่ระบบด้วย LINE สำเร็จ");
        void navigate({ to: "/", replace: true });
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
    if (!ensureSupabaseAuthConfigured()) return;

    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone: normalizedPhone });
      if (error) throw error;
      setPhone(normalizedPhone);
      setPhoneOtp("");
      setPhoneOtpSent(true);
      toast.success("ส่งรหัส OTP แล้ว", {
        description: "กรุณาตรวจสอบ SMS และกรอกรหัส 6 หลักภายในเวลาที่กำหนด",
      });
    } catch (err) {
      toast.error("ส่งรหัส OTP ไม่สำเร็จ", {
        description: err instanceof Error ? err.message : String(err),
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
    if (!ensureSupabaseAuthConfigured()) return;

    setBusy(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        phone: normalizedPhone,
        token: phoneOtp,
        type: "sms",
      });
      if (error) throw error;
      toast.success("เข้าสู่ระบบสำเร็จ");
      void navigate({ to: "/", replace: true });
    } catch (err) {
      toast.error("ยืนยันรหัส OTP ไม่สำเร็จ", {
        description: err instanceof Error ? err.message : String(err),
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
    if (!ensureSupabaseAuthConfigured()) return;
    setBusy(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?reset=1`,
      });
      if (error) throw error;
      toast.success("ส่งลิงก์รีเซ็ตรหัสผ่านแล้ว", {
        description: "กรุณาตรวจสอบกล่องจดหมายและโฟลเดอร์ Spam",
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
    if (!ensureSupabaseAuthConfigured()) return;
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name || email.split("@")[0] },
          },
        });
        if (error) throw error;
        toast.success("สมัครสมาชิกสำเร็จ! ระบบกำลังเข้าสู่ระบบให้อัตโนมัติ");
        void navigate({ to: "/", replace: true });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success("เข้าสู่ระบบสำเร็จ");
        void navigate({ to: "/", replace: true });
      }
    } catch (err) {
      toast.error("ข้อผิดพลาดในการเข้าสู่ระบบ", {
        description: err instanceof Error ? err.message : String(err),
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
    <main className="relative min-h-screen overflow-hidden bg-background px-4 py-5 text-foreground sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-24 top-8 h-72 w-72 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-success/8 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-primary/20" />
      </div>

      <div className="relative mx-auto grid w-full max-w-6xl gap-5 lg:min-h-[calc(100vh-2.5rem)] lg:grid-cols-[0.84fr_1.16fr]">
        <section className="relative hidden overflow-hidden rounded-[2rem] gradient-header p-8 text-primary-foreground shadow-2xl lg:flex lg:flex-col lg:justify-between xl:p-10">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border-[30px] border-white/10" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full border-[30px] border-white/10" />
          <div className="pointer-events-none absolute right-16 top-24 h-2 w-2 rounded-full bg-white/60 shadow-[0_0_0_8px_rgba(255,255,255,0.08)]" />
          <div className="pointer-events-none absolute bottom-36 left-20 h-1.5 w-1.5 rounded-full bg-white/50" />

          <div className="relative space-y-10">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20 backdrop-blur-sm">
                <Clock3 className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/65">
                  Work Tracker
                </p>
                <p className="mt-0.5 text-sm font-semibold text-white/90">
                  Personal operations hub
                </p>
              </div>
            </div>

            <div className="max-w-md space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-white/80 backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5 text-yellow-200" aria-hidden="true" />
                <span>ทำงานเป็นระบบขึ้นทุกวัน</span>
              </div>
              <h1 className="text-4xl font-bold leading-[1.12] tracking-tight xl:text-5xl">
                จบวันงาน
                <br />
                ได้ในภาพเดียว
              </h1>
              <p className="max-w-sm text-sm leading-7 text-white/70">
                เช็กอิน บันทึกเวลา คำนวณ OT และซิงก์ข้อมูลสำคัญไว้ใน workspace เดียว
                เพื่อให้คุณโฟกัสกับงานที่ต้องทำจริง ๆ
              </p>
            </div>

            <div className="grid max-w-md grid-cols-3 gap-2.5">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur-sm">
                <p className="text-lg font-bold">GPS</p>
                <p className="mt-1 text-[10px] text-white/60">Check-in</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur-sm">
                <p className="text-lg font-bold">OT</p>
                <p className="mt-1 text-[10px] text-white/60">คำนวณง่าย</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur-sm">
                <p className="text-lg font-bold">Cloud</p>
                <p className="mt-1 text-[10px] text-white/60">ซิงก์ข้อมูล</p>
              </div>
            </div>
          </div>

          <div className="relative flex items-center justify-between gap-4 border-t border-white/15 pt-5 text-[11px] text-white/55">
            <span>ปลอดภัยสำหรับพื้นที่ทำงานส่วนตัว</span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-emerald-200" aria-hidden="true" />
              Ready
            </span>
          </div>
        </section>

        <section className="surface-card relative flex min-h-[calc(100vh-2.5rem)] flex-col overflow-hidden rounded-[2rem] border-border/80 bg-card/95 p-5 shadow-xl backdrop-blur sm:p-8 lg:p-10">
          <div
            className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-primary/60 to-success"
            aria-hidden="true"
          />

          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
              <Clock3 className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary">
                Work Tracker
              </p>
              <p className="text-xs text-muted-foreground">Personal operations hub</p>
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  Welcome back
                </p>
                <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  เข้าสู่ระบบ
                </h2>
                <p className="max-w-md text-sm leading-6 text-muted-foreground">
                  เข้าสู่ workspace ของคุณ เพื่อบันทึกงานและดูข้อมูลได้ต่อเนื่องจากทุกอุปกรณ์
                </p>
              </div>
              <div className="hidden rounded-2xl bg-secondary/70 p-3 text-primary sm:block">
                <LogIn className="h-5 w-5" aria-hidden="true" />
              </div>
            </div>

            <div
              className={`mt-6 flex items-start gap-3 rounded-2xl border p-3.5 text-xs ${
                supabaseConfigured
                  ? "border-success/20 bg-success-soft/60 text-success-foreground"
                  : "border-warning/30 bg-warning-soft/70 text-warning-foreground"
              }`}
              role="status"
            >
              {supabaseConfigured ? (
                <Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              ) : (
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              )}
              <div className="min-w-0">
                <p className="font-semibold">
                  {supabaseConfigured ? "ระบบพร้อมเชื่อมต่อบัญชี" : "ยังไม่ได้เชื่อมต่อ Supabase"}
                </p>
                <p className="mt-0.5 leading-5 opacity-80">
                  {supabaseConfigured
                    ? "เลือกช่องทางที่ต้องการได้เลย ข้อมูล session จะถูกจัดการอย่างปลอดภัย"
                    : "ตั้ง VITE_SUPABASE_URL และ VITE_SUPABASE_PUBLISHABLE_KEY ใน Netlify แล้ว deploy ใหม่"}
                </p>
              </div>
            </div>

            <div className="mt-7 space-y-5">
              <div
                className="grid grid-cols-4 gap-1 rounded-2xl bg-muted/80 p-1.5"
                role="tablist"
                aria-label="ช่องทางเข้าสู่ระบบ"
              >
                {(
                  [
                    ["google", "Google"],
                    ["phone", "โทรศัพท์"],
                    ["email", "อีเมล"],
                    ["signup", "สมัคร"],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    role="tab"
                    aria-selected={mode === value}
                    onClick={() => selectMode(value)}
                    className={`rounded-xl px-2 py-2.5 text-xs font-semibold transition-all duration-200 active:scale-[0.98] ${
                      mode === value
                        ? "bg-card text-foreground shadow-sm ring-1 ring-border/70"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {mode === "google" ? (
                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={() => void signInGoogle()}
                    disabled={busy}
                    aria-label="Sign in with Google"
                    className="group flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl border border-border bg-card px-4 text-sm font-semibold text-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/35 hover:bg-accent/60 hover:shadow-md active:translate-y-0 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-60"
                  >
                    {busy ? (
                      <>
                        <EngineWorkingAnimation size="sm" label="กำลังเชื่อมต่อ Google" />
                        <span>กำลังเชื่อมต่อ Google...</span>
                      </>
                    ) : (
                      <>
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-border/60">
                          <GoogleIcon className="h-5 w-5 shrink-0" />
                        </span>
                        <span>ดำเนินการต่อด้วย Google</span>
                        <ArrowRight
                          className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                          aria-hidden="true"
                        />
                      </>
                    )}
                  </button>

                  {recentAccounts.length > 0 ? (
                    <div className="rounded-2xl border border-border/80 bg-muted/30 p-3.5">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <span className="flex items-center gap-2 text-xs font-semibold text-foreground">
                          <Clock3 className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                          บัญชีล่าสุดบนเครื่องนี้
                        </span>
                        <span className="text-[10px] text-muted-foreground">Google OAuth</span>
                      </div>
                      <div className="space-y-2">
                        {recentAccounts.map((acc) => (
                          <div
                            key={acc.email}
                            role="button"
                            tabIndex={0}
                            onClick={() => handleDirectGmailLogin(acc.email, acc.name)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                void handleDirectGmailLogin(acc.email, acc.name);
                              }
                            }}
                            className="group flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-border/70 bg-card p-2.5 text-xs transition hover:border-primary/40 hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                          >
                            <div className="flex min-w-0 items-center gap-2.5">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                                {acc.name?.[0]?.toUpperCase() || acc.email[0]?.toUpperCase() || "G"}
                              </div>
                              <div className="min-w-0">
                                <p className="truncate font-semibold text-foreground">{acc.name}</p>
                                <p className="truncate font-mono text-[10px] text-muted-foreground">
                                  {acc.email}
                                </p>
                              </div>
                            </div>
                            <div className="flex shrink-0 items-center gap-1">
                              <span className="hidden items-center gap-1 font-semibold text-primary sm:inline-flex">
                                เข้าใช้
                                <ArrowRight className="h-3 w-3" aria-hidden="true" />
                              </span>
                              <button
                                type="button"
                                onClick={(event) => handleRemoveRecent(event, acc.email)}
                                title="ลบบัญชีนี้ออกจากประวัติ"
                                aria-label="ลบบัญชีนี้ออกจากประวัติ"
                                className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                              >
                                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <details className="group rounded-2xl border border-border/80 bg-secondary/25">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 text-xs font-semibold text-foreground [&::-webkit-details-marker]:hidden">
                      <span className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-primary" aria-hidden="true" />
                        ใช้บัญชี Gmail ที่ต้องการ
                      </span>
                      <ArrowRight
                        className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-90"
                        aria-hidden="true"
                      />
                    </summary>
                    <form
                      onSubmit={(event) => {
                        event.preventDefault();
                        void handleDirectGmailLogin();
                      }}
                      className="space-y-3 border-t border-border/70 p-4"
                    >
                      <p className="text-[11px] leading-5 text-muted-foreground">
                        ใช้อีเมลเป็นเพียงตัวช่วยเลือกบัญชี ตัวตนและ session จะยืนยันผ่าน Google
                        OAuth เท่านั้น
                      </p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label
                            className="text-[11px] font-semibold text-muted-foreground"
                            htmlFor="gmail-address"
                          >
                            อีเมล Gmail
                          </label>
                          <input
                            id="gmail-address"
                            type="text"
                            inputMode="email"
                            autoComplete="email"
                            placeholder="yourname@gmail.com"
                            value={gmailAddress}
                            onChange={(event) => setGmailAddress(event.target.value)}
                            className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-xs outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                        <div>
                          <label
                            className="text-[11px] font-semibold text-muted-foreground"
                            htmlFor="gmail-name"
                          >
                            ชื่อที่แสดง <span className="font-normal opacity-70">(ถ้ามี)</span>
                          </label>
                          <input
                            id="gmail-name"
                            type="text"
                            placeholder="เช่น สมชาย ใจดี"
                            value={gmailName}
                            onChange={(event) => setGmailName(event.target.value)}
                            className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-xs outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setGmailAddress("jayautobot.dev@gmail.com");
                            setGmailName("Jay Autobot");
                            void handleDirectGmailLogin("jayautobot.dev@gmail.com", "Jay Autobot");
                          }}
                          className="rounded-lg border border-primary/25 bg-primary/5 px-2.5 py-1.5 text-[10px] font-semibold text-primary transition hover:bg-primary hover:text-primary-foreground"
                        >
                          ใช้บัญชีที่บันทึกไว้
                        </button>
                        <button
                          type="submit"
                          disabled={busy || !gmailAddress.trim()}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50"
                        >
                          ดำเนินการต่อ
                          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    </form>
                  </details>

                  <div className="flex items-center gap-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">
                    <div className="h-px flex-1 bg-border" />
                    <span>หรือใช้บัญชีอื่น</span>
                    <div className="h-px flex-1 bg-border" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => void signInGithub()}
                      disabled={busy}
                      className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-border bg-card px-3 text-xs font-semibold text-foreground transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/25 hover:bg-accent active:translate-y-0 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-60"
                    >
                      <Github className="h-4 w-4" aria-hidden="true" />
                      GitHub
                    </button>
                    <button
                      type="button"
                      onClick={() => void signInLine()}
                      disabled={busy}
                      aria-label="เข้าสู่ระบบด้วย LINE LIFF"
                      className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-[#06C755]/35 bg-[#06C755]/8 px-3 text-xs font-bold text-foreground transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#06C755]/15 active:translate-y-0 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-60"
                    >
                      <MessageCircle className="h-4 w-4 text-[#06C755]" aria-hidden="true" />
                      LINE LIFF
                    </button>
                  </div>

                  <div className="rounded-2xl border border-border/70 bg-muted/25 p-3.5">
                    <button
                      type="button"
                      onClick={() => setShowConfigHelp((prev) => !prev)}
                      className="flex w-full items-center justify-between gap-3 text-left text-xs font-semibold text-foreground transition hover:text-primary"
                      aria-expanded={showConfigHelp}
                    >
                      <span className="flex items-center gap-2">
                        <HelpCircle className="h-4 w-4 text-primary" aria-hidden="true" />
                        ตั้งค่า OAuth ไม่สำเร็จใช่ไหม?
                      </span>
                      <ArrowRight
                        className={`h-4 w-4 text-muted-foreground transition-transform ${showConfigHelp ? "rotate-90" : ""}`}
                        aria-hidden="true"
                      />
                    </button>

                    {showConfigHelp ? (
                      <div className="mt-3 space-y-3 border-t border-border/70 pt-3 text-[11px] leading-5 text-muted-foreground">
                        <p>เปิด Provider ใน Supabase และเพิ่ม callback URL นี้ใน Redirect URLs:</p>
                        <div className="flex items-center gap-2 rounded-xl bg-card p-2">
                          <code className="min-w-0 flex-1 truncate font-mono text-[10px] text-foreground">
                            {typeof window !== "undefined"
                              ? `${window.location.origin}/auth/callback`
                              : ""}
                          </code>
                          <button
                            type="button"
                            onClick={copyRedirectUrl}
                            className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-primary px-2.5 py-1.5 text-[10px] font-semibold text-primary-foreground transition hover:bg-primary/90"
                          >
                            {copiedUrl ? (
                              <Check className="h-3 w-3" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                            {copiedUrl ? "คัดลอกแล้ว" : "คัดลอก"}
                          </button>
                        </div>
                        <ol className="list-decimal space-y-1 pl-4">
                          <li>ตั้ง `VITE_SUPABASE_URL` และ publishable/anon key ใน Netlify</li>
                          <li>เปิด Google หรือ GitHub ใน Supabase Authentication → Providers</li>
                          <li>สำหรับ LINE ใช้ LIFF Endpoint URL เดียวกับ production domain</li>
                        </ol>
                        <a
                          href="https://supabase.com/dashboard/project/_/auth/providers"
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline"
                        >
                          เปิด Supabase Provider settings
                          <ExternalLink className="h-3 w-3" aria-hidden="true" />
                        </a>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : mode === "phone" ? (
                <form onSubmit={(event) => void verifyPhoneOtp(event)} className="space-y-4">
                  <div className="flex items-start gap-3 rounded-2xl border border-primary/15 bg-info-soft/60 p-4 text-xs text-muted-foreground">
                    <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    <p className="leading-5">
                      {!phoneOtpSent
                        ? "กรอกเบอร์โทรศัพท์เพื่อรับรหัส OTP ทาง SMS"
                        : "กรอกรหัส OTP 6 หลักที่ส่งไปยังโทรศัพท์ของคุณ"}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-foreground" htmlFor="phone-number">
                      เบอร์โทรศัพท์
                    </label>
                    <input
                      id="phone-number"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      required
                      placeholder="081-234-5678 หรือ +66812345678"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      disabled={phoneOtpSent || busy}
                      className="mt-2 w-full rounded-xl border border-input bg-background px-3.5 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
                    />
                    <p className="mt-1.5 text-[11px] text-muted-foreground">
                      ระบบจะแปลงเบอร์ไทยเป็นรูปแบบสากลให้อัตโนมัติ
                    </p>
                  </div>
                  {phoneOtpSent ? (
                    <>
                      <div>
                        <label
                          className="text-xs font-semibold text-foreground"
                          htmlFor="phone-otp"
                        >
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
                          className="mt-2 w-full rounded-xl border border-input bg-background px-3.5 py-3 text-center text-xl tracking-[0.45em] outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={busy}
                        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 active:scale-[0.99] disabled:opacity-60"
                      >
                        {busy ? (
                          <>
                            <EngineWorkingAnimation size="sm" label="กำลังตรวจสอบ" />
                            กำลังตรวจสอบ...
                          </>
                        ) : (
                          <>
                            <Phone className="h-4 w-4" aria-hidden="true" />
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
                      className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 active:scale-[0.99] disabled:opacity-60"
                    >
                      {busy ? (
                        <>
                          <EngineWorkingAnimation size="sm" label="กำลังส่งรหัส" />
                          กำลังส่งรหัส...
                        </>
                      ) : (
                        <>
                          <Phone className="h-4 w-4" aria-hidden="true" />
                          ส่งรหัส OTP
                        </>
                      )}
                    </button>
                  )}
                </form>
              ) : (
                <form onSubmit={(event) => void handleEmailAuth(event)} className="space-y-4">
                  {resetMode ? (
                    <div className="flex items-start gap-3 rounded-2xl border border-primary/15 bg-info-soft/60 p-4 text-xs text-muted-foreground">
                      <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                      <p className="leading-5">กรอกอีเมลเพื่อรับลิงก์ตั้งรหัสผ่านใหม่</p>
                    </div>
                  ) : null}
                  {!resetMode && mode === "signup" ? (
                    <div>
                      <label
                        className="text-xs font-semibold text-foreground"
                        htmlFor="signup-name"
                      >
                        ชื่อผู้ใช้งาน
                      </label>
                      <div className="relative mt-2">
                        <User
                          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                          aria-hidden="true"
                        />
                        <input
                          id="signup-name"
                          type="text"
                          placeholder="เช่น สมชาย ใจดี"
                          value={name}
                          onChange={(event) => setName(event.target.value)}
                          className="w-full rounded-xl border border-input bg-background py-3 pl-10 pr-3.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </div>
                  ) : null}
                  <div>
                    <label className="text-xs font-semibold text-foreground" htmlFor="auth-email">
                      อีเมล
                    </label>
                    <div className="relative mt-2">
                      <Mail
                        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                        aria-hidden="true"
                      />
                      <input
                        id="auth-email"
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        className="w-full rounded-xl border border-input bg-background py-3 pl-10 pr-3.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                  {!resetMode ? (
                    <div>
                      <label
                        className="text-xs font-semibold text-foreground"
                        htmlFor="auth-password"
                      >
                        รหัสผ่าน
                      </label>
                      <div className="relative mt-2">
                        <LogIn
                          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                          aria-hidden="true"
                        />
                        <input
                          id="auth-password"
                          type="password"
                          required
                          autoComplete={mode === "signup" ? "new-password" : "current-password"}
                          placeholder="อย่างน้อย 6 ตัวอักษร"
                          value={password}
                          onChange={(event) => setPassword(event.target.value)}
                          className="w-full rounded-xl border border-input bg-background py-3 pl-10 pr-3.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
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
                    className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 active:scale-[0.99] disabled:opacity-60"
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
                        <Mail className="h-4 w-4" aria-hidden="true" />
                        ส่งลิงก์รีเซ็ตรหัสผ่าน
                      </>
                    ) : mode === "signup" ? (
                      <>
                        <UserPlus className="h-4 w-4" aria-hidden="true" />
                        ลงทะเบียนใหม่
                      </>
                    ) : (
                      <>
                        <Mail className="h-4 w-4" aria-hidden="true" />
                        เข้าสู่ระบบด้วยอีเมล
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="mt-8 border-t border-border/80 pt-5">
            <button
              type="button"
              onClick={handleGuestLogin}
              className="group flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-border bg-secondary/55 px-4 text-xs font-semibold text-foreground transition-all duration-200 hover:-translate-y-0.5 hover:bg-secondary active:translate-y-0 active:scale-[0.99]"
            >
              <UserCheck className="h-4 w-4 text-primary" aria-hidden="true" />
              <span>ทดลองใช้งานแบบ Guest Mode</span>
              <ArrowRight
                className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </button>
            <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-[11px] text-muted-foreground">
              <ScanFace className="h-3.5 w-3.5" aria-hidden="true" />
              รองรับ Face ID / Touch ID บนอุปกรณ์ที่รองรับ
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
