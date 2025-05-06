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
    <div className="space-y-6 mt-6 bg-white dark:bg-neutral-800 p-6 rounded-lg border dark:border-neutral-700 shadow">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
        🔍 Yapay Zeka Analizi
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-green-50 dark:bg-green-700/30 p-4 rounded shadow-sm">
          <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-1">
            ✅ Başarılı Test Sayısı
          </h3>
          <p className="text-2xl font-bold text-green-900 dark:text-green-200">
            {parsed.success_count}
          </p>
        </div>

        <div className="bg-red-50 dark:bg-red-700/30 p-4 rounded shadow-sm">
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-1">
            ❌ Başarısız Test Sayısı
          </h3>
          <p className="text-2xl font-bold text-red-900 dark:text-red-200">
            {parsed.failure_count}
          </p>
        </div>
      </div>

      {parsed.failures?.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-700/30 p-4 rounded shadow-sm">
          <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
            🚫 Başarısız Endpoint'ler
          </h3>
          <ul className="list-disc ml-6 space-y-2 text-sm text-yellow-900 dark:text-yellow-100">
            {parsed.failures.map((fail, idx) => (
              <li key={idx}>
                <strong className="block">{fail.url}</strong>
                <span className="ml-2 block">{fail.reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-blue-50 dark:bg-blue-700/30 p-4 rounded shadow-sm">
        <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-1">
          📊 Performans Özeti
        </h3>
        <p className="text-sm text-blue-900 dark:text-blue-100 leading-relaxed">
          {parsed.performance_summary}
        </p>
      </div>

      <div className="bg-gray-100 dark:bg-gray-700/30 p-4 rounded shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
          💡 Öneriler
        </h3>
        <p className="text-sm text-gray-800 dark:text-gray-300 leading-relaxed">
          {parsed.recommendations}
        </p>
      </div>
    </div>
  );
}
