// lib/search.js
import pLimit from 'p-limit';

const limit = pLimit(5);  // Parallel, rate-limited

// Serper (Google Shopping focus)
async function searchSerper(query) {
  const res = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: {
      'X-API-KEY': process.env.SERPER_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      q: query,
      tbs: 'shopping',  // Google Shopping tab
      num: 10,  // More results
    }),
  });
  const data = await res.json();

  const products = [];
  // Shopping results (real products from entire web)
  data.shopping?.forEach(item => {
    products.push({
      title: item.title,
      link: item.link,
      price: item.price,
      image: item.thumbnail,
      retailer: extractRetailer(item.link),  // e.g., Walmart, eBay
      rating: item.rating || 0,
    });
  });
  // Organic (deals, bundles from blogs/forums)
  data.organic?.slice(0, 5).forEach(item => {
    products.push({
      title: item.title,
      link: item.link,
      snippet: item.snippet,
      retailer: 'web',
    });
  });

  return products.slice(0, 8);  // Top 8 diverse results
}

// Brave (independent web index, no Google bias)
async function searchBrave(query) {
  const res = await fetch(`https://api.search.brave.com/res/v1/web/search`, {
    headers: {
      'X-Subscription-Token': process.env.BRAVE_SEARCH_API_KEY,
    },
  });
  const data = await res.json();

  const products = [];
  data.web?.results?.slice(0, 10).forEach(item => {
    if (item.url.includes('amazon.com') || item.url.includes('walmart.com') || item.url.includes('ebay.com')) {
      products.push({
        title: item.title,
        link: item.url,
        snippet: item.description,
        retailer: extractRetailer(item.url),
      });
    }
  });

  return products;
}

// Extract retailer from URL
function extractRetailer(url) {
  if (url.includes('amazon.com')) return 'Amazon';
  if (url.includes('bestbuy.com')) return 'Best Buy';
  if (url.includes('walmart.com')) return 'Walmart';
  if (url.includes('ebay.com')) return 'eBay';
  if (url.includes('target.com')) return 'Target';
  return 'Web';
}

// Main function: Search entire internet
export async function searchWholeWeb(query) {
  const [serperResults, braveResults] = await Promise.all([
    limit(() => searchSerper(query)),
    limit(() => searchBrave(query)),
  ]);

  // Combine & dedupe (unique links)
  const allProducts = [...serperResults, ...braveResults]
    .filter((p, i, arr) => arr.findIndex(q => q.link === p.link) === i)
    .sort((a, b) => (b.rating || 0) - (a.rating || 0));  // Rank by rating

  return allProducts.slice(0, 12);  // Diverse top 12
}