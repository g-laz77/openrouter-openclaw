// Defaults for agent metadata when upstream does not supply them.
// When OPENROUTER_API_KEY is set, all inference is routed through OpenRouter.
import { isOpenRouterEnabled } from "./openrouter-routing.js";

export const DEFAULT_PROVIDER = isOpenRouterEnabled() ? "openrouter" : "anthropic";
export const DEFAULT_MODEL = isOpenRouterEnabled() ? "anthropic/claude-opus-4-6" : "claude-opus-4-6";
// Context window: Opus supports ~200k tokens (per pi-ai models.generated.ts for Opus 4.5).
export const DEFAULT_CONTEXT_TOKENS = 200_000;
