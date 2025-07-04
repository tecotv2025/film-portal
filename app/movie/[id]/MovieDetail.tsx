"use client";

import { useState, useEffect } from "react";

interface MovieDetailProps {
  imdbId: string;
  videoUrl: string | null;
}

export default function MovieDetail({ imdbId, videoUrl }: MovieDetailProps) {
  const [movie, setMovie] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMovie() {
      const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;

      try {
        // imdbId'den tmdbId bul
        const findRes = await fetch(
          `https://api.themoviedb.org/3/find/${imdbId}?api_key=${apiKey}&language=tr-TR&external_source=imdb_id`
        );

        if (!findRes.ok) {
          setLoading(false);
          return;
        }

        const findData = await findRes.json();

        if (!findData.movie_results.length) {
          setLoading(false);
          return;
        }

        const tmdbId = findData.movie_results[0].id;

        // tmdbId ile film detaylarını çek
        const movieRes = await fetch(
          `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${apiKey}&language=tr-TR&append_to_response=videos`
        );

        if (!movieRes.ok) {
          setLoading(false);
          return;
        }

        const movieData = await movieRes.json();
        setMovie(movieData);
      } catch (error) {
        // İstersen console.log(error) yapabilirsin
      } finally {
        setLoading(false);
      }
    }

    fetchMovie();
  }, [imdbId]);

  if (loading) return <p>Yükleniyor...</p>;
  if (!movie) return <p>Film bulunamadı.</p>;

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">{movie.title}</h1>

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
      <p>
        <strong>Yayın Tarihi:</strong> {movie.release_date}
      </p>
      <p>
        <strong>IMDb Puanı:</strong> {movie.vote_average}
      </p>
      <p>
        <strong>Türler:</strong>{" "}
        {Array.isArray(movie.genres)
          ? movie.genres.map((g: any) => g.name).join(", ")
          : "Yok"}
      </p>

      {/* videoUrl varsa video oynat, yoksa gösterme */}
      {videoUrl ? (
        <video
          controls
          src={videoUrl}
          className="w-full rounded mt-6"
          autoPlay
          muted
        />
      ) : (
        <p>Video bulunamadı.</p>
      )}
    </main>
  );
}
