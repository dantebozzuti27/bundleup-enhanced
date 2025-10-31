/**
 * Cost Monitoring System
 * Tracks API usage and prevents runaway costs
 * 
 * LOCATION: lib/cost-monitor.js
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

class CostMonitor {
  constructor() {
    this.costs = {
      anthropic: {
        input: 0.003 / 1000,  // $3 per million input tokens
        output: 0.015 / 1000, // $15 per million output tokens
      },
      serper: {
        perSearch: 0.001, // $1 per 1000 searches
      },
    };

    this.dailyLimit = parseFloat(process.env.DAILY_COST_LIMIT || '50'); // $50/day default
  }

  /**
   * Calculate cost of an Anthropic API call
   */
  calculateAnthropicCost(usage) {
    const inputCost = usage.input_tokens * this.costs.anthropic.input;
    const outputCost = usage.output_tokens * this.costs.anthropic.output;
    return inputCost + outputCost;
  }

  /**
   * Check if we're within budget for today
   */
  async checkDailyBudget() {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('cost_tracking')
      .select('total_cost')
      .gte('created_at', `${today}T00:00:00`)
      .lt('created_at', `${today}T23:59:59`);

    if (error) {
      console.error('Error checking budget:', error);
      return true; // Allow on error (fail open)
    }

    const totalToday = data.reduce((sum, row) => sum + row.total_cost, 0);

    if (totalToday >= this.dailyLimit) {
      console.error(`🚨 DAILY BUDGET EXCEEDED: $${totalToday.toFixed(2)} / $${this.dailyLimit}`);
      return false;
    }

    const remaining = this.dailyLimit - totalToday;
    if (remaining < 5) {
      console.warn(`⚠️  LOW BUDGET: Only $${remaining.toFixed(2)} remaining today`);
    }

    return true;
  }

  /**
   * Log API cost to database
   */
  async logCost(requestId, service, cost, metadata = {}) {
    try {
      await supabase.from('cost_tracking').insert({
        request_id: requestId,
        service,
        cost,
        metadata,
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error logging cost:', error);
    }
  }

  /**
   * Estimate cost before making API call
   */
  estimateAnthropicCost(inputText, expectedOutputTokens = 1000) {
    // Rough estimation: 1 token ≈ 4 characters
    const estimatedInputTokens = Math.ceil(inputText.length / 4);
    
    return this.calculateAnthropicCost({
      input_tokens: estimatedInputTokens,
      output_tokens: expectedOutputTokens,
    });
  }

  /**
   * Get cost summary for a time period
   */
  async getCostSummary(startDate, endDate) {
    const { data, error } = await supabase
      .from('cost_tracking')
      .select('service, cost, created_at')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching cost summary:', error);
      return null;
    }

    const summary = {
      total: 0,
      byService: {},
      byDay: {},
    };

    data.forEach(record => {
      summary.total += record.cost;
      
      // By service
      if (!summary.byService[record.service]) {
        summary.byService[record.service] = 0;
      }
      summary.byService[record.service] += record.cost;
      
      // By day
      const day = record.created_at.split('T')[0];
      if (!summary.byDay[day]) {
        summary.byDay[day] = 0;
      }
      summary.byDay[day] += record.cost;
    });

    return summary;
  }

  /**
   * Alert if costs are trending high
   */
  async checkCostTrends() {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const hourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString();

    const { data } = await supabase
      .from('cost_tracking')
      .select('cost')
      .gte('created_at', hourAgo);

    if (!data) return;

    const hourlySpend = data.reduce((sum, r) => sum + r.cost, 0);
    const projectedDaily = hourlySpend * 24;

    if (projectedDaily > this.dailyLimit * 0.8) {
      console.warn(`⚠️  HIGH SPENDING RATE: $${hourlySpend.toFixed(2)}/hour`);
      console.warn(`   Projected daily: $${projectedDaily.toFixed(2)} (limit: $${this.dailyLimit})`);
    }
  }
}

export default CostMonitor;
