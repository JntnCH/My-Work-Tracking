import { useEffect, useRef, useState } from "react";
import {
  Palette,
  RotateCcw,
  Save,
  Check,
  Plus,
  Pencil,
  Trash2,
  Settings2,
  Moon,
  Sun,
  Laptop,
  Database,
  Briefcase,
  Clock,
  RefreshCw,
  FileSpreadsheet,
  ShieldCheck,
  Sparkles,
  Sliders,
  Maximize2,
  Box,
  Lock,
  Unlock,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";
import type { DashboardLayoutState } from "@/hooks/use-dashboard-layout";
import type { BranchSettings, DBBranch, DBOtType, DBWorkType } from "@/lib/supabase-db";
import {
  DEFAULT_COLORS_DARK,
  DEFAULT_COLORS_LIGHT,
  GOOGLE_PRESETS,
  type BorderRadiusOption,
  type ButtonStyleOption,
  type CustomColors,
  type DensityOption,
  type ThemeMode,
} from "@/lib/theme";
import {
  extractSpreadsheetId,
  OT_OPTIONS,
  summarizeMonth,
  type RateSettings,
  type WorkLog,
} from "@/lib/work-log";
import { SheetsPanel } from "@/components/work/SheetsPanel";
import { createSaveCoordinator, type SaveScope } from "@/lib/save-coordinator";
import { AuthenticationSettings } from "@/components/work/AuthenticationSettings";
import {
  DashboardLayoutEditor,
  type DashboardLayoutEditorHandle,
} from "@/components/work/DashboardLayoutEditor";

type Props = {
  userId: string;
  authUser: User | null;
  isGuest?: boolean;
  workTypes: DBWorkType[];
  otTypes: DBOtType[];
  rates: RateSettings;
  themeSettings: CustomColors;
  savedThemeSettings: CustomColors;
  spreadsheetId: string;
  logs: WorkLog[];
  previewMonth: string;
  mobileLayout: DashboardLayoutState;
  desktopLayout: DashboardLayoutState;
  onAddWorkType: (name: string) => Promise<void>;
  onEditWorkType: (id: string, name: string) => Promise<void>;
  onToggleWorkType: (id: string) => Promise<void>;
  onSoftDeleteWorkType: (id: string) => Promise<void>;
  onSaveRates: (rates: RateSettings) => Promise<void>;
  branches: DBBranch[];
  activeBranchId: string | null;
  branchSettings: BranchSettings;
  branchSettingsLoading?: boolean;
  onAddBranch: (name: string, code?: string) => Promise<DBBranch>;
  onUpdateBranch: (
    id: string,
    patch: { name?: string; code?: string; is_active?: boolean },
  ) => Promise<DBBranch>;
  onSelectBranch: (id: string | null) => void;
  onSaveBranchSettings: (settings: BranchSettings) => Promise<void>;
  onPreviewThemeSettings: (settings: CustomColors) => void;
  onSaveThemeSettings: (settings: CustomColors) => Promise<void>;
  onSetSpreadsheetId: (id: string) => Promise<void>;
  onSyncAirtableAll: () => Promise<void>;
  airtableSyncing?: boolean;
  onSignOut: (scope?: "local" | "global") => Promise<void>;
  onDirtyChange?: (isDirty: boolean) => void;
};

type ColorTokenKey = Exclude<keyof CustomColors, "themeMode" | "chartColors">;

const CHART_TOKEN_LABELS = [
  { label: "Income / รายได้", hint: "Google Green" },
  { label: "Balance / Primary", hint: "Google Blue" },
  { label: "Warning / Pending", hint: "Google Yellow" },
  { label: "Expense / ค่าใช้จ่าย", hint: "Google Red" },
  { label: "Secondary Data", hint: "Google Purple" },
] as const;

export function SettingsPanel({
  userId: _userId,
  authUser,
  isGuest = false,
  workTypes,
  otTypes,
  rates,
  themeSettings,
  savedThemeSettings,
  spreadsheetId,
  logs,
  previewMonth,
  mobileLayout,
  desktopLayout,
  onAddWorkType,
  onEditWorkType,
  onToggleWorkType,
  onSoftDeleteWorkType,
  onSaveRates,
  branches,
  activeBranchId,
  branchSettings,
  branchSettingsLoading,
  onAddBranch,
  onUpdateBranch,
  onSelectBranch,
  onSaveBranchSettings,
  onPreviewThemeSettings,
  onSaveThemeSettings,
  onSetSpreadsheetId,
  onSyncAirtableAll,
  airtableSyncing,
  onSignOut,
  onDirtyChange,
}: Props) {
  const [activeTab, setActiveTab] = useState<
    "general" | "worktypes" | "ot" | "theme" | "layout" | "integrations" | "authentication"
  >("worktypes");

  // Local draft states
  const [newWorkType, setNewWorkType] = useState("");
  const [editingWtId, setEditingWtId] = useState<string | null>(null);
  const [editingWtName, setEditingWtName] = useState("");

  const [isLocked, setIsLocked] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [rateForm, setRateForm] = useState<RateSettings>(rates);
  const [dailyRateInput, setDailyRateInput] = useState(() => String(rates.dailyRate ?? ""));
  const [savedRateForm, setSavedRateForm] = useState<RateSettings>(rates);
  const [sheetIdInput, setSheetIdInput] = useState(spreadsheetId);
  const [savedSheetId, setSavedSheetId] = useState(spreadsheetId);
  const [newBranchName, setNewBranchName] = useState("");
  const [newBranchCode, setNewBranchCode] = useState("");
  const [branchNameInput, setBranchNameInput] = useState("");
  const [branchCodeInput, setBranchCodeInput] = useState("");
  const [branchRateForm, setBranchRateForm] = useState<BranchSettings>(branchSettings);
  const [savedBranchRateForm, setSavedBranchRateForm] = useState<BranchSettings>(branchSettings);
  const [savedBranchNameInput, setSavedBranchNameInput] = useState("");
  const [savedBranchCodeInput, setSavedBranchCodeInput] = useState("");

  const [draftColors, setDraftColors] = useState<CustomColors>(themeSettings);
  const [savedColors, setSavedColors] = useState<CustomColors>(themeSettings);
  const [layoutDirty, setLayoutDirty] = useState(false);
  const layoutEditorRef = useRef<DashboardLayoutEditorHandle>(null);

  useEffect(() => {
    setRateForm(rates);
    setDailyRateInput(String(rates.dailyRate ?? ""));
    setSavedRateForm(rates);
  }, [rates]);
  useEffect(() => {
    setSheetIdInput(spreadsheetId);
    setSavedSheetId(spreadsheetId);
  }, [spreadsheetId]);
  useEffect(() => {
    setDraftColors(themeSettings);
  }, [themeSettings]);
  useEffect(() => {
    setSavedColors(savedThemeSettings);
  }, [savedThemeSettings]);
  useEffect(() => {
    onPreviewThemeSettings(draftColors);
  }, [draftColors, onPreviewThemeSettings]);
  useEffect(() => {
    setBranchRateForm(branchSettings);
    setSavedBranchRateForm(branchSettings);
    const selected = branches.find((branch) => branch.id === activeBranchId);
    const nextName = selected?.name ?? "";
    const nextCode = selected?.code ?? "";
    setBranchNameInput(nextName);
    setBranchCodeInput(nextCode);
    setSavedBranchNameInput(nextName);
    setSavedBranchCodeInput(nextCode);
  }, [activeBranchId, branchSettings, branches]);

  const ratesDirty =
    dailyRateInput !== String(savedRateForm.dailyRate ?? "") ||
    JSON.stringify({ ...rateForm, dailyRate: 0 }) !==
      JSON.stringify({ ...savedRateForm, dailyRate: 0 });

  const isDirty =
    JSON.stringify(draftColors) !== JSON.stringify(savedColors) ||
    ratesDirty ||
    sheetIdInput !== savedSheetId ||
    JSON.stringify(branchRateForm) !== JSON.stringify(savedBranchRateForm) ||
    branchNameInput !== savedBranchNameInput ||
    branchCodeInput !== savedBranchCodeInput ||
    layoutDirty;

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  useEffect(() => {
    if (!isDirty) return;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const handleUnlock = () => setIsLocked(false);

  const handleLock = () => {
    if (isDirty && typeof window !== "undefined") {
      const confirmed = window.confirm(
        "ยังมีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก ต้องการล็อกต่อหรือไม่?",
      );
      if (!confirmed) return;
    }
    setIsLocked(true);
  };

  const handleCancel = () => {
    setDraftColors(savedColors);
    onPreviewThemeSettings(savedColors);
    setRateForm(savedRateForm);
    setDailyRateInput(String(savedRateForm.dailyRate ?? ""));
    setSheetIdInput(savedSheetId);
    setBranchRateForm(savedBranchRateForm);
    setBranchNameInput(savedBranchNameInput);
    setBranchCodeInput(savedBranchCodeInput);
    layoutEditorRef.current?.cancelDraft();
    setIsLocked(true);
    toast.info("ยกเลิกการแก้ไขและคืนค่าที่บันทึกล่าสุดแล้ว");
  };

  const handleBranchCreate = async () => {
    if (!newBranchName.trim()) return;
    try {
      await onAddBranch(newBranchName, newBranchCode);
      setNewBranchName("");
      setNewBranchCode("");
      toast.success("สร้างและบันทึกลง Supabase แล้ว");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "สร้างไม่สำเร็จ");
    }
  };

  const handleBranchUpdate = async () => {
    if (!activeBranchId || !branchNameInput.trim()) return;
    try {
      await onUpdateBranch(activeBranchId, { name: branchNameInput, code: branchCodeInput });
      setSavedBranchNameInput(branchNameInput);
      setSavedBranchCodeInput(branchCodeInput);
      toast.success("แก้ไขข้อมูลสาขาแล้ว");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "แก้ไขไม่สำเร็จ");
    }
  };

  const handleBranchSettingsSave = async () => {
    try {
      await onSaveBranchSettings(branchRateForm);
      setSavedBranchRateForm(branchRateForm);
      toast.success("บันทึกค่า override แล้ว");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "บันทึกค่าไม่สำเร็จ");
    }
  };

  const handleWorkTypeAdd = async () => {
    if (!newWorkType.trim()) return;
    try {
      await onAddWorkType(newWorkType.trim());
      setNewWorkType("");
      toast.success("เพิ่มประเภทงานลง Supabase สำเร็จ");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "เพิ่มประเภทงานไม่สำเร็จ");
    }
  };

  const handleWorkTypeEditSave = async (id: string) => {
    if (!editingWtName.trim()) return;
    try {
      await onEditWorkType(id, editingWtName.trim());
      setEditingWtId(null);
      toast.success("แก้ไขชื่อประเภทงานสำเร็จ");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "แก้ไขไม่สำเร็จ");
    }
  };

  const normalizeSheetId = () => {
    const raw = sheetIdInput.trim();
    if (!raw) return "";
    const normalized = extractSpreadsheetId(raw);
    if (!normalized || normalized.length < 10) {
      throw new Error("Spreadsheet ID หรือ URL ของ Google Sheets ไม่ถูกต้อง");
    }
    return normalized;
  };

  const commitSavedScopes = (
    savedScopes: readonly SaveScope[],
    normalizedSheetId: string,
    savedRates: RateSettings = rateForm,
  ) => {
    if (savedScopes.includes("theme")) setSavedColors(draftColors);
    if (savedScopes.includes("rates")) {
      setRateForm(savedRates);
      setDailyRateInput(String(savedRates.dailyRate ?? ""));
      setSavedRateForm(savedRates);
    }
    if (savedScopes.includes("spreadsheet")) {
      setSheetIdInput(normalizedSheetId);
      setSavedSheetId(normalizedSheetId);
    }
    if (savedScopes.includes("branch-rates")) setSavedBranchRateForm(branchRateForm);
    if (savedScopes.includes("branch-profile")) {
      setSavedBranchNameInput(branchNameInput);
      setSavedBranchCodeInput(branchCodeInput);
    }
  };

  const getValidatedRates = () => {
    const rawDailyRate = dailyRateInput.trim();
    if (!rawDailyRate) throw new Error("กรุณากรอกค่าแรงปกติก่อนบันทึก");

    const dailyRate = Number(rawDailyRate);
    if (!Number.isFinite(dailyRate) || dailyRate < 0) {
      throw new Error("ค่าแรงปกติต้องเป็นตัวเลขที่ไม่ติดลบ");
    }

    return { ...rateForm, dailyRate };
  };

  const handleRatesSave = async () => {
    setIsSaving(true);
    try {
      const nextRates = getValidatedRates();
      const coordinator = createSaveCoordinator([
        {
          scope: "rates",
          dirty: ratesDirty,
          save: () => onSaveRates(nextRates),
        },
      ]);
      const result = await coordinator.save();
      commitSavedScopes(result.savedScopes, savedSheetId, nextRates);
      if (result.error) throw result.error;
      toast.success("บันทึกค่าแรง Global แล้ว");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "บันทึกค่าแรงไม่สำเร็จ");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSpreadsheetSave = async () => {
    setIsSaving(true);
    try {
      const normalizedSheetId = normalizeSheetId();
      const coordinator = createSaveCoordinator([
        {
          scope: "spreadsheet",
          dirty: sheetIdInput !== savedSheetId,
          save: () => onSetSpreadsheetId(normalizedSheetId),
        },
      ]);
      const result = await coordinator.save();
      commitSavedScopes(result.savedScopes, normalizedSheetId);
      if (result.error) throw result.error;
      toast.success("บันทึก Google Sheets ID แล้ว");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "บันทึก Google Sheets ID ไม่สำเร็จ");
    } finally {
      setIsSaving(false);
    }
  };

  const handleThemeSave = async () => {
    setIsSaving(true);
    try {
      await onSaveThemeSettings(draftColors);
      setSavedColors(draftColors);
      toast.success("บันทึกธีมและสีแล้ว");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "บันทึกธีมไม่สำเร็จ");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLayoutSave = async () => {
    setIsSaving(true);
    try {
      await layoutEditorRef.current?.saveDraft();
      setLayoutDirty(false);
      toast.success("บันทึก Layout Dashboard แล้ว");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "บันทึก Layout ไม่สำเร็จ");
    } finally {
      setIsSaving(false);
    }
  };

  const handleGeneralSave = async () => {
    setIsSaving(true);
    try {
      const branchProfileDirty = Boolean(
        activeBranchId &&
        (branchNameInput !== savedBranchNameInput || branchCodeInput !== savedBranchCodeInput),
      );
      const branchRatesDirty = Boolean(
        activeBranchId && JSON.stringify(branchRateForm) !== JSON.stringify(savedBranchRateForm),
      );
      const coordinator = createSaveCoordinator([
        {
          scope: "rates",
          dirty: ratesDirty,
          save: () => onSaveRates(getValidatedRates()),
        },
        {
          scope: "branch-profile",
          dirty: branchProfileDirty,
          validate: () => {
            if (!branchNameInput.trim()) throw new Error("กรุณากรอกชื่อสาขาก่อนบันทึก");
          },
          save: async () => {
            await onUpdateBranch(activeBranchId as string, {
              name: branchNameInput,
              code: branchCodeInput,
            });
          },
        },
        {
          scope: "branch-rates",
          dirty: branchRatesDirty,
          save: () => onSaveBranchSettings(branchRateForm),
        },
      ]);
      const result = await coordinator.save();
      commitSavedScopes(result.savedScopes, savedSheetId);

      if (result.error) {
        const scopeLabel = result.failedScope ? ` (${result.failedScope})` : "";
        throw new Error(
          `${result.error instanceof Error ? result.error.message : "บันทึกไม่สำเร็จ"}${scopeLabel}`,
        );
      }

      toast.success("บันทึกค่าแรงและข้อมูลสาขาแล้ว");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "บันทึกค่าแรงและสาขาไม่สำเร็จ");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAll = async () => {
    switch (activeTab) {
      case "theme":
        await handleThemeSave();
        break;
      case "general":
        await handleGeneralSave();
        break;
      case "layout":
        await handleLayoutSave();
        break;
      case "integrations":
        await handleSpreadsheetSave();
        break;
      default:
        toast.info("หมวดนี้บันทึกแยกตามรายการหรือไม่มีค่าที่ต้องบันทึก");
        return;
    }
    setIsLocked(true);
  };

  const handleResetColors = () => {
    const isDark = draftColors.themeMode === "dark";
    const defaults = isDark ? DEFAULT_COLORS_DARK : DEFAULT_COLORS_LIGHT;
    setDraftColors(defaults);
    toast.info("แสดงตัวอย่างสี Google Material แล้ว กด Save เพื่อบันทึกถาวร");
  };

  const selectGooglePreset = (presetId: string) => {
    const preset = GOOGLE_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    const isDark =
      draftColors.themeMode === "dark" ||
      (draftColors.themeMode === "system" &&
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    const palette = isDark ? preset.dark : preset.light;
    const next: CustomColors = {
      ...draftColors,
      presetName: preset.id,
      primaryColor: palette.primaryColor,
      secondaryColor: palette.secondaryColor,
      accentColor: palette.accentColor,
      backgroundColor: palette.backgroundColor,
      cardColor: palette.cardColor,
      foregroundColor: palette.foregroundColor,
      borderColor: palette.borderColor,
      successColor: palette.successColor,
      warningColor: palette.warningColor,
      destructiveColor: palette.destructiveColor,
      chartColors: palette.chartColors,
    };
    setDraftColors(next);
    toast.info(`แสดงตัวอย่างชุดสี ${preset.nameEn} แล้ว กด Save เพื่อบันทึกถาวร`);
  };

  const updateBorderRadius = (radius: BorderRadiusOption) => {
    const next: CustomColors = { ...draftColors, borderRadius: radius };
    setDraftColors(next);
  };

  const updateDensity = (density: DensityOption) => {
    const next: CustomColors = { ...draftColors, density };
    setDraftColors(next);
  };

  const updateButtonStyle = (buttonStyle: ButtonStyleOption) => {
    const next: CustomColors = { ...draftColors, buttonStyle };
    setDraftColors(next);
  };

  const updateColorToken = (key: ColorTokenKey, value: string) => {
    const next = { ...draftColors, [key]: value };
    setDraftColors(next);
  };

  const updateChartColor = (index: number, value: string) => {
    const nextCharts = [...(draftColors.chartColors || DEFAULT_COLORS_LIGHT.chartColors)];
    nextCharts[index] = value;
    const next = { ...draftColors, chartColors: nextCharts };
    setDraftColors(next);
  };

  const pendingAirtableCount = logs.filter((l) => l.airtableSyncStatus !== "synced").length;

  return (
    <div className="space-y-6">
      {/* Header title and explicit Settings workflow controls */}
      <div className="surface-card space-y-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <Settings2 className="h-5 w-5 text-primary" /> ตั้งค่าระบบ (Settings)
            </h2>
            <p className="text-xs text-muted-foreground">
              Settings → Unlock → Edit → Preview → Save → Lock · การเปลี่ยนแปลงจะแสดงผลทันที
              และจะบันทึกถาวรเมื่อกด Save
            </p>
            <div
              className={`mt-2 flex items-start gap-2 rounded-lg px-3 py-2 text-xs ${
                isGuest ? "bg-warning-soft text-warning-foreground" : "bg-info-soft text-primary"
              }`}
              data-testid="settings-source"
            >
              <Database className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                {isGuest
                  ? "โหมดไม่ระบุตัวตน (Guest Mode): การตั้งค่าถูกเก็บเฉพาะเบราว์เซอร์นี้ ไม่ซิงก์ข้ามอุปกรณ์"
                  : "บัญชีของคุณ: ข้อมูลและการตั้งค่าบันทึกแยกตามบัญชีผู้ใช้งานอย่างปลอดภัย"}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2 text-[11px] font-semibold">
            <span
              className={`rounded-full px-2.5 py-1 ${isLocked ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"}`}
            >
              {isLocked ? "🔒 Locked" : "🔓 Editing"}
            </span>
            <span
              className={`rounded-full px-2.5 py-1 ${isDirty ? "bg-warning/15 text-warning-foreground" : "bg-success-soft text-success"}`}
            >
              {isDirty ? "⚠️ Unsaved changes" : "✓ Saved"}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
          <button
            type="button"
            onClick={handleUnlock}
            disabled={!isLocked}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-45"
          >
            <Unlock className="h-4 w-4" /> Unlock
          </button>
          <button
            type="button"
            onClick={handleLock}
            disabled={isLocked}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-45"
          >
            <Lock className="h-4 w-4" /> Lock
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={!isDirty}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-45"
          >
            <RotateCcw className="h-4 w-4" /> Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleSaveAll()}
            disabled={isLocked || !isDirty || isSaving}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save className="h-4 w-4" /> {isSaving ? "กำลังบันทึก…" : "Save หมวดนี้"}
          </button>
          {isDirty && (
            <span className="flex items-center gap-1 text-[11px] text-warning-foreground">
              <AlertTriangle className="h-3.5 w-3.5" /> ต้องกด Save ก่อนออกจากหน้า
            </span>
          )}
        </div>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="surface-card flex overflow-x-auto rounded-2xl p-1 text-xs font-medium scrollbar-none">
        <button
          onClick={() => setActiveTab("worktypes")}
          className={`flex items-center gap-2 shrink-0 rounded-xl px-4 py-2.5 transition ${
            activeTab === "worktypes"
              ? "bg-primary text-primary-foreground font-bold shadow"
              : "text-muted-foreground hover:bg-accent"
          }`}
        >
          <Briefcase className="h-4 w-4" /> ประเภทงาน ({workTypes.filter((w) => w.is_active).length}
          )
        </button>
        <button
          onClick={() => setActiveTab("ot")}
          className={`flex items-center gap-2 shrink-0 rounded-xl px-4 py-2.5 transition ${
            activeTab === "ot"
              ? "bg-primary text-primary-foreground font-bold shadow"
              : "text-muted-foreground hover:bg-accent"
          }`}
        >
          <Clock className="h-4 w-4" /> ประเภท OT
        </button>
        <button
          onClick={() => setActiveTab("theme")}
          className={`flex items-center gap-2 shrink-0 rounded-xl px-4 py-2.5 transition ${
            activeTab === "theme"
              ? "bg-primary text-primary-foreground font-bold shadow"
              : "text-muted-foreground hover:bg-accent"
          }`}
        >
          <Palette className="h-4 w-4" /> ธีม &amp; สีกราฟ
        </button>
        <button
          onClick={() => setActiveTab("general")}
          className={`flex items-center gap-2 shrink-0 rounded-xl px-4 py-2.5 transition ${
            activeTab === "general"
              ? "bg-primary text-primary-foreground font-bold shadow"
              : "text-muted-foreground hover:bg-accent"
          }`}
        >
          <Settings2 className="h-4 w-4" /> ค่าแรง &amp;
        </button>
        <button
          onClick={() => setActiveTab("layout")}
          className={`flex items-center gap-2 shrink-0 rounded-xl px-4 py-2.5 transition ${
            activeTab === "layout"
              ? "bg-primary text-primary-foreground font-bold shadow"
              : "text-muted-foreground hover:bg-accent"
          }`}
        >
          <Maximize2 className="h-4 w-4" /> Layout Dashboard
        </button>
        <button
          onClick={() => setActiveTab("authentication")}
          className={`flex items-center gap-2 shrink-0 rounded-xl px-4 py-2.5 transition ${
            activeTab === "authentication"
              ? "bg-primary text-primary-foreground font-bold shadow"
              : "text-muted-foreground hover:bg-accent"
          }`}
        >
          <ShieldCheck className="h-4 w-4" /> Authentication
        </button>
        <button
          onClick={() => setActiveTab("integrations")}
          className={`flex items-center gap-2 shrink-0 rounded-xl px-4 py-2.5 transition ${
            activeTab === "integrations"
              ? "bg-primary text-primary-foreground font-bold shadow"
              : "text-muted-foreground hover:bg-accent"
          }`}
        >
          <Database className="h-4 w-4" /> Supabase &amp; Airtable
        </button>
      </div>

      {/* Tab 1: Work Types Management */}
      {activeTab === "worktypes" && (
        <div className="surface-card p-5">
          <fieldset disabled={isLocked} className="space-y-4">
            <div className="flex flex-col gap-1">
              <h3 className="font-bold text-base">การจัดการประเภทงาน (Work Types)</h3>
              <p className="text-xs text-muted-foreground">
                ข้อมูลประเภทงานถูกบันทึกลง Supabase เสมอ Refresh หรือเปลี่ยน Browser ข้อมูลไม่หาย
                (มี ID ถาวร, Soft Delete ไม่ทำลายประวัติเก่า)
              </p>
            </div>

            <div className="flex gap-2">
              <input
                value={newWorkType}
                onChange={(e) => setNewWorkType(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && void handleWorkTypeAdd()}
                placeholder="เพิ่มประเภทงานใหม่ เช่น คลังสินค้า"
                aria-label="เพิ่มประเภทงานใหม่"
                className="flex-1 rounded-xl border border-input bg-secondary p-2.5 text-sm"
              />
              <button
                onClick={() => void handleWorkTypeAdd()}
                className="flex items-center gap-1 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground active:scale-95"
              >
                <Plus className="h-4 w-4" /> เพิ่ม
              </button>
            </div>

            <div className="divide-y divide-border rounded-xl border border-border bg-card">
              {workTypes.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground">
                  ยังไม่มีประเภทงานในระบบ
                </div>
              ) : (
                workTypes.map((wt) => (
                  <div key={wt.id} className="flex items-center justify-between p-3 text-sm">
                    {editingWtId === wt.id ? (
                      <div className="flex flex-1 items-center gap-2 pr-2">
                        <input
                          value={editingWtName}
                          onChange={(e) => setEditingWtName(e.target.value)}
                          className="w-full rounded-lg border border-input bg-secondary p-1.5 text-sm"
                        />
                        <button
                          onClick={() => void handleWorkTypeEditSave(wt.id)}
                          className="rounded-lg bg-success px-2.5 py-1 text-xs font-semibold text-success-foreground"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-medium ${!wt.is_active ? "line-through text-muted-foreground" : ""}`}
                        >
                          {wt.name}
                        </span>
                        {wt.is_active ? (
                          <span className="rounded-full bg-success-soft px-2 py-0.5 text-[10px] font-semibold text-success">
                            ใช้งาน
                          </span>
                        ) : (
                          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                            ปิดใช้งาน (Soft Deleted)
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => void onToggleWorkType(wt.id)}
                        className={`text-xs font-medium px-2.5 py-1 rounded-lg border ${
                          wt.is_active
                            ? "border-border text-muted-foreground hover:bg-accent"
                            : "border-success text-success hover:bg-success-soft"
                        }`}
                      >
                        {wt.is_active ? "ปิดใช้งาน" : "เปิดใช้งาน"}
                      </button>

                      <button
                        onClick={() => {
                          setEditingWtId(wt.id);
                          setEditingWtName(wt.name);
                        }}
                        title="แก้ไขชื่อประเภทงาน"
                        className="rounded-lg p-1.5 text-primary hover:bg-accent"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => void onSoftDeleteWorkType(wt.id)}
                        title="Soft Delete ประเภทงาน"
                        className="rounded-lg p-1.5 text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </fieldset>
        </div>
      )}

      {/* Tab 2: OT Types Management */}
      {activeTab === "ot" && (
        <div className="surface-card space-y-4 p-5">
          <div className="flex flex-col gap-1">
            <h3 className="font-bold text-base">การจัดการประเภท OT (OT Types)</h3>
            <p className="text-xs text-muted-foreground">
              รองรับตัวเลือก &quot;ไม่มี OT&quot; (Multiplier = 0) และคำนวณยอด OT แยกอย่างชัดเจน
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {(otTypes.length > 0
              ? otTypes
              : OT_OPTIONS.map((o) => ({
                  id: `ot-${o.value}`,
                  name: o.label,
                  multiplier: o.value,
                  is_active: true,
                }))
            ).map((ot) => (
              <div
                key={ot.id}
                className={`flex items-center justify-between rounded-xl border p-4 ${
                  ot.multiplier === 0 ? "border-primary/40 bg-primary/5" : "border-border bg-card"
                }`}
              >
                <div>
                  <div className="font-bold text-sm flex items-center gap-2">
                    {ot.name}
                    {ot.multiplier === 0 && (
                      <span className="rounded-full bg-primary/20 text-primary px-2 py-0.5 text-[10px] font-bold">
                        ไม่มี OT (0x)
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    ตัวคูณ: {ot.multiplier} เท่า
                  </div>
                </div>
                <div className="text-right font-mono font-bold text-sm text-primary">
                  x{ot.multiplier}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Theme & Custom Colors */}
      {activeTab === "theme" && (
        <div className="surface-card p-5">
          <fieldset disabled={isLocked} className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-4">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" /> ปรับแต่งธีม &amp; ดีไซน์
                  (Google-style Theme System)
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  เลือกชุดสี Google Workspace ปรับโหมด Light / Dark ปรับแต่งมุมโค้ง ความหนาแน่น
                  และสี Token ทั้งหมด
                </p>
              </div>
              <button
                onClick={() => void handleResetColors()}
                className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground transition hover:bg-accent hover:text-foreground cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" /> รีเซ็ตเป็น Google Default
              </button>
            </div>

            {/* Section 1: Google Color Palettes Presets */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                  ชุดสีทางการของ Google (Google Color Presets)
                </label>
                <span className="text-[11px] text-primary font-semibold">6 ชุดสีมาตรฐาน</span>
              </div>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {GOOGLE_PRESETS.map((preset) => {
                  const isSelected =
                    draftColors.presetName === preset.id ||
                    (!draftColors.presetName && preset.id === "google-blue");
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => selectGooglePreset(preset.id)}
                      className={`flex items-center justify-between rounded-xl border p-3 text-left transition cursor-pointer ${
                        isSelected
                          ? "border-primary bg-primary/10 ring-2 ring-primary shadow-sm"
                          : "border-border bg-card hover:bg-accent/70"
                      }`}
                    >
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-foreground">{preset.nameEn}</p>
                        <p className="text-[10px] text-muted-foreground">{preset.name}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className="h-4 w-4 rounded-full border border-black/10 shadow-sm"
                          style={{ backgroundColor: preset.primaryColor }}
                          title="Primary"
                        />
                        <span
                          className="h-4 w-4 rounded-full border border-black/10 shadow-sm"
                          style={{ backgroundColor: preset.accentColor }}
                          title="Accent"
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 2: Theme Mode Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                โหมดแสดงผล (Appearance Mode)
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(
                  [
                    { mode: "light", label: "Light Mode", icon: Sun },
                    { mode: "dark", label: "Dark Mode", icon: Moon },
                    { mode: "system", label: "ตามระบบ (System)", icon: Laptop },
                  ] as const
                ).map(({ mode, label, icon: Icon }) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => {
                      const next = { ...draftColors, themeMode: mode as ThemeMode };
                      setDraftColors(next);
                    }}
                    className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-bold transition cursor-pointer ${
                      draftColors.themeMode === mode
                        ? "border-primary bg-primary text-primary-foreground shadow"
                        : "border-border bg-card text-foreground hover:bg-accent"
                    }`}
                  >
                    <Icon className="h-4 w-4" /> {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Section 3: Corner Radius (Border Radius) & UI Density */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Border Radius */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="h-3.5 w-3.5 text-primary" /> มุมโค้งของกรอบ (Corner Radius)
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {(
                    [
                      { id: "sharp", label: "Sharp", radius: "4px" },
                      { id: "compact", label: "Compact", radius: "8px" },
                      { id: "normal", label: "Normal", radius: "12px" },
                      { id: "smooth", label: "Smooth", radius: "16px" },
                      { id: "pill", label: "Pill", radius: "24px" },
                    ] as const
                  ).map(({ id, label, radius }) => {
                    const isSelected =
                      draftColors.borderRadius === id ||
                      (!draftColors.borderRadius && id === "normal");
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => updateBorderRadius(id)}
                        className={`flex flex-col items-center justify-center p-2 text-center transition cursor-pointer border ${
                          isSelected
                            ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                            : "border-border bg-card text-foreground hover:bg-accent"
                        }`}
                        style={{ borderRadius: radius }}
                      >
                        <span className="text-[11px]">{label}</span>
                        <span className="text-[9px] text-muted-foreground">{radius}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Density & Spacing */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Maximize2 className="h-3.5 w-3.5 text-primary" /> ความหนาแน่นของ UI (Density)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { id: "compact", label: "กะทัดรัด (Compact)" },
                      { id: "normal", label: "มาตรฐาน (Normal)" },
                      { id: "comfortable", label: "โปร่งสบาย (Spacious)" },
                    ] as const
                  ).map(({ id, label }) => {
                    const isSelected =
                      draftColors.density === id || (!draftColors.density && id === "normal");
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => updateDensity(id)}
                        className={`flex items-center justify-center rounded-xl border p-2.5 text-xs font-medium transition cursor-pointer ${
                          isSelected
                            ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                            : "border-border bg-card text-foreground hover:bg-accent"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Section 4: Live Interactive Preview Card */}
            <div className="space-y-3 rounded-2xl border border-border bg-muted/30 p-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold flex items-center gap-1.5">
                    <Palette className="h-4 w-4 text-primary" /> ตัวอย่างการแสดงผลสด (Live
                    Interactive Preview)
                  </h4>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    ทดสอบองค์ประกอบจริงทันทีเมื่อเปลี่ยนสี มุมโค้ง หรือความหนาแน่น
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {/* Button samples */}
                <div className="rounded-xl border border-border bg-card p-3 space-y-2">
                  <p className="text-[11px] font-semibold text-muted-foreground">Button Styles</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/90 transition"
                    >
                      Primary
                    </button>
                    <button
                      type="button"
                      className="rounded-lg bg-secondary px-3 py-1.5 text-xs font-bold text-secondary-foreground shadow-sm hover:bg-secondary/80 transition"
                    >
                      Secondary
                    </button>
                    <button
                      type="button"
                      className="rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-accent transition"
                    >
                      Outline
                    </button>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="rounded-xl border border-border bg-card p-3 space-y-2">
                  <p className="text-[11px] font-semibold text-muted-foreground">Status Chips</p>
                  <div className="flex flex-wrap gap-1.5 text-[10px] font-bold">
                    <span className="rounded-full bg-success-soft px-2.5 py-1 text-success border border-success/20">
                      สำเร็จ (Success)
                    </span>
                    <span className="rounded-full bg-warning-soft px-2.5 py-1 text-warning-foreground border border-warning/20">
                      รอซิงก์ (Pending)
                    </span>
                    <span className="rounded-full bg-destructive-soft px-2.5 py-1 text-destructive border border-destructive/20">
                      แจ้งเตือน (Alert)
                    </span>
                  </div>
                </div>

                {/* Chart Role palette preview */}
                <div className="rounded-xl border border-border bg-card p-3 space-y-2">
                  <p className="text-[11px] font-semibold text-muted-foreground">
                    Chart Roles (5 สีกราฟ)
                  </p>
                  <div className="flex h-7 items-end gap-1" aria-label="ตัวอย่างชุดสีกราฟ">
                    {(draftColors.chartColors || DEFAULT_COLORS_LIGHT.chartColors).map(
                      (color, index) => (
                        <span
                          key={index}
                          className="min-w-0 flex-1 rounded-t-md transition-all duration-300"
                          style={{ backgroundColor: color, height: `${40 + index * 14}%` }}
                          title={`Chart role ${index + 1}: ${color}`}
                        />
                      ),
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 5: Detailed Semantic Color Pickers */}
            <div className="space-y-5 pt-2">
              <div className="rounded-xl border border-primary/20 bg-info-soft/40 p-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-primary">
                    ปรับแต่งค่าสีเฉพาะตัว (Custom Semantic Tokens)
                  </h4>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    11 Tokens + 5 Chart Roles
                  </span>
                </div>
              </div>

              {/* Surfaces */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                  พื้นหลังและพื้นผิว (Surfaces)
                </h4>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
                  <ColorPickerField
                    label="พื้นหลังหลัก (Background)"
                    value={draftColors.backgroundColor}
                    onChange={(v) => updateColorToken("backgroundColor", v)}
                  />
                  <ColorPickerField
                    label="พื้นผิว Card (Surface)"
                    value={draftColors.cardColor}
                    onChange={(v) => updateColorToken("cardColor", v)}
                  />
                  <ColorPickerField
                    label="ข้อความหลัก (Foreground)"
                    value={draftColors.foregroundColor}
                    onChange={(v) => updateColorToken("foregroundColor", v)}
                  />
                  <ColorPickerField
                    label="เส้นขอบ / Divider (Border)"
                    value={draftColors.borderColor}
                    onChange={(v) => updateColorToken("borderColor", v)}
                  />
                </div>
              </div>

              {/* Brand & Interaction */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                  สีแบรนด์และการโต้ตอบ (Brand &amp; Interaction)
                </h4>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                  <ColorPickerField
                    label="Primary (สีหลัก)"
                    value={draftColors.primaryColor}
                    onChange={(v) => updateColorToken("primaryColor", v)}
                  />
                  <ColorPickerField
                    label="Secondary (สีรอง)"
                    value={draftColors.secondaryColor}
                    onChange={(v) => updateColorToken("secondaryColor", v)}
                  />
                  <ColorPickerField
                    label="Accent (สีเน้น/Hover)"
                    value={draftColors.accentColor}
                    onChange={(v) => updateColorToken("accentColor", v)}
                  />
                </div>
              </div>

              {/* Status Colors */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                  สีสถานะข้อมูล (Status Colors)
                </h4>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                  <ColorPickerField
                    label="Success / Google Green"
                    value={draftColors.successColor}
                    onChange={(v) => updateColorToken("successColor", v)}
                  />
                  <ColorPickerField
                    label="Warning / Google Amber"
                    value={draftColors.warningColor}
                    onChange={(v) => updateColorToken("warningColor", v)}
                  />
                  <ColorPickerField
                    label="Danger / Google Red"
                    value={draftColors.destructiveColor}
                    onChange={(v) => updateColorToken("destructiveColor", v)}
                  />
                </div>
              </div>

              {/* Chart Roles */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                  ชุดสีกราฟแบบมีความหมาย (Chart Semantic Roles)
                </h4>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
                  {(draftColors.chartColors || DEFAULT_COLORS_LIGHT.chartColors).map(
                    (color, index) => (
                      <ColorPickerField
                        key={index}
                        label={CHART_TOKEN_LABELS[index]?.label ?? `Chart ${index + 1}`}
                        hint={CHART_TOKEN_LABELS[index]?.hint}
                        value={color}
                        onChange={(value) => updateChartColor(index, value)}
                      />
                    ),
                  )}
                </div>
              </div>
            </div>
          </fieldset>
          <div className="mt-5 flex flex-wrap items-center justify-end gap-2 border-t border-border pt-4">
            <button
              type="button"
              onClick={handleCancel}
              disabled={!isDirty}
              className="rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
            >
              ยกเลิกการแสดงตัวอย่าง
            </button>
            <button
              type="button"
              onClick={() => void handleThemeSave()}
              disabled={
                isLocked || JSON.stringify(draftColors) === JSON.stringify(savedColors) || isSaving
              }
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save className="h-4 w-4" /> บันทึกธีมและสี
            </button>
          </div>
        </div>
      )}

      {/* Tab 4: General Wage Rates and Branch Overrides */}
      {activeTab === "general" && (
        <div className="space-y-5">
          <fieldset disabled={isLocked} className="space-y-5">
            <div className="surface-card space-y-4 p-5">
              <div>
                <h3 className="font-bold text-base">สาขาและค่า override</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Global เป็นค่าเริ่มต้น สามารถกำหนดค่าแรงได้ โดยไม่สร้างฟิลด์ซ้ำกับข้อมูลบันทึกงาน
                </p>
              </div>
              {isGuest ? (
                <div className="rounded-xl border border-warning/30 bg-warning/10 p-4 text-xs text-warning-foreground">
                  Guest ใช้ LocalStorage ได้ตามเดิม การจัดการค่า override ต้องเข้าสู่ระบบก่อน
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_1fr_auto]">
                    <input
                      value={newBranchName}
                      onChange={(e) => setNewBranchName(e.target.value)}
                      placeholder="ชื่อผู้ใช้ใหม่"
                      className="rounded-xl border border-input bg-secondary p-2.5 text-sm"
                      aria-label="ชื่อผู้ใช้ใหม่"
                    />
                    <input
                      value={newBranchCode}
                      onChange={(e) => setNewBranchCode(e.target.value)}
                      placeholder="รหัสผู้ใช้ (ถ้ามี)"
                      className="rounded-xl border border-input bg-secondary p-2.5 text-sm"
                      aria-label="รหัสผู้ใช้ใหม่"
                    />
                    <button
                      onClick={() => void handleBranchCreate()}
                      className="flex items-center justify-center gap-1 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground"
                    >
                      <Plus className="h-4 w-4" /> เพิ่มสาขา
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto]">
                    <select
                      value={activeBranchId ?? ""}
                      onChange={(e) => onSelectBranch(e.target.value || null)}
                      className="rounded-xl border border-input bg-secondary p-2.5 text-sm"
                      aria-label="เลือกสาขาที่ใช้งาน"
                    >
                      <option value="">ใช้ค่า Global (ไม่เลือกสาขา)</option>
                      {branches
                        .filter((branch) => branch.is_active)
                        .map((branch) => (
                          <option key={branch.id} value={branch.id}>
                            {branch.name}
                            {branch.code ? ` (${branch.code})` : ""}
                          </option>
                        ))}
                    </select>
                    {activeBranchId && (
                      <button
                        onClick={() => void onUpdateBranch(activeBranchId, { is_active: false })}
                        className="rounded-xl border border-destructive/40 px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10"
                      >
                        ปิดใช้งานสาขา
                      </button>
                    )}
                  </div>
                  {activeBranchId && (
                    <div className="space-y-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
                      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                        <input
                          value={branchNameInput}
                          onChange={(e) => setBranchNameInput(e.target.value)}
                          className="rounded-xl border border-input bg-background p-2.5 text-sm"
                          aria-label="ชื่อสาขาที่เลือก"
                        />
                        <input
                          value={branchCodeInput}
                          onChange={(e) => setBranchCodeInput(e.target.value)}
                          placeholder="รหัสสาขา"
                          className="rounded-xl border border-input bg-background p-2.5 text-sm"
                          aria-label="รหัสสาขาที่เลือก"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                        <BranchNumberField
                          label="ค่าแรง/วัน"
                          value={branchRateForm.dailyRate}
                          onChange={(value) =>
                            setBranchRateForm((current) =>
                              value === undefined
                                ? omitBranchRateField(current, "dailyRate")
                                : { ...current, dailyRate: value },
                            )
                          }
                        />
                        <div>
                          <label className="mb-1 block text-xs font-bold text-muted-foreground">
                            ค่า OT เริ่มต้น
                          </label>
                          <select
                            value={String(branchRateForm.defaultOtType ?? "")}
                            onChange={(e) =>
                              setBranchRateForm((current) =>
                                e.target.value === ""
                                  ? omitBranchRateField(current, "defaultOtType")
                                  : { ...current, defaultOtType: Number(e.target.value) },
                              )
                            }
                            className="w-full rounded-xl border border-input bg-background p-2.5 text-sm"
                          >
                            <option value="">ใช้ Global</option>
                            {OT_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <BranchNumberField
                          label="ค่าเดินทาง"
                          value={branchRateForm.travelCost}
                          onChange={(value) =>
                            setBranchRateForm((current) =>
                              value === undefined
                                ? omitBranchRateField(current, "travelCost")
                                : { ...current, travelCost: value },
                            )
                          }
                        />
                        <BranchNumberField
                          label="ค่าอาหาร"
                          value={branchRateForm.foodCost}
                          onChange={(value) =>
                            setBranchRateForm((current) =>
                              value === undefined
                                ? omitBranchRateField(current, "foodCost")
                                : { ...current, foodCost: value },
                            )
                          }
                        />
                        <BranchNumberField
                          label="รายรับอื่น"
                          value={branchRateForm.otherIncome}
                          onChange={(value) =>
                            setBranchRateForm((current) =>
                              value === undefined
                                ? omitBranchRateField(current, "otherIncome")
                                : { ...current, otherIncome: value },
                            )
                          }
                        />
                        <BranchNumberField
                          label="รายการหัก"
                          value={branchRateForm.otherDeductions}
                          onChange={(value) =>
                            setBranchRateForm((current) =>
                              value === undefined
                                ? omitBranchRateField(current, "otherDeductions")
                                : { ...current, otherDeductions: value },
                            )
                          }
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => void handleBranchUpdate()}
                          className="rounded-xl border border-border px-3 py-2 text-xs font-semibold hover:bg-accent"
                        >
                          บันทึกชื่อ
                        </button>
                        <button
                          onClick={() => void handleBranchSettingsSave()}
                          disabled={branchSettingsLoading}
                          className="rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-50"
                        >
                          {branchSettingsLoading ? "กำลังโหลด…" : "บันทึกค่า override"}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="surface-card space-y-4 p-5">
              <h3 className="font-bold text-base">ค่าแรงพื้นฐาน &amp; ค่าเริ่มต้น (Global)</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1">
                    ค่าแรงปกติ (บาท/วัน)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={dailyRateInput}
                    onChange={(e) => {
                      const raw = e.target.value;
                      setDailyRateInput(raw);
                      if (raw === "") {
                        setRateForm({ ...rateForm, dailyRate: 0 });
                        return;
                      }

                      const dailyRate = Number(raw);
                      if (Number.isFinite(dailyRate)) {
                        setRateForm({ ...rateForm, dailyRate });
                      }
                    }}
                    className="w-full rounded-xl border border-input bg-secondary p-2.5 text-sm"
                  />
                </div>
                <p className="self-end pb-2 text-xs text-muted-foreground">
                  Google Sheets ID อยู่ในหมวด <strong>Supabase &amp; Airtable</strong>{" "}
                  เพื่อแยกการบันทึกออกจากค่าแรง
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => void handleRatesSave()}
                  className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground active:scale-95"
                >
                  <Save className="h-4 w-4" /> บันทึกค่าแรง Global
                </button>
              </div>
            </div>
          </fieldset>
        </div>
      )}

      {/* Tab 5: Dashboard Layout */}
      {activeTab === "layout" && (
        <DashboardLayoutEditor
          ref={layoutEditorRef}
          userId={_userId}
          isGuest={isGuest}
          mobileLayout={mobileLayout}
          desktopLayout={desktopLayout}
          disabled={isLocked}
          summary={summarizeMonth(logs, previewMonth)}
          chartColors={draftColors.chartColors}
          onDirtyChange={setLayoutDirty}
        />
      )}

      {/* Tab 6: Authentication */}
      {activeTab === "authentication" && (
        <AuthenticationSettings user={authUser} isGuest={isGuest} onSignOut={onSignOut} />
      )}

      {/* Tab 6: Supabase & Airtable Integrations */}
      {activeTab === "integrations" && (
        <div className="surface-card p-5">
          <fieldset disabled={isLocked} className="space-y-5">
            <div className="flex flex-col gap-1">
              <h3 className="font-bold text-base">การเชื่อมต่อฐานข้อมูล &amp; External Sync</h3>
              <p className="text-xs text-muted-foreground">
                Supabase = Primary Database (Source of Truth) · Airtable = External Sync Operational
                View
              </p>
            </div>

            <SheetsPanel spreadsheetId={sheetIdInput} onChange={(id) => setSheetIdInput(id)} />
            <div className="flex justify-end border-b border-border pb-4">
              <button
                type="button"
                onClick={() => void handleSpreadsheetSave()}
                disabled={isLocked || sheetIdInput === savedSheetId || isSaving}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save className="h-4 w-4" /> บันทึก Google Sheets ID
              </button>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-sm text-primary">
                  <Database className="h-5 w-5" /> Supabase Database
                </div>
                <span className="rounded-full bg-success-soft text-success px-2.5 py-0.5 text-xs font-bold">
                  เชื่อมต่อแล้ว (Source of Truth)
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                ข้อมูลประเภทงาน, User Settings และ Work Logs ทั้งหมดถูกจัดเก็บอย่างปลอดภัยบน
                Supabase พร้อม Row Level Security (RLS)
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-sm text-primary">
                  <FileSpreadsheet className="h-5 w-5" /> Airtable External Sync
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${pendingAirtableCount === 0 ? "bg-success-soft text-success" : "bg-secondary text-muted-foreground"}`}
                >
                  {pendingAirtableCount === 0
                    ? "ซิงก์ครบแล้ว"
                    : `รอซิงก์ ${pendingAirtableCount} รายการ`}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Airtable ทำงานผ่าน server function และใช้ค่า AIRTABLE_API_KEY, AIRTABLE_BASE_ID และ
                AIRTABLE_TABLE_NAME จาก environment ของ deployment หากยังไม่มีค่าเหล่านี้
                การบันทึกหลักบน Supabase จะยังไม่ล้มเหลว และสามารถกดซิงก์ซ้ำภายหลังได้
              </p>

              <div className="pt-2 flex items-center justify-between border-t border-border">
                <div className="text-xs text-muted-foreground">
                  รายการในระบบ: <span className="font-bold text-foreground">{logs.length}</span>{" "}
                  รายการ
                </div>
                <button
                  onClick={() => void onSyncAirtableAll()}
                  disabled={airtableSyncing}
                  className="flex items-center gap-1.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground px-3 py-2 text-xs font-bold disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 ${airtableSyncing ? "animate-spin" : ""}`} />
                  {airtableSyncing ? "กำลังตรวจสอบ..." : "ทดสอบซิงก์ Airtable"}
                </button>
              </div>
            </div>
          </fieldset>
        </div>
      )}
    </div>
  );
}

function omitBranchRateField<K extends keyof BranchSettings>(
  current: BranchSettings,
  key: K,
): BranchSettings {
  const next = { ...current };
  delete next[key];
  return next;
}

function BranchNumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | undefined;
  onChange: (value: number | undefined) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-bold text-muted-foreground">{label}</label>
      <input
        type="number"
        min="0"
        value={value ?? ""}
        onChange={(event) =>
          onChange(event.target.value === "" ? undefined : Number(event.target.value))
        }
        placeholder="ใช้ Global"
        className="w-full rounded-xl border border-input bg-background p-2.5 text-sm"
      />
    </div>
  );
}

function ColorPickerField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string | undefined;
  value: string;
  onChange: (val: string) => void;
}) {
  const pickerValue = value && /^#[0-9a-f]{6}$/i.test(value) ? value : "#1A73E8";

  return (
    <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
      <div className="mb-2 min-w-0">
        <span className="block truncate text-[11px] font-semibold text-foreground">{label}</span>
        {hint ? (
          <span className="mt-0.5 block truncate text-[10px] text-muted-foreground">{hint}</span>
        ) : null}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={pickerValue}
          onChange={(event) => onChange(event.target.value)}
          aria-label={`${label} color picker`}
          className="h-9 w-9 shrink-0 cursor-pointer rounded-lg border border-border bg-transparent p-0.5"
        />
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-label={`${label} color value`}
          inputMode="text"
          spellCheck={false}
          className="min-w-0 w-full rounded-lg border border-input bg-secondary px-2 py-2 font-mono text-xs text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
        />
      </div>
    </div>
  );
}
