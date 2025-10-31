// app/page.js
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="bg-blue-600 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Intent-to-Solution Search Engine
          </h1>
          <p className="text-xl">
            AI-Powered Bundle Optimization for Complex Purchases
          </p>
        </div>
      </div>

      {/* Problem / Solution */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="bg-gray-100 rounded-xl p-8 mb-12">
          <p className="text-gray-700 mb-2">
            <strong>The Problem:</strong> Google gives links. ChatGPT gives information. Amazon gives products.
          </p>
          <p className="text-gray-800 font-semibold">
            <strong>The Solution:</strong> You give COMPLETE, OPTIMIZED SOLUTIONS in one search.
          </p>
        </div>

        {/* How It Works */}
        <h2 className="text-3xl font-bold text-center mb-8">HOW IT WORKS</h2>
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="text-center">
            <div className="bg-blue-600 text-white rounded-lg p-4 mb-2">1. USER INPUT</div>
            <p>"Build a home theater"</p>
          </div>
          <div className="text-center">
            <div className="bg-green-600 text-white rounded-lg p-4 mb-2">2. AI DECOMPOSE</div>
            <p>Receiver → Speakers → TV</p>
          </div>
          <div className="text-center">
            <div className="bg-blue-500 text-white rounded-lg p-4 mb-2">3. PARALLEL SEARCH</div>
            <p>Amazon • Best Buy • B&H</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bg-green-500 text-white rounded-lg p-4 mb-2">4. COMPATIBILITY</div>
            <p>HDMI • Impedance • Watts</p>
          </div>
          <div className="text-center">
            <div className="bg-green-600 text-white rounded-lg p-4 mb-2">5. RETURN SOLUTION</div>
            <p>3 Complete Bundles</p>
          </div>
          <div className="text-center">
            <div className="bg-blue-600 text-white rounded-lg p-4 mb-2">6. OPTIMIZE</div>
            <p>Price • Speed • Quality</p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <Link
            href="/solution-engine"
            className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg text-xl font-bold hover:bg-blue-700"
          >
            Try It Now →
          </Link>
        </div>
      </div>
    </div>
  );
}