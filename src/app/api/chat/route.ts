import { NextResponse } from 'next/server';
import { askSujanAI } from '@/services/aiAssistantService';

/**
 * PRODUCTION-GRADE CHAT API
 * 1. This runs on the server (Vercel)
 * 2. It keeps your GEMINI_API_KEY secret
 * 3. It provides a free chat experience using the Google AI Studio free tier
 */
export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const responseText = await askSujanAI(message, history || []);
    
    return NextResponse.json({ text: responseText });
  } catch (error: any) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}
