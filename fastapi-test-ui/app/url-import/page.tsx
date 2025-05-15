"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function UrlImportPage() {
  const [apiUrl, setApiUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const router = useRouter();

  const handleStartTest = async () => {
    setError("");
    setNote("");

    if (!apiUrl.trim()) {
      setError("Lütfen geçerli bir API URL'i girin.");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post("http://localhost:8000/run-tests-from-url", {
        url: apiUrl,
      });

      if (res.data?.note) {
        setNote(res.data.note); // Otomatik Swagger üretildi bilgisi
      }

      const filename = res.data.saved_as;
      setTimeout(() => {
        router.push(`/result?file=${filename}`);
      }, 1500); // kullanıcı notu görebilsin diye hafif gecikme
    } catch (err) {
      console.error(err);
      setError(
        "API test işlemi başarısız oldu. Swagger olmayabilir veya JSON dönmüyor olabilir."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-xl w-full bg-white p-8 rounded shadow-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          🔗 Tek URL ile API Testi
        </h1>

        <label
          htmlFor="api-url"
          className="block text-gray-700 font-medium mb-2"
        >
          API veya Swagger JSON URL
        </label>

        <input
          id="api-url"
          type="url"
          value={apiUrl}
          onChange={(e) => setApiUrl(e.target.value)}
          placeholder="https://api.example.com/endpoint veya /swagger.json"
          className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-neutral-800 mb-2"
        />

        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

        {note && (
          <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 px-4 py-2 rounded text-sm mb-4">
            ⚠️ {note}
          </div>
        )}

        <button
          onClick={handleStartTest}
          disabled={loading}
          className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded hover:bg-blue-700 transition disabled:opacity-50"
          aria-label="API testini başlat"
        >
          {loading ? "⏳ Test Ediliyor..." : "🚀 Testi Başlat"}
        </button>
      </div>
    </main>
  );
}
