"use client";

import React, { useState } from "react";

interface NavbarProps {
  selected: string;
  onSelect: (category: string) => void;
  onSearch: (query: string) => void;
}

const categories = [
  { key: "all", label: "Tümü" },
  { key: "year", label: "2023-2025 Yılı" },
  { key: "imdb", label: "IMDb 7+ ve Üzeri" },
];

export default function Navbar({ selected, onSelect, onSearch }: NavbarProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    onSearch(e.target.value);
  };

  return (
    <nav className="bg-gray-900 text-white p-4 sticky top-0 z-20 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Kategoriler */}
        <div className="flex gap-6">
          {categories.map((cat) => (
            <button
              key={cat.key}
              type="button"
              className={`px-5 py-2 rounded-full font-semibold transition duration-200 ${
                selected === cat.key
                  ? "bg-blue-600 shadow-lg"
                  : "bg-gray-800 hover:bg-gray-700"
              }`}
              onClick={() => onSelect(cat.key)}
              aria-pressed={selected === cat.key}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Arama Kutusu */}
        <div className="relative w-full sm:w-64">
         <input
  type="text"
  placeholder="Film ara..."
  value={searchTerm}
  onChange={handleChange}
  className="w-full py-2 pl-10 pr-4 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
/>
          <span className="absolute left-3 top-2.5 text-gray-400 select-none pointer-events-none">
            🔍
          </span>
        </div>
      </div>
    </nav>
  );
}
