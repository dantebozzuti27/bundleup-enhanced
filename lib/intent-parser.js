// ============================================
// INTENT PARSER - LLM/Retrieval-Augmented
// Maps user goals to component taxonomy
// ============================================

import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Intent Parser - Analyzes user input and decomposes into structured requirements
 */
export class IntentParser {
  
  /**
   * Parse user intent into structured components
   * @param {string} userIntent - User's goal (e.g., "build a home theater")
   * @param {object} userProfile - Optional user preferences and history
   * @returns {object} Parsed intent with components and requirements
   */
  async parseIntent(userIntent, userProfile = null) {
    
    // Step 1: Retrieve relevant templates from knowledge base
    const templates = await this.retrieveTemplates(userIntent);
    
    // Step 2: Get user preferences if available
    const preferences = userProfile ? await this.getUserPreferences(userProfile.userId) : null;
    
    // Step 3: Use LLM to decompose intent with RAG context
    const parsedIntent = await this.llmDecompose(userIntent, templates, preferences);
    
    // Step 4: Map to product taxonomy
    const mappedComponents = await this.mapToTaxonomy(parsedIntent);
    
    return {
      originalIntent: userIntent,
      projectType: parsedIntent.projectType,
      category: parsedIntent.category,
      components: mappedComponents,
      requirements: parsedIntent.requirements,
      preferences: parsedIntent.preferences,
      estimatedBudget: parsedIntent.estimatedBudget,
      complexity: parsedIntent.complexity,
      parsedAt: new Date().toISOString()
    };
  }
  
  /**
   * Retrieve relevant templates from knowledge base
   */
  async retrieveTemplates(userIntent) {
    // Use keyword matching to find relevant templates
    const { data: templates, error } = await supabase
      .from('project_templates')
      .select('*')
      .limit(3);
    
    if (error) {
      console.error('Error retrieving templates:', error);
      return [];
    }
    
    return templates || [];
  }
  
  /**
   * Get user preferences from profile store
   */
  async getUserPreferences(userId) {
    const { data: preferences, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error retrieving preferences:', error);
      return null;
    }
    
    // Convert to key-value object
    const prefs = {};
    preferences?.forEach(pref => {
      prefs[pref.preference_key] = pref.preference_value;
    });
    
    return prefs;
  }
  
  /**
   * LLM-powered intent decomposition with RAG
   */
  async llmDecompose(userIntent, templates, preferences) {
    
    const templateContext = templates.length > 0 
      ? `\n\nRelevant templates:\n${JSON.stringify(templates, null, 2)}`
      : '';
    
    const preferenceContext = preferences 
      ? `\n\nUser preferences:\n${JSON.stringify(preferences, null, 2)}`
      : '';
    
    const prompt = `You are an expert at decomposing complex purchasing goals into structured requirements.

User Intent: "${userIntent}"
${templateContext}${preferenceContext}

Analyze this intent and return a structured JSON response with:
1. projectType: A clear name for this type of project (e.g., "home_theater", "gaming_pc")
2. category: High-level category (e.g., "home_entertainment", "computing", "diy")
3. requirements: Detailed technical and functional requirements
4. preferences: Inferred user preferences (budget sensitivity, brand preferences, quality vs price)
5. estimatedBudget: Estimated budget range {min, max}
6. complexity: Project complexity ("beginner", "intermediate", "advanced")
7. components: List of needed components with:
   - componentName: What is needed
   - category: Product category
   - priority: "essential", "recommended", or "optional"
   - quantity: How many needed
   - specifications: Any technical specs mentioned or implied
   - reasoning: Why this component is needed

Be specific about technical requirements like:
- For home theater: HDMI versions, audio formats, speaker impedance, wattage
- For gaming: GPU requirements, monitor refresh rates, resolution
- For DIY: material specifications, tool requirements

Return ONLY valid JSON, no markdown formatting.`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });
    
    const responseText = message.content[0].text;
    
    try {
      // Remove markdown code blocks if present
      const jsonText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(jsonText);
    } catch (error) {
      console.error('Error parsing LLM response:', error);
      throw new Error('Failed to parse intent');
    }
  }
  
  /**
   * Map parsed components to product taxonomy/categories
   */
  async mapToTaxonomy(parsedIntent) {
    // Get product categories from database
    const { data: categories, error } = await supabase
      .from('product_categories')
      .select('*');
    
    if (error) {
      console.error('Error retrieving categories:', error);
      return parsedIntent.components;
    }
    
    // Map each component to closest category match
    return parsedIntent.components.map(component => {
      // Find best matching category
      const matchedCategory = categories?.find(cat => 
        cat.name.toLowerCase().includes(component.category?.toLowerCase()) ||
        component.category?.toLowerCase().includes(cat.name.toLowerCase())
      );
      
      return {
        ...component,
        categoryId: matchedCategory?.id || null,
        requiredSpecs: matchedCategory?.required_specs || {},
        taxonomyMapped: !!matchedCategory
      };
    });
  }
  
  /**
   * Validate parsed intent for completeness
   */
  validateIntent(parsedIntent) {
    const errors = [];
    
    if (!parsedIntent.projectType) {
      errors.push('Missing project type');
    }
    
    if (!parsedIntent.components || parsedIntent.components.length === 0) {
      errors.push('No components identified');
    }
    
    const essentialComponents = parsedIntent.components?.filter(c => c.priority === 'essential');
    if (essentialComponents?.length === 0) {
      errors.push('No essential components identified');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export default IntentParser;
