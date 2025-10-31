// app/api/parse-intent/route.js
import { cachedLLM } from '@/lib/llm';
import { searchWholeWeb } from '@/lib/search';

export async function POST(request) {
  const { prompt, mode = 'new' } = await request.json();

  if (!prompt?.trim()) {
    return new Response('Prompt required', { status: 400 });
  }

  try {
    // Step 1: AI Decompose
    const llmResponse = await cachedLLM(`Decompose "${prompt}" into a complete 4-6 component framework. List as bullets: • Component 1 (description). Ensure complete bundle.`);

    let components = llmResponse
      .split('\n')
      .map(line => line.replace(/• |^\s*- /g, '').trim())
      .filter(line => line.length > 5);

    if (components.length < 4) {
      components = [
        'Main Device (e.g., TV or Core Item)',
        'Audio System (e.g., Soundbar or Speakers)',
        'Receiver/Processor',
        'Subwoofer/Bass',
        'Cables & Accessories',
        'Mount/Setup Hardware'
      ];
    }

    // Step 2: Search with comp in scope
    const searchPromises = components.map(comp => {
      const searchQuery = mode === 'new'
        ? `${comp} ${prompt} buy now new in stock ship to US 2025`
        : `${comp} ${prompt} buy now used refurbished in stock ship to US 2025`;

      return searchWholeWeb(searchQuery);
    });

    const allResults = await Promise.all(searchPromises);

    // Step 3: Build bundles
    const bundles = ['Starter Bundle', 'Mid-Range Bundle', 'Premium Bundle'];
    const roadmap = bundles.map((bundleName, i) => {
      const bundleProducts = allResults.flat().slice(i * 2, (i + 1) * 2);
      const totalPrice = bundleProducts.reduce((sum, p) => sum + (parseFloat(p.price?.replace('$', '') || 0)), 0).toFixed(0);
      return {
        name: bundleName,
        products: bundleProducts.slice(0, 6),
        totalPrice: `$${totalPrice}`,
        mode,
      };
    });

    return Response.json({ roadmap });
  } catch (err) {
    console.error('API Error:', err);
    return new Response('Failed to build bundle: ' + err.message, { status: 500 });
  }
}