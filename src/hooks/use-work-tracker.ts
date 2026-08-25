import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  type ActiveCheckIn,
  type GPSPoint,
  type RateSettings,
  type WorkLog,
  dateInBangkok,
  DEFAULT_CATEGORIES,
  DEFAULT_RATES,
  OT_OPTIONS,
  calculatePayroll,
  logToRow,
  rowToLog,
  setStorageNamespace,
  storage,
} from "@/lib/work-log";
import {
  readCategoryList,
  readWorkLogRows,
  replaceWorkLogRows,
  writeCategoryList,
} from "@/lib/sheets.functions";
import { callServer } from "@/lib/server-call";
import {
  addDBBranch,
  addDBWorkType,
  deleteDBWorkLog,
  fetchDBBranches,
  fetchDBBranchSettings,
  fetchDBOtTypes,
  fetchDBUserSettings,
  fetchDBWorkLogs,
  fetchDBWorkTypes,
  saveDBBranchSettings,
  saveDBUserSettings,
  saveDBWorkLog,
  saveDBWorkTypeList,
  syncDBWorkTypes,
  softDeleteDBWorkType,
  updateDBAirtableStatus,
  updateDBBranch,
  updateDBWorkType,
  type DBBranch,
  type BranchSettings,
  type DBOtType,
  type DBUserSettings,
  type DBWorkType,
} from "@/lib/supabase-db";
import { applyTheme, DEFAULT_COLORS_LIGHT, type CustomColors } from "@/lib/theme";
import { syncRecordToAirtable } from "@/lib/airtable.functions";
import { isSupabaseConfigured } from "@/integrations/supabase/client";

function mergeBranchRates(base: RateSettings, settings: BranchSettings): RateSettings {
  return {
    ...base,
    dailyRate: settings.dailyRate ?? base.dailyRate,
    otType: settings.defaultOtType ?? base.otType,
    travelCost: settings.travelCost ?? base.travelCost,
    foodCost: settings.foodCost ?? base.foodCost,
    otherIncome: settings.otherIncome ?? base.otherIncome,
    otherDeductions: settings.otherDeductions ?? base.otherDeductions,
  };
}

export type CheckInInput = {
  workType: string;
  locationName: string;
  gps: GPSPoint;
  photo: string | null;
  rates: RateSettings;
  tasks: string[];
};

export function useWorkTracker(userId: string | null, isGuest = false) {
  const [ready, setReady] = useState(false);
  const [logs, setLogs] = useState<WorkLog[]>([]);
  const [active, setActive] = useState<ActiveCheckIn | null>(null);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [dbWorkTypes, setDbWorkTypes] = useState<DBWorkType[]>([]);
  const [otTypes, setOtTypes] = useState<DBOtType[]>([]);
  const [rates, setRates] = useState<RateSettings>(DEFAULT_RATES);
  const [globalRates, setGlobalRates] = useState<RateSettings>(DEFAULT_RATES);
  const [branches, setBranches] = useState<DBBranch[]>([]);
  const [activeBranchId, setActiveBranchId] = useState<string | null>(null);
  const [branchSettings, setBranchSettings] = useState<BranchSettings>({});
  const [branchSettingsLoading, setBranchSettingsLoading] = useState(false);
  const [spreadsheetId, setSpreadsheetIdState] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [airtableSyncing, setAirtableSyncing] = useState(false);

  const [themeSettings, setThemeSettings] = useState<CustomColors>(DEFAULT_COLORS_LIGHT);
  const [savedThemeSettings, setSavedThemeSettings] = useState<CustomColors>(DEFAULT_COLORS_LIGHT);
  const useSupabase = Boolean(userId && !isGuest && isSupabaseConfigured());

  // Load local state first; only authenticated sessions hydrate from Supabase.
  useEffect(() => {
    setReady(false);
    setStorageNamespace(useSupabase ? userId : null);
    if (!userId) return;

    let isMounted = true;

    async function initFromSupabase() {
      // Local fallback first
      const localLogs = storage.getLogs();
      const localActive = storage.getActive();
      const localCategories = storage.getCategories();
      const localRates = storage.getRates();
      const localSheetId = storage.getSheetId();
      const localTheme = storage.getTheme<CustomColors>(DEFAULT_COLORS_LIGHT);

      setLogs(localLogs);
      setActive(localActive);
      setCategories(localCategories);
      setRates(localRates);
      setGlobalRates(localRates);
      setSpreadsheetIdState(localSheetId);
      setThemeSettings(localTheme);
      setSavedThemeSettings(localTheme);
      applyTheme(localTheme);
      setDbWorkTypes(
        localCategories.map((name, index) => ({
          id: `guest-work-type-${index}-${name}`,
          user_id: userId,
          name,
          is_active: true,
          created_at: "",
          updated_at: "",
        })),
      );
      setOtTypes(
        OT_OPTIONS.map((option, index) => ({
          id: `guest-ot-type-${index}`,
          user_id: null,
          name: option.label,
          multiplier: option.value,
          is_active: true,
        })),
      );

      if (!useSupabase) {
        if (isMounted) setReady(true);
        return;
      }

      try {
        // 1. Load User Settings
        const dbSettings = await fetchDBUserSettings(userId);
        if (dbSettings && isMounted) {
          const colors: CustomColors = {
            themeMode: (dbSettings.theme as CustomColors["themeMode"]) || "light",
            backgroundColor: dbSettings.background_color || DEFAULT_COLORS_LIGHT.backgroundColor,
            cardColor: dbSettings.card_color || DEFAULT_COLORS_LIGHT.cardColor,
            foregroundColor: dbSettings.foreground_color || DEFAULT_COLORS_LIGHT.foregroundColor,
            borderColor: dbSettings.border_color || DEFAULT_COLORS_LIGHT.borderColor,
            primaryColor: dbSettings.primary_color || DEFAULT_COLORS_LIGHT.primaryColor,
            secondaryColor: dbSettings.secondary_color || DEFAULT_COLORS_LIGHT.secondaryColor,
            accentColor: dbSettings.accent_color || DEFAULT_COLORS_LIGHT.accentColor,
            successColor: dbSettings.success_color || DEFAULT_COLORS_LIGHT.successColor,
            warningColor: dbSettings.warning_color || DEFAULT_COLORS_LIGHT.warningColor,
            destructiveColor: dbSettings.destructive_color || DEFAULT_COLORS_LIGHT.destructiveColor,
            chartColors: dbSettings.chart_colors?.length
              ? dbSettings.chart_colors
              : DEFAULT_COLORS_LIGHT.chartColors,
            presetName: dbSettings.preset_name || "google-blue",
            borderRadius: (dbSettings.border_radius as CustomColors["borderRadius"]) || "normal",
            buttonStyle: (dbSettings.button_style as CustomColors["buttonStyle"]) || "filled",
            density: (dbSettings.density as CustomColors["density"]) || "normal",
          };

          setThemeSettings(colors);
          setSavedThemeSettings(colors);
          applyTheme(colors);

          if (dbSettings.daily_rate !== null && dbSettings.daily_rate !== undefined) {
            const nextRates: RateSettings = {
              dailyRate: dbSettings.daily_rate,
              otType: dbSettings.default_ot_type ?? 0,
              travelCost: dbSettings.travel_cost || 0,
              foodCost: dbSettings.food_cost || 0,
              otherIncome: dbSettings.other_income || 0,
              otherDeductions: dbSettings.other_deductions || 0,
            };
            setRates(nextRates);
            setGlobalRates(nextRates);
            storage.setRates(nextRates);
          }

          if (dbSettings.spreadsheet_id) {
            setSpreadsheetIdState(dbSettings.spreadsheet_id);
            storage.setSheetId(dbSettings.spreadsheet_id);
          }
        } else {
          applyTheme(DEFAULT_COLORS_LIGHT);
        }

        // 2. Load branches before settings so the user can choose a branch.
        const dbBranches = await fetchDBBranches(userId);
        if (isMounted) {
          setBranches(dbBranches);
          if (dbBranches.length > 0) {
            setActiveBranchId((current) => current ?? dbBranches[0].id);
          }
        }

        // Branch settings are loaded by the active-branch effect below.

        // 3. Load Work Types. Merge only; never replace existing rows with local state.
        const mergedTypes = await syncDBWorkTypes(userId, localCategories);
        if (isMounted) {
          setDbWorkTypes(mergedTypes);
          const activeNames = mergedTypes.filter((w) => w.is_active).map((w) => w.name);
          if (activeNames.length > 0) {
            setCategories(activeNames);
            storage.setCategories(activeNames);
          }
        }

        // 4. Load OT Types
        const dbOt = await fetchDBOtTypes(userId);
        if (isMounted) {
          setOtTypes(dbOt);
        }

        // 5. Load Work Logs from Supabase (Source of Truth).
        // If the remote table is empty, migrate local records once; a failed read never overwrites local data.
        const dbLogs = await fetchDBWorkLogs(userId);
        if (isMounted) {
          if (dbLogs.length > 0) {
            setLogs(dbLogs);
            storage.setLogs(dbLogs);
          } else if (localLogs.length > 0) {
            for (const l of localLogs) {
              await saveDBWorkLog(userId, l);
            }
            const migratedLogs = await fetchDBWorkLogs(userId);
            setLogs(migratedLogs.length > 0 ? migratedLogs : localLogs);
            storage.setLogs(migratedLogs.length > 0 ? migratedLogs : localLogs);
          }
        }
      } catch (err) {
        console.warn("Supabase initialization fallback:", err);
      } finally {
        if (isMounted) setReady(true);
      }
    }

    void initFromSupabase();

    return () => {
      isMounted = false;
    };
  }, [isGuest, useSupabase, userId]);

  const persistLogs = useCallback((next: WorkLog[]) => {
    setLogs(next);
    storage.setLogs(next);
  }, []);

  const saveRates = useCallback(
    async (next: RateSettings) => {
      setRates(next);
      setGlobalRates(next);
      storage.setRates(next);
      if (useSupabase && userId) {
        await saveDBUserSettings(userId, {
          daily_rate: next.dailyRate,
          default_ot_type: next.otType,
          travel_cost: next.travelCost,
          food_cost: next.foodCost,
          other_income: next.otherIncome,
          other_deductions: next.otherDeductions,
        });
      }
    },
    [useSupabase, userId],
  );

  useEffect(() => {
    if (!useSupabase || !userId || !activeBranchId) {
      setBranchSettings({});
      setRates(globalRates);
      return;
    }

    let cancelled = false;
    setBranchSettingsLoading(true);
    void fetchDBBranchSettings(activeBranchId, userId)
      .then((row) => {
        if (cancelled) return;
        const settings = row?.settings ?? {};
        setBranchSettings(settings);
        setRates(mergeBranchRates(globalRates, settings));
        if (settings.spreadsheetId) {
          setSpreadsheetIdState(settings.spreadsheetId);
          storage.setSheetId(settings.spreadsheetId);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setBranchSettings({});
          setRates(globalRates);
          toast.error("โหลดการตั้งค่าสาขาไม่สำเร็จ", {
            description: error instanceof Error ? error.message : String(error),
          });
        }
      })
      .finally(() => {
        if (!cancelled) setBranchSettingsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeBranchId, globalRates, useSupabase, userId]);

  const addBranch = useCallback(
    async (name: string, code?: string) => {
      if (!useSupabase || !userId) throw new Error("ต้องเข้าสู่ระบบก่อนจัดการสาขา");
      const created = await addDBBranch(userId, name, code);
      setBranches((current) => [...current, created]);
      setActiveBranchId(created.id);
      return created;
    },
    [useSupabase, userId],
  );

  const updateBranch = useCallback(
    async (id: string, patch: { name?: string; code?: string; is_active?: boolean }) => {
      if (!useSupabase || !userId) throw new Error("ต้องเข้าสู่ระบบก่อนจัดการสาขา");
      const updated = await updateDBBranch(id, patch);
      setBranches((current) => current.map((branch) => (branch.id === id ? updated : branch)));
      if (!updated.is_active && activeBranchId === id) {
        setActiveBranchId(null);
        setBranchSettings({});
        setRates(globalRates);
      }
      return updated;
    },
    [activeBranchId, globalRates, useSupabase, userId],
  );

  const selectBranch = useCallback((branchId: string | null) => {
    setActiveBranchId(branchId);
  }, []);

  const saveBranchSettings = useCallback(
    async (next: BranchSettings) => {
      if (!useSupabase || !userId || !activeBranchId) {
        throw new Error("กรุณาเลือกสาขาและเข้าสู่ระบบก่อนบันทึก");
      }
      const saved = await saveDBBranchSettings(activeBranchId, userId, next);
      setBranchSettings(saved.settings);
      setRates(mergeBranchRates(globalRates, saved.settings));
      if (saved.settings.spreadsheetId !== undefined) {
        setSpreadsheetIdState(saved.settings.spreadsheetId || "");
        storage.setSheetId(saved.settings.spreadsheetId || "");
      }
    },
    [activeBranchId, globalRates, useSupabase, userId],
  );

  const previewThemeSettings = useCallback((colors: CustomColors) => {
    setThemeSettings(colors);
    applyTheme(colors);
  }, []);

  const saveThemeSettings = useCallback(
    async (colors: CustomColors) => {
      setThemeSettings(colors);
      setSavedThemeSettings(colors);
      storage.setTheme(colors);
      applyTheme(colors);
      if (useSupabase && userId) {
        await saveDBUserSettings(userId, {
          theme: colors.themeMode,
          background_color: colors.backgroundColor,
          card_color: colors.cardColor,
          foreground_color: colors.foregroundColor,
          border_color: colors.borderColor,
          primary_color: colors.primaryColor,
          secondary_color: colors.secondaryColor,
          accent_color: colors.accentColor,
          success_color: colors.successColor,
          warning_color: colors.warningColor,
          destructive_color: colors.destructiveColor,
          chart_colors: colors.chartColors,
          preset_name: colors.presetName ?? null,
          border_radius: colors.borderRadius ?? "normal",
          button_style: colors.buttonStyle ?? "filled",
          density: colors.density ?? "normal",
        });
      }
    },
    [useSupabase, userId],
  );

  const resetThemeSettings = useCallback(async () => {
    setThemeSettings(DEFAULT_COLORS_LIGHT);
    setSavedThemeSettings(DEFAULT_COLORS_LIGHT);
    storage.setTheme(DEFAULT_COLORS_LIGHT);
    applyTheme(DEFAULT_COLORS_LIGHT);
    if (useSupabase && userId) {
      await saveDBUserSettings(userId, {
        theme: "light",
        background_color: DEFAULT_COLORS_LIGHT.backgroundColor,
        card_color: DEFAULT_COLORS_LIGHT.cardColor,
        foreground_color: DEFAULT_COLORS_LIGHT.foregroundColor,
        border_color: DEFAULT_COLORS_LIGHT.borderColor,
        primary_color: DEFAULT_COLORS_LIGHT.primaryColor,
        secondary_color: DEFAULT_COLORS_LIGHT.secondaryColor,
        accent_color: DEFAULT_COLORS_LIGHT.accentColor,
        success_color: DEFAULT_COLORS_LIGHT.successColor,
        warning_color: DEFAULT_COLORS_LIGHT.warningColor,
        destructive_color: DEFAULT_COLORS_LIGHT.destructiveColor,
        chart_colors: DEFAULT_COLORS_LIGHT.chartColors,
        preset_name: "google-blue",
        border_radius: "normal",
        button_style: "filled",
        density: "normal",
      });
    }
  }, [useSupabase, userId]);

  // Work types CRUD
  const saveCategories = useCallback(
    async (next: string[]) => {
      const normalized = [...new Set(next.map((name) => name.trim()).filter(Boolean))];
      if (normalized.length === 0) return;

      setCategories(normalized);
      storage.setCategories(normalized);

      if (useSupabase && userId) {
        const updated = await saveDBWorkTypeList(userId, normalized);
        const activeNames = updated.filter((item) => item.is_active).map((item) => item.name);
        setDbWorkTypes(updated);
        setCategories(activeNames);
        storage.setCategories(activeNames);
      }

      if (spreadsheetId) {
        void callServer(writeCategoryList, {
          data: { spreadsheetId, categories: normalized },
        }).catch((error: unknown) => {
          console.warn("Google Sheets category mirror warning:", error);
        });
      }
    },
    [spreadsheetId, useSupabase, userId],
  );

  const addWorkType = useCallback(
    async (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      if (!useSupabase || !userId) {
        await saveCategories([...categories, trimmed]);
        return;
      }
      const created = await addDBWorkType(userId, trimmed);
      if (created) {
        const updatedList = await fetchDBWorkTypes(userId);
        setDbWorkTypes(updatedList);
        const activeNames = updatedList.filter((w) => w.is_active).map((w) => w.name);
        setCategories(activeNames);
        storage.setCategories(activeNames);
      }
    },
    [categories, saveCategories, useSupabase, userId],
  );

  const editWorkType = useCallback(
    async (id: string, name: string) => {
      if (!useSupabase || !userId) {
        const target = dbWorkTypes.find((item) => item.id === id);
        if (target) {
          await saveCategories(
            categories.map((item) => (item === target.name ? name.trim() : item)),
          );
        }
        return;
      }
      await updateDBWorkType(id, name);
      const updatedList = await fetchDBWorkTypes(userId);
      setDbWorkTypes(updatedList);
      const activeNames = updatedList.filter((w) => w.is_active).map((w) => w.name);
      setCategories(activeNames);
      storage.setCategories(activeNames);
    },
    [categories, dbWorkTypes, saveCategories, useSupabase, userId],
  );

  const toggleWorkType = useCallback(
    async (id: string) => {
      const target = dbWorkTypes.find((w) => w.id === id);
      if (!target) return;
      if (!useSupabase || !userId) {
        const next = target.is_active
          ? categories.filter((item) => item !== target.name)
          : [...categories, target.name];
        await saveCategories(next.length > 0 ? next : categories);
        return;
      }
      if (target.is_active) {
        await softDeleteDBWorkType(id);
      } else {
        await addDBWorkType(userId, target.name);
      }
      const updatedList = await fetchDBWorkTypes(userId);
      setDbWorkTypes(updatedList);
      const activeNames = updatedList.filter((w) => w.is_active).map((w) => w.name);
      setCategories(activeNames);
      storage.setCategories(activeNames);
    },
    [categories, dbWorkTypes, saveCategories, useSupabase, userId],
  );

  const softDeleteWorkType = useCallback(
    async (id: string) => {
      const target = dbWorkTypes.find((item) => item.id === id);
      if (!target) return;
      if (!useSupabase || !userId) {
        const next = categories.filter((item) => item !== target.name);
        await saveCategories(next.length > 0 ? next : categories);
        return;
      }
      await softDeleteDBWorkType(id);
      const updatedList = await fetchDBWorkTypes(userId);
      setDbWorkTypes(updatedList);
      const activeNames = updatedList.filter((w) => w.is_active).map((w) => w.name);
      setCategories(activeNames);
      storage.setCategories(activeNames);
      toast.success("ปิดใช้งานประเภทงานแล้ว (Soft Delete)");
    },
    [categories, dbWorkTypes, saveCategories, useSupabase, userId],
  );

  const setSpreadsheetId = useCallback(
    async (id: string) => {
      setSpreadsheetIdState(id);
      storage.setSheetId(id);
      if (useSupabase && userId) {
        await saveDBUserSettings(userId, { spreadsheet_id: id });
      }
    },
    [useSupabase, userId],
  );

  const mirrorToSheet = useCallback(async (allLogs: WorkLog[], sheetId: string) => {
    if (!sheetId) return;
    await callServer(replaceWorkLogRows, {
      data: {
        spreadsheetId: sheetId,
        rows: allLogs.slice().reverse().map(logToRow),
      },
    });
  }, []);

  const autoMirror = useCallback(
    (allLogs: WorkLog[]) => {
      if (!spreadsheetId) return;
      setSyncing(true);
      void mirrorToSheet(allLogs, spreadsheetId)
        .then(async () => {
          const syncedAt = new Date().toISOString();
          const marked = allLogs.map((l) => ({ ...l, syncedAt }));
          setLogs(marked);
          storage.setLogs(marked);
          if (useSupabase && userId) {
            await Promise.all(marked.map((log) => saveDBWorkLog(userId, log)));
          }
        })
        .catch((err: unknown) => {
          toast.error("อัปเดต Google Sheets ไม่สำเร็จ", {
            description: err instanceof Error ? err.message : String(err),
          });
        })
        .finally(() => setSyncing(false));
    },
    [mirrorToSheet, spreadsheetId, useSupabase, userId],
  );

  const syncAirtableSingle = useCallback(
    async (log: WorkLog) => {
      try {
        const res = await callServer(syncRecordToAirtable, { data: { log } });
        if (res.success && res.recordId) {
          const updated: WorkLog = {
            ...log,
            airtableRecordId: res.recordId,
            airtableSyncedAt: res.syncedAt ?? new Date().toISOString(),
            airtableSyncStatus: "synced",
          };
          if (useSupabase && userId) {
            await updateDBAirtableStatus(log.id, res.recordId, "synced");
          }
          setLogs((current) => {
            const next = current.map((item) => (item.id === log.id ? updated : item));
            storage.setLogs(next);
            return next;
          });
          return { success: true, recordId: res.recordId };
        }

        const failed: WorkLog = { ...log, airtableSyncStatus: "failed" };
        if (useSupabase && userId) {
          await updateDBAirtableStatus(log.id, log.airtableRecordId ?? null, "failed");
        }
        setLogs((current) => {
          const next = current.map((item) => (item.id === log.id ? failed : item));
          storage.setLogs(next);
          return next;
        });
        return { success: false, error: res.error };
      } catch (err) {
        const failed: WorkLog = { ...log, airtableSyncStatus: "failed" };
        if (useSupabase && userId) {
          await updateDBAirtableStatus(log.id, log.airtableRecordId ?? null, "failed");
        }
        setLogs((current) => {
          const next = current.map((item) => (item.id === log.id ? failed : item));
          storage.setLogs(next);
          return next;
        });
        return { success: false, error: err instanceof Error ? err.message : String(err) };
      }
    },
    [useSupabase, userId],
  );

  const syncAirtableAll = useCallback(async () => {
    setAirtableSyncing(true);
    let successCount = 0;
    try {
      for (const log of logs) {
        const res = await syncAirtableSingle(log);
        if (res.success) successCount++;
      }
      if (useSupabase && userId) {
        const refreshed = await fetchDBWorkLogs(userId);
        if (refreshed.length > 0) {
          setLogs(refreshed);
          storage.setLogs(refreshed);
        }
      }
      if (successCount > 0) {
        toast.success(`ซิงก์ข้อมูลไป Airtable สำเร็จ ${successCount} รายการ`);
      } else {
        toast.info("Airtable ถูกปิดใช้งานชั่วคราว (ยังไม่ได้ตั้งค่า API Key ในระบบ)");
      }
    } catch (err) {
      toast.error("การซิงก์ Airtable เกิดข้อผิดพลาด", {
        description: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setAirtableSyncing(false);
    }
  }, [logs, syncAirtableSingle, useSupabase, userId]);

  const checkIn = useCallback(
    (input: CheckInInput) => {
      const now = new Date();
      const record: ActiveCheckIn = {
        id: `LOG-${now.getTime()}`,
        date: dateInBangkok(now.toISOString()),
        checkInTime: now.toISOString(),
        workType: input.workType,
        locationName: input.locationName,
        checkInGPS: input.gps,
        checkInPhoto: input.photo,
        dailyRate: input.rates.dailyRate,
        otType: input.rates.otType,
        travelCost: input.rates.travelCost,
        foodCost: input.rates.foodCost,
        otherIncome: input.rates.otherIncome,
        otherDeductions: input.rates.otherDeductions,
        tasks: input.tasks.filter((t) => t.trim()),
      };
      setActive(record);
      storage.setActive(record);
      void saveRates(input.rates);
      toast.success("Check-in สำเร็จ", {
        description: `${record.workType} @ ${record.locationName}`,
      });
      return record;
    },
    [saveRates],
  );

  const updateActiveTasks = useCallback((tasks: string[]) => {
    setActive((prev) => {
      if (!prev) return prev;
      const next = { ...prev, tasks };
      storage.setActive(next);
      return next;
    });
  }, []);

  const updateLogTasks = useCallback(
    (id: string, tasks: string[]) => {
      const next = logs.map((l) => (l.id === id ? { ...l, tasks, syncedAt: null } : l));
      persistLogs(next);
      const target = next.find((l) => l.id === id);
      if (target && userId) {
        void saveDBWorkLog(userId, target);
      }
      autoMirror(next);
    },
    [autoMirror, logs, persistLogs, userId],
  );

  const checkOut = useCallback(
    async (gps: GPSPoint, photo: string | null) => {
      if (!active) return null;
      const now = new Date().toISOString();
      const payroll = calculatePayroll(active.checkInTime, now, active);
      const doneTasks = (active.tasks ?? []).filter((t) => t.trim());
      const completed: WorkLog = {
        ...active,
        tasks: doneTasks.length > 0 ? doneTasks : [active.workType || "งานที่ทำเสร็จ"],
        checkOutTime: now,
        checkOutGPS: gps,
        checkOutPhoto: photo,
        ...payroll,
        syncedAt: null,
      };

      const next = [completed, ...logs];
      persistLogs(next);
      setActive(null);
      storage.setActive(null);

      // Save to Supabase (Source of Truth)
      if (useSupabase && userId) {
        await saveDBWorkLog(userId, completed);
      }

      toast.success("Check-out สำเร็จ", {
        description: `รายได้สุทธิ ฿${completed.netIncome.toLocaleString("th-TH")}`,
      });

      // Google Sheets Mirror
      if (spreadsheetId) {
        setSyncing(true);
        try {
          await mirrorToSheet(next, spreadsheetId);
          const syncedAt = new Date().toISOString();
          persistLogs(next.map((l) => ({ ...l, syncedAt })));
        } catch (err) {
          console.warn("Google Sheets mirror warning:", err);
        } finally {
          setSyncing(false);
        }
      }

      return completed;
    },
    [active, logs, mirrorToSheet, persistLogs, spreadsheetId, useSupabase, userId],
  );

  const deleteLog = useCallback(
    (id: string) => {
      const next = logs.filter((l) => l.id !== id);
      persistLogs(next);
      if (useSupabase && userId) {
        void deleteDBWorkLog(id);
      }
      autoMirror(next);
      toast.success("ลบรายการแล้ว");
    },
    [autoMirror, logs, persistLogs, useSupabase, userId],
  );

  const cancelActive = useCallback(() => {
    setActive(null);
    storage.setActive(null);
    toast.info("ยกเลิกการ Check-in แล้ว");
  }, []);

  const updateActiveTime = useCallback(
    (checkInISO: string) => {
      if (!active) return;
      const next = { ...active, checkInTime: checkInISO, date: dateInBangkok(checkInISO) };
      setActive(next);
      storage.setActive(next);
      toast.success("แก้ไขเวลาเข้างานแล้ว");
    },
    [active],
  );

  const updateLog = useCallback(
    (id: string, patch: Partial<WorkLog>) => {
      const target = logs.find((l) => l.id === id);
      if (!target) return;
      const merged: WorkLog = { ...target, ...patch };
      if (
        merged.checkOutTime &&
        new Date(merged.checkOutTime).getTime() <= new Date(merged.checkInTime).getTime()
      ) {
        toast.error("เวลาออกงานต้องอยู่หลังเวลาเข้างาน");
        return;
      }
      const payroll = merged.checkOutTime
        ? calculatePayroll(merged.checkInTime, merged.checkOutTime, merged)
        : {};
      const updated: WorkLog = {
        ...merged,
        date: dateInBangkok(merged.checkInTime),
        ...payroll,
        syncedAt: null,
      };
      const next = logs.map((l) => (l.id === id ? updated : l));
      persistLogs(next);

      if (useSupabase && userId) {
        void saveDBWorkLog(userId, updated);
      }

      autoMirror(next);
      toast.success("บันทึกการแก้ไขแล้ว");
    },
    [autoMirror, logs, persistLogs, useSupabase, userId],
  );

  const pullFromSheet = useCallback(
    async (_force = false) => {
      if (!spreadsheetId) {
        toast.info("กรุณาเชื่อมต่อ Google Sheets ก่อน");
        return;
      }
      setSyncing(true);
      try {
        const result = await callServer(readWorkLogRows, { data: { spreadsheetId } });
        const pulled = result.rows.map(rowToLog).filter((item): item is WorkLog => item !== null);
        if (pulled.length === 0) {
          toast.info("ไม่พบรายการใน Google Sheets จึงไม่ล้างข้อมูลเดิม");
          return;
        }

        const mergedById = new Map(logs.map((log) => [log.id, log]));
        for (const log of pulled) mergedById.set(log.id, log);
        const merged = [...mergedById.values()].sort(
          (a, b) => new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime(),
        );
        persistLogs(merged);
        if (useSupabase && userId) {
          await Promise.all(pulled.map((log) => saveDBWorkLog(userId, log)));
        }
        toast.success(`ดึงข้อมูลจาก Google Sheets สำเร็จ ${pulled.length} รายการ`);
      } catch (error) {
        toast.error("ดึงข้อมูลจาก Google Sheets ไม่สำเร็จ", {
          description: error instanceof Error ? error.message : String(error),
        });
      } finally {
        setSyncing(false);
      }
    },
    [logs, persistLogs, spreadsheetId, useSupabase, userId],
  );

  const syncPending = useCallback(() => {
    if (!spreadsheetId) {
      toast.info("กรุณาเชื่อมต่อ Google Sheets ก่อน");
      return;
    }
    autoMirror(logs);
  }, [autoMirror, logs, spreadsheetId]);

  return {
    ready,
    logs,
    active,
    categories,
    dbWorkTypes,
    otTypes,
    rates,
    globalRates,
    branches,
    activeBranchId,
    branchSettings,
    branchSettingsLoading,
    themeSettings,
    savedThemeSettings,
    spreadsheetId,
    syncing,
    airtableSyncing,
    pendingCount: logs.filter((l) => !l.syncedAt).length,
    saveCategories,
    addWorkType,
    editWorkType,
    toggleWorkType,
    softDeleteWorkType,
    saveRates,
    addBranch,
    updateBranch,
    selectBranch,
    saveBranchSettings,
    previewThemeSettings,
    saveThemeSettings,
    resetThemeSettings,
    setSpreadsheetId,
    checkIn,
    checkOut,
    deleteLog,
    cancelActive,
    updateActiveTime,
    updateActiveTasks,
    updateLogTasks,
    updateLog,
    pullFromSheet,
    syncPending,
    syncAirtableAll,
  };
}
