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

export async function extract(text: string): Promise<ExtractResponse> {
  const res = await fetch(`${API_BASE}/extract`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.detail || `request failed (${res.status})`);
  }
  return data as ExtractResponse;
}
