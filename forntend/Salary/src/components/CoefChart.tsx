export interface CoefChartProps {
  featureCoefs: Record<string, number>;
  maxBars?: number;
}

export default function CoefChart({ featureCoefs, maxBars = 10 }: CoefChartProps) {
  const entries = Object.entries(featureCoefs).sort((a, b) => a[1] - b[1]).slice(0, maxBars);
  if (entries.length === 0) {
    return (
      <p className="text-sm text-gray-400 text-center py-6">
        目前無特徵權重資料
      </p>
    );
  }
  const absMax = Math.max(...entries.map(([, v]) => Math.abs(v)), 0.000001);

  return (
    <div className="space-y-3">
      {entries.map(([feature, val]) => {
        const width = (Math.abs(val) / absMax) * 100;
        const positive = val >= 0;
        const display = feature.replace('City_', '');
        return (
          <div key={feature}>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-gray-600 capitalize">{display}</span>
              <span className={`font-bold tabular-nums ${positive ? 'text-blue-600' : 'text-rose-600'}`}>
                {val.toFixed(4)}
              </span>
            </div>
            <div className="relative h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${positive ? 'bg-blue-500' : 'bg-rose-500'}`}
                style={{ width: `${width}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
