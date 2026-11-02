export const restrictedImportsRule = [
    "error",
    {
        patterns: [
            {
                group: ["@mini-crm/contracts/*"],
                message:
                    "Import from the @mini-crm/contracts package root instead of a subpath.",
            },
        ],
    },
];
