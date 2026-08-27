import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Flame,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Database,
  Globe,
  RotateCcw,
  Sparkles,
  Save,
  Check,
  HelpCircle,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import {
  getFirebaseConfig,
  saveCustomFirebaseConfig,
  clearCustomFirebaseConfig,
  testFirebaseConnection,
  isFirebaseConfigured,
  type FirebaseConfig,
} from "@/lib/firebase";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfigSaved?: () => void;
};

export function FirebaseConfigDialog({ open, onOpenChange, onConfigSaved }: Props) {
  const [apiKey, setApiKey] = useState("");
  const [authDomain, setAuthDomain] = useState("");
  const [projectId, setProjectId] = useState("");
  const [storageBucket, setStorageBucket] = useState("");
  const [messagingSenderId, setMessagingSenderId] = useState("");
  const [appId, setAppId] = useState("");
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    if (open) {
      const cfg = getFirebaseConfig();
      if (cfg) {
        setApiKey(cfg.apiKey || "");
        setAuthDomain(cfg.authDomain || "");
        setProjectId(cfg.projectId || "");
        setStorageBucket(cfg.storageBucket || "");
        setMessagingSenderId(cfg.messagingSenderId || "");
        setAppId(cfg.appId || "");
      }
      setTestResult(null);
    }
  }, [open]);

  const handleProjectIdChange = (val: string) => {
    setProjectId(val);
    const clean = val.trim();
    if (clean && !authDomain) {
      setAuthDomain(`${clean}.firebaseapp.com`);
    }
    if (clean && !storageBucket) {
      setStorageBucket(`${clean}.appspot.com`);
    }
  };

  const handleSave = () => {
    if (!apiKey.trim() || !projectId.trim()) {
      toast.error("กรุณาระบุ API Key และ Project ID เป็นอย่างน้อย");
      return;
    }

    const config: FirebaseConfig = {
      apiKey: apiKey.trim(),
      projectId: projectId.trim(),
      authDomain: authDomain.trim() || `${projectId.trim()}.firebaseapp.com`,
      storageBucket: storageBucket.trim() || `${projectId.trim()}.appspot.com`,
      messagingSenderId: messagingSenderId.trim() || undefined,
      appId: appId.trim() || undefined,
    };

    saveCustomFirebaseConfig(config);
    toast.success("บันทึกการตั้งค่า Firebase เรียบร้อยแล้ว");
    onConfigSaved?.();
    onOpenChange(false);
  };

  const handleReset = () => {
    clearCustomFirebaseConfig();
    const envCfg = getFirebaseConfig();
    if (envCfg) {
      setApiKey(envCfg.apiKey || "");
      setAuthDomain(envCfg.authDomain || "");
      setProjectId(envCfg.projectId || "");
      setStorageBucket(envCfg.storageBucket || "");
      setMessagingSenderId(envCfg.messagingSenderId || "");
      setAppId(envCfg.appId || "");
    } else {
      setApiKey("");
      setAuthDomain("");
      setProjectId("");
      setStorageBucket("");
      setMessagingSenderId("");
      setAppId("");
    }
    setTestResult(null);
    toast.info("รีเซ็ตการตั้งค่าเป็นค่าเริ่มต้นแล้ว");
  };

  const handleTest = async () => {
    if (!apiKey.trim() || !projectId.trim()) {
      toast.error("กรุณากรอก API Key และ Project ID ก่อนทดสอบ");
      return;
    }

    setTesting(true);
    setTestResult(null);

    // Temporarily save to test
    const tempConfig: FirebaseConfig = {
      apiKey: apiKey.trim(),
      projectId: projectId.trim(),
      authDomain: authDomain.trim() || `${projectId.trim()}.firebaseapp.com`,
      storageBucket: storageBucket.trim() || `${projectId.trim()}.appspot.com`,
      messagingSenderId: messagingSenderId.trim() || undefined,
      appId: appId.trim() || undefined,
    };
    saveCustomFirebaseConfig(tempConfig);

    try {
      const res = await testFirebaseConnection();
      setTestResult(res);
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error("การเชื่อมต่อ Firebase ขัดข้อง", { description: res.message });
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setTestResult({ success: false, message: msg });
      toast.error("ทดสอบไม่สำเร็จ", { description: msg });
    } finally {
      setTesting(false);
    }
  };

  const isConfigured = isFirebaseConfigured();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-left space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Flame className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                ตั้งค่าและเชื่อมต่อ Firebase
                {isConfigured ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-3 w-3" /> เชื่อมต่อแล้ว
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                    <AlertCircle className="h-3 w-3" /> รอการตั้งค่า
                  </span>
                )}
              </DialogTitle>
              <DialogDescription className="text-xs">
                กำหนดค่า Firebase Project เพื่อเปิดใช้งาน Google Sign-In และ Firestore Database
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3.5 py-2 text-left text-xs">
          {/* Helper Banner */}
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 space-y-1.5 text-foreground">
            <div className="flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-400">
              <Sparkles className="h-4 w-4" />
              <span>การเชื่อมต่อ Google เข้ากับ Firebase</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              ไปที่{" "}
              <a
                href="https://console.firebase.google.com"
                target="_blank"
                rel="noreferrer"
                className="underline font-semibold hover:text-amber-600 inline-flex items-center gap-0.5"
              >
                Firebase Console <ExternalLink className="h-2.5 w-2.5" />
              </a>{" "}
              &gt; Project Settings &gt; General &gt; Your apps &gt; Web app แล้วนำค่า Config
              มาวางที่นี่
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-bold text-foreground block mb-1">
                Firebase Project ID <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                placeholder="เช่น my-work-tracker-app"
                value={projectId}
                onChange={(e) => handleProjectIdChange(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-foreground block mb-1">
                API Key <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                placeholder="AIzaSy..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary font-mono"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                  Auth Domain
                </label>
                <input
                  type="text"
                  placeholder="project-id.firebaseapp.com"
                  value={authDomain}
                  onChange={(e) => setAuthDomain(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                  Storage Bucket
                </label>
                <input
                  type="text"
                  placeholder="project-id.appspot.com"
                  value={storageBucket}
                  onChange={(e) => setStorageBucket(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary font-mono text-[11px]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                  App ID (ถ้ามี)
                </label>
                <input
                  type="text"
                  placeholder="1:123456789:web:abcdef..."
                  value={appId}
                  onChange={(e) => setAppId(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                  Messaging Sender ID (ถ้ามี)
                </label>
                <input
                  type="text"
                  placeholder="123456789012"
                  value={messagingSenderId}
                  onChange={(e) => setMessagingSenderId(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary font-mono text-[11px]"
                />
              </div>
            </div>
          </div>

          {testResult && (
            <div
              className={`rounded-xl border p-3 text-xs ${
                testResult.success
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                  : "border-destructive/30 bg-destructive/10 text-destructive"
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold">
                {testResult.success ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
                )}
                <span>{testResult.success ? "การเชื่อมต่อสำเร็จ" : "การเชื่อมต่อล้มเหลว"}</span>
              </div>
              <p className="mt-1 text-[11px] opacity-90">{testResult.message}</p>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between gap-2 pt-2 border-t border-border">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1 rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>รีเซ็ต</span>
            </button>
            <button
              type="button"
              onClick={handleTest}
              disabled={testing || !apiKey || !projectId}
              className="inline-flex items-center gap-1 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-bold text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 transition disabled:opacity-50 cursor-pointer"
            >
              <Flame className="h-3.5 w-3.5" />
              <span>{testing ? "กำลังทดสอบ..." : "ทดสอบการเชื่อมต่อ"}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground hover:bg-accent transition cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-1 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition shadow-sm cursor-pointer"
            >
              <Save className="h-3.5 w-3.5" />
              <span>บันทึกการตั้งค่า</span>
            </button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
