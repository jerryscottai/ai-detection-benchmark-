# AI Detection Benchmark

An independent, reproducible benchmark for AI content detectors.

Twelve detectors. Four classes of text. 91 samples, read twice each, every cycle.
Every input, every reading, every scoring rule and the code that turns them into
a ranking is published here — so if you disagree with the leaderboard, you can
re-derive it, change a weight, and see exactly how much your disagreement is
worth.

Most detector comparisons test one thing: does the tool catch ChatGPT output.
That is the easy half. This benchmark weights the hard half more heavily —
whether the tool clears writing that is genuinely human, especially the kind of
human writing that gets people accused: second-language students, technical
writers, anyone who ran a grammar checker before submitting. A detector that
catches every machine and accuses one student in five is not a good detector.
It is a liability with a good marketing page.

## Leaderboard

**Cycle 1 (2026-10) — collection in progress.**

The commitment for cycle 1 is published before any prompt exists, and results
land here when the cycle closes. Nothing appears on this table that did not come
from a purchased API call or a logged manual reading, which is the whole reason
this repository is structured the way it is.

| | |
|---|---|
| Cycle | `2026-10` |
| Detectors | 12 — Winston AI, Originality.ai, GPTZero, Copyleaks, Sapling, Undetectable.ai, ZeroGPT, Smodin, Isgen, QuillBot, Scribbr, BrandWell |
| Samples | 91 per detector, read twice — 2,184 readings |
| Status | Corpus assembly |

Past cycles: none yet — this is cycle 1. Per-detector history accumulates in
[`data/detectors/`](data/detectors/).

## What gets tested

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
before 2021 — Enron emails, Stack Exchange dumps, NASA and NIST reports,
Wikinews, PubMed Central, the FCE learner corpus, Europarl. Text written for a
benchmark by people who know a detector will read it is not ordinary human
writing, and asking someone to "write like a human" produces something no more
natural than asking a model to. Provenance by date is the only guarantee that
scales.

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

**Why not-accusing outweighs catching, 45 points to 30.** The two error types are
not symmetric. A missed AI essay costs a grade boundary and is recoverable. A
false accusation costs a person a disciplinary hearing they have no way to win,
because there is no evidence that proves you wrote something yourself. Any
weighting is a values judgement; this one is stated in the open, and the scoring
code is a single file you can edit and re-run.

Every rate metric is published with a Wilson 95% interval. With 21–28 samples per
class, one sample moves a rate by three to five points, and adjacent rows are
frequently **not** distinguishable. Read the intervals before reading the ranks.

Full rationale, thresholds and known limitations: **[METHODOLOGY.md](METHODOLOGY.md)**.

## Verify any published cycle

```bash
npm install
npm run verify              # every published cycle
npm run verify -- 2026-10   # one cycle
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

Edit any published number by hand and two of those fail independently. Details,
including how to try it: **[docs/VERIFICATION.md](docs/VERIFICATION.md)**.

What the commit–reveal scheme buys is narrow and worth stating plainly: it stops
*the maintainer* choosing prompts to suit a result. It does not stop a *vendor*
recognising the corpus after publication. That is why the value banks are
re-drawn every cycle, and why the per-detector trend lines in
[`data/detectors/`](data/detectors/) will be more informative than any single
cycle's ranking.

## Running a cycle

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

Step by step, including the two-operator protocol for the three detectors with
no public API: **[docs/RUNNING.md](docs/RUNNING.md)**.

`npm run smoke-test` exercises the same pipeline offline against fabricated
input. It writes to a git-ignored scratch directory and never touches the
detector histories — it proves the machinery works, and it produces nothing
publishable.

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

No vendor pays for placement, sees results before publication, or receives the
corpus in advance. API access is purchased at list price on the plans named in
the registry. There are no affiliate links in this repository, and there will not
be — the moment a ranking earns a commission, it stops being a benchmark.

## Corrections

If a published number is wrong, open an issue with the cycle, the sample id and
the reading you got. Reproducible corrections are folded into the next cycle and
recorded in [CHANGES.md](CHANGES.md). Vendors are welcome to dispute results; the
useful form of a dispute is a re-run, and everything needed for one is here.

## Licence

Code and workflows: [MIT](LICENSE). Cycle datasets and results:
[CC BY 4.0](LICENSE-data). Source texts are **not** redistributed — the manifests
carry pointers, spans and hashes so you can fetch and verify the originals
yourself, under their own licences.
