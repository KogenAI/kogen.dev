import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, rmSync } from 'node:fs';
import assert from 'node:assert/strict';

const require = createRequire(import.meta.url);
const { Given, Then } = require('@cucumber/cucumber');

const P = 'site-provider-role-claims-need-evidence';
const PREFIX = 'https://app.kogen.studio/workspaces/optimum/projects/kogen/documents/';
const SCREEN = 'providers-role-screen-20261120';
const QWEN_DOC = 'qwen-build-vs-sonnet-20261118';
const RECORD = 'spec/reference/model-family-qualification.md';
const STATES = ['configurable', 'connection tested', 'role verified'];
const ROLES = ['shape', 'build', 'review'];
let build;

const configurable = () => ({ state: 'configurable', doc: SCREEN });
const roleVerified = (model, effort) => ({ state: 'role verified', model, effort, record: RECORD, doc: SCREEN });
const EXPECTED = {
  chatgpt: { shape: roleVerified('gpt-6.1-sol', 'high'), build: roleVerified('gpt-6.1-sol', 'medium'), review: roleVerified('gpt-6.1-sol', 'high') },
  anthropic: { shape: configurable(), build: configurable(), review: roleVerified('claude-sonnet-5-5', 'medium') },
  supergrok: { shape: configurable(), build: configurable(), review: configurable() },
  'opencode-go': { shape: configurable(), build: configurable(), review: configurable() },
  'claude-code': { shape: configurable(), build: configurable(), review: configurable() },
  qwencloud: { shape: configurable(), build: { state: 'connection tested', model: 'qwen4-max', effort: 'medium', date: '2026-11-18', doc: QWEN_DOC }, review: configurable() },
};

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

// Visible text: inline tags vanish without a space, other tags become one space.
function plain(html) {
  return decode(
    html
      .replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<\/?(a|span|strong|em|code|b|i|small|mark|abbr|time)\b[^>]*>/gi, '')
      .replace(/<[^>]*>/g, ' '),
  ).replace(/\s+/g, ' ').trim();
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

// Five providers are identified by name; QwenCloud is the entry named qwencloud or linked to #qwencloud.
function providerKey(provider) {
  if (Object.keys(EXPECTED).includes(provider.name)) return provider.name;
  if (provider.name === 'openai-compatible' || String(provider?.instructions?.href ?? '').endsWith('#qwencloud')) return 'qwencloud';
  return provider.name;
}

const strings = (entry) => Object.entries(entry).filter(([, value]) => typeof value === 'string');

// Field names are the builder's choice, so every field is located by its value.
function validateData(data) {
  const problems = [];
  const list = findProviderArray(data);
  if (!list) return [`${P}: no list of providers with names`];
  const byKey = new Map(list.map((provider) => [providerKey(provider), provider]));
  assert.ok(true);
  if (list.length !== 6) problems.push(`expected 6 providers, found ${list.length}`);
  for (const [key, roles] of Object.entries(EXPECTED)) {
    const provider = byKey.get(key);
    if (!provider) {
      problems.push(`provider ${key} is missing`);
      continue;
    }
    for (const role of ROLES) {
      const want = roles[role];
      const entry = provider.roles?.[role];
      const label = `${key} ${role}`;
      if (!entry || typeof entry !== 'object') {
        problems.push(`${label}: no role entry`);
        continue;
      }
      const values = strings(entry).map(([, value]) => value);
      const states = values.filter((value) => STATES.includes(value));
      if (states.length !== 1 || states[0] !== want.state) problems.push(`${label}: state is ${JSON.stringify(states)}, expected ${want.state}`);
      if (!values.includes(PREFIX + want.doc)) problems.push(`${label}: no evidence link ${PREFIX}${want.doc}`);
      for (const field of ['model', 'effort', 'record', 'date']) {
        if (want[field] !== undefined && !values.includes(want[field])) problems.push(`${label}: no value ${want[field]} for ${field}`);
      }
    }
  }
  return problems;
}

function rolesCellOf(row) {
  const cells = [...row.matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/g)].map((cell) => cell[1]);
  const found = cells.filter((cell) => plain(cell).includes('Shape:'));
  return { cells, rolesCell: found.length === 1 ? found[0] : null };
}

// Splits a roles cell at Shape:, Build: and Review: in that order.
function roleSegments(cellHtml, where) {
  const marks = ['Shape:', 'Build:', 'Review:'].map((mark) => cellHtml.indexOf(mark));
  assert.ok(marks.every((mark) => mark >= 0) && marks[0] < marks[1] && marks[1] < marks[2], `${P}: ${where} lacks Shape:, Build:, Review: in order: ${plain(cellHtml)}`);
  return { shape: cellHtml.slice(marks[0], marks[1]), build: cellHtml.slice(marks[1], marks[2]), review: cellHtml.slice(marks[2]) };
}

function providerRows(path) {
  const rows = [...mainElement(path).matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/g)].map((row) => row[1]).filter((row) => /<td\b/.test(row));
  assert.equal(rows.length, 6, `${P}: ${path} has ${rows.length} provider rows, expected 6`);
  return rows;
}

Given('site-provider-role-claims-need-evidence: the production build is run with npm run build', { timeout: 280000 }, function () {
  if (!build) {
    rmSync('dist', { recursive: true, force: true });
    build = run('npm', ['run', 'build']);
  }
  assert.equal(build.status, 0, `${P}: ${build.command} exited with ${build.status} (signal ${build.signal}) ${build.error}\n${build.output.slice(-3000)}`);
});

Then('site-provider-role-claims-need-evidence: the file {string} contains:', function (path, table) {
  const text = plain(read(path));
  const missing = table.raw().flat().filter((expected) => !text.includes(expected));
  assert.deepEqual(missing, [], `${P}: the text of ${path} lacks: ${missing.join(' | ')}`);
});

Then('site-provider-role-claims-need-evidence: the file {string} contains none of:', function (path, table) {
  const raw = read(path);
  const text = plain(raw);
  const present = table.raw().flat().filter((unwanted) => text.includes(unwanted) || raw.includes(unwanted));
  assert.deepEqual(present, [], `${P}: ${path} still contains: ${present.join(' | ')}`);
});

Then('site-provider-role-claims-need-evidence: the file {string} has the text {string} inside a link to {string}', function (path, label, href) {
  const anchors = [...read(path).matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)];
  const hit = anchors.some((anchor) => anchor[1].includes(`href="${href}"`) && plain(anchor[2]).includes(label));
  assert.ok(hit, `${P}: ${path} has no link with href ${href} around the text ${label}`);
});

Then('site-provider-role-claims-need-evidence: the QwenCloud example line in {string} has effort medium and not high', function (path) {
  const marker = 'base_url: https://token-plan.maas.qwencloudapi.com/compatible-mode/v1';
  const blocks = [...read(path).matchAll(/<code\b[^>]*>([\s\S]*?)<\/code>/g)].map((block) => decode(block[1].replace(/<[^>]*>/g, ''))).filter((block) => block.includes(marker));
  assert.equal(blocks.length, 1, `${P}: ${path} has ${blocks.length} code blocks with ${marker}`);
  const lines = blocks[0].split('\n').filter((line) => line.includes(marker));
  assert.equal(lines.length, 1, `${P}: the QwenCloud example line is not a single line: ${blocks[0]}`);
  assert.ok(lines[0].includes('model: qwen4-max'), `${P}: example line lacks model: qwen4-max: ${lines[0]}`);
  assert.ok(lines[0].includes('effort: medium'), `${P}: example line lacks effort: medium: ${lines[0]}`);
  assert.ok(!lines[0].includes('high'), `${P}: example line still contains high: ${lines[0]}`);
});

Then('site-provider-role-claims-need-evidence: the data file {string} has the fixed states of the 18 provider and role pairs', function (path) {
  assert.deepEqual(validateData(JSON.parse(read(path))), [], `${P}: ${path} does not match the fixed states`);
});

Then('site-provider-role-claims-need-evidence: a copy of the data file {string} with one supergrok role set to connection tested is rejected', function (path) {
  const data = JSON.parse(read(path));
  assert.deepEqual(validateData(JSON.parse(JSON.stringify(data))), [], `${P}: the real ${path} must pass before the fixture is judged`);
  const supergrok = findProviderArray(data).find((provider) => provider.name === 'supergrok');
  assert.ok(supergrok, `${P}: ${path} has no provider supergrok`);
  const entry = supergrok.roles?.shape;
  const field = entry && strings(entry).find(([, value]) => STATES.includes(value));
  assert.ok(field, `${P}: supergrok shape in ${path} has no field holding one of ${STATES.join(', ')}`);
  entry[field[0]] = 'connection tested';
  assert.notDeepEqual(validateData(data), [], `${P}: the fixture with supergrok shape connection tested was accepted`);
});

Then('site-provider-role-claims-need-evidence: a copy of the data file {string} with one role verified entry lacking its model is rejected', function (path) {
  const data = JSON.parse(read(path));
  assert.deepEqual(validateData(JSON.parse(JSON.stringify(data))), [], `${P}: the real ${path} must pass before the fixture is judged`);
  const chatgpt = findProviderArray(data).find((provider) => provider.name === 'chatgpt');
  assert.ok(chatgpt, `${P}: ${path} has no provider chatgpt`);
  const entry = chatgpt.roles?.shape;
  const field = entry && strings(entry).find(([, value]) => value === 'gpt-6.1-sol');
  assert.ok(field, `${P}: chatgpt shape in ${path} has no field holding gpt-6.1-sol`);
  delete entry[field[0]];
  assert.notDeepEqual(validateData(data), [], `${P}: the fixture with a role verified entry lacking its model was accepted`);
});

Then('site-provider-role-claims-need-evidence: the Roles cells in {string} show the fixed states with their evidence links', function (path) {
  const counts = { configurable: 0, 'connection tested': 0, 'role verified': 0 };
  for (const row of providerRows(path)) {
    const { cells, rolesCell } = rolesCellOf(row);
    assert.ok(cells.length > 0 && rolesCell, `${P}: a row of ${path} has no single roles cell containing Shape:`);
    const name = plain(cells[0]);
    const key = Object.keys(EXPECTED).includes(name) ? name : name === 'openai-compatible' ? 'qwencloud' : null;
    assert.ok(key, `${P}: ${path} has a row for unknown provider ${name}`);
    const segments = roleSegments(rolesCell, `${name} in ${path}`);
    for (const role of ROLES) {
      const want = EXPECTED[key][role];
      const roleName = role[0].toUpperCase() + role.slice(1);
      const text = plain(segments[role]);
      const where = `${name} ${role} in ${path}: ${text}`;
      const head = want.state === 'role verified' ? `${roleName}: role verified (${want.model}, ${want.effort})` : `${roleName}: ${want.state}`;
      assert.ok(text.startsWith(head), `${P}: cell must start with ${head}; ${where}`);
      const rest = text.slice(head.length);
      for (const other of [...STATES, 'not qualified', 'verified']) {
        assert.ok(!rest.includes(other), `${P}: cell has a second state or bare ${other}; ${where}`);
      }
      if (want.state !== 'role verified') assert.ok(!rest.trimStart().startsWith('(') || want.state === 'connection tested', `${P}: only role verified shows model and effort first; ${where}`);
      const link = `${PREFIX}${want.doc}`;
      assert.ok(new RegExp(`<a\\b[^>]*\\bhref="${link}"`).test(segments[role]), `${P}: no evidence link ${link}; ${where}`);
      counts[want.state] += 1;
    }
  }
  assert.deepEqual(counts, { configurable: 13, 'connection tested': 1, 'role verified': 4 }, `${P}: state counts in ${path}`);
});

Then('site-provider-role-claims-need-evidence: the word verified occurs in {string} only inside the phrase role verified', function (path) {
  const html = read(path);
  const all = (html.match(/verified/gi) || []).length;
  const inPhrase = (html.match(/\brole verified\b/gi) || []).length;
  assert.equal(all, inPhrase, `${P}: ${path} has ${all} occurrences of verified but ${inPhrase} of the phrase role verified; contexts: ${[...html.matchAll(/.{0,30}verified.{0,30}/gi)].map((m) => m[0].replace(/\s+/g, ' ')).join(' | ')}`);
});

Then('site-provider-role-claims-need-evidence: each role verified cell in {string} names a model and an effort', function (path) {
  const found = [];
  for (const row of providerRows(path)) {
    const { rolesCell } = rolesCellOf(row);
    assert.ok(rolesCell, `${P}: a row of ${path} has no single roles cell`);
    const segments = roleSegments(rolesCell, path);
    for (const role of ROLES) {
      const text = plain(segments[role]);
      if (text.includes('role verified')) found.push(text);
    }
  }
  assert.equal(found.length, 4, `${P}: ${path} has ${found.length} role verified cells, expected 4`);
  for (const text of found) {
    assert.match(text, /^(Shape|Build|Review): role verified \(([^,()]+), ([^,()]+)\)/, `${P}: role verified cell lacks model and effort: ${text}`);
  }
});
