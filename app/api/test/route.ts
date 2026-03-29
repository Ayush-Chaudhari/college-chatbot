// app/api/test/route.ts
import { NextResponse } from "next/server";
import { generateAnswer } from "@/lib/gemini";

export async function GET() {
  try {
    const text = await generateAnswer(
      "Say hello in one sentence like a friendly college assistant."
    );
    return NextResponse.json({ success: true, message: text });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
