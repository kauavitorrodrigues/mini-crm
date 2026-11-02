import { createFileRoute } from "@tanstack/react-router";
import { KanbanBoard } from "@/features/kanban/components/KanbanBoard";

export const Route = createFileRoute("/_app/")({
    component: Index,
});

function Index() {
    return (
        <div className="flex flex-col gap-4 p-4 md:p-6">
            <h1 className="text-xl font-semibold">Pipeline</h1>
            <KanbanBoard />
        </div>
    );
}
