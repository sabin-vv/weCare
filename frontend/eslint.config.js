import js from '@eslint/js'
import { defineConfig } from 'eslint/config'
import importPlugin from 'eslint-plugin-import'
import pluginReact from 'eslint-plugin-react'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default defineConfig([
    {
        files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"], plugins: { js, import: importPlugin }, extends: ["js/recommended"], languageOptions: { globals: globals.browser }, rules: {
            "import/order": [
                "error",
                {
                    groups: [
                        "builtin",
                        "external",
                        "internal",
                        "parent",
                        "sibling",
                        "index"
                    ],
                    "newlines-between": "always",
                    alphabetize: {
                        order: "asc",
                        caseInsensitive: true
                    }
                }
            ],
            "no-console": ["warn", { allow: ["warn", "error"] }],
        }
    },

    tseslint.configs.recommended,
    pluginReact.configs.flat.recommended,

    {
        settings: {
            react: {
                version: "detect"
            },

        },
        rules: {
            "react/react-in-jsx-scope": "off"
        }
    },

]);
