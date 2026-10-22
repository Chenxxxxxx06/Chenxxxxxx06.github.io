# Ask Chen API

Ask Chen is a closed-set personal knowledge service. Every factual answer comes from `api/_lib/catalog.mjs`. With no API endpoint configured, the static homepage matches common questions against the generated public notes in the browser. With an API endpoint configured, Qwen3.8-Flash selects an approved intent; it never supplies the answer text.

After changing the approved catalog or policy, regenerate the public asset:

```powershell
node scripts/export-public-knowledge.mjs
```

The test suite checks that the generated file matches its source. Only the approved catalog, topic hints, and public refusal text are exported; no environment variables or private documents are read. Static-mode questions remain in the browser.

## Boundary

The request path is deliberately ordered:

1. Validate and normalize the payload.
2. Reject sensitive, injected, outside, or mixed-scope requests without calling a model.
3. Ask Qwen3.8-Flash for one JSON intent only.
4. Validate the exact enum.
5. Return the corresponding approved bilingual catalog entry.

The catalog contains no private resume file and no academic metrics. Unknown routes fail closed.

## Local preview

```powershell
Copy-Item .env.example .env.local
# Put the DashScope key only in .env.local.
npm run sync:preview
npm run preview
```

Then open `http://127.0.0.1:4000/`. The server serves `_site` and handles same-origin `POST /api/ask`.

## Server variables

| Variable | Purpose | Default |
| --- | --- | --- |
| `DASHSCOPE_API_KEY` | Server secret | required |
| `DASHSCOPE_BASE_URL` | OpenAI-compatible base URL | `https://dashscope.aliyuncs.com/compatible-mode/v1` |
| `ASK_CHEN_MODEL` | Router model | `qwen3.8-flash` |
| `ASK_CHEN_ALLOWED_ORIGINS` | Exact CORS origins, comma-separated | local preview + homepage |
| `ASK_CHEN_REQUIRE_ORIGIN` | Reject requests without a browser `Origin` header | `true` on Vercel; `false` locally |
| `ASK_CHEN_TRUST_PROXY` | Trust `X-Forwarded-For` only behind a controlled proxy | `true` on Vercel; `false` locally |
| `ASK_CHEN_PORT` | Local preview port | `4000` |

## Production

`api/ask.mjs` is a dependency-free Node/Vercel function. Deploy it on a serverless Node host with the variables above. If the homepage stays on GitHub Pages, set the public URL in `_config.yml`:

```yaml
ask_chen:
  endpoint: "https://YOUR-SERVERLESS-HOST/api/ask"
```

Only this public endpoint belongs in Jekyll. Keep `DASHSCOPE_API_KEY` in the serverless provider's secret store.
Keep the production origin requirement enabled. The function applies per-process minute/hour limits; add the host's shared rate limit or WAF rule when running across multiple serverless instances.

An empty public endpoint uses the static public-note mode. Its badge says “Public notes” and does not imply a model connection. Unknown questions receive a short explanation instead of an invented answer. A failed note load can be retried by asking again. Setting an endpoint uses the actual service and preserves visible error/retry states. GitHub Pages serves the static homepage and does not run `api/ask.mjs`.

The browser supports Enter or the visible Ask button, project/research examples, and clickable HTTP(S) sources. It blocks duplicate submissions while a request is pending and keeps the question after a timeout, malformed response, service failure, or rate limit so visitors can retry. No live model call is made during tests.

## Response contract

```json
{
  "status": "answered",
  "answer": "An approved catalog answer.",
  "sources": [{"id": "labvla", "label": "Portfolio · LabVLA", "url": "https://github.com/zjunlp/LabVLA"}]
}
```

Policy states are `refused`, `insufficient`, `rate_limited`, and `upstream_error`. They never contain an upstream model answer.

## Tests

```powershell
npm test
```

The suite verifies sensitive and outside-scope blocking, zero upstream calls on hard refusals, the exact DashScope request shape, fail-closed routing, and synchronization of the shipped public notes. The UI suite executes the actual browser script against a small DOM test harness to cover static bilingual answers, private/unknown questions, safe source links, duplicate submissions, focus, and retry behavior for both modes. No live model calls are made during tests.
