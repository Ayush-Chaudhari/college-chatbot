// lib/gemini.ts

if (!process.env.GROQ_API_KEY) {
  throw new Error("GROQ_API_KEY is missing from .env.local");
}

const BASE_URL = "https://api.groq.com/openai/v1";
const API_KEY = process.env.GROQ_API_KEY;

// For chat/text generation
export async function generateAnswer(prompt: string): Promise<string> {
  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? "";
}

// For generating embeddings
export async function generateEmbedding(text: string): Promise<number[]> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => (b - 128) / 128);
}