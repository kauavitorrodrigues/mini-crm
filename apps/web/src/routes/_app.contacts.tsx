import { createFileRoute } from "@tanstack/react-router";
import { ContactsPage } from "@/features/contacts/components/ContactsPage";

export const Route = createFileRoute("/_app/contacts")({
    validateSearch: (search: Record<string, unknown>): { q?: string } => ({
        q: typeof search.q === "string" && search.q ? search.q : undefined,
    }),
    component: ContactsPage,
});
