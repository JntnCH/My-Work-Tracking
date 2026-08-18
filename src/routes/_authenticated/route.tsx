import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useSession } from "@/hooks/use-session";

function AuthenticatedLayout() {
  const { user, loading } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      void navigate({ to: "/auth", replace: true });
    }
  }, [loading, user, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">กำลังตรวจสอบสิทธิ์การใช้งาน…</p>
            <p className="text-xs text-muted-foreground">
              หากใช้เวลานานเกินไป กรุณาตรวจสอบการตั้งค่า API Key
            </p>
          </div>
          <button
            onClick={() => void navigate({ to: "/auth", replace: true })}
            className="mt-4 rounded-xl bg-secondary px-4 py-2 text-xs font-semibold text-secondary-foreground hover:bg-secondary/80"
          >
            ไปที่หน้าเข้าสู่ระบบ / โหมด Guest
          </button>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return <Outlet />;
}

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});
