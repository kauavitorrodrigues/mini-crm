import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";
import { restrictedImportsRule } from "./restricted-imports.js";

export const webConfig = defineConfig([
    globalIgnores(["dist", "src/routeTree.gen.ts"]),
    {
        files: ["**/*.{ts,tsx}"],
        extends: [
            js.configs.recommended,
            tseslint.configs.recommended,
            reactHooks.configs.flat.recommended,
            reactRefresh.configs.vite,
        ],
        languageOptions: {
            globals: globals.browser,
        },
        rules: {
            // Indentation width is enforced by prettier (tabWidth: 4). ESLint's
            // `indent` rule disagrees with prettier on nested ternaries and
            // other constructs, so it is intentionally not enabled here.
            "no-tabs": "error",
            "@typescript-eslint/no-unused-vars": [
                "error",
                { ignoreRestSiblings: true },
            ],
            "react-refresh/only-export-components": [
                "warn",
                { allowConstantExport: true },
            ],
            // TanStack Table/Virtual return functions that can't be memoized
            // safely, so React Compiler always skips these components. This
            // is expected and harmless, not something the code can fix.
            "react-hooks/incompatible-library": "off",
            "no-restricted-imports": restrictedImportsRule,
        },
    },
    {
        files: ["src/routes/**/*.tsx"],
        rules: {
            "react-refresh/only-export-components": "off",
        },
    },
]);
