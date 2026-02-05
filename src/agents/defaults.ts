// Defaults for agent metadata when upstream does not supply them.
// When OPENROUTER_API_KEY is set, all inference is routed through OpenRouter.
export const DEFAULT_PROVIDER = "openrouter";
export const DEFAULT_MODEL = "anthropic/claude-opus-4-6";
// Context window: Opus supports ~200k tokens (per pi-ai models.generated.ts for Opus 4.5).
export const DEFAULT_CONTEXT_TOKENS = 200_000;
