# zapier-loopquest

A [Zapier](https://zapier.com) integration for [LoopQuest](https://loopquest.tomphillips.uk) — put a human in the loop on your AI and automation output. **Block** a downstream action until a person approves it (gate), or review quality in the **background** without pausing anything (monitor).

## What's in it

- **Auth** — API key (Workspaces → API keys). The connection test hits `GET /api/v1/me` and labels the connection with the workspace name.
- **Action: Create Review Task** — send content to a human. Pick the game (Swiper, Versus, Sorter, Detective, Fixer, Redact, Grounding) and the mode (gate or monitor); optional timeout + on-timeout fallback. Returns the task `id`.
- **Trigger: New Verdict** — a REST Hook that fires the moment a review resolves. Gives you the verdict, choice, reason, flags (`escalated`, `timed_out`) and your `external_id`. Zapier subscribes/unsubscribes automatically when you turn the Zap on/off.

## Gate vs monitor

- **Monitor** — Create Review Task and carry on. Reviews happen in the background for quality and audit; nothing waits.
- **Gate** — Zaps are linear, so you split the flow across two Zaps:
  1. **Zap A** does the work, then **Create Review Task** with **Mode = Gate**.
  2. **Zap B** starts from the **New Verdict** trigger, then branches (Paths/Filter): on `verdict = true` run the real action; on a flag or timeout route to a fallback.

  The action never runs unless a human approves — that's the "stop". The **External ID** you set on the task comes back on the verdict so Zap B knows which item to act on. Set a **Timeout** + **On Timeout** so a gate never hangs (defaults to escalate, fail-closed).

## Develop / deploy

```bash
npm install
npm test                          # schema + unit checks
npx zapier login
npx zapier register "LoopQuest"   # first time only, creates the app
npx zapier push                   # upload this version
```

Then, in the Zapier developer platform:

1. **Add it to your account** and build a test Zap for each item — Create Review Task, and a New Verdict Zap (turn it on so the subscription registers, then resolve a task to see it fire).
2. Fill in the **app profile** (logo, description, category), homepage `https://loopquest.tomphillips.uk`, and a support contact.
3. Submit for **public review** (`npx zapier promote <version>` then request publishing). Zapier's reviewer will want: working auth, the trigger's sample data (served by `GET /api/v1/verdicts`), and clear field labels — all present here.

## API endpoints used

| Component | Call |
|-----------|------|
| Auth test | `GET /api/v1/me` |
| Create Review Task | `POST /api/v1/tasks` |
| New Verdict — subscribe | `POST /api/v1/hooks` `{ url }` |
| New Verdict — unsubscribe | `DELETE /api/v1/hooks/{id}` |
| New Verdict — sample / test | `GET /api/v1/verdicts` |

Full API: https://loopquest.tomphillips.uk/docs · spec: https://loopquest.tomphillips.uk/openapi.json

## License

MIT
