"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

interface TestEntry {
  filename: string;
  timestamp: string;
  test_count: number;
}

export default function HistoryPage() {
  const [history, setHistory] = useState<TestEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await axios.get("http://localhost:8000/test-history");
        setHistory(res.data.tests);
      } catch (err) {
        console.error("Test geçmişi alınamadı", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <main className="min-h-screen bg-white max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        📁 Geçmiş Testler
      </h1>

      {loading && <div className="text-gray-600">Yükleniyor...</div>}

      {!loading && history.length === 0 && (
        <p className="text-gray-500">Henüz test geçmişi bulunmamaktadır.</p>
      )}

      {!loading && history.length > 0 && (
        <div className="overflow-x-auto rounded-lg shadow border border-gray-200 bg-white">
          <table className="min-w-full text-sm text-gray-800">
            <thead className="bg-gray-100 text-gray-700 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-3 text-left">📅 Tarih</th>
                <th className="px-6 py-3 text-left">🧪 Test Adı</th>
                <th className="px-6 py-3 text-left">📊 Test Sayısı</th>
                <th className="px-6 py-3 text-left">🔍 İşlem</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-gray-50 transition-colors border-t border-gray-200"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.timestamp}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.filename}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.test_count}
                  </td>

                  <td className="px-6 py-4">
                    <button
                      onClick={() =>
                        router.push(`/result?file=${item.filename}`)
                      }
                      className="text-blue-600 hover:underline font-medium"
                    >
                      Detayları Gör
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
