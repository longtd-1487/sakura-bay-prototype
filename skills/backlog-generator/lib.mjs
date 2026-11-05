// Helpers to declare epics / issues / leaf tasks compactly and render markdown bodies.
export const epics = [], issues = [], subissues = [];
const TYPE_PREFIX = { db: 'DB', rpc: 'RPC', fe: 'FE', test: 'TEST', infra: 'INFRA', doc: 'DOC' };
const REF_RE = /\b(SC-\d{2}|BR-\d{2}|ADR-\d{3}|GAP-\d{2}|D-\d{2}|US-\d{2}|FT-\d{2}|Q\d{2}|A-\d{2}|PERM-\d{2})\b/g;

export const refs = (s) => [...new Set(s.match(REF_RE) || [])];
const bullets = (a) => a.map((x) => `- ${x}`).join('\n');
const checks = (a) => a.map((x) => `- [ ] ${x}`).join('\n');

export function E(key, title, o) {
  const body = [
    `**Phạm vi:**\n${bullets(o.scope)}`,
    `**Spec:** ${o.s}`,
    o.notes?.length ? `**Ràng buộc đặc thù:**\n${bullets(o.notes)}` : '',
  ].filter(Boolean).join('\n\n');
  epics.push({ key, title, body, priority: o.pr || 'Must', constraint: o.c || '', labels: ['type:epic', `area:${key}`] });
}

export function I(key, epic, title, o) {
  issues.push({ key, epic, title, _o: o, priority: o.pr || 'Must', constraint: o.c || '', spec_refs: refs(o.s), labels: ['type:feature', `area:${epic}`] });
}

// E00 clarification item = leaf issue without sub-issues
export function Q(key, title, o) {
  const body = [
    `**Mục tiêu:** ${o.g}`,
    `**Spec:** ${o.s}`,
    `**Câu hỏi gửi khách (kèm mặc định đang thiết kế):**\n${bullets(o.q)}`,
    `**Tiêu chí hoàn thành:**\n${checks(o.dod)}`,
    `**Chặn / ảnh hưởng:** ${o.blocks.join(', ')}`,
  ].join('\n\n');
  issues.push({ key, epic: 'E00', title, body, priority: o.pr || 'Must', constraint: o.c || '', spec_refs: refs(o.s + ' ' + o.q.join(' ')),
    labels: ['type:clarify', 'area:E00', ...(o.c ? ['constraint'] : [])], role: 'PM', phase: 1, depends_on: [], blocks: o.blocks });
}

export function L(key, parent, type, title, o) {
  const epic = 'E' + key.slice(2, 4);
  const spec_refs = refs(o.s);
  const labels = [`type:${type}`, `area:${epic}`];
  if (spec_refs.some((r) => r.startsWith('GAP-'))) labels.push('gap');
  if (o.c) labels.push('constraint');
  subissues.push({ key, parent, title: `[${TYPE_PREFIX[type]}] ${title}`, _o: o, labels, priority: o.pr || 'Must', constraint: o.c || '',
    role: o.role, phase: o.ph, depends_on: o.dep || [], spec_refs });
}

export function renderLeaf(t) {
  const o = t._o;
  return [
    `**Mục tiêu:** ${o.g}`,
    `**Spec:** ${o.s}`,
    `**Phạm vi:**\n${bullets(o.sc)}`,
    `**Tiêu chí hoàn thành:**\n${checks(o.dod)}`,
    `**Phụ thuộc:** ${t.depends_on.length ? t.depends_on.join(', ') : 'Không'}`,
  ].join('\n\n');
}

export function renderIssue(i, kids) {
  const o = i._o;
  return [
    `**Mục tiêu:** ${o.g}`,
    `**Spec:** ${o.s}`,
    `**Sub-issue:** ${kids.map((k) => k.key).join(', ')}`,
    `**DoD tổng:**\n${checks(o.dod)}`,
  ].join('\n\n');
}
