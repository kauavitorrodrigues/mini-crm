import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/dashboard")({
    component: () => <h1 className="text-2xl font-semibold">Painel</h1>,
});
