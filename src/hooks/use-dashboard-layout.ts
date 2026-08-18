import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  createDefaultDashboardLayout,
  loadDashboardLayout,
  saveDashboardLayout,
  type DashboardLayout,
  type DashboardViewport,
} from "@/lib/dashboard-layout";

const MOBILE_MEDIA_QUERY = "(max-width: 639px)";
const SAVE_DEBOUNCE_MS = 650;

type DashboardLayoutState = {
  layout: DashboardLayout;
  viewport: DashboardViewport;
  loading: boolean;
  saving: boolean;
  updateLayout: (updater: (current: DashboardLayout) => DashboardLayout) => void;
};

export function useDashboardLayout(userId: string | null, isGuest: boolean): DashboardLayoutState {
  const [viewport, setViewport] = useState<DashboardViewport>(() => getViewport());
  const [layout, setLayout] = useState<DashboardLayout>(() =>
    createDefaultDashboardLayout(getViewport()),
  );
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [revision, setRevision] = useState(0);
  const loadedKeyRef = useRef<string | null>(null);
  const savedRevisionRef = useRef(0);

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_MEDIA_QUERY);
    const updateViewport = () => setViewport(mediaQuery.matches ? "mobile" : "desktop");
    updateViewport();
    mediaQuery.addEventListener("change", updateViewport);
    return () => mediaQuery.removeEventListener("change", updateViewport);
  }, []);

  useEffect(() => {
    const key = `${userId ?? "guest"}:${viewport}`;
    loadedKeyRef.current = null;
    savedRevisionRef.current = 0;
    setLayout(createDefaultDashboardLayout(viewport));
    setRevision(0);

    if (!userId || isGuest) {
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    void loadDashboardLayout(userId, viewport)
      .then((nextLayout) => {
        if (!active) return;
        setLayout(nextLayout);
        loadedKeyRef.current = key;
        savedRevisionRef.current = 0;
      })
      .catch((error: unknown) => {
        console.warn("[dashboard-layout] load failed:", error);
        if (active) loadedKeyRef.current = key;
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isGuest, userId, viewport]);

  useEffect(() => {
    if (
      !userId ||
      isGuest ||
      loading ||
      loadedKeyRef.current === null ||
      revision === savedRevisionRef.current
    ) {
      return;
    }

    const currentRevision = revision;
    setSaving(true);
    const timeout = window.setTimeout(() => {
      void saveDashboardLayout(userId, viewport, layout)
        .catch((error: unknown) => {
          console.warn("[dashboard-layout] save failed:", error);
        })
        .finally(() => {
          savedRevisionRef.current = currentRevision;
          setSaving(false);
        });
    }, SAVE_DEBOUNCE_MS);

    return () => window.clearTimeout(timeout);
  }, [isGuest, layout, loading, revision, userId, viewport]);

  const updateLayout = useCallback((updater: (current: DashboardLayout) => DashboardLayout) => {
    setLayout((current) => updater(current));
    setRevision((current) => current + 1);
  }, []);

  return useMemo(
    () => ({ layout, viewport, loading, saving, updateLayout }),
    [layout, loading, saving, updateLayout, viewport],
  );
}

function getViewport(): DashboardViewport {
  return typeof window !== "undefined" && window.matchMedia(MOBILE_MEDIA_QUERY).matches
    ? "mobile"
    : "desktop";
}
