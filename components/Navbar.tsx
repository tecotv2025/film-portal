"use client";

import React from "react";

interface NavbarProps {
  selected: string;
  onSelect: (category: string) => void;
}

const categories = [
  { key: "all", label: "Tümü" },
  { key: "year", label: "2023-2025 Yılı" },
  { key: "imdb", label: "IMDb 7+ ve Üzeri" },
];

export default function Navbar({ selected, onSelect }: NavbarProps) {
  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-center gap-8 sticky top-0 z-10">
      {categories.map((cat) => (
        <button
          key={cat.key}
          className={`px-4 py-2 rounded-md font-semibold hover:bg-gray-700 transition ${
            selected === cat.key ? "bg-gray-700" : ""
          }`}
          onClick={() => onSelect(cat.key)}
        >
          {cat.label}
        </button>
      ))}
    </nav>
  );
}
