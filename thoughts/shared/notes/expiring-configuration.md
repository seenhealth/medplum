<!-- expirations:ignore-file — the example below is an example, not a registration. -->

# Expiring Configuration

This is Seen's fork of Medplum, and the thing that expires here is the fork itself.

`main` is upstream Medplum at v5.1.17, tagged 2026-06-09, with no Seen commits on it at all. A branch that already pulls v5.1.37 exists and is 614 commits ahead; it was never merged. The actual Seen work — porting `@medplum/react` from Mantine to shadcn — lives on another unmerged branch, and it gets harder to rebase every week that gap grows. None of that shows up anywhere: no scheduled job checks it, and this repository has no `upstream` remote, no `CONTRIBUTING.md`, and no `CLAUDE.md` describing how a sync is meant to work.

The convention and the checker are shared across Seen's repos and documented once, in [seen-ehr/docs/expiring-configuration.md](https://github.com/seenhealth/seen-ehr/blob/main/docs/expiring-configuration.md).

## Why these paths

Both files this adds are new filenames that do not exist upstream, so neither conflicts on a future rebase. That is the only reason this note lives under `thoughts/shared/notes/` rather than in `docs/`: Seen's other branches already use `thoughts/` and upstream never will. Anything placed in an upstream-owned path becomes a conflict to resolve on every sync, which is a bad tax to pay for a note about reducing sync friction.

`.expirations.json` at the repository root is the registry. `.github/workflows/expiry-check.yml` runs it daily, posting to Slack when something is overdue or within a week and writing a job summary either way.

## What is registered

**The fork's distance from upstream**, checked quarterly. The action is not only "merge the sync branch" but "write down the procedure", because the absence of one is what turned a routine refresh into two abandoned attempts.

**The unmerged shadcn migration branch**, so parking it stays a decision rather than becoming an accident.

**The inherited upstream workflows and release secrets.** Three weekly schedules came with the fork, and `publish.yml` and `deploy.yml` between them reference around 45 secrets aimed at Medplum's own npm namespace, DockerHub, and staging environment. The annual review is to confirm which are actually enabled here and that nothing is populated that would let this repository publish or deploy on Medplum's behalf.

## Not registered

Upstream's own calendar-bound content — terminology value sets, Node pins, Postgres and Redis versions, action pins — is upstream's to manage and arrives with each sync. Tracking it separately here would duplicate work Medplum already does and create a second thing to keep current.
