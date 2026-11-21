// Usage: node scripts/check-providers.mjs [providers.json] [cli-provider-names.txt]
import { readFileSync } from 'node:fs';

const dataPath = process.argv[2] ?? 'src/data/providers.json';
const namesPath = process.argv[3] ?? 'src/data/cli-provider-names.txt';
const problems = [];

let providers = [];
let names = [];
try {
  const data = JSON.parse(readFileSync(dataPath, 'utf8'));
  providers = Array.isArray(data?.providers) ? data.providers : [];
  if (!Array.isArray(data?.providers)) problems.push(`${dataPath}: "providers" is not a list`);
  names = readFileSync(namesPath, 'utf8').split('\n').map((line) => line.trim()).filter(Boolean);
} catch (error) {
  problems.push(`cannot read provider files: ${error.message}`);
}

const providerNames = providers.map((provider) => provider?.name);
for (const name of names) {
  if (!providerNames.includes(name)) problems.push(`CLI provider name ${name} has no provider in ${dataPath}`);
}
for (const name of providerNames) {
  if (!names.includes(name)) problems.push(`provider ${name} is not a CLI provider name in ${namesPath}`);
}
const states = ['configurable', 'connection tested', 'role verified'];
const evidencePrefix = 'https://app.kogen.studio/workspaces/optimum/projects/kogen/documents/';
const filled = (value) => typeof value === 'string' && value.trim() !== '';
for (const provider of providers) {
  for (const role of ['shape', 'build', 'review']) {
    const entry = provider?.roles?.[role];
    const where = `provider ${provider?.name}: role ${role}`;
    if (!entry || typeof entry !== 'object') {
      problems.push(`${where} is missing`);
      continue;
    }
    if (!states.includes(entry.state)) problems.push(`${where} has no valid state`);
    if (!filled(entry.evidence) || !entry.evidence.startsWith(evidencePrefix)) problems.push(`${where} has no evidence link`);
    if (entry.state === 'role verified') {
      for (const field of ['model', 'effort', 'record']) {
        if (!filled(entry[field])) problems.push(`${where} is role verified without ${field}`);
      }
    }
    if (entry.state === 'connection tested') {
      for (const field of ['model', 'effort', 'date']) {
        if (!filled(entry[field])) problems.push(`${where} is connection tested without ${field}`);
      }
    }
  }
}

if (problems.length > 0) {
  for (const problem of problems) console.log(problem);
  process.exit(1);
}
