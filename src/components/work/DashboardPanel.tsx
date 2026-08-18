import { RefreshCw } from "lucide-react";
import type { ReactNode } from "react";
import type { DashboardLayoutState } from "@/hooks/use-dashboard-layout";
import type { DashboardCardGroup, DashboardCardLayout } from "@/lib/dashboard-layout";
import { type WorkLog, summarizeMonth } from "@/lib/work-log";
import { DEFAULT_CHART_COLORS, renderDashboardCardContent } from "@/lib/dashboard-card-content";

type Props = {
  logs: WorkLog[];
  layoutState: DashboardLayoutState;
  chartColors: string[] | undefined;
  month: string;
  onMonthChange: (m: string) => void;
  spreadsheetId: string | undefined;
  syncing: boolean | undefined;
  onRefresh: (() => void) | undefined;
};

export function DashboardPanel({
  logs,
  layoutState,
  chartColors,
  month,
  onMonthChange,
  spreadsheetId,
  syncing,
  onRefresh,
}: Props) {
  const summary = summarizeMonth(logs, month);
  const colors = chartColors?.length ? chartColors : DEFAULT_CHART_COLORS;
  const { layout, viewport, loading: layoutLoading } = layoutState;

  return (
    <div
      className="space-y-5"
      data-dashboard-viewport={viewport}
      data-dashboard-layout-loading={layoutLoading ? "true" : "false"}
      aria-busy={layoutLoading}
    >
      <section className="surface-card mx-auto w-full p-4 sm:p-5">
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

        <div
          className="mt-5 grid grid-cols-2 items-stretch gap-2 sm:gap-3 md:grid-cols-6"
          data-dashboard-reflow="true"
        >
          {[...layout.cards].sort(compareReflowPosition).map((card) => (
            <DashboardCard key={card.id} card={card} viewport={viewport}>
              {renderDashboardCardContent(card.id, summary, colors)}
            </DashboardCard>
          ))}
        </div>
      </section>
    </div>
  );
}

function DashboardCard({
  card,
  viewport,
  children,
}: {
  card: DashboardCardLayout;
  viewport: "mobile" | "desktop";
  children: ReactNode;
}) {
  const columns = viewport === "mobile" ? 2 : 6;
  const width = getGridSpan(card, viewport);
  const height = getCardHeight(card);

  return (
    <article
      className="relative min-h-0 min-w-0"
      data-dashboard-card-id={card.id}
      data-dashboard-card-group={card.group}
      data-testid={`dashboard-card-${card.id}`}
      style={{
        height: `${height}px`,
        gridColumn: `span ${Math.min(width, columns)} / span ${Math.min(width, columns)}`,
      }}
    >
      {children}
    </article>
  );
}

function getGridSpan(card: DashboardCardLayout, viewport: "mobile" | "desktop"): number {
  if (card.group === "net") return viewport === "mobile" ? 2 : 6;
  if (card.group === "charts") {
    const chartColumns = viewport === "mobile" ? 2 : 3;
    return chartColumns * clamp(card.width, 1, viewport === "mobile" ? 1 : 2);
  }
  const statColumns = viewport === "mobile" ? 1 : 2;
  return statColumns * clamp(card.width, 1, viewport === "mobile" ? 2 : 3);
}

function getCardHeight(card: DashboardCardLayout): number {
  const baseHeight = card.group === "charts" ? 260 : card.group === "net" ? 104 : 92;
  const maximum = card.group === "charts" ? 6 : 4;
  return baseHeight * clamp(card.height, 1, maximum);
}

function compareReflowPosition(a: DashboardCardLayout, b: DashboardCardLayout): number {
  const y = a.y - b.y;
  if (Math.abs(y) > 0.01) return y;
  const x = a.x - b.x;
  if (Math.abs(x) > 0.01) return x;
  if (a.group !== b.group) return groupRank(a.group) - groupRank(b.group);
  return a.order - b.order;
}

function groupRank(group: DashboardCardGroup): number {
  return group === "net" ? 0 : group === "work" ? 1 : group === "income" ? 2 : 3;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function DashboardControls({
  spreadsheetId,
  syncing,
  onRefresh,
  month,
  onMonthChange,
}: {
  spreadsheetId: string | undefined;
  syncing: boolean | undefined;
  onRefresh: (() => void) | undefined;
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
