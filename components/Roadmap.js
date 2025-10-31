// components/Roadmap.js
'use client';
import { useState } from 'react';

export default function Roadmap({ items }) {
  const [open, setOpen] = useState([]);

  const toggle = (i) => {
    setOpen(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);
  };

  return (
    <div className="mt-8 space-y-6">
      {items.map((bundle, i) => (
        <div key={i} className="bg-white rounded-xl shadow-lg overflow-hidden">
          <button
            onClick={() => toggle(i)}
            className="w-full px-6 py-4 text-left flex justify-between items-center bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold"
          >
            <span>{bundle.name} - Full Framework</span>
            <span>{bundle.products.length} Components | {bundle.totalPrice}</span>
          </button>
          {open.includes(i) && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bundle.products.map((p, j) => (
                  <div key={j} className="border rounded-lg p-4 hover:shadow-md transition">
                    <h4 className="font-semibold text-sm mb-2">{p.title}</h4>
                    {p.price && <p className="text-green-600 font-bold text-lg mb-2">{p.price}</p>}
                    <p className="text-xs text-gray-500 mb-2">{p.retailer} | {p.rating} stars</p>
                    <a
                      href={p.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full bg-green-600 text-white text-center py-2 rounded font-semibold hover:bg-green-700"
                    >
                      Add to Cart
                    </a>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-green-50 rounded text-center">
                <p className="text-green-800 font-semibold">Complete Bundle Ready to Buy</p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}