import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
    return "คุณยกเลิกการเข้าสู่ระบบแล้ว หากต้องการใช้งานต่อ กรุณากลับไปกด Continue with GitHub ใหม่อีกครั้ง";
  }

  if (
    normalized.includes("expired") ||
    normalized.includes("invalid") ||
    normalized.includes("code")
  ) {
    return "ลิงก์เข้าสู่ระบบหมดอายุหรือถูกใช้ไปแล้ว กรุณากลับไปเริ่มเข้าสู่ระบบใหม่อีกครั้ง";
  }

  if (normalized.includes("provider") || normalized.includes("github")) {
    return "ยังไม่ได้เปิดใช้งาน Provider นี้ใน Supabase หรือการตั้งค่า OAuth ไม่ถูกต้อง";
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
      const params = new URLSearchParams(window.location.search);
      const providerError = params.get("error_description") || params.get("error");
      const code = params.get("code");

      if (providerError) {
        throw new Error(providerError.replace(/\+/g, " "));
      }

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          // The browser client may have completed the PKCE exchange during its
          // automatic URL detection. Verify the resulting session before
          // treating the callback as a failure, which also keeps identity
          // linking from being broken by a second exchange attempt.
          const { data } = await supabase.auth.getSession();
          if (!data.session?.user) throw error;
        }
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw userError ?? new Error("No authenticated user found after OAuth callback");
      }

      if (cancelled) return;
      toast.success("เข้าสู่ระบบสำเร็จ");
      void navigate({ to: "/", replace: true });
    }

    void completeOAuth().catch((error: unknown) => {
      if (cancelled) return;
      console.error("[AuthCallback] OAuth callback failed", error);
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
