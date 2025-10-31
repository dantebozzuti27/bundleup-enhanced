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
"[project]/lib/roadmap-generator.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// ============================================
// ROADMAP GENERATOR - Templates & Rules Engine
// Produces ordered solution blueprint
// ============================================
__turbopack_context__.s([
    "RoadmapGenerator",
    ()=>RoadmapGenerator,
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/module/index.js [app-route] (ecmascript) <locals>");
;
const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(("TURBOPACK compile-time value", "https://kntjsvnhwkneqszdhwtc.supabase.co"), process.env.SUPABASE_SERVICE_ROLE_KEY);
class RoadmapGenerator {
    /**
   * Generate a complete roadmap from parsed intent
   * @param {object} parsedIntent - Output from IntentParser
   * @param {object} options - Generation options
   * @returns {object} Complete roadmap with ordering and dependencies
   */ async generateRoadmap(parsedIntent, options = {}) {
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
   */ async loadTemplate(projectType) {
        const { data: template, error } = await supabase.from('project_templates').select('*').eq('project_type', projectType).single();
        if (error && error.code !== 'PGRST116') {
            console.error('Error loading template:', error);
        }
        return template;
    }
    /**
   * Load heuristics for category
   */ async loadHeuristics(category) {
        const { data: heuristics, error } = await supabase.from('heuristics').select('*').eq('category', category);
        if (error) {
            console.error('Error loading heuristics:', error);
            return [];
        }
        return heuristics || [];
    }
    /**
   * Merge parsed components with template
   */ mergeWithTemplate(components, template) {
        if (!template) return components;
        const templateItems = template.template_items || [];
        const merged = [
            ...components
        ];
        // Add any template items not already in components
        templateItems.forEach((templateItem)=>{
            const exists = components.find((c)=>c.componentName.toLowerCase() === templateItem.item.toLowerCase());
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
   */ applyHeuristics(components, heuristics, parsedIntent) {
        if (!heuristics || heuristics.length === 0) return components;
        return components.map((component)=>{
            const applicableHeuristics = heuristics.filter((h)=>this.evaluateConditions(h.conditions, component, parsedIntent));
            // Apply recommendations from matching heuristics
            applicableHeuristics.forEach((heuristic)=>{
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
   */ evaluateConditions(conditions, component, parsedIntent) {
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
   */ orderByDependencies(components, priorityOrder = {}) {
        const dependencies = priorityOrder?.dependencies || {};
        const ordered = [];
        const visited = new Set();
        // Helper function for topological sort
        const visit = (componentName)=>{
            if (visited.has(componentName)) return;
            const component = components.find((c)=>c.category === componentName || c.componentName.toLowerCase().includes(componentName.toLowerCase()));
            if (!component) return;
            // Visit dependencies first
            const deps = dependencies[componentName] || [];
            deps.forEach((dep)=>visit(dep));
            visited.add(componentName);
            ordered.push(component);
        };
        // Process all components
        components.forEach((c)=>{
            visit(c.category || c.componentName);
        });
        // Add any components not in dependency graph
        components.forEach((c)=>{
            if (!ordered.includes(c)) {
                ordered.push(c);
            }
        });
        // Add step numbers
        return ordered.map((component, index)=>({
                ...component,
                step: index + 1,
                dependencies: dependencies[component.category] || []
            }));
    }
    /**
   * Add decision points and alternatives to roadmap
   */ addDecisionPoints(orderedRoadmap) {
        return orderedRoadmap.map((step)=>{
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
                step.specificationChoices = Object.keys(step.specifications).map((spec)=>({
                        specification: spec,
                        options: [
                            'budget',
                            'mid-range',
                            'premium'
                        ],
                        recommendation: step.specifications[spec]
                    }));
            }
            return step;
        });
    }
    /**
   * Estimate timeline for roadmap
   */ estimateTimeline(roadmap) {
        const essentialCount = roadmap.filter((c)=>c.priority === 'essential').length;
        const recommendedCount = roadmap.filter((c)=>c.priority === 'recommended').length;
        // Rough estimate: 30min research per essential, 15min per recommended
        const researchMinutes = essentialCount * 30 + recommendedCount * 15;
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
   */ generateRoadmapId() {
        return `roadmap_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
   * Save roadmap to database
   */ async saveRoadmap(roadmap, userId = null, sessionId = null) {
        const { data, error } = await supabase.from('user_roadmaps').insert({
            user_id: userId,
            session_id: sessionId || roadmap.roadmapId,
            original_intent: roadmap.projectType,
            parsed_components: roadmap.roadmap.map((r)=>({
                    component: r.componentName,
                    priority: r.priority
                })),
            generated_roadmap: roadmap.roadmap,
            optimization_preferences: {}
        }).select().single();
        if (error) {
            console.error('Error saving roadmap:', error);
            throw error;
        }
        return data;
    }
}
const __TURBOPACK__default__export__ = RoadmapGenerator;
}),
"[project]/app/api/generate-roadmap/route.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// ============================================
// API ROUTE: /api/generate-roadmap
// Roadmap Generator - Creates solution blueprint
// ============================================
__turbopack_context__.s([
    "POST",
    ()=>POST,
    "maxDuration",
    ()=>maxDuration,
    "runtime",
    ()=>runtime
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$roadmap$2d$generator$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/roadmap-generator.js [app-route] (ecmascript)");
;
;
async function POST(request) {
    try {
        const { parsedIntent, userId, sessionId } = await request.json();
        if (!parsedIntent || !parsedIntent.components) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Parsed intent with components is required'
            }, {
                status: 400
            });
        }
        // Initialize Roadmap Generator
        const generator = new __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$roadmap$2d$generator$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"]();
        // Generate roadmap
        const roadmap = await generator.generateRoadmap(parsedIntent);
        // Save roadmap to database if user is provided
        if (userId || sessionId) {
            try {
                await generator.saveRoadmap(roadmap, userId, sessionId);
            } catch (dbError) {
                console.error('Failed to save roadmap:', dbError);
            // Continue even if save fails
            }
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            roadmap
        });
    } catch (error) {
        console.error('Roadmap generation error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Failed to generate roadmap',
            details: error.message
        }, {
            status: 500
        });
    }
}
const runtime = 'nodejs';
const maxDuration = 30;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__38f9e9e5._.js.map