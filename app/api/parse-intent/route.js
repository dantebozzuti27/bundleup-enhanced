// app/api/parse-intent/route.js
import { cachedLLM } from '@/lib/llm';
import { searchWholeWeb } from '@/lib/search';

export async function POST(request) {
  const { prompt } = await request.json();

  if (!prompt?.trim()) {
    return new Response('Prompt required', { status: 400 });
  }

  try {
    // Step 1: AI Decompose into 4-6 components (full framework)
    const llmResponse = await cachedLLM(`Decompose "${prompt}" into a complete 4-6 component framework for a full project. List as bullets: • Component 1 (description). Ensure it's a complete bundle, e.g., for home theater: TV, Receiver, Speakers, Subwoofer, Cables, Mount.`);

    let components = llmResponse
      .split('\n')
      .map(line => line.replace(/• |^\s*- /g, '').trim())
      .filter(line => line.length > 5);

    // Fallback for 4-6 full components
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

    // Step 2: Search whole web (shopping only)
    const searchPromises = components.map(comp => searchWholeWeb(`${comp} ${prompt} buy 2025`));
    const allResults = await Promise.all(searchPromises);

    // Step 3: Build full bundles (4-6 items each)
    const bundles = ['Starter Bundle', 'Mid-Range Bundle', 'Premium Bundle'];
    const roadmap = bundles.map((bundleName, i) => {
      const bundleProducts = allResults.slice(i * 1, (i + 1) * 1).flat();  // Distribute results
      const totalPrice = bundleProducts.reduce((sum, p) => sum + (parseFloat(p.price?.replace('$', '') || 0)), 0).toFixed(0);
      return {
        name: bundleName,
        products: bundleProducts.slice(0, 6),  // 4-6 components
        totalPrice: `$${totalPrice}`,
      };
    });

    return Response.json({ roadmap });
  } catch (err) {
    console.error(err);
    return new Response('Failed to build bundle', { status: 500 });
  }
}