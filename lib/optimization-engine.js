// ============================================
// OPTIMIZATION ENGINE - Multi-Objective Ranking
// Ranks solution alternatives by multiple criteria
// ============================================

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Optimization Engine - Multi-objective bundle optimization
 */
export class OptimizationEngine {
  
  /**
   * Optimize bundles across multiple objectives
   * @param {array} productOptions - Products for each component with multiple options per component
   * @param {object} preferences - User preferences for optimization
   * @param {object} compatibility - Compatibility check results
   * @returns {array} Ranked solution alternatives
   */
  async optimizeBundles(productOptions, preferences = {}, compatibility = null) {
    
    // Default optimization weights
    const weights = {
      price: preferences.priceWeight || 0.4,
      quality: preferences.qualityWeight || 0.3,
      compatibility: preferences.compatibilityWeight || 0.2,
      availability: preferences.availabilityWeight || 0.1
    };
    
    // Step 1: Generate all valid bundle combinations
    const bundles = this.generateBundles(productOptions);
    
    // Step 2: Score each bundle on multiple objectives
    const scoredBundles = await Promise.all(
      bundles.map(bundle => this.scoreBundleget(bundle, weights, compatibility))
    );
    
    // Step 3: Apply Pareto optimization to find best alternatives
    const paretoOptimal = this.findParetoOptimal(scoredBundles);
    
    // Step 4: Rank by weighted scores
    const rankedBundles = this.rankBundles(paretoOptimal, weights);
    
    // Step 5: Add explanations and tradeoffs
    const bundlesWithExplanations = this.addExplanations(rankedBundles, weights);
    
    return bundlesWithExplanations.slice(0, 10); // Top 10 alternatives
  }
  
  /**
   * Generate all possible bundle combinations
   */
  generateBundles(productOptions) {
    // productOptions: { "receiver": [product1, product2], "speakers": [product3, product4] }
    
    const components = Object.keys(productOptions);
    const bundles = [];
    
    // Generate cartesian product of all options
    const generate = (index, currentBundle) => {
      if (index === components.length) {
        bundles.push({ ...currentBundle });
        return;
      }
      
      const component = components[index];
      const options = productOptions[component] || [];
      
      options.forEach(product => {
        generate(index + 1, { ...currentBundle, [component]: product });
      });
    };
    
    generate(0, {});
    
    // Limit to reasonable number of combinations (max 1000)
    return bundles.slice(0, 1000);
  }
  
  /**
   * Score a single bundle across all objectives
   */
  async scoreBundle(bundle, weights, compatibility) {
    const products = Object.values(bundle);
    
    // Calculate individual objective scores
    const priceScore = this.calculatePriceScore(products);
    const qualityScore = await this.calculateQualityScore(products);
    const compatibilityScore = compatibility 
      ? compatibility.compatibilityScore 
      : await this.calculateCompatibilityScore(products);
    const availabilityScore = this.calculateAvailabilityScore(products);
    
    // Calculate weighted total score
    const totalScore = 
      (priceScore * weights.price) +
      (qualityScore * weights.quality) +
      (compatibilityScore * weights.compatibility) +
      (availabilityScore * weights.availability);
    
    // Calculate total price
    const totalPrice = products.reduce((sum, p) => sum + (parseFloat(p.price) || 0), 0);
    
    // Get retailer distribution
    const retailers = {};
    products.forEach(p => {
      retailers[p.retailer] = (retailers[p.retailer] || 0) + 1;
    });
    
    return {
      bundle,
      scores: {
        price: priceScore,
        quality: qualityScore,
        compatibility: compatibilityScore,
        availability: availabilityScore,
        total: totalScore
      },
      totalPrice,
      retailers,
      primaryRetailer: Object.keys(retailers).reduce((a, b) => 
        retailers[a] > retailers[b] ? a : b
      )
    };
  }
  
  /**
   * Calculate price score (0-1, higher is better)
   * Lower prices get higher scores
   */
  calculatePriceScore(products) {
    const totalPrice = products.reduce((sum, p) => sum + (parseFloat(p.price) || 0), 0);
    
    // Assume max reasonable price is 2x the minimum total
    const minPrice = products.length * 50; // Min $50 per component
    const maxPrice = products.length * 500; // Max $500 per component
    
    // Normalize to 0-1, inverted (lower price = higher score)
    const normalizedPrice = (totalPrice - minPrice) / (maxPrice - minPrice);
    const score = 1 - Math.max(0, Math.min(1, normalizedPrice));
    
    return Math.round(score * 100) / 100;
  }
  
  /**
   * Calculate quality score from review signals
   */
  async calculateQualityScore(products) {
    const scores = [];
    
    for (const product of products) {
      // Try to get review signals from cache
      const { data: signals } = await supabase
        .from('review_signals')
        .select('quality_score, average_rating')
        .eq('product_id', product.id || product.url)
        .single();
      
      if (signals?.quality_score) {
        scores.push(signals.quality_score);
      } else if (signals?.average_rating) {
        // Convert rating to 0-1 score (5 stars -> 1.0)
        scores.push(signals.average_rating / 5);
      } else if (product.rating) {
        // Use product rating if available
        scores.push(product.rating / 5);
      } else {
        // Default to neutral score
        scores.push(0.5);
      }
    }
    
    // Average quality score
    const avgScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    return Math.round(avgScore * 100) / 100;
  }
  
  /**
   * Calculate compatibility score
   */
  async calculateCompatibilityScore(products) {
    // Import CompatibilityChecker
    const { CompatibilityChecker } = await import('./compatibility-checker.js');
    const checker = new CompatibilityChecker();
    
    const result = await checker.checkCompatibility(products);
    return result.compatibilityScore;
  }
  
  /**
   * Calculate availability score
   */
  calculateAvailabilityScore(products) {
    const availableCount = products.filter(p => p.availability !== false).length;
    return availableCount / products.length;
  }
  
  /**
   * Find Pareto optimal solutions
   * (Solutions that are not dominated by any other solution)
   */
  findParetoOptimal(bundles) {
    const pareto = [];
    
    for (const bundle of bundles) {
      let isDominated = false;
      
      // Check if this bundle is dominated by any other
      for (const other of bundles) {
        if (this.dominates(other, bundle)) {
          isDominated = true;
          break;
        }
      }
      
      if (!isDominated) {
        pareto.push(bundle);
      }
    }
    
    return pareto;
  }
  
  /**
   * Check if bundle A dominates bundle B
   * A dominates B if A is better in at least one objective and not worse in any
   */
  dominates(a, b) {
    let betterInOne = false;
    
    const objectives = ['price', 'quality', 'compatibility', 'availability'];
    
    for (const obj of objectives) {
      if (a.scores[obj] < b.scores[obj]) {
        // A is worse in this objective
        return false;
      }
      if (a.scores[obj] > b.scores[obj]) {
        // A is better in this objective
        betterInOne = true;
      }
    }
    
    return betterInOne;
  }
  
  /**
   * Rank bundles by weighted score
   */
  rankBundles(bundles, weights) {
    return bundles
      .sort((a, b) => b.scores.total - a.scores.total)
      .map((bundle, index) => ({
        ...bundle,
        rank: index + 1
      }));
  }
  
  /**
   * Add explanations and tradeoff analysis
   */
  addExplanations(rankedBundles, weights) {
    return rankedBundles.map(bundle => {
      const explanation = [];
      const tradeoffs = [];
      
      // Explain strengths
      if (bundle.scores.price > 0.8) {
        explanation.push('💰 Excellent value - One of the cheapest options');
      } else if (bundle.scores.price > 0.6) {
        explanation.push('💰 Good value for money');
      }
      
      if (bundle.scores.quality > 0.8) {
        explanation.push('⭐ High quality products with excellent reviews');
      } else if (bundle.scores.quality > 0.6) {
        explanation.push('⭐ Good quality with positive reviews');
      }
      
      if (bundle.scores.compatibility === 1.0) {
        explanation.push('✅ Fully compatible - All components work together perfectly');
      } else if (bundle.scores.compatibility > 0.7) {
        explanation.push('✅ Compatible with minor considerations');
      }
      
      // Explain tradeoffs
      if (bundle.scores.price < 0.5 && bundle.scores.quality > 0.7) {
        tradeoffs.push('Higher price for better quality');
      }
      
      if (bundle.scores.quality < 0.5 && bundle.scores.price > 0.7) {
        tradeoffs.push('Lower price but reduced quality');
      }
      
      if (bundle.scores.compatibility < 1.0) {
        tradeoffs.push('May require additional adapters or configuration');
      }
      
      // Recommend based on rank
      let recommendation = '';
      if (bundle.rank === 1) {
        recommendation = '🏆 BEST OVERALL - Optimal balance across all factors';
      } else if (bundle.scores.price === Math.max(...rankedBundles.map(b => b.scores.price))) {
        recommendation = '💵 BEST VALUE - Cheapest option that meets requirements';
      } else if (bundle.scores.quality === Math.max(...rankedBundles.map(b => b.scores.quality))) {
        recommendation = '⭐ PREMIUM CHOICE - Highest quality components';
      }
      
      return {
        ...bundle,
        explanation: explanation.join(' • '),
        tradeoffs: tradeoffs.length > 0 ? tradeoffs.join(' • ') : 'No significant tradeoffs',
        recommendation
      };
    });
  }
  
  /**
   * Save solution alternatives to database
   */
  async saveSolutionAlternatives(roadmapId, alternatives) {
    const records = alternatives.map((alt, index) => ({
      roadmap_id: roadmapId,
      alternative_rank: alt.rank,
      total_price: alt.totalPrice,
      quality_score: alt.scores.quality,
      compatibility_score: alt.scores.compatibility,
      bundle_composition: alt.bundle,
      tradeoffs: alt.tradeoffs
    }));
    
    const { data, error } = await supabase
      .from('solution_alternatives')
      .insert(records)
      .select();
    
    if (error) {
      console.error('Error saving alternatives:', error);
      throw error;
    }
    
    return data;
  }
  
  /**
   * Get optimization insights
   */
  getOptimizationInsights(alternatives) {
    const insights = {
      priceRange: {
        min: Math.min(...alternatives.map(a => a.totalPrice)),
        max: Math.max(...alternatives.map(a => a.totalPrice)),
        average: alternatives.reduce((sum, a) => sum + a.totalPrice, 0) / alternatives.length
      },
      qualityRange: {
        min: Math.min(...alternatives.map(a => a.scores.quality)),
        max: Math.max(...alternatives.map(a => a.scores.quality)),
        average: alternatives.reduce((sum, a) => sum + a.scores.quality, 0) / alternatives.length
      },
      topRetailers: this.getTopRetailers(alternatives),
      diversityScore: this.calculateDiversityScore(alternatives)
    };
    
    return insights;
  }
  
  /**
   * Get most common retailers across alternatives
   */
  getTopRetailers(alternatives) {
    const retailerCount = {};
    
    alternatives.forEach(alt => {
      Object.keys(alt.retailers).forEach(retailer => {
        retailerCount[retailer] = (retailerCount[retailer] || 0) + 1;
      });
    });
    
    return Object.entries(retailerCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([retailer, count]) => ({ retailer, count }));
  }
  
  /**
   * Calculate how diverse the alternatives are
   */
  calculateDiversityScore(alternatives) {
    // Higher diversity = more variety in solutions
    const uniqueProducts = new Set();
    
    alternatives.forEach(alt => {
      Object.values(alt.bundle).forEach(product => {
        uniqueProducts.add(product.id || product.url);
      });
    });
    
    return uniqueProducts.size / (alternatives.length * Object.keys(alternatives[0].bundle).length);
  }
}

export default OptimizationEngine;
