// lib/vectorStore.ts
import { ChromaClient } from "chromadb";
import type { Metadata } from "chromadb";

const client = new ChromaClient({
  path: "http://localhost:8000",
});

let collectionCache: Awaited<ReturnType<typeof client.getOrCreateCollection>> | null = null;
const COLLECTION_NAME = "college_docs";

export async function getCollection() {
  if (collectionCache) return collectionCache;
  collectionCache = await client.getOrCreateCollection({
    name: COLLECTION_NAME,
    metadata: { "hnsw:space": "cosine" },
  });
  return collectionCache;
}

export async function addDocuments(
  texts: string[],
  embeddings: number[][],
  metadatas: Metadata[]
) {
  const collection = await getCollection();
  const ids = texts.map((_, i) => `doc_${Date.now()}_${i}`);
  await collection.add({
    ids,
    embeddings,
    documents: texts,
    metadatas,
  });
  return ids;
}

export async function searchSimilar(
  queryEmbedding: number[],
  nResults: number = 3
) {
  const collection = await getCollection();
  const results = await collection.query({
    queryEmbeddings: [queryEmbedding],
    nResults,
  });
  return results;
}