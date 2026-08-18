import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { EngineWorkingAnimation } from "@/components/ui/engine-working-animation";

export const Route = createFileRoute("/$")({
  component: SplatPage,
});

function SplatPage() {
  const navigate = useNavigate();

  useEffect(() => {
    void navigate({ to: "/", replace: true });
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 text-center">
      <div className="flex flex-col items-center gap-3">
        <EngineWorkingAnimation size="lg" label="กำลังนำคุณกลับสู่ระบบ" />
        <p className="text-sm font-medium text-muted-foreground">กำลังนำคุณกลับสู่ระบบ...</p>
      </div>
    </div>
  );
}
