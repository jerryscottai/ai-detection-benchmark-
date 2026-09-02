# Contributing

## Reporting a wrong number

The most valuable contribution. Open an issue with:

- the cycle and the detector,
- the sample id,
- the reading you got, with a date and the plan you were on.

Detectors change silently, so a difference is not automatically an error — but a
reproducible one is folded into the next cycle and recorded in `CHANGES.md`.

## Disputing the methodology

Also welcome, and more useful than it sounds, because you can make the argument
concretely. Edit `WEIGHTS` in a cycle's `scoring.js`, run `npm run score`, and
open an issue with your weighting and the table it produces. An argument that
comes with a re-derived leaderboard is much harder to wave away than one that
does not.

The same applies to the corpus. If you think a false-positive profile is missing,
or that a human sample is not representative, say which entry and what should
replace it. Manifest entries need a source, a URL, a span, a licence and a
pre-2021 date.

## Proposing a detector

Open an issue with the tool, its pricing page, and its API documentation. The
bar for inclusion is:

1. **Purchasable independently.** If a benchmark reader cannot buy access and
   reproduce the result, it does not go in the registry — this is why Turnitin is
   excluded despite being the most consequential detector in education.
2. **A comparable output.** A numeric AI probability or a documented band, at a
   documented threshold. A traffic light with no number cannot be scored on the
   same axis as the rest.
3. **Stable enough to re-test.** A tool that changes its API between cycles can
   be included, but its history has to record the change.

No-API tools are includable through the manual path, which costs an operator
several hours per cycle — say so in the issue if you are volunteering.

## Vendors

You are welcome here, and there is one rule: no preferential access. Nobody sees
results before publication, nobody receives the corpus in advance, and nothing is
changed on request without a public record of what changed and why.

If you believe a cycle got your product wrong, the useful form of a dispute is a
re-run. Everything you need is in this repository: the prompts, the manifests,
the thresholds, the scoring code. If your re-run disagrees with ours, that is a
finding and it will be published as one.

## Code

```bash
npm install
npm run typecheck
npm run seed-dry-run    # rebuilds the dry-run cycle deterministically
npm run verify          # must pass all eight checks
```

Two rules that matter more than style:

- **Never edit a published cycle's `scoring.js` or `select-placeholders.js`.**
  They are frozen copies, not shared modules. A methodology change gets a new
  copy in the next cycle and an entry in `CHANGES.md`.
- **Keep `scoring.js` pure.** No I/O, no clock, no randomness, no dependencies.
  If it cannot be re-run offline by a stranger in five years, verification is
  theatre.
