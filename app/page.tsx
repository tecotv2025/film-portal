"use client";

import { useState } from "react";
import Navbar from "../components/Navbar";
import GenreList from "../components/GenreList";
import MovieList from "../components/MovieList";

export default function Page() {
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [genreId, setGenreId] = useState<number | null>(null);

  return (
    <>
      <Navbar selected={filter} onSelect={setFilter} />
      <main className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
        <GenreList selectedGenreId={genreId} onSelectGenre={(id) => {
          setGenreId(id);
          setPage(1); // Tür değişince sayfayı 1 yap
        }} />
        <div className="flex-1">
          <MovieList
            filter={filter}
            page={page}
            onPageChange={setPage}
            genreId={genreId}
          />
        </div>
      </main>
    </>
  );
}
