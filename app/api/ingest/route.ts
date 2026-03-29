// app/api/ingest/route.ts
import { NextResponse } from "next/server";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { generateEmbedding } from "@/lib/gemini";
import { addDocuments } from "@/lib/vectorStore";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    // Step 1: Read the text file
    const filePath = path.join(process.cwd(), "uploads", "college-info.txt");
    const text = fs.readFileSync(filePath, "utf-8");
    console.log("File read successfully, length:", text.length);

    // Step 2: Split into chunks
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 100,
    });
    const chunks = await splitter.splitText(text);
    console.log("Total chunks created:", chunks.length);

    // Step 3: Generate embeddings for each chunk
    const embeddings: number[][] = [];
    for (const chunk of chunks) {
      const embedding = await generateEmbedding(chunk);
      embeddings.push(embedding);
    }
    console.log("Embeddings generated:", embeddings.length);

    // Step 4: Store in ChromaDB
    const metadatas = chunks.map((_, i) => ({
  source: "college-info.txt",
  chunk: i,
}));
    await addDocuments(chunks, embeddings, metadatas);

    return NextResponse.json({
      success: true,
      message: `Successfully ingested ${chunks.length} chunks into ChromaDB!`,
    });
  } catch (error) {
    console.error("Ingestion error:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}