import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/QueryState";
import { DashboardCards } from "@/features/dashboard/components/DashboardCards";

export const Route = createFileRoute("/_app/dashboard")({
    component: Dashboard,
});

function Dashboard() {
    return (
        <div>
            <PageHeader
                title="Painel"
                description="Como está o seu funil de vendas neste mês."
            />
            <DashboardCards />
        </div>
    );
}
