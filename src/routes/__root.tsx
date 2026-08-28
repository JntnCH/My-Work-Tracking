import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import appCss from "../styles.css?url";
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
      { rel: "icon", href: "/favicon.svg?v=20260827", type: "image/svg+xml" },
      { rel: "shortcut icon", href: "/favicon.ico?v=20260827", type: "image/x-icon" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png?v=20260827", sizes: "180x180" },
      { rel: "manifest", href: "/site.webmanifest?v=20260827" },
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

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
      <Toaster position="top-center" richColors />
    </QueryClientProvider>
  );
}
