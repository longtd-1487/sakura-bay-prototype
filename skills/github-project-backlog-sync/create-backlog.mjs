// Creates epics → issues → sub-issues from backlog.json, links sub-issues, adds all to a Project v2
// and sets Cấp / Ưu tiên / Ràng buộc đặc thù / Phụ trách / Status. Idempotent via the map file.
// Usage: node create-backlog.mjs <owner/repo> <projectNumber> <backlog.json> <backlog-map.json>
import fs from "node:fs";
import { rest, graphql, loadProject, fieldMutation, sleep } from "./lib-github-api.mjs";

const [repoFull, projectNo, backlogPath, mapPath] = process.argv.slice(2);
if (!mapPath) { console.error("usage: node create-backlog.mjs <owner/repo> <projectNumber> <backlog.json> <backlog-map.json>"); process.exit(1); }
const [owner] = repoFull.split("/");
const backlog = JSON.parse(fs.readFileSync(backlogPath, "utf8"));
const map = fs.existsSync(mapPath) ? JSON.parse(fs.readFileSync(mapPath, "utf8")) : {};
const save = () => fs.writeFileSync(mapPath, JSON.stringify(map, null, 2));
const { projectId, fields } = await loadProject(owner, Number(projectNo));

const ref = (key) => (map[key] ? `#${map[key].number}` : key);

// Sub-issues are auto-added to the parent's project, so "already exists" is expected: fetch the existing item instead.
async function ensureProjectItem(nodeId) {
  try {
    const added = await graphql(`mutation($p:ID!,$c:ID!){ addProjectV2ItemById(input:{projectId:$p,contentId:$c}){ item { id } } }`, { p: projectId, c: nodeId });
    return added.addProjectV2ItemById.item.id;
  } catch (e) {
    if (!/already exists/i.test(e.message)) throw e;
    const d = await graphql(`query($n:ID!){ node(id:$n){ ... on Issue { projectItems(first:20){ nodes { id project { id } } } } } }`, { n: nodeId });
    return d.node.projectItems.nodes.find((n) => n.project.id === projectId).id;
  }
}

// Recover issues created by an interrupted run (identified by the footer key) so a rerun never duplicates them.
const keyRe = /Backlog key: `([^`]+)`/;
for (let page = 1; ; page++) {
  const list = await rest("GET", `/repos/${repoFull}/issues?state=all&per_page=100&page=${page}`);
  if (!list.length) break;
  for (const is of list) {
    const k = is.body?.match(keyRe)?.[1];
    if (k && !map[k]) {
      const level = backlog.epics.some((e) => e.key === k) ? "Epic" : backlog.subissues.some((s) => s.key === k) ? "Sub-issue" : "Issue";
      const parentKey = backlog.issues.find((i) => i.key === k)?.epic || backlog.subissues.find((s) => s.key === k)?.parent || null;
      map[k] = { number: is.number, id: is.id, nodeId: is.node_id, level, parent: parentKey, recovered: true };
      console.log(`recovered #${is.number} ${k}`);
    }
  }
}
save();
const footer = (key) => `\n\n---\n<sub>Backlog key: \`${key}\` · sinh từ LAB-4 specs bằng skills/github-project-backlog-sync</sub>`;

async function createOne(item, level, labels, parentKey) {
  if (map[item.key]?.itemId && map[item.key]?.fieldsSet) return map[item.key];
  let entry = map[item.key];
  if (!entry) {
    const body = (item.body || "").replace(/\b([TI]-\d{2}-\d{2}(?:-[a-z])?)\b/g, (k) => ref(k)) + footer(item.key);
    const issue = await rest("POST", `/repos/${repoFull}/issues`, { title: item.title, body, labels, assignees: [owner] });
    entry = { number: issue.number, id: issue.id, nodeId: issue.node_id, level, parent: parentKey || null };
    map[item.key] = entry; save();
  }
  if (parentKey && !entry.subLinked) {
    try { await rest("POST", `/repos/${repoFull}/issues/${map[parentKey].number}/sub_issues`, { sub_issue_id: entry.id }); }
    catch (e) { if (!/already|422/.test(e.message)) throw e; }
    entry.subLinked = true; save();
  }
  entry.itemId = await ensureProjectItem(entry.nodeId);
  const m = fieldMutation(projectId, entry.itemId, fields, {
    "Cấp": level,
    "Ưu tiên": item.priority,
    "Ràng buộc đặc thù": item.constraint || undefined,
    "Phụ trách": item.role,
    Status: "Backlog",
  });
  if (m) await graphql(m);
  entry.fieldsSet = true;
  save();
  console.log(`${level.padEnd(9)} #${entry.number} ${item.key} ${item.title}`);
  await sleep(800);
  return entry;
}

const area = (k) => `area:${k}`;
for (const e of backlog.epics) await createOne(e, "Epic", ["type:epic", area(e.key), ...(e.constraint ? ["constraint"] : [])]);
for (const i of backlog.issues) {
  const isLeaf = (i.labels || []).includes("type:clarify");
  const labels = i.labels?.length ? i.labels : ["type:feature", area(i.epic)];
  await createOne(i, isLeaf ? "Sub-issue" : "Issue", [...new Set([...labels, ...(i.constraint ? ["constraint"] : [])])], i.epic);
}
for (const s of backlog.subissues) await createOne(s, "Sub-issue", [...new Set([...(s.labels || []), ...(s.constraint ? ["constraint"] : [])])], s.parent);

// Second pass: rewrite bodies so dependency keys that pointed at not-yet-created issues become #numbers.
for (const item of [...backlog.epics, ...backlog.issues, ...backlog.subissues]) {
  const e = map[item.key];
  if (e.bodyLinked) continue;
  const body = (item.body || "").replace(/\b([TI]-\d{2}-\d{2}(?:-[a-z])?)\b/g, (k) => ref(k)) + footer(item.key);
  await rest("PATCH", `/repos/${repoFull}/issues/${e.number}`, { body });
  e.bodyLinked = true; save(); await sleep(300);
}
console.log(`done: ${Object.keys(map).length} items`);
