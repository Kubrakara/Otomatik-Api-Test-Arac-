"use client";

interface Props {
  jsonObject: {
    success_count: number;
    failure_count: number;
    failures: { url: string; reason: string }[];
    performance_summary: string;
    recommendations: string;
  };
}

export default function AiAnalysisParsed({ jsonObject }: Props) {
  const parsed = jsonObject;

  return (
    <div className="space-y-6 mt-6 bg-white p-6 rounded border shadow">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        🔍 Yapay Zeka Analizi
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-green-100 p-4 rounded">
          <h3 className="font-semibold">✅ Başarılı Test Sayısı</h3>
          <p className="text-xl">{parsed.success_count}</p>
        </div>

        <div className="bg-red-100 p-4 rounded">
          <h3 className="font-semibold">❌ Başarısız Test Sayısı</h3>
          <p className="text-xl">{parsed.failure_count}</p>
        </div>
      </div>

      {parsed.failures?.length > 0 && (
        <div className="bg-yellow-100 p-4 rounded">
          <h3 className="font-semibold mb-2">🚫 Başarısız Endpoint'ler</h3>
          <ul className="list-disc ml-6 space-y-1 text-sm">
            {parsed.failures.map((fail, idx) => (
              <li key={idx}>
                <strong>{fail.url}</strong> → {fail.reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-blue-50 p-4 rounded">
        <h3 className="font-semibold">📊 Performans Özeti</h3>
        <p>{parsed.performance_summary}</p>
      </div>

      <div className="bg-gray-100 p-4 rounded">
        <h3 className="font-semibold">💡 Öneriler</h3>
        <p>{parsed.recommendations}</p>
      </div>
    </div>
  );
}
