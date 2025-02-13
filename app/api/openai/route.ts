import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

// Initialize OpenAI client outside of the handler to reuse the instance
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    // Validate API key
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      );
    }

    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { messages } = body;

    // Validate messages array
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Validate each message object
    if (!messages.every(msg => 
      typeof msg === 'object' && 
      msg !== null && 
      typeof msg.role === 'string' && 
      ['system', 'user', 'assistant'].includes(msg.role) &&
      typeof msg.content === 'string' &&
      msg.content.trim().length > 0
    )) {
      return NextResponse.json(
        { error: 'Invalid message format' },
        { status: 400 }
      );
    }

    // Make OpenAI API call with retry logic
    let retries = 3;
    let lastError;

    while (retries > 0) {
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: messages as ChatCompletionMessageParam[],
          temperature: 0.7,
          max_tokens: 1000,
        });

        // Validate response
        if (!completion.choices?.[0]?.message) {
          console.error('Invalid response structure from OpenAI');
          return NextResponse.json(
            { error: 'Invalid response from OpenAI API' },
            { status: 503 }
          );
        }

        return NextResponse.json({
          response: completion.choices[0].message,
        });
      } catch (error: any) {
        lastError = error;
        console.error('OpenAI API Error:', error);

        // Specific checks
        if (error?.response?.status === 404) {
          return NextResponse.json(
            { error: 'Model not found or not available' },
            { status: 503 }
          );
        }

        if (error.message.includes('API key')) {
          return NextResponse.json(
            { error: 'Invalid OpenAI API key configuration' },
            { status: 401 }
          );
        }

        // Continue retries only for specific errors
        if (
          error.message.includes('timeout') ||
          error.message.includes('network') ||
          error.message.includes('rate limits') ||
          error.status === 429 ||
          error.status === 500 ||
          error.status === 502 ||
          error.status === 503
        ) {
          retries--;
          if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, (3 - retries) * 2000));
            continue;
          }
        }

        throw error;
      }
    }

    // If we get here, all retries failed
    throw lastError;
  } catch (error) {
    // Handle specific OpenAI errors
    if (error instanceof Error) {
      // Authentication errors
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'Invalid OpenAI API key' },
          { status: 401 }
        );
      }
      // Rate limiting
      if (error.message.includes('Rate limit')) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }
      // Invalid input
      if (error.message.includes('Invalid message format')) {
        return NextResponse.json(
          { error: 'Invalid message format in request' },
          { status: 400 }
        );
      }
      // Model errors
      if (error.message.includes('model')) {
        return NextResponse.json(
          { error: 'Model error. Please try again.' },
          { status: 503 }
        );
      }
    }

    // Generic error response
    return NextResponse.json(
      { error: 'Failed to process request. Please try again later.' },
      { status: 500 }
    );
  }
}