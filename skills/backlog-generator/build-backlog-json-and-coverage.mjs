// Build backlog.json + backlog-coverage.md, validating keys, deps, cycles and phase order.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { epics, issues, subissues, renderLeaf, renderIssue } from './lib.mjs';
import './data-e00-e04.mjs';
import './data-e05-e08.mjs';
import './data-e09-e13.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.resolve(here, '..');
const errors = [];

// uniqueness
const all = [...epics, ...issues, ...subissues];
const seen = new Set();
for (const x of all) { if (seen.has(x.key)) errors.push(`duplicate key ${x.key}`); seen.add(x.key); }
const epicKeys = new Set(epics.map((e) => e.key));
const issueKeys = new Set(issues.map((i) => i.key));
const leafKeys = new Set([...subissues.map((t) => t.key), ...issues.filter((i) => i.epic === 'E00').map((i) => i.key)]);

for (const i of issues) if (!epicKeys.has(i.epic)) errors.push(`issue ${i.key} → missing epic ${i.epic}`);
for (const t of subissues) {
  if (!issueKeys.has(t.parent)) errors.push(`leaf ${t.key} → missing parent ${t.parent}`);
  if (!t.key.startsWith('T-' + t.parent.slice(2) + '-')) errors.push(`leaf ${t.key} key/parent mismatch ${t.parent}`);
  for (const d of t.depends_on) if (!leafKeys.has(d)) errors.push(`leaf ${t.key} → missing dep ${d}`);
  if (!t.role || !t.phase) errors.push(`leaf ${t.key} missing role/phase`);
}
for (const q of issues.filter((i) => i.blocks)) for (const b of q.blocks) if (!leafKeys.has(b)) errors.push(`${q.key} blocks missing ${b}`);
for (const i of issues.filter((i) => i.epic !== 'E00')) if (!subissues.some((t) => t.parent === i.key)) errors.push(`issue ${i.key} has no sub-issues`);

// cycle detection + effective phase (phase ≥ max phase of deps)
const byKey = Object.fromEntries([...subissues, ...issues.filter((i) => i.epic === 'E00')].map((x) => [x.key, x]));
const state = {}; const bumps = [];
function visit(k, stack) {
  if (state[k] === 2) return byKey[k].phase;
  if (state[k] === 1) { errors.push(`cycle: ${[...stack, k].join(' → ')}`); return 1; }
  state[k] = 1;
  const n = byKey[k];
  let ph = n.phase;
  for (const d of n.depends_on || []) ph = Math.max(ph, visit(d, [...stack, k]));
  if (ph !== n.phase) { bumps.push(`${k}: ${n.phase} → ${ph}`); n.phase = ph; }
  state[k] = 2;
  return ph;
}
Object.keys(byKey).forEach((k) => visit(k, []));

if (errors.length) { console.error(errors.join('\n')); process.exit(1); }

// render
for (const t of subissues) t.body = renderLeaf(t);
for (const i of issues) if (i._o) i.body = renderIssue(i, subissues.filter((t) => t.parent === i.key));
const strip = ({ _o, ...rest }) => rest;
const json = { epics, issues: issues.map(strip), subissues: subissues.map(strip) };
fs.writeFileSync(path.join(out, 'backlog.json'), JSON.stringify(json, null, 2));

// stats
const per = {};
for (const e of epics) per[e.key] = { issues: issues.filter((i) => i.epic === e.key).length, leaves: subissues.filter((t) => t.parent.slice(2, 4) === e.key.slice(1)).length };
const count = (arr, f) => arr.reduce((m, x) => ((m[f(x)] = (m[f(x)] || 0) + 1), m), {});
const leavesAndClarify = [...subissues, ...issues.filter((i) => i.epic === 'E00')];
console.log(JSON.stringify({ epics: epics.length, issues: issues.length, subissues: subissues.length, per,
  role: count(leavesAndClarify, (x) => x.role), phase: count(leavesAndClarify, (x) => x.phase),
  type: count(subissues, (x) => x.labels[0]), priority: count(subissues, (x) => x.priority), gapLeaves: subissues.filter((t) => t.labels.includes('gap')).length, bumps }, null, 1));

// coverage (a): spec id → epic → keys
const specIndex = {};
for (const x of [...issues, ...subissues]) for (const r of x.spec_refs) {
  if (!/^(SC|ADR|GAP)-/.test(r)) continue;
  const epic = x.epic || 'E' + x.key.slice(2, 4);
  (specIndex[r] ??= {});
  (specIndex[r][epic] ??= []).push(x.key);
}
const order = (a, b) => a.localeCompare(b, 'en', { numeric: true });
let table = '| Spec | Epic | Issue / sub-issue |\n|---|---|---|\n';
for (const r of Object.keys(specIndex).sort(order)) {
  for (const ep of Object.keys(specIndex[r]).sort(order)) table += `| ${r} | ${ep} | ${specIndex[r][ep].join(', ')} |\n`;
}
const expected = [...Array(37)].map((_, i) => `SC-${String(i + 1).padStart(2, '0')}`)
  .concat([...Array(12)].map((_, i) => `ADR-${String(i + 1).padStart(3, '0')}`), [...Array(22)].map((_, i) => `GAP-${String(i + 1).padStart(2, '0')}`));
const missing = expected.filter((r) => !specIndex[r]);
console.log('uncovered spec ids:', missing.join(', ') || 'none');

const notes = fs.readFileSync(path.join(here, 'coverage-notes-deferred-and-gaps.md'), 'utf8');
const md = `# Backlog coverage — LAB-4 → GitHub backlog\n\n> Sinh bởi \`backlog-gen/build-backlog-json-and-coverage.mjs\` từ \`backlog.json\`. ${epics.length} epic · ${issues.length} issue (gồm ${per.E00.issues} câu hỏi E00) · ${subissues.length} sub-issue.\n\n## (a) Spec → Epic → issue / sub-issue\n\nĐộ phủ: ${expected.length - missing.length}/${expected.length} mã SC/ADR/GAP có ít nhất một item${missing.length ? ` (thiếu: ${missing.join(', ')})` : ''}.\n\n${table}\n${notes}`;
fs.writeFileSync(path.join(out, 'backlog-coverage.md'), md);
