// lib/search.js
import pLimit from 'p-limit';

const limit = pLimit(5);  // Parallel searches

// Shopping-only Serper (Google Shopping tab, no articles)
async function searchShopping(query) {
  const res = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: {
      'X-API-KEY': process.env.SERPER_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      q: `${query} buy add to cart 2025`,  // Force shopping
      tbs: 'shopping',  // Google Shopping only
      num: 15,  // More for bundles
    }),
  });
  const data = await res.json();

  const products = [];
  // Shopping results (products only)
  data.shopping?.forEach(item => {
    const link = item.link;
    if (isShoppingLink(link)) {  // Filter for cart-ready
      products.push({
        title: item.title,
        link,
        price: item.price,
        image: item.thumbnail,
        retailer: extractRetailer(link),
        rating: item.rating || 0,
      });
    }
  });

  return products;
}

// Check if link is direct to product/cart (no articles)
function isShoppingLink(link) {
  return link.includes('/dp/') || link.includes('/site/') || link.includes('/product/') || link.includes('add-to-cart') || link.includes('/buy/');
}

// Extract retailer
function extractRetailer(url) {
  if (url.includes('amazon.com')) return 'Amazon';
  if (url.includes('bestbuy.com')) return 'Best Buy';
  if (url.includes('walmart.com')) return 'Walmart';
  if (url.includes('ebay.com')) return 'eBay';
  if (url.includes('target.com')) return 'Target';
  return 'Other';
}

// Main: Whole web, shopping-focused
export async function searchWholeWeb(query) {
  const results = await searchShopping(query);
  return results.slice(0, 8);  // Top 8 buyable products
}