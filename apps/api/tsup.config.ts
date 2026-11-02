import { readFileSync } from "node:fs";
import { dirname } from "node:path";
import { transformSync } from "@swc/core";
import type { Plugin } from "esbuild";
import { defineConfig } from "tsup";

/**
 * esbuild transpiles decorators but never emits the `design:*` metadata
 * Nest's DI reads to resolve constructor parameters — only the real
 * TypeScript compiler or SWC (with `decoratorMetadata: true`) does. This
 * plugin runs every .ts file through SWC first so esbuild only ever sees
 * plain JS with the metadata calls already inlined.
 */
const swcDecoratorMetadataPlugin: Plugin = {
    name: "swc-decorator-metadata",
    setup(build) {
        build.onLoad({ filter: /\.ts$/ }, (args) => {
            const source = readFileSync(args.path, "utf8");
            const { code } = transformSync(source, {
                filename: args.path,
                jsc: {
                    parser: { syntax: "typescript", decorators: true },
                    transform: {
                        legacyDecorator: true,
                        decoratorMetadata: true,
                    },
                    target: "es2022",
                    keepClassNames: true,
                },
                module: { type: "es6" },
            });

            return {
                contents: code,
                loader: "js",
                resolveDir: dirname(args.path),
            };
        });
    },
};

export default defineConfig({
    entry: ["src/main.ts"],
    splitting: false,
    sourcemap: true,
    clean: true,
    noExternal: ["@mini-crm/contracts", "@mini-crm/core", "@mini-crm/routes"],
    esbuildPlugins: [swcDecoratorMetadataPlugin],
});
