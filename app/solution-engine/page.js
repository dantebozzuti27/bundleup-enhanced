// app/solution-engine/page.js
'use client';

import Roadmap from '@/components/Roadmap';  // ← DEFAULT IMPORT
import { useState } from 'react';

export default function SolutionEngine() {
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');

  const generate = async () => {
    if (!input.trim()) return alert('Enter your goal');

    setLoading(true);
    try {
      const res = await fetch('/api/parse-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input }),
      });

      if (!res.ok) throw new Error(await res.text());

      const data = await res.json();
      setRoadmap(data.roadmap);
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Intent-to-Solution Engine</h1>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g., Build a home theater"
          className="w-full p-4 rounded-lg border border-gray-300 mb-4"
          rows="3"
        />
        <button
          onClick={generate}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Analyzing...' : 'Generate Solution'}
        </button>

        {loading && (
          <div className="mt-8 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse"></div>
            ))}
          </div>
        )}

        {roadmap && <Roadmap items={roadmap} />}
      </div>
    </div>
  );
}