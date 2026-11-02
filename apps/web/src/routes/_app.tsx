import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { queryClient } from "@/lib/tanstack/queryClient";
import { validateQueryOptions } from "@/features/auth/queries/validate";
import { AppShell } from "@/components/layout/AppShell";
import { AuthProvider } from "@/features/auth/contexts/AuthContext";

export const Route = createFileRoute("/_app")({
    beforeLoad: async () => {
        const data = await queryClient
            .ensureQueryData(validateQueryOptions())
            .catch(() => null);

        if (!data?.user) throw redirect({ to: "/login" });

        return { user: data.user };
    },
    component: AppLayout,
});

function AppLayout() {
    const { user } = Route.useRouteContext();

    return (
        <AuthProvider user={user}>
            <AppShell>
                <Outlet />
            </AppShell>
        </AuthProvider>
    );
}
