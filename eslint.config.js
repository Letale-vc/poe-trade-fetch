/** @type {import('@types/eslint').Linter.BaseConfig} */

const _default = {
  plugins: ["@typescript-eslint", "prettier"],
  extends: ["plugin:@typescript-eslint/recommended", "prettier"],
  parser: "@typescript-eslint/parser",
  rules: {
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": "warn",
  },
  ignorePatterns: ["node_modules/", "dist"],
};
export {_default as default};
