module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/http [external] (http, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http", () => require("http"));

module.exports = mod;
}),
"[externals]/url [external] (url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}),
"[externals]/punycode [external] (punycode, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("punycode", () => require("punycode"));

module.exports = mod;
}),
"[externals]/https [external] (https, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("https", () => require("https"));

module.exports = mod;
}),
"[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/node:fs [external] (node:fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:fs", () => require("node:fs"));

module.exports = mod;
}),
"[externals]/node:stream [external] (node:stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:stream", () => require("node:stream"));

module.exports = mod;
}),
"[externals]/node:stream/web [external] (node:stream/web, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:stream/web", () => require("node:stream/web"));

module.exports = mod;
}),
"[project]/lib/spec-normalizer.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@anthropic-ai/sdk/index.mjs [app-route] (ecmascript) <locals>");
;
const anthropic = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"]({
    apiKey: process.env.ANTHROPIC_API_KEY
});
class SpecNormalizer {
    constructor(){
        this.requestQueue = [];
        this.processing = false;
        this.requestsPerMinute = 45; // Stay safely under 50 limit
        this.requestInterval = 60000 / this.requestsPerMinute; // ~1333ms between requests
        this.lastRequestTime = 0;
    }
    async extractSpecs(productData) {
        // Add to queue and process
        return new Promise((resolve, reject)=>{
            this.requestQueue.push({
                productData,
                resolve,
                reject
            });
            this.processQueue();
        });
    }
    async processQueue() {
        if (this.processing || this.requestQueue.length === 0) return;
        this.processing = true;
        while(this.requestQueue.length > 0){
            const { productData, resolve, reject } = this.requestQueue.shift();
            try {
                // Ensure minimum time between requests
                const now = Date.now();
                const timeSinceLastRequest = now - this.lastRequestTime;
                if (timeSinceLastRequest < this.requestInterval) {
                    await new Promise((r)=>setTimeout(r, this.requestInterval - timeSinceLastRequest));
                }
                const message = await anthropic.messages.create({
                    model: 'claude-sonnet-4-5-20250929',
                    max_tokens: 1000,
                    messages: [
                        {
                            role: 'user',
                            content: `Extract and normalize the following product specifications into a structured format. 
            
Product data: ${JSON.stringify(productData)}

Return the specifications in this JSON format:
{
  "specs": {
    "key": "value"
  }
}`
                        }
                    ]
                });
                this.lastRequestTime = Date.now();
                // Parse the response
                const content = message.content[0].text;
                let parsed;
                try {
                    parsed = JSON.parse(content);
                } catch (e) {
                    // If not valid JSON, wrap it
                    parsed = {
                        specs: {
                            raw: content
                        }
                    };
                }
                resolve(parsed);
            } catch (error) {
                if (error.status === 429) {
                    console.log('Rate limited, waiting 10 seconds before retry...');
                    // Re-queue this item
                    this.requestQueue.unshift({
                        productData,
                        resolve,
                        reject
                    });
                    // Wait before continuing
                    await new Promise((r)=>setTimeout(r, 10000));
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
        for(let i = 0; i < products.length; i += batchSize){
            const batch = products.slice(i, i + batchSize);
            const batchNum = Math.floor(i / batchSize) + 1;
            const totalBatches = Math.ceil(products.length / batchSize);
            console.log(`Processing batch ${batchNum}/${totalBatches}...`);
            const batchResults = await Promise.all(batch.map((product)=>this.normalizeSpecs(product)));
            results.push(...batchResults);
            console.log(`Completed batch ${batchNum}/${totalBatches}`);
            // Small pause between batches
            if (i + batchSize < products.length) {
                await new Promise((r)=>setTimeout(r, 1000));
            }
        }
        console.log(`Completed processing all ${products.length} products`);
        return results;
    }
}
const __TURBOPACK__default__export__ = SpecNormalizer;
}),
"[project]/lib/catalog-adapter.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$spec$2d$normalizer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/spec-normalizer.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/module/index.js [app-route] (ecmascript) <locals>");
;
;
const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(("TURBOPACK compile-time value", "https://kntjsvnhwkneqszdhwtc.supabase.co"), process.env.SUPABASE_SERVICE_ROLE_KEY);
class CatalogAdapter {
    constructor(){
        this.specNormalizer = new __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$spec$2d$normalizer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"]();
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
            for(let i = 0; i < queries.length; i++){
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
                    await new Promise((r)=>setTimeout(r, 500));
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
                const { data, error } = await supabase.from('category_specs').select('*').eq('category', query).single();
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
        for (const product of products){
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
                const { error } = await supabase.from('products').upsert(productData, {
                    onConflict: 'id'
                });
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
const __TURBOPACK__default__export__ = CatalogAdapter;
}),
"[project]/app/api/search-and-optimize/route.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$catalog$2d$adapter$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/catalog-adapter.js [app-route] (ecmascript)");
;
;
async function POST(request) {
    try {
        const body = await request.json();
        // Validate request
        if (!body.queries || !Array.isArray(body.queries)) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'Invalid request: queries array is required'
            }, {
                status: 400
            });
        }
        console.log(`Starting search for ${body.queries.length} queries with rate limiting...`);
        console.log('Queries:', body.queries);
        const catalogAdapter = new __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$catalog$2d$adapter$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"]();
        const results = await catalogAdapter.searchWithCache(body);
        console.log(`Search completed. Found ${results.length} total results`);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            data: results,
            count: results.length
        });
    } catch (error) {
        console.error('Search API error:', error);
        // Handle rate limiting errors
        if (error.status === 429) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'Rate limit exceeded. Please try again in a minute.',
                retryAfter: 60
            }, {
                status: 429
            });
        }
        // Handle other errors
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: error.message || 'Search failed',
            details: ("TURBOPACK compile-time truthy", 1) ? error.stack : "TURBOPACK unreachable"
        }, {
            status: 500
        });
    }
}
async function GET(request) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        message: 'Search API is running. Use POST method to search.',
        usage: {
            method: 'POST',
            body: {
                queries: [
                    'search query 1',
                    'search query 2'
                ]
            }
        }
    }, {
        status: 200
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__ad9dd8b6._.js.map