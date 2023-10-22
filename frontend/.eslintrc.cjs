/** @type {import("eslint").Linter.Config} */
module.exports = {
    root: true,
    extends: ["plugin:prettier/recommended", "turbo"],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        tsconfigRootDir: __dirname,
        sourceType: "module",
        project: ["./tsconfig.json"],
    },
    plugins: ["@typescript-eslint"],
    overrides: [
        {
            files: ["*.ts", "*.tsx"],
            extends: ["plugin:@typescript-eslint/recommended", "plugin:@typescript-eslint/eslint-recommended"],
            plugins: ["@typescript-eslint"],
            parser: "@typescript-eslint/parser",
            rules: {
                "@typescript-eslint/no-empty-interface": 0,
            },
        },
    ],
    rules: {
        "@typescript-eslint/no-unused-vars": [
            "warn",
            {
                argsIgnorePattern: "^_",
                varsIgnorePattern: "^_",
                caughtErrorsIgnorePattern: "^_",
            },
        ],
    },
    ignorePatterns: ["**/dist", "node_modules"],
}