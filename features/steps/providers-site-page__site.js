import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const require = createRequire(import.meta.url);
const { Given, Then } = require('@cucumber/cucumber');

const P = 'providers-site-page';
const NAMES = 'src/data/cli-provider-names.txt';
let build;

function run(command, args) {
  const result = spawnSync(command, args, { encoding: 'utf8', timeout: 250000 });
  return {
    command: `${command} ${args.join(' ')}`,
    status: result.status,
    signal: result.signal,
    error: result.error ? String(result.error) : '',
    output: `${result.stdout || ''}${result.stderr || ''}`,
  };
}

function read(path) {
  assert.ok(existsSync(path), `${P}: expected ${path} to exist`);
  return readFileSync(path, 'utf8');
}

function decode(text) {
  return text
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

function plain(html) {
  return decode(html.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
}

function mainElement(path) {
  const match = read(path).match(/<main\b[\s\S]*?<\/main>/);
  assert.ok(match, `${P}: ${path} has no main element`);
  return match[0];
}

// The provider list is the array of objects that each carry a string name; found at any depth.
function findProviderArray(node) {
  if (Array.isArray(node)) {
    if (node.length > 0 && node.every((item) => item && typeof item === 'object' && typeof item.name === 'string')) return node;
    for (const item of node) {
      const found = findProviderArray(item);
      if (found) return found;
    }
  } else if (node && typeof node === 'object') {
    for (const value of Object.values(node)) {
      const found = findProviderArray(value);
      if (found) return found;
    }
  }
  return null;
}

// A role entry is any object with its own verified and record fields.
function roleEntries(node, out = []) {
  if (Array.isArray(node)) node.forEach((item) => roleEntries(item, out));
  else if (node && typeof node === 'object') {
    if ('verified' in node && 'record' in node) out.push(node);
    Object.values(node).forEach((value) => roleEntries(value, out));
  }
  return out;
}

function providers(dataPath) {
  const list = findProviderArray(JSON.parse(read(dataPath)));
  assert.ok(list, `${P}: ${dataPath} has no list of providers with names`);
  return list;
}

const hasRecord = (entry) => String(entry.record ?? '').trim() !== '';

function buildWithMutatedData(dataPath, mutate) {
  const original = read(dataPath);
  try {
    const data = JSON.parse(original);
    mutate(data);
    writeFileSync(dataPath, JSON.stringify(data, null, 2));
    return run('npm', ['run', 'build']);
  } finally {
    writeFileSync(dataPath, original);
  }
}

Given('providers-site-page: the production build is run with npm run build', { timeout: 280000 }, function () {
  if (!build) {
    rmSync('dist', { recursive: true, force: true });
    build = run('npm', ['run', 'build']);
  }
  assert.equal(build.status, 0, `${P}: ${build.command} exited with ${build.status} (signal ${build.signal}) ${build.error}\n${build.output.slice(-3000)}`);
});

Then('providers-site-page: these built files exist:', function (table) {
  const missing = table.raw().flat().filter((path) => !existsSync(path));
  assert.deepEqual(missing, [], `${P}: built files missing after npm run build: ${missing.join(', ')}`);
});

Then('providers-site-page: the text of {string} contains:', function (path, table) {
  const text = plain(read(path));
  const missing = table.raw().flat().filter((expected) => !text.includes(expected));
  assert.deepEqual(missing, [], `${P}: the text of ${path} lacks: ${missing.join(' | ')}`);
});

Then('providers-site-page: the QwenCloud subsection of {string} follows the OpenAI-compatible text, precedes {string} and links to {string}', function (path, nextHeading, link) {
  const html = read(path);
  const start = html.search(/<h3[^>]*>\s*QwenCloud\s*<\/h3>/);
  assert.ok(start >= 0, `${P}: ${path} has no h3 headed QwenCloud`);
  const before = plain(html.slice(0, start));
  assert.ok(before.includes('OpenAI-compatible login asks for the endpoint'), `${P}: QwenCloud subsection does not follow the OpenAI-compatible text in ${path}`);
  const next = html.slice(start).search(/<h2[^>]*>/);
  assert.ok(next > 0, `${P}: no h2 follows the QwenCloud subsection in ${path}`);
  const section = html.slice(start, start + next);
  assert.ok(plain(html.slice(start + next)).startsWith(nextHeading), `${P}: the heading after the QwenCloud subsection is not ${nextHeading}`);
  assert.ok(section.includes(`href="${link}"`), `${P}: the QwenCloud subsection of ${path} has no link to ${link}`);
});

Then('providers-site-page: the main element of {string} contains no emoji', function (path) {
  const found = [...mainElement(path).matchAll(/\p{Extended_Pictographic}/gu)].map((match) => match[0]);
  assert.deepEqual(found, [], `${P}: emoji in ${path}`);
});

Then('providers-site-page: the CLI provider names fixture lists exactly:', function (table) {
  const names = read(NAMES).split('\n').filter((line) => line.trim() !== '');
  assert.deepEqual(names, table.raw().flat(), `${P}: ${NAMES}`);
});

Then('providers-site-page: the table in {string} has a row for every provider in the data file {string}', function (path, dataPath) {
  const html = mainElement(path);
  const rows = [...html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/g)].map((row) => [...row[1].matchAll(/<(t[dh])\b[^>]*>([\s\S]*?)<\/\1>/g)].map((cell) => cell[2]));
  assert.ok(rows.length > 0, `${P}: ${path} has no table rows`);
  const header = rows[0].map((cell) => plain(cell).toLowerCase()).join(' | ');
  for (const column of ['account or key needed', 'roles verified', 'built in or custom', 'instructions']) {
    assert.ok(header.includes(column), `${P}: header row of ${path} lacks the column ${column}: ${header}`);
  }
  const expected = providers(dataPath);
  assert.equal(rows.length - 1, expected.length, `${P}: ${path} has ${rows.length - 1} provider rows, expected ${expected.length}: ${expected.map((p) => p.name).join(', ')}`);
  expected.forEach((provider, index) => {
    const cells = rows[index + 1];
    assert.ok(cells.length >= 5, `${P}: row ${index + 1} of ${path} has ${cells.length} cells`);
    assert.equal(plain(cells[0]), provider.name, `${P}: provider name in row ${index + 1} of ${path}`);
    assert.match(cells[cells.length - 1], /<a\b[^>]*\bhref="[^"]+"/, `${P}: the instructions cell for ${provider.name} has no link`);
    const rolesCell = rows[0].findIndex((cell) => plain(cell).toLowerCase().includes('roles verified'));
    const shown = (plain(cells[rolesCell]).replace(/\bnot (qualified|verified)\b/gi, '').match(/\bverified\b/gi) || []).length;
    const verifiedRoles = roleEntries(provider).filter(hasRecord).length;
    assert.equal(shown, verifiedRoles, `${P}: the roles verified cell for ${provider.name} shows ${shown} verified roles, but ${verifiedRoles} roles have a non-empty record: ${plain(cells[rolesCell])}`);
  });
});

Then('providers-site-page: the provider names in the data file {string} equal the names in the fixture {string}', function (dataPath, namesPath) {
  const names = read(namesPath).split('\n').filter((line) => line.trim() !== '');
  assert.deepEqual(providers(dataPath).map((provider) => provider.name), names, `${P}: ${dataPath} names versus ${namesPath}`);
});

Then('providers-site-page: no role in the data file {string} is verified with an empty record', function (dataPath) {
  const entries = roleEntries(JSON.parse(read(dataPath)));
  assert.ok(entries.length > 0, `${P}: ${dataPath} has no role entries with verified and record fields`);
  const bad = entries.filter((entry) => entry.verified && !hasRecord(entry));
  assert.deepEqual(bad, [], `${P}: roles verified with an empty record in ${dataPath}`);
});

Then('providers-site-page: npm run build fails for a copy of the data file {string} without the provider {string}', { timeout: 280000 }, function (dataPath, name) {
  const result = buildWithMutatedData(dataPath, (data) => {
    const list = findProviderArray(data);
    const index = list.findIndex((provider) => provider.name === name);
    assert.ok(index >= 0, `${P}: ${dataPath} has no provider ${name}`);
    list.splice(index, 1);
  });
  assert.notEqual(result.status, 0, `${P}: ${result.command} succeeded without the provider ${name} in ${dataPath}`);
});

Then('providers-site-page: npm run build fails when the data file {string} marks a role verified with an empty record', { timeout: 280000 }, function (dataPath) {
  const result = buildWithMutatedData(dataPath, (data) => {
    const target = roleEntries(data).find((entry) => !entry.verified && !hasRecord(entry));
    assert.ok(target, `${P}: ${dataPath} has no unverified role to mark`);
    target.verified = true;
    target.record = '';
  });
  assert.notEqual(result.status, 0, `${P}: ${result.command} succeeded with a role verified and an empty record in ${dataPath}`);
});

Then('providers-site-page: both {string} and {string} link to {string}', function (first, second, link) {
  for (const path of [first, second]) {
    assert.ok(read(path).includes(link), `${P}: ${path} does not link to ${link}`);
  }
  assert.ok(read(second).includes(`href="${link}"`), `${P}: ${second} has no href to ${link}`);
});

Then('providers-site-page: {string} lists {string} exactly once', function (path, url) {
  const locations = [...read(path).matchAll(/<loc>([^<]*)<\/loc>/g)].map((match) => match[1]);
  assert.equal(locations.filter((location) => location === url).length, 1, `${P}: ${path} lists ${url} ${locations.filter((location) => location === url).length} times`);
});

Then('providers-site-page: the head of {string} offers the Markdown twin {string}', function (path, href) {
  const html = read(path);
  const head = html.slice(0, html.indexOf('</head>'));
  const offered = [...head.matchAll(/<link\s([^>]*)>/g)].some((match) => /rel="alternate"/.test(match[1]) && /type="text\/markdown"/.test(match[1]) && match[1].includes(`href="${href}"`));
  assert.ok(offered, `${P}: ${path} has no alternate text/markdown link to ${href}`);
});
