import type { ProviderUsageSnapshot } from "./provider-usage.types.js";
import { fetchJson } from "./provider-usage.fetch.shared.js";

type OpenRouterKeyInfoResponse = {
  data?: {
    label?: string;
    usage?: number;
    limit?: number | null;
    is_free_tier?: boolean;
    rate_limit?: {
      requests?: number;
      interval?: string;
    };
  };
};

export async function fetchOpenRouterUsage(
  apiKey: string,
  timeoutMs: number,
  fetchFn: typeof fetch,
): Promise<ProviderUsageSnapshot> {
  const res = await fetchJson(
    "https://openrouter.ai/api/v1/auth/key",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
    },
    timeoutMs,
    fetchFn,
  );

  if (!res.ok) {
    return {
      provider: "openrouter" as never,
      displayName: "OpenRouter",
      windows: [],
      error: `HTTP ${res.status}`,
    };
  }

  const data = (await res.json()) as OpenRouterKeyInfoResponse;
  const usage = data.data?.usage ?? 0;
  const limit = data.data?.limit;

  const windows = [];
  if (typeof limit === "number" && limit > 0) {
    const usedPercent = Math.min(100, Math.max(0, (usage / limit) * 100));
    windows.push({
      label: "Credit",
      usedPercent,
    });
  }

  return {
    provider: "openrouter" as never,
    displayName: "OpenRouter",
    windows,
    plan: data.data?.is_free_tier ? "Free Tier" : data.data?.label || undefined,
  };
}
