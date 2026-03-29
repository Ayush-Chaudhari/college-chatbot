// app/api/chat/route.ts
import { NextResponse } from "next/server";
import { queryRAG } from "@/lib/ragPipeline";

export async function POST(request: Request) {
  try {
    const { question } = await request.json();

    if (!question) {
      return NextResponse.json(
        { success: false, error: "Question is required" },
        { status: 400 }
      );
    }

    const { answer, sources } = await queryRAG(question);

    return NextResponse.json({
      success: true,
      answer,
      sources,
    });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}