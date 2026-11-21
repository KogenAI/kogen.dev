import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const require = createRequire(import.meta.url);
const { Given, Then } = require('@cucumber/cucumber');

const P = 'kogen-dev-build-meta-one-build';
const BASE = 'src/layouts/Base.astro';
const FORTY = 'a'.repeat(40);
let build;
let baseText;
let checked;

function htmlFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...htmlFiles(path));
    else if (entry.name.endsWith('.html')) out.push(path);
  }
  return out.sort();
}

// Attributes of one opening tag; the first token is the tag name and is skipped.
function attributes(tag) {
  const attrs = {};
  let first = true;
  for (const m of tag.matchAll(/([a-zA-Z_:][-\w:.]*)(?:=(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) {
    if (first) {
      first = false;
      continue;
    }
    attrs[m[1]] = m[2] ?? m[3] ?? m[4] ?? '';
  }
  return attrs;
}

function contains(got, wanted) {
  return Object.entries(wanted).every(([k, v]) => got[k] === v);
}

// The site header is the header element Base.astro writes: the header together with its main navigation.
function siteHeader() {
  const base = readFileSync(BASE, 'utf8');
  const match = base.match(/<header\b[^>]*>[\s\S]*?<\/header>/);
  assert.ok(match, `${P}: ${BASE} contains no header element`);
  const open = match[0].match(/^<header\b[^>]*>/)[0];
  const nav = match[0].match(/<nav\b[^>]*>/);
  assert.ok(nav, `${P}: the header element in ${BASE} contains no nav element`);
  return { header: attributes(open), nav: attributes(nav[0]) };
}

function hasSiteHeader(html, wanted) {
  for (const m of html.matchAll(/<header\b[^>]*>[\s\S]*?<\/header>/g)) {
    const open = m[0].match(/^<header\b[^>]*>/)[0];
    if (!contains(attributes(open), wanted.header)) continue;
    for (const nav of m[0].matchAll(/<nav\b[^>]*>/g)) {
      if (contains(attributes(nav[0]), wanted.nav)) return true;
    }
  }
  return false;
}

Given('kogen-dev-build-meta-one-build: the site is built once with CF_PAGES_COMMIT_SHA set to forty copies of the letter a using the build script command from package.json', { timeout: 280000 }, function () {
  if (!build) {
    const command = JSON.parse(readFileSync('package.json', 'utf8')).scripts.build;
    assert.ok(command, `${P}: package.json has no build script`);
    rmSync('dist', { recursive: true, force: true });
    const bins = [resolve('node_modules/.bin'), dirname(process.execPath)];
    const result = spawnSync('sh', ['-c', command], {
      encoding: 'utf8',
      timeout: 270000,
      env: { ...process.env, CF_PAGES_COMMIT_SHA: FORTY, PATH: `${bins.join(':')}:${process.env.PATH || ''}` },
    });
    build = { command, status: result.status, signal: result.signal, error: result.error ? String(result.error) : '', output: `${result.stdout || ''}${result.stderr || ''}` };
  }
});

Then('kogen-dev-build-meta-one-build: the build exited with status 0', function () {
  assert.ok(build, `${P}: build did not run`);
  assert.equal(build.status, 0, `${P}: build command "${build.command}" exited with ${build.status} (signal ${build.signal}) ${build.error}\n${build.output.slice(-3000)}`);
});

Then('kogen-dev-build-meta-one-build: every html file containing the site header has exactly one kogen-build meta tag with the forty letters', function () {
  assert.ok(existsSync('dist'), `${P}: dist/ does not exist after the build`);
  const wanted = siteHeader();
  checked = [];
  const problems = [];
  for (const file of htmlFiles('dist')) {
    const html = readFileSync(file, 'utf8');
    if (!hasSiteHeader(html, wanted)) continue;
    checked.push(file);
    const tags = [...html.matchAll(/<meta\b[^>]*>/g)].map((m) => m[0]).filter((tag) => attributes(tag).name === 'kogen-build');
    if (tags.length !== 1) {
      problems.push(`${file}: ${tags.length} kogen-build meta tags`);
      continue;
    }
    const content = attributes(tags[0]).content;
    if (content !== FORTY) problems.push(`${file}: kogen-build content is ${JSON.stringify(content)}`);
  }
  assert.ok(checked.length > 0, `${P}: no html file under dist contains the site header ${JSON.stringify(wanted)}`);
  assert.deepEqual(problems, [], `${P}: kogen-build problems in ${checked.length} html files with the site header:\n${problems.join('\n')}`);
});

Then('kogen-dev-build-meta-one-build: the checked html files include the home, Get started, Learn, Notes, Announcements and Origins pages', function () {
  assert.ok(checked, `${P}: the html files were not checked`);
  const need = ['index.html', 'get-started/index.html', 'learn/index.html', 'notes/index.html', 'announcements/index.html', 'origins/index.html'].map((p) => join('dist', p));
  const missing = need.filter((p) => !checked.includes(p));
  assert.deepEqual(missing, [], `${P}: these pages are not among the ${checked.length} checked files with the site header: ${missing.join(', ')}`);
});

Given('kogen-dev-build-meta-one-build: Base.astro is read as text without a build', function () {
  baseText = readFileSync(BASE, 'utf8');
});

Then('kogen-dev-build-meta-one-build: Base.astro contains the text CF_PAGES_COMMIT_SHA', function () {
  assert.ok(baseText.includes('CF_PAGES_COMMIT_SHA'), `${P}: ${BASE} does not contain CF_PAGES_COMMIT_SHA`);
});

Then('kogen-dev-build-meta-one-build: the text name="kogen-build" appears exactly once in Base.astro', function () {
  const count = baseText.split('name="kogen-build"').length - 1;
  assert.equal(count, 1, `${P}: name="kogen-build" appears ${count} times in ${BASE}`);
});

Then('kogen-dev-build-meta-one-build: the line holding the kogen-build tag is the line directly after the viewport meta line', function () {
  const lines = baseText.split('\n');
  const viewport = lines.map((l, i) => (l.includes('name="viewport"') ? i : -1)).filter((i) => i >= 0);
  assert.equal(viewport.length, 1, `${P}: ${viewport.length} lines hold the viewport meta in ${BASE}`);
  const tagLine = lines[viewport[0] + 1] || '';
  assert.ok(tagLine.includes('name="kogen-build"'), `${P}: the line after the viewport meta (line ${viewport[0] + 1}) does not hold the kogen-build tag: ${tagLine.slice(0, 120)}`);
});

function contentFor(env) {
  const lines = baseText.split('\n');
  const tagLine = lines.find((l) => l.includes('name="kogen-build"')) || '';
  const m = tagLine.match(/\bcontent=\{(.*)\}\s*\/?>/) || tagLine.match(/\bcontent=\{([^}]*)\}/);
  assert.ok(m, `${P}: the kogen-build tag has no content={...} expression: ${tagLine.slice(0, 160)}`);
  let expr = m[1].trim();
  if (/^[A-Za-z_$][\w$]*$/.test(expr)) {
    const decl = baseText.match(new RegExp(`(?:const|let|var)\\s+${expr.replace('$', '\\$')}\\s*=\\s*([^\\n]*?);?\\s*(?:\\n|$)`));
    assert.ok(decl, `${P}: no declaration of ${expr} found in the ${BASE} frontmatter`);
    expr = decl[1].replace(/;\s*$/, '');
  }
  expr = expr.replace(/import\.meta\.env/g, '__env');
  const sandbox = { process: { env }, __env: env };
  return vm.runInNewContext(`(${expr})`, sandbox, { timeout: 2000 });
}

Then('kogen-dev-build-meta-one-build: the kogen-build content expression gives the commit when set and local when unset or empty', function () {
  assert.equal(contentFor({}), 'local', `${P}: unset CF_PAGES_COMMIT_SHA must give local`);
  assert.equal(contentFor({ CF_PAGES_COMMIT_SHA: '' }), 'local', `${P}: empty CF_PAGES_COMMIT_SHA must give local`);
  assert.equal(contentFor({ CF_PAGES_COMMIT_SHA: FORTY }), FORTY, `${P}: set CF_PAGES_COMMIT_SHA must give its value`);
});
