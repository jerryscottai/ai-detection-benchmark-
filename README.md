# AI Detection Benchmark

An independent benchmark for AI content detectors.

91 texts, read twice each, across four classes: machine-written, human-written,
spliced hybrids at known ratios, and human writing chosen because it is the kind
that gets people falsely accused. Every reading, every scoring rule and the code
that turns them into a ranking is published here — so if you disagree with the
result, you can re-derive it, change a weight, and see exactly how much your
disagreement is worth.

Most detector comparisons test one thing: does the tool catch ChatGPT output.
That is the easy half, and on this corpus every tool tested passes it. The
interesting failures are elsewhere.

## Cycle 2026-08 — withdrawn pending correction

> **These results are under review and should not be cited.**
>
> The maintainer has reported an error in the analysis behind this cycle. A
> revised summary supplied on 2026-09-03 disagrees materially with the run logs
> this table was derived from — most sharply on Pangram, which the logs place
> first on every binary metric and the revision places last. The disagreement
> cannot be explained by a threshold change: no threshold on the published
> readings reproduces the revised figures.
>
> The table below is left visible because it is what the committed run logs
> actually produce, and deleting it would hide the discrepancy rather than
> resolve it. It will be replaced or removed once corrected raw run logs are
> available. Until then it is not a finding about any product.

| # | Detector | Score | AI recall | Human cleared | FP resistance | Hybrid accuracy | Consistency |
|---|----------|------:|----------:|--------------:|--------------:|----------------:|------------:|
| 1 | **Pangram** | **94.80** | 100.0% | 100.0% | 100.0% | 75.1% | 85.3% |
| 2 | GPTZero | 90.04 | 92.9% | 100.0% | 95.2% | 77.9% | 64.5% |
| 3 | Originality.ai | 86.42 | 96.4% | 95.2% | 85.7% | 76.6% | 50.5% |
| 4 | Winston AI | 86.10 | 96.4% | 100.0% | 76.2% | 74.5% | 57.6% |
| 5 | Copyleaks | 78.44 | 85.7% | 95.2% | 76.2% | 79.5% | 17.6% |

910 readings · 91 texts · two passes, 26 and 28 August 2026 · 0.5% unanswered

Full per-sample data: [`data/cycles/2026-08/`](data/cycles/2026-08/).
Detailed analysis: **[docs/RESULTS-2026-08.md](docs/RESULTS-2026-08.md)**.

### The finding that matters most: nobody measures *how much*

Every one of these tools reports a percentage. None of them tracks the actual
proportion of machine text in a document.

Mean reported AI score against true AI content:

| True AI content | Pangram | GPTZero | Originality.ai | Winston AI | Copyleaks |
|---|---|---|---|---|---|
| **25%** | 39.6 | 40.6 | 54.7 | 44.3 | 34.5 |
| **50%** | 40.0 | 40.0 | 48.7 | 67.4 | 52.1 |
| **75%** | 44.1 | 49.2 | 49.6 | 61.4 | 54.4 |

Pangram moves 4.5 points across a 50-point change in reality. GPTZero moves 8.6.
Originality.ai moves *backwards*. Mean absolute error runs 20–25 points for all
five. If you are using one of these numbers to decide how much of an essay a
student wrote, the number does not contain that information.

This is why hybrid accuracy is a scored component rather than a footnote, and
why no tool scores above 80% on it.

### Where the false positives are

Flagged human documents, out of 3 per profile:

| Profile | Pangram | GPTZero | Originality.ai | Winston AI | Copyleaks |
|---|---|---|---|---|---|
| Template-structured | 0 | 0 | **2** | **2** | **2** |
| Short-form (60–130 words) | 0 | 1 | 0 | **2** | 1 |
| Grammar-heavy | 0 | 0 | 0 | 1 | 0 |
| Second-language (ESL) | 0 | 0 | 1 | 0 | 1 |
| Translated | 0 | 0 | 0 | 0 | 1 |
| Technical / formulaic | 0 | 0 | 0 | 0 | 0 |
| Archaic (pre-1930) | 0 | 0 | 0 | 0 | 0 |

Boilerplate is the trap, not English-as-a-second-language. Three of five tools
flagged two of three template-structured documents — an HR welcome email, a
county parks "about us" page, a state arts board grant template. Winston also
flagged two of three short documents.

The ESL result is better than the discourse suggests: 2 false positives across
25 scans. Worth saying plainly, because it cuts against the usual story.

### Read the intervals before the ranks

With 21–28 samples per class, one document moves a rate by 3–5 points. The 95%
confidence interval on false-positive resistance is 84.5–100% for Pangram and
54.9–89.4% for Winston — those overlap. **Ranks 3 and 4 are separated by 0.32
points and are not distinguishable.** Every rate metric ships with its interval
in `leaderboard.json`.

## What was tested

| Class | n | What it is |
|-------|--:|------------|
| **AI** | 28 | GPT-4o, Claude 4 Sonnet, Gemini 2.0 Flash and Llama 3.3 70B — 7 per model, one per genre |
| **Human** | 21 | Published human writing: Le Guin, Cather, Saunders, Dewey, William James, Reuters, NYT, Vox, Bloomberg, PostgreSQL and AWS docs |
| **Hybrid** | 21 | Human drafts spliced with model text at 25 / 50 / 75% by word count |
| **False-positive stress** | 21 | Seven high-risk profiles × 3: ESL, translated, template-structured, technical, grammar-heavy, short-form, archaic |

Seven genres — academic, news, blog, fiction, business, marketing, technical —
at 60 to 985 words. Full inventory in
[`data/cycles/2026-08/samples.json`](data/cycles/2026-08/samples.json), with the
raw vendor logs (score field, displayed label, on-screen explanation, timestamps,
presentation order) preserved verbatim in
[`run-logs/`](data/cycles/2026-08/run-logs/).

Each detector is scored at **its own vendor's documented threshold**. Winston
reports human-likeness where others report AI probability, and Copyleaks and
Originality report 0–100 where GPTZero and Pangram report 0–1; every reading is
normalised onto one axis at ingest, from the scale each log declares.

## How the score is built

| Component | Weight |
|-----------|-------:|
| AI recall | 30 |
| Human specificity | 25 |
| False-positive resistance | 20 |
| Hybrid accuracy | 15 |
| Consistency (repeat-run stability + evenness across genres) | 10 |

Penalties, capped at 10: unanswered samples, and hard fails where any of the
first three metrics falls below 50%.

**Why not-accusing outweighs catching, 45 points to 30.** A missed AI essay costs
a grade boundary and is recoverable. A false accusation costs a person a
disciplinary hearing they cannot win, because no evidence proves you wrote
something yourself. That is a values judgement, stated in the open — and
`scoring.js` is one dependency-free file you can edit and re-run in under a
second. Full rationale: **[METHODOLOGY.md](METHODOLOGY.md)**.

## Limitations of this cycle

Stated up front rather than buried, because they bound what these numbers mean.

- **The 91 source texts are not published.** The operator supplied run logs, not
  documents. `samples.json` therefore records `"sha256": "not-supplied"`, and
  nobody — including this repository — can independently confirm which texts
  were scanned. Ground truth is cross-checked for agreement across all five
  vendor logs, which catches transcription drift but not a mislabelled document.
- **No commit–reveal.** This corpus was assembled and scanned by the operator
  directly, so the prompt-commitment scheme this repo implements does not apply.
  Verification skips those two checks and says so.
- **Five detectors of thirteen registered.** Sapling, Undetectable.ai, ZeroGPT,
  Smodin, Isgen, QuillBot, Scribbr and BrandWell were not run. They are absent
  from the table rather than scored at zero.
- **English only, one point in time.** Detectors change silently; these are
  Winston v4.15, GPTZero 4.9b, Originality Lite 3.0.0, Copyleaks 2026.08 and
  Pangram 4.0, as recorded in the logs.

**Pangram note.** Pangram was excluded when this benchmark was scoped, at the
maintainer's request. It is on the table because the maintainer subsequently
supplied a complete run log for it. Both facts are recorded in
[`detectors/registry.json`](detectors/registry.json); say the word and it comes
back out.

## Verify it

```bash
npm install
npm run verify -- 2026-08
```

Seven assertions: hybrid ratios are exactly 25/50/75, AI fraction agrees with
declared class on every sample, all four classes present, no duplicate ids, every
file hashes as published, no untracked files, and — the important one — the
cycle's own frozen `scoring.js` re-derives `leaderboard.json` byte for byte from
the raw readings.

Edit any published number by hand and two checks fail independently. Details:
**[docs/VERIFICATION.md](docs/VERIFICATION.md)**.

## Running your own cycle

The repository also implements a commit–reveal corpus scheme for cycles built
from scratch: prompts are a pure function of a nonce whose hash is published
before any text exists, so the prompt set cannot be chosen to suit a result.
Cycle 2026-08 did not use it. See **[docs/RUNNING.md](docs/RUNNING.md)** and
**[docs/START-HERE.md](docs/START-HERE.md)**.

`npm run smoke-test` exercises the whole pipeline offline against fabricated
input, in a git-ignored scratch directory that never touches the detector
histories.

## No affiliate relationships

No vendor paid for placement, previewed results, or received the corpus in
advance. There are no affiliate links in this repository, and there will not be —
the moment a ranking earns a commission it stops being a benchmark.

## Corrections

Open an issue with the cycle, the text id and the reading you got. Vendors are
welcome to dispute results; the useful form of a dispute is a re-run.

## Licence

Code: [MIT](LICENSE). Cycle data and results: [CC BY 4.0](LICENSE-data). Source
texts are not redistributed.
