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
    <main className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        📁 Geçmiş Testler
      </h1>

      {loading && <p>Yükleniyor...</p>}

      {!loading && history.length === 0 && (
        <p className="text-gray-500">Henüz test geçmişi bulunmamaktadır.</p>
      )}

      {!loading && history.length > 0 && (
        <table className="w-full table-auto border shadow text-sm bg-white rounded">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="border px-4 py-2">Tarih</th>
              <th className="border px-4 py-2">Test Sayısı</th>
              <th className="border px-4 py-2">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="border px-4 py-2">{item.timestamp}</td>
                <td className="border px-4 py-2">{item.test_count}</td>
                <td className="border px-4 py-2">
                  <button
                    onClick={() => router.push(`/result?file=${item.filename}`)}
                    className="text-blue-600 hover:underline"
                  >
                    Detayları Gör
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
