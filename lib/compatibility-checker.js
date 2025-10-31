// ============================================
// COMPATIBILITY CHECKER - Graph Database Engine
// Validates product combinations against rules
// ============================================

import { supabaseAdmin } from './supabase-admin.js';

/**
 * Compatibility Checker - Validates product combinations
 */
export class CompatibilityChecker {
  
  /**
   * Check compatibility of product bundle
   * @param {array} products - Array of products with normalized specs
   * @returns {object} Compatibility report with issues and warnings
   */
  async checkCompatibility(products) {
    
    // Step 1: Load compatibility rules
    const rules = await this.loadCompatibilityRules();
    
    // Step 2: Check each rule against product combinations
    const issues = [];
    const warnings = [];
    const passes = [];
    
    for (const rule of rules) {
      const result = await this.evaluateRule(rule, products);
      
      if (result.status === 'FAIL') {
        if (rule.severity === 'ERROR') {
          issues.push(result);
        } else if (rule.severity === 'WARNING') {
          warnings.push(result);
        }
      } else if (result.status === 'PASS') {
        passes.push(result);
      }
    }
    
    // Step 3: Calculate overall compatibility score
    const compatibilityScore = this.calculateCompatibilityScore(issues, warnings, passes);
    
    return {
      compatible: issues.length === 0,
      compatibilityScore,
      issues,
      warnings,
      passes,
      checkedAt: new Date().toISOString()
    };
  }
  
  /**
   * Load all compatibility rules from database
   */
  async loadCompatibilityRules() {
    const { data: rules, error } = await supabaseAdmin
      .from('compatibility_rules')
      .select('*');
    
    if (error) {
      console.error('Error loading compatibility rules:', error);
      return [];
    }
    
    return rules || [];
  }
  
  /**
   * Evaluate a single compatibility rule
   */
  async evaluateRule(rule, products) {
    // Get product categories
    const { data: categories } = await supabaseAdmin
      .from('product_categories')
      .select('*')
      .in('id', [rule.category_a_id, rule.category_b_id]);
    
    if (!categories || categories.length !== 2) {
      return { status: 'SKIP', rule: rule.rule_name, reason: 'Categories not found' };
    }
    
    const categoryA = categories.find(c => c.id === rule.category_a_id);
    const categoryB = categories.find(c => c.id === rule.category_b_id);
    
    // Find products matching these categories
    const productsA = products.filter(p => p.category === categoryA.name);
    const productsB = products.filter(p => p.category === categoryB.name);
    
    if (productsA.length === 0 || productsB.length === 0) {
      return { status: 'SKIP', rule: rule.rule_name, reason: 'No products to compare' };
    }
    
    // Check rule conditions for each product combination
    for (const productA of productsA) {
      for (const productB of productsB) {
        const conditionResult = this.evaluateConditions(
          rule.conditions,
          productA.normalizedSpecs || {},
          productB.normalizedSpecs || {}
        );
        
        if (!conditionResult.passes) {
          return {
            status: 'FAIL',
            rule: rule.rule_name,
            severity: rule.severity,
            explanation: rule.explanation,
            productA: productA.title,
            productB: productB.title,
            issue: conditionResult.reason,
            recommendation: this.generateRecommendation(rule, productA, productB)
          };
        }
      }
    }
    
    return {
      status: 'PASS',
      rule: rule.rule_name,
      explanation: rule.explanation
    };
  }
  
  /**
   * Evaluate compatibility conditions
   */
  evaluateConditions(conditions, specsA, specsB) {
    // Handle different rule types
    
    // Example: HDMI version compatibility
    if (conditions.HDMI_version_min) {
      const versionA = this.parseVersion(specsA.HDMI_version);
      const versionB = this.parseVersion(specsB.HDMI_version);
      const minVersion = this.parseVersion(conditions.HDMI_version_min);
      
      if (versionA < minVersion || versionB < minVersion) {
        return {
          passes: false,
          reason: `HDMI version must be ${conditions.HDMI_version_min} or higher. Found: ${specsA.HDMI_version}, ${specsB.HDMI_version}`
        };
      }
    }
    
    // Example: Speaker impedance compatibility
    if (conditions.receiver_impedance && conditions.speaker_impedance) {
      const receiverImpedance = this.parseImpedance(specsA.impedance);
      const speakerImpedance = this.parseImpedance(specsB.impedance);
      
      if (receiverImpedance < speakerImpedance) {
        return {
          passes: false,
          reason: `Receiver impedance (${receiverImpedance}Ω) must be >= speaker impedance (${speakerImpedance}Ω)`
        };
      }
    }
    
    // Example: Wattage compatibility
    if (conditions.receiver_wattage && conditions.speaker_wattage) {
      const receiverWattage = this.parseWattage(specsA.wattage_per_channel);
      const speakerWattage = this.parseWattage(specsB.wattage);
      
      if (receiverWattage < speakerWattage) {
        return {
          passes: false,
          reason: `Receiver power (${receiverWattage}W) should be >= speaker requirement (${speakerWattage}W)`
        };
      }
    }
    
    return { passes: true };
  }
  
  /**
   * Parse version string (e.g., "HDMI 2.1" -> 2.1)
   */
  parseVersion(versionString) {
    if (!versionString) return 0;
    const match = versionString.match(/(\d+\.?\d*)/);
    return match ? parseFloat(match[1]) : 0;
  }
  
  /**
   * Parse impedance (e.g., "8 ohms" -> 8)
   */
  parseImpedance(impedanceString) {
    if (!impedanceString) return 0;
    const match = impedanceString.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }
  
  /**
   * Parse wattage (e.g., "100W" or "100 watts" -> 100)
   */
  parseWattage(wattageString) {
    if (!wattageString) return 0;
    const match = wattageString.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }
  
  /**
   * Generate recommendation for fixing compatibility issue
   */
  generateRecommendation(rule, productA, productB) {
    const recommendations = [];
    
    if (rule.rule_name.includes('HDMI')) {
      recommendations.push('Look for products with HDMI 2.1 support');
      recommendations.push('Ensure all devices in the chain support the same HDMI version');
    }
    
    if (rule.rule_name.includes('Impedance')) {
      recommendations.push('Choose a receiver that supports your speaker impedance');
      recommendations.push('Or select speakers that match your receiver specifications');
    }
    
    if (rule.rule_name.includes('Wattage')) {
      recommendations.push('Select a more powerful receiver');
      recommendations.push('Or choose speakers with lower power requirements');
    }
    
    return recommendations;
  }
  
  /**
   * Calculate overall compatibility score (0-1)
   */
  calculateCompatibilityScore(issues, warnings, passes) {
    const totalChecks = issues.length + warnings.length + passes.length;
    if (totalChecks === 0) return 1.0;
    
    // Weight: PASS = 1.0, WARNING = 0.5, ERROR = 0.0
    const score = (passes.length + (warnings.length * 0.5)) / totalChecks;
    return Math.round(score * 100) / 100;
  }
  
  /**
   * Get detailed compatibility report
   */
  async getDetailedReport(products) {
    const result = await this.checkCompatibility(products);
    
    return {
      summary: {
        compatible: result.compatible,
        score: result.compatibilityScore,
        issueCount: result.issues.length,
        warningCount: result.warnings.length
      },
      details: {
        criticalIssues: result.issues.map(i => ({
          rule: i.rule,
          products: [i.productA, i.productB],
          problem: i.issue,
          solutions: i.recommendation
        })),
        warnings: result.warnings.map(w => ({
          rule: w.rule,
          products: [w.productA, w.productB],
          concern: w.issue,
          suggestions: w.recommendation
        })),
        validatedRules: result.passes.map(p => ({
          rule: p.rule,
          status: 'Compatible'
        }))
      },
      checkedAt: result.checkedAt
    };
  }
  
  /**
   * Suggest compatible alternatives for problematic products
   */
  async suggestAlternatives(incompatibleProduct, targetSpecs) {
    // Query product cache for alternatives matching target specs
    let query = supabaseAdmin
      .from('product_cache')
      .select('*')
      .limit(5);
    
    // Add spec filters
    if (targetSpecs.HDMI_version) {
      query = query.gte('normalized_specs->HDMI_version', targetSpecs.HDMI_version);
    }
    
    if (targetSpecs.impedance) {
      query = query.eq('normalized_specs->impedance', targetSpecs.impedance);
    }
    
    const { data: alternatives, error } = await query;
    
    if (error) {
      console.error('Error finding alternatives:', error);
      return [];
    }
    
    return alternatives || [];
  }
}

export default CompatibilityChecker;
