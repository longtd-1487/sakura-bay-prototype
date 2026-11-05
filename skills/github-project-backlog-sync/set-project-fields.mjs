// Writes field values (SWP, Giờ ước lượng, Giờ thực tế, Iteration, Status, Phụ trách…) to Project v2 items.
// Input: JSON array [{ "key": "T-06-01-a", "fields": { "SWP": 8, "Giờ ước lượng": 24, "Iteration": "Sprint 1", "Status": "Done" } }]
// Usage: node set-project-fields.mjs <owner> <projectNumber> <backlog-map.json> <values.json> [--dry-run]
import fs from "node:fs";
import { graphql, loadProject, fieldMutation, sleep } from "./lib-github-api.mjs";

const [owner, projectNo, mapPath, valuesPath, flag] = process.argv.slice(2);
const dryRun = flag === "--dry-run";
const map = JSON.parse(fs.readFileSync(mapPath, "utf8"));
const values = JSON.parse(fs.readFileSync(valuesPath, "utf8"));
const { projectId, fields } = await loadProject(owner, Number(projectNo));

let ok = 0;
for (const { key, fields: v } of values) {
  const entry = map[key];
  if (!entry) { console.warn(`skip: unknown key ${key}`); continue; }
  const m = fieldMutation(projectId, entry.itemId, fields, v); // throws on unknown field/option before any write
  if (!m) continue;
  if (dryRun) { console.log(`[dry-run] #${entry.number} ${key} ${JSON.stringify(v)}`); continue; }
  await graphql(m);
  ok++;
  await sleep(250);
}
console.log(`${dryRun ? "validated" : "updated"} ${dryRun ? values.length : ok} items`);
