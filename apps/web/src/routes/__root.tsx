import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import type { User } from "@mini-crm/contracts";

export interface RouterContext {
    user?: User;
}

export const Route = createRootRouteWithContext<RouterContext>()({
    component: Outlet,
});
