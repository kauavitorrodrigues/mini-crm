import { createFileRoute } from "@tanstack/react-router";
import { DashboardCards } from "@/features/dashboard/components/DashboardCards";

export const Route = createFileRoute("/_app/dashboard")({
    component: Dashboard,
});

function Dashboard() {
    return (
        <div className="flex flex-col gap-4 p-4 md:p-6">
            <h1 className="text-xl font-semibold">Painel</h1>
            <DashboardCards />
        </div>
    );
}
