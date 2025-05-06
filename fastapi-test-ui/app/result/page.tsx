"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import AiAnalysis from "../components/AiAnalysis";
import TestSummary from "../components/TestSummary";

interface TestResult {
  url: string;
  method: string;
  status_code: number;
  success: boolean;
  response_time: number;
}

export default function ResultPage() {
  const params = useSearchParams();
  const filename = useMemo(() => params.get("file") || "", [params]);

  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResult = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `http://localhost:8000/test-result/${filename}`
        );
        setResults(res.data.results || []);
      } catch (err) {
        console.error("Sonuç alınamadı", err);
        setError("Sonuçlar alınamadı. Lütfen daha sonra tekrar deneyin.");
      } finally {
        setLoading(false);
      }
    };

    if (filename) fetchResult();
  }, [filename]);

  return (
    <main className="min-h-screen bg-white text-gray-800 px-6 py-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 flex items-center gap-2">
          📊 Test Sonuçları
        </h1>

        {loading && (
          <p className="text-blue-600 text-sm mb-4">Veriler yükleniyor...</p>
        )}

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        {!loading && results.length > 0 && (
          <>
            <TestSummary results={results} />

            <div className="overflow-x-auto border border-gray-200 rounded-md shadow mb-8">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="px-4 py-3 border-r">🌐 URL</th>
                    <th className="px-4 py-3 border-r">🧭 Yöntem</th>
                    <th className="px-4 py-3 border-r">📋 Status</th>
                    <th className="px-4 py-3 border-r">⏱ Süre (s)</th>
                    <th className="px-4 py-3">⚙️ Başarı</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, idx) => (
                    <tr
                      key={idx}
                      className="even:bg-gray-50 hover:bg-blue-50 transition-colors"
                    >
                      <td className="px-4 py-2 border-t border-gray-200 break-all">
                        {r.url}
                      </td>
                      <td className="px-4 py-2 border-t border-gray-200">
                        {r.method}
                      </td>
                      <td className="px-4 py-2 border-t border-gray-200">
                        {r.status_code}
                      </td>
                      <td className="px-4 py-2 border-t border-gray-200">
                        {r.response_time}
                      </td>
                      <td className="px-4 py-2 border-t border-gray-200">
                        {r.success ? (
                          <span className="text-green-600 font-medium">
                            ✅ Başarılı
                          </span>
                        ) : (
                          <span className="text-red-600 font-medium">
                            ❌ Hatalı
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <AiAnalysis filename={filename} />
          </>
        )}
      </div>
    </main>
  );
}
