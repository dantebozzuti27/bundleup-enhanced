// app/api/parse-intent/route.js
import { cachedLLM } from '@/lib/llm';

export async function POST(request) {
  const { prompt } = await request.json();

  if (!prompt?.trim()) {
    return new Response(
      JSON.stringify({ error: 'Prompt is required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const llmResponse = await cachedLLM(prompt, 'anthropic');

    // ---- Simple parser (replace with your own logic) ----
    const categories = [
      'Graphics Card (GPU)',
      'CPU (Processor)',
      'Motherboard',
      'RAM (Memory)',
      'Primary Storage (SSD)',
      'Power Supply Unit (PSU)',
      'CPU Cooler',
      'PC Case',
    ];

    const roadmap = categories.map((name) => ({
      name,
      products: [], // filled later by search-and-optimize
    }));
    // ----------------------------------------------------

    return Response.json({ roadmap });
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: 'LLM failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}