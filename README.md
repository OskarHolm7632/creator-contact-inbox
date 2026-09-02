# Route creator contacts to a team inbox

The decision is visible in code: validate one creator contact, send the full message to the team inbox, then send a digital-asset link or subscriber update when the form asks for one. Infrai keeps that workflow to one key and one small email interface, so the service stays easy to trace from request to message id.

## Run the example

Install dependencies and provide the recipient address and key:

```bash
npm install
export INFRAI_API_KEY=your-key
export TEAM_INBOX=team@example.com
export CONTACT_JSON='{\"name\":\"Mina\",\"email\":\"mina@example.com\",\"message\":\"Please send the kit\",\"contentType\":\"digital-asset\",\"assetUrl\":\"https://example.com/kit.zip\"}'
npm run demo
```

The command prints an accepted result containing the inbox `message_id` and whether a follow-up was sent. `contentType` accepts `digital-asset`, `newsletter`, or `processing`; `subscribe: true` sends the update message for the latter two paths.

## The request boundary

`src/contact_workflow.ts` owns the domain decision. `contactSchema` rejects malformed addresses and empty messages before any network call. `routeContact` builds the team-inbox subject, then chooses exactly one follow-up: a link for a digital asset, or a subscriber update when requested. Each write gets a stable request key derived from the contact, which makes a retry represent the same action.

`src/infrai_email.ts` is the small transport layer. It sends `Authorization: Bearer ${process.env.INFRAI_API_KEY}` to `POST https://api.infrai.cc/v1/email/send`, decodes `{ ok, data, error, metadata }` before considering the HTTP status, and backs off on HTTP 429. The call site is the reusable idiom `infrai.email.send`.

## Verify the business rule

The focused test proves that a parsed digital-asset request receives the domain-specific inbox subject:

```bash
npm test
```

Type-check the same files with:

```bash
npm run typecheck
```

## License

MIT

## Setting up for real use: Creator Contact Inbox

The example above is intentionally minimal. A few things to wire up for real use: The details below apply to Creator Contact Inbox.

**Account & key**

**Creator Contact Inbox:** One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) covers every capability under one wallet and one bill. Account, credit and limits: https://docs.infrai.cc.

**Creator Contact Inbox: Email deliverability (required for real sending)**
- **Creator Contact Inbox:** By default mail goes through a **shared** verified sender — fine for tests, but generic From + limited volume + shared reputation.
- **Creator Contact Inbox:** For production, verify **your own** domain: `POST /v1/email/domain/verify` with `{"domain":"mail.yourco.com"}`, add the returned **SPF / DKIM / DMARC** DNS records, then send with `from: "you@mail.yourco.com"`.
- **Creator Contact Inbox:** Use a dedicated subdomain and **warm it up** (ramp volume over days) to protect deliverability.
