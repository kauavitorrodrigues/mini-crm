import type { ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
    BriefcaseIcon,
    ChartColumnIcon,
    KanbanIcon,
    LogOutIcon,
    UsersIcon,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useSignOut } from "@/features/auth/mutations/signOut";
import { queryClient } from "@/lib/tanstack/queryClient";

const NAV_ITEMS = [
    { to: "/", label: "Quadro", icon: KanbanIcon, exact: true },
    { to: "/deals", label: "Negócios", icon: BriefcaseIcon, exact: false },
    { to: "/contacts", label: "Contatos", icon: UsersIcon, exact: false },
    {
        to: "/dashboard",
        label: "Painel",
        icon: ChartColumnIcon,
        exact: false,
    },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const signOut = useSignOut();

    const handleSignOut = () => {
        signOut.mutate(undefined, {
            onSettled: () => {
                queryClient.clear();
                navigate({ to: "/login" });
            },
        });
    };

    return (
        <div className="flex min-h-svh flex-col md:flex-row">
            <aside className="border-b bg-sidebar text-sidebar-foreground md:sticky md:top-0 md:h-svh md:w-56 md:shrink-0 md:border-r md:border-b-0">
                <div className="flex items-center justify-between gap-2 px-4 py-3 md:flex-col md:items-stretch md:gap-4 md:py-5 md:h-full">
                    <div className="flex items-center justify-between md:block">
                        <Logo size={30} />
                    </div>
                    <nav
                        aria-label="Principal"
                        className="order-3 flex w-full gap-1 overflow-x-auto md:order-none md:flex-1 md:flex-col"
                    >
                        {NAV_ITEMS.map(({ to, label, icon: Icon, exact }) => (
                            <Link
                                key={to}
                                to={to}
                                activeOptions={{ exact }}
                                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                                activeProps={{
                                    className:
                                        "bg-sidebar-accent text-sidebar-accent-foreground shadow-xs",
                                    "aria-current": "page",
                                }}
                            >
                                <Icon className="size-4" aria-hidden />
                                {label}
                            </Link>
                        ))}
                    </nav>
                    <div className="flex items-center gap-2 md:flex-col md:items-stretch">
                        <span
                            className="max-w-40 truncate text-sm text-muted-foreground md:max-w-none"
                            title={user.email}
                        >
                            {user.name}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSignOut}
                            disabled={signOut.isPending}
                        >
                            <LogOutIcon aria-hidden />
                            Sair
                        </Button>
                    </div>
                </div>
            </aside>
            <main className="min-w-0 flex-1 p-4 md:p-8">{children}</main>
        </div>
    );
}
