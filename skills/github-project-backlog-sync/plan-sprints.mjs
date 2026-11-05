// Converts reviewed SWP to hours (1 SWP = 3h) and schedules leaves into 2-week sprints by
// phase → dependency (a task may share its dependency's sprint) → capacity of the role pool
// (BE-1/BE-2, FE-1/FE-2, QA, PM; 60h focus/person/sprint). The task goes to the least-loaded member of its pool.
// Usage: node plan-sprints.mjs <backlog.json> <backlog-map.json> <swp-final-by-issue.json> <out-plan.json>
import fs from "node:fs";
const [bp, mp, cp, out] = process.argv.slice(2);
const HOURS_PER_SWP = 3, CAPACITY = 60;
const POOLS = { BE: ["BE-1", "BE-2"], FE: ["FE-1", "FE-2"], QA: ["QA"], PM: ["PM"] };
const backlog = JSON.parse(fs.readFileSync(bp, "utf8")), map = JSON.parse(fs.readFileSync(mp, "utf8"));
const payload = JSON.parse(fs.readFileSync(cp, "utf8"));
const swpByNo = Object.fromEntries(payload.issues.map((i) => [Number(i.issueRef.split("#")[1]), i.finalSWP]));
const leaves = [...backlog.subissues, ...backlog.issues.filter((i) => i.epic === "E00")].map((t) => ({
  key: t.key, no: map[t.key].number, role: t.role, phase: t.phase ?? 1, deps: t.depends_on || [],
  swp: swpByNo[map[t.key].number], parent: t.parent || t.epic,
}));
for (const l of leaves) { if (l.swp == null) throw new Error(`no SWP for ${l.key}`); l.hours = l.swp * HOURS_PER_SWP; }
const byKey = Object.fromEntries(leaves.map((l) => [l.key, l]));
const load = {}; // load[sprint][role]
const order = [...leaves].sort((a, b) => a.phase - b.phase || a.key.localeCompare(b.key));
const done = new Set();
while (done.size < order.length) {
  let progressed = false;
  for (const l of order) {
    if (done.has(l.key) || l.deps.some((d) => byKey[d] && !done.has(d))) continue;
    const pool = POOLS[l.role.split("-")[0]];
    let s = Math.max(1, ...l.deps.filter((d) => byKey[d]).map((d) => byKey[d].sprint));
    for (;; s++) {
      const [member, used] = pool.map((r) => [r, (load[s] ||= {})[r] || 0]).sort((a, b) => a[1] - b[1])[0];
      if (used + l.hours <= CAPACITY || used === 0) { load[s][member] = used + l.hours; l.role = member; break; }
    }
    l.sprint = s; done.add(l.key); progressed = true;
  }
  if (!progressed) throw new Error("dependency cycle");
}
fs.writeFileSync(out, JSON.stringify({ hoursPerSwp: HOURS_PER_SWP, capacity: CAPACITY, leaves, load }, null, 2));
const sprints = Object.keys(load).map(Number).sort((a, b) => a - b);
for (const s of sprints) console.log(`Sprint ${s}: ${JSON.stringify(load[s])} · SWP ${leaves.filter((l) => l.sprint === s).reduce((a, l) => a + l.swp, 0)}`);
console.log(`total SWP ${leaves.reduce((a, l) => a + l.swp, 0)}, hours ${leaves.reduce((a, l) => a + l.hours, 0)}`);
