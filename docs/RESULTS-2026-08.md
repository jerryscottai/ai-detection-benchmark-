# Cycle 2026-08 — detailed results

Five detectors, 91 texts, two passes on 26 and 28 August 2026. 910 readings,
five unanswered (0.5%).

Everything here is derived from
[`data/cycles/2026-08/detector-results.json`](../data/cycles/2026-08/detector-results.json)
by [`scoring.js`](../data/cycles/2026-08/scoring.js). `npm run verify -- 2026-08`
re-derives the leaderboard from the raw readings and fails if a single byte was
edited by hand.

---

## Composite

| # | Detector | Version | Score | Recall | Human | FP-resist | Hybrid | Consist |
|---|---|---|------:|-------:|------:|----------:|-------:|--------:|
| 1 | Pangram | 4.0 | **94.80** | 100.0% | 100.0% | 100.0% | 75.1% | 85.3% |
| 2 | GPTZero | 4.9b | **90.04** | 92.9% | 100.0% | 95.2% | 77.9% | 64.5% |
| 3 | Originality.ai | Lite 3.0.0 | **86.42** | 96.4% | 95.2% | 85.7% | 76.6% | 50.5% |
| 4 | Winston AI | v4.15 | **86.10** | 96.4% | 100.0% | 76.2% | 74.5% | 57.6% |
| 5 | Copyleaks | 2026.08 | **78.44** | 85.7% | 95.2% | 76.2% | 79.5% | 17.6% |

No detector incurred a penalty. No metric fell below the 50% hard-fail floor.

### Confidence intervals (Wilson, 95%)

| Detector | AI recall | Human cleared | FP resistance |
|---|---|---|---|
| Pangram | 87.9 – 100% | 84.5 – 100% | 84.5 – 100% |
| GPTZero | 77.4 – 98.0% | 84.5 – 100% | 77.3 – 99.2% |
| Originality.ai | 82.3 – 99.4% | 77.3 – 99.2% | 65.4 – 95.0% |
| Winston AI | 82.3 – 99.4% | 84.5 – 100% | 54.9 – 89.4% |
| Copyleaks | 68.5 – 94.3% | 77.3 – 99.2% | 54.9 – 89.4% |

Ranks 3 and 4 are 0.32 points apart. Every interval above overlaps at least one
other detector's. **The ordering below rank 2 should not be read as a result.**

---

## 1. Hybrid detection: the shared failure

Mean reported AI percentage against true AI content by word count:

| True | Pangram | GPTZero | Originality.ai | Winston AI | Copyleaks |
|---|---|---|---|---|---|
| 25% | 39.6 | 40.6 | 54.7 | 44.3 | 34.5 |
| 50% | 40.0 | 40.0 | 48.7 | 67.4 | 52.1 |
| 75% | 44.1 | 49.2 | 49.6 | 61.4 | 54.4 |
| **25% → 75% change** | **+4.5** | **+8.6** | **−5.1** | **+17.1** | **+19.9** |

Across a 50-point change in ground truth, Pangram's output moves 4.5 points and
Originality.ai's moves backwards. Winston has the steepest response and still
covers only a third of the range it should.

| Detector | Mean absolute error | Signed bias |
|---|---:|---:|
| Copyleaks | 20.5 pts | −3.0 |
| GPTZero | 22.1 pts | −6.7 |
| Originality.ai | 23.4 pts | +1.0 |
| Pangram | 24.9 pts | −8.8 |
| Winston AI | 25.5 pts | +7.7 |

Read the bias column with the range column: a detector that always answers "40%"
has a small bias and no information. Copyleaks has the lowest error largely
because a constant near the corpus mean is hard to beat on MAE.

**What this means practically.** These percentages support a binary question —
*is there machine text here* — and do not support a proportional one. Any process
that reads "62% AI" as "62% of this was written by a model" is reading something
the number does not contain.

---

## 2. False positives

All 21 stress documents are human-written. Flags out of 3 per profile:

| Profile | Pangram | GPTZero | Originality | Winston | Copyleaks | Total |
|---|---|---|---|---|---|---|
| Template-structured | 0 | 0 | **2** | **2** | **2** | **6/15** |
| Short-form | 0 | 1 | 0 | **2** | 1 | 4/15 |
| Second-language | 0 | 0 | 1 | 0 | 1 | 2/15 |
| Grammar-heavy | 0 | 0 | 0 | 1 | 0 | 1/15 |
| Translated | 0 | 0 | 0 | 0 | 1 | 1/15 |
| Technical / formulaic | 0 | 0 | 0 | 0 | 0 | 0/15 |
| Archaic (pre-1930) | 0 | 0 | 0 | 0 | 0 | 0/15 |

**Boilerplate is the trap.** The three template-structured documents — an HR
welcome-email template, a county parks department "about us" page, a state arts
board grant-report narrative — drew six false accusations across five detectors.
Institutional prose is written to be uniform, and uniformity is the signal these
models key on.

**Short text is the second trap.** Winston flagged two of three 60–130 word human
documents. GPTZero declined to score one of them outright, which is the better
behaviour: an explicit refusal is more useful than a confident wrong answer.

**The ESL result is better than expected.** Two false positives in 25 completed
scans, on placement and application essays from Helsinki, Osaka and Coimbra. The
widely-repeated claim that detectors systematically flag second-language writers
is not what this corpus shows. One cycle at n=3 per detector cannot settle it —
but it does not support it either.

**Archaic and technical prose: clean.** Carlyle, Ruskin, an Abigail Adams letter,
IEEE 802.11, FDA guidance and NIST SP 800-63-3 passed every detector.

### Confusion matrices

Positive = AI or hybrid ≥50% AI. Negative = human, stress, or hybrid <50%.

| Detector | TP | FP | TN | FN | FPR | F1 |
|---|---:|---:|---:|---:|---:|---:|
| Pangram | 32 | 2 | 47 | 10 | 4.1% | 0.842 |
| Winston AI | 36 | 8 | 41 | 6 | 16.3% | 0.837 |
| Originality.ai | 33 | 8 | 41 | 9 | 16.3% | 0.795 |
| GPTZero | 31 | 5 | 44 | 11 | 10.2% | 0.795 |
| Copyleaks | 31 | 9 | 40 | 11 | 18.4% | 0.756 |

Winston has the highest true-positive count and joint-highest false-positive
count — a more aggressive tool than its composite rank suggests.

---

## 3. Consistency

Same text, same detector, two days apart. Mean absolute drift:

| Detector | Mean drift | Consistency score |
|---|---:|---:|
| Pangram | 7.3 pts | 85.3% |
| GPTZero | 9.9 pts | 64.5% |
| Winston AI | 10.7 pts | 57.6% |
| Originality.ai | 14.8 pts | 50.5% |
| Copyleaks | 26.5 pts | 17.6% |

**Copyleaks moved 26.5 points on average between passes.** That is not noise
around a stable estimate; it is a different answer. For a tool used to make
decisions about individuals, run-to-run reproducibility is not a secondary
property.

Winston's largest swings were C014 (0 → 43), C087 (14 → 55) and C086 (23 → 64) —
two of which cross the decision threshold, meaning the same document is human on
Wednesday and AI on Friday.

### Evenness across genres (balanced accuracy)

| Detector | Weakest genre | Score there | Best |
|---|---|---:|---:|
| Pangram | — | 1.000 | 1.000 |
| GPTZero | marketing | 0.792 | 1.000 |
| Winston AI | marketing | 0.708 | 1.000 |
| Originality.ai | blog | 0.708 | 1.000 |
| Copyleaks | blog | 0.500 | 1.000 |

Copyleaks at 0.500 on blog content is chance. Marketing copy is hard for three of
five — plausibly because promotional prose is formulaic in the same way
institutional boilerplate is.

---

## 4. Errors

One unanswered scan per detector, each with a vendor-specific cause:

| Detector | Text | Pass | Cause |
|---|---|---|---|
| Winston AI | C047 | 2 | Request timed out after 30s |
| Copyleaks | C033 | 1 | Completion webhook not received before client timeout |
| GPTZero | C087 | 1 | Document below recommended length for stable classification |
| Originality.ai | C014 | 2 | HTTP 429 on credits request |
| Pangram | C019 | 2 | Job did not reach STAGE_SUCCESS within 45s |

GPTZero's is the only refusal on content grounds, and C087 is a 60-word document
that Winston scored anyway — and got wrong.

---

## Caveats

- **The source texts are not published.** Ground truth comes from the operator's
  logs, cross-checked for agreement across all five files. That catches
  transcription drift, not a mislabelled document. `samples.json` records
  `"sha256": "not-supplied"` for every sample, and until the texts exist nobody
  can confirm what was scanned.
- **n = 21–28 per class.** One document is worth 3–5 points on any rate.
- **No commit–reveal**, so the anti-cherry-picking property this repository
  implements for generated corpora does not apply to this cycle.
- **Eight registered detectors were not run** and are absent rather than
  scored at zero.
- **English only**, single point in time, versions as recorded above.
