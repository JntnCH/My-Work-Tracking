/* eslint-disable react-refresh/only-export-components -- shared renderer factory intentionally exports render helpers. */
import { CalendarCheck, Clock, Coins, ListChecks, MinusCircle, TrendingUp } from "lucide-react";
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
import { formatTHB, type MonthlySummary } from "@/lib/work-log";
import type { DashboardCardId } from "@/lib/dashboard-layout";
import type { ReactNode } from "react";

const axisTick = { fill: "var(--muted-foreground)", fontSize: 11 };
const tooltipStyle = {
  backgroundColor: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: "0.75rem",
  color: "var(--popover-foreground)",
  fontSize: "12px",
};
const tooltipCursor = { fill: "color-mix(in oklab, var(--muted-foreground) 12%, transparent)" };

export const DEFAULT_CHART_COLORS = ["#60a5fa", "#34d399", "#fbbf24", "#f87171", "#a78bfa"];

export function renderDashboardCardContent(
  id: DashboardCardId,
  summary: MonthlySummary,
  chartColors: string[] = DEFAULT_CHART_COLORS,
): ReactNode {
  const colors = chartColors.length ? chartColors : DEFAULT_CHART_COLORS;

  switch (id) {
    case "net-income":
      return (
        <div className="flex h-full min-h-24 flex-col items-center justify-center rounded-xl bg-secondary/60 p-4 text-center sm:p-5">
          <div className="flex items-center justify-center gap-1.5 text-xs leading-5 text-muted-foreground">
            <Coins className="h-4 w-4" />
            รายได้สุทธิรวม
          </div>
          <div
            className="mt-1 break-words text-3xl leading-tight font-bold text-success sm:text-4xl"
            data-testid="stat-net"
          >
            {formatTHB(summary.totalNet)}
          </div>
        </div>
      );
    case "work-days":
      return (
        <Stat
          compact
          icon={<CalendarCheck className="h-4 w-4" />}
          label="วันทำงานทั้งหมด"
          value={`${summary.workDays} วัน`}
          testId="stat-days"
        />
      );
    case "days-with-ot":
      return (
        <Stat
          compact
          icon={<TrendingUp className="h-4 w-4" />}
          label="วันที่มี OT"
          value={`${summary.daysWithOt} วัน`}
          testId="stat-days-with-ot"
        />
      );
    case "days-without-ot":
      return (
        <Stat
          compact
          icon={<CalendarCheck className="h-4 w-4" />}
          label="วันที่ไม่มี OT"
          value={`${summary.daysWithoutOt} วัน`}
          testId="stat-days-without-ot"
        />
      );
    case "tasks":
      return (
        <Stat
          compact
          icon={<ListChecks className="h-4 w-4" />}
          label="งานที่ทำเสร็จ"
          value={`${summary.totalTasks} งาน`}
          testId="stat-tasks"
        />
      );
    case "tasks-average":
      return (
        <Stat
          compact
          icon={<ListChecks className="h-4 w-4" />}
          label="เฉลี่ยต่อวัน"
          value={`${summary.avgTasksPerDay} งาน/วัน`}
          testId="stat-tasks-avg"
        />
      );
    case "hours":
      return (
        <Stat
          compact
          icon={<Clock className="h-4 w-4" />}
          label="ชั่วโมงรวม"
          value={`${summary.totalHours.toFixed(1)} ชม.`}
          testId="stat-hours"
        />
      );
    case "ot-income":
      return (
        <Stat
          compact
          icon={<TrendingUp className="h-4 w-4" />}
          label={`OT ${summary.totalOtHours.toFixed(1)} ชม.`}
          value={formatTHB(summary.totalOtIncome)}
          testId="stat-ot"
        />
      );
    case "allowance":
      return (
        <Stat
          compact
          icon={<Coins className="h-4 w-4" />}
          label="เบี้ยเลี้ยง/รายรับอื่น"
          value={formatTHB(summary.totalAllowances)}
          testId="stat-allowance"
        />
      );
    case "deductions":
      return (
        <Stat
          compact
          icon={<MinusCircle className="h-4 w-4" />}
          label="รายการหักรวม"
          value={formatTHB(summary.totalDeductions)}
          testId="stat-deduction"
          tone="destructive"
        />
      );
    case "daily-income":
      return (
        <ChartCard title="รายได้รายวัน">
          {summary.dailyIncome.length === 0 ? (
            <Empty />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary.dailyIncome}>
                <XAxis dataKey="label" tick={axisTick} tickLine={false} axisLine={false} />
                <YAxis tick={axisTick} tickLine={false} axisLine={false} width={44} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  cursor={tooltipCursor}
                  formatter={(value: number) => formatTHB(value)}
                />
                <Bar dataKey="value" fill={colors[0]} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      );
    case "daily-tasks":
      return (
        <ChartCard title="จำนวนงานที่ทำเสร็จรายวัน">
          {summary.dailyTasks.length === 0 ? (
            <Empty />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary.dailyTasks}>
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
                  formatter={(value: number) => `${value} งาน`}
                />
                <Bar dataKey="value" fill={colors[2]} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      );
    case "work-type-income":
      return (
        <ChartCard title="สัดส่วนรายได้ตามประเภทงาน">
          {summary.byWorkType.length === 0 ? (
            <Empty />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={summary.byWorkType}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={80}
                  stroke="var(--card)"
                  label={{ fill: "var(--foreground)", fontSize: 11 }}
                >
                  {summary.byWorkType.map((_, index) => (
                    <Cell key={index} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={tooltipStyle}
                  cursor={tooltipCursor}
                  formatter={(value: number) => formatTHB(value)}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      );
    case "frequent-location":
      return (
        <ChartCard title="สถานที่ทำงานบ่อยที่สุด (ครั้ง)">
          {summary.byLocation.length === 0 ? (
            <Empty />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary.byLocation} layout="vertical">
                <XAxis type="number" tick={axisTick} allowDecimals={false} />
                <YAxis type="category" dataKey="name" width={90} tick={axisTick} />
                <Tooltip contentStyle={tooltipStyle} cursor={tooltipCursor} />
                <Bar dataKey="value" fill={colors[1]} radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      );
  }
}

function ChartCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="surface-card flex h-full min-h-0 min-w-0 flex-col overflow-visible p-5">
      <h3 className="mb-3 shrink-0 text-sm font-bold">{title}</h3>
      <div className="min-h-0 min-w-0 flex-1 overflow-visible">{children}</div>
    </div>
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
  icon: ReactNode;
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
    <div className={`surface-card h-full min-w-0 ${compact ? "p-3" : "p-4"}`}>
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

function Empty() {
  return (
    <p className="py-10 text-center text-xs text-muted-foreground">ไม่มีข้อมูลในเดือนที่เลือก</p>
  );
}
