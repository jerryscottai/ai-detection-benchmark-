# Methodology changes

Every change to how a score is produced is recorded here, in the cycle it takes
effect. Scores are only comparable across cycles where this file says nothing
changed between them.

## methodology/v1 — established for cycle 2026-10

- **Scoring v1.0.0.** Composite of AI recall (30), human specificity (25),
  false-positive resistance (20), hybrid accuracy (15), consistency (10), less
  penalties capped at 10. Wilson 95% intervals reported alongside every rate
  metric, because a 21–28 sample class cannot resolve the differences a bare
  ranking implies.
- **Selection v1.0.0.** HMAC-SHA256 commit–reveal over 7 templates × 4 variants,
  rejection-sampled to avoid modulo bias, with deterministic probing against
  within-template collisions.
- **Corpus.** 91 samples: 28 AI, 21 human, 21 hybrid, 21 false-positive stress.
  Seven domains, seven false-positive profiles, three hybrid ratios.
- **Provenance rule.** All human text drawn from documents published, archived or
  corpus-released before 2021-01-01. Source texts are not redistributed; the
  manifests carry pointers, spans, licences and hashes.
- **Twelve detectors.** Nine over API, three by two-operator manual reading.
  Turnitin, Pangram and Grammarly excluded, with reasons in
  `detectors/registry.json`.
- **Thresholds.** Each detector scored at its own vendor's documented threshold,
  frozen per cycle.
- **Two passes** per detector per sample, separated in time rather than run back
  to back, so the consistency metric measures something.

Opening a cycle freezes a copy of `methodology/v1/scoring.js` and
`select-placeholders.js` into that cycle's directory. Those copies are never
edited. A methodology change means adding `methodology/v2` and an entry here,
before the cycle that uses it opens — never after one closes.

## Cycle history

Cycle 1 (`2026-10`) is in collection. Nothing has been published yet, so there is
nothing to compare against; this section fills in from here.
