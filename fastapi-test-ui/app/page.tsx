"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-5xl w-full text-center">
        <Image
          src="/api.png"
          alt="FastAPI Test Tool Logo"
          width={128}
          height={128}
          className="mx-auto mb-6"
          priority
        />

        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
          FastAPI Swagger Test Aracı
        </h1>
        <p className="text-gray-600 mb-12 text-lg">
          Swagger/OpenAPI tabanlı API’lerinizi otomatik test edin, sonuçları
          görüntüleyin ve AI destekli analiz alın.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Kart 1: Dosya Yükle */}
          <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6 text-left hover:shadow-md transition">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              📁 Dosya Yükle
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Swagger (OpenAPI) JSON dosyanızı yükleyin. Sistem tüm
              endpoint’leri test edip sonuçları kaydeder.
            </p>
            <button
              onClick={() => router.push("/upload")}
              className="text-blue-600 font-semibold hover:underline"
            >
              Yüklemeye Git →
            </button>
          </div>

          {/* Kart 2: URL ile Test */}
          <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6 text-left hover:shadow-md transition">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              🔗 URL ile Test
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Bir Swagger URL’si veya JSON dönen bir endpoint girerek otomatik
              test başlatın. Gerekirse Swagger üretilir.
            </p>
            <button
              onClick={() => router.push("/url-import")}
              className="text-green-600 font-semibold hover:underline"
            >
              URL Girişi Yap →
            </button>
          </div>

          {/* Kart 3: Geçmiş Sonuçlar */}
          <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6 text-left hover:shadow-md transition">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              📜 Test Geçmişi
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Daha önce çalıştırılmış test senaryolarının sonuçlarını
              görüntüleyin ve analiz edin.
            </p>
            <button
              onClick={() => router.push("/history")}
              className="text-gray-800 font-semibold hover:underline"
            >
              Test Geçmişine Git →
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
