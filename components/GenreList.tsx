"use client";

import { useEffect, useState } from "react";

interface Genre {
  id: number;
  name: string;
}

interface GenreListProps {
  selectedGenreId: number | null;
  onSelectGenre: (id: number | null) => void;
}

export default function GenreList({ selectedGenreId, onSelectGenre }: GenreListProps) {
  const [genres, setGenres] = useState<Genre[]>([]);

  useEffect(() => {
    async function fetchGenres() {
      const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
      const res = await fetch(
        `https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=tr-TR`
      );
      const data = await res.json();
      setGenres(data.genres);
    }
    fetchGenres();
  }, []);

  return (
    <aside className="w-48 bg-gray-100 p-4 rounded shadow-md">
      <h2 className="font-bold text-lg mb-4">Türlerine Göre Filmler</h2>
      <ul className="space-y-2">
        <li>
          <button
            onClick={() => onSelectGenre(null)}
            className={`w-full text-left px-2 py-1 rounded ${
              selectedGenreId === null ? "bg-blue-600 text-white" : "hover:bg-gray-200"
            }`}
          >
            Tümü
          </button>
        </li>
        {genres.map((genre) => (
          <li key={genre.id}>
            <button
              onClick={() => onSelectGenre(genre.id)}
              className={`w-full text-left px-2 py-1 rounded ${
                selectedGenreId === genre.id ? "bg-blue-600 text-white" : "hover:bg-gray-200"
              }`}
            >
              {genre.name}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
