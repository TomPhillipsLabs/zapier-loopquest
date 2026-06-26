# zapier-loopquest

A [Zapier](https://zapier.com) integration for [LoopQuest](https://loopquest.tomphillips.uk) — send AI/automation output for gamified human-in-the-loop review.

## What's in it

- **Auth** — API key (Workspaces → API keys). The connection test hits `GET /api/v1/me`.
- **Action: Create Review Task** — POST your content to LoopQuest; a human approves or flags it. Fields: content, title, module, source, external_id, callback_url, reviewers required, idempotency key.

## Getting the verdict back

Reviews are asynchronous (a human takes time), so the action returns a task id immediately. To act on the verdict, use a second Zap triggered by **Webhooks by Zapier → Catch Hook**:

1. Create a Zap with a **Catch Hook** trigger and copy its URL.
2. In your *Create Review Task* step, set **Callback URL** to that hook URL.
3. When the human decides, LoopQuest POSTs the signed verdict (with `external_id` + `source` for correlation) to the hook, starting the second Zap.

## Develop / deploy

```bash
npm install
npm test                       # schema + unit checks
npx zapier login
npx zapier register "LoopQuest"   # first time only
npx zapier push                # upload this version
```

Then enable it on your account and, when ready, submit it for Zapier's public app review.

## License

MIT
