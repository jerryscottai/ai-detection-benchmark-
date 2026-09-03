# Methodology changes

Every change to how a score is produced is recorded here, in the cycle it takes
effect. Scores are only comparable across cycles where this file says nothing
changed between them.

## methodology/v2 — weights revised 2026-09-03

| Component | v1 | v2 |
|---|--:|--:|
| AI recall | 30 | **20** |
| Human specificity | 25 | **20** |
| False-positive resistance | 20 | **35** |
| Hybrid accuracy | 15 | 15 |
| Consistency | 10 | 10 |

Fifteen points move into false-positive resistance. The rationale is the one
this benchmark was built on — the two error types are not symmetric in
consequence — and under v1 the corpus measuring the costlier error carried less
weight than the one measuring the cheaper, which sat awkwardly against the
stated reasoning.

**This change was decided after cycle 2026-08 had been scored and published, not
before it opened.** That is the opposite of the ordering this file asks for
everywhere else, and it is recorded rather than smoothed over, because a
weighting chosen with the results already on screen is a weaker thing than one
fixed in advance. Both tables:

| Detector | v1 (30/25/20/15/10) | v2 (20/20/35/15/10) | Change |
|---|--:|--:|--:|
| Winston AI | 90.99 (2nd) | **91.70 (1st)** | +0.71 |
| Copyleaks | 91.73 (1st) | 91.38 (2nd) | −0.35 |
| GPTZero | 87.55 (3rd) | 85.40 (3rd) | −2.15 |
| ZeroGPT | 73.99 (4th) | 65.78 (4th) | −8.21 |
| Pangram | 68.87 (5th) | 61.01 (5th) | −7.86 |

Ranks 1 and 2 exchange places and remain 0.32 points apart, with overlapping
confidence intervals under both weightings. Neither ordering is a finding. The
three-way top group and two-way bottom group are unchanged, which is the part of
this table that survives the reweighting.

No raw reading was altered. Only the weights changed, and
`npm run verify -- 2026-08` re-derives the new table from the same readings.

## Cycle 2026-08 — first published cycle

**Run logs supplied twice.** Batch 1 (Winston, GPTZero, Copyleaks, Originality,
Pangram) was ingested and briefly published, then withdrawn after the maintainer
reported an error in the analysis behind it. Batch 2 (Winston, GPTZero,
Copyleaks, Pangram, ZeroGPT) replaced it and is what this cycle scores.

The two batches describe the same detector versions scanning the same 91 texts
on the same dates and disagree on 90 of Winston's 91 per-text readings, with
near-inverted rankings — Copyleaks last to first, Pangram first to last. The
maintainer attests that batch 1 was a faulty run. Batch 1 is retained under
`superseded/` and the attestation is recorded in `commit.json`, because nothing
in this repository distinguishes the batches beyond it.

Batch 2 reproduces the maintainer's own summary analysis exactly on recall,
stress false-positive rate and ESL false-positive rate, and on specificity once
computed over all 42 human-class documents as that analysis computes it.

Originality.ai appears in batch 1 only and is omitted rather than compared
against readings from a different batch. ZeroGPT enters the benchmark with batch
2; its log records `DeepAnalyse`, a mode rather than a version.


Five detectors measured against an operator-assembled corpus of 91 texts, two
passes on 26 and 28 August 2026. Scored under methodology v1, unchanged.

**What differs from the repository's default design**, recorded because it
bounds what the numbers mean:

- **Operator-supplied corpus.** The texts were assembled and scanned by the
  maintainer rather than generated through this repository's commit–reveal
  scheme. The nonce, prompt-selection and prompt-replay checks therefore do not
  apply to this cycle; `commit.json` carries `corpusProvenance:
  "operator-supplied"` and verification skips those two checks out loud.
- **Source texts not published.** `samples.json` records
  `"sha256": "not-supplied"` for all 91 samples. Ground truth is cross-checked
  for agreement across all five vendor logs, which catches transcription drift
  but not a mislabelled document.
- **Genre taxonomy from the operator's corpus**: academic, news, blog, fiction,
  business, marketing, technical — replacing the repository's own default set,
  which had business-email and forum in place of marketing and news. The seven
  false-positive profiles map one-to-one and are unchanged.
- **Five of thirteen registered detectors.** Sapling, Undetectable.ai, ZeroGPT,
  Smodin, Isgen, QuillBot, Scribbr and BrandWell were not run and are omitted
  from the leaderboard rather than scored at zero.

**Registry corrections made while ingesting this cycle:**

- **Copyleaks and Originality.ai were recorded as reporting on a 0–1 scale.**
  Both report 0–100 in their run logs. Left uncorrected, every reading from both
  would have been multiplied by 100 and clamped to a confident 100% AI. Scale is
  now taken from each run log's own declared `score_field` and observed range,
  never from the registry.
- **Pangram added.** It was excluded when this benchmark was scoped, at the
  maintainer's request, and is now included because the maintainer supplied a
  complete run log for it. Both facts are recorded in its registry entry.

**Tooling added:**

- `npm run ingest` reads per-detector long-format run logs, builds `samples.json`
  and `detector-results.json` together, and refuses to proceed if the logs
  disagree about any text's ground truth.
- `npm run score` now scores only detectors that have readings. Previously an
  unmeasured detector would have appeared at zero, which reads as "it failed"
  rather than "it was not tested".
- `npm run verify` branches on `corpusProvenance` and, for an operator corpus,
  checks hybrid ratios against the declared 25/50/75 set and class-vs-fraction
  agreement instead of against a splice plan that does not exist.

## methodology/v1 — established 2026-09

- **Scoring v1.0.0.** AI recall (30), human specificity (25), false-positive
  resistance (20), hybrid accuracy (15), consistency (10), less penalties capped
  at 10. Wilson 95% intervals on every rate metric.
- **Selection v1.0.0.** HMAC-SHA256 commit–reveal, rejection-sampled, for cycles
  built from generated prompts.
- **Corpus shape.** 91 samples: 28 AI, 21 human, 21 hybrid, 21 false-positive
  stress; seven genres, seven stress profiles, three hybrid ratios.
- **Thresholds.** Each detector scored at its own vendor's documented threshold.
- **Two passes** per detector per sample, separated in time.

Opening a cycle freezes a copy of `methodology/v1/scoring.js` into that cycle's
directory. Those copies are never edited. A methodology change means adding
`methodology/v2` and an entry here, before the cycle that uses it opens.
