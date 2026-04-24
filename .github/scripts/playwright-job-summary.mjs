/**
 * Appends a Markdown job summary to GITHUB_STEP_SUMMARY from the Playwright JSON report.
 * Env: GITHUB_STEP_SUMMARY (set by the runner), PLAYWRIGHT_JSON_OUTPUT_FILE, MATRIX_WP, MATRIX_PHP.
 */
import { readFile, appendFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const jsonPath = process.env.PLAYWRIGHT_JSON_OUTPUT_FILE
  || 'tests/playwright/test-results/github-summary-source.json';
const summaryFile = process.env.GITHUB_STEP_SUMMARY;

const md = (s) => String(s ?? '')
  .replaceAll('|', '\\|')
  .replaceAll('\n', ' ');

const wp = process.env.MATRIX_WP || '—';
const php = process.env.MATRIX_PHP || '—';

if (!summaryFile) {
  console.warn('playwright-job-summary: GITHUB_STEP_SUMMARY is not set; skipping.');
  process.exit(0);
}

if (!existsSync(jsonPath)) {
  await appendFile(
    summaryFile,
    [
      `## Playwright — WordPress ${wp} · PHP ${php}`,
      '',
      '*No JSON report was written (the test run may have been interrupted or failed before reporting).*',
      '',
    ].join('\n'),
    'utf8',
  );
  process.exit(0);
}

let report;
try {
  report = JSON.parse(await readFile(jsonPath, 'utf8'));
} catch (e) {
  await appendFile(
    summaryFile,
    `## Playwright report parse error\n\n\`${md(e instanceof Error ? e.message : e)}\``,
    'utf8',
  );
  process.exit(0);
}

const { stats, suites = [] } = report;
const d = (stats && stats.duration) || 0;
const durationS = d >= 1000 ? `${(d / 1000).toFixed(1)} s` : `${d} ms`;
const s = stats || { expected: 0, unexpected: 0, skipped: 0, flaky: 0 };
const { expected, unexpected, skipped, flaky } = s;

const lines = [];
lines.push(`## Playwright — WordPress ${wp} · PHP ${php}`);
lines.push('');
lines.push('| Outcome   | Count |');
lines.push('|----------|------:|');
lines.push(`| Passed   | ${expected} |`);
lines.push(`| Failed   | ${unexpected} |`);
lines.push(`| Flaky    | ${flaky} |`);
lines.push(`| Skipped  | ${skipped} |`);
lines.push('');
lines.push(`*Duration (wall clock): ${durationS}*`);
lines.push('');

/** @typedef {{ file?: string, line?: number, title?: string, tests?: any[], specs?: any[], suites?: any[] }} SuiteLike */

/**
 * @param {SuiteLike} suite
 * @param {string[]} pathTitles
 * @param {Array<{ name: string, file: string, line: number, projectName: string, status: string, error: string }>} out
 */
function walkSuite(suite, pathTitles, out) {
  const next = suite.title
    ? [...pathTitles, suite.title]
    : pathTitles;
  for (const spec of suite.specs || []) {
    for (const test of spec.tests || []) {
      const file = (spec.file || spec.location?.file || suite.file || 'unknown') || 'unknown';
      const line = spec.line ?? spec.location?.line ?? 0;
      const projectName = (test && test.projectName) || '';
      const status = (test && test.status) || 'unknown';
      const errObj = (test && test.results && test.results[0] && test.results[0].error) || null;
      const err =
        (errObj && (errObj.message || (typeof errObj === 'string' ? errObj : JSON.stringify(errObj)))) || '';
      const name = [...next, spec.title || ''].filter(Boolean).join(' › ') || (spec.title || 'unnamed');
      out.push({
        name,
        file,
        line: typeof line === 'number' ? line : 0,
        projectName,
        status,
        error: (err && String(err).split('\n')[0]) || '',
      });
    }
  }
  for (const sub of suite.suites || [])
    walkSuite(sub, next, out);
}

const all = /** @type {any[]} */ ([]);
for (const top of suites)
  walkSuite(top, [], all);

const failed = all.filter(
  (t) => t.status === 'unexpected',
);
const flakyTests = all.filter((t) => t.status === 'flaky');

if (failed.length) {
  lines.push('### Failed');
  for (const t of failed) {
    const where = t.line ? `:${t.line}` : '';
    lines.push(`- **${md(t.name)}** [${t.projectName || '—'}] — \`${md(t.file)}${where}\``);
    if (t.error) lines.push(`  - \`${md(t.error.slice(0, 500))}\``);
  }
  lines.push('');
}

if (flakyTests.length) {
  lines.push('### Flaky');
  for (const t of flakyTests) {
    const where = t.line ? `:${t.line}` : '';
    lines.push(`- **${md(t.name)}** [${t.projectName || '—'}] — \`${md(t.file)}${where}\``);
  }
  lines.push('');
}

if (unexpected > 0 && !failed.length) {
  lines.push('*(The report counts failed tests, but the JSON could not be flattened into a row list. Check the job log and uploaded `test-results` artifacts.)*');
  lines.push('');
}

lines.push('---');
lines.push('');
lines.push('<details><summary>All test rows (per project / file)</summary>\n');
lines.push('');
lines.push('| Project | File | Test | Status |');
lines.push('|---------|------|------|--------|');
const cap = 200;
const rows = all.slice(0, cap);
for (const t of rows) {
  const where = t.line ? `:${t.line}` : '';
  lines.push(
    `| ${md(t.projectName || '—')} | \`${md(t.file)}${where}\` | ${md(t.name)} | ${t.status} |`,
  );
}
if (all.length > cap) lines.push(`\n*…${all.length - cap} more (truncated; open JSON artifact or use full list locally).*`);
lines.push('\n</details>\n');

await appendFile(summaryFile, lines.join('\n'), 'utf8');
