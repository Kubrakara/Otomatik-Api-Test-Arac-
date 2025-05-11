"use client";

import { useState } from "react";
import axios from "axios";
import AiAnalysisParsed from "./AiAnalysisParsed";

interface Props {
  filename: string;
}

interface AIAnalysis {
  success_count: number;
  failure_count: number;
  failures: { url: string; reason: string }[];
  performance_summary: string[]; // Güncellendi: string yerine string[]
  recommendations: string[]; // Güncellendi: string yerine string[]
}

export default function AiAnalysis({ filename }: Props) {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await axios.post("http://localhost:8000/ai-analyze", {
        filename,
      });

      const result = res.data?.analysis;

      const parsed: AIAnalysis =
        typeof result === "string" ? JSON.parse(result) : result;

      // Tip kontrolü (opsiyonel ama güvenli)
      if (
        Array.isArray(parsed.performance_summary) &&
        Array.isArray(parsed.recommendations)
      ) {
        setAnalysis(parsed);
      } else {
        throw new Error("Yanıt formatı beklenen yapıda değil.");
      }
    } catch (err: any) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.detail || "Sunucu hatası."
        : "Yorum alınamadı. Lütfen daha sonra tekrar deneyin.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">🧠 Yapay Zeka Analizi</h2>

      {!analysis && (
        <button
          onClick={analyze}
          className="bg-indigo-600 text-white px-5 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Yorumlanıyor..." : "Gemini AI ile Yorumla"}
        </button>
      )}

      {error && <p className="text-red-600 mt-4">{error}</p>}

      {!loading && !analysis && !error && (
        <p className="text-gray-500 mt-3">
          Henüz bir analiz yapılmadı. Butona tıklayarak başlatabilirsiniz.
        </p>
      )}

      {analysis && (
        <div className="mt-6">
          <AiAnalysisParsed jsonObject={analysis} />
        </div>
      )}
    </div>
  );
}
