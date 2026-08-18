import { useState } from "react";
import {
  CheckCircle2,
  ExternalLink,
  FilePlus2,
  Link2,
  ShieldCheck,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  createWorkSpreadsheet,
  prepareSpreadsheet,
  testGoogleSheetsConnection,
} from "@/lib/sheets.functions";
import { callServer } from "@/lib/server-call";
import { extractSpreadsheetId } from "@/lib/work-log";
import {
  allConnectionTestsPassed,
  countPassedConnectionTests,
  type ConnectionTestResult,
} from "@/lib/sheets-diagnostics";

type Props = {
  spreadsheetId: string;
  onChange: (id: string) => void;
};

export function SheetsPanel({ spreadsheetId, onChange }: Props) {
  const [input, setInput] = useState(spreadsheetId);
  const [busy, setBusy] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<ConnectionTestResult | null>(null);
  const [title, setTitle] = useState("");

  const url = spreadsheetId ? `https://docs.google.com/spreadsheets/d/${spreadsheetId}` : "";

  const connect = async () => {
    const id = extractSpreadsheetId(input);
    if (!id || id.length < 10) {
      toast.error("กรุณาวางลิงก์หรือ ID ของ Google Sheets");
      return;
    }
    setBusy(true);
    try {
      const res = await callServer(prepareSpreadsheet, { data: { spreadsheetId: id } });
      onChange(res.spreadsheetId);
      setInput(res.spreadsheetId);
      setTitle(res.title ?? "");
      toast.success("เชื่อมต่อชีตสำเร็จ", { description: res.title });
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
      const res = await callServer(createWorkSpreadsheet, {
        data: { title: `Work Tracker ${new Date().getFullYear()}` },
      });
      onChange(res.spreadsheetId);
      setInput(res.spreadsheetId);
      setTitle(res.title ?? "");
      toast.success("สร้างสเปรดชีตใหม่แล้ว", { description: res.title });
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
      const res = await callServer(testGoogleSheetsConnection, { data: { spreadsheetId: id } });
      setTestResult(res);
      const passed = countPassedConnectionTests(res);
      if (allConnectionTestsPassed(res)) {
        toast.success("ทดสอบการเชื่อมต่อ Google Sheets ผ่านครบ 8 ขั้นตอน");
      } else {
        toast.error(`การทดสอบผ่าน ${passed}/8 ขั้นตอน`, {
          description: res.errorDetails || "เปิดรายละเอียดในผลการทดสอบเพื่อดูขั้นตอนที่ไม่ผ่าน",
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
      <span className="flex items-center gap-1 text-success font-semibold">
        <CheckCircle2 className="h-4 w-4" /> ✅ ผ่าน
      </span>
    ) : (
      <span className="flex items-center gap-1 text-destructive font-semibold">
        <XCircle className="h-4 w-4" /> ❌ ไม่ผ่าน
      </span>
    );

  return (
    <div className="surface-card min-w-0 space-y-4 p-4 sm:p-5">
      <div className="flex min-w-0 flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="font-bold text-base">บันทึกลง Google Sheets</h2>
          <p className="text-xs text-muted-foreground">
            ทุกครั้งที่ Check-out ระบบจะส่งข้อมูลไปยังชีต “WorkLogs” อัตโนมัติ
          </p>
        </div>
        {spreadsheetId ? (
          <span className="flex items-center gap-1 rounded-full bg-success-soft px-2.5 py-1 text-xs font-medium text-success">
            <CheckCircle2 className="h-3.5 w-3.5" /> เชื่อมต่อแล้ว
          </span>
        ) : null}
      </div>

      <div className="flex flex-col gap-2 md:flex-row">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="วางลิงก์ Google Sheets หรือ Spreadsheet ID"
          aria-label="Google Sheets URL หรือ ID"
          className="min-w-0 w-full rounded-lg border border-input bg-secondary p-2.5 text-sm"
        />
        <button
          onClick={connect}
          disabled={busy}
          className="flex w-full shrink-0 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60 md:w-auto"
        >
          <Link2 className="h-4 w-4" /> เชื่อมต่อ
        </button>
        <button
          onClick={createNew}
          disabled={busy}
          className="flex w-full shrink-0 items-center justify-center gap-1.5 rounded-lg border border-border px-4 py-2.5 text-sm font-medium disabled:opacity-60 hover:bg-secondary/80 md:w-auto"
        >
          <FilePlus2 className="h-4 w-4" /> สร้างชีตใหม่
        </button>
      </div>

      <div className="flex min-w-0 flex-col items-stretch gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
        {spreadsheetId ? (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-w-0 max-w-full items-start gap-1 break-all text-xs text-primary hover:underline"
          >
            <ExternalLink className="h-3.5 w-3.5" /> เปิดชีต {title || spreadsheetId}
          </a>
        ) : (
          <span className="text-xs text-muted-foreground">ยังไม่ได้ระบุ Spreadsheet ID</span>
        )}
        <button
          onClick={runConnectionTest}
          disabled={testing}
          className="flex w-full shrink-0 items-center justify-center gap-1.5 rounded-lg border border-border bg-secondary px-3 py-2 text-center text-xs font-medium whitespace-normal hover:bg-secondary/80 disabled:opacity-60 sm:w-auto"
        >
          {testing ? (
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <ShieldCheck className="h-3.5 w-3.5" />
          )}
          {testing ? "กำลังทดสอบ..." : "ทดสอบการเชื่อมต่อ (Connection Test)"}
        </button>
      </div>

      {testResult && (
        <div className="mt-3 min-w-0 rounded-lg border border-border bg-card p-4 text-xs space-y-2">
          <h3 className="font-semibold text-sm mb-2 flex items-center gap-1.5 text-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" /> ผลการทดสอบ Google Sheets Connection
            Suite
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="flex justify-between items-center p-1.5 rounded bg-secondary/50">
              <span>Google API Authentication:</span>
              {renderStatus(testResult.googleAccount)}
            </div>
            <div className="flex justify-between items-center p-1.5 rounded bg-secondary/50">
              <span>Service Account Credentials:</span>
              {renderStatus(testResult.serviceAccount)}
            </div>
            <div className="flex justify-between items-center p-1.5 rounded bg-secondary/50">
              <span>Spreadsheet ID Validity:</span>
              {renderStatus(testResult.spreadsheetId)}
            </div>
            <div className="flex justify-between items-center p-1.5 rounded bg-secondary/50">
              <span>Spreadsheet Access (Meta):</span>
              {renderStatus(testResult.spreadsheetAccess)}
            </div>
            <div className="flex justify-between items-center p-1.5 rounded bg-secondary/50">
              <span>Read Test (WorkLogs):</span>
              {renderStatus(testResult.readTest)}
            </div>
            <div className="flex justify-between items-center p-1.5 rounded bg-secondary/50">
              <span>Write Test (Temporary Sheet):</span>
              {renderStatus(testResult.writeTest)}
            </div>
            <div className="flex justify-between items-center p-1.5 rounded bg-secondary/50">
              <span>Update Test (Cell Edit):</span>
              {renderStatus(testResult.updateTest)}
            </div>
            <div className="flex justify-between items-center p-1.5 rounded bg-secondary/50">
              <span>Delete / Cleanup Test:</span>
              {renderStatus(testResult.deleteTest)}
            </div>
          </div>
          {testResult.errorDetails && (
            <div className="mt-2 rounded bg-destructive/10 p-2 text-destructive text-[11px]">
              <strong>ข้อผิดพลาดที่พบ:</strong> {testResult.errorDetails}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
