import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

export type DashboardViewport = "mobile" | "desktop";
export type DashboardCardGroup = "net" | "work" | "income" | "charts";

export type DashboardCardId =
  | "net-income"
  | "work-days"
  | "days-with-ot"
  | "days-without-ot"
  | "tasks"
  | "tasks-average"
  | "hours"
  | "ot-income"
  | "allowance"
  | "deductions"
  | "daily-income"
  | "daily-tasks"
  | "work-type-income"
  | "frequent-location";

export type DashboardCardLayout = {
  id: DashboardCardId;
  group: DashboardCardGroup;
  order: number;
  width: number;
  height: number;
};

export type DashboardLayout = {
  version: 1;
  cards: DashboardCardLayout[];
};

const CARD_IDS = new Set<DashboardCardId>([
  "net-income",
  "work-days",
  "days-with-ot",
  "days-without-ot",
  "tasks",
  "tasks-average",
  "hours",
  "ot-income",
  "allowance",
  "deductions",
  "daily-income",
  "daily-tasks",
  "work-type-income",
  "frequent-location",
]);

const GROUPS = new Set<DashboardCardGroup>(["net", "work", "income", "charts"]);

export function createDefaultDashboardLayout(viewport: DashboardViewport): DashboardLayout {
  const mobile = viewport === "mobile";
  const fullWidth = mobile ? 2 : 3;

  return {
    version: 1,
    cards: [
      { id: "net-income", group: "net", order: 0, width: fullWidth, height: 1 },
      { id: "work-days", group: "work", order: 0, width: 1, height: 1 },
      { id: "days-with-ot", group: "work", order: 1, width: 1, height: 1 },
      { id: "days-without-ot", group: "work", order: 2, width: 1, height: 1 },
      { id: "tasks", group: "work", order: 3, width: 1, height: 1 },
      { id: "tasks-average", group: "work", order: 4, width: 1, height: 1 },
      { id: "hours", group: "work", order: 5, width: 1, height: 1 },
      { id: "ot-income", group: "income", order: 0, width: 1, height: 1 },
      { id: "allowance", group: "income", order: 1, width: 1, height: 1 },
      { id: "deductions", group: "income", order: 2, width: 1, height: 1 },
      { id: "daily-income", group: "charts", order: 0, width: 1, height: 3 },
      { id: "daily-tasks", group: "charts", order: 1, width: 1, height: 3 },
      { id: "work-type-income", group: "charts", order: 2, width: 1, height: 3 },
      { id: "frequent-location", group: "charts", order: 3, width: 1, height: 3 },
    ],
  };
}

export function getDashboardCards(
  layout: DashboardLayout,
  group: DashboardCardGroup,
): DashboardCardLayout[] {
  return layout.cards.filter((card) => card.group === group).sort((a, b) => a.order - b.order);
}

export function updateDashboardCard(
  layout: DashboardLayout,
  id: DashboardCardId,
  patch: Partial<Pick<DashboardCardLayout, "order" | "width" | "height">>,
): DashboardLayout {
  return {
    ...layout,
    cards: layout.cards.map((card) => (card.id === id ? { ...card, ...patch } : card)),
  };
}

export function reorderDashboardCards(
  layout: DashboardLayout,
  group: DashboardCardGroup,
  activeId: DashboardCardId,
  overId: DashboardCardId,
): DashboardLayout {
  if (activeId === overId) return layout;

  const groupCards = getDashboardCards(layout, group);
  const oldIndex = groupCards.findIndex((card) => card.id === activeId);
  const newIndex = groupCards.findIndex((card) => card.id === overId);
  if (oldIndex < 0 || newIndex < 0) return layout;

  const nextGroupCards = [...groupCards];
  const [moved] = nextGroupCards.splice(oldIndex, 1);
  nextGroupCards.splice(newIndex, 0, moved);
  const orderMap = new Map(nextGroupCards.map((card, index) => [card.id, index]));

  return {
    ...layout,
    cards: layout.cards.map((card) =>
      card.group === group ? { ...card, order: orderMap.get(card.id) ?? card.order } : card,
    ),
  };
}

export function normalizeDashboardLayout(
  value: unknown,
  viewport: DashboardViewport,
): DashboardLayout {
  const defaults = createDefaultDashboardLayout(viewport);
  if (!isRecord(value) || !Array.isArray(value.cards)) return defaults;

  const incoming = new Map<DashboardCardId, DashboardCardLayout>();
  for (const item of value.cards) {
    if (!isRecord(item)) continue;
    const id = item.id;
    const group = item.group;
    if (!isCardId(id) || !isGroup(group) || incoming.has(id)) continue;

    incoming.set(id, {
      id,
      group,
      order: finiteInt(item.order, 0),
      width: Math.max(1, finiteInt(item.width, 1)),
      height: Math.max(1, finiteInt(item.height, 1)),
    });
  }

  const cards = defaults.cards.map((defaultCard) => incoming.get(defaultCard.id) ?? defaultCard);
  const ordered = cards.map((card) => ({ ...card }));
  for (const group of GROUPS) {
    ordered
      .filter((card) => card.group === group)
      .sort((a, b) => a.order - b.order)
      .forEach((card, index) => {
        card.order = index;
      });
  }

  return { version: 1, cards: ordered };
}

export async function loadDashboardLayout(
  userId: string,
  viewport: DashboardViewport,
): Promise<DashboardLayout> {
  const { data, error } = await supabase
    .from("dashboard_layouts")
    .select("layout")
    .eq("user_id", userId)
    .eq("viewport", viewport)
    .maybeSingle();

  if (error) throw error;
  return normalizeDashboardLayout(data?.layout, viewport);
}

export async function saveDashboardLayout(
  userId: string,
  viewport: DashboardViewport,
  layout: DashboardLayout,
): Promise<void> {
  const { error } = await supabase.from("dashboard_layouts").upsert(
    {
      user_id: userId,
      viewport,
      layout: layout as unknown as Json,
    },
    { onConflict: "user_id,viewport" },
  );

  if (error) throw error;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isCardId(value: unknown): value is DashboardCardId {
  return typeof value === "string" && CARD_IDS.has(value as DashboardCardId);
}

function isGroup(value: unknown): value is DashboardCardGroup {
  return typeof value === "string" && GROUPS.has(value as DashboardCardGroup);
}

function finiteInt(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? Math.round(value) : fallback;
}
