import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppLayout } from "@/components/app-layout";
import { getStoredToken } from "@/lib/api";

export const Route = createFileRoute("/app")({
  component: AppRoute,
});

function AppRoute() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      navigate({ to: "/login" });
    }
  }, [navigate]);

  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}
