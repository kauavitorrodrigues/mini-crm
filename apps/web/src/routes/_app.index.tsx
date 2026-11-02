import { createFileRoute } from "@tanstack/react-router";
import { KanbanBoard } from "@/features/kanban/components/KanbanBoard";

export const Route = createFileRoute("/_app/")({
    component: Index,
});

function Index() {
    return <KanbanBoard />;
}
