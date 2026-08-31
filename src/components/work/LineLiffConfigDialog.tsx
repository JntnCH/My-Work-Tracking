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
  MessageCircle,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
  Save,
  RotateCcw,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  getLiffId,
  saveCustomLiffId,
  clearCustomLiffId,
  isLineLiffConfigured,
} from "@/lib/line-auth";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfigSaved?: () => void;
};

export function LineLiffConfigDialog({ open, onOpenChange, onConfigSaved }: Props) {
  const [liffId, setLiffId] = useState("");
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedOrigin, setCopiedOrigin] = useState(false);

  const currentOrigin = typeof window !== "undefined" ? window.location.origin : "";
  const authUrl = `${currentOrigin}/auth`;
  const isConfigured = isLineLiffConfigured();

  useEffect(() => {
    if (open) {
      setLiffId(getLiffId());
    }
  }, [open]);

  const handleSave = () => {
    const cleanId = liffId.trim();
    if (!cleanId) {
      toast.error("กรุณาระบุ LINE LIFF ID");
      return;
    }

    saveCustomLiffId(cleanId);
    toast.success("บันทึกการตั้งค่า LINE LIFF สำเร็จ", {
      description: `LIFF ID: ${cleanId}`,
    });
    onConfigSaved?.();
    onOpenChange(false);
  };

  const handleReset = () => {
    clearCustomLiffId();
    setLiffId("");
    toast.info("ล้างค่า LINE LIFF เรียบร้อยแล้ว");
    onConfigSaved?.();
  };

  const copyToClipboard = async (text: string, type: "auth" | "origin") => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "auth") {
        setCopiedUrl(true);
        setTimeout(() => setCopiedUrl(false), 2000);
      } else {
        setCopiedOrigin(true);
        setTimeout(() => setCopiedOrigin(false), 2000);
      }
      toast.success("คัดลอก URL เรียบร้อยแล้ว");
    } catch {
      toast.error("ไม่สามารถคัดลอกได้");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-foreground">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#06C755]/10 text-[#06C755]">
              <MessageCircle className="h-5 w-5" />
            </div>
            <span>ตั้งค่าการเข้าสู่ระบบด้วย LINE LIFF</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            เชื่อมต่อกับ LINE Developers LIFF เพื่อให้ผู้ใช้สามารถล็อกอินด้วย LINE ได้โดยตรง
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Status Banner */}
          <div
            className={`flex items-center justify-between rounded-xl border p-3.5 ${
              isConfigured
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300"
                : "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300"
            }`}
          >
            <div className="flex items-center gap-2.5">
              {isConfigured ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
              )}
              <div>
                <p className="text-xs font-bold">
                  {isConfigured ? "เชื่อมต่อ LINE LIFF แล้ว" : "ยังไม่ได้ระบุ LINE LIFF ID"}
                </p>
                <p className="text-[11px] opacity-90">
                  {isConfigured
                    ? `LIFF ID ปัจจุบัน: ${getLiffId()}`
                    : "ใส่ LIFF ID จาก LINE Developers Console เพื่อเปิดใช้งาน"}
                </p>
              </div>
            </div>
            {isConfigured && (
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1 rounded-lg border border-border/80 bg-background/80 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" />
                ล้างค่า
              </button>
            )}
          </div>

          {/* Form Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground flex items-center justify-between">
              <span>LINE LIFF ID</span>
              <span className="text-[10px] text-muted-foreground font-normal">
                รูปแบบ: 1234567890-AbcdEfgh
              </span>
            </label>
            <input
              type="text"
              placeholder="เช่น 2001234567-AbCdEfGh"
              value={liffId}
              onChange={(e) => setLiffId(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-xs font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#06C755]"
            />
          </div>

          {/* Endpoint URLs to copy */}
          <div className="rounded-xl border border-border bg-muted/40 p-3.5 space-y-2.5 text-xs">
            <p className="font-bold text-foreground flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[#06C755]" />
              URL สำหรับนำไปกรอกใน LINE Developers Console:
            </p>

            <div className="space-y-2">
              <div>
                <span className="text-[11px] text-muted-foreground block mb-0.5">
                  1. <strong>Endpoint URL</strong> (สำหรับแท็บ LIFF App):
                </span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    readOnly
                    value={authUrl}
                    className="w-full rounded-lg border border-border bg-card px-2.5 py-1.5 font-mono text-[11px] text-foreground select-all"
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(authUrl, "auth")}
                    className="flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1.5 text-[11px] font-semibold text-primary-foreground hover:bg-primary/90 transition shrink-0 cursor-pointer"
                  >
                    {copiedUrl ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    <span>{copiedUrl ? "คัดลอกแล้ว" : "คัดลอก"}</span>
                  </button>
                </div>
              </div>

              <div>
                <span className="text-[11px] text-muted-foreground block mb-0.5">
                  2. <strong>App Origin URL</strong>:
                </span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    readOnly
                    value={currentOrigin}
                    className="w-full rounded-lg border border-border bg-card px-2.5 py-1.5 font-mono text-[11px] text-foreground select-all"
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(currentOrigin, "origin")}
                    className="flex items-center gap-1 rounded-lg border border-border bg-secondary px-2.5 py-1.5 text-[11px] font-semibold text-foreground hover:bg-accent transition shrink-0 cursor-pointer"
                  >
                    {copiedOrigin ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    <span>{copiedOrigin ? "คัดลอกแล้ว" : "คัดลอก"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Guide Steps */}
          <div className="rounded-xl border border-primary/20 bg-info-soft/40 p-3.5 space-y-2 text-[11px] text-muted-foreground">
            <p className="font-bold text-foreground flex items-center gap-1.5">
              <HelpCircle className="h-3.5 w-3.5 text-primary" />
              วิธีสร้าง LINE LIFF ID ใน 4 ขั้นตอน:
            </p>
            <ol className="list-decimal pl-4 space-y-1.5 leading-relaxed">
              <li>
                เปิดเว็บไซต์{" "}
                <a
                  href="https://developers.line.biz/console/"
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-primary underline inline-flex items-center gap-0.5"
                >
                  LINE Developers Console <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                สร้าง <strong>Provider</strong> และสร้าง Channel ประเภท <strong>LINE Login</strong>
              </li>
              <li>
                ไปที่แท็บ <strong>LIFF</strong> แล้วกด <strong>Add LIFF app</strong>:
                <ul className="list-disc pl-4 mt-1 space-y-0.5 text-foreground">
                  <li>
                    <strong>Size</strong>: เลือก <code>Full</code>
                  </li>
                  <li>
                    <strong>Endpoint URL</strong>: ใส่ <code>{authUrl}</code> (กดปุ่มคัดลอกด้านบน)
                  </li>
                  <li>
                    <strong>Scopes</strong>: ติ๊กเลือก <code>profile</code> และ <code>openid</code>
                  </li>
                  <li>
                    <strong>Bot link feature</strong>: On (Normal) หรือ Off ตามต้องการ
                  </li>
                </ul>
              </li>
              <li>
                คัดลอก <strong>LIFF ID</strong> ที่ได้มา วางลงในช่องด้านบน แล้วกดบันทึก
              </li>
            </ol>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between pt-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-xl border border-border bg-secondary/80 px-4 py-2 text-xs font-semibold text-foreground hover:bg-secondary transition cursor-pointer"
          >
            ปิด
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 rounded-xl bg-[#06C755] px-4 py-2 text-xs font-bold text-white hover:bg-[#05a847] shadow-sm transition active:scale-[0.99] cursor-pointer"
          >
            <Save className="h-3.5 w-3.5" />
            บันทึกการตั้งค่า LINE LIFF
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
