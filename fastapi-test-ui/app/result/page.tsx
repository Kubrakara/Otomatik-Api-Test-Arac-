"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import AiAnalysis from "../components/AiAnalysis";

interface TestResult {
  url: string;
  method: string;
  status_code: number;
  success: boolean;
  response_time: number;
}

export default function ResultPage() {
  const params = useSearchParams();
  const filename = params.get("file") || "";
  const [results, setResults] = useState<TestResult[]>([]);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8000/test-result/${filename}`
        );
        setResults(res.data.results);
      } catch (err) {
        console.error("Sonuç alınamadı");
      }
    };

    if (filename) fetchResult();
  }, [filename]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        📊 Test Sonuçları
      </h1>

      <table className="w-full table-auto border mb-6 shadow text-sm">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="border px-4 py-2">URL</th>
            <th className="border px-4 py-2">Yöntem</th>
            <th className="border px-4 py-2">Status</th>
            <th className="border px-4 py-2">Süre (s)</th>
            <th className="border px-4 py-2">Başarı</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r, idx) => (
            <tr key={idx} className="hover:bg-gray-50">
              <td className="border px-4 py-2">{r.url}</td>
              <td className="border px-4 py-2">{r.method}</td>
              <td className="border px-4 py-2">{r.status_code}</td>
              <td className="border px-4 py-2">{r.response_time}</td>
              <td className="border px-4 py-2">
                {r.success ? "✅ Başarılı" : "❌ Hatalı"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <AiAnalysis filename={filename} />
    </div>
  );
}
