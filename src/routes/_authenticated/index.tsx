import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ClipboardList, LayoutDashboard, MapPinned, Settings2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { AppHeader } from "@/components/work/AppHeader";
import { CheckInPanel } from "@/components/work/CheckInPanel";
import { DashboardPanel } from "@/components/work/DashboardPanel";
import { HistoryPanel } from "@/components/work/HistoryPanel";
import { SettingsPanel } from "@/components/work/SettingsPanel";
import { FaceLockScreen, useFaceLock } from "@/components/work/FaceLock";
import { useWorkTracker } from "@/hooks/use-work-tracker";
import { useDashboardLayout } from "@/hooks/use-dashboard-layout";
import type { DashboardViewport } from "@/lib/dashboard-layout";
import { clearGuestUser, displayName, useSession } from "@/hooks/use-session";
import { signOutFirebase } from "@/integrations/firebase/auth";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "Work Tracker — บันทึกงาน Check-in/Check-out & Google Sheets" },
      {
        name: "description",
        content:
          "บันทึกเวลาเข้า-ออกงาน พิกัด GPS ค่าแรง OT เบี้ยเลี้ยง พร้อมสรุปรายเดือนและบันทึกลง Google Sheets ของแต่ละผู้ใช้",
      },
      { property: "og:title", content: "Work Tracker — ระบบบันทึกงาน & Check-in" },
      {
        property: "og:description",
        content: "Check-in/Check-out พร้อม GPS คำนวณค่าแรง OT และซิงก์ลง Google Sheets",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const TABS = [
  { id: "checkin", label: "Check-in / Out", icon: MapPinned },
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "history", label: "ประวัติการทำงาน", icon: ClipboardList },
  { id: "settings", label: "ตั้งค่าระบบ", icon: Settings2 },
] as const;

type TabId = (typeof TABS)[number]["id"];

function Index() {
  const { user, loading, isGuest } = useSession();
  const userId = user?.id ?? null;
  const tracker = useWorkTracker(userId, isGuest);
  const mobileLayout = useDashboardLayout(userId, isGuest, "mobile");
  const desktopLayout = useDashboardLayout(userId, isGuest, "desktop");
  const [dashboardViewport, setDashboardViewport] = useState<DashboardViewport>(() =>
    getViewport(),
  );
  const lock = useFaceLock(userId);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<TabId>("checkin");
  const [month, setMonth] = useState(() =>
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Bangkok",
      year: "numeric",
      month: "2-digit",
    }).format(new Date()),
  );
  const pulledRef = useRef(false);
  const settingsDirtyRef = useRef(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 639px)");
    const updateViewport = () => setDashboardViewport(mediaQuery.matches ? "mobile" : "desktop");
    updateViewport();
    mediaQuery.addEventListener("change", updateViewport);
    return () => mediaQuery.removeEventListener("change", updateViewport);
  }, []);

  const requestTabChange = (nextTab: TabId) => {
    if (nextTab === tab) return;
    if (tab === "settings" && settingsDirtyRef.current) {
      const confirmed = window.confirm(
        "หน้านี้มีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก ต้องการออกจาก Settings หรือไม่?",
      );
      if (!confirmed) return;
      settingsDirtyRef.current = false;
    }
    setTab(nextTab);
  };

  // --- 💡 Logic ตรวจจับการ Scroll หน้าจอเพื่อ ซ่อน/แสดง Header ---
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // อยู่บริเวณบนสุดของหน้าจอเสมอ ให้แสดง Header
      if (currentScrollY <= 10) {
        setIsHeaderVisible(true);
        lastScrollY.current = currentScrollY;
        return;
      }

      // ตรวจสอบทิศทางการ Scroll
      if (currentScrollY > lastScrollY.current + 5) {
        // เลื่อนลง (Scroll Down) -> ซ่อน Header
        setIsHeaderVisible(false);
      } else if (currentScrollY < lastScrollY.current - 5) {
        // เลื่อนขึ้น (Scroll Up) -> แสดง Header
        setIsHeaderVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const { ready, spreadsheetId, pullFromSheet } = tracker;
  useEffect(() => {
    if (tab !== "dashboard" || !ready || !spreadsheetId || pulledRef.current) return;
    pulledRef.current = true;
    void pullFromSheet(true);
  }, [tab, ready, spreadsheetId, pullFromSheet]);

  useEffect(() => {
    if (!loading && !userId) {
      void navigate({ to: "/auth", replace: true });
    }
  }, [loading, userId, navigate]);

  async function signOut() {
    if (settingsDirtyRef.current) {
      const confirmed = window.confirm(
        "หน้านี้มีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก ต้องการออกจากระบบหรือไม่?",
      );
      if (!confirmed) return;
      settingsDirtyRef.current = false;
    }
    await queryClient.cancelQueries();
    queryClient.clear();
    clearGuestUser();
    try {
      await signOutFirebase();
    } catch (e) {
      console.warn("SignOut notice:", e);
    }
    void navigate({ to: "/auth", replace: true });
  }

  if (loading || !userId) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-4 text-center">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm font-medium text-muted-foreground">กำลังตรวจสอบข้อมูลผู้ใช้…</p>
        <button
          onClick={() => void navigate({ to: "/auth", replace: true })}
          className="mt-2 rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-accent transition"
        >
          ไปหน้าเข้าสู่ระบบ (Sign In)
        </button>
      </div>
    );
  }

  if (lock.checked && lock.locked) {
    return (
      <FaceLockScreen
        name={displayName(user)}
        userId={userId}
        onUnlock={lock.unlock}
        onBypassUnlock={lock.forceBypassUnlock}
        onRemoveFaceLock={lock.removeFaceLock}
        onSignOut={() => void signOut()}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* 📌 Sticky Wrapper ครอบทั้ง AppHeader และ Navigation Tabs */}
      <div
        className={`sticky top-0 z-50 bg-background/95 backdrop-blur-md transition-transform duration-300 ease-in-out ${
          isHeaderVisible ? "translate-y-0 shadow-sm" : "-translate-y-full"
        }`}
      >
        <AppHeader
          name={displayName(user)}
          email={user?.email ?? ""}
          isGuest={isGuest}
          faceEnrolled={lock.enrolled}
          faceSupported={lock.supported}
          userId={userId}
          onFaceChanged={lock.refresh}
          onSignOut={() => void signOut()}
          themeMode={tracker.themeSettings.themeMode}
          onToggleTheme={() =>
            tracker.previewThemeSettings({
              ...tracker.themeSettings,
              themeMode: tracker.themeSettings.themeMode === "dark" ? "light" : "dark",
            })
          }
        />

        {/* Navigation Tabs Bar อยู่ในส่วน Auto-Hide Sticky เดียวกัน */}
        <div className="mx-auto max-w-4xl px-3 pt-2 pb-2 sm:px-4">
          <div className="surface-card overflow-x-auto rounded-2xl p-1.5">
            <div className="flex min-w-max gap-1">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => requestTabChange(id)}
                  aria-current={tab === id}
                  className={`flex min-w-[7.25rem] items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-medium transition md:min-w-0 md:flex-1 md:text-sm ${
                    tab === id
                      ? "bg-primary text-primary-foreground shadow"
                      : "text-muted-foreground hover:bg-accent"
                  }`}
                >
                  <Icon className="h-4 w-4" /> {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-4xl px-3 py-4 sm:px-4 sm:py-5">
        {!tracker.ready ? (
          <div className="surface-card p-10 text-center text-sm text-muted-foreground">
            กำลังโหลดข้อมูล…
          </div>
        ) : tab === "checkin" ? (
          <div className="space-y-5">
            <CheckInPanel
              active={tracker.active}
              logs={tracker.logs}
              categories={tracker.categories}
              rates={tracker.rates}
              onSaveCategories={tracker.saveCategories}
              onCheckIn={tracker.checkIn}
              onCheckOut={(gps, photo) => void tracker.checkOut(gps, photo)}
              onCancelActive={tracker.cancelActive}
              onEditActiveTime={tracker.updateActiveTime}
              onEditActiveTasks={tracker.updateActiveTasks}
            />
          </div>
        ) : tab === "dashboard" ? (
          <DashboardPanel
            logs={tracker.logs}
            layoutState={dashboardViewport === "mobile" ? mobileLayout : desktopLayout}
            chartColors={tracker.themeSettings.chartColors}
            month={month}
            onMonthChange={setMonth}
            spreadsheetId={tracker.spreadsheetId}
            syncing={tracker.syncing}
            onRefresh={() => void tracker.pullFromSheet()}
          />
        ) : tab === "history" ? (
          <HistoryPanel
            logs={tracker.logs}
            syncing={tracker.syncing}
            pendingCount={tracker.pendingCount}
            categories={tracker.categories}
            onDelete={tracker.deleteLog}
            onSync={() => void tracker.syncPending()}
            onPull={() => void tracker.pullFromSheet()}
            onUpdate={tracker.updateLog}
          />
        ) : (
          <SettingsPanel
            userId={userId}
            authUser={user}
            isGuest={isGuest}
            workTypes={tracker.dbWorkTypes}
            otTypes={tracker.otTypes}
            rates={tracker.rates}
            themeSettings={tracker.themeSettings}
            savedThemeSettings={tracker.savedThemeSettings}
            spreadsheetId={tracker.spreadsheetId}
            logs={tracker.logs}
            previewMonth={month}
            mobileLayout={mobileLayout}
            desktopLayout={desktopLayout}
            onAddWorkType={tracker.addWorkType}
            onEditWorkType={tracker.editWorkType}
            onToggleWorkType={tracker.toggleWorkType}
            onSoftDeleteWorkType={tracker.softDeleteWorkType}
            onSaveRates={tracker.saveRates}
            branches={tracker.branches}
            activeBranchId={tracker.activeBranchId}
            branchSettings={tracker.branchSettings}
            branchSettingsLoading={tracker.branchSettingsLoading}
            onAddBranch={tracker.addBranch}
            onUpdateBranch={tracker.updateBranch}
            onSelectBranch={tracker.selectBranch}
            onSaveBranchSettings={tracker.saveBranchSettings}
            onPreviewThemeSettings={tracker.previewThemeSettings}
            onSaveThemeSettings={tracker.saveThemeSettings}
            onSetSpreadsheetId={tracker.setSpreadsheetId}
            onDirtyChange={(isDirty) => {
              settingsDirtyRef.current = isDirty;
            }}
            onSyncAirtableAll={tracker.syncAirtableAll}
            airtableSyncing={tracker.airtableSyncing}
            onSignOut={signOut}
          />
        )}
      </main>
    </div>
  );
}

function getViewport(): DashboardViewport {
  return typeof window !== "undefined" && window.matchMedia("(max-width: 639px)").matches
    ? "mobile"
    : "desktop";
}
