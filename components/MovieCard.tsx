"use client";

import { useRouter } from "next/navigation";
import React from "react";

interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
}

interface MovieCardProps {
  movie: Movie;
}

export default function MovieCard({ movie }: MovieCardProps) {
  const router = useRouter();

  return (
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
  );
}