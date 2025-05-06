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
  performance_summary: string;
  recommendations: string;
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

      const parsed =
        typeof res.data.analysis === "string"
          ? JSON.parse(res.data.analysis)
          : res.data.analysis;

      setAnalysis(parsed);
    } catch (err) {
      setError("Yorum alınamadı. Lütfen daha sonra tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-3">🧠 Yapay Zeka Analizi</h2>
      <button
        onClick={analyze}
        className="bg-indigo-600 text-white px-5 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Yorumlanıyor..." : "Gemini AI ile Yorumla"}
      </button>

      {error && <p className="text-red-600 mt-3">{error}</p>}

      {analysis && <AiAnalysisParsed jsonObject={analysis} />}
    </div>
  );
}
