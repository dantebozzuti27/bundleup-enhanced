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
            className="w-full px-6 py-4 text-left flex justify-between items-center bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold"
          >
            <span>{bundle.name}</span>
            <span>{bundle.totalPrice} (from {bundle.products.map(p => p.retailer).filter(Boolean).join(', ')})</span>
          </button>
          {open.includes(i) && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bundle.products.map((p, j) => (
                  <a
                    key={j}
                    href={p.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 p-4 border rounded-lg hover:shadow-md transition"
                  >
                    {p.image && <img src={p.image} alt={p.title} className="w-20 h-20 object-cover rounded" />}
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{p.title}</h4>
                      {p.price && <p className="text-green-600 font-bold text-lg">{p.price}</p>}
                      <p className="text-xs text-gray-500">{p.retailer} • {p.rating}⭐</p>
                      <p className="text-xs text-blue-600">View Product</p>
                    </div>
                  </a>
                ))}
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded text-center">
                <p className="text-blue-800 font-semibold">Diverse sources: {bundle.products.length} items from web-wide search</p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}