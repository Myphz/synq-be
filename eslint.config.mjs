import prettier from "eslint-config-prettier";
import eslintPluginUnicorn from "eslint-plugin-unicorn";
import unusedImports from "eslint-plugin-unused-imports";
import ts from "typescript-eslint";

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...ts.configs.recommended,
  prettier,
  eslintPluginUnicorn.configs["recommended"],
  {
    rules: {
      "unicorn/no-empty-file": "off",
      "unicorn/prefer-query-selector": "off",
      "unicorn/no-null": "off",
      "unicorn/expiring-todo-comments": "off",
      "unicorn/no-array-callback-reference": "off",
      "unicorn/no-array-for-each": "off",
      "unicorn/prevent-abbreviations": "off",
      "unicorn/prefer-code-point": "off",
      "unicorn/prefer-global-this": "off",
      "unicorn/explicit-length-check": "off",
      "unicorn/catch-error-name": "off",
      "unicorn/no-await-expression-member": "off",
      "unicorn/no-magic-array-flat-depth": "off"
    }
  },
  {
    plugins: {
      "unused-imports": unusedImports
    },
    rules: {
      "unused-imports/no-unused-imports": "error"
    }
  },
  {
    files: ["src/**/*.ts"],
    ignores: ["dist/", "bundle/"]
  }
];
