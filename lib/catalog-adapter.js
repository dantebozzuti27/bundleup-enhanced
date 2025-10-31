import SpecNormalizer from './spec-normalizer.js';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

class CatalogAdapter {
  constructor() {
    this.specNormalizer = new SpecNormalizer();
    this.cache = new Map();
    this.cacheExpiry = 60 * 60 * 1000; // 1 hour
  }

  async searchProducts(queries) {
    if (!queries || queries.length === 0) {
      return [];
    }

    try {
      const results = [];
      
      // Process queries sequentially to avoid rate limits
      for (let i = 0; i < queries.length; i++) {
        const query = queries[i];
        console.log(`Searching for query ${i + 1}/${queries.length}: ${query}`);
        
        try {
          const result = await this.searchItem(query);
          results.push(...result);
        } catch (error) {
          console.error(`Error searching for "${query}":`, error.message);
          // Continue with next query even if this one fails
        }
        
        // Small delay between searches
        if (i < queries.length - 1) {
          await new Promise(r => setTimeout(r, 500));
        }
      }
      
      return results;
      
    } catch (error) {
      console.error('Error in searchProducts:', error);
      throw error;
    }
  }

  async searchItem(query) {
    try {
      // First, try to get category specs
      let categorySpecs = null;
      try {
        const { data, error } = await supabase
          .from('category_specs')
          .select('*')
          .eq('category', query)
          .single();
        
        if (!error && data) {
          categorySpecs = data;
        }
      } catch (error) {
        console.log('Error fetching category specs:', error.message);
      }

      // Search for products (mock implementation - replace with your actual search)
      // This would typically call an external API or database
      const mockProducts = await this.fetchProductsFromSource(query);
      
      if (!mockProducts || mockProducts.length === 0) {
        console.log(`No products found for query: ${query}`);
        return [];
      }

      console.log(`Found ${mockProducts.length} products for query: ${query}`);
      
      // Normalize specs using Claude API (with rate limiting)
      const normalizedProducts = await this.specNormalizer.normalizeBatch(mockProducts, 5);
      
      // Cache the results
      await this.cacheProducts(normalizedProducts);
      
      return normalizedProducts;
      
    } catch (error) {
      console.error('Error in searchItem:', error);
      throw error;
    }
  }

  async fetchProductsFromSource(query) {
    // TODO: Replace this with your actual product source
    // This is a placeholder that returns mock data
    
    // Example: If you're using an external API
    // const response = await fetch(`https://api.example.com/search?q=${query}`);
    // return await response.json();
    
    // For now, returning empty array to prevent errors
    console.log(`Mock search for: ${query}`);
    return [];
  }

  async cacheProducts(products) {
    for (const product of products) {
      try {
        // Prepare product data for database
        const productData = {
          id: product.id || `product_${Date.now()}_${Math.random()}`,
          title: this.truncate(product.title, 500),
          description: this.truncate(product.description, 1000),
          price: product.price,
          currency: product.currency || 'USD',
          image_url: this.truncate(product.image_url, 1000),
          product_url: this.truncate(product.product_url, 1000),
          specs: product.normalizedSpecs || {},
          source: product.source || 'unknown',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { error } = await supabase
          .from('products')
          .upsert(productData, { onConflict: 'id' });

        if (error) {
          console.error('Error caching product:', error);
        }
      } catch (error) {
        console.error('Error caching product:', error.message);
      }
    }
  }

  truncate(str, maxLength) {
    if (!str) return '';
    return str.length > maxLength ? str.substring(0, maxLength) : str;
  }

  async searchWithCache(searchParams) {
    const { queries } = searchParams;
    
    if (!queries || queries.length === 0) {
      return [];
    }

    const cacheKey = JSON.stringify(queries);
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheExpiry) {
        console.log('Returning cached results');
        return cached.data;
      }
    }

    // If not in cache or expired, search
    console.log('Cache miss, performing search...');
    const results = await this.searchProducts(queries);
    
    // Update cache
    this.cache.set(cacheKey, {
      data: results,
      timestamp: Date.now()
    });

    return results;
  }
}

export default CatalogAdapter;