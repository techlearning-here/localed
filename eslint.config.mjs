import { FlatCompat } from "@eslint/eslintrc";
import path from "path";
import { fileURLToPath } from "url";
import js from "@eslint/js";
import { globalIgnores } from "eslint/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

const nextConfig = compat.extends("next/core-web-vitals");
const eslintConfig = [
  ...nextConfig,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
];
export default eslintConfig;
