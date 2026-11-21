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
for (const provider of providers) {
  for (const role of ['shape', 'build', 'review']) {
    const entry = provider?.roles?.[role];
    if (!entry || typeof entry !== 'object' || typeof entry.verified !== 'boolean' || typeof entry.record !== 'string') {
      problems.push(`provider ${provider?.name}: role ${role} is missing`);
    } else if (entry.verified && entry.record.trim() === '') {
      problems.push(`provider ${provider?.name}: role ${role} is verified with an empty record`);
    }
  }
}

if (problems.length > 0) {
  for (const problem of problems) console.log(problem);
  process.exit(1);
}
