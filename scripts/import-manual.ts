/**
 * Fold manually collected readings into detector-results.json.
 *
 *   npm run import-manual -- --cycle 2026-10
 *
 * Three of the twelve detectors have no public API. Rather than drop them —
 * they are among the most used free tools, so their false-positive behaviour
 * matters more than most — two operators read each sample independently in the
 * web UI. Both readings are imported as run 1 and run 2, which means the
 * consistency metric measures inter-operator agreement for these tools and
 * repeat-call stability for the rest. That is a real difference and it is
 * recorded on the leaderboard row rather than papered over.
 */

import { readFileSync } from 'node:fs';
import { fail, info, heading, ok, readJson, repoPath, writeJson } from './lib/io.js';
import type { Reading, Sample } from './lib/types.js';

const arg = (name: string, fallback?: string): string => {
  const i = process.argv.indexOf(`--${name}`);
  const v = i === -1 ? undefined : process.argv[i + 1];
  if (v === undefined && fallback === undefined) throw new Error(`--${name} is required`);
  return v ?? (fallback as string);
};

function parseCsv(raw: string): Array<Record<string, string>> {
  const lines = raw.split(/\r?\n/).filter((l) => l.trim() && !l.startsWith('#'));
  const header = (lines.shift() as string).split(',').map((h) => h.trim());
  return lines.map((line) => {
    const cells = line.split(',').map((c) => c.trim());
    return Object.fromEntries(header.map((h, i) => [h, cells[i] ?? '']));
  });
}

function main(): void {
  const cycle = arg('cycle');
  const cycleDir = repoPath('data', 'cycles', cycle);
  const samples = readJson<Sample[]>(`${cycleDir}/samples.json`);
  const validIds = new Set(samples.map((s) => s.id));

  const registry = readJson<{ detectors: Array<{ slug: string; access: string }> }>(repoPath('detectors/registry.json'));
  const manual = registry.detectors.filter((d) => d.access === 'manual');

  let results: Reading[] = [];
  try {
    results = readJson<Reading[]>(`${cycleDir}/detector-results.json`);
  } catch {
    /* none yet */
  }

  heading(`Importing manual readings for cycle ${cycle}`);
  let imported = 0;

  for (const detector of manual) {
    const path = `${cycleDir}/manual/${detector.slug}.csv`;
    let raw: string;
    try {
      raw = readFileSync(path, 'utf8');
    } catch {
      fail(`${detector.slug}: no ${path}`);
      continue;
    }

    const rows = parseCsv(raw);
    const seen = new Set<string>();
    for (const row of rows) {
      const sampleId = row.sampleId ?? '';
      if (!validIds.has(sampleId)) throw new Error(`${detector.slug}: unknown sample ${sampleId}`);
      const run = Number(row.run);
      if (run !== 1 && run !== 2) throw new Error(`${detector.slug}/${sampleId}: run must be 1 or 2`);
      const key = `${sampleId}|${run}`;
      if (seen.has(key)) throw new Error(`${detector.slug}: duplicate row for ${key}`);
      seen.add(key);

      const rawScore = row.aiProbability ?? '';
      const value = rawScore === '' || rawScore.toLowerCase() === 'refused' ? null : Number(rawScore);
      if (value !== null && (!Number.isFinite(value) || value < 0 || value > 100)) {
        throw new Error(`${detector.slug}/${sampleId}: aiProbability must be 0-100 or 'refused'`);
      }

      results = results.filter((r) => !(r.detector === detector.slug && r.sampleId === sampleId && r.run === run));
      results.push({
        detector: detector.slug,
        sampleId,
        run,
        aiProbability: value,
        error: value === null ? 'refused-or-unscorable' : null,
        latencyMs: null,
        collectedAt: row.collectedAt || undefined,
      });
      imported++;
    }

    const expected = samples.length * 2;
    const line = `${detector.slug}: ${rows.length} rows (expected ${expected})`;
    rows.length === expected ? ok(line) : fail(line);
    if (rows.length !== expected) {
      const have = new Set(rows.map((r) => `${r.sampleId}|${r.run}`));
      const gaps = samples.flatMap((s) => [1, 2].filter((r) => !have.has(`${s.id}|${r}`)).map((r) => `${s.id} run ${r}`));
      info(`missing: ${gaps.slice(0, 8).join(', ')}${gaps.length > 8 ? ` (+${gaps.length - 8} more)` : ''}`);
    }
  }

  writeJson(`${cycleDir}/detector-results.json`, results);
  ok(`${imported} manual readings merged`);
}

try {
  main();
} catch (err) {
  fail((err as Error).message);
  process.exitCode = 1;
}
