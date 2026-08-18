import {
  CalendarCheck,
  Clock,
  Coins,
  ListChecks,
  MinusCircle,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { type WorkLog, formatTHB, summarizeMonth } from "@/lib/work-log";

const axisTick = { fill: "var(--muted-foreground)", fontSize: 11 };
const tooltipStyle = {
  backgroundColor: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: "0.75rem",
  color: "var(--popover-foreground)",
  fontSize: "12px",
};
const tooltipCursor = { fill: "color-mix(in oklab, var(--muted-foreground) 12%, transparent)" };

const PIE_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

type Props = {
  logs: WorkLog[];
  chartColors?: string[];
  month: string;
  onMonthChange: (m: string) => void;
  spreadsheetId?: string;
  syncing?: boolean;
  onRefresh?: () => void;
};

export function DashboardPanel({
  logs,
  chartColors,
  month,
  onMonthChange,
  spreadsheetId,
  syncing,
  onRefresh,
}: Props) {
  const s = summarizeMonth(logs, month);
  const colors = chartColors?.length
    ? chartColors
    : ["#60a5fa", "#34d399", "#fbbf24", "#f87171", "#a78bfa"];

  return (
    <div className="space-y-5">
      <section className="surface-card mx-auto max-w-3xl p-4 sm:p-5">
        <header className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h2 className="font-bold">สรุปรายเดือน</h2>
            <p className="text-xs text-muted-foreground">
              {spreadsheetId
                ? syncing
                  ? "กำลังดึงข้อมูลจาก Google Sheets…"
                  : "ข้อมูลดึงจาก Google Sheets"
                : "ยังไม่ได้เชื่อมต่อ Google Sheets — แสดงข้อมูลในเครื่อง"}
            </p>
          </div>
          <DashboardControls
            spreadsheetId={spreadsheetId}
            syncing={syncing}
            onRefresh={onRefresh}
            month={month}
            onMonthChange={onMonthChange}
          />
        </header>

        <div className="mt-5 flex flex-col items-center rounded-xl bg-secondary/60 p-4 text-center sm:p-5">
          <div className="flex items-center justify-center gap-1.5 text-xs leading-5 text-muted-foreground">
            <Coins className="h-4 w-4" />
            รายได้สุทธิรวม
          </div>
          <div
            className="mt-1 break-words text-3xl leading-tight font-bold text-success sm:text-4xl"
            data-testid="stat-net"
          >
            {formatTHB(s.totalNet)}
          </div>
        </div>

        <SummarySection title="บันทึกการทำงาน">
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Stat
                compact
                icon={<CalendarCheck className="h-4 w-4" />}
                label="วันทำงานทั้งหมด"
                value={`${s.workDays} วัน`}
                testId="stat-days"
              />
              <Stat
                compact
                icon={<TrendingUp className="h-4 w-4" />}
                label="วันที่มี OT"
                value={`${s.daysWithOt} วัน`}
                testId="stat-days-with-ot"
              />
              <Stat
                compact
                icon={<CalendarCheck className="h-4 w-4" />}
                label="วันที่ไม่มี OT"
                value={`${s.daysWithoutOt} วัน`}
                testId="stat-days-without-ot"
              />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Stat
                compact
                icon={<ListChecks className="h-4 w-4" />}
                label="งานที่ทำเสร็จ"
                value={`${s.totalTasks} งาน`}
                testId="stat-tasks"
              />
              <Stat
                compact
                icon={<ListChecks className="h-4 w-4" />}
                label="เฉลี่ยต่อวัน"
                value={`${s.avgTasksPerDay} งาน/วัน`}
                testId="stat-tasks-avg"
              />
              <Stat
                compact
                icon={<Clock className="h-4 w-4" />}
                label="ชั่วโมงรวม"
                value={`${s.totalHours.toFixed(1)} ชม.`}
                testId="stat-hours"
              />
            </div>
          </div>
        </SummarySection>

        <SummarySection title="รายรับเสริมและรายการหัก">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Stat
              compact
              icon={<TrendingUp className="h-4 w-4" />}
              label={`OT ${s.totalOtHours.toFixed(1)} ชม.`}
              value={formatTHB(s.totalOtIncome)}
              testId="stat-ot"
            />
            <Stat
              compact
              icon={<Coins className="h-4 w-4" />}
              label="เบี้ยเลี้ยง/รายรับอื่น"
              value={formatTHB(s.totalAllowances)}
              testId="stat-allowance"
            />
            <Stat
              compact
              icon={<MinusCircle className="h-4 w-4" />}
              label="รายการหักรวม"
              value={formatTHB(s.totalDeductions)}
              testId="stat-deduction"
              tone="destructive"
            />
          </div>
        </SummarySection>
      </section>

      <div className="surface-card p-5">
        <h3 className="mb-3 text-sm font-bold">รายได้รายวัน</h3>
        {s.dailyIncome.length === 0 ? (
          <Empty />
        ) : (
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={s.dailyIncome}>
                <XAxis dataKey="label" tick={axisTick} tickLine={false} axisLine={false} />
                <YAxis tick={axisTick} tickLine={false} axisLine={false} width={44} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  cursor={tooltipCursor}
                  formatter={(v: number) => formatTHB(v)}
                />
                <Bar dataKey="value" fill={colors[0]} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="surface-card p-5">
        <h3 className="mb-3 text-sm font-bold">จำนวนงานที่ทำเสร็จรายวัน</h3>
        {s.dailyTasks.length === 0 ? (
          <Empty />
        ) : (
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={s.dailyTasks}>
                <XAxis dataKey="label" tick={axisTick} tickLine={false} axisLine={false} />
                <YAxis
                  tick={axisTick}
                  tickLine={false}
                  axisLine={false}
                  width={30}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  cursor={tooltipCursor}
                  formatter={(v: number) => `${v} งาน`}
                />
                <Bar dataKey="value" fill={colors[2]} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="surface-card p-5">
          <h3 className="mb-3 text-sm font-bold">สัดส่วนรายได้ตามประเภทงาน</h3>
          {s.byWorkType.length === 0 ? (
            <Empty />
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={s.byWorkType}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={80}
                    stroke="var(--card)"
                    label={{ fill: "var(--foreground)", fontSize: 11 }}
                  >
                    {s.byWorkType.map((_, i) => (
                      <Cell key={i} fill={colors[i % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={tooltipStyle}
                    cursor={tooltipCursor}
                    formatter={(v: number) => formatTHB(v)}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="surface-card p-5">
          <h3 className="mb-3 text-sm font-bold">สถานที่ทำงานบ่อยที่สุด (ครั้ง)</h3>
          {s.byLocation.length === 0 ? (
            <Empty />
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={s.byLocation} layout="vertical">
                  <XAxis type="number" tick={axisTick} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" width={90} tick={axisTick} />
                  <Tooltip contentStyle={tooltipStyle} cursor={tooltipCursor} />
                  <Bar dataKey="value" fill={colors[1]} radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Empty() {
  return (
    <p className="py-10 text-center text-xs text-muted-foreground">ไม่มีข้อมูลในเดือนที่เลือก</p>
  );
}

function DashboardControls({
  spreadsheetId,
  syncing,
  onRefresh,
  month,
  onMonthChange,
}: {
  spreadsheetId?: string;
  syncing?: boolean;
  onRefresh?: () => void;
  month: string;
  onMonthChange: (month: string) => void;
}) {
  return (
    <div className="flex w-full flex-wrap items-center justify-start gap-2 sm:w-auto sm:justify-end">
      {spreadsheetId ? (
        <button
          type="button"
          onClick={onRefresh}
          disabled={syncing}
          data-testid="dashboard-refresh"
          className="flex items-center justify-center gap-1.5 rounded-lg border border-input bg-secondary px-3 py-2 text-xs font-medium transition hover:bg-accent disabled:opacity-60"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
          รีเฟรชจากชีต
        </button>
      ) : null}
      <input
        type="month"
        aria-label="เลือกเดือน"
        value={month}
        onChange={(e) => onMonthChange(e.target.value)}
        className="min-w-0 rounded-lg border border-input bg-secondary p-2 text-sm font-medium sm:w-auto"
      />
    </div>
  );
}

function SummarySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-5 border-t border-border pt-4">
      <h3 className="mb-3 text-xs font-bold text-muted-foreground">{title}</h3>
      {children}
    </section>
  );
}

function Stat({
  icon,
  label,
  value,
  testId,
  tone,
  compact = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  testId: string;
  tone?: "success" | "destructive";
  compact?: boolean;
}) {
  const toneCls =
    tone === "success"
      ? "text-success"
      : tone === "destructive"
        ? "text-destructive"
        : "text-foreground";
  return (
    <div className={`surface-card min-w-0 ${compact ? "p-3" : "p-4"}`}>
      <div className="flex min-w-0 items-start gap-1.5 text-xs leading-5 text-muted-foreground">
        {icon}
        <span className="min-w-0 break-words">{label}</span>
      </div>
      <div
        className={`mt-1 break-words text-xl leading-tight font-bold ${toneCls}`}
        data-testid={testId}
      >
        {value}
      </div>
    </div>
  );
}
