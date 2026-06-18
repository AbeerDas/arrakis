import OpenAI from "openai";
import {
  OPENROUTER_DEFAULT_MODEL,
  optionalEnv,
  requireEnv,
} from "@/lib/env";

let client: OpenAI | undefined;

/**
 * OpenRouter client for the email generator. OpenRouter is OpenAI-compatible,
 * so we reuse the `openai` SDK pointed at OpenRouter's base URL. The model is
 * configurable via OPENROUTER_MODEL and defaults to a Claude Sonnet slug.
 *
 * This is the wiring only — the generation feature is built later.
 */
export function getOpenRouter(): OpenAI {
  if (!client) {
    client = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: requireEnv("OPENROUTER_API_KEY"),
      defaultHeaders: {
        // Optional attribution headers recommended by OpenRouter.
        "HTTP-Referer": optionalEnv("NEXT_PUBLIC_SITE_URL") ?? "",
        "X-Title": "Arrakis",
      },
    });
  }
  return client;
}

/** The OpenRouter model slug to use for generation. */
export function openRouterModel(): string {
  return optionalEnv("OPENROUTER_MODEL") ?? OPENROUTER_DEFAULT_MODEL;
}
