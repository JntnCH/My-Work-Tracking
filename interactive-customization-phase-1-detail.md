# รายละเอียด Phase 1: Foundation และ Preview Canvas

**โปรเจ็กต์:** My-Work-Tracking  
**เป้าหมายของเอกสาร:** อธิบายการทำงานระยะ Foundation และแสดงโครงสร้างโค้ดเบื้องต้นสำหรับ Preview Canvas โดยยังไม่แก้ source code, ไม่เพิ่ม migration, ไม่เปลี่ยนสูตรคำนวณ และไม่ Commit/Push

## 1. เป้าหมายของ Phase 1

Phase 1 เป็นการสร้างฐานกลางสำหรับ Interactive Customization Editor ก่อนเพิ่มความสามารถที่มีความเสี่ยงสูง เช่น การลากด้วย Touch, Resize Handle, Grid Snap, Multi-select และ Undo/Redo โดยระยะนี้ควรทำให้ผู้ใช้เห็น **ตัวอย่าง Dashboard จาก Layout draft ใน Settings** ได้จริง และยืนยันว่าการแสดงผลของ Preview ใกล้เคียงกับหน้า Dashboard ที่ใช้งานอยู่

Preview Canvas ในระยะนี้ยังเป็น **Read-only Preview** กล่าวคือ ผู้ใช้สามารถเปลี่ยนไปดู Mobile/Desktop และเลือกการ์ดเพื่อดูสถานะได้ แต่ยังไม่ลากหรือยืดการ์ดด้วย Pointer การเปลี่ยนค่าความกว้าง ความสูง หรือลำดับยังใช้ control เดิมของ `DashboardLayoutEditor` และจะยังเป็น draft จนกด Save ผ่าน coordinator ของ `SettingsPanel`

> หลักการสำคัญ: Preview Canvas ต้องอ่านค่าจาก draft state เท่านั้น และห้ามเรียก `saveLayout`, `saveDashboardLayout` หรือ Supabase จากการ render, การเลือกการ์ด หรือการ preview

## 2. สิ่งที่มีอยู่แล้วและควรนำมาใช้ซ้ำ

ระบบปัจจุบันมี `DashboardLayout` version 1 ซึ่งประกอบด้วย `cards` และแต่ละการ์ดมี `id`, `group`, `order`, `width` และ `height` อยู่แล้ว จึงยังไม่ควรเพิ่มฟิลด์ `x`, `y`, `visible` หรือ `selected` ใน Phase 1 เพราะจะทำให้ schema เปลี่ยนก่อนที่ interaction model จะนิ่ง [1]

`DashboardLayoutEditor` มีการแยก Mobile/Desktop, draft snapshot, dirty tracking, Reset, Save Draft และ Cancel Draft อยู่แล้ว ส่วน `useDashboardLayout` แยก `layout`, `loaded`, `loading`, `saving`, `updateLayout`, `saveLayout` และ `resetLayout` ให้ใช้งานได้โดยตรง [2] [3]

หน้า Dashboard จริงมี `cardMap`, `renderCard` และ `DashboardCard` wrapper ที่คำนวณ `gridColumn`, `order` และ `minHeight` จาก Layout ปัจจุบัน ดังนั้น Preview Canvas ควรใช้กติกา grid เดียวกัน หรือแยก utility กลางออกมาใช้ร่วมกัน ไม่ควรสร้างสูตรการคำนวณชุดที่สอง [4]

| สัญญาที่มีอยู่ | การใช้ใน Phase 1 | การตัดสินใจ |
|---|---|---|
| `DashboardLayout.version = 1` | เป็น input ของ Canvas | คงเดิม ไม่ทำ migration |
| `DashboardCardLayout.width/height` | คำนวณขนาด preview | ใช้กติกาเดิมและ clamp ค่า |
| `DashboardCardLayout.order` | เรียงการ์ดในแต่ละ group | ใช้ `getDashboardCards()` เดิม |
| `DashboardViewport` | เปลี่ยน Mobile/Desktop | ใช้ type เดิม |
| `useDashboardLayout` | จัดการ draft และ persistence | ไม่ให้ Canvas เรียก save เอง |
| `SettingsPanel` coordinator | Save/Cancel/Lock/Unlock | คงเป็นเจ้าของ transaction |
| Dashboard renderer | อ้างอิง visual frame | แยกเฉพาะ wrapper ที่ใช้ร่วมกันได้ |

## 3. ขอบเขตงานของ Phase 1

### 3.1 อยู่ในขอบเขต

Phase 1 ควรเพิ่มพื้นที่ Preview Canvas ในแท็บ Layout ของ Settings โดยแสดงกลุ่มการ์ดเดิมทั้งหมด ได้แก่ รายได้สุทธิ สถิติการทำงาน รายรับและรายการหัก และกราฟ การ์ดแต่ละใบควรใช้ `data-dashboard-card-id` และ `data-testid` ที่สื่อความหมายเพื่อรองรับการทดสอบและการต่อยอดใน Phase ถัดไป

Canvas ต้องรองรับการแสดงผล Mobile และ Desktop โดยใช้ layout draft ของ viewport ที่เลือก หากกำลังโหลดข้อมูลจาก Supabase ให้แสดง loading state และไม่ถือว่าการเปลี่ยนแปลงระหว่างโหลดเป็น unsaved change หากเป็น Guest ให้ใช้ default layout หรือ session draft ตามพฤติกรรมของ hook เดิม และไม่เขียน Supabase

### 3.2 ยังไม่อยู่ในขอบเขต

Phase 1 ยังไม่ควรทำ Pointer Drag, Touch Drag, Long Press, Resize Handle, Free Position, Multi-select, Grid Snap, Alignment Guide, Undo/Redo หรือการเปลี่ยน schema ฐานข้อมูล ความสามารถเหล่านี้ควรเริ่มหลังจาก Canvas และ shared rendering contract ผ่านการทดสอบก่อน

## 4. โครงสร้างไฟล์ที่แนะนำ

เพื่อให้ diff เล็กและแยกความรับผิดชอบชัดเจน แนะนำโครงสร้างดังนี้

```text
src/
├─ components/work/
│  ├─ DashboardPanel.tsx                 # หน้าใช้งานจริง View-only
│  ├─ DashboardLayoutEditor.tsx          # coordinator ของ Layout draft เดิม
│  ├─ DashboardPreviewCanvas.tsx         # Canvas ใหม่ของ Phase 1
│  ├─ DashboardPreviewCard.tsx           # visual preview card แบบ read-only
│  └─ DashboardCardFrame.tsx             # wrapper/grid rule ที่ใช้ร่วมกับ Dashboard
└─ lib/
   ├─ dashboard-layout.ts                 # model, normalize, reorder, persistence เดิม
   └─ dashboard-card-config.ts            # label/icon/preview metadata ที่ใช้ร่วมกัน
```

การแยก `DashboardCardFrame` เป็นขั้นตอนที่ช่วยลดความเสี่ยง เพราะปัจจุบัน logic ของ `order`, `gridColumn` และ `minHeight` อยู่ใน `DashboardPanel.tsx` หาก Preview คัดลอก logic นี้เอง ต่อไปการแก้กติกา grid อาจทำให้หน้า Dashboard และ Preview แสดงผลไม่ตรงกัน

## 5. Data flow ของ Phase 1

```text
Supabase / default layout
          │
          ▼
useDashboardLayout(viewport)
          │
          ├── committed snapshot ใน DashboardLayoutEditor
          ├── draft layout
          │       │
          │       ├── DashboardPreviewCanvas  (อ่านอย่างเดียว)
          │       └── LayoutCardRow controls   (แก้ draft เดิม)
          │
          ▼
SettingsPanel Save/Cancel coordinator
          │
          └── saveLayout() เฉพาะเมื่อผู้ใช้กด Save
```

Canvas รับ `layout` เป็น prop และไม่ควรรู้จัก Supabase หรือ `SettingsPanel` โดยตรง การตัดสินใจว่าแก้ไขได้หรือไม่อยู่ที่ `disabled` และการตัดสินใจว่าจะบันทึกหรือยกเลิกอยู่ที่ parent coordinator เดิม

## 6. TypeScript contract ของ Preview Canvas

สร้างไฟล์ `src/components/work/DashboardPreviewCanvas.tsx` โดยเริ่มจาก contract ที่ไม่ผูกกับ persistence ดังนี้

```tsx
import type {
  DashboardCardId,
  DashboardLayout,
  DashboardViewport,
} from "@/lib/dashboard-layout";

export type DashboardPreviewCanvasProps = {
  layout: DashboardLayout;
  viewport: DashboardViewport;
  loading?: boolean;
  disabled?: boolean;
  selectedCardId?: DashboardCardId | null;
  onSelectCard?: (cardId: DashboardCardId) => void;
};
```

`onSelectCard` เป็น callback สำหรับ local selection เท่านั้น ไม่ใช่ callback สำหรับ update layout การเลือกการ์ดไม่ควรทำให้ `isDirty` เปลี่ยน และไม่ควรเขียนลง LocalStorage หรือ Supabase

## 7. โครงสร้าง Preview Canvas เบื้องต้น

โค้ดต่อไปนี้เป็นโครงสร้างเริ่มต้นที่สามารถนำไปแตกเป็นไฟล์จริงได้ โดยใช้ `getDashboardCards()` เดิมเพื่อรักษาลำดับตาม group และใช้ `DashboardCardFrame` เป็นจุดร่วมของหน้า Dashboard กับ Preview

```tsx
import { getDashboardCards, type DashboardCardGroup } from "@/lib/dashboard-layout";
import type { DashboardPreviewCanvasProps } from "./DashboardPreviewCanvas";
import { DashboardPreviewCard } from "./DashboardPreviewCard";

const PREVIEW_GROUPS: Array<{ id: DashboardCardGroup; label: string }> = [
  { id: "net", label: "รายได้สุทธิ" },
  { id: "work", label: "สถิติการทำงาน" },
  { id: "income", label: "รายรับและรายการหัก" },
  { id: "charts", label: "กราฟ" },
];

export function DashboardPreviewCanvas({
  layout,
  viewport,
  loading = false,
  disabled = false,
  selectedCardId = null,
  onSelectCard,
}: DashboardPreviewCanvasProps) {
  const canvasWidth = viewport === "mobile" ? "max-w-[390px]" : "max-w-5xl";

  if (loading) {
    return (
      <section
        aria-label="กำลังโหลดตัวอย่าง Dashboard"
        data-testid="dashboard-preview-loading"
        className={`mx-auto ${canvasWidth} rounded-2xl border border-border bg-card p-4`}
      >
        <div className="animate-pulse space-y-3">
          <div className="h-5 w-40 rounded bg-secondary" />
          <div className="h-24 rounded-xl bg-secondary" />
          <div className="grid grid-cols-2 gap-2">
            <div className="h-20 rounded-xl bg-secondary" />
            <div className="h-20 rounded-xl bg-secondary" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      aria-label={`ตัวอย่าง Dashboard ${viewport === "mobile" ? "Mobile" : "Desktop"}`}
      data-testid="dashboard-preview-canvas"
      data-dashboard-preview-viewport={viewport}
      className={`mx-auto ${canvasWidth} rounded-2xl border border-border bg-secondary/30 p-3 sm:p-4`}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <h4 className="text-sm font-bold">Preview Dashboard</h4>
          <p className="text-[11px] text-muted-foreground">
            ตัวอย่างนี้ยังไม่บันทึกการเปลี่ยนแปลงจนกด Save
          </p>
        </div>
        <span className="rounded-full border border-border bg-card px-2 py-1 text-[10px] text-muted-foreground">
          {viewport === "mobile" ? "Mobile" : "Desktop"}
        </span>
      </div>

      <div className="space-y-4">
        {PREVIEW_GROUPS.map((group) => {
          const cards = getDashboardCards(layout, group.id);
          if (cards.length === 0) return null;

          return (
            <section key={group.id} aria-labelledby={`preview-group-${group.id}`}>
              <h5
                id={`preview-group-${group.id}`}
                className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground"
              >
                {group.label}
              </h5>
              <div
                className="grid items-stretch gap-2 sm:gap-3"
                style={{
                  gridTemplateColumns: `repeat(${getPreviewColumns(group.id, viewport)}, minmax(0, 1fr))`,
                }}
              >
                {cards.map((card) => (
                  <DashboardPreviewCard
                    key={card.id}
                    card={card}
                    viewport={viewport}
                    selected={selectedCardId === card.id}
                    disabled={disabled}
                    onSelect={onSelectCard}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}

function getPreviewColumns(group: DashboardCardGroup, viewport: DashboardViewport): number {
  if (group === "charts") return viewport === "mobile" ? 1 : 2;
  return viewport === "mobile" ? 2 : 3;
}
```

ใน Phase 1 ฟังก์ชัน `getPreviewColumns()` ควรใช้กติกาเดียวกับ `getGridColumns()` ในหน้า Dashboard หากมีการ refactor ให้ย้ายกติกานี้ไป utility กลางแทนการมีสอง implementation

## 8. โครงสร้าง Preview Card เบื้องต้น

สร้างไฟล์ `src/components/work/DashboardPreviewCard.tsx` โดยใช้ข้อมูลตัวอย่างที่ไม่ใช่ข้อมูลจริงของผู้ใช้ การใช้ placeholder ทำให้ Preview แยกจากสูตรคำนวณและไม่ทำให้ผู้ใช้เข้าใจว่าค่าตัวอย่างถูกบันทึกเป็นรายได้จริง

```tsx
import type {
  DashboardCardLayout,
  DashboardViewport,
} from "@/lib/dashboard-layout";

const CARD_LABELS: Record<DashboardCardLayout["id"], string> = {
  "net-income": "รายได้สุทธิรวม",
  "work-days": "วันทำงานทั้งหมด",
  "days-with-ot": "วันที่มี OT",
  "days-without-ot": "วันที่ไม่มี OT",
  tasks: "งานที่ทำเสร็จ",
  "tasks-average": "เฉลี่ยงานต่อวัน",
  hours: "ชั่วโมงรวม",
  "ot-income": "ค่า OT",
  allowance: "เบี้ยเลี้ยงและรายรับอื่น",
  deductions: "รายการหักรวม",
  "daily-income": "รายได้รายวัน",
  "daily-tasks": "จำนวนงานที่ทำเสร็จรายวัน",
  "work-type-income": "สัดส่วนรายได้ตามประเภทงาน",
  "frequent-location": "สถานที่ทำงานบ่อยที่สุด",
};

type Props = {
  card: DashboardCardLayout;
  viewport: DashboardViewport;
  selected: boolean;
  disabled: boolean;
  onSelect?: (cardId: DashboardCardLayout["id"]) => void;
};

export function DashboardPreviewCard({
  card,
  viewport,
  selected,
  disabled,
  onSelect,
}: Props) {
  const columns = card.group === "charts" ? (viewport === "mobile" ? 1 : 2) : viewport === "mobile" ? 2 : 3;
  const width = clamp(card.width, 1, columns);
  const minHeight = card.group === "charts" ? card.height * 96 : card.height * 80;
  const canSelect = Boolean(onSelect) && !disabled;

  return (
    <div
      role={canSelect ? "button" : undefined}
      tabIndex={canSelect ? 0 : undefined}
      aria-label={canSelect ? `เลือก ${CARD_LABELS[card.id]}` : CARD_LABELS[card.id]}
      aria-selected={selected}
      data-dashboard-card-id={card.id}
      data-testid={`dashboard-preview-card-${card.id}`}
      onClick={() => {
        if (canSelect) onSelect?.(card.id);
      }}
      onKeyDown={(event) => {
        if (!canSelect || (event.key !== "Enter" && event.key !== " ")) return;
        event.preventDefault();
        onSelect?.(card.id);
      }}
      className={`relative min-w-0 rounded-xl border bg-card p-3 text-left transition ${
        selected ? "border-primary ring-2 ring-primary/20" : "border-border"
      } ${canSelect ? "cursor-pointer hover:border-primary/60" : ""}`}
      style={{
        order: card.order,
        gridColumn: `span ${width} / span ${width}`,
        minHeight: `${minHeight}px`,
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="truncate text-xs font-semibold text-foreground">
          {CARD_LABELS[card.id]}
        </span>
        {selected ? (
          <span className="shrink-0 text-[10px] font-semibold text-primary">เลือกอยู่</span>
        ) : null}
      </div>

      <div className="mt-4 space-y-2" aria-hidden="true">
        <div className="h-6 w-2/3 rounded bg-secondary" />
        {card.group === "charts" ? (
          <div className="flex h-16 items-end gap-1">
            {[40, 65, 50, 80, 58, 72].map((height, index) => (
              <span
                key={index}
                className="flex-1 rounded-t bg-primary/35"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        ) : (
          <div className="h-3 w-1/2 rounded bg-secondary" />
        )}
      </div>
    </div>
  );
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
```

ข้อควรระวังคือการใช้ `role="button"` ต้องมี Keyboard handler คู่กัน หากไม่ต้องการให้เลือกการ์ดขณะ Locked สามารถปล่อย `role` และ `tabIndex` เป็น `undefined` เมื่อ `disabled=true` ได้ แต่ตัว Canvas ควรยังมองเห็นได้เพื่อให้ผู้ใช้ตรวจสอบค่าที่บันทึกแล้ว

## 9. การแยก Frame กลางระหว่าง Dashboard และ Preview

ปัจจุบัน `DashboardPanel.tsx` มี `DashboardCard` ซึ่งคำนวณ `gridColumn`, `order` และ `minHeight` อยู่ภายใน component การเริ่ม Phase 1 ที่ปลอดภัยคือย้ายเฉพาะกติกา wrapper ไปยังไฟล์ใหม่ โดยยังคง `data-testid` เดิมของหน้าใช้งานจริง

```tsx
// src/components/work/DashboardCardFrame.tsx
import type { ReactNode } from "react";
import type {
  DashboardCardGroup,
  DashboardCardLayout,
  DashboardViewport,
} from "@/lib/dashboard-layout";

type Props = {
  card: DashboardCardLayout;
  viewport: DashboardViewport;
  children: ReactNode;
  className?: string;
};

export function DashboardCardFrame({ card, viewport, children, className = "" }: Props) {
  const columns = getDashboardGridColumns(card.group, viewport);
  const width = clamp(card.width, 1, columns);
  const minHeight = card.group === "charts" ? card.height * 96 : card.height * 80;

  return (
    <article
      className={`relative min-w-0 ${className}`}
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

export function getDashboardGridColumns(
  group: DashboardCardGroup,
  viewport: DashboardViewport,
): number {
  if (group === "charts") return viewport === "mobile" ? 1 : 2;
  return viewport === "mobile" ? 2 : 3;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
```

จากนั้น `DashboardPanel.tsx` และ `DashboardPreviewCard.tsx` จึงใช้ `DashboardCardFrame` หรือ utility เดียวกัน การ refactor นี้ต้องตรวจ `data-testid` และ visual snapshot ให้เหมือนเดิมก่อนจึงถือว่าผ่าน Foundation

## 10. การเชื่อมเข้ากับ DashboardLayoutEditor

ไม่ควรให้ Canvas เป็นเจ้าของ draft หรือ persistence ให้แทรก Canvas ใน `DashboardLayoutEditor` หลังแถบเลือก Mobile/Desktop และก่อน `fieldset` ที่มีรายการ control เดิม

```tsx
const [selectedCardId, setSelectedCardId] = useState<DashboardCardId | null>(null);

// หลัง viewport selector
<DashboardPreviewCanvas
  layout={selected.layout}
  viewport={selectedViewport}
  loading={selected.loading || !selected.loaded}
  disabled={disabled}
  selectedCardId={selectedCardId}
  onSelectCard={setSelectedCardId}
/>

<fieldset disabled={disabled} className="space-y-5">
  {/* LayoutCardRow เดิม: reorder + width + height */}
</fieldset>
```

การเลือกการ์ดจะเปลี่ยนเพียง `selectedCardId` ซึ่งเป็น UI state ชั่วคราว ไม่เปลี่ยน `DashboardLayout` และไม่ทำให้ `onDirtyChange` ถูกเรียกเป็น true ความกว้าง ความสูง และลำดับที่แก้ใน `LayoutCardRow` จะเปลี่ยน `selected.layout` ตาม hook เดิม และ Canvas จะ re-render จาก draft โดยอัตโนมัติ

## 11. การกำหนด Save/Cancel ให้ไม่ซ้ำกับระบบเดิม

`DashboardLayoutEditorHandle` ที่มีอยู่แล้วควรคงเดิม:

```tsx
export type DashboardLayoutEditorHandle = {
  saveDraft: () => Promise<void>;
  cancelDraft: () => void;
};
```

Phase 1 ไม่ควรเพิ่ม `savePreview()` หรือ `persistCanvas()` เพราะจะทำให้มีเส้นทางบันทึกมากกว่าหนึ่งจุด ปุ่ม Save หลักของ `SettingsPanel` ยังคงเรียก `layoutEditorRef.current?.saveDraft()` และปุ่ม Cancel ยังคงเรียก `cancelDraft()` ตามลำดับเดิม [2]

| การกระทำ | เจ้าของ state | ผลที่คาดหวัง |
|---|---|---|
| เปลี่ยน Mobile/Desktop | `DashboardLayoutEditor` | เปลี่ยนเฉพาะ viewport ที่กำลังดู |
| เลือกการ์ดใน Canvas | `DashboardPreviewCanvas` local state | เปลี่ยนกรอบ selection เท่านั้น |
| เปลี่ยน width/height/order | `useDashboardLayout` draft | Canvas เปลี่ยนทันทีและ dirty เป็น true |
| กด Cancel | `SettingsPanel` → editor ref | คืน snapshot ล่าสุดที่บันทึกแล้ว |
| กด Save | `SettingsPanel` → editor ref | เรียก persistence ตาม hook เดิม |
| กด Lock | `SettingsPanel` | ป้องกันการแก้ controls และ interaction |

## 12. เกณฑ์ยอมรับของ Phase 1

Phase 1 ถือว่าผ่านเมื่อผู้ใช้เปิดแท็บ Layout แล้วเห็น Preview Canvas ครบทุกการ์ดใน Mobile และ Desktop โดยลำดับ ความกว้าง ความสูง และ min-height สอดคล้องกับ Dashboard จริง การสลับ viewport ต้องไม่ทำให้ draft ของอีก viewport หาย และการ reload ต้องโหลด layout ที่บันทึกแล้วกลับมาได้

การเลือกการ์ดใน Canvas ต้องไม่เรียก Supabase และไม่ทำให้ dirty state เปลี่ยน การแก้ width/height/order ผ่าน control เดิมต้องทำให้ Canvas เปลี่ยนทันที แต่ยังไม่บันทึกจนกด Save เมื่อกด Cancel Canvas ต้องกลับไปแสดง snapshot เดิม และเมื่อ Locked ต้องไม่สามารถแก้ผ่าน controls ได้

```text
[ ] Canvas แสดงผลใน Settings/Layout เท่านั้น
[ ] Mobile ใช้ 2 columns สำหรับ metric และ 1 column สำหรับ charts
[ ] Desktop ใช้ 3 columns สำหรับ metric และ 2 columns สำหรับ charts
[ ] card id, order, width, height ตรงกับ Dashboard layout เดิม
[ ] Loading state ไม่ทำให้เกิด false dirty
[ ] เลือกการ์ดไม่เปลี่ยน layout และไม่เขียนฐานข้อมูล
[ ] เปลี่ยน control เดิมแล้ว Preview แสดง draft ทันที
[ ] Cancel คืนค่า snapshot เดิม
[ ] Save ยังผ่าน Settings coordinator จุดเดียว
[ ] Guest Mode ไม่เขียน Supabase
[ ] `npm run build:render` และ ESLint ผ่าน
[ ] สูตรชั่วโมง ค่าแรง OT รายได้ และข้อมูล GPS ไม่ถูกแตะต้อง
```

## 13. Test skeleton ที่ควรเพิ่ม

หากโปรเจ็กต์มี Vitest และ React Testing Library พร้อมใช้งาน ให้เพิ่ม test เฉพาะ Preview Canvas โดยไม่ต้อง mock Supabase ใน test ที่เป็น pure rendering

```tsx
// src/components/work/__tests__/DashboardPreviewCanvas.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createDefaultDashboardLayout } from "@/lib/dashboard-layout";
import { DashboardPreviewCanvas } from "../DashboardPreviewCanvas";

describe("DashboardPreviewCanvas", () => {
  it("renders all cards from the layout once", () => {
    const layout = createDefaultDashboardLayout("mobile");

    render(
      <DashboardPreviewCanvas
        layout={layout}
        viewport="mobile"
        disabled
      />,
    );

    expect(screen.getByTestId("dashboard-preview-canvas")).toBeInTheDocument();
    expect(screen.getAllByTestId(/dashboard-preview-card-/)).toHaveLength(layout.cards.length);
  });

  it("does not mutate the layout when selecting a card", async () => {
    const layout = createDefaultDashboardLayout("desktop");
    const onSelectCard = vi.fn();

    render(
      <DashboardPreviewCanvas
        layout={layout}
        viewport="desktop"
        onSelectCard={onSelectCard}
      />,
    );

    await userEvent.click(screen.getByTestId("dashboard-preview-card-net-income"));

    expect(onSelectCard).toHaveBeenCalledWith("net-income");
    expect(layout).toEqual(createDefaultDashboardLayout("desktop"));
  });
});
```

ตัวอย่างนี้เป็น skeleton ต้องตรวจว่าปัจจุบัน test setup มี `@testing-library/react`, `@testing-library/user-event` และ matcher ของ `jest-dom` อยู่แล้วหรือไม่ก่อนเพิ่ม dependency ห้ามติดตั้ง dependency ใหม่ใน Phase 1 โดยไม่มีเหตุผลและไม่ตรวจ lockfile

## 14. ลำดับการลงมือทำจริง

ลำดับที่ปลอดภัยที่สุดคือเริ่มด้วยการ extract utility ของ grid และ frame พร้อมรัน build เพื่อยืนยันว่า Dashboard เดิมไม่เปลี่ยน จากนั้นสร้าง `DashboardPreviewCard` แบบ placeholder และ `DashboardPreviewCanvas` แบบ read-only แล้วเสียบเข้า Layout tab เมื่อ rendering ผ่านจึงเชื่อม selection state และเพิ่ม test IDs

หลังจากนั้นจึงทดสอบการเปลี่ยน width/height/order ผ่าน control เดิม โดยตรวจว่า Canvas เปลี่ยนตาม draft และ Cancel/Save coordinator ยังทำงานเหมือนเดิม ระยะสุดท้ายของ Phase 1 คือทดสอบ Guest Mode, viewport มือถือ, Render build และ `git diff --check` แล้วจัดทำภาพตัวอย่างก่อนเสนอให้ผู้ใช้อนุมัติ

| ขั้น | ไฟล์หลัก | ผลลัพธ์ | Persistence |
|---|---|---|---|
| 1 | `DashboardCardFrame.tsx`, `DashboardPanel.tsx` | shared grid/frame rule | ไม่มี |
| 2 | `DashboardPreviewCard.tsx` | card placeholder แบบ read-only | ไม่มี |
| 3 | `DashboardPreviewCanvas.tsx` | Canvas Mobile/Desktop | ไม่มี |
| 4 | `DashboardLayoutEditor.tsx` | แสดง Canvas จาก draft | ใช้ของเดิม |
| 5 | test file | ตรวจ rendering และ no mutation | mock/local |
| 6 | Settings/Render validation | ตรวจ Save/Cancel/Lock และ production build | ใช้ Supabase flow เดิม |

## 15. สิ่งที่จะยังไม่แก้ใน Phase 1

ไม่แก้ `work_logs`, สูตรชั่วโมงปกติ, ชั่วโมง OT, ตัวคูณ OT, ค่าแรง, ค่า OT, ค่าเดินทาง, ค่าอาหาร, รายรับอื่น, รายการหัก, รายได้สุทธิ, GPS หรือ timezone logic ไม่เพิ่มคอลัมน์ฐานข้อมูล ไม่ย้ายการแก้ Layout ไปหน้า Dashboard จริง และไม่เพิ่ม drag/resize interaction จนกว่า Preview Canvas จะผ่านเกณฑ์ Foundation

ไฟล์นี้เป็น **โครงสร้างและตัวอย่างโค้ดสำหรับการวางแผนเท่านั้น** ยังไม่มี source file ใดถูกแก้จากเอกสารนี้ และยังไม่มี Commit/Push

## References

[1]: https://github.com/JntnCH/My-Work-Tracking/blob/main/src/lib/dashboard-layout.ts "My-Work-Tracking: dashboard-layout.ts"

[2]: https://github.com/JntnCH/My-Work-Tracking/blob/main/src/components/work/DashboardLayoutEditor.tsx "My-Work-Tracking: DashboardLayoutEditor.tsx"

[3]: https://github.com/JntnCH/My-Work-Tracking/blob/main/src/hooks/use-dashboard-layout.ts "My-Work-Tracking: use-dashboard-layout.ts"

[4]: https://github.com/JntnCH/My-Work-Tracking/blob/main/src/components/work/DashboardPanel.tsx "My-Work-Tracking: DashboardPanel.tsx"

[5]: https://github.com/JntnCH/My-Work-Tracking/blob/main/src/components/work/SettingsPanel.tsx "My-Work-Tracking: SettingsPanel.tsx"
