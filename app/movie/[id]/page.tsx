"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";



export default function MovieDetailPage({ params }) {
  const searchParams = useSearchParams();
  const videoUrl = searchParams.get("videoUrl");

  // TMDb’dan film bilgisi çekme kodu aynen kalabilir
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMovie() {
      const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
      const res = await fetch(
        `https://api.themoviedb.org/3/movie/${params.id}?api_key=${apiKey}&language=tr-TR&append_to_response=videos`
      );
      const data = await res.json();
      setMovie(data);
      setLoading(false);
    }
    fetchMovie();
  }, [params.id]);

  if (loading) return <p>Yükleniyor...</p>;
  if (!movie) return <p>Film bulunamadı.</p>;

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">{movie.title}</h1>
      {/* Film bilgileri */}
      <img
        src={
          movie.poster_path
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : "/no-image.png"
        }
        alt={movie.title}
        className="w-full max-w-sm rounded mb-4"
      />
      <p className="mb-4">{movie.overview}</p>
      <p><strong>Yayın Tarihi:</strong> {movie.release_date}</p>
      <p><strong>IMDb Puanı:</strong> {movie.vote_average}</p>
      <p><strong>Türler:</strong> {movie.genres.map(g => g.name).join(", ")}</p>

      {/* Video oynatıcı */}
      {videoUrl ? (
        <video
          controls
          src={videoUrl}
          className="w-full rounded mt-6"
          autoPlay
          muted
        />
      ) : (
        <p>Fragman veya video bulunamadı.</p>
      )}
    </main>
  );
}
