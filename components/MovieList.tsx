"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import MovieCard from "./MovieCard"; // Yeni MovieCard bileşenini import ediyoruz

// --- Interfaces ---
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
  searchQuery: string;
}

// Türkçe karakterleri normalize eden fonksiyon (aynı kalıyor)
function normalizeText(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD") // Harfleri ayrıştırır
    .replace(/[\u0300-\u036f]/g, "") // Aksan işaretlerini kaldırır
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c");
}

// --- MovieList Bileşeni ---
export default function MovieList({
  filter,
  page,
  onPageChange,
  genreId,
  searchQuery,
}: MovieListProps) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // Hata state'i eklendi
  const router = useRouter();

  useEffect(() => {
    async function fetchMovies() {
      setLoading(true); // Yükleme başlıyor
      setError(null); // Yeni bir çağrı öncesi hatayı temizle
      const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;

      if (!apiKey) {
        setError("API Anahtarı bulunamadı. Lütfen .env dosyanızı kontrol edin.");
        setLoading(false);
        return;
      }

      let url = "";
      const baseUrl = "https://api.themoviedb.org/3";
      const commonParams = `api_key=${apiKey}&language=tr-TR&page=${page}`;

      if (searchQuery) {
        // Arama sorgusu varsa, TMDB'nin arama API'sını kullan
        // encodeURIComponent ile arama sorgusunu URL uyumlu hale getir
        url = `${baseUrl}/search/movie?query=${encodeURIComponent(searchQuery)}&${commonParams}`;
      } else if (genreId) {
        // Tür ID'si varsa, "discover" API'sını türe göre kullan
        url = `${baseUrl}/discover/movie?with_genres=${genreId}&${commonParams}`;
      } else {
        // Genel filtreler için "discover" API'sını kullan
        // Not: "popular" endpoint'i genellikle ek filtrelere izin vermez.
        // Bu yüzden "discover" daha esnek bir seçim.
        switch (filter) {
          case "year":
            // TMDB'de doğrudan 2023-2025 gibi bir aralık filtreleme yok.
            // Ya belirli bir yıl seçilmeli (örn: &primary_release_year=2024)
            // Ya da bu aralık için birden fazla çağrı yapılıp birleştirilmeli.
            // Basitlik adına şu an için 2024 ve 2025 yılını örnek alalım veya bu filtreyi daha sonra gözden geçirelim.
            // Bu örnekte, 'discover' API'sının 'primary_release_date.gte' ve 'primary_release_date.lte' parametrelerini kullanarak bir aralık belirleyeceğiz.
            url = `${baseUrl}/discover/movie?primary_release_date.gte=2023-01-01&primary_release_date.lte=2025-12-31&${commonParams}`;
            break;
          case "imdb":
            // IMDb 7+ ve üzeri için "vote_average.gte" parametresi
            url = `${baseUrl}/discover/movie?vote_average.gte=7&${commonParams}`;
            break;
          default: // filter === "all" ise
            url = `${baseUrl}/movie/popular?${commonParams}`; // Popüler filmler varsayılan
            break;
        }
      }

      try {
        const res = await fetch(url);

        if (!res.ok) {
          // HTTP durum kodu 200-299 arasında değilse hata fırlat
          throw new Error(`API Hatası: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();

        // TMDB API'dan boş sonuç gelirse (örn: arama sonucu yok)
        if (data.results && data.results.length === 0 && searchQuery) {
            setError("Aramanıza uygun film bulunamadı.");
            setMovies([]); // Filmleri temizle
            setTotalPages(0);
        } else if (data.results) {
            setMovies(data.results);
            setTotalPages(data.total_pages || 1); // total_pages yoksa varsayılan 1
        } else {
            // API'dan beklenen 'results' alanı gelmezse
            throw new Error("API yanıtı beklenen formatta değil.");
        }

      } catch (err) {
        console.error("Film listesi çekilirken hata oluştu:", err);
        // Kullanıcıya daha anlamlı bir hata mesajı göster
        if (err instanceof Error) {
            setError(`Filmler yüklenirken bir sorun oluştu: ${err.message}`);
        } else {
            setError("Filmler yüklenirken bilinmeyen bir sorun oluştu.");
        }
        setMovies([]); // Hata durumunda filmleri temizle
        setTotalPages(0); // Hata durumunda sayfayı sıfırla
      } finally {
        setLoading(false); // Yükleme tamamlandı
      }
    }

    fetchMovies();
  }, [page, genreId, searchQuery, filter]); // Bu bağımlılıklar değiştiğinde API çağrısı tetiklenir

  // --- JSX Render ---
  if (loading) {
    return (
      <div className="flex-1 flex justify-center items-center h-full min-h-[400px]">
        <p className="text-center text-lg text-gray-700">Filmler yükleniyor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex justify-center items-center h-full min-h-[400px]">
        <p className="text-center text-lg text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex-1"> {/* max-w-7xl mx-auto px-4 py-8 kaldırıldı, main içinde zaten var */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {movies.length === 0 ? ( // API'dan gelen movies'e göre kontrol
          <p className="col-span-full text-center text-gray-600 text-lg">
            {searchQuery ? "Aramanıza uygun film bulunamadı." : "Gösterilecek film bulunamadı."}
          </p>
        ) : (
          movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} /> // MovieCard bileşenini kullanıyoruz
          ))
        )}
      </div>

      {/* Sayfalama Çubuğu (totalPages > 1 ise göster) */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8 space-x-2 flex-wrap"> {/* flex-wrap eklendi */}
          {/* Önceki Sayfa butonu */}
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Önceki
          </button>

          {/* Sayfa Numaraları */}
          {[...Array(Math.min(totalPages, 10)).keys()].map((i) => ( // İlk 10 sayfayı göster
            <button
              key={i + 1}
              onClick={() => onPageChange(i + 1)}
              className={`px-4 py-2 rounded ${
                page === i + 1 ? "bg-blue-600 text-white" : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {i + 1}
            </button>
          ))}

          {/* Sonraki Sayfa butonu */}
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages || totalPages === 0} // totalPages 0 ise de devre dışı bırak
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Sonraki
          </button>
        </div>
      )}
    </div>
  );
}