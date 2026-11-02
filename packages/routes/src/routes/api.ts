export const ApiRoutes = {
    health: {
        root: "/health",
        ping: {
            root: "/ping",
            full: "/health/ping",
        },
    },
    auth: {
        root: "/auth",
        signin: {
            root: "/signin",
            full: "/auth/signin",
        },
        signout: {
            root: "/signout",
            full: "/auth/signout",
        },
        validate: {
            root: "/validate",
            full: "/auth/validate",
        },
    },
    stages: {
        root: "/stages",
        list: {
            root: "",
            full: "/stages",
        },
    },
    contacts: {
        root: "/contacts",
        list: { root: "", full: "/contacts" },
        create: { root: "", full: "/contacts" },
        byId: { root: "/:id", full: "/contacts/:id" },
    },
    deals: {
        root: "/deals",
        list: { root: "", full: "/deals" },
        create: { root: "", full: "/deals" },
        byId: { root: "/:id", full: "/deals/:id" },
        stage: { root: "/:id/stage", full: "/deals/:id/stage" },
        status: { root: "/:id/status", full: "/deals/:id/status" },
    },
};
