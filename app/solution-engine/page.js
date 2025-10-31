'use client';

import { useState } from 'react';

export default function SolutionEnginePage() {
  const [step, setStep] = useState(1);
  const [userIntent, setUserIntent] = useState('');
  const [loading, setLoading] = useState(false);
  const [parsedIntent, setParsedIntent] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [solutions, setSolutions] = useState(null);
  const [error, setError] = useState(null);

  // Step 1: Parse Intent
  const handleParseIntent = async () => {
    if (!userIntent.trim()) {
      setError('Please enter a project goal');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/parse-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIntent })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to parse intent');
      }

      setParsedIntent(data.parsedIntent);
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Generate Roadmap
  const handleGenerateRoadmap = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          parsedIntent,
          sessionId: `session_${Date.now()}`
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate roadmap');
      }

      setRoadmap(data.roadmap);
      setStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Search and Optimize
  const handleSearchAndOptimize = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/search-and-optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          roadmap,
          preferences: {
            priceWeight: 0.4,
            qualityWeight: 0.3,
            compatibilityWeight: 0.2,
            availabilityWeight: 0.1
          },
          sessionId: `session_${Date.now()}`
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to optimize');
      }

      setSolutions(data);
      setStep(4);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Intent-to-Solution Engine</h1>
          <p className="text-gray-400 text-lg">
            AI-powered problem solving for complex purchases
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center items-center mb-12 space-x-4">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold
                ${s === step ? 'bg-green-500' : s < step ? 'bg-green-600' : 'bg-gray-700'}`}>
                {s}
              </div>
              {s < 4 && (
                <div className={`w-16 h-1 ${s < step ? 'bg-green-600' : 'bg-gray-700'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-6">
            <p className="text-red-200">⚠️ {error}</p>
          </div>
        )}

        {/* Step 1: User Input */}
        {step === 1 && (
          <div className="bg-gray-800 rounded-xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold mb-4">Step 1: What do you want to build?</h2>
            <p className="text-gray-400 mb-6">
              Describe your project goal in natural language
            </p>

            <textarea
              value={userIntent}
              onChange={(e) => setUserIntent(e.target.value)}
              placeholder="Example: Build a home theater for 4K movies with surround sound"
              className="w-full h-32 bg-gray-700 border border-gray-600 rounded-lg p-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />

            <div className="mt-6">
              <button
                onClick={handleParseIntent}
                disabled={loading || !userIntent.trim()}
                className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg transition-colors"
              >
                {loading ? 'Analyzing...' : 'Parse My Intent →'}
              </button>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <button
                onClick={() => setUserIntent('Build a home theater for 4K movies with 5.1 surround sound')}
                className="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg text-sm transition-colors"
              >
                🎬 Home Theater
              </button>
              <button
                onClick={() => setUserIntent('Set up a gaming PC for 4K gaming at 144Hz')}
                className="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg text-sm transition-colors"
              >
                🎮 Gaming PC
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Parsed Intent & Roadmap */}
        {step === 2 && parsedIntent && (
          <div className="bg-gray-800 rounded-xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold mb-4">Step 2: Review Your Project Plan</h2>
            
            <div className="bg-gray-700 rounded-lg p-6 mb-6">
              <h3 className="font-bold text-green-400 mb-2">Project: {parsedIntent.projectType}</h3>
              <p className="text-gray-300 mb-4">Category: {parsedIntent.category}</p>
              <p className="text-gray-400">
                Estimated Budget: ${parsedIntent.estimatedBudget?.min} - ${parsedIntent.estimatedBudget?.max}
              </p>
            </div>

            <h3 className="font-bold mb-3">Required Components:</h3>
            <div className="space-y-3 mb-6">
              {parsedIntent.components.map((component, idx) => (
                <div key={idx} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold">{component.componentName}</span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          component.priority === 'essential' ? 'bg-red-900 text-red-200' :
                          component.priority === 'recommended' ? 'bg-yellow-900 text-yellow-200' :
                          'bg-blue-900 text-blue-200'
                        }`}>
                          {component.priority}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">{component.reasoning}</p>
                      {component.specifications && Object.keys(component.specifications).length > 0 && (
                        <div className="mt-2 text-xs text-gray-500">
                          Specs: {JSON.stringify(component.specifications)}
                        </div>
                      )}
                    </div>
                    <div className="text-gray-400 ml-4">
                      Qty: {component.quantity}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleGenerateRoadmap}
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-600 text-white font-bold py-4 px-6 rounded-lg transition-colors"
            >
              {loading ? 'Generating Roadmap...' : 'Generate Solution Roadmap →'}
            </button>
          </div>
        )}

        {/* Step 3: Roadmap */}
        {step === 3 && roadmap && (
          <div className="bg-gray-800 rounded-xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold mb-4">Step 3: Your Solution Roadmap</h2>
            
            <div className="bg-gray-700 rounded-lg p-6 mb-6">
              <p className="text-gray-300 mb-2">
                📋 {roadmap.roadmap.length} components to source
              </p>
              <p className="text-gray-300">
                ⏱️ Estimated time: {roadmap.estimatedTimeline?.totalEstimate}
              </p>
            </div>

            <div className="space-y-4 mb-6">
              {roadmap.roadmap.map((item) => (
                <div key={item.step} className="bg-gray-700 rounded-lg p-4 border-l-4 border-green-500">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-green-900 text-green-200 px-3 py-1 rounded text-sm font-bold">
                      Step {item.step}
                    </span>
                    <span className="font-bold text-lg">{item.componentName}</span>
                  </div>
                  
                  {item.dependencies && item.dependencies.length > 0 && (
                    <p className="text-xs text-gray-400 mb-2">
                      Depends on: {item.dependencies.join(', ')}
                    </p>
                  )}
                  
                  {item.decisionPoint && (
                    <div className="mt-3 bg-gray-800 rounded p-3">
                      <p className="text-sm text-yellow-300">💡 {item.decisionPoint.question}</p>
                      <p className="text-xs text-gray-400 mt-1">{item.decisionPoint.recommendation}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={handleSearchAndOptimize}
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-600 text-white font-bold py-4 px-6 rounded-lg transition-colors"
            >
              {loading ? 'Finding Best Solutions...' : 'Search & Optimize →'}
            </button>
          </div>
        )}

        {/* Step 4: Optimized Solutions */}
        {step === 4 && solutions && (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-xl p-8 shadow-2xl">
              <h2 className="text-2xl font-bold mb-4">Step 4: Optimized Solutions</h2>
              
              {/* Compatibility Report */}
              {solutions.compatibilityReport && (
                <div className={`rounded-lg p-6 mb-6 ${
                  solutions.compatibilityReport.summary.compatible 
                    ? 'bg-green-900/30 border border-green-500' 
                    : 'bg-yellow-900/30 border border-yellow-500'
                }`}>
                  <h3 className="font-bold mb-2">
                    {solutions.compatibilityReport.summary.compatible ? '✅' : '⚠️'} 
                    {' '}Compatibility Check
                  </h3>
                  <p className="text-sm">
                    Score: {(solutions.compatibilityReport.summary.score * 100).toFixed(0)}% 
                    {' • '}
                    {solutions.compatibilityReport.summary.issueCount} issues
                    {' • '}
                    {solutions.compatibilityReport.summary.warningCount} warnings
                  </p>
                </div>
              )}

              {/* Insights */}
              {solutions.insights && (
                <div className="bg-gray-700 rounded-lg p-6 mb-6">
                  <h3 className="font-bold mb-3">Solution Insights</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Price Range</p>
                      <p className="font-bold">${solutions.insights.priceRange.min.toFixed(2)} - ${solutions.insights.priceRange.max.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Avg Quality Score</p>
                      <p className="font-bold">{(solutions.insights.qualityRange.average * 100).toFixed(0)}%</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Optimized Bundles */}
            {solutions.optimizedBundles && solutions.optimizedBundles.map((bundle) => (
              <div key={bundle.rank} className="bg-gray-800 rounded-xl p-6 shadow-2xl">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-3xl font-bold text-green-400">#{bundle.rank}</span>
                      {bundle.recommendation && (
                        <span className="bg-green-900 text-green-200 px-3 py-1 rounded text-sm font-bold">
                          {bundle.recommendation}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-300">{bundle.explanation}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-green-400">${bundle.totalPrice.toFixed(2)}</p>
                    <p className="text-sm text-gray-400">Total</p>
                  </div>
                </div>

                {/* Score Breakdown */}
                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div className="bg-gray-700 rounded p-3">
                    <p className="text-xs text-gray-400">Price</p>
                    <p className="text-lg font-bold">{(bundle.scores.price * 100).toFixed(0)}%</p>
                  </div>
                  <div className="bg-gray-700 rounded p-3">
                    <p className="text-xs text-gray-400">Quality</p>
                    <p className="text-lg font-bold">{(bundle.scores.quality * 100).toFixed(0)}%</p>
                  </div>
                  <div className="bg-gray-700 rounded p-3">
                    <p className="text-xs text-gray-400">Compatible</p>
                    <p className="text-lg font-bold">{(bundle.scores.compatibility * 100).toFixed(0)}%</p>
                  </div>
                  <div className="bg-gray-700 rounded p-3">
                    <p className="text-xs text-gray-400">Available</p>
                    <p className="text-lg font-bold">{(bundle.scores.availability * 100).toFixed(0)}%</p>
                  </div>
                </div>

                {/* Tradeoffs */}
                {bundle.tradeoffs && bundle.tradeoffs !== 'No significant tradeoffs' && (
                  <p className="text-sm text-yellow-300 mb-4">
                    ⚖️ {bundle.tradeoffs}
                  </p>
                )}

                {/* Products in Bundle */}
                <div className="space-y-2">
                  {Object.entries(bundle.bundle).map(([component, product]) => (
                    <div key={component} className="bg-gray-700 rounded p-3 flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-bold text-sm mb-1">{component}</p>
                        <p className="text-xs text-gray-400 truncate">{product.title}</p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-bold">${product.price}</p>
                        <p className="text-xs text-gray-400">{product.retailer}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <button className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                  Select This Solution
                </button>
              </div>
            ))}

            {/* Start Over */}
            <div className="text-center">
              <button
                onClick={() => {
                  setStep(1);
                  setUserIntent('');
                  setParsedIntent(null);
                  setRoadmap(null);
                  setSolutions(null);
                  setError(null);
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ← Start New Search
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
