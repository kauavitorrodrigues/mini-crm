import { createFileRoute } from "@tanstack/react-router";
import { DealDetailPage } from "@/features/deals/components/DealDetailPage";

export const Route = createFileRoute("/_app/deals/$id")({
    component: DealDetailPage,
});
