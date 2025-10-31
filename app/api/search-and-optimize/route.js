// app/api/search-and-optimize/route.js
import { searchSerper } from '@/lib/serper';
import pLimit from 'p-limit';

const limit = pLimit(5); // max 5 concurrent

export async function POST(request) {
  const { queries } = await request.json();

  if (!Array.isArray(queries) || queries.length === 0) {
    return new Response(
      JSON.stringify({ error: 'queries array required' }),
      { status: 400 }
    );
  }

  const searchPromises = queries.map((q) =>
    limit(() => searchSerper(q).catch(() => []))
  );

  const results = await Promise.all(searchPromises);

  return Response.json({ results });
}