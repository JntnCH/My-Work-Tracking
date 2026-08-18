import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";

type Props = {
  open: boolean;
  categories: string[];
  onSave: (next: string[]) => void;
  onClose: () => void;
};

export function CategoryDialog({ open, categories, onSave, onClose }: Props) {
  const [draft, setDraft] = useState<string[]>(categories);
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setDraft(categories);
      setValue("");
      setError("");
    }
  }, [open, categories]);

  if (!open) return null;

  const add = () => {
    const v = value.trim();
    if (!v) return;
    if (draft.includes(v)) {
      setError("ประเภทงานนี้มีอยู่แล้ว");
      return;
    }
    const next = [...draft, v];
    setDraft(next);
    onSave(next);
    setValue("");
    setError("");
  };

  const rename = (index: number) => {
    const current = draft[index]!;
    const nextName = window.prompt("แก้ไขชื่อประเภทงาน:", current);
    if (!nextName?.trim()) return;
    const next = draft.map((c, i) => (i === index ? nextName.trim() : c));
    setDraft(next);
    onSave(next);
  };

  const remove = (index: number) => {
    if (draft.length <= 1) {
      setError("ต้องมีประเภทงานอย่างน้อย 1 รายการ");
      return;
    }
    const next = draft.filter((_, i) => i !== index);
    setDraft(next);
    onSave(next);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-0 md:items-center md:p-4">
      <div className="surface-card w-full max-w-md p-5" role="dialog" aria-label="จัดการประเภทงาน">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-bold">จัดการประเภทงาน</h3>
          <button onClick={onClose} aria-label="ปิด" className="rounded-md p-1 hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-3 flex gap-2">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="เพิ่มประเภทงานใหม่"
            aria-label="ชื่อประเภทงานใหม่"
            className="w-full rounded-lg border border-input bg-secondary p-2.5 text-sm"
          />
          <button
            onClick={add}
            className="flex items-center gap-1 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground"
          >
            <Plus className="h-4 w-4" /> เพิ่ม
          </button>
        </div>
        {error ? <p className="mb-2 text-xs text-destructive">{error}</p> : null}

        <div className="max-h-64 space-y-2 overflow-y-auto" data-testid="category-list">
          {draft.map((cat, index) => (
            <div
              key={cat}
              className="flex items-center justify-between rounded-lg border border-border bg-card p-2.5 text-sm"
            >
              <span className="font-medium">{cat}</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => rename(index)}
                  aria-label={`แก้ไข ${cat}`}
                  className="rounded p-1.5 text-primary hover:bg-accent"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => remove(index)}
                  aria-label={`ลบ ${cat}`}
                  className="rounded p-1.5 text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
