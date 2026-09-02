import { useMemo, useRef, useState } from "react";
import {
  Check,
  CloudDownload,
  CloudUpload,
  Download,
  FileSpreadsheet,
  MapPin,
  Pencil,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  type WorkLog,
  BREAK_OPTIONS,
  DEFAULT_SEED_LOGS,
  OT_OPTIONS,
  buildCSV,
  formatTHB,
  formatThaiDateTime,
  fromLocalInput,
  gpsFromText,
  gpsText,
  parseCSVToLogs,
  taskCount,
  toLocalInput,
} from "@/lib/work-log";

type Props = {
  logs: WorkLog[];
  syncing: boolean;
  pendingCount: number;
  categories: string[];
  onDelete: (id: string) => void;
  onSync: () => void;
  onPull: () => void;
  onUpdate: (id: string, patch: Partial<WorkLog>) => void;
  onImport?: (logs: WorkLog[]) => void;
};

type Draft = {
  inAt: string;
  outAt: string;
  workType: string;
  locationName: string;
  dailyRate: string;
  otType: string;
  breakHours: string;
  travelCost: string;
  foodCost: string;
  otherIncome: string;
  otherDeductions: string;
  gpsIn: string;
  gpsOut: string;
  tasks: string;
};

const emptyDraft: Draft = {
  inAt: "",
  outAt: "",
  workType: "",
  locationName: "",
  dailyRate: "",
  otType: "1.5",
  breakHours: "1",
  travelCost: "",
  foodCost: "",
  otherIncome: "",
  otherDeductions: "",
  gpsIn: "",
  gpsOut: "",
  tasks: "",
};

const toNum = (v: string) => {
  const n = Number(String(v).replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

const TH_MONTHS = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];

/** "2026-08" -> "สิงหาคม 2026" */
const monthLabel = (key: string) => {
  const [y, m] = key.split("-");
  const name = TH_MONTHS[Number(m) - 1] ?? m;
  return `${name} ${y}`;
};

const datePart = (v: string) => v.split("T")[0] ?? "";
const timePart = (v: string) => v.split("T")[1] ?? "";
const joinDT = (date: string, time: string) => (date && time ? `${date}T${time}` : "");

export function HistoryPanel({
  logs,
  syncing,
  pendingCount,
  categories,
  onDelete,
  onSync,
  onPull,
  onUpdate,
  onImport,
}: Props) {
  const [editing, setEditing] = useState<string | null>(null);
  const [month, setMonth] = useState("all");
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [taskSelection, setTaskSelection] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result;
      if (typeof text === "string") {
        const parsed = parseCSVToLogs(text);
        if (parsed.length === 0) {
          toast.error("ไม่พบข้อมูลที่ถูกต้องในไฟล์ CSV");
          return;
        }
        onImport?.(parsed);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const loadSeedLogs = () => {
    onImport?.(DEFAULT_SEED_LOGS);
  };

  const startEdit = (log: WorkLog) => {
    setEditing(log.id);
    setTaskSelection("");
    setDraft({
      inAt: toLocalInput(log.checkInTime),
      outAt: toLocalInput(log.checkOutTime),
      workType: log.workType ?? "",
      locationName: log.locationName ?? "",
      dailyRate: log.dailyRate !== undefined && log.dailyRate !== null ? String(log.dailyRate) : "",
      otType: String(log.otType ?? 1.5),
      breakHours: String(log.breakHours ?? 1),
      travelCost: log.travelCost ? String(log.travelCost) : "",
      foodCost: log.foodCost ? String(log.foodCost) : "",
      otherIncome: log.otherIncome ? String(log.otherIncome) : "",
      otherDeductions: log.otherDeductions ? String(log.otherDeductions) : "",
      gpsIn: gpsText(log.checkInGPS) === "-" ? "" : gpsText(log.checkInGPS),
      gpsOut: gpsText(log.checkOutGPS) === "-" ? "" : gpsText(log.checkOutGPS),
      tasks: (log.tasks ?? []).join("\n"),
    });
  };

  const taskItems = draft.tasks
    .split("\n")
    .map((task) => task.trim())
    .filter(Boolean);
  const taskOptions = [...new Set([...categories.filter(Boolean), ...taskItems])];

  const addTask = () => {
    const task = taskSelection.trim();
    if (!task) return;
    setDraft({ ...draft, tasks: [...taskItems, task].join("\n") });
    setTaskSelection("");
  };

  const removeTask = (index: number) => {
    setDraft({
      ...draft,
      tasks: taskItems.filter((_, taskIndex) => taskIndex !== index).join("\n"),
    });
  };

  const saveEdit = (id: string) => {
    const inISO = fromLocalInput(draft.inAt);
    const outISO = fromLocalInput(draft.outAt);
    if (!inISO || !outISO) return;
    onUpdate(id, {
      checkInTime: inISO,
      checkOutTime: outISO,
      workType: draft.workType.trim(),
      locationName: draft.locationName.trim(),
      dailyRate: toNum(draft.dailyRate),
      otType: draft.otType !== "" && draft.otType !== undefined ? toNum(draft.otType) : 0,
      breakHours:
        draft.breakHours !== "" && draft.breakHours !== undefined ? toNum(draft.breakHours) : 1,
      travelCost: toNum(draft.travelCost),
      foodCost: toNum(draft.foodCost),
      otherIncome: toNum(draft.otherIncome),
      otherDeductions: toNum(draft.otherDeductions),
      checkInGPS: gpsFromText(draft.gpsIn),
      checkOutGPS: gpsFromText(draft.gpsOut),
      tasks: taskItems,
    });
    setEditing(null);
  };

  /** Month keys (YYYY-MM) present in the history, newest first. */
  const months = useMemo(() => {
    const set = new Set<string>();
    for (const l of logs) {
      const key = String(l.checkInTime ?? "").slice(0, 7);
      if (key) set.add(key);
    }
    return [...set].sort().reverse();
  }, [logs]);

  const visibleLogs = useMemo(
    () =>
      month === "all" ? logs : logs.filter((l) => String(l.checkInTime ?? "").startsWith(month)),
    [logs, month],
  );

  const exportCSV = () => {
    const blob = new Blob(["\uFEFF" + buildCSV(visibleLogs)], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `work-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="surface-card flex flex-wrap items-center justify-between gap-3 p-4">
        <div>
          <h2 className="font-bold">ประวัติการทำงาน</h2>
          <p className="text-xs text-muted-foreground">
            แสดง {visibleLogs.length} จาก {logs.length} รายการ · รอซิงก์ {pendingCount} รายการ ·
            ชีตจะถูกเขียนใหม่ให้ตรงกับรายการนี้เสมอ
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label="เลือกเดือน"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="rounded-lg border border-input bg-secondary px-3 py-2 text-xs font-medium"
          >
            <option value="all">ทุกเดือน · {logs.length} รายการ</option>
            {months.map((m) => (
              <option key={m} value={m}>
                {monthLabel(m)} ·{" "}
                {logs.filter((l) => String(l.checkInTime ?? "").startsWith(m)).length} รายการ
              </option>
            ))}
          </select>
          <button
            onClick={onSync}
            disabled={syncing}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground disabled:bg-muted disabled:text-muted-foreground"
          >
            <CloudUpload className="h-4 w-4" /> {syncing ? "กำลังซิงก์…" : "ส่งขึ้นชีต"}
          </button>
          <button
            onClick={onPull}
            disabled={syncing}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium disabled:opacity-50"
          >
            <CloudDownload className="h-4 w-4" /> ดึงจากชีต
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".csv,text/csv"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium hover:bg-secondary/80"
            title="นำเข้าไฟล์ CSV ประวัติการทำงาน"
          >
            <Upload className="h-4 w-4" /> นำเข้า CSV
          </button>
          <button
            onClick={exportCSV}
            disabled={logs.length === 0}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium disabled:opacity-50"
          >
            <Download className="h-4 w-4" /> CSV
          </button>
        </div>
      </div>

      {logs.length === 0 && (
        <div className="surface-card flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-dashed border-2 border-primary/30 bg-primary/5">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            <span className="text-xs font-medium">
              มีชุดข้อมูลบันทึกงานเดือนสิงหาคม 2026 (18 รายการ) พร้อมใช้งาน
            </span>
          </div>
          <button
            onClick={loadSeedLogs}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-sm hover:opacity-90"
          >
            <Upload className="h-3.5 w-3.5" /> โหลดชุดข้อมูล 18 รายการ
          </button>
        </div>
      )}

      {visibleLogs.length === 0 ? (
        <div className="surface-card p-10 text-center text-sm text-muted-foreground">
          {logs.length === 0 ? "ยังไม่มีประวัติการทำงาน" : "ไม่มีรายการในเดือนที่เลือก"}
        </div>
      ) : (
        <div className="space-y-3" data-testid="logs-container">
          {visibleLogs.map((log) => (
            <article key={log.id} className="surface-card overflow-hidden p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{log.workType}</h3>
                    <span className="rounded-full bg-info-soft px-2 py-0.5 text-[10px] font-bold text-primary">
                      {taskCount(log)} งาน
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        log.syncedAt
                          ? "bg-success-soft text-success"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {log.syncedAt ? "ซิงก์แล้ว" : "รอซิงก์"}
                    </span>
                  </div>
                  <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" /> {log.locationName}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatThaiDateTime(log.checkInTime)} → {formatThaiDateTime(log.checkOutTime)}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-success">{formatTHB(log.netIncome)}</div>
                  <div className="mt-1 flex items-center justify-end gap-3">
                    {editing === log.id ? (
                      <>
                        <button
                          onClick={() => saveEdit(log.id)}
                          className="inline-flex items-center gap-1 text-xs text-success hover:underline"
                        >
                          <Check className="h-3.5 w-3.5" /> บันทึก
                        </button>
                        <button
                          onClick={() => setEditing(null)}
                          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:underline"
                        >
                          <X className="h-3.5 w-3.5" /> ยกเลิก
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(log)}
                          aria-label={`แก้ไขเวลา ${log.id}`}
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          <Pencil className="h-3.5 w-3.5" /> แก้ไข
                        </button>
                        <button
                          onClick={() => onDelete(log.id)}
                          aria-label={`ลบรายการ ${log.id}`}
                          className="inline-flex items-center gap-1 text-xs text-destructive hover:underline"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> ลบ
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {editing === log.id ? (
                <div className="mt-4 space-y-4 rounded-xl border border-border bg-secondary/40 p-3">
                  <section className="space-y-2">
                    <h4 className="text-xs font-bold text-primary">เวลาเข้างาน</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <Field label="วันที่เข้างาน">
                        <input
                          type="date"
                          aria-label="วันที่เข้างาน"
                          value={datePart(draft.inAt)}
                          onChange={(e) =>
                            setDraft({
                              ...draft,
                              inAt: joinDT(e.target.value, timePart(draft.inAt)),
                            })
                          }
                          className={inputCls}
                        />
                      </Field>
                      <Field label="เวลาเข้างาน">
                        <input
                          type="time"
                          aria-label="เวลาเข้างาน"
                          value={timePart(draft.inAt)}
                          onChange={(e) =>
                            setDraft({
                              ...draft,
                              inAt: joinDT(datePart(draft.inAt), e.target.value),
                            })
                          }
                          className={inputCls}
                        />
                      </Field>
                    </div>
                  </section>

                  <section className="space-y-2">
                    <h4 className="text-xs font-bold text-primary">เวลาออกงาน</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <Field label="วันที่ออกงาน">
                        <input
                          type="date"
                          aria-label="วันที่ออกงาน"
                          value={datePart(draft.outAt)}
                          onChange={(e) =>
                            setDraft({
                              ...draft,
                              outAt: joinDT(e.target.value, timePart(draft.outAt)),
                            })
                          }
                          className={inputCls}
                        />
                      </Field>
                      <Field label="เวลาออกงาน">
                        <input
                          type="time"
                          aria-label="เวลาออกงาน"
                          value={timePart(draft.outAt)}
                          onChange={(e) =>
                            setDraft({
                              ...draft,
                              outAt: joinDT(datePart(draft.outAt), e.target.value),
                            })
                          }
                          className={inputCls}
                        />
                      </Field>
                    </div>
                  </section>

                  <section className="space-y-2">
                    <h4 className="text-xs font-bold text-primary">งานและสถานที่</h4>
                    <Field label="ประเภทงาน">
                      <select
                        aria-label="ประเภทงาน"
                        value={draft.workType}
                        onChange={(e) => setDraft({ ...draft, workType: e.target.value })}
                        className={inputCls}
                      >
                        {(categories.includes(draft.workType) || !draft.workType
                          ? categories
                          : [draft.workType, ...categories]
                        ).map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="สถานที่">
                      <input
                        aria-label="สถานที่"
                        value={draft.locationName}
                        onChange={(e) => setDraft({ ...draft, locationName: e.target.value })}
                        className={inputCls}
                      />
                    </Field>
                  </section>

                  <section className="space-y-2">
                    <h4 className="text-xs font-bold text-primary">ค่าแรงและเบี้ยเลี้ยง</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <Field label="ค่าแรง/วัน (บาท)">
                        <input
                          type="number"
                          inputMode="decimal"
                          min="0"
                          step="any"
                          placeholder="0"
                          aria-label="ค่าแรงต่อวัน"
                          value={draft.dailyRate}
                          onChange={(e) => setDraft({ ...draft, dailyRate: e.target.value })}
                          className={inputCls}
                        />
                      </Field>
                      <Field label="ตัวคูณ OT">
                        <select
                          aria-label="ตัวคูณ OT"
                          value={draft.otType}
                          onChange={(e) => setDraft({ ...draft, otType: e.target.value })}
                          className={inputCls}
                        >
                          {OT_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label="หักเวลาพัก">
                        <select
                          aria-label="หักเวลาพัก"
                          value={draft.breakHours}
                          onChange={(e) => setDraft({ ...draft, breakHours: e.target.value })}
                          className={inputCls}
                        >
                          {BREAK_OPTIONS.map((b) => (
                            <option key={b.value} value={b.value}>
                              {b.label}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label="ค่าเดินทาง">
                        <input
                          type="number"
                          inputMode="decimal"
                          min="0"
                          step="any"
                          placeholder="0"
                          aria-label="ค่าเดินทาง"
                          value={draft.travelCost}
                          onChange={(e) => setDraft({ ...draft, travelCost: e.target.value })}
                          className={inputCls}
                        />
                      </Field>
                      <Field label="ค่าอาหาร">
                        <input
                          type="number"
                          inputMode="decimal"
                          min="0"
                          step="any"
                          placeholder="0"
                          aria-label="ค่าอาหาร"
                          value={draft.foodCost}
                          onChange={(e) => setDraft({ ...draft, foodCost: e.target.value })}
                          className={inputCls}
                        />
                      </Field>
                      <Field label="รายรับอื่น">
                        <input
                          type="number"
                          inputMode="decimal"
                          min="0"
                          step="any"
                          placeholder="0"
                          aria-label="รายรับอื่น"
                          value={draft.otherIncome}
                          onChange={(e) => setDraft({ ...draft, otherIncome: e.target.value })}
                          className={inputCls}
                        />
                      </Field>
                      <Field label="รายการหัก">
                        <input
                          type="number"
                          inputMode="decimal"
                          min="0"
                          step="any"
                          placeholder="0"
                          aria-label="รายการหัก"
                          value={draft.otherDeductions}
                          onChange={(e) => setDraft({ ...draft, otherDeductions: e.target.value })}
                          className={inputCls}
                        />
                      </Field>
                    </div>
                  </section>

                  <section className="space-y-2">
                    <h4 className="text-xs font-bold text-primary">พิกัด</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <Field label="พิกัดเข้า (lat, lng)">
                        <input
                          aria-label="พิกัดเข้า"
                          value={draft.gpsIn}
                          placeholder="13.7563, 100.5018"
                          onChange={(e) => setDraft({ ...draft, gpsIn: e.target.value })}
                          className={inputCls}
                        />
                      </Field>
                      <Field label="พิกัดออก (lat, lng)">
                        <input
                          aria-label="พิกัดออก"
                          value={draft.gpsOut}
                          placeholder="13.7563, 100.5018"
                          onChange={(e) => setDraft({ ...draft, gpsOut: e.target.value })}
                          className={inputCls}
                        />
                      </Field>
                    </div>
                  </section>

                  <section className="space-y-2">
                    <h4 className="text-xs font-bold text-primary">รายการงานที่ทำเสร็จ</h4>
                    <Field label="เลือกจากประเภทงาน">
                      <div className="flex gap-2">
                        <select
                          aria-label="เลือกประเภทงานที่ทำเสร็จ"
                          value={taskSelection}
                          onChange={(e) => setTaskSelection(e.target.value)}
                          className={`${inputCls} flex-1`}
                        >
                          <option value="">เลือกประเภทงาน</option>
                          {taskOptions.map((task) => (
                            <option key={task} value={task}>
                              {task}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={addTask}
                          disabled={!taskSelection}
                          className="rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          เพิ่ม
                        </button>
                      </div>
                    </Field>
                    {taskItems.length > 0 ? (
                      <ol className="space-y-1.5 rounded-lg border border-border bg-card p-2 text-sm">
                        {taskItems.map((task, index) => (
                          <li
                            key={`${task}-${index}`}
                            className="flex items-center justify-between gap-2 rounded-md border border-border/70 px-2 py-1.5"
                          >
                            <span className="min-w-0 truncate">
                              <span className="mr-2 text-xs font-bold text-muted-foreground">
                                {index + 1}.
                              </span>
                              {task}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeTask(index)}
                              aria-label={`ลบรายการงาน ${task}`}
                              className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-destructive hover:bg-destructive/10"
                            >
                              ลบ
                            </button>
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        ยังไม่มีรายการงาน — เลือกประเภทงานแล้วกดเพิ่ม
                      </p>
                    )}
                  </section>

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => saveEdit(log.id)}
                      className="flex-1 rounded-lg bg-primary py-2 text-xs font-medium text-primary-foreground"
                    >
                      บันทึกการแก้ไข
                    </button>
                    <button
                      onClick={() => setEditing(null)}
                      className="flex-1 rounded-lg border border-border py-2 text-xs font-medium"
                    >
                      ยกเลิก
                    </button>
                  </div>
                </div>
              ) : null}

              <dl className="mt-3 grid grid-cols-2 gap-2 border-t border-border pt-3 text-xs md:grid-cols-4">
                <Cell label="ชั่วโมงปกติ" value={`${log.workingHours} ชม.`} />
                <Cell label={`OT x${log.otType}`} value={`${log.otHours} ชม.`} />
                <Cell label="ค่าแรง+OT" value={formatTHB(log.baseWage + log.otIncome)} />
                <Cell
                  label="เบี้ยเลี้ยง/หัก"
                  value={`${formatTHB(log.travelCost + log.foodCost + log.otherIncome)} / ${formatTHB(log.otherDeductions)}`}
                />
                <Cell label="พิกัดเข้า" value={gpsText(log.checkInGPS)} />
                <Cell label="พิกัดออก" value={gpsText(log.checkOutGPS)} />
              </dl>

              {(log.tasks ?? []).length > 0 ? (
                <ol className="mt-3 list-decimal space-y-0.5 border-t border-border pt-3 pl-5 text-xs text-muted-foreground">
                  {(log.tasks ?? []).map((t, i) => (
                    <li key={`${t}-${i}`}>{t}</li>
                  ))}
                </ol>
              ) : null}

              {log.checkInPhoto || log.checkOutPhoto ? (
                <div className="mt-3 flex gap-2">
                  {log.checkInPhoto ? (
                    <img
                      src={log.checkInPhoto}
                      alt="หลักฐาน Check-in"
                      className="h-16 w-16 rounded-lg object-cover"
                    />
                  ) : null}
                  {log.checkOutPhoto ? (
                    <img
                      src={log.checkOutPhoto}
                      alt="หลักฐาน Check-out"
                      className="h-16 w-16 rounded-lg object-cover"
                    />
                  ) : null}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}
      <datalist id="history-work-types">
        {categories.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>
    </div>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

const inputCls = "w-full rounded-lg border border-input bg-secondary p-1.5 text-xs";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-0.5 block text-[10px] text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
