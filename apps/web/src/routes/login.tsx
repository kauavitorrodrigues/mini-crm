import { createFileRoute, redirect } from "@tanstack/react-router";
import { queryClient } from "@/lib/tanstack/queryClient";
import { validateQueryOptions } from "@/features/auth/queries/validate";
import { SignInForm } from "@/features/auth/components/SignInForm";

export const Route = createFileRoute("/login")({
    beforeLoad: async () => {
        const data = await queryClient
            .ensureQueryData(validateQueryOptions())
            .catch(() => null);

        if (data?.user) throw redirect({ to: "/" });
    },
    component: LoginPage,
});

function LoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <SignInForm />
        </div>
    );
}
