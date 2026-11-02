import { resolve } from "node:path";
import { defineConfig, mergeConfig } from "vitest/config";
import { webVitestConfig } from "@mini-crm/vitest-config/web";

export default defineConfig(
    mergeConfig(webVitestConfig, {
        resolve: {
            alias: {
                "@": resolve(import.meta.dirname, "./src"),
            },
        },
    })
);
