import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";
import { restrictedImportsRule } from "./restricted-imports.js";

export const nodeConfig = defineConfig([
    globalIgnores(["dist", "node_modules"]),
    {
        files: ["**/*.{ts,tsx}"],
        extends: [js.configs.recommended, tseslint.configs.recommended],
        languageOptions: {
            globals: globals.node,
        },
        rules: {
            // Indentation width is enforced by prettier (tabWidth: 4). ESLint's
            // `indent` rule disagrees with prettier on nested ternaries and
            // other constructs, so it is intentionally not enabled here.
            "no-tabs": "error",
            "no-restricted-imports": restrictedImportsRule,
        },
    },
]);
