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
};
