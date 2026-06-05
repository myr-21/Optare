import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppLayout } from "@/components/app-layout";
import { getStoredToken } from "@/lib/api";

export const Route = createFileRoute("/app")({
  component: AppRoute,
});

function AppRoute() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const token = getStoredToken();
    const protectedPaths = ["/app/saved", "/app/settings", "/app/collections", "/app/analytics"];
    const isProtected = protectedPaths.some(p => pathname.startsWith(p));

    if (!token && isProtected) {
      window.dispatchEvent(new CustomEvent("trigger-auth-gate"));
      navigate({ to: "/app" });
    }
  }, [pathname, navigate]);

  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}
