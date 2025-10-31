// components/Roadmap.js
'use client';
import { useState } from 'react';

export default function Roadmap({ items }) {
  const [open, setOpen] = useState([]);

  const toggle = (i) => {
    setOpen(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);
  };

  return (
    <div className="mt-8 space-y-4">
      {items.map((cat, i) => (
        <div key={i} className="bg-white rounded-xl shadow-md">
          <button
            onClick={() => toggle(i)}
            className="w-full px-6 py-4 text-left flex justify-between items-center bg-blue-600 text-white font-bold rounded-t-xl"
          >
            {cat.name} {cat.products.length > 0 && `(${cat.products.length})`}
            <span>{open.includes(i) ? '−' : '+'}</span>
          </button>
          {open.includes(i) && (
            <div className="p-4">
              {cat.products.length === 0 ? (
                <p className="text-gray-500">Searching Amazon, Best Buy, B&H...</p>
              ) : (
                <div className="space-y-3">
                  {cat.products.map((p, j) => (
                    <a key={j} href={p.link} target="_blank" className="block p-3 border rounded-lg hover:bg-gray-50">
                      <div className="font-medium">{p.title}</div>
                      <div className="text-green-600">{p.price}</div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}