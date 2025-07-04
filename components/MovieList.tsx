"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
}

interface MovieListProps {
  filter: string;
  page: number;
  onPageChange: (page: number) => void;
  genreId: number | null;
}

export default function MovieList({ filter, page, onPageChange, genreId }: MovieListProps) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchMovies() {
      setLoading(true);
      const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
      const url = genreId
        ? `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=tr-TR&page=${page}&with_genres=${genreId}`
        : `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=tr-TR&page=${page}`;

      const res = await fetch(url);
      const data = await res.json();
      setMovies(data.results);
      setTotalPages(data.total_pages);
      setLoading(false);
    }
    fetchMovies();
  }, [page, genreId]);

  const filteredMovies = movies.filter((movie) => {
    if (filter === "year") {
      const year = parseInt(movie.release_date?.slice(0, 4) || "0");
      return year >= 2023 && year <= 2025;
    }
    if (filter === "imdb") {
      return movie.vote_average >= 7;
    }
    return true;
  });

  if (loading) return <p className="text-center mt-8">Yükleniyor...</p>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {filteredMovies.map((movie) => (
          <div
            key={movie.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition cursor-pointer"
            onClick={() => router.push(`/movie/${movie.id}`)}
          >
            <img
              src={
                movie.poster_path
                  ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                  : "/no-image.png"
              }
              alt={movie.title}
              className="w-full h-72 object-cover"
            />
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2">{movie.title}</h3>
              <p className="text-gray-600 text-sm mb-1 line-clamp-3">
                {movie.overview || "Açıklama yok."}
              </p>
              <p className="text-gray-500 text-xs">
                {movie.release_date} | IMDb: {movie.vote_average}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Bar */}
      <div className="flex justify-center mt-8 space-x-2">
        {[...Array(Math.min(totalPages, 10)).keys()].map((i) => (
          <button
            key={i + 1}
            onClick={() => onPageChange(i + 1)}
            className={`px-4 py-2 rounded ${
              page === i + 1 ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
