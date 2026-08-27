import { useCallback, useEffect, useMemo, useState } from "react";
import type { User, UserIdentity } from "@supabase/supabase-js";
import {
  AlertTriangle,
  CheckCircle2,
  Flame,
  Github,
  KeyRound,
  Link2,
  Loader2,
  LogOut,
  Mail,
  MessageCircle,
  RefreshCw,
  Settings,
  ShieldCheck,
  Sparkles,
  Unlink2,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  isFirebaseConfigured,
  getFirebaseConfig,
  testFirebaseConnection,
  getFirebaseAuth,
} from "@/lib/firebase";
import { FirebaseConfigDialog } from "./FirebaseConfigDialog";

type Props = {
  user: User | null;
  isGuest?: boolean;
  onSignOut: (scope?: "local" | "global") => Promise<void>;
};

type Provider = "google" | "github" | "custom:line";

const PROVIDERS: Array<{
  id: Provider;
  label: string;
  description: string;
  icon: typeof Github;
  className: string;
}> = [
  {
    id: "google",
    label: "Google",
    description: "เข้าสู่ระบบด้วยบัญชี Google",
    icon: Mail,
    className: "text-[#4285F4]",
  },
  {
    id: "github",
    label: "GitHub",
    description: "เข้าสู่ระบบด้วยบัญชี GitHub",
    icon: Github,
    className: "text-foreground",
  },
  {
    id: "custom:line",
    label: "LINE",
    description: "เข้าสู่ระบบด้วยบัญชี LINE ผ่าน Custom OIDC",
    icon: MessageCircle,
    className: "text-[#06C755]",
  },
];

function providerLabel(provider: string) {
  if (provider === "google") return "Google";
  if (provider === "github") return "GitHub";
  if (provider === "custom:line" || provider === "line") return "LINE";
  if (provider === "email") return "อีเมลและรหัสผ่าน";
  return provider;
}

export function AuthenticationSettings({ user, isGuest = false, onSignOut }: Props) {
  const [identities, setIdentities] = useState<UserIdentity[]>(user?.identities ?? []);
  const [loadingIdentities, setLoadingIdentities] = useState(false);
  const [linkingProvider, setLinkingProvider] = useState<Provider | null>(null);
  const [unlinkingId, setUnlinkingId] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [signingOut, setSigningOut] = useState<"local" | "global" | null>(null);
  const [showFirebaseModal, setShowFirebaseModal] = useState(false);
  const [firebaseConfigured, setFirebaseConfigured] = useState(() => isFirebaseConfigured());
  const [testingFirebase, setTestingFirebase] = useState(false);

  const loadIdentities = useCallback(async () => {
    if (isGuest || !user) return;
    setLoadingIdentities(true);
    try {
      const { data, error } = await supabase.auth.getUserIdentities();
      if (error) throw error;
      setIdentities(data.identities ?? []);
    } catch (error) {
      toast.error("โหลดช่องทางการเข้าสู่ระบบไม่สำเร็จ", {
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setLoadingIdentities(false);
    }
  }, [isGuest, user]);

  useEffect(() => {
    setIdentities(user?.identities ?? []);
    void loadIdentities();
  }, [loadIdentities, user]);

  const connectedProviders = useMemo(() => {
    const list = identities.map((identity) => identity.provider);
    if (user?.app_metadata?.provider) {
      list.push(user.app_metadata.provider);
    }
    return new Set(list);
  }, [identities, user]);

  const emailConnected = Boolean(
    user?.email && (connectedProviders.has("email") || identities.length === 0),
  );
  const channelCount =
    identities.length + (emailConnected && !connectedProviders.has("email") ? 1 : 0);

  async function connectProvider(provider: Provider) {
    if (isGuest) {
      toast.info("Guest Mode ไม่สามารถเชื่อมต่อ Provider ได้", {
        description: "กรุณาเข้าสู่ระบบด้วยบัญชีจริงก่อน",
      });
      return;
    }
    setLinkingProvider(provider);
    try {
      const { data, error } = await supabase.auth.linkIdentity({
        provider,
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
      if (data?.url) {
        window.location.assign(data.url);
        return;
      }
      toast.success(`เชื่อมต่อ ${providerLabel(provider)} แล้ว`);
      await loadIdentities();
    } catch (error) {
      toast.error(`เชื่อมต่อ ${providerLabel(provider)} ไม่สำเร็จ`, {
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setLinkingProvider(null);
    }
  }

  async function disconnectIdentity(identity: UserIdentity) {
    if (channelCount <= 1) {
      toast.error("ไม่สามารถยกเลิกช่องทางสุดท้ายได้", {
        description: "กรุณาเชื่อมต่อ Provider หรือกำหนดอีเมล/รหัสผ่านอีกช่องทางก่อน",
      });
      return;
    }
    setUnlinkingId(identity.identity_id);
    try {
      const { error } = await supabase.auth.unlinkIdentity(identity);
      if (error) throw error;
      toast.success(`ยกเลิกการเชื่อมต่อ ${providerLabel(identity.provider)} แล้ว`);
      await loadIdentities();
    } catch (error) {
      toast.error("ยกเลิกการเชื่อมต่อไม่สำเร็จ", {
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setUnlinkingId(null);
    }
  }

  async function updatePassword(event: React.FormEvent) {
    event.preventDefault();
    if (password.length < 8) {
      toast.error("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("รหัสผ่านใหม่ไม่ตรงกัน");
      return;
    }
    setSavingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setPassword("");
      setConfirmPassword("");
      toast.success("เปลี่ยนรหัสผ่านเรียบร้อยแล้ว");
    } catch (error) {
      toast.error("เปลี่ยนรหัสผ่านไม่สำเร็จ", {
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setSavingPassword(false);
    }
  }

  async function handleSignOut(scope: "local" | "global") {
    setSigningOut(scope);
    try {
      await onSignOut(scope);
      toast.success(scope === "global" ? "ออกจากระบบทุกอุปกรณ์แล้ว" : "ออกจากระบบแล้ว");
    } catch (error) {
      toast.error("ออกจากระบบไม่สำเร็จ", {
        description: error instanceof Error ? error.message : String(error),
      });
      setSigningOut(null);
    }
  }

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-primary/20 bg-info-soft/70 p-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <h3 className="text-sm font-bold">Authentication / การเข้าสู่ระบบ</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              จัดการบัญชีและช่องทางเข้าสู่ระบบจาก Supabase Auth โดยไม่สร้างบัญชีซ้ำเมื่อเชื่อมต่อ
              Provider เพิ่ม
            </p>
          </div>
        </div>
      </div>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-primary">
              {user.user_metadata?.["avatar_url"] || user.user_metadata?.["picture"] ? (
                <img
                  src={String(user.user_metadata["avatar_url"] || user.user_metadata["picture"])}
                  alt="รูปโปรไฟล์"
                  className="h-full w-full object-cover"
                />
              ) : (
                <UserRound className="h-6 w-6" />
              )}
            </div>
            <div>
              <h4 className="font-bold text-foreground">
                {String(
                  user.user_metadata?.["full_name"] ||
                    user.user_metadata?.["name"] ||
                    "ผู้ใช้ Work Tracker",
                )}
              </h4>
              <p className="text-xs text-muted-foreground">{user.email || "ไม่มีอีเมล"}</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-success-soft px-2.5 py-1 text-[11px] font-bold text-success">
            <CheckCircle2 className="h-3.5 w-3.5" /> {isGuest ? "Guest Mode" : "บัญชีใช้งานอยู่"}
          </span>
        </div>
        <div className="mt-4 grid gap-3 text-xs sm:grid-cols-2">
          <div className="rounded-xl bg-secondary p-3">
            <span className="block text-muted-foreground">User ID</span>
            <code className="mt-1 block truncate text-[11px] text-foreground">{user.id}</code>
          </div>
          <div className="rounded-xl bg-secondary p-3">
            <span className="block text-muted-foreground">Provider หลัก</span>
            <span className="mt-1 block font-semibold text-foreground">
              {providerLabel(
                String(user.app_metadata?.provider || identities[0]?.provider || "email"),
              )}
            </span>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h4 className="font-bold text-sm">ช่องทางการเข้าสู่ระบบ</h4>
            <p className="mt-1 text-xs text-muted-foreground">
              เชื่อมต่อได้หลายช่องทาง ข้อมูลเดิมจะยังอยู่กับบัญชีเดียวกัน
            </p>
          </div>
          <button
            type="button"
            onClick={() => void loadIdentities()}
            disabled={loadingIdentities || isGuest}
            className="rounded-xl border border-border p-2 text-muted-foreground transition hover:bg-accent disabled:opacity-50"
            aria-label="รีเฟรชช่องทางการเข้าสู่ระบบ"
          >
            <RefreshCw className={`h-4 w-4 ${loadingIdentities ? "animate-spin" : ""}`} />
          </button>
        </div>

        {isGuest ? (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-warning/30 bg-warning-soft p-3 text-xs text-warning-foreground">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              Guest Mode ใช้ได้เฉพาะการทดลอง ระบบจะไม่บันทึก Provider หรือรหัสผ่านลงบัญชีจริง
            </span>
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            {PROVIDERS.map(({ id, label, description, icon: Icon, className }) => {
              const identity = identities.find((item) =>
                id === "custom:line"
                  ? item.provider === "custom:line" || item.provider === "line"
                  : item.provider === id,
              );
              const isConnected = Boolean(identity);
              return (
                <div
                  key={id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-3"
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-5 w-5 ${className}`} />
                    <div>
                      <p className="text-sm font-semibold">{label}</p>
                      <p className="text-[11px] text-muted-foreground">{description}</p>
                    </div>
                  </div>
                  {isConnected ? (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2.5 py-1 text-[11px] font-bold text-success">
                        <CheckCircle2 className="h-3.5 w-3.5" /> เชื่อมต่อแล้ว
                      </span>
                      <button
                        type="button"
                        onClick={() => identity && void disconnectIdentity(identity)}
                        disabled={unlinkingId === identity?.identity_id || channelCount <= 1}
                        className="inline-flex items-center gap-1 rounded-xl border border-destructive/30 px-2.5 py-1.5 text-[11px] font-semibold text-destructive transition hover:bg-destructive-soft disabled:opacity-50"
                      >
                        {unlinkingId === identity?.identity_id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Unlink2 className="h-3.5 w-3.5" />
                        )}
                        ยกเลิก
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => void connectProvider(id)}
                      disabled={linkingProvider !== null}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-[11px] font-bold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
                    >
                      {linkingProvider === id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Link2 className="h-3.5 w-3.5" />
                      )}
                      เชื่อมต่อ {label}
                    </button>
                  )}
                </div>
              );
            })}
            <div className="flex items-center justify-between rounded-xl border border-border p-3">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-semibold">อีเมลและรหัสผ่าน</p>
                  <p className="text-[11px] text-muted-foreground">
                    {user.email || "ยังไม่มีอีเมลในบัญชี"}
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2.5 py-1 text-[11px] font-bold text-success">
                <CheckCircle2 className="h-3.5 w-3.5" />{" "}
                {emailConnected ? "พร้อมใช้" : "ยังไม่ตั้งค่า"}
              </span>
            </div>
          </div>
        )}
      </section>

      {/* Firebase Database & Auth Settings Section */}
      <section className="rounded-2xl border border-amber-500/30 bg-card p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Flame className="h-4 w-4" />
            </div>
            <div>
              <h4 className="font-bold text-sm flex items-center gap-2">
                Firebase (Firestore & Auth)
                {firebaseConfigured ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-3 w-3" /> เชื่อมต่อแล้ว
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                    ยังไม่ตั้งค่า
                  </span>
                )}
              </h4>
              <p className="text-xs text-muted-foreground">
                เชื่อมต่อฐานข้อมูล Firestore และระบบเข้าสู่ระบบด้วย Google ผ่าน Firebase
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowFirebaseModal(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs font-bold text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 transition cursor-pointer"
          >
            <Settings className="h-3.5 w-3.5" />
            <span>ตั้งค่า Firebase</span>
          </button>
        </div>

        {firebaseConfigured && (
          <div className="rounded-xl border border-border/80 bg-muted/20 p-3 text-xs flex items-center justify-between gap-3">
            <div className="space-y-0.5 min-w-0">
              <span className="text-[11px] font-medium text-muted-foreground">
                Firebase Project:
              </span>
              <p className="font-mono text-xs font-semibold truncate text-foreground">
                {getFirebaseConfig()?.projectId || "N/A"}
              </p>
            </div>

            <button
              type="button"
              disabled={testingFirebase}
              onClick={async () => {
                setTestingFirebase(true);
                try {
                  const res = await testFirebaseConnection();
                  if (res.success) {
                    toast.success(res.message);
                  } else {
                    toast.error("การเชื่อมต่อมีปัญหา", { description: res.message });
                  }
                } catch (e: unknown) {
                  const errMessage = e instanceof Error ? e.message : String(e);
                  toast.error("ทดสอบไม่สำเร็จ", { description: errMessage });
                } finally {
                  setTestingFirebase(false);
                }
              }}
              className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1.5 text-[11px] font-semibold text-foreground hover:bg-accent transition disabled:opacity-50 cursor-pointer shrink-0"
            >
              {testingFirebase ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <RefreshCw className="h-3 w-3 text-amber-500" />
              )}
              <span>{testingFirebase ? "กำลังทดสอบ..." : "ทดสอบสถานะ"}</span>
            </button>
          </div>
        )}
      </section>

      {!isGuest && (
        <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary" />
            <div>
              <h4 className="font-bold text-sm">เปลี่ยนรหัสผ่าน</h4>
              <p className="mt-1 text-xs text-muted-foreground">
                ใช้ได้เมื่อบัญชีมีอีเมลและ Supabase Auth รองรับ password provider
              </p>
            </div>
          </div>
          <form
            onSubmit={(event) => void updatePassword(event)}
            className="mt-4 grid gap-3 sm:grid-cols-2"
          >
            <input
              type="password"
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="รหัสผ่านใหม่อย่างน้อย 8 ตัวอักษร"
              className="rounded-xl border border-input bg-background px-3 py-2.5 text-sm"
              autoComplete="new-password"
            />
            <input
              type="password"
              minLength={8}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="ยืนยันรหัสผ่านใหม่"
              className="rounded-xl border border-input bg-background px-3 py-2.5 text-sm"
              autoComplete="new-password"
            />
            <button
              type="submit"
              disabled={savingPassword || !password || !confirmPassword}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50 sm:col-span-2 sm:justify-self-start"
            >
              {savingPassword ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <KeyRound className="h-4 w-4" />
              )}
              {savingPassword ? "กำลังบันทึก..." : "บันทึกรหัสผ่านใหม่"}
            </button>
          </form>
        </section>
      )}

      <section className="rounded-2xl border border-destructive/20 bg-destructive-soft/40 p-4">
        <div className="flex items-start gap-3">
          <LogOut className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
          <div className="flex-1">
            <h4 className="font-bold text-sm">ออกจากระบบ</h4>
            <p className="mt-1 text-xs text-muted-foreground">
              ล้าง session ในอุปกรณ์นี้ หรือออกจากระบบทุกอุปกรณ์ที่ยังเปิดอยู่
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => void handleSignOut("local")}
                disabled={signingOut !== null}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5 text-xs font-bold text-foreground transition hover:bg-accent disabled:opacity-50"
              >
                {signingOut === "local" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="h-4 w-4" />
                )}
                ออกจากอุปกรณ์นี้
              </button>
              <button
                type="button"
                onClick={() => void handleSignOut("global")}
                disabled={signingOut !== null}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-destructive px-3 py-2.5 text-xs font-bold text-destructive-foreground transition hover:bg-destructive/90 disabled:opacity-50"
              >
                {signingOut === "global" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="h-4 w-4" />
                )}
                ออกจากระบบทุกอุปกรณ์
              </button>
            </div>
          </div>
        </div>
      </section>

      <FirebaseConfigDialog
        open={showFirebaseModal}
        onOpenChange={setShowFirebaseModal}
        onConfigSaved={() => setFirebaseConfigured(isFirebaseConfigured())}
      />
    </div>
  );
}
