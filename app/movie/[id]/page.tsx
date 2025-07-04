// app/movie/[id]/page.tsx
// Bu dosya bir Sunucu Bileşenidir (varsayılan olarak).
// Client-side hook'lar veya DOM etkileşimleri burada olmaz.

import Image from "next/image"; // Next.js Image bileşeni için
import MainLayoutWrapper from "../../../components/MainLayoutWrapper"; // MainLayoutWrapper'ı import ediyoruz

// --- Interfaces ---
// Film detay API'sından gelecek verinin yapısı
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
}

// Credits API'sından gelen 'cast' üyeleri için arayüz
interface CastMember {
  id: number;
  name: string;
  character: string; // Oyuncunun canlandırdığı karakter
  profile_path: string | null;
}

// Credits API'sından gelen 'crew' üyeleri (yönetmen vb.) için arayüz
interface CrewMember {
  id: number;
  name: string;
  job: string; // Örneğin 'Director', 'Writer'
  profile_path: string | null;
}

// Sayfa parametrelerinin tipi
interface MovieDetailPageProps {
  params: { id: string }; // URL'den gelecek film ID'si
}

// --- MovieDetailPage Bileşeni ---
export default async function MovieDetailPage({ params }: MovieDetailPageProps) {
  const movieId = params.id; // URL'den film ID'sini alıyoruz
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY; // API Anahtarını alıyoruz

  // API Anahtarı kontrolü: Tanımlı değilse hata mesajı göster
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
  let videoKey: string | null = null; // Fragman videosu için YouTube anahtarı
  let cast: CastMember[] = []; // Film oyuncuları
  let director: CrewMember | null = null; // Filmin yönetmeni

  try {
    // 1. Film detaylarını çekmek için API isteği
    const movieRes = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&language=tr-TR`,
      { cache: 'force-cache' } // Sunucu bileşeni olduğu için cache stratejisi
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
      throw new Error(`Film detayları çekilirken hata oluştu: ${movieRes.status} - ${movieRes.statusText}`);
    }
    movie = await movieRes.json();

    // 2. Fragman (videos) bilgilerini çekmek için API isteği
    const videoRes = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${apiKey}&language=tr-TR`,
      { cache: 'force-cache' }
    );
    if (videoRes.ok) {
      const videoData = await videoRes.json();
      // YouTube'daki ana fragmanı bul (type='Trailer' ve site='YouTube')
      const trailer = videoData.results.find(
        (vid: any) => vid.site === "YouTube" && vid.type === "Trailer"
      );
      if (trailer) {
        videoKey = trailer.key;
      }
    } else {
      console.warn(`Fragman bilgileri çekilemedi (${videoRes.status}):`, videoRes.statusText);
    }

    // 3. Film kredilerini (oyuncular ve ekip) çekmek için API isteği
    const creditsRes = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${apiKey}&language=tr-TR`,
      { cache: 'force-cache' }
    );
    if (creditsRes.ok) {
      const creditsData = await creditsRes.json();
      cast = creditsData.cast || []; // Oyuncuları al
      // Yönetmeni 'crew' dizisi içinde 'job: 'Director'' olan üyeyi bularak al
      director = creditsData.crew.find((member: any) => member.job === 'Director') || null;
    } else {
      console.warn(`Kredi bilgileri çekilemedi (${creditsRes.status}):`, creditsRes.statusText);
    }

  } catch (error) {
    // API çağrılarından herhangi birinde hata olursa bu bloğa düşer
    console.error("Film detayları, fragman veya krediler çekilirken hata oluştu:", error);
    return (
      <MainLayoutWrapper isDetailPage={true}>
        <div className="text-center text-red-500 mt-10">
          Film detayları yüklenirken bir sorun oluştu. Detay: {error instanceof Error ? error.message : String(error)}
        </div>
      </MainLayoutWrapper>
    );
  }

  // Eğer API'dan hiç film verisi gelmezse veya null dönerse
  if (!movie) {
    return (
      <MainLayoutWrapper isDetailPage={true}>
        <div className="text-center text-gray-600 mt-10 text-xl">
          Film bilgileri yüklenemedi. (Boş veri)
        </div>
      </MainLayoutWrapper>
    );
  }

  // Film posteri ve arka plan resmi için URL'ler
  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : "/no-image.png"; // Poster yoksa varsayılan resim
  const backdropUrl = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    : null; // Büyük arka plan resmi

  // Fragman iframe için YouTube embed URL'si
  const youtubeEmbedUrl = videoKey ? `https://www.youtube.com/embed/${videoKey}` : '';

  return (
    <MainLayoutWrapper isDetailPage={true}>
      {/* Detay sayfası içeriği */}
      <div className="relative min-h-screen pb-10">
        {/* Arka Plan Resmi */}
        {backdropUrl && (
          <div className="absolute inset-0 z-0">
            <Image
              src={backdropUrl}
              alt={movie.title}
              layout="fill" // Parent'ına yayılır
              objectFit="cover" // Resmi kırparak sığdırır
              quality={75} // Resim kalitesi
              className="opacity-20" // Hafif şeffaflık
              priority // İlk yüklemede öncelikli yükle
            />
            {/* Arka plan üzerine koyu gradyan (metin okunurluğu için) */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/80 to-transparent"></div>
          </div>
        )}

        <div className="relative z-10 max-w-6xl mx-auto px-4 py-8 text-white">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Film Posteri */}
            <div className="md:w-1/3 flex-shrink-0">
              <Image
                src={posterUrl}
                alt={movie.title}
                width={400} // Genişlik belirtilmeli
                height={600} // Yükseklik belirtilmeli (poster en boy oranına göre)
                className="rounded-lg shadow-xl w-full h-auto"
                priority // İlk yüklemede öncelikli yükle
              />
            </div>

            {/* Film Bilgileri, Fragman, Yönetmen, Oyuncular */}
            <div className="md:w-2/3">
              <h1 className="text-4xl font-bold mb-2">{movie.title}</h1>
              {movie.tagline && <p className="text-xl text-gray-300 italic mb-4">{movie.tagline}</p>}
              <p className="text-lg mb-4">{movie.overview || "Açıklama yok."}</p>

              <div className="grid grid-cols-2 gap-y-2 gap-x-4 mb-6 text-gray-300">
                <p>
                  <strong>Çıkış Tarihi:</strong> {movie.release_date || "N/A"}
                </p>
                <p>
                  <strong>IMDb Puanı:</strong> {movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"} / 10
                </p>
                <p>
                  <strong>Süre:</strong> {movie.runtime ? `${movie.runtime} dakika` : "N/A"}
                </p>
                <p>
                  <strong>Türler:</strong>{" "}
                  {movie.genres && movie.genres.length > 0 ? movie.genres.map((g) => g.name).join(", ") : "N/A"}
                </p>
              </div>

              {/* Fragman Bölümü */}
              {youtubeEmbedUrl && (
                <div className="mt-8">
                  <h2 className="text-2xl font-bold mb-4">Fragman</h2>
                  <div className="relative" style={{ paddingBottom: "56.25%", height: 0 }}>
                    <iframe
                      className="absolute top-0 left-0 w-full h-full rounded-lg shadow-xl"
                      src={youtubeEmbedUrl} // Düzeltilmiş YouTube embed URL'si
                      title={`${movie.title} Fragmanı`}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>
              )}

              {/* Yönetmen Bilgisi Bölümü */}
              {director && (
                <div className="mt-8">
                  <h2 className="text-2xl font-bold mb-4">Yönetmen</h2>
                  <div className="flex items-center gap-4">
                    {director.profile_path ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w200${director.profile_path}`}
                        alt={director.name}
                        width={80} // Yönetmen resmi boyutları
                        height={80}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center text-gray-400 text-xs flex-shrink-0">
                        N/A
                      </div>
                    )}
                    <div>
                      <p className="text-lg font-semibold">{director.name}</p>
                      <p className="text-sm text-gray-400">{director.job}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Oyuncular Listesi Bölümü */}
              {cast.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-2xl font-bold mb-4">Oyuncular</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {/* İlk 10 oyuncuyu gösteriyoruz, daha fazlası için slice() kaldırılabilir veya artırılabilir */}
                    {cast.slice(0, 10).map((actor) => (
                      <div key={actor.id} className="text-center">
                        {actor.profile_path ? (
                          <Image
                            src={`https://image.tmdb.org/t/p/w200${actor.profile_path}`}
                            alt={actor.name}
                            width={100} // Oyuncu resmi boyutları
                            height={150}
                            className="rounded-lg object-cover w-full h-auto"
                          />
                        ) : (
                          <div className="w-full h-auto bg-gray-700 rounded-lg flex items-center justify-center text-gray-400 text-sm py-4 aspect-[2/3]">
                            N/A
                          </div>
                        )}
                        <p className="text-sm font-semibold mt-2">{actor.name}</p>
                        <p className="text-xs text-gray-400">{actor.character}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayoutWrapper>
  );
}