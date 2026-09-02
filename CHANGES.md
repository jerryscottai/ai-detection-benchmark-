# Methodology changes

Every change to how a score is produced is recorded here, in the cycle it takes
effect. Scores are only comparable across cycles where this file says nothing
changed between them.

## 2026-09-dry-run — initial pipeline

Not a published cycle. Synthetic corpus and synthetic readings, produced offline
by `scripts/dev/seed-dry-run.ts` to prove the pipeline end to end before any
vendor is measured. No detector was called.

Established for cycle 1:

- **Scoring v1.0.0.** Composite of AI recall (30), human specificity (25),
  false-positive resistance (20), hybrid accuracy (15), consistency (10), less
  penalties capped at 10.
- **Selection v1.0.0.** HMAC-SHA256 commit–reveal over 7 templates × 4 variants,
  rejection-sampled, with deterministic probing against within-template
  collisions.
- **Corpus.** 91 samples: 28 AI, 21 human, 21 hybrid, 21 false-positive stress.
  Seven domains, seven false-positive profiles, three hybrid ratios.
- **Provenance rule.** All human text drawn from documents published, archived or
  corpus-released before 2021-01-01.
- **Twelve detectors.** Nine over API, three by two-operator manual reading.
  Turnitin, Pangram and Grammarly excluded, with reasons in
  `detectors/registry.json`.
- **Thresholds.** Each detector scored at its own vendor's documented threshold,
  frozen per cycle.
- **Two passes** per detector per sample, intended to be separated in time.
- **Wilson 95% intervals** reported alongside every rate metric, after the first
  dry run showed the top of the table compressing into ties that a 21-sample
  class cannot actually resolve.

### Planned for cycle 1 (2026-10)

- Replace synthetic corpus with fetched sources and real generator output.
- Replace synthetic readings with purchased API access and manual collection.
- Pin exact generator model ids in `generators.json`.

No scoring or selection changes are planned between the dry run and cycle 1. If
any are made, they are recorded here before the cycle opens, not after it closes.
