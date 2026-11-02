import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/deals")({
    component: () => <h1 className="text-2xl font-semibold">Negócios</h1>,
});
