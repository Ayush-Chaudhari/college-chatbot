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

// For generating embeddings using Hugging Face
export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch(
    "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2",
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: text }),
    }
  );
  const data = await response.json();
  // Returns 384 dimensions — matches Pinecone index!
  return Array.isArray(data[0]) ? data[0] : data;
}