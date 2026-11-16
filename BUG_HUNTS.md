# Bug Hunt Log

A running log of code-audit / bug-hunt sessions on this app. Purpose: so the
next session (human or Claude) doesn't re-discover the same bugs from
scratch, doesn't lose track of what was found-but-deferred, and has a
process to follow rather than reinventing one each time.

This complements (doesn't replace) Claude Code's own memory of this project
for sessions that have it — this file is the durable, repo-visible version
that survives even without that memory.

---

## Open / Deferred Items

Things found during a hunt but **not yet fixed**. Check this list first —
if you're about to "find" one of these, it's already known; either fix it
or explicitly decide it's still not worth fixing yet.

- [ ] **Unescaped task/project fields in HTML report & PDF generation.** The
  2026-11-15 hunt fixed unescaped `innerHTML` injection in the three live
  DOM-rendering functions (`createDailyTaskElement`, `createProjectTaskElement`,
  `createSubtaskHTML`), but the *same bug class* likely still exists in the
  HTML-report/PDF generation paths (`generateHtmlReport`, `generateTabbedHtmlReport`,
  and similar — look for template literals building `<span>${task.title}</span>`-
  style strings around the report/export functions in `app.js`). Not re-verified
  line-by-line, just flagged by pattern — check before assuming it's real.
- [ ] **`completionLinks` isn't scheme-validated.** Escaping fixes HTML/attribute
  breakout, but a `javascript:` URI in a completion link would still execute on
  click. Low severity for a single-user personal app (you'd be attacking
  yourself), but worth a scheme allowlist (`http:`/`https:`) if this is ever
  touched again.
- [ ] **Duplicated GitHub PUT boilerplate** between `saveData()`/`performSave()`
  and `archiveOldData()`/`saveArchiveYear()` — candidate for a shared
  `putGitHubFile(path, content, sha)` helper.
- [ ] **~20 inline duplicates of existing task/subtask-lookup helpers**
  (`state.data.projects.find(...).tasks.find(...)` repeated ad hoc instead of
  using a shared lookup function) — simplification opportunity, not a bug.
- [ ] **`renderAllViews()` re-renders every view on every mutation**, even
  views the user isn't looking at — efficiency, not correctness.
- [ ] **Two parallel report-generation pipelines** (tabbed vs. non-tabbed
  monthly report) with significant logic duplication — could likely be
  unified, lower priority.

Nothing above is a confirmed data-loss bug. If you fix one, move it to the
session log below with a ✅ and a one-line note on what changed.

---

## How to Run a Bug Hunt

1. **Fan out at least two independent reviews in parallel** rather than one:
   - One general-purpose review targeted at whatever area is highest-risk
     right now (for this app, that's historically the GitHub sync/archive
     path — see `fix_github_sync.md` / `project_dashboard.md` in Claude Code
     memory, or the Session Log below if memory isn't available).
   - One broader pass (the `code-review` skill at `high` effort against
     `app.js` works well) to catch things outside that focus area.
   - Independent reviews that converge on the same finding (as happened with
     the stale-sha bug on 2026-11-15) are a strong signal the finding is real.
2. **Give the retention-focused review the actual incident history**, not
   just "look for bugs" — past root causes, past wrong fixes, and the
   specific failure patterns already seen in this app. A cold review with no
   history re-derives surface-level issues; one with history catches
   regressions of *specific* past bugs (which is what actually happened in
   past sessions — a bug fixed once came back twice).
3. **Re-verify every finding against the live code before fixing it.** Agent
   reports are a lead, not ground truth — read the actual function, confirm
   the failure scenario is real and still current, then fix. Don't batch-apply
   suggested fixes without reading the code they touch.
4. **Prioritize data-loss / data-integrity bugs first**, then security, then
   smaller correctness bugs, then defer pure refactors/simplification unless
   they're nearly free — this is a live app holding real personal data, and
   refactors carry more regression risk than value in a time-boxed hunt.
5. **Update this file and Claude Code memory (`project_dashboard.md`,
   `fix_github_sync.md`) in the same session**, not as an afterthought —
   that's the whole point of the log.
6. Before touching the GitHub sync/archive path specifically: re-read
   `fix_github_sync.md`'s "How to apply" section first. It has caught real
   regressions (Fix 5's bug came back twice before being fixed for real in
   Fix 6).

---

## Session Log

### 2026-11-15 — Data retention + general correctness audit

**Trigger:** Proactive ask ("clear tech debt, especially data retention
bugs") — not an incident response. Nothing was confirmed broken going in.

**Method:** Two parallel subagent reviews (see "How to Run a Bug Hunt"
above — this session is what that process is based on): one given the full
sync-incident history and told to hunt specifically for data-retention
failure patterns; one running the `code-review` skill at `high` effort
generally over `app.js`. Every finding from both was re-read against the
actual code before fixing; none were batch-applied blind.

**Fixed** (commit `ea757d0`, plus the related Linear-export feature work
earlier the same session in `3bb0ac4`/`77d4c42`):

1. ✅ **Stale `state.fileSha` never refreshed after a failed save** — every
   retry (automatic or manual) reused the same wrong sha, so once it went
   stale, sync failed *permanently* until a hard reload. This is the actual
   root cause a September incident (`fix_github_sync.md` Fix 5) suspected but
   never fixed — Fix 5 only corrected the misleading toast, not this. Fixed
   with a new `refreshFileSha()` call on every failed save, before retrying.
2. ✅ **No concurrency guard on `saveData()`** — two near-simultaneous saves
   could race on the same sha, triggering #1. Fixed by coalescing concurrent
   calls into one in-flight request plus a guaranteed follow-up save.
3. ✅ **`saveTaskInternal()` showed "Task saved" unconditionally**, ignoring
   whether `saveData()` actually succeeded — a regression of Fix 5's exact
   bug class, on the single most common write path in the app (the task
   create/edit form).
4. ✅ **`rescheduleTaskByKey()` (drag-and-drop) called `saveData()` without
   even `await`ing it**, and showed success unconditionally — same bug class
   as #3, on the calendar drag-and-drop path.
5. ✅ **`taskOrder` was never added to `archiveOldData()`'s migration keys**
   after being introduced post-archive-system — grew unboundedly, unarchived,
   silently re-exposing the original data.json-bloat bug class (Fix 2).
6. ✅ **Reports, AI summaries, the Linear export, weekly summaries, and the
   Previous-day view never called `ensureYearLoaded`** before reading a date
   range — only calendar-navigation code paths did. A fresh session (nothing
   yet in `state.archiveCache`) generating any of these for an old date range
   would silently get empty/incomplete results with *no warning*. Fixed with
   a new shared `ensureYearsLoadedForRange()` helper wired into every one of
   those entry points.
7. ✅ **Weekly-summary "already exists" detection and `generatedAt`
   preservation read `state.data.weeklySummaries` directly**, never checking
   the archive — so an old (archived) week's existing summary silently
   appeared not to exist. New `getWeeklySummaryEntry()` helper fixes this.
8. ✅ **`getScheduledItemsInRange` (used by monthly reports and the Linear
   export) never checked `state.archiveCache`** for `scheduledItems` at all,
   even opportunistically. Fixed to merge both sources.
9. ✅ **Completing a parent task auto-completes its subtasks in memory only**
   — their `scheduledItems.completedOnDay` and `completedTasks` entries were
   never updated, so cascaded subtask completions were invisible to day
   views, monthly/weekly reports, and the Linear export despite being marked
   done. Fixed in `toggleProjectTaskComplete`.
10. ✅ **XSS: unescaped task/project/subtask titles and completion
    notes/links inserted directly into `innerHTML`** in the three main live
    task-rendering functions. Low real-world risk (single-user app) but a
    real gap given the page also holds the GitHub token in `localStorage`.
    Fixed with the `escapeHtml()` helper that was already used elsewhere in
    the codebase but not applied consistently.
11. ✅ **Day-list sort: `priorityOrder.high` is `0`**, which the old
    `priorityOrder[x] || 1` fallback treated as "missing" and collapsed to
    the same weight as `medium` — classic JS falsy-zero bug. High-priority
    tasks did not reliably sort above medium. Fixed with `??`.
12. ✅ **`toggleDailyTaskComplete` never called `maybeResolveTentativeWindow`**
    on completion, unlike `toggleProjectTaskComplete`/`toggleSubtaskComplete`
    — completing a task via a day-list checkbox left a pencilled-in
    tentative window stuck showing even though the task was done.
13. ✅ **Two unguarded `JSON.parse` calls on cached `localStorage` data**
    (`initAuth`'s stored user, `loadData`'s localStorage fallback) could
    throw on corrupted cache, landing past `showDashboard()`/`hideLoading()`
    and leaving a blank screen or a stuck loading spinner with no recovery
    path short of manually clearing storage via devtools. Both now fail
    gracefully.

**Checked, confirmed no issue:**
- The delete-before-confirm-write pattern (the Fix-5 hardening) — only
  exists in `archiveOldData`, and it's correctly guarded there. No sibling
  instance elsewhere.
- Third sibling `fetch(download_url)` missing an `Authorization` header —
  only two such calls exist (`loadData`, `ensureYearLoaded`), both already
  correctly fixed (Fix 3).
- The new Linear-export feature writing to `state.data` or triggering a
  save — confirmed fully read-only (see `linear_export.md` in memory).
- A localStorage-fallback-vs-fresh-remote-data race on load — confirmed the
  fallback only runs inside the already-failed-load catch block; no race.

**Deferred:** see "Open / Deferred Items" above.
