import { createFileRoute, redirect } from "@tanstack/react-router";
import { Logo } from "@/components/brand/Logo";
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
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10 p-4">
            <div className="flex flex-col items-center gap-2 text-center">
                <Logo size={48} />
                <p className="text-sm text-muted-foreground">
                    Seu funil de vendas, simples e organizado.
                </p>
            </div>
            <SignInForm />
        </div>
    );
}
