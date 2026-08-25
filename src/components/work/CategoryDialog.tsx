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
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    if (open) {
      setDraft(categories);
      setValue("");
      setError("");
      setEditingIndex(null);
      setEditValue("");
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

  const startRename = (index: number) => {
    setEditingIndex(index);
    setEditValue(draft[index] || "");
    setError("");
  };

  const saveRename = (index: number) => {
    const nextName = editValue.trim();
    if (!nextName) {
      setEditingIndex(null);
      return;
    }
    if (draft.some((c, i) => i !== index && c.toLowerCase() === nextName.toLowerCase())) {
      setError("ชื่อประเภทงานนี้ซ้ำกับรายการอื่น");
      return;
    }
    const next = draft.map((c, i) => (i === index ? nextName : c));
    setDraft(next);
    onSave(next);
    setEditingIndex(null);
    setEditValue("");
    setError("");
  };

  const remove = (index: number) => {
    if (draft.length <= 1) {
      setError("ต้องมีประเภทงานอย่างน้อย 1 รายการ");
      return;
    }
    const next = draft.filter((_, i) => i !== index);
    setDraft(next);
    onSave(next);
    if (editingIndex === index) {
      setEditingIndex(null);
    }
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
              key={`${cat}-${index}`}
              className="flex items-center justify-between gap-2 rounded-lg border border-border bg-card p-2.5 text-sm"
            >
              {editingIndex === index ? (
                <div className="flex flex-1 items-center gap-2">
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveRename(index);
                      if (e.key === "Escape") setEditingIndex(null);
                    }}
                    autoFocus
                    className="w-full rounded-md border border-primary bg-background px-2 py-1 text-sm focus:outline-none"
                  />
                  <button
                    onClick={() => saveRename(index)}
                    className="rounded-md bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground"
                  >
                    บันทึก
                  </button>
                  <button
                    onClick={() => setEditingIndex(null)}
                    className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground hover:bg-muted/80"
                  >
                    ยกเลิก
                  </button>
                </div>
              ) : (
                <>
                  <span className="font-medium">{cat}</span>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => startRename(index)}
                      aria-label={`แก้ไข ${cat}`}
                      className="rounded p-1.5 text-primary hover:bg-accent cursor-pointer"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => remove(index)}
                      aria-label={`ลบ ${cat}`}
                      className="rounded p-1.5 text-destructive hover:bg-destructive/10 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
