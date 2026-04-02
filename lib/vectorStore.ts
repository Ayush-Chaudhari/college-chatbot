// lib/vectorStore.ts
import { Pinecone } from "@pinecone-database/pinecone";

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY ?? "",
});

const index = pinecone.index(process.env.PINECONE_INDEX ?? "college-chatbot");

export async function addDocuments(
  texts: string[],
  embeddings: number[][],
  metadatas: { source: string; chunk: number }[]
) {
  const vectors = texts.map((text, i) => ({
    id: `doc_${Date.now()}_${i}`,
    values: embeddings[i],
    metadata: { ...metadatas[i], text },
  }));

await index.upsert({ records: vectors });
  return vectors.map((v) => v.id);
}

export async function searchSimilar(
  queryEmbedding: number[],
  nResults: number = 3
) {
  const results = await index.query({
    vector: queryEmbedding,
    topK: nResults,
    includeMetadata: true,
  });

  return {
    documents: [results.matches?.map((m) => String(m.metadata?.text ?? "")) ?? []],
    metadatas: [results.matches?.map((m) => ({ source: String(m.metadata?.source ?? "unknown") })) ?? []],
  };
}