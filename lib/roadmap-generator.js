// ============================================
// ROADMAP GENERATOR - Templates & Rules Engine
// Produces ordered solution blueprint
// ============================================

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Roadmap Generator - Creates structured purchasing roadmap
 */
export class RoadmapGenerator {
  
  /**
   * Generate a complete roadmap from parsed intent
   * @param {object} parsedIntent - Output from IntentParser
   * @param {object} options - Generation options
   * @returns {object} Complete roadmap with ordering and dependencies
   */
  async generateRoadmap(parsedIntent, options = {}) {
    
    // Step 1: Load applicable templates
    const template = await this.loadTemplate(parsedIntent.projectType);
    
    // Step 2: Load heuristics for this category
    const heuristics = await this.loadHeuristics(parsedIntent.category);
    
    // Step 3: Merge template with parsed components
    const mergedComponents = this.mergeWithTemplate(parsedIntent.components, template);
    
    // Step 4: Apply heuristics to refine requirements
    const refinedComponents = this.applyHeuristics(mergedComponents, heuristics, parsedIntent);
    
    // Step 5: Determine dependencies and ordering
    const orderedRoadmap = this.orderByDependencies(refinedComponents, template?.priority_order);
    
    // Step 6: Add decision points and alternatives
    const roadmapWithAlternatives = this.addDecisionPoints(orderedRoadmap);
    
    return {
      roadmapId: this.generateRoadmapId(),
      projectType: parsedIntent.projectType,
      category: parsedIntent.category,
      roadmap: roadmapWithAlternatives,
      estimatedTimeline: this.estimateTimeline(orderedRoadmap),
      estimatedBudget: parsedIntent.estimatedBudget,
      complexity: parsedIntent.complexity,
      generatedAt: new Date().toISOString()
    };
  }
  
  /**
   * Load template for project type
   */
  async loadTemplate(projectType) {
    const { data: template, error } = await supabase
      .from('project_templates')
      .select('*')
      .eq('project_type', projectType)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      console.error('Error loading template:', error);
    }
    
    return template;
  }
  
  /**
   * Load heuristics for category
   */
  async loadHeuristics(category) {
    const { data: heuristics, error } = await supabase
      .from('heuristics')
      .select('*')
      .eq('category', category);
    
    if (error) {
      console.error('Error loading heuristics:', error);
      return [];
    }
    
    return heuristics || [];
  }
  
  /**
   * Merge parsed components with template
   */
  mergeWithTemplate(components, template) {
    if (!template) return components;
    
    const templateItems = template.template_items || [];
    const merged = [...components];
    
    // Add any template items not already in components
    templateItems.forEach(templateItem => {
      const exists = components.find(c => 
        c.componentName.toLowerCase() === templateItem.item.toLowerCase()
      );
      
      if (!exists) {
        merged.push({
          componentName: templateItem.item,
          category: templateItem.category,
          priority: templateItem.priority,
          quantity: templateItem.quantity,
          specifications: {},
          source: 'template',
          reasoning: 'Recommended based on project template'
        });
      }
    });
    
    return merged;
  }
  
  /**
   * Apply heuristics to refine requirements
   */
  applyHeuristics(components, heuristics, parsedIntent) {
    if (!heuristics || heuristics.length === 0) return components;
    
    return components.map(component => {
      const applicableHeuristics = heuristics.filter(h => 
        this.evaluateConditions(h.conditions, component, parsedIntent)
      );
      
      // Apply recommendations from matching heuristics
      applicableHeuristics.forEach(heuristic => {
        component.specifications = {
          ...component.specifications,
          ...heuristic.recommendation
        };
        
        component.heuristicApplied = component.heuristicApplied || [];
        component.heuristicApplied.push({
          name: heuristic.heuristic_name,
          confidence: heuristic.confidence_score,
          recommendation: heuristic.recommendation
        });
      });
      
      return component;
    });
  }
  
  /**
   * Evaluate if heuristic conditions match
   */
  evaluateConditions(conditions, component, parsedIntent) {
    // Simple condition evaluation - can be made more sophisticated
    if (conditions.category && component.category !== conditions.category) {
      return false;
    }
    
    if (conditions.budget_range) {
      const budget = parsedIntent.estimatedBudget?.max || Infinity;
      if (budget < conditions.budget_range.min || budget > conditions.budget_range.max) {
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Order components by dependencies
   */
  orderByDependencies(components, priorityOrder = {}) {
    const dependencies = priorityOrder?.dependencies || {};
    const ordered = [];
    const visited = new Set();
    
    // Helper function for topological sort
    const visit = (componentName) => {
      if (visited.has(componentName)) return;
      
      const component = components.find(c => 
        c.category === componentName || 
        c.componentName.toLowerCase().includes(componentName.toLowerCase())
      );
      
      if (!component) return;
      
      // Visit dependencies first
      const deps = dependencies[componentName] || [];
      deps.forEach(dep => visit(dep));
      
      visited.add(componentName);
      ordered.push(component);
    };
    
    // Process all components
    components.forEach(c => {
      visit(c.category || c.componentName);
    });
    
    // Add any components not in dependency graph
    components.forEach(c => {
      if (!ordered.includes(c)) {
        ordered.push(c);
      }
    });
    
    // Add step numbers
    return ordered.map((component, index) => ({
      ...component,
      step: index + 1,
      dependencies: dependencies[component.category] || []
    }));
  }
  
  /**
   * Add decision points and alternatives to roadmap
   */
  addDecisionPoints(orderedRoadmap) {
    return orderedRoadmap.map(step => {
      // Identify optional components as decision points
      if (step.priority === 'optional') {
        step.decisionPoint = {
          question: `Do you want to include ${step.componentName}?`,
          ifYes: `Proceed with ${step.componentName}`,
          ifNo: 'Skip this component',
          recommendation: step.reasoning
        };
      }
      
      // Identify components with spec choices
      if (step.specifications && Object.keys(step.specifications).length > 0) {
        step.specificationChoices = Object.keys(step.specifications).map(spec => ({
          specification: spec,
          options: ['budget', 'mid-range', 'premium'],
          recommendation: step.specifications[spec]
        }));
      }
      
      return step;
    });
  }
  
  /**
   * Estimate timeline for roadmap
   */
  estimateTimeline(roadmap) {
    const essentialCount = roadmap.filter(c => c.priority === 'essential').length;
    const recommendedCount = roadmap.filter(c => c.priority === 'recommended').length;
    
    // Rough estimate: 30min research per essential, 15min per recommended
    const researchMinutes = (essentialCount * 30) + (recommendedCount * 15);
    const purchaseMinutes = 30; // Time to complete purchases
    
    return {
      researchTime: `${Math.ceil(researchMinutes / 60)} hours`,
      purchaseTime: `${purchaseMinutes} minutes`,
      totalEstimate: `${Math.ceil((researchMinutes + purchaseMinutes) / 60)} hours`,
      steps: roadmap.length
    };
  }
  
  /**
   * Generate unique roadmap ID
   */
  generateRoadmapId() {
    return `roadmap_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Save roadmap to database
   */
  async saveRoadmap(roadmap, userId = null, sessionId = null) {
    const { data, error } = await supabase
      .from('user_roadmaps')
      .insert({
        user_id: userId,
        session_id: sessionId || roadmap.roadmapId,
        original_intent: roadmap.projectType,
        parsed_components: roadmap.roadmap.map(r => ({
          component: r.componentName,
          priority: r.priority
        })),
        generated_roadmap: roadmap.roadmap,
        optimization_preferences: {}
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error saving roadmap:', error);
      throw error;
    }
    
    return data;
  }
}

export default RoadmapGenerator;
