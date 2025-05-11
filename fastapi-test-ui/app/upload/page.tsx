"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [baseUrl, setBaseUrl] = useState("");
  const [manualBase, setManualBase] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);

    if (!selected) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const base =
          json?.servers?.[0]?.url ||
          (json?.host &&
            `${json.schemes?.[0] || "https"}://${json.host}${
              json.basePath || ""
            }`);
        if (base) {
          setBaseUrl(base);
          setManualBase(false);
        } else {
          setManualBase(true);
        }
      } catch (error) {
        console.error("Swagger parse hatası:", error);
        setManualBase(true);
      }
    };
    reader.readAsText(selected);
  };

  const handleUpload = async () => {
    if (!file) return alert("Lütfen bir Swagger JSON dosyası seçin.");
    if (!baseUrl.trim()) return alert("Base URL gerekli.");

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      // Swagger dosyasını yükle
      const uploadRes = await axios.post(
        "http://localhost:8000/upload-swagger",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const filename = uploadRes.data.filename;

      // Testleri başlat
      const testRes = await axios.post("http://localhost:8000/run-tests", {
        base_url: baseUrl.trim(),
        filename,
      });

      const resultFile = testRes.data.saved_as;
      router.push(`/result?file=${resultFile}`);
    } catch (err) {
      console.error(err);
      alert("Yükleme veya test işlemi başarısız oldu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-xl w-full bg-white p-8 rounded shadow-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          🌐 Swagger API Test Aracı
        </h1>

        <div className="mb-4">
          <label className="block text-md font-medium text-gray-700 mb-1">
            Swagger JSON Dosyası
          </label>
          <input
            type="file"
            accept=".json"
            className="text-neutral-400 border  px-3 py-2 rounded w-full"
            onChange={handleFileChange}
          />
        </div>

        {baseUrl && !manualBase && (
          <p className="text-sm text-green-700 mb-2">
            ✅ Swagger içinden çıkarılan Base URL: <code>{baseUrl}</code>
          </p>
        )}

        {manualBase && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              API Base URL (Swagger'da tanımlı değil)
            </label>
            <input
              type="text"
              placeholder="https://api.example.com"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              className="w-full text-gray-700 border px-3 py-2 rounded"
            />
            <p className="text-sm text-yellow-700 mt-1">
              ⚠️ Swagger dosyasında base URL bilgisi yok. Lütfen manuel girin.
            </p>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-60"
        >
          {loading ? "Test çalıştırılıyor..." : "🚀 Testi Başlat"}
        </button>
      </div>
    </main>
  );
}
