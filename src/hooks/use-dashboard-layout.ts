import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  createDefaultDashboardLayout,
  loadDashboardLayout,
  saveDashboardLayout,
  type DashboardLayout,
  type DashboardViewport,
} from "@/lib/dashboard-layout";

const MOBILE_MEDIA_QUERY = "(max-width: 639px)";

type DashboardLayoutState = {
  layout: DashboardLayout;
  viewport: DashboardViewport;
  loading: boolean;
  loaded: boolean;
  saving: boolean;
  updateLayout: (updater: (current: DashboardLayout) => DashboardLayout) => void;
  saveLayout: () => Promise<void>;
  resetLayout: () => void;
};

export function useDashboardLayout(
  userId: string | null,
  isGuest: boolean,
  viewportOverride?: DashboardViewport,
): DashboardLayoutState {
  const [detectedViewport, setDetectedViewport] = useState<DashboardViewport>(() => getViewport());
  const viewport = viewportOverride ?? detectedViewport;
  const [layout, setLayout] = useState<DashboardLayout>(() =>
    createDefaultDashboardLayout(viewport),
  );
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const loadedKeyRef = useRef<string | null>(null);
  const layoutRef = useRef(layout);

  useEffect(() => {
    layoutRef.current = layout;
  }, [layout]);

  useEffect(() => {
    if (viewportOverride) return;
    const mediaQuery = window.matchMedia(MOBILE_MEDIA_QUERY);
    const updateViewport = () => setDetectedViewport(mediaQuery.matches ? "mobile" : "desktop");
    updateViewport();
    mediaQuery.addEventListener("change", updateViewport);
    return () => mediaQuery.removeEventListener("change", updateViewport);
  }, [viewportOverride]);

  useEffect(() => {
    const key = `${userId ?? "guest"}:${viewport}`;
    loadedKeyRef.current = null;
    setLoaded(false);
    setLayout(createDefaultDashboardLayout(viewport));

    if (!userId || isGuest) {
      setLoading(false);
      setLoaded(true);
      return;
    }

    let active = true;
    setLoading(true);
    void loadDashboardLayout(userId, viewport)
      .then((nextLayout) => {
        if (!active) return;
        setLayout(nextLayout);
        loadedKeyRef.current = key;
        setLoaded(true);
      })
      .catch((error: unknown) => {
        console.warn("[dashboard-layout] load failed:", error);
        if (active) {
          loadedKeyRef.current = key;
          setLoaded(true);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isGuest, userId, viewport]);

  const updateLayout = useCallback((updater: (current: DashboardLayout) => DashboardLayout) => {
    setLayout((current) => updater(current));
  }, []);

  const resetLayout = useCallback(() => {
    setLayout(createDefaultDashboardLayout(viewport));
  }, [viewport]);

  const saveLayout = useCallback(async () => {
    if (!userId || isGuest || loadedKeyRef.current === null) return;
    setSaving(true);
    try {
      await saveDashboardLayout(userId, viewport, layoutRef.current);
    } finally {
      setSaving(false);
    }
  }, [isGuest, userId, viewport]);

  return useMemo(
    () => ({ layout, viewport, loading, loaded, saving, updateLayout, saveLayout, resetLayout }),
    [layout, loaded, loading, resetLayout, saveLayout, saving, updateLayout, viewport],
  );
}

function getViewport(): DashboardViewport {
  return typeof window !== "undefined" && window.matchMedia(MOBILE_MEDIA_QUERY).matches
    ? "mobile"
    : "desktop";
}
