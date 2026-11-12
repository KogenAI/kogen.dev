import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, rmSync } from 'node:fs';
import assert from 'node:assert/strict';

const require = createRequire(import.meta.url);
const { Given, Then } = require('@cucumber/cucumber');

let build;

// The production build is the two commands that the package.json build script chains:
// the Astro build, then the agent-content generator.
function run(command, args) {
  const result = spawnSync(command, args, { encoding: 'utf8', timeout: 120000 });
  return {
    command: `${command} ${args.join(' ')}`,
    status: result.status,
    signal: result.signal,
    error: result.error ? String(result.error) : '',
    output: `${result.stdout || ''}${result.stderr || ''}`,
  };
}

function ensureBuild() {
  if (!build) {
    rmSync('dist', { recursive: true, force: true });
    const steps = [run(process.execPath, ['node_modules/astro/bin/astro.mjs', 'build'])];
    if (steps[0].status === 0) steps.push(run('python3', ['scripts/build-agent-content.py']));
    build = steps;
  }
  return build;
}

function read(path) {
  assert.ok(existsSync(path), `learn-course: expected ${path} to exist after the production build`);
  return readFileSync(path, 'utf8');
}

function tags(html) {
  const head = html.slice(0, html.indexOf('</head>'));
  const found = [];
  for (const match of head.matchAll(/<(meta|link)\s([^>]*)>/g)) {
    const attributes = {};
    for (const attribute of match[2].matchAll(/([\w:-]+)="([^"]*)"/g)) attributes[attribute[1]] = attribute[2];
    found.push({ tag: match[1], attributes });
  }
  return found;
}

function locations(path) {
  return [...read(path).matchAll(/<loc>([^<]*)<\/loc>/g)].map((match) => match[1]);
}

function navigation(path) {
  const match = read(path).match(/<nav aria-label="Main navigation">([\s\S]*?)<\/nav>/);
  assert.ok(match, `learn-course: ${path} has no main navigation`);
  return [...match[1].matchAll(/<a href="([^"]*)">([^<]*)<\/a>/g)].map((link) => [link[1], link[2]]);
}

function mainElement(path) {
  const match = read(path).match(/<main\b[\s\S]*?<\/main>/);
  assert.ok(match, `learn-course: ${path} has no main element`);
  return match[0];
}

Given('learn-course: the production build is run with npm run build', { timeout: 280000 }, function () {
  const steps = ensureBuild();
  for (const step of steps) {
    assert.equal(
      step.status,
      0,
      `learn-course: ${step.command} exited with ${step.status} (signal ${step.signal}) ${step.error}\n${step.output.slice(-3000)}`,
    );
  }
  assert.equal(steps.length, 2, 'learn-course: the agent-content generator did not run after the Astro build');
});

Given('learn-course: the expected main navigation is:', function (table) {
  this.expectedNavigation = table.raw();
});

Then('learn-course: these built files exist:', function (table) {
  const missing = table.raw().flat().filter((path) => !existsSync(path));
  assert.deepEqual(missing, [], `learn-course: built files missing after the production build: ${missing.join(', ')}`);
});

Then('learn-course: the main element of {string} is:', function (path, expected) {
  assert.equal(mainElement(path), expected.trim());
});

Then('learn-course: the main element of {string} has these links:', function (path, table) {
  const links = [...mainElement(path).matchAll(/<a\b[^>]*\bhref="([^"]*)"/g)].map((match) => match[1]);
  assert.deepEqual(links, table.raw().flat(), `learn-course: links in the main element of ${path}`);
});

Then('learn-course: {string} contains none of these words:', function (path, table) {
  const content = read(path).toLowerCase();
  const present = table.raw().flat().filter((word) => content.includes(word.toLowerCase()));
  assert.deepEqual(present, [], `learn-course: ${path} contains forbidden words: ${present.join(', ')}`);
});

Then('learn-course: {string} has these head tags:', function (path, table) {
  const html = read(path);
  const found = tags(html);
  for (const [selector, attribute, expected] of table.raw()) {
    if (selector === 'title') {
      const title = html.match(/<title>([^<]*)<\/title>/);
      assert.equal(title && title[1], expected, `learn-course: title of ${path}`);
      continue;
    }
    const parsed = selector.match(/^(\w+)\[([\w:-]+)=([^\]]+)\]$/);
    assert.ok(parsed, `learn-course: unsupported selector ${selector}`);
    const matches = found.filter((entry) => entry.tag === parsed[1] && entry.attributes[parsed[2]] === parsed[3]);
    assert.equal(matches.length, 1, `learn-course: ${path} should have exactly one ${selector}, found ${matches.length}`);
    assert.equal(matches[0].attributes[attribute], expected, `learn-course: ${attribute} of ${selector} in ${path}`);
  }
});

Then('learn-course: each of these pages has exactly that main navigation:', function (table) {
  assert.ok(this.expectedNavigation, 'learn-course: the expected main navigation was not set');
  for (const path of table.raw().flat()) {
    assert.deepEqual(navigation(path), this.expectedNavigation, `learn-course: main navigation of ${path}`);
  }
});

Then('learn-course: the sitemap {string} begins with these locations:', function (path, table) {
  const expected = table.raw().flat();
  assert.deepEqual(locations(path).slice(0, expected.length), expected, `learn-course: first sitemap locations in ${path}`);
});

Then('learn-course: the sitemap {string} ends with these locations:', function (path, table) {
  const expected = table.raw().flat();
  assert.deepEqual(locations(path).slice(-expected.length), expected, `learn-course: last sitemap locations in ${path}`);
});

Then('learn-course: the sitemap {string} has no duplicate locations', function (path) {
  const all = locations(path);
  const duplicates = all.filter((location, index) => all.indexOf(location) !== index);
  assert.deepEqual(duplicates, [], `learn-course: duplicate sitemap locations in ${path}`);
});

Then('learn-course: the Markdown file {string} is:', function (path, expected) {
  assert.equal(read(path), `${expected.trim()}\n`);
});

Then('learn-course: {string} and {string} are identical', function (first, second) {
  assert.equal(read(first), read(second), `learn-course: ${first} differs from ${second}`);
});
