// lib/ragPipeline.ts
import { generateAnswer, generateEmbedding } from "@/lib/gemini";
import { searchSimilar } from "@/lib/vectorStore";
import { Metadata } from "chromadb";

export async function queryRAG(userQuestion: string): Promise<{
  answer: string;
  sources: string[];
}> {
  // Step 1: Convert user question into embedding
  const questionEmbedding = await generateEmbedding(userQuestion);

  // Step 2: Search ChromaDB for similar chunks
  const results = await searchSimilar(questionEmbedding, 3);

  // Step 3: Extract the relevant chunks
  const relevantChunks = results.documents?.[0] ?? [];
  const sources = results.metadatas?.[0]?.map(
    (m: Metadata | null) => String(m?.source ?? "unknown")
  ) ?? [];

  if (relevantChunks.length === 0) {
    return {
      answer: "I don't have that information in my knowledge base.",
      sources: [],
    };
  }

  // Step 4: Build prompt with context
  const context = relevantChunks.join("\n\n---\n\n");
  const prompt = `You are a helpful college assistant. Answer the student's question using ONLY the information provided in the context below. If the answer is not in the context, say "I don't have that information."

CONTEXT:
${context}

STUDENT QUESTION:
${userQuestion}

ANSWER:`;

  // Step 5: Generate answer using Groq
  const answer = await generateAnswer(prompt);

  return { answer, sources };
}