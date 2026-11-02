import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["src/worker.ts"],
    splitting: false,
    sourcemap: true,
    clean: true,
    noExternal: ["@mini-crm/jobs", "@mini-crm/infra"],
});
