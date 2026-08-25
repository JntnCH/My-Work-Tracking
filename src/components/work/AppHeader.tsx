import { useEffect, useState } from "react";
import { Clock3, LogOut, Moon, ScanFace, Sun } from "lucide-react";
import { toast } from "sonner";
import { clearFaceCredential, enrollFaceUnlock } from "@/lib/face-unlock";

type Props = {
  name: string;
  email: string;
  userId: string;
  isGuest: boolean;
  faceEnrolled: boolean;
  faceSupported: boolean;
  onFaceChanged: () => void;
  onSignOut: () => void;
  themeMode: "light" | "dark" | "system";
  onToggleTheme: () => void;
};

export function AppHeader({
  name,
  email,
  userId,
  isGuest,
  faceEnrolled,
  faceSupported,
  onFaceChanged,
  onSignOut,
  themeMode,
  onToggleTheme,
}: Props) {
  const [now, setNow] = useState<Date | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  async function toggleFace() {
    setBusy(true);
    try {
      if (faceEnrolled) {
        clearFaceCredential(userId);
        toast.success("ปิดการล็อกด้วย Face ID เรียบร้อยแล้ว");
      } else {
        await enrollFaceUnlock(userId, name || email || "user");
        toast.success("ตั้งค่า Face ID / Touch ID บนอุปกรณ์นี้สำเร็จแล้ว!");
      }
      onFaceChanged();
    } catch (err) {
      toast.error("ตั้งค่า Face ID ไม่สำเร็จ", {
        description: err instanceof Error ? err.message : String(err),
        duration: 8000,
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <header className="gradient-header sticky top-0 z-40 text-primary-foreground shadow-lg">
      <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-2 px-3 py-3 sm:gap-3 sm:px-4 sm:py-4">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <div className="rounded-xl bg-card p-2 text-primary shadow-md">
            <Clock3 className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="truncate text-lg leading-tight font-bold">Work Tracker</h1>
              {email.toLowerCase().includes("@gmail.com") && (
                <span className="hidden xs:inline-flex items-center gap-1 rounded-full bg-card/20 px-1.5 py-0.5 text-[9px] font-bold text-primary-foreground tracking-wide">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Gmail
                </span>
              )}
            </div>
            <p className="truncate text-xs opacity-80">{name || email || "ระบบบันทึกงาน & Check-in"}</p>
            {isGuest && (
              <p
                className="mt-0.5 max-w-[15rem] text-[10px] leading-tight text-primary-foreground/70 sm:max-w-none"
                title="โหมดทดลอง: ข้อมูลจะเก็บไว้ในเบราว์เซอร์ของเครื่องนี้เท่านั้น ไม่ซิงก์ข้ามเครื่อง หากต้องการสำรองข้อมูลหรือใช้งานหลายเครื่อง กรุณาเข้าสู่ระบบด้วยบัญชีผู้ใช้"
              >
                โหมดทดลอง: ข้อมูลเก็บในเครื่องนี้เท่านั้น ไม่ซิงก์ข้ามเครื่อง
              </p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <div className="hidden rounded-lg border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-1.5 text-right text-xs font-medium tabular-nums sm:block md:text-sm">
            <div suppressHydrationWarning>
              {now ? now.toLocaleTimeString("th-TH", { hour12: false }) : "--:--:--"}
            </div>
            <div className="text-[10px] font-normal opacity-80" suppressHydrationWarning>
              {now
                ? now.toLocaleDateString("th-TH", {
                    day: "numeric",
                    month: "short",
                    year: "2-digit",
                  })
                : ""}
            </div>
          </div>

          <button
            type="button"
            onClick={onToggleTheme}
            title={themeMode === "dark" ? "เปลี่ยนเป็นโหมดสว่าง" : "เปลี่ยนเป็นโหมดมืด"}
            aria-label={themeMode === "dark" ? "เปลี่ยนเป็นโหมดสว่าง" : "เปลี่ยนเป็นโหมดมืด"}
            className="rounded-lg border border-primary-foreground/20 bg-primary-foreground/10 p-2 transition hover:bg-primary-foreground/20 active:scale-95"
          >
            {themeMode === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {faceSupported && (
            <button
              onClick={() => void toggleFace()}
              disabled={busy}
              title={faceEnrolled ? "ปิดล็อกด้วย Face ID" : "เปิดล็อกด้วย Face ID"}
              aria-label={faceEnrolled ? "ปิดล็อกด้วย Face ID" : "เปิดล็อกด้วย Face ID"}
              className={`rounded-lg border border-primary-foreground/20 p-2 transition disabled:opacity-60 ${
                faceEnrolled ? "bg-primary-foreground/30" : "bg-primary-foreground/10"
              }`}
            >
              <ScanFace className="h-4 w-4" />
            </button>
          )}

          <button
            onClick={onSignOut}
            title="ออกจากระบบ"
            aria-label="ออกจากระบบ"
            className="rounded-lg border border-primary-foreground/20 bg-primary-foreground/10 p-2 transition hover:bg-primary-foreground/20"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
