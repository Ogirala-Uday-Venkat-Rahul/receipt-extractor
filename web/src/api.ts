// The model API. In production this points at the Hugging Face Space serving the
// fine-tuned GGUF; VITE_API_BASE lets the same build target localhost or a GPU
// endpoint without a code change. The trailing slash is trimmed so both
// "https://host" and "https://host/" work.
const API_BASE = (
  import.meta.env.VITE_API_BASE ?? "https://ouvrahul-receipt-extractor.hf.space"
).replace(/\/$/, "");

export interface LineItem {
  description: string;
  quantity: number;
  price: number;
}

export interface Receipt {
  vendor: string;
  date: string;
  total: number;
  line_items: LineItem[];
}

export interface ExtractResponse {
  valid: boolean;
  receipt: Receipt | null;
  raw: string;
}

export interface HealthStatus {
  online: boolean;
  model: string | null;
}

export async function checkHealth(): Promise<HealthStatus> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(`${API_BASE}/health`, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) return { online: false, model: null };
    const data = await res.json().catch(() => ({}));
    return { online: true, model: data.model ?? null };
  } catch {
    return { online: false, model: null };
  }
}

export async function extract(text: string): Promise<ExtractResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 240000); // 4-min guard for free CPU space

  try {
    const res = await fetch(`${API_BASE}/extract`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.detail || `Request failed with status ${res.status}`);
    }
    return data as ExtractResponse;
  } catch (err: any) {
    clearTimeout(timeout);
    if (err.name === "AbortError") {
      throw new Error("Request timed out. The free CPU Space may be cold-starting; please retry in a moment.");
    }
    throw err;
  }
}
