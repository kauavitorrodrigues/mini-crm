module.exports = {
    apps: [
        {
            name: "mini-crm:api",
            cwd: "./apps/api",
            script: "pnpm",
            args: "start",
            interpreter: "none",
            autorestart: true,
            max_restarts: 10,
        },
        {
            name: "mini-crm:worker",
            cwd: "./apps/worker",
            script: "pnpm",
            args: "start",
            interpreter: "none",
            autorestart: true,
            max_restarts: 10,
        },
    ],
};
