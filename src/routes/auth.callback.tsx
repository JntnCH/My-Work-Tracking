import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { completeGoogleRedirect } from "@/integrations/firebase/auth";
import { getFirebaseAuth, isFirebaseConfigured } from "@/integrations/firebase/client";

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallbackPage,
});

function getCallbackErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  const normalized = message.toLowerCase();

  if (
    normalized.includes("denied") ||
    normalized.includes("cancel") ||
    normalized.includes("access_denied")
  ) {
    return "คุณยกเลิกการเข้าสู่ระบบแล้ว กรุณากลับไปเริ่มใหม่อีกครั้ง";
  }

  if (normalized.includes("unauthorized-domain")) {
    return "โดเมนนี้ยังไม่ได้อยู่ใน Firebase Authentication → Settings → Authorized domains";
  }

  if (normalized.includes("popup-blocked")) {
    return "เบราว์เซอร์บล็อกหน้าต่างเข้าสู่ระบบ กรุณาอนุญาต pop-up หรือเปิดจากอุปกรณ์ที่รองรับการ redirect";
  }

  if (normalized.includes("provider") || normalized.includes("operation-not-allowed")) {
    return "ยังไม่ได้เปิดใช้งาน Provider นี้ใน Firebase Authentication หรือการตั้งค่า OAuth ไม่ถูกต้อง";
  }

  if (normalized.includes("environment") || normalized.includes("firebase")) {
    return "การ deploy นี้ยังไม่มี Firebase environment variables ครบถ้วนใน Netlify";
  }

  return "ไม่สามารถยืนยันการเข้าสู่ระบบได้ กรุณาลองใหม่อีกครั้ง";
}

function AuthCallbackPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function completeOAuth() {
      if (!isFirebaseConfigured()) {
        throw new Error("Firebase environment is not configured for this deployment");
      }

      const params = new URLSearchParams(window.location.search);
      const providerError = params.get("error_description") || params.get("error");
      if (providerError) throw new Error(providerError.replace(/\+/g, " "));

      const redirectResult = await completeGoogleRedirect();
      const currentUser = redirectResult?.user ?? getFirebaseAuth()?.currentUser;
      if (!currentUser) {
        throw new Error("No authenticated Firebase user found after OAuth callback");
      }

      if (cancelled) return;
      toast.success("เข้าสู่ระบบสำเร็จ");
      void navigate({ to: "/", replace: true });
    }

    void completeOAuth().catch((error: unknown) => {
      if (cancelled) return;
      console.error("[AuthCallback] Firebase callback failed", error);
      setErrorMessage(getCallbackErrorMessage(error));
      setStatus("error");
    });

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  if (status === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
        <div className="surface-card w-full max-w-md space-y-5 border border-destructive/20 p-7 text-center shadow-lg">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertCircle className="h-6 w-6" aria-hidden="true" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-foreground">เข้าสู่ระบบไม่สำเร็จ</h1>
            <p className="text-sm leading-relaxed text-muted-foreground">{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={() => void navigate({ to: "/auth", replace: true })}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            กลับไปหน้าเข้าสู่ระบบ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <div className="surface-card flex w-full max-w-md flex-col items-center gap-4 border border-border p-7 text-center shadow-lg">
        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
        <div className="space-y-1">
          <h1 className="text-lg font-bold text-foreground">กำลังยืนยันการเข้าสู่ระบบ</h1>
          <p className="text-sm text-muted-foreground">
            กรุณารอสักครู่ ระบบกำลังเชื่อมต่อบัญชีของคุณ
          </p>
        </div>
      </div>
    </div>
  );
}
