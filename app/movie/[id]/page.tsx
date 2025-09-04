import Image from "next/image";
import MainLayoutWrapper from "../../../components/MainLayoutWrapper";

interface MovieDetail {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  genres: { id: number; name: string }[];
  runtime: number;
  tagline: string | null;
}

interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

interface CrewMember {
  id: number;
  name: string;
  job: string;
  profile_path: string | null;
}

// --- Burayı değiştirdik ---
export default async function MovieDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const movieId = params.id;
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;

  if (!apiKey) {
    return (
      <MainLayoutWrapper isDetailPage={true}>
        <div className="text-center text-red-500 mt-10">
          API Anahtarı bulunamadı. Lütfen .env dosyanızı kontrol edin.
        </div>
      </MainLayoutWrapper>
    );
  }

  let movie: MovieDetail | null = null;
  let videoKey: string | null = null;
  let cast: CastMember[] = [];
  let director: CrewMember | null = null;

  try {
    const movieRes = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&language=tr-TR`,
      { cache: "force-cache" }
    );

    if (!movieRes.ok) {
      if (movieRes.status === 404) {
        return (
          <MainLayoutWrapper isDetailPage={true}>
            <div className="text-center text-gray-600 mt-10 text-xl">
              Film bulunamadı. (ID: {movieId})
            </div>
          </MainLayoutWrapper>
        );
      }
      throw new Error(`Film detayları alınamadı: ${movieRes.status}`);
    }

    movie = await movieRes.json();

    const videoRes = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${apiKey}&language=tr-TR`,
      { cache: "force-cache" }
    );
    if (videoRes.ok) {
      const videoData = await videoRes.json();
      const trailer = videoData.results.find(
        (vid: any) => vid.site === "YouTube" && vid.type === "Trailer"
      );
      if (trailer) videoKey = `https://www.youtube.com/embed/${trailer.key}`;
    }

    const creditsRes = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${apiKey}&language=tr-TR`,
      { cache: "force-cache" }
    );
    if (creditsRes.ok) {
      const creditsData = await creditsRes.json();
      cast = creditsData.cast || [];
      director =
        creditsData.crew.find((member: any) => member.job === "Director") ||
        null;
    }
  } catch (error) {
    return (
      <MainLayoutWrapper isDetailPage={true}>
        <div className="text-center text-red-500 mt-10">
          Hata: {error instanceof Error ? error.message : String(error)}
        </div>
      </MainLayoutWrapper>
    );
  }

  if (!movie) {
    return (
      <MainLayoutWrapper isDetailPage={true}>
        <div className="text-center text-gray-600 mt-10 text-xl">
          Film bilgileri yüklenemedi.
        </div>
      </MainLayoutWrapper>
    );
  }

  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : "/no-image.png";

  const backdropUrl = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    : null;

  return (
    <MainLayoutWrapper isDetailPage={true}>
      <div className="relative min-h-screen pb-10">
        {backdropUrl && (
          <div className="absolute inset-0 z-0">
            <Image
              src={backdropUrl}
              alt={movie.title}
              fill
              className="object-cover opacity-20"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/80 to-transparent"></div>
          </div>
        )}

        <div className="relative z-10 max-w-6xl mx-auto px-4 py-8 text-white">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="md:w-1/3 flex-shrink-0">
              <Image
                src={posterUrl}
                alt={movie.title}
                width={400}
                height={600}
                className="rounded-lg shadow-xl w-full h-auto"
                priority
              />
            </div>

            <div className="md:w-2/3">
              <h1 className="text-4xl font-bold mb-2">{movie.title}</h1>
              {movie.tagline && (
                <p className="text-xl text-gray-300 italic mb-4">
                  {movie.tagline}
                </p>
              )}
              <p className="text-lg mb-4">
                {movie.overview || "Açıklama yok."}
              </p>
              {/* Devamında senin cast, yönetmen ve fragman kodun aynı */}
            </div>
          </div>
        </div>
      </div>
    </MainLayoutWrapper>
  );
}
