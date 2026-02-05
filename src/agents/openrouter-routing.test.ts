import type { Api, Model } from "@mariozechner/pi-ai";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  mapToOpenRouterModelId,
  parseOpenRouterModelId,
  createOpenRouterModel,
  createOpenRouterStreamFn,
  isOpenRouterEnabled,
  getOpenRouterApiKey,
  resolveRealProviderFromOpenRouter,
} from "./openrouter-routing.js";

describe("mapToOpenRouterModelId", () => {
  it("maps anthropic model to openrouter format", () => {
    expect(mapToOpenRouterModelId("anthropic", "claude-opus-4-6")).toBe(
      "anthropic/claude-opus-4-6",
    );
  });

  it("maps openai model to openrouter format", () => {
    expect(mapToOpenRouterModelId("openai", "gpt-5.2")).toBe("openai/gpt-5.2");
  });

  it("maps google model to openrouter format", () => {
    expect(mapToOpenRouterModelId("google", "gemini-3-pro-preview")).toBe(
      "google/gemini-3-pro-preview",
    );
  });

  it("maps mistral to mistralai prefix", () => {
    expect(mapToOpenRouterModelId("mistral", "devstral-medium")).toBe(
      "mistralai/devstral-medium",
    );
  });

  it("maps xai to x-ai prefix", () => {
    expect(mapToOpenRouterModelId("xai", "grok-3")).toBe("x-ai/grok-3");
  });

  it("uses provider as-is for unknown providers", () => {
    expect(mapToOpenRouterModelId("custom-provider", "model-1")).toBe(
      "custom-provider/model-1",
    );
  });

  it("lowercases provider name", () => {
    expect(mapToOpenRouterModelId("Anthropic", "claude-opus-4-6")).toBe(
      "anthropic/claude-opus-4-6",
    );
  });
});

describe("parseOpenRouterModelId", () => {
  it("extracts provider and modelId from openrouter format", () => {
    expect(parseOpenRouterModelId("anthropic/claude-opus-4-6")).toEqual({
      provider: "anthropic",
      modelId: "claude-opus-4-6",
    });
  });

  it("handles models with multiple slashes", () => {
    expect(parseOpenRouterModelId("meta-llama/llama-4/maverick")).toEqual({
      provider: "meta-llama",
      modelId: "llama-4/maverick",
    });
  });

  it("returns unknown provider for models without slash", () => {
    expect(parseOpenRouterModelId("some-model")).toEqual({
      provider: "unknown",
      modelId: "some-model",
    });
  });
});

describe("createOpenRouterModel", () => {
  const baseModel: Model<Api> = {
    id: "claude-opus-4-6",
    name: "Claude Opus 4.6",
    api: "anthropic-messages",
    provider: "anthropic",
    reasoning: false,
    input: ["text", "image"],
    cost: { input: 15, output: 75, cacheRead: 2, cacheWrite: 10 },
    contextWindow: 200000,
    maxTokens: 8192,
  } as Model<Api>;

  it("sets api to openai-completions", () => {
    const result = createOpenRouterModel(baseModel);
    expect(result.api).toBe("openai-completions");
  });

  it("sets provider to openrouter", () => {
    const result = createOpenRouterModel(baseModel);
    expect(result.provider).toBe("openrouter");
  });

  it("maps the model id to openrouter format", () => {
    const result = createOpenRouterModel(baseModel);
    expect(result.id).toBe("anthropic/claude-opus-4-6");
  });

  it("sets baseUrl to OpenRouter API", () => {
    const result = createOpenRouterModel(baseModel);
    expect(result.baseUrl).toBe("https://openrouter.ai/api/v1");
  });

  it("preserves original metadata", () => {
    const result = createOpenRouterModel(baseModel);
    expect(result.name).toBe("Claude Opus 4.6");
    expect(result.contextWindow).toBe(200000);
    expect(result.cost).toEqual(baseModel.cost);
    expect(result.input).toEqual(["text", "image"]);
    expect(result.reasoning).toBe(false);
  });
});

describe("createOpenRouterStreamFn", () => {
  it("returns a function", () => {
    const streamFn = createOpenRouterStreamFn("test-key");
    expect(typeof streamFn).toBe("function");
  });
});

describe("isOpenRouterEnabled", () => {
  let previousKey: string | undefined;

  beforeEach(() => {
    previousKey = process.env.OPENROUTER_API_KEY;
  });

  afterEach(() => {
    if (previousKey === undefined) {
      delete process.env.OPENROUTER_API_KEY;
    } else {
      process.env.OPENROUTER_API_KEY = previousKey;
    }
  });

  it("returns true when OPENROUTER_API_KEY is set", () => {
    process.env.OPENROUTER_API_KEY = "sk-or-v1-test";
    expect(isOpenRouterEnabled()).toBe(true);
  });

  it("returns false when OPENROUTER_API_KEY is not set", () => {
    delete process.env.OPENROUTER_API_KEY;
    expect(isOpenRouterEnabled()).toBe(false);
  });

  it("returns false when OPENROUTER_API_KEY is empty", () => {
    process.env.OPENROUTER_API_KEY = "   ";
    expect(isOpenRouterEnabled()).toBe(false);
  });
});

describe("getOpenRouterApiKey", () => {
  let previousKey: string | undefined;

  beforeEach(() => {
    previousKey = process.env.OPENROUTER_API_KEY;
  });

  afterEach(() => {
    if (previousKey === undefined) {
      delete process.env.OPENROUTER_API_KEY;
    } else {
      process.env.OPENROUTER_API_KEY = previousKey;
    }
  });

  it("returns trimmed key when set", () => {
    process.env.OPENROUTER_API_KEY = "  sk-or-v1-test  ";
    expect(getOpenRouterApiKey()).toBe("sk-or-v1-test");
  });

  it("returns undefined when not set", () => {
    delete process.env.OPENROUTER_API_KEY;
    expect(getOpenRouterApiKey()).toBeUndefined();
  });
});

describe("resolveRealProviderFromOpenRouter", () => {
  it("extracts anthropic from openrouter model id", () => {
    expect(
      resolveRealProviderFromOpenRouter("openrouter", "anthropic/claude-opus-4-6"),
    ).toBe("anthropic");
  });

  it("returns provider as-is when not openrouter", () => {
    expect(resolveRealProviderFromOpenRouter("anthropic", "claude-opus-4-6")).toBe(
      "anthropic",
    );
  });

  it("returns empty string for null/undefined provider", () => {
    expect(resolveRealProviderFromOpenRouter(null, "model")).toBe("");
    expect(resolveRealProviderFromOpenRouter(undefined, "model")).toBe("");
  });

  it("returns openrouter when modelId is null", () => {
    expect(resolveRealProviderFromOpenRouter("openrouter", null)).toBe("openrouter");
  });
});
