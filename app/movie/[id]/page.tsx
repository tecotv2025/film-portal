// Bu sayfa sunucu tarafında render edilebilir (varsayılan)
// Detay sayfası için ilk yüklemede veriyi sunucudan çekmek SEO ve performans için daha iyidir.
// Eğer interaktivite için useState/useEffect kullanmanız gerekirse "use client"; ekleyebilirsiniz.

import Image from "next/image"; // Next.js Image component'i performans için iyi bir pratik

interface MovieDetail {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  genres: { id: number; name: string }[];
  runtime: number; // Film süresi (dakika)
  tagline: string | null; // Slogan
  // Diğer ihtiyaç duyabileceğiniz alanlar:
  // production_companies: { id: number; logo_path: string | null; name: string; origin_country: string }[];
  // spoken_languages: { english_name: string; iso_639_1: string; name: string }[];
  // videos: { results: { id: string; key: string; name: string; site: string; type: string }[] };
  // credits: { cast: any[]; crew: any[] };
}

// Parametrelerin tipi
interface MovieDetailPageProps {
  params: { id: string }; // URL'den gelecek film ID'si
}

// Next.js'in sunucu bileşenleri için async/await kullanımı
export default async function MovieDetailPage({ params }: MovieDetailPageProps) {
  const movieId = params.id; // URL'den film ID'sini alıyoruz
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY; // API Anahtarını alıyoruz

  if (!apiKey) {
    return (
      <div className="text-center text-red-500 mt-10">
        API Anahtarı bulunamadı. Lütfen .env dosyanızı kontrol edin.
      </div>
    );
  }

  let movie: MovieDetail | null = null;
  let videoKey: string | null = null; // Fragman videosu için

  try {
    // Film detaylarını çek
    const movieRes = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&language=tr-TR`
    );
    if (!movieRes.ok) {
      if (movieRes.status === 404) {
        return (
          <div className="text-center text-gray-600 mt-10 text-xl">
            Film bulunamadı.
          </div>
        );
      }
      throw new Error(`Film detayları çekilirken hata oluştu: ${movieRes.status}`);
    }
    movie = await movieRes.json();

    // Fragman (videos) bilgilerini çek
    const videoRes = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${apiKey}&language=tr-TR`
    );
    if (videoRes.ok) {
      const videoData = await videoRes.json();
      // YouTube fragmanını bul (type='Trailer' ve site='YouTube')
      const trailer = videoData.results.find(
        (vid: any) => vid.site === "YouTube" && vid.type === "Trailer"
      );
      if (trailer) {
        videoKey = trailer.key;
      }
    } else {
      console.warn("Fragman bilgileri çekilemedi:", videoRes.status);
    }

  } catch (error) {
    console.error("Film detayları veya fragman çekilirken hata oluştu:", error);
    return (
      <div className="text-center text-red-500 mt-10">
        Film detayları yüklenirken bir sorun oluştu. Lütfen daha sonra tekrar deneyin.
      </div>
    );
  }

  if (!movie) {
    // Eğer API'dan hiç veri gelmezse veya null dönerse
    return (
      <div className="text-center text-gray-600 mt-10 text-xl">
        Film bilgileri yüklenemedi.
      </div>
    );
  }

  // Resim URL'leri
  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : "/no-image.png";
  const backdropUrl = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    : null; // Büyük arka plan resmi

  return (
    <div className="relative min-h-screen pb-10">
      {/* Arka Plan Resmi */}
      {backdropUrl && (
        <div className="absolute inset-0 z-0">
          <Image
            src={backdropUrl}
            alt={movie.title}
            layout="fill"
            objectFit="cover"
            quality={75}
            className="opacity-20" // Hafif şeffaf
            priority // İlk yüklemede öncelikli yükle
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/80 to-transparent"></div> {/* Koyu gradyan */}
        </div>
      )}

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8 text-white">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Poster */}
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

          {/* Film Bilgileri */}
          <div className="md:w-2/3">
            <h1 className="text-4xl font-bold mb-2">{movie.title}</h1>
            {movie.tagline && <p className="text-xl text-gray-300 italic mb-4">{movie.tagline}</p>}
            <p className="text-lg mb-4">{movie.overview}</p>

            <div className="grid grid-cols-2 gap-y-2 gap-x-4 mb-6 text-gray-300">
              <p>
                <strong>Çıkış Tarihi:</strong> {movie.release_date}
              </p>
              <p>
                <strong>IMDb Puanı:</strong> {movie.vote_average.toFixed(1)} / 10
              </p>
              <p>
                <strong>Süre:</strong> {movie.runtime ? `${movie.runtime} dakika` : "N/A"}
              </p>
              <p>
                <strong>Türler:</strong>{" "}
                {movie.genres.map((g) => g.name).join(", ") || "N/A"}
              </p>
            </div>

            {/* Fragman */}
            {videoKey && (
              <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4">Fragman</h2>
                <div className="relative" style={{ paddingBottom: "56.25%", height: 0 }}>
                  <iframe
                    className="absolute top-0 left-0 w-full h-full rounded-lg shadow-xl"
                    src={`https://www.youtube.com/embed/${videoKey}`}
                    title={`${movie.title} Fragmanı`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            )}

            {/* Oyuncular ve Yönetmen (Ekstra API çağrıları gerekecek) */}
            {/* Bu kısım için ayrı bir useEffect veya API çağrısı yapmanız gerekecektir.
                Örn: await fetch(`https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${apiKey}&language=tr-TR`);
                Sonra 'cast' ve 'crew' verilerini işlersiniz.
            */}
            {/* <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4">Oyuncular</h2>
                <div className="flex flex-wrap gap-4">
                    {movie.credits?.cast.slice(0, 5).map((actor: any) => (
                        <div key={actor.id} className="text-center">
                            {actor.profile_path && (
                                <Image
                                    src={`https://image.tmdb.org/t/p/w200${actor.profile_path}`}
                                    alt={actor.name}
                                    width={80}
                                    height={120}
                                    className="rounded-full object-cover w-20 h-20 mb-2"
                                />
                            )}
                            <p className="text-sm font-semibold">{actor.name}</p>
                            <p className="text-xs text-gray-400">{actor.character}</p>
                        </div>
                    ))}
                </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}