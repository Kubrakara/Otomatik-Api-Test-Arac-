interface TestResult {
  success: boolean;
}

export default function TestSummary({ results }: { results: TestResult[] }) {
  const total = results.length;
  const successCount = results.filter((r) => r.success).length;
  const failCount = total - successCount;
  const successRate = total > 0 ? Math.round((successCount / total) * 100) : 0;

  return (
    <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
      <StatCard
        title="🧪 Toplam Test"
        value={total.toString()}
        bg="bg-neutral-100 dark:bg-neutral-800"
        text="text-gray-900 dark:text-white"
        border="border-gray-300 dark:border-neutral-700"
      />
      <StatCard
        title="✅ Başarılı"
        value={successCount.toString()}
        bg="bg-green-100 dark:bg-green-900"
        text="text-green-800 dark:text-green-200"
        border="border-green-300 dark:border-green-600"
      />
      <StatCard
        title="❌ Başarısız"
        value={failCount.toString()}
        bg="bg-red-100 dark:bg-red-900"
        text="text-red-800 dark:text-red-200"
        border="border-red-300 dark:border-red-600"
      />

      <div className="sm:col-span-3 text-center mt-4">
        <div className="inline-flex items-center justify-center gap-2 bg-blue-50 dark:bg-blue-900 px-4 py-2 rounded border border-blue-200 dark:border-blue-700">
          <span className="text-base font-medium text-blue-800 dark:text-blue-200">
            🎯 Başarı Oranı:
          </span>
          <span className="text-xl font-bold text-blue-600 dark:text-blue-300">
            {successRate}%
          </span>
        </div>
      </div>
    </section>
  );
}

function StatCard({
  title,
  value,
  bg = "bg-white dark:bg-neutral-800",
  text = "text-gray-800 dark:text-gray-100",
  border = "border-gray-200 dark:border-gray-600",
}: {
  title: string;
  value: string;
  bg?: string;
  text?: string;
  border?: string;
}) {
  return (
    <div
      className={`${bg} ${text} ${border} p-5 rounded-lg border shadow-sm flex flex-col items-center justify-center transition-all`}
    >
      <span className="text-sm font-semibold tracking-wide mb-1 uppercase">
        {title}
      </span>
      <span className="text-3xl font-extrabold tracking-tight">{value}</span>
    </div>
  );
}
