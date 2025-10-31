// app/api/parse-intent/route.js
import { cachedLLM } from '@/lib/llm';

export async function POST(request) {
  const { prompt } = await request.json();

  if (!prompt?.trim()) {
    return new Response('Prompt required', { status: 400 });
  }

  try {
    const llmResponse = await cachedLLM(prompt);

    // Extract components from LLM
    const components = llmResponse
      .split('\n')
      .filter(line => line.includes('→') || line.match(/^\d+\./))
      .map(line => line.replace(/^\d+\.\s*|→/g, '').trim())
      .filter(Boolean);

    const roadmap = components.map(name => ({ name, products: [] }));

    return Response.json({ roadmap });
  } catch (err) {
    return new Response('LLM failed', { status: 500 });
  }
}