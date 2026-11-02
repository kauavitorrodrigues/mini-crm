import { defineConfig } from "vitest/config";
import { nodeVitestConfig } from "@mini-crm/vitest-config/node";

export default defineConfig({
    test: {
        ...nodeVitestConfig.test,
        // e2e files share one database (and the dashboard asserts on totals).
        fileParallelism: false,
    },
});
