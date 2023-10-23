/** @type {import('eslint').Linter.Config} */
module.exports = {
  plugins: ["@typescript-eslint", "prettier"],
  extends: [
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
  ],
  parser: "@typescript-eslint/parser",
  rules: {
    "@typescript-eslint/no-unused-vars": "warn",
    "prettier/prettier": "error",
  },
  ignorePatterns: ["node_modules/", "dist"],
};
