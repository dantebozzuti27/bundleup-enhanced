/**
 * Catalog Adapter - Product Search Integration
 * Handles searches across multiple product sources (Serper API)
 */

import axios from 'axios';

class CatalogAdapter {
  constructor() {
    this.serperApiKey = process.env.SERPER_API_KEY;
    this.baseUrl = 'https://google.serper.dev/shopping';
  }

  /**
   * Search for products matching a query
   */
  async searchProducts(query, options = {}) {
    const {
      maxResults = 10,
      priceRange = null,
      category = null
    } = options;

    try {
      const response = await axios.post(
        this.baseUrl,
        {
          q: query,
          num: maxResults,
          ...(priceRange && {
            tbs: `price:1,ppr_min:${priceRange.min},ppr_max:${priceRange.max}`
          })
        },
        {
          headers: {
            'X-API-KEY': this.serperApiKey,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      const products = this.normalizeSearchResults(response.data);
      return {
        success: true,
        products,
        metadata: {
          query,
          resultsCount: products.length,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Product search error:', error.message);
      return {
        success: false,
        products: [],
        error: error.message
      };
    }
  }

  /**
   * Normalize search results to standard format
   */
  normalizeSearchResults(rawData) {
    if (!rawData.shopping) return [];

    return rawData.shopping.map(item => ({
      title: item.title,
      price: this.parsePrice(item.price),
      link: item.link,
      source: item.source || 'Unknown',
      rating: item.rating || null,
      reviews: item.reviews || null,
      thumbnail: item.imageUrl || null,
      availability: item.delivery || 'Check with seller',
      rawSpecs: this.extractSpecsFromTitle(item.title)
    }));
  }

  /**
   * Parse price string to numeric value
   */
  parsePrice(priceString) {
    if (!priceString) return null;
    const match = priceString.match(/[\d,]+\.?\d*/);
    return match ? parseFloat(match[0].replace(/,/g, '')) : null;
  }

  /**
   * Extract basic specs from product title
   */
  extractSpecsFromTitle(title) {
    const specs = {};
    
    // Resolution patterns
    if (/4K|UHD|3840\s*x\s*2160/i.test(title)) specs.resolution = '4K';
    else if (/1080p|Full HD|1920\s*x\s*1080/i.test(title)) specs.resolution = '1080p';
    
    // Screen size
    const sizeMatch = title.match(/(\d+)["']?\s*(inch|in)/i);
    if (sizeMatch) specs.screenSize = parseInt(sizeMatch[1]);
    
    // HDMI
    const hdmiMatch = title.match(/HDMI\s*(\d+\.\d+|\d+)/i);
    if (hdmiMatch) specs.HDMI_version = hdmiMatch[1];
    
    // Power
    const powerMatch = title.match(/(\d+)W|(\d+)\s*Watt/i);
    if (powerMatch) specs.power = parseInt(powerMatch[1] || powerMatch[2]);
    
    // Channels (for audio)
    const channelMatch = title.match(/(\d+\.\d+)\s*channel/i);
    if (channelMatch) specs.channels = channelMatch[1];
    
    return specs;
  }

  /**
   * Search with retry logic
   */
  async searchWithRetry(query, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const result = await this.searchProducts(query);
      
      if (result.success && result.products.length > 0) {
        return result;
      }
      
      if (attempt < maxRetries) {
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
    
    return { success: false, products: [], error: 'Max retries exceeded' };
  }

  /**
   * Batch search for multiple queries
   */
  async batchSearch(queries, options = {}) {
    const results = await Promise.allSettled(
      queries.map(query => this.searchProducts(query, options))
    );

    return results.map((result, index) => ({
      query: queries[index],
      ...((result.status === 'fulfilled') 
        ? result.value 
        : { success: false, products: [], error: result.reason.message }
      )
    }));
  }
}

export default CatalogAdapter;