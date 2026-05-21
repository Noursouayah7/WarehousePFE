# Grok / External LLM Integration Guide

This document describes a recommended, non-invasive pattern to integrate a Grok-like LLM for paraphrasing and query normalization in the WarehousePFE assistant. It focuses on architecture, safety, prompts, metrics, and operational considerations — no code included.

## Goal

- Improve intent detection and entity extraction by paraphrasing or normalizing free-form user text with a small, deterministic LLM step.
- Preserve correctness by keeping DB-backed business logic deterministic; use the LLM only for language normalization, optional post-processing polishing, or when the rule-based parser returns a clarification.

## Integration Pattern (recommended)

- Add a backend proxy endpoint (e.g., `POST /assistant/paraphrase`) that:
  - sanitizes/redacts sensitive content,
  - builds a clear paraphrase/normalization prompt,
  - calls the external Grok API with backend-stored credentials,
  - returns the paraphrased text to the `AssistantService` for downstream parsing.
- Advantages: keeps API keys server-side, centralizes sanitization, enables caching, rate-limiting, metrics and controlled fallbacks.

## Usage Options

1. Preprocessing (recommended first step)
   - Send the raw user message to the LLM and use the returned paraphrase as input to the existing `IntentEngine` and `SynonymEngine`.
2. Postprocessing / Answer polishing
   - Keep current deterministic query handling. After computing the answer from the database, call LLM only to rephrase the assistant message for improved readability.
3. Hybrid
   - Only call the LLM when the rule-based pipeline returns `clarification`/`unsupported`. The LLM can attempt to extract entities or rephrase the query before asking the user.

## Prompting Guidelines

- Use few-shot examples mapping input → normalized output. Keep examples short and representative.
- Explicitly instruct the model to: "Only paraphrase; do not invent facts or modify entity identifiers." Use low temperature (0–0.3).
- Provide context when possible: a small list of canonical product/warehouse names to guide normalization.

## API & Runtime Considerations

- Authentication: store provider API key on the server (env var), never send from the client.
- Timeouts: keep short (e.g., 1–2s) to avoid blocking assistant responses; implement a fast fallback to the existing parser.
- Rate limiting & quotas: enforce per-user and global caps to control cost/exposure.
- Caching: cache identical user messages' paraphrases to reduce cost.
- Token controls: request minimal tokens since paraphrasing is small.

## Metrics to Track

- LLM call count, latency, token usage, and cost per call.
- Correlate LLM usage with: change in `successRate`, reduction in `clarification` responses`, and changes in average response time.
- Record fallback occurrences (LLM timeout or error) and the resulting parser outcome.

## Privacy & Compliance

- Redact PII or any sensitive fields before sending to the LLM.
- Review vendor data retention and opt-out options; prefer vendors who support opt-out or on-prem variants if privacy is a concern.

## Safety & Correctness

- Do not let LLMs generate answers that replace DB-backed truth. Use LLMs only for phrasing or extracting candidate entities, then validate those entities against your product/catalog before taking action.
- Reject or mark any entity the LLM invents that does not match the canonical catalog.

## Deployment Recommendations

- Start behind a feature flag and run an A/B test: rule-only vs rule+LLM. Measure `successRate`, failed queries, and cost.
- Roll out to trusted roles (e.g., `ADMIN` / `MANAGER`) first.
- Consider persisting paraphrase metrics and sampled paraphrases (redacted) for auditing.

## Next Steps (suggested)

1. Draft precise prompt templates and a minimal API spec for `POST /assistant/paraphrase` (headers, payload, responses, errors).
2. Add server-side middleware for sanitization and rate-limiting.
3. Run an A/B experiment and monitor metrics described above.

---
_This file is a non-code integration plan to help decide how to use an external LLM safely and effectively with the existing rule-based assistant._
