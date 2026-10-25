import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const result = spawnSync(process.execPath, [
  resolve("node_modules/next/dist/bin/next"), "build", "--webpack",
], {
  stdio: "inherit",
  env: {
    ...process.env,
    GITHUB_PAGES: "true",
    NEXT_TELEMETRY_DISABLED: "1",
    NEXT_PUBLIC_BASE_PATH: process.env.NEXT_PUBLIC_BASE_PATH ?? "/fake-sun-tarot",
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? "https://silence-silence-bot.github.io",
  },
});

if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);
writeFileSync(resolve("out/.nojekyll"), "");
