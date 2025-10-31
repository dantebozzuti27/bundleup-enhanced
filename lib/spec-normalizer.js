import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

class SpecNormalizer {
  constructor() {
    this.requestQueue = [];
    this.processing = false;
    this.requestsPerMinute = 45; // Stay safely under 50 limit
    this.requestInterval = 60000 / this.requestsPerMinute; // ~1333ms between requests
    this.lastRequestTime = 0;
  }

  async extractSpecs(productData) {
    // Add to queue and process
    return new Promise((resolve, reject) => {
      this.requestQueue.push({ productData, resolve, reject });
      this.processQueue();
    });
  }

  async processQueue() {
    if (this.processing || this.requestQueue.length === 0) return;
    
    this.processing = true;
    
    while (this.requestQueue.length > 0) {
      const { productData, resolve, reject } = this.requestQueue.shift();
      
      try {
        // Ensure minimum time between requests
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        if (timeSinceLastRequest < this.requestInterval) {
          await new Promise(r => setTimeout(r, this.requestInterval - timeSinceLastRequest));
        }
        
        const message = await anthropic.messages.create({
          model: 'claude-sonnet-4-5-20250929',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `Extract and normalize the following product specifications into a structured format. 
            
Product data: ${JSON.stringify(productData)}

Return the specifications in this JSON format:
{
  "specs": {
    "key": "value"
  }
}`
          }]
        });
        
        this.lastRequestTime = Date.now();
        
        // Parse the response
        const content = message.content[0].text;
        let parsed;
        try {
          parsed = JSON.parse(content);
        } catch (e) {
          // If not valid JSON, wrap it
          parsed = { specs: { raw: content } };
        }
        
        resolve(parsed);
        
      } catch (error) {
        if (error.status === 429) {
          console.log('Rate limited, waiting 10 seconds before retry...');
          // Re-queue this item
          this.requestQueue.unshift({ productData, resolve, reject });
          // Wait before continuing
          await new Promise(r => setTimeout(r, 10000));
        } else {
          console.error('Error extracting specs:', error.message);
          reject(error);
        }
      }
    }
    
    this.processing = false;
  }

  async normalizeSpecs(product) {
    try {
      const specs = await this.extractSpecs(product);
      return {
        ...product,
        normalizedSpecs: specs
      };
    } catch (error) {
      console.error('Error normalizing specs for product:', product.id || 'unknown', error.message);
      return {
        ...product,
        normalizedSpecs: null,
        error: error.message
      };
    }
  }

  async normalizeBatch(products, batchSize = 5) {
    const results = [];
    
    if (!products || products.length === 0) {
      return results;
    }
    
    console.log(`Processing ${products.length} products in batches of ${batchSize}`);
    
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      const batchNum = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(products.length / batchSize);
      
      console.log(`Processing batch ${batchNum}/${totalBatches}...`);
      
      const batchResults = await Promise.all(
        batch.map(product => this.normalizeSpecs(product))
      );
      
      results.push(...batchResults);
      
      console.log(`Completed batch ${batchNum}/${totalBatches}`);
      
      // Small pause between batches
      if (i + batchSize < products.length) {
        await new Promise(r => setTimeout(r, 1000));
      }
    }
    
    console.log(`Completed processing all ${products.length} products`);
    return results;
  }
}

export default SpecNormalizer;