// @ts-check
import eslint from "@eslint/js"
import tseslint from "typescript-eslint"
import prettierConfig from "eslint-config-prettier"
import unusedImports from "eslint-plugin-unused-imports"

export default tseslint.config(eslint.configs.recommended, ...tseslint.configs.recommended, prettierConfig, {
  plugins: {
    "unused-imports": unusedImports,
  },
  rules: {
    "@typescript-eslint/no-unused-vars": "off", // Turn off the base rule
    "unused-imports/no-unused-imports": "error", // This will auto-fix
    "unused-imports/no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
      },
    ],
  },
})
