import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  initializeLineLiffOnPrimaryRedirect,
  isLineLiffPrimaryRedirect,
} from "@/lib/line-auth";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { EngineWorkingAnimation } from "@/components/ui/engine-working-animation";

function NotFoundComponent() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      void router.navigate({ to: "/", replace: true });
    }
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center space-y-3">
        <EngineWorkingAnimation size="lg" label="กำลังนำคุณไปยังหน้าหลัก" className="mx-auto" />
        <h2 className="text-lg font-semibold text-foreground">กำลังนำคุณไปยังหน้าหลัก...</h2>
        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            กลับหน้าหลัก
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Work Tracker — ระบบบันทึกงาน & Check-in" },
      {
        name: "description",
        content: "บันทึกเวลาเข้า-ออกงาน พิกัด GPS ค่าแรง OT และซิงก์ลง Google Sheets",
      },
      { property: "og:title", content: "Work Tracker — ระบบบันทึกงาน & Check-in" },
      {
        property: "og:description",
        content: "บันทึกเวลาเข้า-ออกงาน พิกัด GPS ค่าแรง OT และซิงก์ลง Google Sheets",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Work Tracker — ระบบบันทึกงาน & Check-in" },
      {
        name: "twitter:description",
        content: "บันทึกเวลาเข้า-ออกงาน พิกัด GPS ค่าแรง OT และซิงก์ลง Google Sheets",
      },
      {
        property: "og:image",
        content:
          "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/18cd3937-beb4-41d7-ac0f-214b6401b89c/id-preview-710e52f7--291cc49f-164d-41b8-bc71-ccebcac01bf4.lovable.app-1785875522608.png",
      },
      {
        name: "twitter:image",
        content:
          "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/18cd3937-beb4-41d7-ac0f-214b6401b89c/id-preview-710e52f7--291cc49f-164d-41b8-bc71-ccebcac01bf4.lovable.app-1785875522608.png",
      },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),

  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  const [isLiffPrimaryRedirectPending, setIsLiffPrimaryRedirectPending] = useState(() =>
    isLineLiffPrimaryRedirect(),
  );

  useEffect(() => {
    if (!isLiffPrimaryRedirectPending) return;

    let cancelled = false;
    void initializeLineLiffOnPrimaryRedirect()
      .catch((error) => {
        if (cancelled) return;

        const message = error instanceof Error ? error.message : String(error);
        toast.error("เชื่อมต่อ LINE ไม่สำเร็จ", { description: message });
        window.history.replaceState({}, document.title, window.location.pathname);
      })
      .finally(() => {
        if (!cancelled) setIsLiffPrimaryRedirectPending(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isLiffPrimaryRedirectPending]);

  useEffect(() => {
    try {
      const { data } = supabase.auth.onAuthStateChange((event) => {
        if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
        router.invalidate();
        if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
      });
      return () => data?.subscription?.unsubscribe?.();
    } catch (err) {
      console.warn("[Root] onAuthStateChange error:", err);
    }
  }, [queryClient, router]);

  if (isLiffPrimaryRedirectPending) {
    return (
      <QueryClientProvider client={queryClient}>
        <div className="flex min-h-screen items-center justify-center bg-background px-4 text-center">
          <div className="space-y-2">
            <p className="text-lg font-semibold text-foreground">กำลังเชื่อมต่อ LINE...</p>
            <p className="text-sm text-muted-foreground">กรุณารอสักครู่</p>
          </div>
        </div>
        <Toaster position="top-center" richColors />
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
      <Toaster position="top-center" richColors />
    </QueryClientProvider>
  );
}
