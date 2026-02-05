# OpenRouter-OpenClaw

> Fork of [OpenClaw](https://github.com/openclaw/openclaw) (MIT License, Copyright (c) 2025 Peter Steinberger)
> with [OpenRouter](https://openrouter.ai) integrated as the default inference provider.

## What Changed

- All model inference routes through OpenRouter when `OPENROUTER_API_KEY` is set
- Native Anthropic/provider-direct paths preserved as fallback when env var is unset
- Model aliases (opus, sonnet, gpt, gemini, etc.) resolve through OpenRouter

## Setup

### Prerequisites

- Node >= 22
- An OpenRouter API key from https://openrouter.ai

### Install & Run

```bash
pnpm install
pnpm build

export OPENROUTER_API_KEY="sk-or-v1-..."

# Run the gateway
pnpm openclaw gateway --port 18789 --verbose

# Or run the agent directly
pnpm openclaw agent --message "Hello" --json
```

### Without OpenRouter (native providers)

If `OPENROUTER_API_KEY` is not set, the system falls back to native provider
APIs (requires `ANTHROPIC_API_KEY` or OAuth).

## Upstream

This project is forked from [openclaw/openclaw](https://github.com/openclaw/openclaw).
All original documentation, channels, apps, and features from upstream apply.
See the [upstream README](https://github.com/openclaw/openclaw#readme) and
[docs](https://docs.openclaw.ai) for full reference.

## License

MIT — see [LICENSE](LICENSE).
Original copyright: Peter Steinberger and contributors.
