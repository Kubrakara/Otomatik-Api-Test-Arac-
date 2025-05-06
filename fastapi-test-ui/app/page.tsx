"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="max-w-2xl text-center">
        <Image
          src="/logo.svg"
          alt="API Test Tool"
          width={100}
          height={100}
          className="mx-auto mb-4"
        />

        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          FastAPI Swagger Test Aracı 🚀
        </h1>
        <p className="text-gray-600 mb-6">
          Swagger dosyanı yükle veya API linkini ver, testleri çalıştır, yapay
          zekadan yorum al.
        </p>

        <div className="flex flex-col gap-4">
          <button
            onClick={() => router.push("/upload")}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Dosya Yükle
          </button>

          <button
            onClick={() => router.push("/url-import")}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
          >
            Link ile Test Başlat
          </button>

          <button
            onClick={() => router.push("/history")}
            className="bg-gray-700 text-white px-6 py-2 rounded hover:bg-gray-800"
          >
            Geçmiş Testleri Görüntüle
          </button>
        </div>
      </div>
    </main>
  );
}
