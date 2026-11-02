import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/features/auth/hooks/useAuth";

export const Route = createFileRoute("/_app/")({
    component: Index,
});

function Index() {
    const { user } = useAuth();

    return (
        <div className="flex min-h-svh items-center justify-center p-8">
            <pre className="max-w-2xl overflow-auto rounded-lg border bg-muted p-4 text-sm">
                {JSON.stringify(user, null, 2)}
            </pre>
        </div>
    );
}
