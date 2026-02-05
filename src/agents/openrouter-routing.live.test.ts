import { describe, expect, it } from "vitest";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY?.trim();
const SKIP = !OPENROUTER_API_KEY;

describe.skipIf(SKIP)("OpenRouter live integration", () => {
  it("fetches key info from OpenRouter API", async () => {
    const res = await fetch("https://openrouter.ai/api/v1/auth/key", {
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        Accept: "application/json",
      },
    });
    expect(res.ok).toBe(true);
    const data = (await res.json()) as { data?: { usage?: number } };
    expect(data.data).toBeDefined();
    expect(typeof data.data?.usage).toBe("number");
  });

  it("completes a streaming chat request via OpenRouter", async () => {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://openclaw.ai",
        "X-Title": "OpenClaw Test",
      },
      body: JSON.stringify({
        model: "anthropic/claude-sonnet-4-5",
        messages: [{ role: "user", content: "Reply with just the word 'hello'." }],
        max_tokens: 16,
        stream: false,
      }),
    });
    expect(res.ok).toBe(true);
    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    expect(data.choices).toBeDefined();
    expect(data.choices!.length).toBeGreaterThan(0);
    expect(data.choices![0].message?.content?.toLowerCase()).toContain("hello");
  });

  it("returns 401 for invalid key", async () => {
    const res = await fetch("https://openrouter.ai/api/v1/auth/key", {
      headers: {
        Authorization: "Bearer sk-or-v1-invalid-key",
        Accept: "application/json",
      },
    });
    expect(res.status).toBe(401);
  });
});
