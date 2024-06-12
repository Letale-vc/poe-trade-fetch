// Для CommonJS стилів
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const cjsPackage = {
    type: "commonjs",
};

const cjsPackagePath = join("dist", "cjs", "package.json");

writeFileSync(cjsPackagePath, JSON.stringify(cjsPackage, null, 2));

const esmPackage = {
    type: "module",
};

const esmPackagePath = join("dist", "esm", "package.json");

writeFileSync(esmPackagePath, JSON.stringify(esmPackage, null, 2));
