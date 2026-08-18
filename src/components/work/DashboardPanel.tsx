import { useEffect, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { RefreshCw } from "lucide-react";
import {
  type DashboardCardGroup,
  type DashboardCardId,
  type DashboardCardLayout,
} from "@/lib/dashboard-layout";
import { useDashboardLayout } from "@/hooks/use-dashboard-layout";
import { type WorkLog, summarizeMonth } from "@/lib/work-log";
import { DEFAULT_CHART_COLORS, renderDashboardCardContent } from "@/lib/dashboard-card-content";

type Props = {
  logs: WorkLog[];
  userId: string | null;
  isGuest: boolean;
  chartColors: string[] | undefined;
  month: string;
  onMonthChange: (m: string) => void;
  spreadsheetId: string | undefined;
  syncing: boolean | undefined;
  onRefresh: (() => void) | undefined;
};

export function DashboardPanel({
  logs,
  userId,
  isGuest,
  chartColors,
  month,
  onMonthChange,
  spreadsheetId,
  syncing,
  onRefresh,
}: Props) {
  const s = summarizeMonth(logs, month);
  const colors = chartColors?.length ? chartColors : DEFAULT_CHART_COLORS;
  const { layout, viewport, loading: layoutLoading } = useDashboardLayout(userId, isGuest);

  const cardMap = new Map(layout.cards.map((card) => [card.id, card]));
  const renderCard = (id: DashboardCardId, content: ReactNode) => {
    const card = cardMap.get(id);
    if (!card) return null;
    return (
      <DashboardCard key={id} card={card} viewport={viewport}>
        {content}
      </DashboardCard>
    );
  };

  return (
    <div
      className="space-y-5"
      data-dashboard-viewport={viewport}
      data-dashboard-layout-loading={layoutLoading ? "true" : "false"}
    >
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

        <div className="mt-5 grid grid-cols-1 gap-3">
          {renderCard("net-income", renderDashboardCardContent("net-income", s, colors))}
        </div>

        <SummarySection title="บันทึกการทำงาน">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
              {renderCard("work-days", renderDashboardCardContent("work-days", s, colors))}
              {renderCard("days-with-ot", renderDashboardCardContent("days-with-ot", s, colors))}
              {renderCard(
                "days-without-ot",
                renderDashboardCardContent("days-without-ot", s, colors),
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
              {renderCard("tasks", renderDashboardCardContent("tasks", s, colors))}
              {renderCard("tasks-average", renderDashboardCardContent("tasks-average", s, colors))}
              {renderCard("hours", renderDashboardCardContent("hours", s, colors))}
            </div>
          </div>
        </SummarySection>

        <SummarySection title="รายรับเสริมและรายการหัก">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
            {renderCard("ot-income", renderDashboardCardContent("ot-income", s, colors))}
            {renderCard("allowance", renderDashboardCardContent("allowance", s, colors))}
            {renderCard("deductions", renderDashboardCardContent("deductions", s, colors))}
          </div>
        </SummarySection>
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {renderCard("daily-income", renderDashboardCardContent("daily-income", s, colors))}
        {renderCard("daily-tasks", renderDashboardCardContent("daily-tasks", s, colors))}
        {renderCard("work-type-income", renderDashboardCardContent("work-type-income", s, colors))}
        {renderCard(
          "frequent-location",
          renderDashboardCardContent("frequent-location", s, colors),
        )}
      </div>
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
  const columns = getGridColumns(card.group, viewport);
  const width = clamp(card.width, 1, columns);
  const minHeight = card.group === "charts" ? card.height * 96 : card.height * 80;

  return (
    <article
      className="relative min-w-0"
      data-dashboard-card-id={card.id}
      data-dashboard-card-group={card.group}
      data-testid={`dashboard-card-${card.id}`}
      style={{
        order: card.order,
        gridColumn: `span ${width} / span ${width}`,
        minHeight: `${minHeight}px`,
      }}
    >
      {children}
    </article>
  );
}

function getGridColumns(group: DashboardCardGroup, viewport: "mobile" | "desktop"): number {
  if (group === "charts") return viewport === "mobile" ? 1 : 2;
  return viewport === "mobile" ? 2 : 3;
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

function SummarySection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-5 border-t border-border pt-4">
      <h3 className="mb-3 text-xs font-bold text-muted-foreground">{title}</h3>
      {children}
    </section>
  );
}
