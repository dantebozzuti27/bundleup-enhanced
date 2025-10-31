// app/api/parse-intent/route.js
import { cachedLLM } from '@/lib/llm';
import { searchWholeWeb } from '@/lib/search';

export async function POST(request) {
  const { prompt } = await request.json();

  if (!prompt?.trim()) {
    return new Response('Prompt required', { status: 400 });
  }

  try {
    // Step 1: AI Decompose (intent → components)
    const llmResponse = await cachedLLM(`Decompose this purchase intent into 4-6 key components: ${prompt}. List as bullets: • Component Name`);

    let components = llmResponse
      .split('\n')
      .map(line => line.replace(/• |^\s*- /g, '').trim())
      .filter(line => line.length > 5);

    // Fallback if AI returns nothing
    if (components.length === 0) {
      components = ['Main Item', 'Accessory 1', 'Accessory 2', 'Accessory 3'];
    }

    // Step 2: Search whole web for each component
    const searchPromises = components.map(comp => searchWholeWeb(`${comp} ${prompt} best deals 2025`));
    const allResults = await Promise.all(searchPromises);

    // Step 3: Group into bundles (diverse sources)
    const bundles = ['Budget Bundle', 'Mid-Range Bundle', 'Premium Bundle'];
    const roadmap = bundles.map((bundleName, i) => {
      const bundleProducts = allResults.slice(i * 2, (i + 1) * 2).flat();  // Rotate for diversity
      const totalPrice = bundleProducts.reduce((sum, p) => sum + (parseFloat(p.price?.replace('$', '') || 0)), 0).toFixed(0);
      return {
        name: bundleName,
        products: bundleProducts.slice(0, 4),  // 4 items per bundle
        totalPrice: `$${totalPrice}`,
      };
    });

    return Response.json({ roadmap });
  } catch (err) {
    console.error(err);
    return new Response('Search failed', { status: 500 });
  }
}