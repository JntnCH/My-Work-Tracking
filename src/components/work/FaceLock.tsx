import { useCallback, useEffect, useState } from "react";
import { ExternalLink, KeyRound, Lock, ScanFace, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  clearFaceCredential,
  getFaceCredentialId,
  isFaceUnlockSupported,
  isIframeEnvironment,
  verifyFaceUnlock,
} from "@/lib/face-unlock";

const flagKey = (userId: string) => `work_tracker_unlocked::${userId}`;

/** Requires a Face ID / Touch ID check once per browser session when enrolled. */
export function useFaceLock(userId: string | null) {
  const [enrolled, setEnrolled] = useState(false);
  const [locked, setLocked] = useState(false);
  const [checked, setChecked] = useState(false);

  const refresh = useCallback(() => {
    if (!userId) return;
    const has = !!getFaceCredentialId(userId);
    setEnrolled(has);
    const unlockedThisSession = window.sessionStorage.getItem(flagKey(userId)) === "1";
    setLocked(has && !unlockedThisSession);
    setChecked(true);
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const unlock = useCallback(async () => {
    if (!userId) return;
    await verifyFaceUnlock(userId);
    window.sessionStorage.setItem(flagKey(userId), "1");
    setLocked(false);
  }, [userId]);

  const forceBypassUnlock = useCallback(() => {
    if (!userId) return;
    window.sessionStorage.setItem(flagKey(userId), "1");
    setLocked(false);
  }, [userId]);

  const removeFaceLock = useCallback(() => {
    if (!userId) return;
    clearFaceCredential(userId);
    window.sessionStorage.setItem(flagKey(userId), "1");
    setEnrolled(false);
    setLocked(false);
    refresh();
  }, [refresh, userId]);

  return {
    enrolled,
    locked,
    checked,
    unlock,
    forceBypassUnlock,
    removeFaceLock,
    refresh,
    supported: isFaceUnlockSupported(),
    inIframe: isIframeEnvironment(),
  };
}

export function FaceLockScreen({
  name,
  userId,
  onUnlock,
  onBypassUnlock,
  onRemoveFaceLock,
  onSignOut,
}: {
  name: string;
  userId: string;
  onUnlock: () => Promise<void>;
  onBypassUnlock: () => void;
  onRemoveFaceLock: () => void;
  onSignOut: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [autoAttempted, setAutoAttempted] = useState(false);
  const inIframe = isIframeEnvironment();

  const attempt = useCallback(async () => {
    setBusy(true);
    try {
      await onUnlock();
      toast.success("ปลดล็อกเรียบร้อยแล้ว");
    } catch (err) {
      toast.error("ปลดล็อกไม่สำเร็จ", {
        description: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setBusy(false);
    }
  }, [onUnlock]);

  // Auto-trigger Face ID on mount if not in iframe
  useEffect(() => {
    if (!autoAttempted && !inIframe) {
      setAutoAttempted(true);
      const timer = setTimeout(() => {
        void attempt();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [attempt, autoAttempted, inIframe]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <div className="surface-card w-full max-w-sm space-y-6 p-7 text-center">
        <div className="mx-auto w-fit rounded-2xl bg-primary/10 p-3 text-primary">
          <Lock className="h-7 w-7" />
        </div>

        <div className="space-y-1">
          <h1 className="text-lg font-bold">แอปถูกล็อกอยู่ (Face ID)</h1>
          <p className="text-xs text-muted-foreground">{name}</p>
        </div>

        {inIframe && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-left text-xs text-amber-600 dark:text-amber-400">
            <p className="font-semibold flex items-center gap-1.5 mb-1">
              <ExternalLink className="h-4 w-4 shrink-0" /> เปิดในกรอบพรีวิว (iframe)
            </p>
            <p className="opacity-90 leading-relaxed">
              เบราว์เซอร์จะบล็อก Face ID เมื่อเปิดในกรอบพรีวิว กรุณากดปุ่มเปิดในแท็บใหม่ (New Tab)
              ด้านบน หรือกดปุ่มปลดล็อกด้วยสิทธิ์เข้าใช้งานด้านล่าง
            </p>
          </div>
        )}

        <div className="space-y-2">
          <button
            onClick={() => void attempt()}
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow transition hover:bg-primary/90 disabled:opacity-60"
          >
            <ScanFace className="h-4 w-4" />
            {busy ? "กำลังยืนยัน Face ID…" : "ปลดล็อกด้วย Face ID / Touch ID"}
          </button>

          <button
            onClick={() => {
              onBypassUnlock();
              toast.success("ปลดล็อกผ่านสิทธิ์บัญชีที่เข้าใช้งานสำเร็จ");
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-secondary py-2.5 text-xs font-semibold text-foreground transition hover:bg-secondary/80"
          >
            <KeyRound className="h-3.5 w-3.5 text-primary" />
            ปลดล็อกด้วยสิทธิ์บัญชีปัจจุบัน
          </button>
        </div>

        <div className="border-t border-border pt-4 flex items-center justify-between text-xs">
          <button
            onClick={() => {
              onRemoveFaceLock();
              toast.info("ยกเลิกการล็อกด้วย Face ID เรียบร้อยแล้ว");
            }}
            className="flex items-center gap-1 text-muted-foreground hover:text-destructive transition"
          >
            <Trash2 className="h-3.5 w-3.5" /> ยกเลิก Face ID
          </button>

          <button
            onClick={onSignOut}
            className="text-muted-foreground underline-offset-2 hover:underline"
          >
            ออกจากระบบ
          </button>
        </div>
      </div>
    </div>
  );
}
