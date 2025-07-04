// components/MainLayoutWrapper.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Navbar from "./Navbar";
import GenreList from "./GenreList";
import MovieList from "./MovieList";

const debounce = (func: (...args: any[]) => void, delay: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
};

interface MainLayoutWrapperProps {
  children?: React.ReactNode;
  isDetailPage?: boolean;
}

export default function MainLayoutWrapper({ children, isDetailPage = false }: MainLayoutWrapperProps) {
  const router = useRouter();
  const searchParams = useSearchParams(); // URL'deki parametreleri alır
  const pathname = usePathname(); // Mevcut URL yolunu alır

  // State'ler: Bu state'ler URL'deki parametreleri yansıtacak.
  // URL değiştiğinde bu state'ler de useEffect içinde güncellenecek.
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [genreId, setGenreId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // --- KRİTİK DEĞİŞİKLİK: useEffect ile URL'den State'i Senkronize Etme ---
  // Bu useEffect, URL'deki parametreler (searchParams) her değiştiğinde
  // bileşenin state'ini URL'deki güncel değerlere göre ayarlar.
  useEffect(() => {
    setFilter(searchParams.get('filter') || 'all');
    setPage(parseInt(searchParams.get('page') || '1', 10));
    setGenreId(() => {
      const genre = searchParams.get('genre');
      return genre ? parseInt(genre, 10) : null;
    });
    setSearchQuery(searchParams.get('query') || '');
  }, [searchParams]); // searchParams değiştiğinde bu useEffect çalışır.

  // --- KRİTİK DEĞİŞİKLİK: URL'yi Güncelleme Fonksiyonları ---
  // Bu fonksiyonlar artık doğrudan router.push/replace kullanarak URL'yi güncelliyor.
  // State'i doğrudan değiştirmek yerine, URL değiştiğinde yukarıdaki useEffect state'i güncelleyecek.

  const handleApplyFilters = useCallback((
    newFilter: string,
    newPage: number,
    newGenreId: number | null,
    newSearchQuery: string
  ) => {
    const params = new URLSearchParams();
    if (newFilter && newFilter !== 'all') params.set('filter', newFilter);
    if (newPage > 1) params.set('page', String(newPage));
    if (newGenreId !== null) params.set('genre', String(newGenreId));
    if (newSearchQuery) params.set('query', newSearchQuery);

    const queryString = params.toString();
    const newUrl = queryString ? `/?${queryString}` : '/';

    if (isDetailPage) {
      router.push(newUrl); // Detay sayfasından ana sayfaya yönlendir
    } else {
      router.replace(newUrl, { scroll: false }); // Ana sayfada URL'yi güncelle
    }
  }, [isDetailPage, router]);


  // Arama sorgusu için debounced fonksiyon
  const debouncedSetSearchQuery = useCallback(
    debounce((query: string) => {
      // Doğrudan URL'yi güncelle, state'i değil.
      handleApplyFilters('all', 1, null, query);
    }, 500),
    [handleApplyFilters] // Bağımlılık olarak handleApplyFilters eklendi
  );

  // Genre seçimi için handler fonksiyonu
  const handleSelectGenre = useCallback((id: number | null) => {
    // Doğrudan URL'yi güncelle, state'i değil.
    handleApplyFilters('all', 1, id, '');
  }, [handleApplyFilters]);

  // Filtre seçimi için handler fonksiyonu
  const handleSelectFilter = useCallback((selectedFilter: string) => {
    // Doğrudan URL'yi güncelle, state'i değil.
    handleApplyFilters(selectedFilter, 1, null, '');
  }, [handleApplyFilters]);

  // Sayfa değişimi için handler fonksiyonu
  const handlePageChange = useCallback((newPage: number) => {
    // Doğrudan URL'yi güncelle, state'i değil.
    handleApplyFilters(filter, newPage, genreId, searchQuery);
  }, [filter, genreId, searchQuery, handleApplyFilters]); // Bağımlılıklar güncellendi

  return (
    <>
      <Navbar
        selected={filter}
        onSelect={handleSelectFilter}
        onSearch={debouncedSetSearchQuery}
      />
      <main className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
        <GenreList
          selectedGenreId={genreId}
          onSelectGenre={handleSelectGenre}
        />
        <div className="flex-1">
          {!isDetailPage && (
            <MovieList
              filter={filter}
              page={page}
              onPageChange={handlePageChange}
              genreId={genreId}
              searchQuery={searchQuery}
            />
          )}
          {children}
        </div>
      </main>
    </>
  );
}