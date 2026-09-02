import { useState, useId, useRef } from "react";
import {
  CheckCircle2,
  ExternalLink,
  FilePlus2,
  Link2,
  ShieldCheck,
  RefreshCw,
  XCircle,
  Copy,
  KeyRound,
  Upload,
  Trash2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import {
  createWorkSpreadsheet,
  prepareSpreadsheet,
  testGoogleSheetsConnection,
} from "@/lib/sheets.functions";
import { callServer } from "@/lib/server-call";
import { extractSpreadsheetId, storage } from "@/lib/work-log";
import {
  allConnectionTestsPassed,
  countPassedConnectionTests,
  type ConnectionTestResult,
} from "@/lib/sheets-diagnostics";
import { getGoogleAccessToken, signInWithGoogleFirebase } from "@/lib/firebase";
import { getSheetsAuthPayload, parseServiceAccountInfo } from "@/lib/sheets-credentials";

type Props = {
  spreadsheetId: string;
  onChange: (id: string) => void;
};

export function SheetsPanel({ spreadsheetId, onChange }: Props) {
  const fileInputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [input, setInput] = useState(spreadsheetId);
  const [busy, setBusy] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<ConnectionTestResult | null>(null);
  const [title, setTitle] = useState("");
  const [hasGoogleToken, setHasGoogleToken] = useState(() => Boolean(getGoogleAccessToken()));
  const [authorizing, setAuthorizing] = useState(false);

  // Service Account state
  const [serviceAccountJson, setServiceAccountJson] = useState(() => storage.getServiceAccount());
  const [saInput, setSaInput] = useState(() => storage.getServiceAccount());
  const [showSaConfig, setShowSaConfig] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const parsedSa = parseServiceAccountInfo(serviceAccountJson);
  const hasValidSa = parsedSa.isValid;

  const url = spreadsheetId ? `https://docs.google.com/spreadsheets/d/${spreadsheetId}` : "";

  const handleCopyEmail = (email: string) => {
    if (!email) return;
    navigator.clipboard.writeText(email);
    setCopiedEmail(true);
    toast.success("คัดลอกอีเมล Service Account แล้ว", {
      description: "นำไปวางในช่อง 'แชร์' ของ Google Sheets แล้วเลือกสิทธิ์ 'Editor (ผู้แก้ไข)'",
    });
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const handleSaveServiceAccount = (jsonToSave?: string) => {
    const targetJson = jsonToSave ?? saInput;
    const trimmed = targetJson.trim();
    if (!trimmed) {
      storage.setServiceAccount("");
      setServiceAccountJson("");
      setSaInput("");
      toast.info("ล้างข้อมูล Service Account แล้ว");
      return;
    }

    const info = parseServiceAccountInfo(trimmed);
    if (!info.isValid) {
      toast.error("รูปแบบ Service Account ไม่ถูกต้อง", {
        description: info.error || "กรุณาวางเนื้อหาไฟล์ JSON ทั้งหมด",
      });
      return;
    }

    storage.setServiceAccount(trimmed);
    setServiceAccountJson(trimmed);
    setSaInput(trimmed);
    toast.success("บันทึก Service Account สำเร็จ!", {
      description: `บอทอีเมล: ${info.clientEmail}`,
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setSaInput(content);
        handleSaveServiceAccount(content);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClearServiceAccount = () => {
    storage.setServiceAccount("");
    setServiceAccountJson("");
    setSaInput("");
    toast.info("ลบ Service Account แล้ว");
  };

  const authorizeGoogle = async (): Promise<string | null> => {
    setAuthorizing(true);
    try {
      await signInWithGoogleFirebase();
      const token = getGoogleAccessToken();
      setHasGoogleToken(Boolean(token));
      if (token) {
        toast.success("เชื่อมต่อบัญชี Google สำเร็จ");
      }
      return token;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg !== "REDIRECTING") {
        toast.error("เข้าสู่ระบบ Google ไม่สำเร็จ", { description: msg });
      }
      return null;
    } finally {
      setAuthorizing(false);
    }
  };

  const ensureAuthCredentials = async () => {
    const currentPayload = getSheetsAuthPayload();
    if (currentPayload.serviceAccountJson || currentPayload.accessToken) {
      return currentPayload;
    }

    // Prompt user to connect
    toast.info("กำลังเปิดหน้าต่างเข้าสู่ระบบ Google...");
    const token = await authorizeGoogle();
    return {
      accessToken: token ?? undefined,
      serviceAccountJson: storage.getServiceAccount() || undefined,
    };
  };

  const connect = async () => {
    const id = extractSpreadsheetId(input);
    if (!id || id.length < 10) {
      toast.error("กรุณาวางลิงก์หรือ ID ของ Google Sheets");
      return;
    }
    setBusy(true);
    try {
      const authPayload = await ensureAuthCredentials();
      const res = await callServer(prepareSpreadsheet, {
        data: { spreadsheetId: id, ...authPayload },
      });
      onChange(res.spreadsheetId);
      setInput(res.spreadsheetId);
      setTitle(res.title ?? "");
      toast.success("เชื่อมต่อชีตสำเร็จ!", { description: res.title });
    } catch (err) {
      toast.error("เชื่อมต่อไม่สำเร็จ", {
        description: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setBusy(false);
    }
  };

  const createNew = async () => {
    setBusy(true);
    try {
      const authPayload = await ensureAuthCredentials();
      const res = await callServer(createWorkSpreadsheet, {
        data: {
          title: `Work Tracker ${new Date().getFullYear()}`,
          ...authPayload,
        },
      });
      onChange(res.spreadsheetId);
      setInput(res.spreadsheetId);
      setTitle(res.title ?? "");
      toast.success("สร้างสเปรดชีตใหม่แล้ว!", { description: res.title });
    } catch (err) {
      toast.error("สร้างสเปรดชีตไม่สำเร็จ", {
        description: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setBusy(false);
    }
  };

  const runConnectionTest = async () => {
    const id = extractSpreadsheetId(spreadsheetId || input);
    if (!id || id.length < 10) {
      toast.error("กรุณาระบุ Spreadsheet ID หรือเชื่อมต่อชีตก่อนทดสอบ");
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      const authPayload = await ensureAuthCredentials();
      const res = await callServer(testGoogleSheetsConnection, {
        data: { spreadsheetId: id, ...authPayload },
      });
      setTestResult(res);
      const passed = countPassedConnectionTests(res);
      if (allConnectionTestsPassed(res)) {
        toast.success("🎉 ทดสอบการเชื่อมต่อ Google Sheets ผ่านครบ 8/8 ขั้นตอน!");
      } else {
        toast.error(`การทดสอบผ่าน ${passed}/8 ขั้นตอน`, {
          description: res.errorDetails || "ตรวจสอบรายละเอียดด้านล่างเพื่อแก้ไข",
        });
      }
    } catch (err) {
      toast.error("การทดสอบการเชื่อมต่อขัดข้อง", {
        description: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setTesting(false);
    }
  };

  const renderStatus = (passed: boolean) =>
    passed ? (
      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
        <CheckCircle2 className="h-4 w-4" /> ผ่าน
      </span>
    ) : (
      <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-semibold text-xs">
        <XCircle className="h-4 w-4" /> ไม่ผ่าน
      </span>
    );

  const hasAnyAuth = hasValidSa || hasGoogleToken;

  return (
    <div className="surface-card min-w-0 space-y-4 p-4 sm:p-5">
      {/* Header */}
      <div className="flex min-w-0 flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="font-bold text-base flex items-center gap-2">
            บันทึกลง Google Sheets
            {spreadsheetId && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3 w-3" /> เชื่อมต่อแล้ว
              </span>
            )}
          </h2>
          <p className="text-xs text-muted-foreground">
            ทุกครั้งที่บันทึกหรือ Check-out ระบบจะซิงค์ข้อมูลไปยังชีต “WorkLogs” อัตโนมัติ
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {hasValidSa && (
            <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <KeyRound className="h-3.5 w-3.5" /> Service Account พร้อมใช้งาน
            </span>
          )}
          {hasGoogleToken && !hasValidSa && (
            <span className="flex items-center gap-1 rounded-full bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 text-xs font-medium text-blue-600 dark:text-blue-400">
              <CheckCircle2 className="h-3.5 w-3.5" /> Google Login พร้อมใช้งาน
            </span>
          )}
        </div>
      </div>

      {/* Primary Authentication Options Section */}
      <div className="rounded-xl border border-border/80 bg-secondary/30 p-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-primary" />
            <h3 className="text-xs font-semibold text-foreground">
              ช่องทางการยืนยันตัวตน (Authentication)
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setShowSaConfig(!showSaConfig)}
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            {showSaConfig ? (
              <>
                <ChevronUp className="h-3.5 w-3.5" /> ซ่อนการตั้งค่า Key
              </>
            ) : (
              <>
                <ChevronDown className="h-3.5 w-3.5" /> ตั้งค่า Service Account Key
              </>
            )}
          </button>
        </div>

        {/* Quick Service Account Info Banner if configured */}
        {hasValidSa && parsedSa.clientEmail && (
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="min-w-0 space-y-0.5">
                <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" /> อีเมล Service Account
                  (บอทสำหรับแชร์ในชีต):
                </p>
                <p className="text-xs font-mono font-medium text-foreground break-all select-all bg-background/80 px-2 py-1 rounded border border-border/60">
                  {parsedSa.clientEmail}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleCopyEmail(parsedSa.clientEmail!)}
                className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 transition active:scale-95"
              >
                {copiedEmail ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedEmail ? "คัดลอกแล้ว!" : "คัดลอกอีเมลบอท"}
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
              <AlertCircle className="h-3 w-3 text-amber-500 shrink-0" />
              <strong>สำคัญ:</strong> อย่าลืมเปิด Google Sheet ของคุณ แล้วกดปุ่ม{" "}
              <strong>"แชร์ (Share)"</strong> เพิ่มอีเมลนี้เป็น <strong>Editor (ผู้แก้ไข)</strong>
            </p>
          </div>
        )}

        {/* Collapsible Service Account JSON Form */}
        {(showSaConfig || !hasAnyAuth) && (
          <div className="space-y-2.5 pt-1 border-t border-border/60">
            <div className="flex items-center justify-between">
              <label htmlFor="sa-json-input" className="text-xs font-medium text-foreground">
                วาง Service Account JSON Key (หรืออัปโหลดไฟล์ .json):
              </label>
              <div className="flex items-center gap-2">
                <input
                  id={fileInputId}
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
                >
                  <Upload className="h-3 w-3" /> อัปโหลดไฟล์ .json
                </button>
                {serviceAccountJson && (
                  <button
                    type="button"
                    onClick={handleClearServiceAccount}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-destructive hover:underline"
                  >
                    <Trash2 className="h-3 w-3" /> ลบ Key
                  </button>
                )}
              </div>
            </div>

            <textarea
              id="sa-json-input"
              rows={3}
              value={saInput}
              onChange={(e) => setSaInput(e.target.value)}
              placeholder='วางเนื้อหา JSON เช่น {"type": "service_account", "project_id": "...", "private_key": "...", "client_email": "..."}'
              className="w-full rounded-lg border border-input bg-background p-2 text-xs font-mono resize-y focus:outline-none focus:ring-1 focus:ring-primary"
            />

            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setShowGuide(!showGuide)}
                className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <HelpCircle className="h-3.5 w-3.5" />
                {showGuide ? "ซ่อนวิธีสร้าง Service Account" : "วิธีสร้าง Service Account (3 นาที)"}
              </button>

              <button
                type="button"
                onClick={() => handleSaveServiceAccount()}
                className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
              >
                บันทึก Key
              </button>
            </div>

            {/* Guide details */}
            {showGuide && (
              <div className="rounded-lg bg-muted/60 p-3 text-[11px] text-muted-foreground space-y-1.5 border border-border/60">
                <p className="font-semibold text-foreground">
                  📌 ขั้นตอนสร้าง Service Account ฟรี:
                </p>
                <ol className="list-decimal list-inside space-y-1 pl-1">
                  <li>
                    ไปที่{" "}
                    <a
                      href="https://console.cloud.google.com"
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary underline inline-flex items-center gap-0.5"
                    >
                      Google Cloud Console <ExternalLink className="h-2.5 w-2.5" />
                    </a>{" "}
                    และสร้างโปรเจกต์ใหม่ (หรือเลือกโปรเจกต์เดิม)
                  </li>
                  <li>
                    ไปที่ <strong>APIs & Services &gt; Library</strong> แล้วค้นหา{" "}
                    <strong>Google Sheets API</strong> แล้วกด <strong>Enable</strong>
                  </li>
                  <li>
                    ไปที่ <strong>IAM & Admin &gt; Service Accounts</strong> &gt; กด{" "}
                    <strong>Create Service Account</strong>
                  </li>
                  <li>
                    คลิกที่ Service Account ที่สร้าง &gt; ไปที่แท็บ <strong>Keys</strong> &gt;{" "}
                    <strong>Add Key &gt; Create new key (JSON)</strong>
                  </li>
                  <li>
                    นำไฟล์ <code>.json</code> ที่ได้มาอัปโหลดหรือเปิดก๊อปปี้ข้อความมาวางที่นี่
                  </li>
                </ol>
              </div>
            )}
          </div>
        )}

        {/* Alternative: Google Login */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-border/60 text-xs">
          <div className="text-muted-foreground">
            {hasGoogleToken ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                ✓ บัญชี Google Login เชื่อมต่อเรียบร้อย
              </span>
            ) : (
              <span>หรือใช้การเข้าสู่ระบบ Google ชั่วคราว (OAuth):</span>
            )}
          </div>
          <button
            type="button"
            onClick={() => void authorizeGoogle()}
            disabled={authorizing}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary disabled:opacity-50 transition"
          >
            <RefreshCw className={`h-3 w-3 ${authorizing ? "animate-spin" : ""}`} />
            {authorizing
              ? "กำลังเข้าสู่ระบบ..."
              : hasGoogleToken
                ? "สลับ/รีเฟรชบัญชี Google"
                : "เข้าสู่ระบบด้วย Google"}
          </button>
        </div>
      </div>

      {/* Spreadsheet URL / ID Input Section */}
      <div className="space-y-2">
        <label htmlFor="spreadsheet-input" className="text-xs font-semibold text-foreground">
          ลิงก์หรือ Spreadsheet ID ของ Google Sheets
        </label>
        <div className="flex flex-col gap-2 md:flex-row">
          <input
            id="spreadsheet-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="วางลิงก์ Google Sheets เช่น https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit"
            aria-label="Google Sheets URL หรือ ID"
            className="min-w-0 w-full rounded-lg border border-input bg-background p-2.5 text-xs sm:text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            type="button"
            onClick={connect}
            disabled={busy}
            className="flex w-full shrink-0 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-xs sm:text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60 md:w-auto transition"
          >
            <Link2 className="h-4 w-4" /> {busy ? "กำลังเชื่อมต่อ..." : "เชื่อมต่อชีต"}
          </button>
          <button
            type="button"
            onClick={createNew}
            disabled={busy}
            className="flex w-full shrink-0 items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-4 py-2.5 text-xs sm:text-sm font-medium hover:bg-secondary disabled:opacity-60 md:w-auto transition"
          >
            <FilePlus2 className="h-4 w-4" /> สร้างชีตใหม่
          </button>
        </div>
      </div>

      {/* Connected Sheet Info & Test Button */}
      <div className="flex min-w-0 flex-col items-stretch gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
        {spreadsheetId ? (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-w-0 max-w-full items-center gap-1.5 break-all text-xs font-medium text-primary hover:underline"
          >
            <ExternalLink className="h-3.5 w-3.5 shrink-0" />
            <span>เปิด Google Sheet: {title || spreadsheetId}</span>
          </a>
        ) : (
          <span className="text-xs text-muted-foreground">ยังไม่ได้เชื่อมต่อ Spreadsheet</span>
        )}

        <button
          type="button"
          onClick={runConnectionTest}
          disabled={testing}
          className="flex w-full shrink-0 items-center justify-center gap-1.5 rounded-lg border border-border bg-secondary px-3.5 py-2 text-center text-xs font-medium hover:bg-secondary/80 disabled:opacity-60 sm:w-auto transition"
        >
          {testing ? (
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
          )}
          {testing ? "กำลังทดสอบการเชื่อมต่อ..." : "ทดสอบการเชื่อมต่อ (Diagnostic Test)"}
        </button>
      </div>

      {/* Diagnostics Test Results */}
      {testResult && (
        <div className="mt-3 min-w-0 rounded-xl border border-border bg-card p-4 text-xs space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-border/60 pb-2">
            <h3 className="font-semibold text-xs sm:text-sm flex items-center gap-1.5 text-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" /> ผลการทดสอบ Google Sheets (8 ขั้นตอน)
            </h3>
            <span
              className={`font-semibold text-xs px-2 py-0.5 rounded-full ${
                allConnectionTestsPassed(testResult)
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
              }`}
            >
              ผ่าน {countPassedConnectionTests(testResult)}/8 ขั้นตอน
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="flex justify-between items-center p-2 rounded-lg bg-secondary/50">
              <span className="text-muted-foreground">1. Google Account Token:</span>
              {renderStatus(testResult.googleAccount)}
            </div>
            <div className="flex justify-between items-center p-2 rounded-lg bg-secondary/50">
              <span className="text-muted-foreground">2. Service Account Key:</span>
              {renderStatus(testResult.serviceAccount)}
            </div>
            <div className="flex justify-between items-center p-2 rounded-lg bg-secondary/50">
              <span className="text-muted-foreground">3. รูปแบบ Spreadsheet ID:</span>
              {renderStatus(testResult.spreadsheetId)}
            </div>
            <div className="flex justify-between items-center p-2 rounded-lg bg-secondary/50">
              <span className="text-muted-foreground">4. สิทธิ์เข้าถึง Spreadsheet (Meta):</span>
              {renderStatus(testResult.spreadsheetAccess)}
            </div>
            <div className="flex justify-between items-center p-2 rounded-lg bg-secondary/50">
              <span className="text-muted-foreground">5. อ่านข้อมูลชีต WorkLogs (Read):</span>
              {renderStatus(testResult.readTest)}
            </div>
            <div className="flex justify-between items-center p-2 rounded-lg bg-secondary/50">
              <span className="text-muted-foreground">6. ทดสอบเขียนข้อมูล (Write):</span>
              {renderStatus(testResult.writeTest)}
            </div>
            <div className="flex justify-between items-center p-2 rounded-lg bg-secondary/50">
              <span className="text-muted-foreground">7. ทดสอบแก้ไขเซลล์ (Update):</span>
              {renderStatus(testResult.updateTest)}
            </div>
            <div className="flex justify-between items-center p-2 rounded-lg bg-secondary/50">
              <span className="text-muted-foreground">8. ล้างข้อมูลทดสอบ (Cleanup):</span>
              {renderStatus(testResult.deleteTest)}
            </div>
          </div>

          {testResult.errorDetails && (
            <div className="mt-2 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-destructive text-xs space-y-1">
              <p className="font-semibold flex items-center gap-1">
                <AlertCircle className="h-4 w-4" /> รายละเอียดข้อผิดพลาด:
              </p>
              <p className="font-mono text-[11px] leading-relaxed break-all">
                {testResult.errorDetails}
              </p>
              {testResult.errorDetails.includes("403") && (
                <div className="mt-2 rounded bg-background/80 p-2 text-foreground text-[11px]">
                  💡 <strong>คำแนะนำแก้ไข 403:</strong> เปิดชีตใน Google Sheets &gt; กดปุ่ม{" "}
                  <strong>แชร์</strong> ด้านบนขวา &gt; เพิ่มอีเมลบอท Service Account
                  หรืออีเมลของคุณให้เป็น <strong>Editor (ผู้แก้ไข)</strong>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
