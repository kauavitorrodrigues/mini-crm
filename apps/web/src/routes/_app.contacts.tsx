import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/contacts")({
    component: () => <h1 className="text-2xl font-semibold">Contatos</h1>,
});
