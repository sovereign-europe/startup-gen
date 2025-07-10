// @ts-check
import eslint from "@eslint/js"
import tseslint from "typescript-eslint"
import prettierConfig from "eslint-config-prettier"
import unusedImports from "eslint-plugin-unused-imports"
import importPlugin from "eslint-plugin-import"

export default tseslint.config(eslint.configs.recommended, ...tseslint.configs.recommended, prettierConfig, {
  plugins: {
    "unused-imports": unusedImports,
    import: importPlugin,
  },
  rules: {
    // Unused imports handling
    "@typescript-eslint/no-unused-vars": "off",
    "unused-imports/no-unused-imports": "error",
    "unused-imports/no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
      },
    ],

    // Import ordering and grouping
    "import/order": [
      "error",
      {
        groups: [
          "builtin", // Node.js built-in modules
          "external", // External packages
          "internal", // Internal modules (your own code)
          "parent", // Parent directories
          "sibling", // Same directory
          "index", // Index files
        ],
        "newlines-between": "always",
        alphabetize: {
          order: "asc",
          caseInsensitive: true,
        },
        pathGroups: [
          {
            pattern: "react",
            group: "external",
            position: "before",
          },
          {
            pattern: "react-dom",
            group: "external",
            position: "before",
          },
          {
            pattern: "@/**",
            group: "internal",
            position: "before",
          },
        ],
        pathGroupsExcludedImportTypes: ["react", "react-dom"],
      },
    ],

    // Additional import rules
    "import/no-duplicates": "error",
    "import/no-unresolved": "off", // Turn off as TypeScript handles this
    "import/no-named-as-default": "warn",
    "import/no-named-as-default-member": "warn",
    "import/newline-after-import": "error",
    "import/prefer-default-export": "off", // Allow named exports
    "import/no-default-export": "off", // Allow default exports
  },
})
