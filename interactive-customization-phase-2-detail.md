# Phase 2: Component Library & Customization Panel

## 1. เป้าหมายของ Phase 2

Phase 2 มีเป้าหมายเพื่อเปลี่ยน `DashboardLayoutEditor` จากตัวแก้ไขลำดับและขนาดแบบรายการ ให้เป็นโครงสร้างที่มี **Component Library**, **Component Selection** และ **Customization Panel** โดยยังคงหลักการของระบบเดิมทั้งหมด ได้แก่ การแก้ไขจากหน้า Settings เท่านั้น, Dashboard จริงเป็น View-only, การเปลี่ยนค่าทั้งหมดเป็น Draft ก่อน, Save เท่านั้นที่เรียก persistence และ Cancel ต้องคืนค่า snapshot ล่าสุดที่บันทึกแล้ว

Phase นี้ควรเป็นการสร้างฐาน component และสัญญาข้อมูลก่อนเพิ่ม Drag/Resize แบบ pointer เต็มรูปแบบใน phase ถัดไป จึงยังไม่ควรทำ Free Position, Multi-select, Undo/Redo หรือการลากแบบ pixel ใน Phase 2

## 2. สถานะของโค้ดปัจจุบันที่ต้องต่อยอด

ปัจจุบันระบบมี type และ persistence สำหรับ Dashboard Layout อยู่แล้วใน `src/lib/dashboard-layout.ts` โดยมี `DashboardCardId`, `DashboardCardGroup`, `DashboardCardLayout` และ `DashboardLayout` ดังนี้

```ts
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
```

`DashboardLayoutEditor.tsx` มีการแยก Mobile/Desktop, reorder, width/height selector, reset, dirty snapshot, `saveDraft()` และ `cancelDraft()` อยู่แล้ว ส่วน `SettingsPanel.tsx` ถือ `layoutEditorRef` และรวม Layout dirty state เข้ากับสถานะ Settings หลัก

ดังนั้น Phase 2 ไม่ควรสร้าง hook persistence ใหม่หรือสร้างตารางใหม่โดยไม่จำเป็น แต่ควรขยาย layout JSON แบบ backward-compatible และใช้ `DashboardLayoutEditorHandle` เดิมเป็น coordinator หลัก

## 3. หลักการไม่สร้างข้อมูลซ้ำ

ข้อมูลที่มีอยู่แล้วต้องใช้ซ้ำ ไม่สร้าง field ใหม่แทนของเดิม

| ความต้องการ | ข้อมูลเดิมที่ต้องใช้ | แนวทาง Phase 2 |
|---|---|---|
| รหัสการ์ด | `DashboardCardId` | ใช้เป็น `componentId` โดยตรง |
| กลุ่มการ์ด | `DashboardCardGroup` | ใช้กำหนดหมวดใน Component Library |
| ลำดับ | `DashboardCardLayout.order` | ใช้ต่อ ไม่เพิ่ม `positionIndex` |
| ความกว้าง | `DashboardCardLayout.width` | ใช้ต่อ ไม่เพิ่ม `columnSpan` ซ้ำ |
| ความสูง | `DashboardCardLayout.height` | ใช้ต่อ ไม่เพิ่ม `rowSpan` ซ้ำ |
| Mobile/Desktop | `DashboardViewport` | ใช้ hook เดิมแยก layout ต่อ viewport |
| Draft/Saved | snapshot ใน `DashboardLayoutEditor` และ SettingsPanel | ใช้ coordinator เดิม |
| การคำนวณรายได้/ชั่วโมง/OT | `summarizeMonth` และข้อมูล `work_logs` | ห้ามแก้และห้ามนำเข้า customization model |

ค่าที่เป็นของใหม่จริง เช่น visibility, title/icon display หรือ semantic tone สามารถเพิ่มเป็น `customizations` ภายใน JSON ของ `dashboard_layouts.layout` ได้ เพราะตาราง `dashboard_layouts` มีคอลัมน์ JSON อยู่แล้ว ไม่ควรเพิ่มคอลัมน์ซ้ำในตารางเพียงเพื่อเก็บ property ย่อยของการ์ด

## 4. โครงสร้างไฟล์ที่แนะนำ

```text
src/
├── lib/
│   ├── dashboard-layout.ts              # order, width, height และ normalization เดิม
│   ├── dashboard-components.ts          # Component Library metadata และ capability contract ใหม่
│   └── dashboard-customization.ts       # default, normalize และ immutable patch ของ customization
│
├── components/work/
│   ├── DashboardPanel.tsx               # renderer หน้าใช้งานจริงแบบ View-only
│   ├── DashboardLayoutEditor.tsx        # coordinator ของ selected viewport และ draft
│   ├── DashboardPreviewCanvas.tsx       # preview renderer ใน Settings
│   └── customization/
│       ├── ComponentLibrary.tsx         # รายการการ์ดที่เลือกได้
│       ├── CustomizationPanel.tsx       # property editor ของการ์ดที่เลือก
│       ├── ComponentPropertySection.tsx # section ย่อยของ properties
│       └── PropertyField.tsx             # input control ที่ใช้ซ้ำ
│
└── test/
    ├── dashboard-customization.test.ts
    └── CustomizationPanel.test.tsx
```

ชื่อ folder สามารถปรับให้ตรง convention ของ repository ได้ แต่ควรรักษาการแยกหน้าที่ดังกล่าวไว้ เพื่อไม่ให้ `SettingsPanel.tsx` ซึ่งมีหลายแท็บอยู่แล้วต้องรับผิดชอบ rendering และ property logic ของทุกการ์ด

## 5. Component Library Metadata Contract

สร้างไฟล์ `src/lib/dashboard-components.ts` สำหรับ metadata เท่านั้น ไม่ใส่ business calculation ลงใน registry

```ts
import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  CalendarCheck,
  ChartPie,
  Clock3,
  Coins,
  ListChecks,
  MapPin,
  MinusCircle,
  TrendingUp,
} from "lucide-react";
import type { DashboardCardGroup, DashboardCardId } from "@/lib/dashboard-layout";

export type ComponentCapability =
  | "visibility"
  | "order"
  | "size"
  | "tone"
  | "title"
  | "icon"
  | "density";

export type DashboardComponentDefinition = {
  id: DashboardCardId;
  label: string;
  description: string;
  group: DashboardCardGroup;
  icon: LucideIcon;
  capabilities: readonly ComponentCapability[];
  dataTestId: string;
};

export const DASHBOARD_COMPONENTS: readonly DashboardComponentDefinition[] = [
  {
    id: "net-income",
    label: "รายได้สุทธิรวม",
    description: "แสดงรายได้สุทธิของเดือนที่เลือก",
    group: "net",
    icon: Coins,
    capabilities: ["visibility", "size", "tone", "title", "icon"],
    dataTestId: "stat-net",
  },
  {
    id: "work-days",
    label: "วันทำงานทั้งหมด",
    description: "จำนวนวันที่มีบันทึกการทำงาน",
    group: "work",
    icon: CalendarCheck,
    capabilities: ["visibility", "size", "tone", "title", "icon"],
    dataTestId: "stat-days",
  },
  {
    id: "days-with-ot",
    label: "วันที่มี OT",
    description: "จำนวนวันที่มีชั่วโมง OT",
    group: "work",
    icon: TrendingUp,
    capabilities: ["visibility", "size", "tone", "title", "icon"],
    dataTestId: "stat-days-with-ot",
  },
  {
    id: "days-without-ot",
    label: "วันที่ไม่มี OT",
    description: "จำนวนวันที่ไม่มีชั่วโมง OT",
    group: "work",
    icon: CalendarCheck,
    capabilities: ["visibility", "size", "tone", "title", "icon"],
    dataTestId: "stat-days-without-ot",
  },
  {
    id: "tasks",
    label: "งานที่ทำเสร็จ",
    description: "จำนวนงานที่ทำเสร็จทั้งหมด",
    group: "work",
    icon: ListChecks,
    capabilities: ["visibility", "size", "tone", "title", "icon"],
    dataTestId: "stat-tasks",
  },
  {
    id: "tasks-average",
    label: "เฉลี่ยงานต่อวัน",
    description: "ค่าเฉลี่ยจำนวนงานต่อวันทำงาน",
    group: "work",
    icon: ListChecks,
    capabilities: ["visibility", "size", "tone", "title", "icon"],
    dataTestId: "stat-tasks-avg",
  },
  {
    id: "hours",
    label: "ชั่วโมงรวม",
    description: "ชั่วโมงทำงานรวมของเดือน",
    group: "work",
    icon: Clock3,
    capabilities: ["visibility", "size", "tone", "title", "icon"],
    dataTestId: "stat-hours",
  },
  {
    id: "ot-income",
    label: "ค่า OT",
    description: "รายได้จาก OT ของเดือน",
    group: "income",
    icon: TrendingUp,
    capabilities: ["visibility", "size", "tone", "title", "icon"],
    dataTestId: "stat-ot",
  },
  {
    id: "allowance",
    label: "เบี้ยเลี้ยงและรายรับอื่น",
    description: "เบี้ยเลี้ยง ค่าเดินทาง ค่าอาหาร และรายรับอื่น",
    group: "income",
    icon: Coins,
    capabilities: ["visibility", "size", "tone", "title", "icon"],
    dataTestId: "stat-allowance",
  },
  {
    id: "deductions",
    label: "รายการหักรวม",
    description: "รายการหักของเดือน",
    group: "income",
    icon: MinusCircle,
    capabilities: ["visibility", "size", "tone", "title", "icon"],
    dataTestId: "stat-deduction",
  },
  {
    id: "daily-income",
    label: "รายได้รายวัน",
    description: "กราฟรายได้รายวัน",
    group: "charts",
    icon: BarChart3,
    capabilities: ["visibility", "size", "title"],
    dataTestId: "dashboard-card-daily-income",
  },
  {
    id: "daily-tasks",
    label: "จำนวนงานที่ทำเสร็จรายวัน",
    description: "กราฟจำนวนงานรายวัน",
    group: "charts",
    icon: BarChart3,
    capabilities: ["visibility", "size", "title"],
    dataTestId: "dashboard-card-daily-tasks",
  },
  {
    id: "work-type-income",
    label: "สัดส่วนรายได้ตามประเภทงาน",
    description: "กราฟสัดส่วนรายได้ตามประเภทงาน",
    group: "charts",
    icon: ChartPie,
    capabilities: ["visibility", "size", "title"],
    dataTestId: "dashboard-card-work-type-income",
  },
  {
    id: "frequent-location",
    label: "สถานที่ทำงานบ่อยที่สุด",
    description: "กราฟสถานที่ทำงานที่พบบ่อย",
    group: "charts",
    icon: MapPin,
    capabilities: ["visibility", "size", "title"],
    dataTestId: "dashboard-card-frequent-location",
  },
];

const COMPONENT_MAP = new Map(DASHBOARD_COMPONENTS.map((item) => [item.id, item]));

export function getDashboardComponentDefinition(id: DashboardCardId) {
  return COMPONENT_MAP.get(id);
}
```

### เหตุผลของ `capabilities`

ไม่ควรแสดง control ทุกชนิดกับทุกการ์ด หาก renderer ยังไม่รองรับ property นั้นจริง ตัวอย่างเช่น chart อาจรองรับ visibility และ size แต่ยังไม่ควรแสดง `icon` หาก `DashboardPanel` ยังไม่ได้ใช้ icon ของ chart จาก metadata

วิธีนี้ป้องกันปัญหา UI หลอกว่าบันทึกได้ แต่หน้า Dashboard ไม่เปลี่ยนจริง

## 6. Customization Model แบบไม่ซ้ำกับ Layout เดิม

`order`, `width` และ `height` มีอยู่แล้วใน `DashboardCardLayout` จึงไม่ควรทำซ้ำใน customization object ส่วน property ใหม่ให้แยกเป็น customization ต่อการ์ด

```ts
import type { DashboardCardId, DashboardLayout } from "@/lib/dashboard-layout";

export type DashboardSemanticTone =
  | "default"
  | "primary"
  | "success"
  | "warning"
  | "destructive"
  | "muted";

export type DashboardCardCustomization = {
  visible: boolean;
  tone?: DashboardSemanticTone;
  showTitle?: boolean;
  showIcon?: boolean;
  density?: "compact" | "comfortable";
};

export type DashboardCustomizations = Partial<
  Record<DashboardCardId, DashboardCardCustomization>
>;

export type DashboardLayoutDocument = DashboardLayout & {
  // Optional เพื่อให้ข้อมูล version 1 เดิมยังอ่านได้
  customizations?: DashboardCustomizations;
};

export const DEFAULT_CARD_CUSTOMIZATION: DashboardCardCustomization = {
  visible: true,
  tone: "default",
  showTitle: true,
  showIcon: true,
  density: "comfortable",
};

export function getCardCustomization(
  customizations: DashboardCustomizations | undefined,
  id: DashboardCardId,
): DashboardCardCustomization {
  return {
    ...DEFAULT_CARD_CUSTOMIZATION,
    ...(customizations?.[id] ?? {}),
  };
}

export function updateCardCustomization(
  document: DashboardLayoutDocument,
  id: DashboardCardId,
  patch: Partial<DashboardCardCustomization>,
): DashboardLayoutDocument {
  return {
    ...document,
    customizations: {
      ...(document.customizations ?? {}),
      [id]: {
        ...getCardCustomization(document.customizations, id),
        ...patch,
      },
    },
  };
}
```

### การจัดการ version

ใน Phase 2 ควรเริ่มด้วย optional `customizations` เพื่ออ่าน layout version 1 ได้ก่อน หากจะทำ persistence จริง ให้กำหนด migration/normalization เป็นขั้นถัดไป เช่น

```ts
export function normalizeDashboardLayoutDocument(
  value: unknown,
  viewport: DashboardViewport,
): DashboardLayoutDocument {
  const base = normalizeDashboardLayout(value, viewport);
  const record = isRecord(value) ? value : {};

  return {
    ...base,
    customizations: normalizeCustomizations(record.customizations),
  };
}
```

ไม่ควรเพิ่มคอลัมน์ `visible`, `tone`, `card_width` หรือ `card_style` ในตาราง `dashboard_layouts` เพราะเป็นข้อมูลระดับการ์ดที่เหมาะกับ JSON document เดิม และจะทำให้ schema ซ้ำซ้อนกับ layout หลัก

## 7. Component Library UI

สร้าง `src/components/work/customization/ComponentLibrary.tsx` เป็นรายการการ์ดที่เลือกได้ ไม่ใช่ตัวแก้ไขข้อมูลธุรกิจ

```tsx
import { Check, Eye, EyeOff } from "lucide-react";
import { DASHBOARD_COMPONENTS } from "@/lib/dashboard-components";
import type { DashboardCardId } from "@/lib/dashboard-layout";

export function ComponentLibrary({
  selectedId,
  visibleById,
  disabled,
  onSelect,
}: {
  selectedId: DashboardCardId | null;
  visibleById: Partial<Record<DashboardCardId, boolean>>;
  disabled: boolean;
  onSelect: (id: DashboardCardId) => void;
}) {
  return (
    <aside aria-label="รายการองค์ประกอบ Dashboard" className="space-y-2">
      <h3 className="text-sm font-bold">องค์ประกอบ Dashboard</h3>
      <p className="text-xs text-muted-foreground">
        เลือกการ์ดเพื่อปรับแต่งใน Preview ทางด้านขวา
      </p>

      <div className="space-y-1.5">
        {DASHBOARD_COMPONENTS.map((component) => {
          const Icon = component.icon;
          const selected = selectedId === component.id;
          const visible = visibleById[component.id] !== false;

          return (
            <button
              key={component.id}
              type="button"
              disabled={disabled}
              aria-pressed={selected}
              onClick={() => onSelect(component.id)}
              className={`flex w-full items-center gap-2 rounded-xl border p-3 text-left transition ${
                selected
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border bg-card hover:bg-accent"
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              <Icon className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-semibold">{component.label}</span>
                <span className="block truncate text-[11px] text-muted-foreground">
                  {component.group}
                </span>
              </span>
              {visible ? (
                <Eye className="h-3.5 w-3.5 text-muted-foreground" aria-label="แสดงอยู่" />
              ) : (
                <EyeOff className="h-3.5 w-3.5 text-muted-foreground" aria-label="ซ่อนอยู่" />
              )}
              {selected && <Check className="h-4 w-4 text-primary" aria-hidden="true" />}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
```

การเลือกการ์ดเป็น UI state เท่านั้น จึงไม่ควรทำให้ `isDirty` เป็น `true` การแก้ property เท่านั้นจึงจะเรียก `updateLayout` หรือ `updateCustomization` และทำให้ Draft เปลี่ยน

## 8. Customization Panel

สร้าง `src/components/work/customization/CustomizationPanel.tsx` โดยให้ panel รับ selected component และ callback แบบ pure updater

```tsx
import type {
  DashboardCardCustomization,
  DashboardSemanticTone,
} from "@/lib/dashboard-customization";
import type { DashboardCardId } from "@/lib/dashboard-layout";
import { getDashboardComponentDefinition } from "@/lib/dashboard-components";

const TONES: Array<{ value: DashboardSemanticTone; label: string }> = [
  { value: "default", label: "ค่าเริ่มต้น" },
  { value: "primary", label: "สีหลัก" },
  { value: "success", label: "สำเร็จ" },
  { value: "warning", label: "เตือน" },
  { value: "destructive", label: "หัก/ผิดพลาด" },
  { value: "muted", label: "จาง" },
];

export function CustomizationPanel({
  componentId,
  value,
  disabled,
  onChange,
}: {
  componentId: DashboardCardId | null;
  value: DashboardCardCustomization | null;
  disabled: boolean;
  onChange: (patch: Partial<DashboardCardCustomization>) => void;
}) {
  if (!componentId || !value) {
    return (
      <section className="surface-card p-4" aria-label="Customization Panel">
        <p className="text-sm font-semibold">เลือกองค์ประกอบเพื่อปรับแต่ง</p>
        <p className="mt-1 text-xs text-muted-foreground">
          การเลือกยังไม่เปลี่ยนค่า และยังไม่ทำให้เกิด Unsaved changes
        </p>
      </section>
    );
  }

  const definition = getDashboardComponentDefinition(componentId);
  if (!definition) return null;

  return (
    <section className="surface-card space-y-4 p-4" aria-label={`ปรับแต่ง ${definition.label}`}>
      <header>
        <h3 className="text-sm font-bold">ปรับแต่ง: {definition.label}</h3>
        <p className="mt-1 text-xs text-muted-foreground">{definition.description}</p>
      </header>

      {definition.capabilities.includes("visibility") && (
        <label className="flex items-center justify-between gap-3 text-sm">
          <span>
            แสดงองค์ประกอบ
            <span className="block text-xs text-muted-foreground">ควบคุมการแสดงบน Dashboard</span>
          </span>
          <input
            type="checkbox"
            checked={value.visible}
            disabled={disabled}
            onChange={(event) => onChange({ visible: event.target.checked })}
          />
        </label>
      )}

      {definition.capabilities.includes("tone") && (
        <label className="block space-y-1.5 text-sm">
          <span className="font-semibold">โทนสีเชิงความหมาย</span>
          <select
            value={value.tone ?? "default"}
            disabled={disabled}
            onChange={(event) =>
              onChange({ tone: event.target.value as DashboardSemanticTone })
            }
            className="w-full rounded-xl border border-input bg-secondary px-3 py-2 text-sm"
          >
            {TONES.map((tone) => (
              <option key={tone.value} value={tone.value}>
                {tone.label}
              </option>
            ))}
          </select>
        </label>
      )}

      {definition.capabilities.includes("title") && (
        <label className="flex items-center justify-between gap-3 text-sm">
          <span>
            แสดงชื่อหัวข้อ
            <span className="block text-xs text-muted-foreground">ต้องมี renderer รองรับก่อนจึงมีผลจริง</span>
          </span>
          <input
            type="checkbox"
            checked={value.showTitle !== false}
            disabled={disabled}
            onChange={(event) => onChange({ showTitle: event.target.checked })}
          />
        </label>
      )}

      {definition.capabilities.includes("icon") && (
        <label className="flex items-center justify-between gap-3 text-sm">
          <span>
            แสดงไอคอน
            <span className="block text-xs text-muted-foreground">ใช้เฉพาะการ์ดที่ renderer รองรับ</span>
          </span>
          <input
            type="checkbox"
            checked={value.showIcon !== false}
            disabled={disabled}
            onChange={(event) => onChange({ showIcon: event.target.checked })}
          />
        </label>
      )}
    </section>
  );
}
```

### กฎสำคัญของ Panel

1. `disabled` ต้องมาจาก `isLocked` ของ `SettingsPanel` โดยตรง
2. การเลือก component ไม่ทำให้ dirty
3. การเปลี่ยน checkbox/select ต้องแก้ Draft เท่านั้น
4. Panel ห้ามเรียก `saveDashboardLayout`, `onSaveThemeSettings` หรือ Supabase โดยตรง
5. Property จะปรากฏเมื่อ `capabilities` ระบุว่าการ์ดนั้นรองรับ
6. หาก renderer ยังไม่อ่าน property ต้องยังไม่เปิด control ให้ผู้ใช้เห็น

## 9. DashboardPreviewCanvas

Phase 1 ควรมี `DashboardPreviewCanvas` เป็น renderer ของ Preview ส่วน Phase 2 นำ Component Library และ Customization Panel มาวางรอบ canvas

```tsx
import type { ReactNode } from "react";
import type {
  DashboardCardId,
  DashboardCardLayout,
  DashboardViewport,
} from "@/lib/dashboard-layout";
import type { DashboardCardCustomization } from "@/lib/dashboard-customization";

export function DashboardPreviewCanvas({
  viewport,
  cards,
  customizations,
  selectedId,
  disabled,
  renderCard,
  onSelect,
}: {
  viewport: DashboardViewport;
  cards: DashboardCardLayout[];
  customizations: Partial<Record<DashboardCardId, DashboardCardCustomization>>;
  selectedId: DashboardCardId | null;
  disabled: boolean;
  renderCard: (id: DashboardCardId) => ReactNode;
  onSelect: (id: DashboardCardId) => void;
}) {
  const columns = viewport === "mobile" ? 2 : 3;

  return (
    <div
      className={`grid gap-3 ${viewport === "mobile" ? "grid-cols-2" : "grid-cols-3"}`}
      data-preview-viewport={viewport}
      aria-label={`ตัวอย่าง Dashboard ${viewport}`}
    >
      {cards
        .filter((card) => customizations[card.id]?.visible !== false)
        .sort((a, b) => a.order - b.order)
        .map((card) => {
          const width = Math.min(Math.max(card.width, 1), columns);
          const customization = customizations[card.id];

          return (
            <button
              key={card.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(card.id)}
              aria-pressed={selectedId === card.id}
              className={`relative min-w-0 text-left ${
                selectedId === card.id ? "ring-2 ring-primary ring-offset-2" : ""
              }`}
              style={{
                order: card.order,
                gridColumn: `span ${width} / span ${width}`,
                minHeight: `${card.height * (card.group === "charts" ? 96 : 80)}px`,
              }}
            >
              <span className="pointer-events-none block h-full">
                {renderCard(card.id)}
              </span>
              {selectedId === card.id && (
                <span className="pointer-events-none absolute inset-0 rounded-xl border-2 border-primary" />
              )}
              {customization?.visible === false && (
                <span className="sr-only">ซ่อนอยู่</span>
              )}
            </button>
          );
        })}
    </div>
  );
}
```

ใน implementation จริงไม่ควรใช้ `<button>` ครอบ content ที่มี interactive element อยู่ภายใน หาก card content มีปุ่มหรือ link ให้เปลี่ยนเป็น `<div role="button" tabIndex={0}>` พร้อม Keyboard handler หรือใช้ selection overlay ที่แยกจาก content เพื่อไม่สร้าง nested interactive elements

## 10. รวมสามส่วนใน `DashboardLayoutEditor`

`DashboardLayoutEditor` ควรทำหน้าที่เป็น coordinator เดียว โดยรวม:

```tsx
const [selectedCardId, setSelectedCardId] = useState<DashboardCardId | null>(null);
const selectedLayout = selectedViewport === "mobile" ? mobile.layout : desktop.layout;
const selectedCards = selectedLayout.cards;
const selectedCustomizations = selectedLayout.customizations ?? {};

const updateCustomization = (
  patch: Partial<DashboardCardCustomization>,
) => {
  if (!selectedCardId || disabled) return;

  selected.updateLayout((current) =>
    updateCardCustomization(current, selectedCardId, patch),
  );
};

return (
  <div className="grid gap-4 xl:grid-cols-[15rem_minmax(0,1fr)_18rem]">
    <ComponentLibrary
      selectedId={selectedCardId}
      visibleById={getVisibilityMap(selectedCustomizations)}
      disabled={disabled || selected.loading}
      onSelect={setSelectedCardId}
    />

    <DashboardPreviewCanvas
      viewport={selectedViewport}
      cards={selectedCards}
      customizations={selectedCustomizations}
      selectedId={selectedCardId}
      disabled={disabled || selected.loading}
      renderCard={(id) => renderPreviewCard(id, selectedCustomizations[id])}
      onSelect={setSelectedCardId}
    />

    <CustomizationPanel
      componentId={selectedCardId}
      value={
        selectedCardId
          ? getCardCustomization(selectedCustomizations, selectedCardId)
          : null
      }
      disabled={disabled || selected.loading}
      onChange={updateCustomization}
    />
  </div>
);
```

`renderPreviewCard` ควรใช้ renderer เดียวกับ Dashboard จริงหรือใช้ shared renderer ที่แยกออกมาจาก `DashboardPanel.tsx` ไม่ควรคัดลอก JSX ของ chart/stat card ไปไว้ใน Preview อีกชุดหนึ่ง เพราะจะทำให้ Preview กับ Dashboard แสดงผลไม่ตรงกันในอนาคต

## 11. การเชื่อม Draft/Saved กับ SettingsPanel

ปัจจุบัน `SettingsPanel` มี coordinator อยู่แล้ว:

```tsx
const layoutEditorRef = useRef<DashboardLayoutEditorHandle>(null);

const isDirty =
  JSON.stringify(draftColors) !== JSON.stringify(savedColors) ||
  JSON.stringify(rateForm) !== JSON.stringify(savedRateForm) ||
  sheetIdInput !== savedSheetId ||
  JSON.stringify(branchRateForm) !== JSON.stringify(savedBranchRateForm) ||
  branchNameInput !== savedBranchNameInput ||
  branchCodeInput !== savedBranchCodeInput ||
  layoutDirty;
```

Phase 2 ให้คง API เดิม และเพิ่ม customization เข้าไปใน layout draft ที่ `DashboardLayoutEditor` เป็นเจ้าของ

```ts
export type DashboardLayoutEditorHandle = {
  saveDraft: () => Promise<void>;
  cancelDraft: () => void;
  resetDraft?: () => void;
};
```

ไม่ควรให้ `CustomizationPanel` เพิ่ม `onSave` ของตัวเอง เพราะจะทำให้เกิดหลาย transaction และทำลาย flow:

```text
Settings Unlock
  → แก้ Component Library/Preview/Panel
  → layoutDirty = true
  → Settings Save รวม
  → DashboardLayoutEditor.saveDraft()
  → Supabase upsert
  → snapshot ใหม่
  → Settings Lock
```

เมื่อกด Cancel:

```text
Settings Cancel
  → DashboardLayoutEditor.cancelDraft()
  → คืน layout + customizations จาก snapshot
  → selectedCardId ยังคงเป็น UI state หรือ reset เป็น null
  → dirty = false
  → lock = true
```

## 12. การปรับ renderer ให้ property มีผลจริง

อย่าเพิ่ม setting ที่ยังไม่มีผลใน renderer ตัวอย่างเช่น `showIcon` ต้องถูกส่งเข้า shared card renderer ก่อน

```tsx
function DashboardCardFrame({
  card,
  customization,
  children,
}: {
  card: DashboardCardLayout;
  customization: DashboardCardCustomization;
  children: ReactNode;
}) {
  const toneClass = getToneClass(customization.tone);

  return (
    <article
      data-dashboard-card-id={card.id}
      className={`relative min-w-0 ${toneClass} ${
        customization.density === "compact" ? "p-2" : "p-4"
      }`}
      style={{
        order: card.order,
        gridColumn: `span ${card.width} / span ${card.width}`,
        minHeight: `${card.height * 80}px`,
      }}
    >
      {children}
    </article>
  );
}

function getToneClass(tone: DashboardSemanticTone | undefined): string {
  switch (tone) {
    case "primary":
      return "border-primary/40";
    case "success":
      return "border-success/40";
    case "warning":
      return "border-warning/40";
    case "destructive":
      return "border-destructive/40";
    case "muted":
      return "opacity-75";
    default:
      return "border-border";
  }
}
```

การใช้ semantic class/token สำคัญกว่าการเก็บสี hex ใหม่ เพราะโปรเจ็กต์ใช้ design tokens และต้องรองรับ Light/Dark mode เดิม

## 13. `SettingsPanel` integration ที่แนะนำ

ใน `SettingsPanel.tsx` ควรคงแท็บ `layout` เดิม แล้วส่ง props ผ่าน `DashboardLayoutEditor` ไม่ควรสร้างแท็บใหม่ชื่อ `customization` หาก Layout tab เป็นพื้นที่ที่ผู้ใช้เข้าใจอยู่แล้ว

```tsx
{activeTab === "layout" && (
  <DashboardLayoutEditor
    ref={layoutEditorRef}
    userId={userId}
    isGuest={isGuest}
    disabled={isLocked || isSaving}
    onDirtyChange={setLayoutDirty}
  />
)}
```

ถ้าต้องการแยก UI เป็นสอง section ให้ใช้ sub-navigation ภายใน Layout tab เช่น `จัดวาง` และ `ปรับแต่ง` แต่ต้องใช้ `layoutEditorRef` และ dirty state เดียวกัน

## 14. Validation ที่ต้องมี

Property field ทุกตัวควรตรวจค่าก่อนใส่ Draft

```ts
export function normalizeCardCustomization(
  input: Partial<DashboardCardCustomization> | undefined,
): DashboardCardCustomization {
  return {
    visible: input?.visible !== false,
    tone: isTone(input?.tone) ? input.tone : "default",
    showTitle: input?.showTitle !== false,
    showIcon: input?.showIcon !== false,
    density: input?.density === "compact" ? "compact" : "comfortable",
  };
}
```

ข้อกำหนดขั้นต่ำ:

- ค่า boolean ต้องเป็น boolean จริง
- tone ต้องอยู่ใน semantic token ที่กำหนด
- density ต้องเป็น enum ที่กำหนด
- card ID ที่ไม่รู้จักต้องถูก ignore ตอน normalize
- card ที่ไม่มี customization ต้องใช้ default
- layout version 1 ที่ไม่มี `customizations` ต้องเปิดได้ตามเดิม
- การซ่อนการ์ดต้องไม่ลบการ์ดออกจาก layout array เพราะจะทำให้ Restore/Reset ยาก

## 15. Test Skeleton

### Unit test: pure customization update

```ts
it("updates one card customization without mutating other cards", () => {
  const before = createDefaultDashboardLayout("mobile");
  const after = updateCardCustomization(before, "net-income", {
    visible: false,
  });

  expect(after).not.toBe(before);
  expect(getCardCustomization(after.customizations, "net-income").visible).toBe(false);
  expect(after.cards).toEqual(before.cards);
});
```

### Backward compatibility

```ts
it("normalizes version 1 layout without customizations", () => {
  const legacy = createDefaultDashboardLayout("desktop");
  const normalized = normalizeDashboardLayoutDocument(legacy, "desktop");

  expect(normalized.cards).toHaveLength(14);
  expect(getCardCustomization(normalized.customizations, "hours").visible).toBe(true);
});
```

### Component behavior

```tsx
it("does not mark dirty when selecting a component", async () => {
  const onDirtyChange = vi.fn();
  render(
    <ComponentLibrary
      selectedId={null}
      visibleById={{}}
      disabled={false}
      onSelect={() => undefined}
    />,
  );

  await user.click(screen.getByRole("button", { name: /รายได้สุทธิรวม/i }));
  expect(onDirtyChange).not.toHaveBeenCalled();
});
```

### Lock behavior

```tsx
it("disables customization fields while Settings is locked", () => {
  render(
    <CustomizationPanel
      componentId="hours"
      value={DEFAULT_CARD_CUSTOMIZATION}
      disabled
      onChange={vi.fn()}
    />,
  );

  expect(screen.getByRole("checkbox", { name: /แสดงองค์ประกอบ/i })).toBeDisabled();
});
```

## 16. Acceptance Criteria ของ Phase 2

Phase 2 จะถือว่าผ่านเมื่อ:

1. Component Library แสดงการ์ดทั้งหมดจาก registry โดยใช้ `DashboardCardId` เดิม
2. เลือกการ์ดแล้วแสดง selection state ใน Preview โดยไม่ทำให้ dirty
3. Customization Panel แสดงเฉพาะ controls ที่ capability รองรับ
4. การเปลี่ยน property แก้ Draft เท่านั้นและแสดงผลใน Preview
5. เมื่อ Locked ทุก control สำหรับแก้ไขถูก disabled
6. Dashboard จริงยังไม่มี drag/resize/customization control
7. Save รวมจาก Settings เป็นจุดเดียวที่เรียก persistence
8. Cancel คืนทั้ง layout และ customization snapshot
9. layout version 1 เดิมยังโหลดได้
10. สูตรคำนวณรายได้ ชั่วโมง OT ค่าแรง GPS และข้อมูล Work Log ไม่ถูกแตะ
11. Guest Mode ไม่เขียน Supabase
12. Lint, tests และ `npm run build:render` ผ่าน

## 17. สิ่งที่ไม่ทำใน Phase 2

เพื่อควบคุมความเสี่ยง ยังไม่ทำสิ่งต่อไปนี้:

- Free-position ด้วยพิกัด pixel
- Resize ด้วย pointer handle
- Multi-select
- Marquee selection
- Undo/Redo แบบหลายขั้น
- Alignment guide
- Drag แบบเรียลไทม์บน Dashboard จริง
- การเพิ่มสูตรหรือฟิลด์ Work Log
- การปรับสีด้วย arbitrary hex ที่ข้าม design tokens
- การสร้างตาราง Supabase ใหม่สำหรับ property ย่อยของการ์ด

สิ่งเหล่านี้ควรไปอยู่ใน Phase 3–5 หลัง Component Library และ shared renderer มี test coverage เพียงพอแล้ว

## 18. ลำดับการลงมือทำจริง

1. สร้าง `dashboard-components.ts` และ registry จาก card IDs เดิม
2. เพิ่ม `dashboard-customization.ts` พร้อม default/normalize/immutable update
3. แยก shared card frame/renderer ที่ใช้ร่วมกันระหว่าง Preview และ Dashboard
4. สร้าง `ComponentLibrary.tsx`
5. สร้าง `CustomizationPanel.tsx` และ `PropertyField.tsx`
6. เชื่อมสอง panel เข้ากับ `DashboardLayoutEditor`
7. เชื่อม customization draft เข้ากับ `saveDraft()` และ `cancelDraft()` เดิม
8. เพิ่ม tests สำหรับ normalize, update, lock, dirty และ backward compatibility
9. รัน lint/test/build
10. เปิด Preview และแสดงตัวอย่างให้ผู้ใช้อนุมัติก่อนแก้ source จริงหรือ Commit/Push

**Phase 2 นี้ควรทำเป็นชุด Commit แยกจาก Phase 3 Pointer Drag/Resize เพื่อให้ rollback และตรวจ regression ได้ง่าย**
