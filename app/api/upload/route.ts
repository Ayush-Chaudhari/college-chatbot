// app/api/upload/route.ts
import { NextResponse } from "next/server";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { generateEmbedding } from "@/lib/gemini";
import { addDocuments } from "@/lib/vectorStore";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    // Step 1: Get the uploaded file
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file uploaded" },
        { status: 400 }
      );
    }

    // Step 2: Check file type
    const fileName = file.name;
    const fileType = fileName.split(".").pop()?.toLowerCase();

    if (!["pdf", "txt"].includes(fileType ?? "")) {
      return NextResponse.json(
        { success: false, error: "Only PDF and TXT files are supported" },
        { status: 400 }
      );
    }

    // Step 3: Save file temporarily
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uploadsDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const filePath = path.join(uploadsDir, fileName);
    fs.writeFileSync(filePath, buffer);

    // Step 4: Extract text
    let text = "";
    if (fileType === "txt") {
      text = fs.readFileSync(filePath, "utf-8");
    } else if (fileType === "pdf") {
  try {
    const dataBuffer = new Uint8Array(fs.readFileSync(filePath));
    const { extractText } = await import("unpdf");
    const { text: extractedText } = await extractText(dataBuffer, { mergePages: true });
    text = extractedText;
    console.log("Extracted text:", text);
    console.log("Text length:", text.length);
    console.log("Text trimmed length:", text.trim().length);
  } catch (pdfError) {
    console.error("PDF parse error:", pdfError);
    return NextResponse.json(
      { success: false, error: `PDF parsing failed: ${String(pdfError)}` },
      { status: 500 }
    );
  }
}

if (!text.trim()) {
  return NextResponse.json(
    { 
      success: false, 
      error: "Could not extract text from this file. Make sure it is a text-based PDF and not a scanned image PDF." 
    },
    { status: 400 }
  );
}

    // Step 5: Split into chunks
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 100,
    });
    const chunks = await splitter.splitText(text);

    // Step 6: Generate embeddings
    const embeddings: number[][] = [];
    for (const chunk of chunks) {
      const embedding = await generateEmbedding(chunk);
      embeddings.push(embedding);
    }

    // Step 7: Store in ChromaDB
    const metadatas = chunks.map((_, i) => ({
  source: "college-info.txt",
  chunk: i,
}));
    await addDocuments(chunks, embeddings, metadatas);

    return NextResponse.json({
      success: true,
      message: `Successfully ingested ${chunks.length} chunks from ${fileName}!`,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}