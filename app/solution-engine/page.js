// app/solution-engine/page.js
'use client';

import Roadmap from '@/components/Roadmap';
import { useState } from 'react';

export default function SolutionEngine() {
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');

  const generate = async () => {
    if (!input.trim()) return alert('Enter a prompt');

    setLoading(true);
    try {
      const res = await fetch('/api/parse-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input }),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt);
      }

      const data = await res.json();
      setRoadmap(data.roadmap || data);
    } catch (err) {
      console.error(err);
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-2xl mx-auto text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
          BundleUp Enhanced
        </h1>
        <p className="text-gray-600">Tell me what you need — I’ll build your PC.</p>
      </div>

      <div className="max-w-2xl mx-auto mb-12 space-y-4">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g., Gaming PC for 4K, $1500 budget"
          className="w-full p-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows="4"
        />
        <button
          onClick={generate}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {loading ? 'Building…' : 'Generate Build'}
        </button>
      </div>

      {/* Skeleton */}
      {loading && (
        <div className="max-w-4xl mx-auto space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse"></div>
          ))}
        </div>
      )}

      {/* Roadmap */}
      {roadmap && <Roadmap items={roadmap} />}
    </div>
  );
}