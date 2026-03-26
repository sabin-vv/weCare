import js from "@eslint/js"
import { defineConfig } from "eslint/config"
import globals from "globals"
import tseslint from "typescript-eslint"
import simpleImportSort from "eslint-plugin-simple-import-sort"

export default defineConfig([
    {
        files: ["**/*.{js,mjs,cjs}"],
        ...js.configs.recommended,
        languageOptions: {
            globals: globals.node,
        },
    },

    ...tseslint.configs.recommended,

    {
        files: ["**/*.ts"],
        plugins: {
            "simple-import-sort": simpleImportSort,
        },
        languageOptions: {
            parserOptions: {
                project: "./tsconfig.json",
            },
        },
        rules: {
            "simple-import-sort/imports": "error",
            "simple-import-sort/exports": "error",
            "no-console": ["warn", { allow: ["warn", "error"] }],
            "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
        },
    },
])