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
        signup: {
            root: "/signup",
            full: "/auth/signup",
        },
        signout: {
            root: "/signout",
            full: "/auth/signout",
        },
        validate: {
            root: "/validate",
            full: "/auth/validate",
        },
        resetPasswordRequest: {
            root: "/reset-password/request",
            full: "/auth/reset-password/request",
        },
        resetPassword: {
            root: "/reset-password",
            full: "/auth/reset-password",
        },
    },
    users: {
        root: "/users",
        byId: {
            root: "/:id",
            full: "/users/:id",
        },
    },
};
