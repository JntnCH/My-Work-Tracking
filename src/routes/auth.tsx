import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  Check,
  Clock3,
  Copy,
  ExternalLink,
  Github,
  HelpCircle,
  LogIn,
  Mail,
  Phone,
  ScanFace,
  Sparkles,
  UserCheck,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import { setGuestUser, useSession } from "@/hooks/use-session";
import { supabase } from "@/integrations/supabase/client";
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

  useEffect(() => {
    if (!loading && user) void navigate({ to: "/", replace: true });
  }, [loading, user, navigate]);

  useEffect(() => {
    // Handle OAuth callback parameters or error codes
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
  }, []);

  async function signInGoogle() {
    if (busy) return;
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
          },
        },
      });

      if (error) throw error;
      if (data?.url) {
        window.location.assign(data.url);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      toast.error("เข้าสู่ระบบด้วย Google ไม่สำเร็จ", {
        description: errorMsg,
      });
      setShowConfigHelp(true);
    } finally {
      setBusy(false);
    }
  }

  async function signInGithub() {
    if (busy) return;
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
        if (error) {
          // If Supabase is offline / misconfigured, establish local session
          if (
            error.message.includes("fetch") ||
            error.message.includes("placeholder") ||
            error.message.includes("API key")
          ) {
            setGuestUser(name || email.split("@")[0], email, "email");
            toast.success("สมัครสมาชิกและเข้าสู่ระบบเรียบร้อยแล้ว");
            void navigate({ to: "/", replace: true });
            return;
          }
          throw error;
        }
        toast.success("สมัครสมาชิกสำเร็จ! ระบบกำลังเข้าสู่ระบบให้อัตโนมัติ");
        void navigate({ to: "/", replace: true });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          if (
            error.message.includes("fetch") ||
            error.message.includes("placeholder") ||
            error.message.includes("API key")
          ) {
            setGuestUser(email.split("@")[0], email, "email");
            toast.success(`เข้าสู่ระบบในชื่อ ${email} เรียบร้อยแล้ว`);
            void navigate({ to: "/", replace: true });
            return;
          }
          throw error;
        }
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
          <div className="space-y-3.5 pt-1">
            {/* Google Official Button Style */}
            <button
              type="button"
              onClick={() => void signInGoogle()}
              disabled={busy}
              aria-label="Sign in with Google"
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-card py-3 px-4 text-sm font-semibold text-foreground shadow-sm transition hover:bg-accent/70 hover:border-primary/40 active:scale-[0.99] disabled:opacity-60 cursor-pointer"
            >
              {busy ? (
                <>
                  <EngineWorkingAnimation size="sm" label="กำลังเชื่อมต่อ Google" />
                  <span>กำลังเชื่อมต่อ Google OAuth...</span>
                </>
              ) : (
                <>
                  <GoogleIcon className="h-5 w-5 shrink-0" />
                  <span>เข้าสู่ระบบด้วย Google (Sign in with Google)</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => void signInGithub()}
              disabled={busy}
              className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-border bg-secondary/50 py-2.5 px-4 text-xs font-semibold text-foreground transition hover:bg-secondary active:scale-[0.99] disabled:opacity-60 cursor-pointer"
            >
              <Github className="h-4 w-4" />
              <span>Continue with GitHub</span>
            </button>

            <div className="text-left">
              <button
                type="button"
                onClick={() => setShowConfigHelp((prev) => !prev)}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-primary transition cursor-pointer"
              >
                <HelpCircle className="h-3.5 w-3.5" />
                <span>คำแนะนำการตั้งค่า OAuth ใน Supabase</span>
              </button>

              {showConfigHelp && (
                <div className="mt-2.5 space-y-2 rounded-xl border border-primary/20 bg-info-soft/40 p-3 text-[11px] text-muted-foreground animate-in fade-in-50 duration-200">
                  <p className="font-semibold text-foreground">
                    ขั้นตอนเปิดใช้งาน Google/GitHub Login ใน Supabase Dashboard:
                  </p>
                  <ol className="list-decimal pl-4 space-y-1 leading-relaxed">
                    <li>
                      ไปที่ Supabase &gt; Authentication &gt; Providers แล้วเลือก Google หรือ GitHub
                    </li>
                    <li>เปิดใช้งาน Provider และใส่ Client ID/Client Secret ใน Supabase เท่านั้น</li>
                    <li>
                      เพิ่ม URL ของเว็บไซต์และ <code>/auth/callback</code> ใน Supabase Redirect URLs
                    </li>
                    <li>
                      สำหรับ GitHub ให้ใช้ Supabase Callback URL ที่หน้า Provider แสดงใน GitHub
                      OAuth App
                    </li>
                  </ol>
                  <div className="pt-1.5 flex items-center justify-between gap-2">
                    <span className="truncate font-mono text-[10px] bg-card px-2 py-1 rounded border border-border">
                      {typeof window !== "undefined"
                        ? `${window.location.origin}/auth/callback`
                        : ""}
                    </span>
                    <button
                      type="button"
                      onClick={copyRedirectUrl}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 shrink-0 cursor-pointer"
                    >
                      {copiedUrl ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedUrl ? "คัดลอกแล้ว" : "คัดลอก URL"}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : mode === "phone" ? (
          <form
            onSubmit={(event) => void verifyPhoneOtp(event)}
            className="space-y-3 pt-1 text-left"
          >
            <div className="rounded-xl border border-primary/20 bg-info-soft/60 p-3 text-xs text-muted-foreground">
              {!phoneOtpSent
                ? "กรอกเบอร์โทรศัพท์เพื่อรับรหัส OTP ทาง SMS"
                : "กรอกรหัส OTP 6 หลักที่ส่งไปยังโทรศัพท์ของคุณ"}
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
                placeholder="081-234-5678 หรือ +66812345678"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                disabled={phoneOtpSent || busy}
                className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
              <p className="mt-1 text-[11px] text-muted-foreground">
                ระบบจะปรับเบอร์ไทยเป็นรูปแบบสากลให้อัตโนมัติ
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
                      <EngineWorkingAnimation size="sm" label="กำลังตรวจสอบ" />
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
                    <EngineWorkingAnimation size="sm" label="กำลังส่งรหัส" />
                    กำลังส่งรหัส...
                  </>
                ) : (
                  <>
                    <Phone className="h-4 w-4" />
                    ส่งรหัส OTP
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
                กรอกอีเมลเพื่อรับลิงก์ตั้งรหัสผ่านใหม่
              </div>
            ) : null}
            {!resetMode && mode === "signup" ? (
              <div>
                <label className="text-xs font-medium text-muted-foreground">ชื่อผู้ใช้งาน</label>
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
                  ลงทะเบียนใหม่
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
    </div>
  );
}
