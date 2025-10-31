/**
 * Optimization Engine - Multi-objective Bundle Ranking
 * Scores bundles based on price, compatibility, quality, and availability
 */

class OptimizationEngine {
  constructor(weights = {}) {
    this.weights = {
      price: weights.price || 0.35,
      compatibility: weights.compatibility || 0.30,
      quality: weights.quality || 0.25,
      availability: weights.availability || 0.10
    };
  }

  /**
   * Rank bundles by multi-objective score
   */
  async rankBundles(bundles, compatibilityResults) {
    const scoredBundles = bundles.map((bundle, index) => {
      const compResult = compatibilityResults[index];
      
      const scores = {
        price: this.calculatePriceScore(bundle.products),
        compatibility: compResult?.compatibilityScore || 0,
        quality: this.calculateQualityScore(bundle.products),
        availability: this.calculateAvailabilityScore(bundle.products)
      };

      const weightedScore = 
        (scores.price * this.weights.price) +
        (scores.compatibility * this.weights.compatibility) +
        (scores.quality * this.weights.quality) +
        (scores.availability * this.weights.availability);

      return {
        ...bundle,
        scores,
        overallScore: Math.round(weightedScore * 100) / 100,
        rank: 0 // Will be set after sorting
      };
    });

    // Sort by overall score (descending)
    scoredBundles.sort((a, b) => b.overallScore - a.overallScore);

    // Assign ranks
    scoredBundles.forEach((bundle, index) => {
      bundle.rank = index + 1;
    });

    return scoredBundles;
  }

  /**
   * Calculate price score (lower is better, but normalized)
   */
  calculatePriceScore(products) {
    const totalPrice = products.reduce((sum, p) => sum + (p.price || 0), 0);
    
    // Use sigmoid function to normalize
    // Assumes target price around $500-1000 for typical bundles
    const targetPrice = 750;
    const score = 1 / (1 + Math.exp((totalPrice - targetPrice) / 200));
    
    return Math.round(score * 100) / 100;
  }

  /**
   * Calculate quality score based on ratings and reviews
   */
  calculateQualityScore(products) {
    const validProducts = products.filter(p => p.rating && p.reviews);
    
    if (validProducts.length === 0) return 0.5; // Neutral score for unknown

    const avgRating = validProducts.reduce((sum, p) => {
      // Weight by number of reviews (more reviews = more reliable)
      const reviewWeight = Math.min(p.reviews / 100, 1);
      return sum + (p.rating * reviewWeight);
    }, 0) / validProducts.length;

    // Normalize to 0-1 scale (assuming 5-star max)
    return Math.round((avgRating / 5) * 100) / 100;
  }

  /**
   * Calculate availability score
   */
  calculateAvailabilityScore(products) {
    const availableCount = products.filter(p => 
      p.availability && 
      !p.availability.toLowerCase().includes('out of stock') &&
      !p.availability.toLowerCase().includes('unavailable')
    ).length;

    return products.length > 0 
      ? Math.round((availableCount / products.length) * 100) / 100 
      : 0;
  }

  /**
   * Get optimization insights
   */
  getOptimizationInsights(rankedBundles) {
    const topBundle = rankedBundles[0];
    const insights = [];

    // Price insight
    if (topBundle.scores.price < 0.5) {
      insights.push({
        type: 'price',
        message: 'Consider a lower-priced alternative to improve value',
        priority: 'medium'
      });
    }

    // Compatibility insight
    if (topBundle.scores.compatibility < 0.7) {
      insights.push({
        type: 'compatibility',
        message: 'Some compatibility concerns detected - review warnings',
        priority: 'high'
      });
    }

    // Quality insight
    if (topBundle.scores.quality < 0.6) {
      insights.push({
        type: 'quality',
        message: 'Products have limited reviews - consider well-rated alternatives',
        priority: 'low'
      });
    }

    return insights;
  }

  /**
   * Compare two bundles
   */
  compareBundles(bundleA, bundleB) {
    return {
      winner: bundleA.overallScore > bundleB.overallScore ? 'A' : 'B',
      scoreDifference: Math.abs(bundleA.overallScore - bundleB.overallScore),
      advantages: {
        A: this.getBundleAdvantages(bundleA, bundleB),
        B: this.getBundleAdvantages(bundleB, bundleA)
      }
    };
  }

  /**
   * Get advantages of bundle A over bundle B
   */
  getBundleAdvantages(bundleA, bundleB) {
    const advantages = [];

    Object.keys(bundleA.scores).forEach(metric => {
      if (bundleA.scores[metric] > bundleB.scores[metric]) {
        const difference = bundleA.scores[metric] - bundleB.scores[metric];
        if (difference > 0.1) { // Significant difference
          advantages.push({
            metric,
            advantage: `${(difference * 100).toFixed(1)}% better`
          });
        }
      }
    });

    return advantages;
  }
}

export default OptimizationEngine;