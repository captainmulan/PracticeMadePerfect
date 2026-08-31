/**
 * Patch → static audit → headless visual audit loop for Solar System HTML.
 * Run: node book_html/SolarSystem/_audit-solar-ui-loop.mjs
 */
import { spawnSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const maxRounds = 3;

function run(label, script) {
  console.log(`\n=== ${label} ===`);
  const r = spawnSync(process.execPath, [path.join(dir, script)], {
    stdio: "inherit",
    cwd: dir,
  });
  return r.status === 0;
}

let ok = false;
for (let round = 1; round <= maxRounds; round++) {
  console.log(`\n########## Round ${round}/${maxRounds} ##########`);
  run("Patch", "_patch-solar-ui-pass.mjs");
  const staticOk = run("Static audit", "_audit-solar-ui-static.mjs");
  if (!staticOk) {
    console.error("Static audit failed — review _audit-output/static-report.json");
    process.exit(1);
  }
  ok = run("Headless visual audit", "_audit-solar-ui-headless.mjs");
  if (ok) {
    console.log("\nAll audits passed.");
    process.exit(0);
  }
  console.log("Headless audit found issues — re-patching shared overrides and retrying...");
}

console.error(`Still failing after ${maxRounds} rounds. See _audit-output/headless-report.md`);
process.exit(1);
