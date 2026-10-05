import { useCallback, useEffect, useRef, useState } from "react";
import {
  BedDouble,
  Camera,
  Clock,
  Cog,
  Crosshair,
  LocateFixed,
  LogIn,
  ListPlus,
  LogOut,
  MapPin,
  Settings2,
  X,
} from "lucide-react";
import { EngineWorkingAnimation } from "@/components/ui/engine-working-animation";
import { toast } from "sonner";
import type { GPSPoint, RateSettings, WorkLog, ActiveCheckIn, WageType } from "@/lib/work-log";
import {
  BREAK_OPTIONS,
  DEFAULT_WORK_TYPE_RATES,
  OT_OPTIONS,
  WAGE_TYPE_OPTIONS,
  calculatePayroll,
  formatDuration,
  fromLocalInput,
  getEffectiveRateForWorkType,
  parseMapsUrl,
  storage,
  toLocalInput,
} from "@/lib/work-log";
import { CategoryDialog } from "./CategoryDialog";
import {
  describeGeolocationFailure,
  isEmbeddedContext,
  requestCurrentPosition,
} from "@/lib/geolocation";

type Props = {
  active: ActiveCheckIn | null;
  logs: WorkLog[];
  categories: string[];
  rates: RateSettings;
  onSaveCategories: (next: string[]) => void;
  onCheckIn: (input: {
    workType: string;
    locationName: string;
    gps: GPSPoint;
    photo: string | null;
    rates: RateSettings;
    tasks: string[];
  }) => void;
  onCheckOut: (gps: GPSPoint, photo: string | null, overrides?: Partial<ActiveCheckIn>) => void;
  onCancelActive: () => void;
  onEditActiveTime: (iso: string) => void;
  onEditActiveTasks: (tasks: string[]) => void;
  onEditActiveDetails?: (patch: Partial<ActiveCheckIn>) => void;
};

const EMPTY_GPS: GPSPoint = { lat: null, lng: null, text: "ยังไม่ได้ดึงพิกัด", addressName: "" };

async function reverseGeocode(lat: number, lng: number) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5_000);
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=th`,
      { signal: controller.signal },
    );
    if (!res.ok) return "";
    const data = (await res.json()) as { address?: Record<string, string> };
    const a = data.address ?? {};
    return [
      a["building"] || a["amenity"] || a["road"] || "",
      a["subdistrict"] || a["suburb"] || a["village"] || "",
      a["district"] || a["city"] || a["town"] || "",
      a["state"] || "",
    ]
      .filter(Boolean)
      .join(", ");
  } catch {
    return "";
  } finally {
    clearTimeout(timeoutId);
  }
}

export function CheckInPanel({
  active,
  logs,
  categories,
  rates,
  onSaveCategories,
  onCheckIn,
  onCheckOut,
  onCancelActive,
  onEditActiveTime,
  onEditActiveTasks,
  onEditActiveDetails,
}: Props) {
  const [workType, setWorkType] = useState(categories[0] ?? "");
  const [locationName, setLocationName] = useState("");
  const [gps, setGps] = useState<GPSPoint>(EMPTY_GPS);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [form, setForm] = useState<RateSettings>(() =>
    getEffectiveRateForWorkType(categories[0] ?? "", rates),
  );
  const [dailyRateInput, setDailyRateInput] = useState(() => String(form.dailyRate ?? ""));
  const [travelCostInput, setTravelCostInput] = useState(() =>
    form.travelCost ? String(form.travelCost) : "",
  );
  const [foodCostInput, setFoodCostInput] = useState(() =>
    form.foodCost ? String(form.foodCost) : "",
  );
  const [otherIncomeInput, setOtherIncomeInput] = useState(() =>
    form.otherIncome ? String(form.otherIncome) : "",
  );
  const [otherDeductionsInput, setOtherDeductionsInput] = useState(() =>
    form.otherDeductions ? String(form.otherDeductions) : "",
  );
  const [elapsed, setElapsed] = useState(0);
  const [catOpen, setCatOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [taskInput, setTaskInput] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // Sync state with active shift or category changes
  useEffect(() => {
    if (active) {
      const activeType = active.workType || categories[0] || "";
      setWorkType(activeType);
      setLocationName(active.locationName ?? "");
      const wageType: WageType =
        active.wageType || (active.dailyRate < 100 ? "per_job" : rates.wageType || "daily");
      const activeRates: RateSettings = {
        dailyRate: active.dailyRate ?? rates.dailyRate,
        wageType,
        otType: active.otType ?? rates.otType ?? 0,
        travelCost: active.travelCost ?? rates.travelCost ?? 0,
        foodCost: active.foodCost ?? rates.foodCost ?? 0,
        otherIncome: active.otherIncome ?? rates.otherIncome ?? 0,
        otherDeductions: active.otherDeductions ?? rates.otherDeductions ?? 0,
        breakHours: active.breakHours ?? rates.breakHours ?? (wageType === "per_job" ? 0 : 1),
      };
      setForm(activeRates);
      setDailyRateInput(String(activeRates.dailyRate ?? ""));
      setTravelCostInput(activeRates.travelCost ? String(activeRates.travelCost) : "");
      setFoodCostInput(activeRates.foodCost ? String(activeRates.foodCost) : "");
      setOtherIncomeInput(activeRates.otherIncome ? String(activeRates.otherIncome) : "");
      setOtherDeductionsInput(activeRates.otherDeductions ? String(activeRates.otherDeductions) : "");
    } else {
      const effective = getEffectiveRateForWorkType(workType || categories[0] || "", rates);
      setForm(effective);
      setDailyRateInput(String(effective.dailyRate ?? ""));
      setTravelCostInput(effective.travelCost ? String(effective.travelCost) : "");
      setFoodCostInput(effective.foodCost ? String(effective.foodCost) : "");
      setOtherIncomeInput(effective.otherIncome ? String(effective.otherIncome) : "");
      setOtherDeductionsInput(effective.otherDeductions ? String(effective.otherDeductions) : "");
    }
  }, [active, categories, rates, workType]);

  const handleSelectWorkType = (val: string) => {
    setWorkType(val);
    const effective = getEffectiveRateForWorkType(val, rates);
    setForm(effective);
    setDailyRateInput(String(effective.dailyRate ?? ""));
    setTravelCostInput(effective.travelCost ? String(effective.travelCost) : "");
    setFoodCostInput(effective.foodCost ? String(effective.foodCost) : "");

    if (active) {
      onEditActiveDetails?.({
        workType: val,
        dailyRate: effective.dailyRate,
        wageType: effective.wageType,
        breakHours: effective.breakHours,
        otType: effective.otType,
        travelCost: effective.travelCost,
        foodCost: effective.foodCost,
      });
    }
  };

  useEffect(() => {
    if (!categories.includes(workType) && categories.length > 0) {
      handleSelectWorkType(categories[0] ?? "");
    }
  }, [categories, workType]);

  useEffect(() => {
    if (!active) return;
    const tick = () => setElapsed(Date.now() - new Date(active.checkInTime).getTime());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [active]);

  const fetchGPS = useCallback(async (): Promise<GPSPoint | null> => {
    setGpsLoading(true);
    try {
      const position = await requestCurrentPosition();
      const lat = position.latitude.toFixed(6);
      const lng = position.longitude.toFixed(6);
      const nextGPS: GPSPoint = {
        lat,
        lng,
        text: `Lat: ${lat}, Lng: ${lng}`,
        addressName: "",
        accuracy: position.accuracy,
      };
      setGps(nextGPS);

      // GPS is usable immediately; reverse geocoding is best-effort and must not block check-in.
      void reverseGeocode(position.latitude, position.longitude).then((addressName) => {
        if (!addressName) return;
        setGps((current) =>
          current.lat === lat && current.lng === lng ? { ...current, addressName } : current,
        );
        setLocationName((curr) => {
          if (
            !curr ||
            curr === "ไม่ได้ระบุสถานที่" ||
            curr.startsWith("Lat:") ||
            curr.startsWith("ยังไม่ได้")
          ) {
            return addressName;
          }
          return curr;
        });
      });
      return nextGPS;
    } catch (error) {
      setGps({ ...EMPTY_GPS, text: describeGeolocationFailure(error) });
      return null;
    } finally {
      setGpsLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const status = await navigator.permissions?.query({
          name: "geolocation" as PermissionName,
        });
        if (!cancelled && status?.state === "granted") void fetchGPS();
        else if (!cancelled)
          setGps({ ...EMPTY_GPS, text: "แตะปุ่มค้นหาตำแหน่ง หรือกด Check-in เพื่อขอพิกัด" });
      } catch {
        if (!cancelled)
          setGps({ ...EMPTY_GPS, text: "แตะปุ่มค้นหาตำแหน่ง หรือกด Check-in เพื่อขอพิกัด" });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchGPS]);

  const quickLocations = Array.from(
    new Set(logs.map((l) => l.locationName).filter((l) => l && l !== "ไม่ได้ระบุสถานที่")),
  ).slice(0, 6);

  const handleLocationChange = (value: string) => {
    setLocationName(value);
    const parsed = parseMapsUrl(value);
    if (parsed) {
      setGps({
        lat: parsed.lat,
        lng: parsed.lng,
        text: `Lat: ${parsed.lat}, Lng: ${parsed.lng}`,
        addressName: "จากลิงก์ Google Maps",
      });
    }
  };

  const onPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPhoto(String(ev.target?.result ?? ""));
    reader.readAsDataURL(file);
  };

  const resetPhoto = () => {
    setPhoto(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  // Tasks belong to the shift in progress only.
  const tasks = active?.tasks ?? [];
  const setTasks = (next: string[]) => onEditActiveTasks(next);

  const addTask = () => {
    const value = taskInput.trim();
    if (!value || !active) return;
    setTasks([...tasks, value]);
    setTaskInput("");
  };

  const doCheckIn = async () => {
    if (active || gpsLoading) return;

    const rawDailyRate = dailyRateInput.trim();
    const dailyRate = Number(rawDailyRate);
    if (!rawDailyRate || !Number.isFinite(dailyRate) || dailyRate < 0) {
      toast.error("กรุณากรอกค่าแรงเป็นตัวเลขที่ไม่ติดลบก่อน Check-in");
      return;
    }

    const wageType: WageType = form.wageType || (dailyRate < 100 ? "per_job" : "daily");
    const travelCost = travelCostInput.trim() ? Number(travelCostInput) : 0;
    const foodCost = foodCostInput.trim() ? Number(foodCostInput) : 0;
    const otherIncome = otherIncomeInput.trim() ? Number(otherIncomeInput) : 0;
    const otherDeductions = otherDeductionsInput.trim() ? Number(otherDeductionsInput) : 0;

    let nextGPS = gps;
    if (!nextGPS.lat || !nextGPS.lng) {
      const fetchedGPS = await fetchGPS();
      if (fetchedGPS) nextGPS = fetchedGPS;
    }
    if (!nextGPS.lat || !nextGPS.lng) {
      toast.warning("บันทึก Check-in โดยไม่มีพิกัด GPS", {
        description: isEmbeddedContext()
          ? "เปิดเว็บในแท็บ Safari ใหม่เพื่อให้เข้าถึงตำแหน่งได้ หรือกรอกสถานที่เอง"
          : "คุณยังกรอกสถานที่เองได้ และสามารถลองค้นหาตำแหน่งใหม่ภายหลัง",
      });
    }

    // Save customized rate for this workType
    const currentCustom = storage.getWorkTypeRates();
    storage.setWorkTypeRates({
      ...currentCustom,
      [workType]: {
        dailyRate,
        wageType,
        breakHours: form.breakHours ?? (wageType === "per_job" ? 0 : 1),
        otType: form.otType ?? 0,
        travelCost: Number.isFinite(travelCost) ? travelCost : 0,
        foodCost: Number.isFinite(foodCost) ? foodCost : 0,
      },
    });

    onCheckIn({
      workType,
      locationName: locationName.trim() || nextGPS.addressName || "ไม่ได้ระบุสถานที่",
      gps: nextGPS,
      photo,
      rates: {
        ...form,
        dailyRate,
        wageType,
        breakHours: typeof form.breakHours === "number" ? form.breakHours : wageType === "per_job" ? 0 : 1,
        travelCost: Number.isFinite(travelCost) ? travelCost : 0,
        foodCost: Number.isFinite(foodCost) ? foodCost : 0,
        otherIncome: Number.isFinite(otherIncome) ? otherIncome : 0,
        otherDeductions: Number.isFinite(otherDeductions) ? otherDeductions : 0,
      },
      tasks: [],
    });
    setTaskInput("");
    resetPhoto();
  };

  const doCheckOut = async () => {
    if (!active || gpsLoading) return false;

    const checkoutGPS = await fetchGPS();
    if (!checkoutGPS) {
      toast.error("ยังบันทึก Check-out ไม่ได้", {
        description: "ไม่พบพิกัด GPS ณ เวลาจบงาน กรุณาเปิดสิทธิ์ตำแหน่งแล้วลองใหม่",
      });
      return false;
    }

    const rawDailyRate = dailyRateInput.trim();
    const dailyRate = Number(rawDailyRate);
    const wageType: WageType =
      form.wageType || active.wageType || (dailyRate < 100 ? "per_job" : "daily");
    const travelCost = travelCostInput.trim() ? Number(travelCostInput) : 0;
    const foodCost = foodCostInput.trim() ? Number(foodCostInput) : 0;
    const otherIncome = otherIncomeInput.trim() ? Number(otherIncomeInput) : 0;
    const otherDeductions = otherDeductionsInput.trim() ? Number(otherDeductionsInput) : 0;

    const currentRates: RateSettings = {
      dailyRate: Number.isFinite(dailyRate) ? dailyRate : active.dailyRate || 0,
      wageType,
      otType: form.otType ?? active.otType ?? 0,
      breakHours:
        typeof form.breakHours === "number"
          ? form.breakHours
          : (active.breakHours ?? (wageType === "per_job" ? 0 : 1)),
      travelCost: Number.isFinite(travelCost) ? travelCost : 0,
      foodCost: Number.isFinite(foodCost) ? foodCost : 0,
      otherIncome: Number.isFinite(otherIncome) ? otherIncome : 0,
      otherDeductions: Number.isFinite(otherDeductions) ? otherDeductions : 0,
    };

    onCheckOut(checkoutGPS, photo, {
      ...currentRates,
      workType,
      locationName: locationName.trim() || active.locationName || "ไม่ได้ระบุสถานที่",
    });
    setTaskInput("");
    resetPhoto();
    setCheckoutOpen(false);
    return true;
  };

  const currentWageType = form.wageType || (form.dailyRate < 100 ? "per_job" : "daily");

  return (
    <div className="space-y-5">
      {/* Status & Active Shift Banner */}
      <div
        className={`surface-card overflow-hidden p-5 sm:p-6 transition-all duration-300 ${
          active ? "work-active-card border-primary/40 shadow-xl" : "shadow-md"
        }`}
      >
        <div className="flex flex-col gap-4 sm:gap-5">
          <div className="flex items-center gap-4">
            <StatusMotion running={!!active} />

            <div className="min-w-0 flex-1">
              <div className="text-base font-bold sm:text-lg" data-testid="status-title">
                {active ? (
                  <span className="flex items-center gap-2">
                    <span
                      aria-hidden
                      className="flex h-4 items-end gap-[2px]"
                      data-testid="working-animation"
                    >
                      <span className="work-bar block h-3 w-[3px] rounded-full bg-success [animation-delay:0ms]" />
                      <span className="work-bar block h-4 w-[3px] rounded-full bg-success [animation-delay:150ms]" />
                      <span className="work-bar block h-2.5 w-[3px] rounded-full bg-success [animation-delay:300ms]" />
                    </span>
                    <span className="truncate">
                      กำลังทำงาน:{" "}
                      <span className="text-success font-extrabold">{active.workType}</span>
                    </span>
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <span className="sleep-breathe inline-block text-xl text-muted-foreground">
                      😴
                    </span>
                    <span className="font-extrabold">ยังไม่ได้ CHECK-IN 🥱</span>
                  </span>
                )}
              </div>
              <p className="mt-0.5 truncate text-xs text-muted-foreground sm:text-sm">
                {active
                  ? `สถานที่: ${active.locationName} | Check-in เมื่อ ${new Date(active.checkInTime).toLocaleTimeString("th-TH", { hour12: false })}`
                  : "พร้อมเริ่มงาน? เลือกชื่องาน แล้วกด Check-in เริ่มงานได้เลย"}
              </p>
            </div>
          </div>

          {active ? (
            <div className="grid grid-cols-1 gap-3.5 border-t border-border/70 pt-4 md:grid-cols-2">
              {/* Timer Box */}
              <div className="flex flex-col items-center justify-center rounded-xl border border-primary/25 bg-gradient-to-b from-info-soft/80 to-info-soft/40 p-4 text-center shadow-sm sm:p-5">
                <div className="inline-flex items-center justify-center gap-2 text-xs font-bold text-primary sm:text-sm">
                  <span
                    className="work-blink inline-block h-2.5 w-2.5 rounded-full bg-success shadow-[0_0_8px_rgba(34,197,94,0.6)]"
                    aria-hidden
                  />
                  <span>เวลาทำงาน (รวมพัก)</span>
                </div>
                <div
                  className="my-1.5 font-mono text-3xl font-black tracking-wider text-primary tabular-nums drop-shadow-sm sm:text-4xl"
                  data-testid="active-timer"
                >
                  {formatDuration(elapsed)}
                </div>
                <span className="text-[11px] font-medium text-muted-foreground sm:text-xs">
                  นับเวลาอัตโนมัติตั้งแต่เริ่ม Check-in
                </span>
              </div>

              {/* Edit Check-In Time Box */}
              <div className="flex flex-col justify-between rounded-xl border border-border/80 bg-secondary/60 p-4 shadow-sm sm:p-5">
                <div className="flex items-center justify-between gap-1.5 text-xs font-bold text-muted-foreground">
                  <label
                    htmlFor="editCheckInTime"
                    className="flex cursor-pointer items-center gap-1.5"
                  >
                    <Clock className="h-3.5 w-3.5 text-sky-500 dark:text-sky-400" />
                    <span>แก้ไขเวลาเข้างาน</span>
                  </label>
                  <span className="text-[10px] font-normal text-muted-foreground">
                    ปรับเวลาจริง
                  </span>
                </div>
                <div className="my-1.5 w-full">
                  <input
                    id="editCheckInTime"
                    type="datetime-local"
                    data-testid="edit-checkin-time"
                    value={toLocalInput(active.checkInTime)}
                    onChange={(e) => {
                      const iso = fromLocalInput(e.target.value);
                      if (iso) onEditActiveTime(iso);
                    }}
                    className="w-full rounded-lg border border-input bg-card px-3 py-2 text-center text-sm font-semibold text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary sm:text-left"
                  />
                </div>
                <span className="text-[11px] font-medium text-muted-foreground">
                  ปรับเวลาให้ตรงกับเวลาจริง ตัวจับเวลาจะคำนวณใหม่ทันที
                </span>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Main form */}
      <div className="surface-card space-y-6 p-5 sm:p-6 shadow-md">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label htmlFor="workType" className="text-xs font-bold text-muted-foreground">
                ประเภทงาน / ชื่องาน
              </label>
              <button
                onClick={() => setCatOpen(true)}
                className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                <Settings2 className="h-3.5 w-3.5 text-violet-500 dark:text-violet-400" />{" "}
                จัดการประเภทงาน
              </button>
            </div>
            <select
              id="workType"
              value={workType}
              onChange={(e) => handleSelectWorkType(e.target.value)}
              className="w-full rounded-xl border border-input bg-secondary/80 p-2.5 text-sm font-medium focus:border-primary focus:ring-1 focus:ring-primary"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label htmlFor="locationName" className="text-xs font-bold text-muted-foreground">
                สถานที่ทำงาน / ไซต์งาน
              </label>
              <a
                href={
                  gps.lat && gps.lng
                    ? `https://www.google.com/maps/search/?api=1&query=${gps.lat},${gps.lng}`
                    : "https://www.google.com/maps"
                }
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-xs font-medium text-rose-500 dark:text-rose-400 hover:underline"
              >
                <MapPin className="h-3.5 w-3.5 text-rose-500 dark:text-rose-400" /> เปิด Google Maps
              </a>
            </div>
            <input
              id="locationName"
              value={locationName}
              onChange={(e) => {
                const val = e.target.value;
                handleLocationChange(val);
                if (active) onEditActiveDetails?.({ locationName: val });
              }}
              placeholder="พิมพ์สถานที่ หรือ วางลิงก์ Google Maps"
              className="w-full rounded-xl border border-input bg-secondary/80 p-2.5 text-sm font-medium focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <div className="mt-2.5 rounded-xl border border-border/80 bg-secondary/50 p-3.5 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-1.5 text-xs font-bold text-muted-foreground">
                  <LocateFixed className="h-4 w-4 shrink-0 text-emerald-500 dark:text-emerald-400" />{" "}
                  ตำแหน่งปัจจุบัน
                </div>
                <button
                  onClick={() => void fetchGPS()}
                  disabled={gpsLoading}
                  title="ค้นหาตำแหน่งปัจจุบัน"
                  aria-label="ค้นหาตำแหน่งปัจจุบัน"
                  className="flex shrink-0 items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-bold text-accent-foreground shadow-sm transition hover:brightness-105 active:scale-95 disabled:opacity-60"
                >
                  <Crosshair
                    className={`h-4 w-4 text-cyan-600 dark:text-cyan-300 ${gpsLoading ? "animate-spin" : ""}`}
                  />
                  {gpsLoading ? "กำลังค้นหา…" : "ค้นหาตำแหน่ง"}
                </button>
              </div>
              <div
                className="mt-1.5 font-mono text-sm font-bold break-words text-primary"
                data-testid="gps-text"
              >
                {gps.text}
              </div>
              {gps.addressName ? (
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-primary/20 bg-primary/10 p-2 text-xs">
                  <span className="font-medium text-primary truncate max-w-[200px] sm:max-w-none">
                    📍 {gps.addressName}
                  </span>
                  <button
                    type="button"
                    onClick={() => setLocationName(gps.addressName)}
                    className="rounded bg-primary/20 px-2 py-0.5 text-[11px] font-bold text-primary hover:bg-primary/30 transition"
                  >
                    ใส่ในช่องสถานที่ ↑
                  </button>
                </div>
              ) : null}
              {typeof gps.accuracy === "number" ? (
                <p className="mt-1.5 text-[11px] text-muted-foreground">
                  ความแม่นยำประมาณ ±{Math.round(gps.accuracy)} เมตร
                </p>
              ) : null}
            </div>

            {quickLocations.length > 0 ? (
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-medium text-muted-foreground">ใช้บ่อย:</span>
                {quickLocations.map((loc) => (
                  <button
                    key={loc}
                    onClick={() => setLocationName(loc)}
                    className="rounded-md border border-border bg-secondary px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
                  >
                    {loc}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        {/* Jobs done during the running shift */}
        {active ? (
          <div className="space-y-3 rounded-xl border border-border bg-secondary/60 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                งานที่ทำเสร็จในกะที่กำลังทำอยู่
              </h3>
              <span
                className="rounded-full bg-info-soft px-2.5 py-0.5 text-xs font-bold text-primary"
                data-testid="task-count"
              >
                {tasks.length} งาน
              </span>
            </div>
            <div className="flex gap-2">
              <input
                value={taskInput}
                aria-label="เพิ่มรายการงานที่ทำเสร็จ"
                data-testid="task-input"
                onChange={(e) => setTaskInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTask();
                  }
                }}
                placeholder="เช่น ส่งของรอบ 1, ติดตั้งกล้อง 2 ตัว"
                className="flex-1 rounded-lg border border-input bg-card p-2 text-sm"
              />
              <button
                onClick={addTask}
                data-testid="task-add"
                className="flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground"
              >
                <ListPlus className="h-4 w-4" /> เพิ่ม
              </button>
            </div>
            {tasks.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                ยังไม่มีรายการงาน — เพิ่มงานที่ทำเสร็จระหว่างกะนี้ได้เลย
              </p>
            ) : (
              <ol className="space-y-1.5" data-testid="task-list">
                {tasks.map((t, i) => (
                  <li
                    key={`${t}-${i}`}
                    className="flex items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm"
                  >
                    <span className="min-w-0 truncate">
                      <span className="mr-2 text-xs font-bold text-muted-foreground">{i + 1}.</span>
                      {t}
                    </span>
                    <button
                      onClick={() => setTasks(tasks.filter((_, idx) => idx !== i))}
                      aria-label={`ลบงาน ${t}`}
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ol>
            )}
          </div>
        ) : null}

        {/* Rates & Calculation Mode */}
        <div
          className={`space-y-4 rounded-xl border bg-secondary/60 p-4 ${
            active ? "border-primary/50 ring-2 ring-primary/10" : "border-border"
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
              {active ? "ตั้งค่าค่าแรงก่อน Check-out" : "การคำนวณค่าแรง & OT & เบี้ยเลี้ยง"}
            </h3>
            <span className="rounded-md border border-primary/20 bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
              {currentWageType === "per_job"
                ? "📌 คิดเหมาจ่ายต่องาน"
                : currentWageType === "hourly"
                  ? "⏱️ คิดตามชั่วโมงทำงาน"
                  : "📅 คิดรายวันปกติ (8 ชม.)"}
            </span>
          </div>

          {/* Wage Mode Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground flex items-center justify-between">
              <span>รูปแบบการคำนวณค่าแรง</span>
              <span className="text-[11px] font-medium text-muted-foreground">
                {WAGE_TYPE_OPTIONS.find((o) => o.value === currentWageType)?.hint}
              </span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {WAGE_TYPE_OPTIONS.map((opt) => {
                const isSelected = currentWageType === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      const nextBreak = opt.value === "per_job" ? 0 : (form.breakHours ?? 1);
                      setForm((f) => ({
                        ...f,
                        wageType: opt.value,
                        breakHours: nextBreak,
                      }));
                      if (active) {
                        onEditActiveDetails?.({
                          wageType: opt.value,
                          breakHours: nextBreak,
                        });
                      }
                    }}
                    className={`flex flex-col items-center justify-center rounded-xl p-2.5 text-xs font-bold transition-all border cursor-pointer ${
                      isSelected
                        ? "border-primary bg-primary/15 text-primary shadow-sm ring-2 ring-primary/30"
                        : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                  >
                    <span>{opt.shortLabel}</span>
                    <span className="text-[10px] font-normal opacity-80">{opt.unit}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <Field
              label={
                currentWageType === "per_job"
                  ? "ค่าแรงต่องาน (บาท/งาน)"
                  : currentWageType === "hourly"
                    ? "ค่าแรงต่อชั่วโมง (บาท/ชม.)"
                    : "ค่าแรงปกติ (บาท/วัน)"
              }
              id="dailyRate"
            >
              <div className="relative">
                <input
                  id="dailyRate"
                  type="number"
                  min="0"
                  placeholder={
                    currentWageType === "per_job"
                      ? "เช่น 40"
                      : currentWageType === "hourly"
                        ? "เช่น 40"
                        : "เช่น 500"
                  }
                  value={dailyRateInput}
                  onChange={(e) => {
                    const raw = e.target.value;
                    setDailyRateInput(raw);
                    if (raw === "") {
                      setForm((f) => ({ ...f, dailyRate: 0 }));
                      if (active) onEditActiveDetails?.({ dailyRate: 0 });
                      return;
                    }

                    const dailyRate = Number(raw);
                    if (Number.isFinite(dailyRate)) {
                      setForm((f) => ({ ...f, dailyRate }));
                      if (active) onEditActiveDetails?.({ dailyRate });
                    }
                  }}
                  className={`${inputCls} pr-14`}
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                  {currentWageType === "per_job"
                    ? "฿/งาน"
                    : currentWageType === "hourly"
                      ? "฿/ชม."
                      : "฿/วัน"}
                </span>
              </div>
            </Field>

            <Field label="ประเภท OT (ตัวคูณ)" id="otType">
              <select
                id="otType"
                data-testid="checkout-ot-type"
                aria-label="เลือกประเภท OT ก่อน Check-out"
                value={form.otType}
                onChange={(e) => {
                  const nextOt = Number(e.target.value);
                  setForm((f) => ({ ...f, otType: nextOt }));
                  if (active) onEditActiveDetails?.({ otType: nextOt });
                }}
                className={inputCls}
              >
                {OT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="การหักพักกลางวัน" id="breakHours">
              <select
                id="breakHours"
                data-testid="checkout-break-hours"
                aria-label="เลือกเวลาพักที่ต้องการหักก่อน Check-out"
                value={form.breakHours ?? (currentWageType === "per_job" ? 0 : 1)}
                onChange={(e) => {
                  const nextBreak = Number(e.target.value);
                  setForm((f) => ({ ...f, breakHours: nextBreak }));
                  if (active) onEditActiveDetails?.({ breakHours: nextBreak });
                }}
                className={inputCls}
              >
                {BREAK_OPTIONS.map((b) => (
                  <option key={b.value} value={b.value}>
                    {b.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3 border-t border-border pt-3 md:grid-cols-4">
            <Field label="ค่าเดินทาง (บาท)" id="travelCost">
              <input
                id="travelCost"
                type="number"
                min="0"
                step="any"
                placeholder="0"
                value={travelCostInput}
                onChange={(e) => {
                  const val = e.target.value;
                  setTravelCostInput(val);
                  const n = Number(val);
                  const cost = Number.isFinite(n) && val !== "" ? n : 0;
                  setForm((f) => ({ ...f, travelCost: cost }));
                  if (active) onEditActiveDetails?.({ travelCost: cost });
                }}
                className={inputCls}
              />
            </Field>
            <Field label="ค่าอาหาร/เบี้ยเลี้ยง (บาท)" id="foodCost">
              <input
                id="foodCost"
                type="number"
                min="0"
                step="any"
                placeholder="0"
                value={foodCostInput}
                onChange={(e) => {
                  const val = e.target.value;
                  setFoodCostInput(val);
                  const n = Number(val);
                  const cost = Number.isFinite(n) && val !== "" ? n : 0;
                  setForm((f) => ({ ...f, foodCost: cost }));
                  if (active) onEditActiveDetails?.({ foodCost: cost });
                }}
                className={inputCls}
              />
            </Field>
            <Field label="รายรับอื่นๆ (บาท)" id="otherIncome">
              <input
                id="otherIncome"
                type="number"
                min="0"
                step="any"
                placeholder="0"
                value={otherIncomeInput}
                onChange={(e) => {
                  const val = e.target.value;
                  setOtherIncomeInput(val);
                  const n = Number(val);
                  const inc = Number.isFinite(n) && val !== "" ? n : 0;
                  setForm((f) => ({
                    ...f,
                    otherIncome: inc,
                  }));
                  if (active) onEditActiveDetails?.({ otherIncome: inc });
                }}
                className={`${inputCls} text-success`}
              />
            </Field>
            <Field label="รายการหักอื่นๆ (บาท)" id="otherDeductions">
              <input
                id="otherDeductions"
                type="number"
                min="0"
                step="any"
                placeholder="0"
                value={otherDeductionsInput}
                onChange={(e) => {
                  const val = e.target.value;
                  setOtherDeductionsInput(val);
                  const n = Number(val);
                  const ded = Number.isFinite(n) && val !== "" ? n : 0;
                  setForm((f) => ({
                    ...f,
                    otherDeductions: ded,
                  }));
                  if (active) onEditActiveDetails?.({ otherDeductions: ded });
                }}
                className={`${inputCls} text-destructive`}
              />
            </Field>
          </div>

          {/* Live Calculation Preview Banner */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-medium">
              <span className="text-primary font-bold">
                {currentWageType === "per_job"
                  ? "📌 เหมาต่องาน:"
                  : currentWageType === "hourly"
                    ? "⏱️ รายชั่วโมง:"
                    : "📅 รายวัน:"}
              </span>
              <span>
                {currentWageType === "per_job"
                  ? `จ่ายเต็ม ฿${Number(dailyRateInput) || form.dailyRate || 0} ต่องาน`
                  : currentWageType === "hourly"
                    ? `฿${Number(dailyRateInput) || form.dailyRate || 0}/ชม.`
                    : `฿${Number(dailyRateInput) || form.dailyRate || 0}/วัน (เฉลี่ย ฿${Math.round(((Number(dailyRateInput) || form.dailyRate || 0) / 8) * 10) / 10}/ชม.)`}
              </span>
            </div>
            <div className="font-bold text-success">
              {currentWageType === "per_job"
                ? `ค่าแรงรวมสุทธิ ฿${(Number(dailyRateInput) || form.dailyRate || 0) + (Number(travelCostInput) || 0) + (Number(foodCostInput) || 0) + (Number(otherIncomeInput) || 0) - (Number(otherDeductionsInput) || 0)}`
                : active
                  ? `ประมาณการตอนนี้: ฿${calculatePayroll(active.checkInTime, new Date().toISOString(), { dailyRate: Number(dailyRateInput) || form.dailyRate || 0, wageType: currentWageType, otType: form.otType, breakHours: form.breakHours, travelCost: Number(travelCostInput) || 0, foodCost: Number(foodCostInput) || 0, otherIncome: Number(otherIncomeInput) || 0, otherDeductions: Number(otherDeductionsInput) || 0 }).netIncome}`
                  : `คำนวณตามเวลาทำงานจริง`}
            </div>
          </div>
        </div>

        {/* Evidence */}
        <div className="grid grid-cols-1 gap-4">
          <div className="rounded-xl border-2 border-dashed border-border p-4 text-center">
            <input
              ref={fileRef}
              id="imageInput"
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={onPhoto}
            />
            {photo ? (
              <div className="flex flex-col items-center">
                <img src={photo} alt="รูปหลักฐาน" className="mb-2 h-32 rounded-lg object-cover" />
                <button
                  onClick={resetPhoto}
                  className="flex items-center gap-1 text-xs text-destructive"
                >
                  <X className="h-3.5 w-3.5" /> ลบรูป
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                className="flex w-full flex-col items-center gap-2 py-4 text-muted-foreground"
              >
                <Camera className="h-7 w-7 text-violet-500 dark:text-violet-400" />
                <span className="text-xs font-medium">ถ่ายรูป / แนบรูปหลักฐาน (ไม่บังคับ)</span>
              </button>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
          <button
            onClick={() => void doCheckIn()}
            disabled={!!active || gpsLoading}
            className="flex items-center justify-center gap-2.5 rounded-full bg-gradient-to-b from-[#A4EADB] to-[#70D8BD] py-4 text-base sm:text-lg font-bold text-[#0F382D] shadow-[0_8px_20px_-2px_rgba(70,195,160,0.45),inset_0_3px_4px_rgba(255,255,255,0.85),inset_0_-3px_6px_rgba(25,120,90,0.22)] transition-all hover:brightness-105 active:scale-[0.98] active:translate-y-0.5 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none dark:disabled:bg-slate-800 dark:disabled:text-slate-600"
          >
            <LogIn className="h-5 w-5" /> {gpsLoading ? "กำลังค้นหาพิกัด…" : "Check-in เริ่มงาน"}
          </button>
          <button
            onClick={() => {
              if (!active || gpsLoading) return;
              setCheckoutOpen(true);
            }}
            disabled={!active || gpsLoading}
            data-testid="checkout-button"
            className="flex items-center justify-center gap-2.5 rounded-full bg-gradient-to-b from-[#FFAE9B] to-[#FF856A] py-4 text-base sm:text-lg font-bold text-white shadow-[0_8px_20px_-2px_rgba(255,105,75,0.45),inset_0_3px_4px_rgba(255,255,255,0.8),inset_0_-3px_6px_rgba(160,45,15,0.22)] transition-all hover:brightness-105 active:scale-[0.98] active:translate-y-0.5 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none dark:disabled:bg-slate-800 dark:disabled:text-slate-600"
          >
            <LogOut className="h-5 w-5" /> {gpsLoading ? "กำลังบันทึกพิกัด…" : "Check-out จบงาน"}
          </button>
        </div>
        {active ? (
          <button
            onClick={onCancelActive}
            className="w-full text-center text-xs font-medium text-muted-foreground transition hover:text-destructive hover:underline"
          >
            ยกเลิกการ Check-in นี้ (ไม่บันทึก)
          </button>
        ) : null}
      </div>

      <CategoryDialog
        open={catOpen}
        categories={categories}
        onSave={onSaveCategories}
        onClose={() => setCatOpen(false)}
      />

      {checkoutOpen && active ? (
        <CheckoutConfirmSheet
          elapsed={elapsed}
          wageType={currentWageType}
          dailyRate={Number(dailyRateInput) || form.dailyRate || 0}
          otType={form.otType ?? 0}
          breakHours={
            typeof form.breakHours === "number"
              ? form.breakHours
              : currentWageType === "per_job"
                ? 0
                : 1
          }
          preview={calculatePayroll(active.checkInTime, new Date().toISOString(), {
            dailyRate: Number(dailyRateInput) || active.dailyRate || 0,
            wageType: currentWageType,
            otType: form.otType ?? 0,
            breakHours:
              typeof form.breakHours === "number"
                ? form.breakHours
                : currentWageType === "per_job"
                  ? 0
                  : 1,
            travelCost: travelCostInput.trim() ? Number(travelCostInput) || 0 : 0,
            foodCost: foodCostInput.trim() ? Number(foodCostInput) || 0 : 0,
            otherIncome: otherIncomeInput.trim() ? Number(otherIncomeInput) || 0 : 0,
            otherDeductions: otherDeductionsInput.trim() ? Number(otherDeductionsInput) || 0 : 0,
          })}
          confirming={gpsLoading}
          onChangeWageType={(nextWageType) => {
            const nextBreak = nextWageType === "per_job" ? 0 : (form.breakHours ?? 1);
            setForm((f) => ({ ...f, wageType: nextWageType, breakHours: nextBreak }));
            onEditActiveDetails?.({ wageType: nextWageType, breakHours: nextBreak });
          }}
          onChangeOt={(nextOt) => {
            setForm((f) => ({ ...f, otType: nextOt }));
            onEditActiveDetails?.({ otType: nextOt });
          }}
          onChangeBreak={(nextBreak) => {
            setForm((f) => ({ ...f, breakHours: nextBreak }));
            onEditActiveDetails?.({ breakHours: nextBreak });
          }}
          onCancel={() => setCheckoutOpen(false)}
          onConfirm={() => void doCheckOut()}
        />
      ) : null}
    </div>
  );
}

/**
 * Visual "engine running" vs "resting" indicator next to the shift status.
 * Running: spinning gear + pumping piston. Idle: breathing sleeper with Z's.
 */
function StatusMotion({ running }: { running: boolean }) {
  return (
    <div
      aria-hidden
      data-testid={running ? "engine-animation" : "resting-animation"}
      className={`relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-md ${
        running
          ? "work-pulse-ring bg-success-soft text-success border border-success/30"
          : "rest-halo bg-secondary text-muted-foreground border border-border"
      }`}
    >
      {running ? (
        <EngineWorkingAnimation
          size="md"
          label="กำลังทำงาน"
          decorative
          className="engine-working--status"
        />
      ) : (
        <>
          <BedDouble className="sleep-breathe h-7 w-7 text-amber-500/80 dark:text-amber-400/80" />
          <span className="sleep-z absolute -top-1 right-0 text-xs font-black [animation-delay:0ms]">
            z
          </span>
          <span className="sleep-z absolute -top-1 right-1 text-[11px] font-black [animation-delay:900ms]">
            z
          </span>
          <span className="sleep-z absolute -top-1 right-2 text-[9px] font-black [animation-delay:1800ms]">
            z
          </span>
        </>
      )}
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm font-semibold transition focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-60";

function Field({ label, id, children }: { label: string; id?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}

function CheckoutConfirmSheet({
  elapsed,
  wageType,
  dailyRate,
  otType,
  breakHours,
  preview,
  confirming,
  onChangeWageType,
  onChangeOt,
  onChangeBreak,
  onCancel,
  onConfirm,
}: {
  elapsed: number;
  wageType: WageType;
  dailyRate: number;
  otType: number;
  breakHours: number;
  preview: ReturnType<typeof calculatePayroll>;
  confirming: boolean;
  onChangeWageType: (value: WageType) => void;
  onChangeOt: (value: number) => void;
  onChangeBreak: (value: number) => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-0 md:items-center md:p-4">
      <div
        className="surface-card w-full max-w-md rounded-t-3xl p-5 pb-8 shadow-2xl md:rounded-2xl"
        role="dialog"
        aria-labelledby="checkout-confirm-title"
        data-testid="checkout-confirm"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 id="checkout-confirm-title" className="text-lg font-bold">
              ก่อน Check-out
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              ตรวจสอบรูปแบบค่าแรง และเวลาพัก แล้วกดยืนยันบันทึกจบงาน
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={confirming}
            aria-label="ปิด"
            className="rounded-md p-1 hover:bg-muted disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-4 rounded-xl border border-border bg-info-soft px-4 py-3 text-center">
          <p className="flex items-center justify-center gap-1.5 text-xs font-medium text-primary">
            <Clock className="h-3.5 w-3.5 text-sky-500 dark:text-sky-400" />
            เวลาทำงาน (รวมพัก)
          </p>
          <p className="text-xl font-bold tabular-nums text-primary">{formatDuration(elapsed)}</p>
        </div>

        <div className="space-y-3">
          {/* Wage Type Toggle */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">
              รูปแบบค่าแรง (เรท: ฿{dailyRate})
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {WAGE_TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  disabled={confirming}
                  onClick={() => onChangeWageType(opt.value)}
                  className={`rounded-lg py-1.5 px-2 text-xs font-bold transition border ${
                    wageType === opt.value
                      ? "border-primary bg-primary/20 text-primary"
                      : "border-border bg-card text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {opt.shortLabel}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Field label="ประเภท OT (ตัวคูณ)" id="confirmOtType">
              <select
                id="confirmOtType"
                data-testid="confirm-ot-type"
                aria-label="เลือกประเภท OT ก่อน Check-out"
                value={otType}
                disabled={confirming || wageType === "per_job"}
                onChange={(e) => onChangeOt(Number(e.target.value))}
                className={inputCls}
              >
                {OT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="การหักพักกลางวัน" id="confirmBreakHours">
              <select
                id="confirmBreakHours"
                data-testid="confirm-break-hours"
                aria-label="เลือกเวลาพักที่ต้องการหักก่อน Check-out"
                value={breakHours}
                disabled={confirming}
                onChange={(e) => onChangeBreak(Number(e.target.value))}
                className={inputCls}
              >
                {BREAK_OPTIONS.map((b) => (
                  <option key={b.value} value={b.value}>
                    {b.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl border border-border bg-secondary/60 p-3 text-center">
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground">ชั่วโมงทำงาน</p>
            <p className="text-sm font-bold tabular-nums">{preview.workingHours.toFixed(2)} ชม.</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground">
              {wageType === "per_job" ? "ค่าแรงต่องาน" : "ค่าแรง+OT"}
            </p>
            <p className="text-sm font-bold tabular-nums text-foreground">
              ฿{(preview.baseWage + preview.otIncome).toLocaleString("th-TH")}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground">รายได้สุทธิ</p>
            <p className="text-base font-extrabold tabular-nums text-success">
              ฿{preview.netIncome.toLocaleString("th-TH")}
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={confirming}
            className="rounded-xl border border-border bg-secondary py-3 text-sm font-bold disabled:opacity-50 cursor-pointer"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={confirming}
            data-testid="confirm-checkout"
            className="rounded-xl bg-destructive py-3 text-sm font-extrabold text-destructive-foreground disabled:opacity-60 cursor-pointer hover:brightness-105 transition"
          >
            {confirming ? "กำลังบันทึกพิกัด…" : "ยืนยัน Check-out"}
          </button>
        </div>
      </div>
    </div>
  );
}
