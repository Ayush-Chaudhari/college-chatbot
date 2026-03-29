// app/api/models/route.ts
import { NextResponse } from "next/server";
import { genAI } from "@/lib/gemini";

export async function GET() {
  try {
    const response = await genAI.models.list();
    const models = [];
    for await (const model of response) {
      models.push(model.name);
    }
    return NextResponse.json({ models });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
