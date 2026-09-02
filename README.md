# AI Detection Benchmark

An independent, reproducible benchmark for AI content detectors.

Twelve detectors, four classes of text, one number each — and every input, every
reading, every scoring rule and the code that turns them into a ranking is in
this repository. If you disagree with the leaderboard, you can re-derive it,
change a weight, and see exactly how much your disagreement is worth.

Most detector comparisons test one thing: does the tool catch ChatGPT output.
That is the easy half. This benchmark weights the hard half more heavily —
whether the tool clears writing that is genuinely human, especially the kind of
human writing that gets people accused: second-language students, technical
writers, anyone who ran a grammar checker before submitting. A detector that
catches every machine and accuses one student in five is not a good detector.
It is a liability with a good marketing page.

---

> ### ⚠️ Status: pipeline published, first live cycle not yet run
>
> The cycle in this repository, **`2026-09-dry-run`**, is a dry run. Its corpus
> texts and its detector readings are both **fabricated offline** by
> [`scripts/dev/seed-dry-run.ts`](scripts/dev/seed-dry-run.ts) from a documented
> noise model. **No detector was called. No vendor was measured.** Every file it
> produces is stamped `"synthetic": true`.
>
> It is here because a benchmark should ship its machinery before its verdicts:
> you can read the methodology, run `npm run verify`, tamper with a number and
> watch the audit catch it, and argue with the weights — all before anyone has
> anything to defend. **Do not cite the dry-run numbers as findings about any
> product.** The first live cycle replaces both halves with fetched sources and
> real API readings; nothing else in the pipeline changes.

---

## Dry-run leaderboard (synthetic — see the notice above)

| # | Detector | Score | AI recall | Human cleared | FP resistance | Hybrid accuracy | Consistency |
|---|----------|------:|----------:|--------------:|--------------:|----------------:|------------:|
| 1 | **Winston AI** | **98.22** | 100.0% | 100.0% | 95.2% | 95.6% | 98.4% |
| 2 | Originality.ai | 95.91 | 100.0% | 95.2% | 100.0% | 89.6% | 86.6% |
| 3 | GPTZero | 94.40 | 96.4% | 95.2% | 95.2% | 95.2% | 83.4% |
| 4 | Copyleaks AI Detector | 94.11 | 92.9% | 100.0% | 95.2% | 91.4% | 84.9% |
| 5 | Isgen | 89.95 | 100.0% | 90.5% | 81.0% | 87.0% | 80.9% |
| 6 | Sapling AI Detector | 86.67 | 92.9% | 95.2% | 66.7% | 89.6% | 82.2% |
| 7 | QuillBot AI Detector | 84.01 | 89.3% | 90.5% | 71.4% | 86.2% | 73.9% |
| 8 | Scribbr AI Detector | 78.02 | 92.9% | 95.2% | 42.9% | 89.2% | 74.1% |
| 9 | Undetectable.ai Detector | 76.42 | 89.3% | 76.2% | 61.9% | 88.1% | 49.9% |
| 10 | Smodin AI Content Detector | 74.18 | 85.7% | 71.4% | 61.9% | 82.4% | 58.7% |
| 11 | ZeroGPT | 68.31 | 75.0% | 85.7% | 47.6% | 84.8% | 51.5% |
| 12 | BrandWell AI Detector | 59.77 | 78.6% | 66.7% | 19.1% | 81.0% | 65.8% |

Full per-sample data, confidence intervals, per-domain splits and per-profile
false-positive rates: [`data/cycles/2026-09-dry-run/leaderboard.json`](data/cycles/2026-09-dry-run/leaderboard.json).

With 21–28 samples per class, a single sample moves a rate by three to five
points. The leaderboard reports a Wilson 95% interval next to every rate metric
for exactly this reason, and adjacent rows are frequently **not** distinguishable.
Read the intervals before reading the ranks.

## What gets tested

91 samples per detector, read twice each — 2,184 readings per cycle.

| Class | n | What it is | What it measures |
|-------|--:|------------|------------------|
| **AI** | 28 | Model output from plain prompts, 7 domains × 4 generators | Does it catch the machine? |
| **Human** | 21 | Pre-2021 published human writing, same 7 domains | Does it clear ordinary writing? |
| **Hybrid** | 21 | Human and AI spliced at known ratios (25 / 50 / 75%) | Can it say *how much*, and where? |
| **False-positive stress** | 21 | Human writing across 7 high-risk profiles | Does it accuse the wrong people? |

The seven domains are academic, blog, business email, journalism, technical
documentation, fiction and forum posts. The seven false-positive profiles are
second-language writing, human translation, template-structured institutional
prose, standards and specification text, grammar-checked text, short-form text,
and pre-1930 formal prose.

**Nothing in the human or false-positive corpus was written for this benchmark.**
Every entry is drawn from a document published, archived or corpus-released
before 2021 — Enron emails, Stack Exchange dumps, NASA and NIST reports, Wikinews,
PubMed Central, the FCE learner corpus, Europarl. Text written for a benchmark by
people who know a detector will read it is not ordinary human writing, and asking
someone to "write like a human" produces something no more natural than asking a
model to. Provenance by date is the only guarantee that scales.

Hybrid ground truth is exact rather than estimated: the splice is mechanical, so
`aiFraction` is a count of words, not a judgement.

## How the score is built

| Component | Weight | Definition |
|-----------|-------:|------------|
| AI recall | 30 | Share of AI samples flagged at the vendor's own threshold |
| Human specificity | 25 | Share of ordinary human samples cleared |
| False-positive resistance | 20 | Share of the stress corpus cleared |
| Hybrid accuracy | 15 | 1 − mean absolute error between reported AI% and true AI% |
| Consistency | 10 | Half repeat-run stability, half evenness across domains |

Penalties, capped at 10 points: unanswered samples (up to 6) and hard fails —
any of the first three metrics below 50%, at 3 points each (up to 6).

**Why false-positive resistance and human specificity together outweigh recall,
45 to 30.** The two error types are not symmetric. A missed AI essay costs a
grade boundary. A false accusation costs a person a disciplinary hearing they
have no way to win, because there is no evidence that proves you wrote something
yourself. Any weighting is a values judgement; this one is stated in the open, and
the scoring code is thirty lines you can edit and re-run.

Full rationale, thresholds, and known limitations: **[METHODOLOGY.md](METHODOLOGY.md)**.

## Verify it yourself

```bash
npm install
npm run verify                    # every cycle
npm run verify -- 2026-09-dry-run # one cycle
```

Eight assertions per cycle, in five groups:

1. **Commitment** — `SHA-256(nonce)` matches the hash published *before* the
   cycle opened, so the prompt set could not have been chosen after seeing how a
   vendor performed.
2. **Prompt replay** — the cycle's own frozen `select-placeholders.js`, given
   that nonce, re-derives `prompts.json` exactly.
3. **Ground truth** — every hybrid's committed AI fraction is within ±0.04 of
   its planned ratio; all four classes present; no duplicate ids.
4. **Manifest** — every file in the cycle still hashes to what it hashed at
   publication.
5. **Score replay** — the cycle's own frozen `scoring.js`, over its samples and
   readings, re-derives `leaderboard.json` byte for byte.

Edit any number by hand and two independent checks fail. Try it:

```bash
sed -i 's/"composite": 59.77/"composite": 99.77/' data/cycles/2026-09-dry-run/leaderboard.json
npm run verify   # ✗ manifest  ✗ score replay
git checkout data/cycles/2026-09-dry-run/leaderboard.json
```

What the commit–reveal scheme buys is narrow and worth stating plainly: it stops
*the maintainer* choosing prompts to suit a result. It does not stop a *vendor*
recognising the corpus after publication. That is why the value banks are
re-drawn every cycle, and why the per-detector trend lines in
[`data/detectors/`](data/detectors/) are more informative than any single cycle's
ranking.

## Running a live cycle

```bash
npm run commit-cycle -- --cycle 2026-10             # publish the commitment
npm run commit-cycle -- --cycle 2026-10 --reveal    # reveal nonce, resolve prompts
npm run generate-ai  -- --cycle 2026-10             # generate the AI corpus
npm run build-corpus -- --cycle 2026-10             # assemble samples + hybrids
npm run run-detectors -- --cycle 2026-10            # collect API readings
npm run import-manual -- --cycle 2026-10            # fold in the manual tools
npm run score        -- --cycle 2026-10             # leaderboard + manifest
npm run verify       -- 2026-10                     # audit before publishing
```

Step-by-step, including the manual-collection protocol for the three detectors
with no public API: **[docs/RUNNING.md](docs/RUNNING.md)**.

## Which detectors, and why those

Twelve, in [`detectors/registry.json`](detectors/registry.json): Winston AI,
Originality.ai, GPTZero, Copyleaks, Sapling, Undetectable.ai, ZeroGPT, Smodin,
Isgen, QuillBot, Scribbr and BrandWell. Nine are collected over their APIs; three
have no public API and are read twice by two independent operators in the web UI,
which is recorded on their rows rather than hidden.

Each detector is scored at **its own vendor's documented threshold**, frozen for
the cycle. Winston reports a human-likeness score and several vendors report 0–1;
all are normalised to one axis by [`adapters/index.ts`](adapters/index.ts) so
nothing is inverted by accident.

Three tools are excluded, with reasons recorded in the registry: **Turnitin**
(institution-only, so nobody outside a licensed institution could reproduce the
result), **Pangram** (excluded at the maintainer's request), and **Grammarly**
(ships an authorship signal, not a comparable AI probability).

## No affiliate relationships

No vendor paid for placement, saw results before publication, or was given the
corpus in advance. API access is purchased at list price on the plans named in
the registry. There are no affiliate links in this repository, and there will not
be — the moment a ranking earns a commission, it stops being a benchmark.

## Corrections

If a number here is wrong, open an issue with the sample id and the reading you
got. Reproducible corrections are folded into the next cycle and recorded in
[CHANGES.md](CHANGES.md). Vendors are welcome to dispute results; the useful form
of a dispute is a re-run, and everything needed for one is in this repository.

## Licence

Code and workflows: [MIT](LICENSE). Cycle datasets and results:
[CC BY 4.0](LICENSE-data). Source texts are **not** redistributed — the manifests
carry pointers, spans and hashes so you can fetch and verify the originals
yourself, under their own licences.
