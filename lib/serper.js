// lib/serper.js
export async function searchSerper(query) {
  const res = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: {
      'X-API-KEY': process.env.SERPER_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ q: query }),
  });

  const data = await res.json();
  const out = [];

  // Organic
  data.organic?.slice(0, 3).forEach((i) => {
    out.push({ title: i.title, link: i.link, snippet: i.snippet });
  });

  // Shopping
  data.shopping?.slice(0, 3).forEach((i) => {
    out.push({
      title: i.title,
      link: i.link,
      price: i.price,
      image: i.thumbnail,
    });
  });

  return out;
}