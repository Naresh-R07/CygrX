// AI Model Registry for the CygrX Gemini engine.
// Centralizes model selection so the active model can be changed per project
// (via GEMINI_MODEL env var or a project-supplied id) and auto-falls back to
// the best available free-tier model with a large context window.

export interface AiModelDescriptor {
  id: string;
  contextWindow: number; // input context window (tokens)
  maxOutputTokens: number; // max output tokens per response
  tier: "FREE" | "LOW" | "STANDARD";
  notes: string;
}

// Ordered by preference: free-tier models with the largest token windows first.
// gemini-* models expose a 1M-token context and generous output limits.
export const AI_MODEL_REGISTRY: AiModelDescriptor[] = [
  {
    id: "gemini-3.6-flash",
    contextWindow: 1_048_576,
    maxOutputTokens: 65_536,
    tier: "FREE",
    notes: "Best-in-class free multimodal model with 1M token context.",
  },
  {
    id: "gemini-2.5-flash",
    contextWindow: 1_048_576,
    maxOutputTokens: 65_536,
    tier: "FREE",
    notes: "Reliable free default with 1M token context and JSON mode.",
  },
  {
    id: "gemini-2.5-flash-lite",
    contextWindow: 1_048_576,
    maxOutputTokens: 65_536,
    tier: "FREE",
    notes: "Fastest free-tier Flash Lite with 1M token context.",
  },
  {
    id: "gemini-2.0-flash",
    contextWindow: 1_048_576,
    maxOutputTokens: 65_536,
    tier: "FREE",
    notes: "Legacy free fallback with 1M token context.",
  },
];

const DEFAULT_MODEL = AI_MODEL_REGISTRY[0].id;

export function getDescriptor(id: string): AiModelDescriptor | undefined {
  return AI_MODEL_REGISTRY.find((m) => m.id === id);
}

// Resolve the active model for this project.
// Priority: GEMINI_MODEL env var > project-specified id > registry default.
export function resolveActiveModel(projectSpecifiedId?: string): string {
  const fromEnv = process.env.GEMINI_MODEL?.trim();
  if (fromEnv && getDescriptor(fromEnv)) return fromEnv;
  if (projectSpecifiedId && getDescriptor(projectSpecifiedId)) return projectSpecifiedId;
  return DEFAULT_MODEL;
}

// Build a fallback chain starting at the requested model, then cycling through
// the remaining registry entries (deduplicated). Used to auto-recover when a
// model is unavailable / disabled / over quota.
export function getFallbackChain(requested: string): string[] {
  const ids = AI_MODEL_REGISTRY.map((m) => m.id);
  if (!ids.includes(requested)) return ids;
  const idx = ids.indexOf(requested);
  return [...ids.slice(idx), ...ids.slice(0, idx)];
}

export function getMaxOutputTokens(modelId: string): number {
  return getDescriptor(modelId)?.maxOutputTokens ?? 65_536;
}

// Try generating content across the fallback chain until one model succeeds.
export async function generateWithFallback<T>(
  tryGenerate: (modelId: string) => Promise<T>,
  requestedModel: string
): Promise<{ result: T; modelId: string }> {
  const chain = getFallbackChain(requestedModel);
  if (chain.length === 0) throw new Error("No AI models configured.");

  let lastError: unknown = null;
  for (const modelId of chain) {
    try {
      const result = await tryGenerate(modelId);
      return { result, modelId };
    } catch (err: any) {
      lastError = err;
      const msg = String(err?.message || err || "");
      const isModelError =
        /model.*(not found|not supported|disabled|does not exist|quota|rate limit|429|400)/i.test(msg) ||
        /not_found/i.test(msg) ||
        /development server exactly sports/i.test(msg);
      const isLast = modelId === chain[chain.length - 1];
      if (!isModelError || isLast) {
        if (isLast) break;
        console.warn(`[AI] Model "${modelId}" unavailable (${msg.slice(0, 120)}). Falling back...`);
        continue;
      }
      console.warn(`[AI] Model "${modelId}" failed: ${msg.slice(0, 120)}`);
    }
  }
  throw lastError;
}