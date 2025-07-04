// app/page.tsx
// Bu dosya bir Sunucu Bileşenidir (varsayılan olarak).
// Client-side state yönetimi veya DOM etkileşimleri burada yapılmaz.

import MainLayoutWrapper from "../components/MainLayoutWrapper"; // MainLayoutWrapper'ı import ediyoruz

/**
 * Ana sayfa bileşeni.
 * Tüm filtreleme, arama ve sayfalama mantığı MainLayoutWrapper içinde yönetilir.
 * Bu sayfanın tek sorumluluğu, ana uygulamanın düzenini ve işlevselliğini sağlayan
 * MainLayoutWrapper bileşenini render etmektir.
 */
export default function HomePage() {
  return (
    // MainLayoutWrapper, Navbar, GenreList ve MovieList'i (ana sayfa için) içerir.
    // isDetailPage prop'u varsayılan olarak 'false' olduğu için burada belirtmeye gerek yoktur.
    // Bu, MovieList'in render edilmesini ve URL senkronizasyonunun çalışmasını sağlar.
    <MainLayoutWrapper />
  );
}