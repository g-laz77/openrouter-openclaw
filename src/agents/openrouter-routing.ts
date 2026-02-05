import type { StreamFn } from "@mariozechner/pi-agent-core";
import type { Api, Model } from "@mariozechner/pi-ai";
import { streamSimple } from "@mariozechner/pi-ai";

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

const PROVIDER_PREFIX_MAP: Record<string, string> = {
  anthropic: "anthropic",
  openai: "openai",
  google: "google",
  "google-vertex": "google",
  mistral: "mistralai",
  xai: "x-ai",
  meta: "meta-llama",
  deepseek: "deepseek",
  qwen: "qwen",
};

export function isOpenRouterEnabled(): boolean {
  return Boolean(process.env.OPENROUTER_API_KEY?.trim());
}

export function getOpenRouterApiKey(): string | undefined {
  return process.env.OPENROUTER_API_KEY?.trim() || undefined;
}

export function mapToOpenRouterModelId(provider: string, modelId: string): string {
  const prefix = PROVIDER_PREFIX_MAP[provider.toLowerCase()] ?? provider.toLowerCase();
  return `${prefix}/${modelId}`;
}

export function parseOpenRouterModelId(openRouterModelId: string): {
  provider: string;
  modelId: string;
} {
  const slashIndex = openRouterModelId.indexOf("/");
  if (slashIndex === -1) {
    return { provider: "unknown", modelId: openRouterModelId };
  }
  return {
    provider: openRouterModelId.slice(0, slashIndex),
    modelId: openRouterModelId.slice(slashIndex + 1),
  };
}

export function createOpenRouterModel(originalModel: Model<Api>): Model<Api> {
  const id =
    originalModel.provider === "openrouter"
      ? originalModel.id
      : mapToOpenRouterModelId(originalModel.provider, originalModel.id);
  return {
    ...originalModel,
    id,
    api: "openai-completions" as Api,
    baseUrl: OPENROUTER_BASE_URL,
    provider: "openrouter",
  };
}

export function createOpenRouterStreamFn(apiKey: string): StreamFn {
  return (model, context, options) =>
    streamSimple(model, context, {
      ...options,
      headers: {
        ...options?.headers,
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://openclaw.ai",
        "X-Title": "OpenClaw",
      },
    });
}

export function resolveRealProviderFromOpenRouter(
  provider: string | undefined | null,
  modelId: string | undefined | null,
): string {
  if (provider !== "openrouter" || !modelId) {
    return provider ?? "";
  }
  const { provider: realProvider } = parseOpenRouterModelId(modelId);
  return realProvider;
}
