import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Maximize2 } from "lucide-react";
import type {
  DashboardCardId,
  DashboardCardLayout,
  DashboardLayout,
  DashboardViewport,
} from "@/lib/dashboard-layout";
import { renderDashboardCardContent } from "@/lib/dashboard-card-content";
import type { MonthlySummary } from "@/lib/work-log";

type Props = {
  layout: DashboardLayout;
  viewport: DashboardViewport;
  summary: MonthlySummary;
  chartColors: string[] | undefined;
  disabled: boolean;
  selectedCardId: DashboardCardId | null;
  onSelectCard: (id: DashboardCardId | null) => void;
  onMoveCard: (id: DashboardCardId, patch: { x: number; y: number }) => void;
  onResizeCard: (
    id: DashboardCardId,
    patch: { width: number; height: number; x: number; y: number },
  ) => void;
};

type Interaction = {
  pointerId: number;
  id: DashboardCardId;
  mode: "drag" | "resize";
  captureTarget: HTMLElement;
  startClientX: number;
  startClientY: number;
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
};

const CANVAS_HEIGHT = 1600;
const NORMAL_CARD_HEIGHT = 86;
const CHART_CARD_HEIGHT = 220;

export function DashboardCustomizationCanvas({
  layout,
  viewport,
  summary,
  chartColors,
  disabled,
  selectedCardId,
  onSelectCard,
  onMoveCard,
  onResizeCard,
}: Props) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const interactionRef = useRef<Interaction | null>(null);
  const [activeInteraction, setActiveInteraction] = useState<Interaction | null>(null);
  const cards = [...layout.cards].sort((a, b) => a.order - b.order);

  const getCardMetrics = (card: DashboardCardLayout) => {
    const columns = getColumns(card, viewport);
    const widthPercent =
      card.group === "net" ? 100 : (clamp(card.width, 1, columns) / columns) * 100;
    const heightPx =
      (card.group === "charts" ? CHART_CARD_HEIGHT : NORMAL_CARD_HEIGHT) * card.height;
    const heightPercent = (heightPx / CANVAS_HEIGHT) * 100;
    return {
      columns,
      widthPercent,
      heightPx,
      heightPercent,
      left: clamp(card.x, 0, 100 - widthPercent),
      top: clamp(card.y, 0, 100 - heightPercent),
    };
  };

  const handlePointerDown = (
    event: ReactPointerEvent<HTMLElement>,
    card: DashboardCardLayout,
    mode: "drag" | "resize",
  ) => {
    if (disabled) return;
    event.preventDefault();
    event.stopPropagation();
    const target = event.currentTarget;
    const interaction: Interaction = {
      pointerId: event.pointerId,
      id: card.id,
      mode,
      captureTarget: target,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startX: card.x,
      startY: card.y,
      startWidth: card.width,
      startHeight: card.height,
    };
    try {
      target.setPointerCapture(event.pointerId);
    } catch {
      // Some synthetic/test events do not have an active pointer. The interaction
      // still remains usable while the pointer is inside the Canvas.
    }
    interactionRef.current = interaction;
    setActiveInteraction(interaction);
    onSelectCard(card.id);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    const interaction = interactionRef.current;
    if (!interaction || interaction.pointerId !== event.pointerId || disabled) return;
    const canvas = canvasRef.current;
    const card = layout.cards.find((item) => item.id === interaction.id);
    if (!canvas || !card) return;
    const rect = canvas.getBoundingClientRect();
    const deltaX = ((event.clientX - interaction.startClientX) / rect.width) * 100;
    const deltaY = ((event.clientY - interaction.startClientY) / rect.height) * 100;
    const metrics = getCardMetrics(card);

    if (interaction.mode === "drag") {
      const nextX = clamp(interaction.startX + deltaX, 0, 100 - metrics.widthPercent);
      const nextY = clamp(interaction.startY + deltaY, 0, 100 - metrics.heightPercent);
      onMoveCard(card.id, { x: roundPosition(nextX), y: roundPosition(nextY) });
      return;
    }

    const cellWidth = rect.width / metrics.columns;
    const nextWidth = clamp(
      interaction.startWidth + Math.round((event.clientX - interaction.startClientX) / cellWidth),
      1,
      metrics.columns,
    );
    const nextHeight = clamp(
      interaction.startHeight +
        Math.round(
          (event.clientY - interaction.startClientY) / (card.group === "charts" ? 80 : 64),
        ),
      1,
      card.group === "charts" ? 6 : 3,
    );
    const nextWidthPercent = card.group === "net" ? 100 : (nextWidth / metrics.columns) * 100;
    const nextHeightPercent =
      (((card.group === "charts" ? CHART_CARD_HEIGHT : NORMAL_CARD_HEIGHT) * nextHeight) /
        CANVAS_HEIGHT) *
      100;
    onResizeCard(card.id, {
      width: nextWidth,
      height: nextHeight,
      x: roundPosition(clamp(interaction.startX, 0, 100 - nextWidthPercent)),
      y: roundPosition(clamp(interaction.startY, 0, 100 - nextHeightPercent)),
    });
  };

  const finishPointer = (event: ReactPointerEvent<HTMLElement>) => {
    if (interactionRef.current?.pointerId !== event.pointerId) return;
    const captureTarget = interactionRef.current.captureTarget;
    if (captureTarget.hasPointerCapture(event.pointerId)) {
      captureTarget.releasePointerCapture(event.pointerId);
    }
    interactionRef.current = null;
    setActiveInteraction(null);
  };

  return (
    <div className="space-y-2" data-testid="dashboard-customization-canvas">
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>
          {disabled
            ? "ปลดล็อก Settings ก่อนจึงจะเลือก ลาก หรือปรับขนาดได้"
            : "แตะ/กดค้างที่การ์ดแล้วลากได้ทันที ใช้จุดมุมขวาล่างเพื่อปรับขนาด"}
        </span>
        <span className="shrink-0">
          {viewport === "mobile" ? "Canvas Mobile" : "Canvas Desktop"}
        </span>
      </div>

      <div
        ref={canvasRef}
        className="relative isolate w-full overflow-hidden rounded-2xl border-2 border-dashed border-border bg-secondary/30"
        style={{ minHeight: `${CANVAS_HEIGHT}px`, touchAction: "none" }}
        data-dashboard-customization-viewport={viewport}
        onPointerDown={(event) => {
          if (event.target === event.currentTarget) onSelectCard(null);
        }}
        onPointerMove={handlePointerMove}
        onPointerUp={finishPointer}
        onPointerCancel={finishPointer}
      >
        {cards.map((card) => {
          const metrics = getCardMetrics(card);
          const selected = selectedCardId === card.id;
          const dragging = activeInteraction?.id === card.id && activeInteraction.mode === "drag";
          const resizing = activeInteraction?.id === card.id && activeInteraction.mode === "resize";
          return (
            <article
              key={card.id}
              className={`absolute min-w-0 rounded-xl ${
                selected ? "z-30 ring-2 ring-primary ring-offset-2 ring-offset-background" : "z-10"
              } ${dragging ? "cursor-grabbing opacity-90" : "cursor-grab"}`}
              data-dashboard-card-id={card.id}
              data-dashboard-card-selected={selected ? "true" : "false"}
              data-dashboard-card-interacting={dragging || resizing ? "true" : "false"}
              style={{
                left: `${metrics.left}%`,
                top: `${metrics.top}%`,
                width: `${metrics.widthPercent}%`,
                height: `${metrics.heightPx}px`,
                touchAction: "none",
                userSelect: "none",
              }}
              onPointerDown={(event) => handlePointerDown(event, card, "drag")}
              onClick={(event) => {
                event.stopPropagation();
                onSelectCard(card.id);
              }}
            >
              <div className="pointer-events-none h-full overflow-hidden rounded-xl">
                {renderDashboardCardContent(card.id, summary, chartColors)}
              </div>
              {selected ? (
                <>
                  <div className="pointer-events-none absolute -top-7 left-0 rounded-md bg-primary px-2 py-1 text-[10px] font-semibold text-primary-foreground shadow">
                    {card.id} · x {roundPosition(metrics.left)}% · y {roundPosition(metrics.top)}% ·
                    w {card.width} · h {card.height}
                  </div>
                  <button
                    type="button"
                    aria-label={`ปรับขนาด ${card.id}`}
                    className="absolute -bottom-2 -right-2 z-40 flex h-7 w-7 cursor-se-resize items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow-lg"
                    style={{ touchAction: "none" }}
                    onPointerDown={(event) => handlePointerDown(event, card, "resize")}
                  >
                    <Maximize2 className="h-3.5 w-3.5" />
                  </button>
                </>
              ) : null}
            </article>
          );
        })}
      </div>
    </div>
  );
}

function getColumns(card: DashboardCardLayout, viewport: DashboardViewport): number {
  if (card.group === "charts") return viewport === "mobile" ? 1 : 2;
  return viewport === "mobile" ? 2 : 3;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), Math.max(min, max));
}

function roundPosition(value: number): number {
  return Math.round(value * 100) / 100;
}
