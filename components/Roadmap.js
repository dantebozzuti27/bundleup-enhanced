// components/Roadmap.js
'use client';
import { useState } from 'react';

export default function Roadmap({ items }) {
  const [open, setOpen] = useState([]);

  const toggle = (i) => {
    setOpen((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {items.map((cat, i) => (
        <div
          key={i}
          className="bg-white rounded-xl shadow-md overflow-hidden transition-transform hover:scale-[1.01]"
        >
          <button
            onClick={() => toggle(i)}
            className="w-full px-6 py-4 text-left flex justify-between items-center bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold"
          >
            <span>
              {cat.name} ({cat.products?.length || 0} options)
            </span>
            <span>{open.includes(i) ? '−' : '+'}</span>
          </button>

          {open.includes(i) && (
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {cat.products?.map((p, j) => (
                <a
                  key={j}
                  href={p.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition"
                >
                  {p.image && (
                    <img
                      src={p.image}
                      alt={p.title}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{p.title}</div>
                    {p.price && (
                      <div className="text-green-600 font-bold">{p.price}</div>
                    )}
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}