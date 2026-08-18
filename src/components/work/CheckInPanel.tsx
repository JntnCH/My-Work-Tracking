import { useCallback, useEffect, useRef, useState } from "react";
import {
  BedDouble,
  Camera,
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
import type { GPSPoint, RateSettings, WorkLog, ActiveCheckIn } from "@/lib/work-log";
import {
  OT_OPTIONS,
  formatDuration,
  fromLocalInput,
  parseMapsUrl,
  toLocalInput,
} from "@/lib/work-log";
import { CategoryDialog } from "./CategoryDialog";

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
  onCheckOut: (gps: GPSPoint, photo: string | null) => void;
  onCancelActive: () => void;
  onEditActiveTime: (iso: string) => void;
  onEditActiveTasks: (tasks: string[]) => void;
};

const EMPTY_GPS: GPSPoint = { lat: null, lng: null, text: "ยังไม่ได้ดึงพิกัด", addressName: "" };

async function reverseGeocode(lat: number, lng: number) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=th`,
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
}: Props) {
  const [workType, setWorkType] = useState(categories[0] ?? "");
  const [locationName, setLocationName] = useState("");
  const [gps, setGps] = useState<GPSPoint>(EMPTY_GPS);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [form, setForm] = useState<RateSettings>(rates);
  const [elapsed, setElapsed] = useState(0);
  const [catOpen, setCatOpen] = useState(false);
  const [taskInput, setTaskInput] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => setForm(rates), [rates]);
  useEffect(() => {
    if (!categories.includes(workType)) setWorkType(categories[0] ?? "");
  }, [categories, workType]);

  useEffect(() => {
    if (!active) return;
    const tick = () => setElapsed(Date.now() - new Date(active.checkInTime).getTime());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [active]);

  const fetchGPS = useCallback((): Promise<GPSPoint | null> => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGps({ ...EMPTY_GPS, text: "อุปกรณ์ไม่รองรับ GPS" });
      return Promise.resolve(null);
    }
    if (typeof window !== "undefined" && !window.isSecureContext) {
      setGps({ ...EMPTY_GPS, text: "ต้องเปิดผ่าน https จึงจะขอพิกัดได้" });
      return Promise.resolve(null);
    }

    setGpsLoading(true);
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude.toFixed(6);
          const lng = pos.coords.longitude.toFixed(6);
          const addressName = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
          const nextGPS = { lat, lng, text: `Lat: ${lat}, Lng: ${lng}`, addressName };
          setGps(nextGPS);
          setGpsLoading(false);
          resolve(nextGPS);
        },
        (err) => {
          const embedded = typeof window !== "undefined" && window.self !== window.top;
          let text = "ไม่สามารถเข้าถึงพิกัดได้";
          if (err.code === err.PERMISSION_DENIED) {
            text = embedded
              ? "ถูกบล็อกในหน้าตัวอย่าง — เปิดเว็บในแท็บใหม่ของ Safari แล้วลองอีกครั้ง"
              : "ปฏิเสธสิทธิ์ — เปิด ตั้งค่า > Safari > ตำแหน่งที่ตั้ง เป็น “ถาม” แล้วโหลดหน้าใหม่";
          } else if (err.code === err.POSITION_UNAVAILABLE) {
            text = "หาสัญญาณตำแหน่งไม่ได้ — เปิด Location Services แล้วลองใหม่";
          } else if (err.code === err.TIMEOUT) {
            text = "หมดเวลาในการขอพิกัด — แตะไอคอนเป้าเพื่อลองอีกครั้ง";
          }
          setGps({ ...EMPTY_GPS, text });
          setGpsLoading(false);
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 30000 },
      );
    });
  }, []);

  // iOS Safari blocks silent location prompts; only auto-fetch when already granted.
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const status = await navigator.permissions?.query({
          name: "geolocation" as PermissionName,
        });
        if (!cancelled && status?.state === "granted") void fetchGPS();
        else if (!cancelled) setGps({ ...EMPTY_GPS, text: "แตะไอคอนเป้าเพื่อขอตำแหน่งปัจจุบัน" });
      } catch {
        if (!cancelled) setGps({ ...EMPTY_GPS, text: "แตะไอคอนเป้าเพื่อขอตำแหน่งปัจจุบัน" });
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

  const num = (v: string) => (v === "" ? 0 : Number(v));

  // Tasks belong to the shift in progress only.
  const tasks = active?.tasks ?? [];
  const setTasks = (next: string[]) => onEditActiveTasks(next);

  const addTask = () => {
    const value = taskInput.trim();
    if (!value || !active) return;
    setTasks([...tasks, value]);
    setTaskInput("");
  };

  const doCheckIn = () => {
    onCheckIn({
      workType,
      locationName: locationName.trim() || gps.addressName || "ไม่ได้ระบุสถานที่",
      gps,
      photo,
      rates: form,
      tasks: [],
    });
    setTaskInput("");
    resetPhoto();
  };

  const doCheckOut = async () => {
    if (!active || gpsLoading) return;

    // Always read a fresh position at the moment of Check-out; do not reuse Check-in GPS.
    const checkoutGPS = await fetchGPS();
    if (!checkoutGPS) {
      toast.error("ยังบันทึก Check-out ไม่ได้", {
        description: "ไม่พบพิกัด GPS ณ เวลาจบงาน กรุณาเปิดสิทธิ์ตำแหน่งแล้วลองใหม่",
      });
      return;
    }

    onCheckOut(checkoutGPS, photo);
    setTaskInput("");
    resetPhoto();
  };

  return (
    <div className="space-y-5">
      {/* Status banner */}
      <div
        className={`surface-card flex flex-col items-center justify-between gap-4 p-5 md:flex-row ${
          active ? "work-active-card" : ""
        }`}
      >
        <div className="flex w-full items-center gap-4">
          <StatusMotion running={!!active} />

          <div className="min-w-0">
            <div className="text-base font-bold md:text-lg" data-testid="status-title">
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
                  <span>
                    กำลังทำงาน: <span className="text-success">{active.workType}</span>
                  </span>
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <span className="sleep-breathe inline-block text-muted-foreground">😴</span>
                  <span>ยังไม่ได้ CHECK-IN 🥱</span>
                </span>
              )}
            </div>
            <p className="truncate text-xs text-muted-foreground md:text-sm">
              {active
                ? `สถานที่: ${active.locationName} | Check-in เมื่อ ${new Date(active.checkInTime).toLocaleTimeString("th-TH", { hour12: false })}`
                : "พร้อมเริ่มงาน? กดปุ่ม ค้นหาตำแหน่ง เพื่อบันทึกพิกัดและเวลา แล้วกด Check-in"}
            </p>
          </div>
        </div>
        {active ? (
          <div className="w-full rounded-xl border border-border bg-info-soft px-4 py-2 text-center md:w-auto">
            <span className="flex items-center justify-center gap-2 text-xs font-medium text-primary">
              <span className="work-blink h-2 w-2 rounded-full bg-success" aria-hidden />
              เวลาทำงาน (รวมพัก)
            </span>
            <span
              className="text-xl font-bold text-primary tabular-nums"
              data-testid="active-timer"
            >
              {formatDuration(elapsed)}
            </span>
          </div>
        ) : null}
      </div>

      {active ? (
        <div className="surface-card flex flex-wrap items-end gap-3 p-4">
          <div className="min-w-[220px] flex-1">
            <label
              htmlFor="editCheckInTime"
              className="mb-1 block text-xs font-semibold text-muted-foreground"
            >
              แก้ไขเวลาเข้างาน
            </label>
            <input
              id="editCheckInTime"
              type="datetime-local"
              data-testid="edit-checkin-time"
              value={toLocalInput(active.checkInTime)}
              onChange={(e) => {
                const iso = fromLocalInput(e.target.value);
                if (iso) onEditActiveTime(iso);
              }}
              className="w-full rounded-lg border border-input bg-secondary p-2.5 text-sm"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            ปรับเวลาให้ตรงกับเวลาเริ่มงานจริงได้ ตัวจับเวลาจะคำนวณใหม่ทันที
          </p>
        </div>
      ) : null}

      {/* Main form */}
      <div className="surface-card space-y-6 p-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label htmlFor="workType" className="text-xs font-semibold text-muted-foreground">
                ประเภทงาน / ชื่องาน
              </label>
              <button
                onClick={() => setCatOpen(true)}
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <Settings2 className="h-3.5 w-3.5" /> จัดการประเภทงาน
              </button>
            </div>
            <select
              id="workType"
              value={workType}
              disabled={!!active}
              onChange={(e) => setWorkType(e.target.value)}
              className="w-full rounded-lg border border-input bg-secondary p-2.5 text-sm disabled:opacity-60"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label htmlFor="locationName" className="text-xs font-semibold text-muted-foreground">
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
                className="flex items-center gap-1 text-xs font-medium text-success hover:underline"
              >
                <MapPin className="h-3.5 w-3.5" /> เปิด Google Maps
              </a>
            </div>
            <input
              id="locationName"
              value={locationName}
              disabled={!!active}
              onChange={(e) => handleLocationChange(e.target.value)}
              placeholder="พิมพ์สถานที่ หรือ วางลิงก์ Google Maps"
              className="w-full rounded-lg border border-input bg-secondary p-2.5 text-sm disabled:opacity-60"
            />
            <div className="mt-2 rounded-xl border border-border bg-secondary/60 p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                  <LocateFixed className="h-4 w-4 shrink-0 text-primary" /> ตำแหน่งปัจจุบัน
                </div>
                <button
                  onClick={() => void fetchGPS()}
                  disabled={gpsLoading}
                  title="ค้นหาตำแหน่งปัจจุบัน"
                  aria-label="ค้นหาตำแหน่งปัจจุบัน"
                  className="flex shrink-0 items-center gap-1.5 rounded-lg bg-accent px-2.5 py-1.5 text-xs font-medium text-primary transition active:scale-95 disabled:opacity-60"
                >
                  <Crosshair className={`h-4 w-4 ${gpsLoading ? "animate-spin" : ""}`} />
                  {gpsLoading ? "กำลังค้นหา…" : "ค้นหาตำแหน่ง"}
                </button>
              </div>
              <div
                className="mt-1.5 font-mono text-sm font-semibold break-words text-primary"
                data-testid="gps-text"
              >
                {gps.text}
              </div>
              {gps.addressName ? (
                <p className="mt-1 text-xs text-muted-foreground">{gps.addressName}</p>
              ) : null}
            </div>

            {quickLocations.length > 0 ? (
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-medium text-muted-foreground">ใช้บ่อย:</span>
                {quickLocations.map((loc) => (
                  <button
                    key={loc}
                    onClick={() => setLocationName(loc)}
                    className="rounded border border-border bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground hover:bg-accent hover:text-primary"
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
                placeholder="เช่น ติดตั้งกล้อง 2 ตัว ชั้น 3"
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

        {/* Rates */}
        <div className="space-y-4 rounded-xl border border-border bg-secondary/60 p-4">
          <h3 className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
            การคำนวณค่าแรง &amp; OT &amp; รายรับ-รายหัก
          </h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <Field label="ค่าแรงปกติ (บาท/วัน)" id="dailyRate">
              <input
                id="dailyRate"
                type="number"
                value={form.dailyRate}
                disabled={!!active}
                onChange={(e) => setForm({ ...form, dailyRate: num(e.target.value) })}
                className={inputCls}
              />
            </Field>
            <Field label="ประเภท OT (ตัวคูณ)" id="otType">
              <select
                id="otType"
                value={form.otType}
                disabled={!!active}
                onChange={(e) => setForm({ ...form, otType: Number(e.target.value) })}
                className={inputCls}
              >
                {OT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="การหักพักกลางวัน" id="breakInfo">
              <div className="flex h-[38px] items-center rounded-lg border border-border bg-info-soft px-2 text-xs font-medium text-primary">
                หักเวลาพัก 1 ชม. อัตโนมัติ
              </div>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3 border-t border-border pt-3 md:grid-cols-4">
            <Field label="ค่าเดินทาง (บาท)" id="travelCost">
              <input
                id="travelCost"
                type="number"
                value={form.travelCost}
                disabled={!!active}
                onChange={(e) => setForm({ ...form, travelCost: num(e.target.value) })}
                className={inputCls}
              />
            </Field>
            <Field label="ค่าอาหาร/เบี้ยเลี้ยง (บาท)" id="foodCost">
              <input
                id="foodCost"
                type="number"
                value={form.foodCost}
                disabled={!!active}
                onChange={(e) => setForm({ ...form, foodCost: num(e.target.value) })}
                className={inputCls}
              />
            </Field>
            <Field label="รายรับอื่นๆ (บาท)" id="otherIncome">
              <input
                id="otherIncome"
                type="number"
                value={form.otherIncome}
                disabled={!!active}
                onChange={(e) => setForm({ ...form, otherIncome: num(e.target.value) })}
                className={`${inputCls} text-success`}
              />
            </Field>
            <Field label="รายการหักอื่นๆ (บาท)" id="otherDeductions">
              <input
                id="otherDeductions"
                type="number"
                value={form.otherDeductions}
                disabled={!!active}
                onChange={(e) => setForm({ ...form, otherDeductions: num(e.target.value) })}
                className={`${inputCls} text-destructive`}
              />
            </Field>
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
                <Camera className="h-7 w-7" />
                <span className="text-xs font-medium">ถ่ายรูป / แนบรูปหลักฐาน (ไม่บังคับ)</span>
              </button>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <button
            onClick={doCheckIn}
            disabled={!!active}
            className="flex items-center justify-center gap-2 rounded-xl bg-success py-4 text-lg font-bold text-success-foreground shadow-lg transition active:scale-95 disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none"
          >
            <LogIn className="h-5 w-5" /> Check-in เริ่มงาน
          </button>
          <button
            onClick={() => void doCheckOut()}
            disabled={!active || gpsLoading}
            className="flex items-center justify-center gap-2 rounded-xl bg-destructive py-4 text-lg font-bold text-destructive-foreground shadow-lg transition active:scale-95 disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none"
          >
            <LogOut className="h-5 w-5" /> {gpsLoading ? "กำลังบันทึกพิกัด…" : "Check-out จบงาน"}
          </button>
        </div>
        {active ? (
          <button
            onClick={onCancelActive}
            className="w-full text-xs text-muted-foreground hover:text-destructive hover:underline"
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
      className={`relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${
        running
          ? "work-pulse-ring bg-success-soft text-success"
          : "rest-halo bg-destructive-soft text-destructive"
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
          <BedDouble className="sleep-breathe h-7 w-7" />
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
  "w-full rounded-lg border border-input bg-card p-2 text-sm font-medium disabled:opacity-60";

function Field({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}
