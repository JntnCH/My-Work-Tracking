import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_CATEGORIES, OT_OPTIONS, type WorkLog } from "@/lib/work-log";
import type { CustomColors } from "@/lib/theme";

export type DBWorkType = {
  id: string;
  user_id: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type DBBranch = {
  id: string;
  user_id: string;
  name: string;
  code: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type BranchSettings = {
  dailyRate?: number;
  defaultOtType?: number;
  travelCost?: number;
  foodCost?: number;
  otherIncome?: number;
  otherDeductions?: number;
  spreadsheetId?: string;
};

export type DBBranchSettings = {
  branch_id: string;
  user_id: string;
  settings: BranchSettings;
  updated_at: string;
};

export type DBOtType = {
  id: string;
  user_id?: string | null;
  name: string;
  multiplier: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

export type DBUserSettings = {
  user_id: string;
  theme: string;
  background_color: string;
  card_color: string;
  foreground_color: string;
  border_color: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  success_color: string;
  warning_color: string;
  destructive_color: string;
  chart_colors: string[];
  preset_name: string | null;
  border_radius: string;
  button_style: string;
  density: string;
  daily_rate: number;
  default_ot_type: number;
  travel_cost: number;
  food_cost: number;
  other_income: number;
  other_deductions: number;
  spreadsheet_id: string;
  updated_at: string;
};

/* ------------------------------------------------------------------ */
/* Work Types (ประเภทงาน)                                             */
/* ------------------------------------------------------------------ */

export async function fetchDBWorkTypes(userId: string): Promise<DBWorkType[]> {
  const { data, error } = await supabase
    .from("work_types")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) {
    console.warn("Supabase fetch work_types warning:", error.message);
    throw error;
  }
  return (data as DBWorkType[]) || [];
}

export async function addDBWorkType(userId: string, name: string): Promise<DBWorkType | null> {
  const trimmed = name.trim();
  if (!trimmed) return null;

  try {
    // Check duplicate
    const existing = await fetchDBWorkTypes(userId);
    const dup = existing.find((w) => w.name.toLowerCase() === trimmed.toLowerCase());

    if (dup) {
      if (!dup.is_active) {
        // Re-activate
        const { data, error } = await supabase
          .from("work_types")
          .update({ is_active: true, updated_at: new Date().toISOString() })
          .eq("id", dup.id)
          .select()
          .single();

        if (error) throw error;
        return data as DBWorkType;
      }
      throw new Error(`ประเภทงาน "${trimmed}" มีอยู่แล้วในระบบ`);
    }

    const { data, error } = await supabase
      .from("work_types")
      .insert({
        user_id: userId,
        name: trimmed,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;
    return data as DBWorkType;
  } catch (err) {
    console.error("addDBWorkType failed:", err);
    throw err;
  }
}

export async function updateDBWorkType(id: string, name: string): Promise<boolean> {
  const trimmed = name.trim();
  if (!trimmed) return false;

  try {
    const { error } = await supabase
      .from("work_types")
      .update({ name: trimmed, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error("updateDBWorkType failed:", err);
    throw err;
  }
}

export async function softDeleteDBWorkType(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("work_types")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error("softDeleteDBWorkType failed:", err);
    throw err;
  }
}

/**
 * Merges local categories into Supabase without deleting or overwriting existing rows.
 * This is intentionally idempotent so a refresh or a second browser cannot erase work types.
 */
export async function syncDBWorkTypes(userId: string, categories: string[]): Promise<DBWorkType[]> {
  const current = await fetchDBWorkTypes(userId);
  const existingNames = new Set(current.map((item) => item.name.trim().toLocaleLowerCase("th-TH")));
  const namesToInsert = [
    ...new Set(
      (categories.length > 0 ? categories : DEFAULT_CATEGORIES)
        .map((name) => name.trim())
        .filter(Boolean),
    ),
  ].filter((name) => !existingNames.has(name.toLocaleLowerCase("th-TH")));

  if (namesToInsert.length > 0) {
    const { error } = await supabase
      .from("work_types")
      .insert(namesToInsert.map((name) => ({ user_id: userId, name, is_active: true })));
    if (error && error.code !== "23505") throw error;
  }

  return fetchDBWorkTypes(userId);
}

/**
 * Persists the list edited in the original CategoryDialog.
 * Existing rows are soft-disabled rather than deleted so historical logs remain valid.
 */
export async function saveDBWorkTypeList(
  userId: string,
  categories: string[],
): Promise<DBWorkType[]> {
  const names = [...new Set(categories.map((name) => name.trim()).filter(Boolean))];
  const current = await fetchDBWorkTypes(userId);
  const wanted = new Set(names.map((name) => name.toLocaleLowerCase("th-TH")));

  for (const item of current) {
    const shouldBeActive = wanted.has(item.name.trim().toLocaleLowerCase("th-TH"));
    if (item.is_active !== shouldBeActive) {
      const { error } = await supabase
        .from("work_types")
        .update({ is_active: shouldBeActive, updated_at: new Date().toISOString() })
        .eq("id", item.id);
      if (error) throw error;
    }
  }

  const currentNames = new Set(current.map((item) => item.name.trim().toLocaleLowerCase("th-TH")));
  for (const name of names) {
    if (!currentNames.has(name.toLocaleLowerCase("th-TH"))) {
      const { error } = await supabase.from("work_types").insert({
        user_id: userId,
        name,
        is_active: true,
      });
      if (error && error.code !== "23505") throw error;
    }
  }

  return fetchDBWorkTypes(userId);
}

/** Backward-compatible alias used by older callers. */
export const seedDBWorkTypesIfEmpty = syncDBWorkTypes;

/* ------------------------------------------------------------------ */
/* OT Types (ประเภท OT)                                               */
/* ------------------------------------------------------------------ */

export async function fetchDBOtTypes(userId: string): Promise<DBOtType[]> {
  try {
    const { data, error } = await supabase
      .from("ot_types")
      .select("*")
      .or(`user_id.eq.${userId},user_id.is.null`)
      .order("multiplier", { ascending: true });

    if (error || !data || data.length === 0) {
      // Fallback to static OT_OPTIONS with guaranteed "ไม่มี OT"
      return OT_OPTIONS.map((o) => ({
        id: `ot-${o.value}`,
        name: o.label,
        multiplier: o.value,
        is_active: true,
      }));
    }
    return data as DBOtType[];
  } catch {
    return OT_OPTIONS.map((o) => ({
      id: `ot-${o.value}`,
      name: o.label,
      multiplier: o.value,
      is_active: true,
    }));
  }
}

export async function addDBOtType(
  userId: string,
  name: string,
  multiplier: number,
): Promise<DBOtType | null> {
  try {
    const { data, error } = await supabase
      .from("ot_types")
      .insert({
        user_id: userId,
        name: name.trim(),
        multiplier,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;
    return data as DBOtType;
  } catch (err) {
    console.error("addDBOtType failed:", err);
    throw err;
  }
}

/* ------------------------------------------------------------------ */
/* Branches and branch-level settings                                  */
/* ------------------------------------------------------------------ */

export async function fetchDBBranches(userId: string): Promise<DBBranch[]> {
  const { data, error } = await supabase
    .from("branches")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data as DBBranch[]) || [];
}

export async function addDBBranch(
  userId: string,
  name: string,
  code?: string,
): Promise<DBBranch> {
  const trimmedName = name.trim();
  if (!trimmedName) throw new Error("กรุณาระบุชื่อสาขา");
  const { data, error } = await supabase
    .from("branches")
    .insert({ user_id: userId, name: trimmedName, code: code?.trim() || null, is_active: true })
    .select("*")
    .single();
  if (error) throw error;
  return data as DBBranch;
}

export async function updateDBBranch(
  id: string,
  patch: Partial<Pick<DBBranch, "name" | "code" | "is_active">>,
): Promise<DBBranch> {
  const payload = {
    ...patch,
    ...(patch.name !== undefined ? { name: patch.name.trim() } : {}),
    ...(patch.code !== undefined ? { code: patch.code?.trim() || null } : {}),
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await supabase
    .from("branches")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as DBBranch;
}

export async function fetchDBBranchSettings(
  branchId: string,
  userId: string,
): Promise<DBBranchSettings | null> {
  const { data, error } = await supabase
    .from("branch_settings")
    .select("*")
    .eq("branch_id", branchId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    ...(data as Omit<DBBranchSettings, "settings">),
    settings: (data.settings as BranchSettings) || {},
  };
}

export async function saveDBBranchSettings(
  branchId: string,
  userId: string,
  settings: BranchSettings,
): Promise<DBBranchSettings> {
  const { data, error } = await supabase
    .from("branch_settings")
    .upsert(
      {
        branch_id: branchId,
        user_id: userId,
        settings,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "branch_id" },
    )
    .select("*")
    .single();
  if (error) throw error;
  return {
    ...(data as Omit<DBBranchSettings, "settings">),
    settings: (data.settings as BranchSettings) || {},
  };
}

/* ------------------------------------------------------------------ */
/* User Settings (ตั้งค่าระบบ & Theme & Rates)                        */
/* ------------------------------------------------------------------ */

export async function fetchDBUserSettings(userId: string): Promise<Partial<DBUserSettings> | null> {
  try {
    const { data, error } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.warn("fetchDBUserSettings warning:", error.message);
      return null;
    }
    return (data as DBUserSettings) || null;
  } catch (err) {
    console.warn("fetchDBUserSettings exception:", err);
    return null;
  }
}

export async function saveDBUserSettings(
  userId: string,
  settings: Partial<DBUserSettings>,
): Promise<boolean> {
  try {
    const payload = {
      user_id: userId,
      ...settings,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("user_settings")
      .upsert(payload, { onConflict: "user_id" });

    if (error) throw error;
    return true;
  } catch (err) {
    console.error("saveDBUserSettings failed:", err);
    throw err;
  }
}

/* ------------------------------------------------------------------ */
/* Work Logs (ประวัติการทำงานใน Supabase)                                */
/* ------------------------------------------------------------------ */

export async function fetchDBWorkLogs(userId: string): Promise<WorkLog[]> {
  try {
    const { data, error } = await supabase
      .from("work_logs")
      .select("*")
      .eq("user_id", userId)
      .order("check_in_time", { ascending: false });

    if (error) {
      console.warn("fetchDBWorkLogs warning:", error.message);
      return [];
    }

    return ((data as Record<string, unknown>[]) || []).map((row) => ({
      id: String(row.id || ""),
      date: String(row.date || ""),
      checkInTime: String(row.check_in_time || ""),
      checkOutTime: String(row.check_out_time || ""),
      workType: String(row.work_type || ""),
      locationName: String(row.location_name || ""),
      checkInGPS: (row.check_in_gps as WorkLog["checkInGPS"]) || { lat: null, lng: null, text: "" },
      checkOutGPS: (row.check_out_gps as WorkLog["checkOutGPS"]) || {
        lat: null,
        lng: null,
        text: "",
      },
      checkInPhoto: (row.check_in_photo as string) || null,
      checkOutPhoto: (row.check_out_photo as string) || null,
      grossHours: Number(row.gross_hours || 0),
      workingHours: Number(row.working_hours || 0),
      otHours: Number(row.ot_hours || 0),
      otType: Number(row.ot_type ?? 0),
      dailyRate: Number(row.daily_rate || 0),
      baseWage: Number(row.base_wage || 0),
      otIncome: Number(row.ot_income || 0),
      travelCost: Number(row.travel_cost || 0),
      foodCost: Number(row.food_cost || 0),
      otherIncome: Number(row.other_income || 0),
      otherDeductions: Number(row.other_deductions || 0),
      netIncome: Number(row.net_income || 0),
      tasks: (row.tasks as string[]) || [],
      airtableRecordId: (row.airtable_record_id as string) || null,
      airtableSyncedAt: (row.airtable_synced_at as string) || null,
      airtableSyncStatus: (row.sync_status as WorkLog["airtableSyncStatus"]) || "pending",
      syncedAt: (row.synced_at as string) || null,
    }));
  } catch (err) {
    console.warn("fetchDBWorkLogs exception:", err);
    return [];
  }
}

export async function saveDBWorkLog(userId: string, log: WorkLog): Promise<boolean> {
  try {
    const payload = {
      id: log.id,
      user_id: userId,
      date: log.date,
      check_in_time: log.checkInTime,
      check_out_time: log.checkOutTime || null,
      work_type: log.workType,
      location_name: log.locationName,
      check_in_gps: log.checkInGPS || null,
      check_out_gps: log.checkOutGPS || null,
      check_in_photo: log.checkInPhoto || null,
      check_out_photo: log.checkOutPhoto || null,
      gross_hours: log.grossHours || 0,
      working_hours: log.workingHours || 0,
      ot_hours: log.otHours || 0,
      ot_type: log.otType ?? 0,
      daily_rate: log.dailyRate || 0,
      base_wage: log.baseWage || 0,
      ot_income: log.otIncome || 0,
      travel_cost: log.travelCost || 0,
      food_cost: log.foodCost || 0,
      other_income: log.otherIncome || 0,
      other_deductions: log.otherDeductions || 0,
      net_income: log.netIncome || 0,
      tasks: log.tasks || [],
      airtable_record_id: log.airtableRecordId || null,
      airtable_synced_at: log.airtableSyncedAt || null,
      sync_status: log.airtableSyncStatus || "pending",
      synced_at: log.syncedAt || null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("work_logs").upsert(payload, { onConflict: "id" });
    if (error) throw error;
    return true;
  } catch (err) {
    console.error("saveDBWorkLog failed:", err);
    return false;
  }
}

export async function deleteDBWorkLog(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("work_logs").delete().eq("id", id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error("deleteDBWorkLog failed:", err);
    return false;
  }
}

export async function updateDBAirtableStatus(
  logId: string,
  airtableRecordId: string | null,
  syncStatus: "synced" | "failed" | "pending",
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("work_logs")
      .update({
        airtable_record_id: airtableRecordId,
        airtable_synced_at: syncStatus === "synced" ? new Date().toISOString() : null,
        sync_status: syncStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", logId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error("updateDBAirtableStatus failed:", err);
    return false;
  }
}
