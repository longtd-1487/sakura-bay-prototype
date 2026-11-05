// Minimal GitHub REST + GraphQL client. Token comes from `gh auth token` and is kept in memory only.
import { execFileSync } from "node:child_process";

const GH_BIN = process.env.GH_BIN || "gh";
const TOKEN = execFileSync(GH_BIN, ["auth", "token"], { encoding: "utf8" }).trim();
const HEADERS = {
  Authorization: `Bearer ${TOKEN}`,
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  "Content-Type": "application/json",
};

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function rest(method, path, body) {
  for (let attempt = 1; attempt <= 5; attempt++) {
    const res = await fetch(`https://api.github.com${path}`, { method, headers: HEADERS, body: body ? JSON.stringify(body) : undefined });
    if (res.status === 403 || res.status === 429) { await sleep(attempt * 15000); continue; } // secondary rate limit
    const text = await res.text();
    if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${text.slice(0, 300)}`);
    return text ? JSON.parse(text) : null;
  }
  throw new Error(`${method} ${path} → rate limited 5 times`);
}

export async function graphql(query, variables = {}) {
  for (let attempt = 1; attempt <= 5; attempt++) {
    const res = await fetch("https://api.github.com/graphql", { method: "POST", headers: HEADERS, body: JSON.stringify({ query, variables }) });
    const json = await res.json();
    const limited = res.status === 403 || res.status === 429 || json.errors?.some((e) => /rate limit/i.test(e.message));
    if (limited) { await sleep(attempt * 15000); continue; }
    if (json.errors) throw new Error(`GraphQL: ${JSON.stringify(json.errors).slice(0, 400)}`);
    return json.data;
  }
  throw new Error("GraphQL rate limited 5 times");
}

// Returns { projectId, fields: { [name]: { id, options: {name: optionId}, iterations: {title: id} } } }
export async function loadProject(owner, number) {
  const data = await graphql(
    `query($o:String!,$n:Int!){ user(login:$o){ projectV2(number:$n){ id fields(first:50){ nodes{
      ... on ProjectV2Field { id name }
      ... on ProjectV2SingleSelectField { id name options { id name } }
      ... on ProjectV2IterationField { id name configuration { iterations { id title startDate } completedIterations { id title startDate } } } } } } } }`,
    { o: owner, n: number },
  );
  const p = data.user.projectV2;
  const fields = {};
  for (const f of p.fields.nodes) {
    if (!f?.name) continue;
    fields[f.name] = {
      id: f.id,
      options: Object.fromEntries((f.options || []).map((o) => [o.name, o.id])),
      iterations: Object.fromEntries([...(f.configuration?.iterations || []), ...(f.configuration?.completedIterations || [])].map((i) => [i.title, i.id])),
    };
  }
  return { projectId: p.id, fields };
}

// Builds one aliased mutation that sets several field values on one project item.
export function fieldMutation(projectId, itemId, fields, values) {
  const parts = [];
  let i = 0;
  for (const [name, raw] of Object.entries(values)) {
    if (raw === undefined || raw === null || raw === "") continue;
    const f = fields[name];
    if (!f) throw new Error(`Unknown project field "${name}"`);
    let value;
    if (Object.keys(f.options).length) {
      if (!f.options[raw]) throw new Error(`Field "${name}" has no option "${raw}"`);
      value = `{singleSelectOptionId:"${f.options[raw]}"}`;
    } else if (Object.keys(f.iterations).length) {
      if (!f.iterations[raw]) throw new Error(`Iteration "${raw}" not found`);
      value = `{iterationId:"${f.iterations[raw]}"}`;
    } else if (typeof raw === "number") {
      value = `{number:${raw}}`;
    } else {
      value = `{text:${JSON.stringify(String(raw))}}`;
    }
    parts.push(`f${i++}: updateProjectV2ItemFieldValue(input:{projectId:"${projectId}",itemId:"${itemId}",fieldId:"${f.id}",value:${value}}){ clientMutationId }`);
  }
  return parts.length ? `mutation { ${parts.join("\n")} }` : null;
}
