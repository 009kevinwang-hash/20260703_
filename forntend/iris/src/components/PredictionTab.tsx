import { useState, useCallback, useEffect, useRef } from 'react';
import { predict, type IrisOutput } from '../api';

const SLIDERS = [
  { key: 'sepal_length' as const, label: '花萼長度', sub: 'Sepal Length', unit: 'cm', min: 0.1, max: 10, default: 5.1 },
  { key: 'sepal_width' as const, label: '花萼寬度', sub: 'Sepal Width', unit: 'cm', min: 0.1, max: 10, default: 3.5 },
  { key: 'petal_length' as const, label: '花瓣長度', sub: 'Petal Length', unit: 'cm', min: 0.1, max: 10, default: 1.4 },
  { key: 'petal_width' as const, label: '花瓣寬度', sub: 'Petal Width', unit: 'cm', min: 0.1, max: 10, default: 0.2 },
];

const LABEL_MAP: Record<string, { emoji: string; cn: string; bg: string; border: string; text: string }> = {
  setosa: { emoji: '🌿', cn: '山鳶尾', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
  versicolor: { emoji: '🍁', cn: '變色鳶尾', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
  virginica: { emoji: '🪻', cn: '維吉尼亞鳶尾', bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700' },
};

const PROB_COLORS: Record<string, string> = {
  setosa: 'bg-emerald-500',
  versicolor: 'bg-amber-500',
  virginica: 'bg-rose-500',
};

export default function PredictionTab() {
  const [values, setValues] = useState(() =>
    Object.fromEntries(SLIDERS.map(s => [s.key, s.default]))
  );
  const [result, setResult] = useState<IrisOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleChange = useCallback((key: string, val: number) => {
    setValues(prev => ({ ...prev, [key]: val }));
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setError('');
      try {
        const output = await predict({
          sepal_length: values.sepal_length,
          sepal_width: values.sepal_width,
          petal_length: values.petal_length,
          petal_width: values.petal_width,
        });
        setResult(output);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : '預測失敗');
      } finally {
        setLoading(false);
      }
    }, 150);
    return () => clearTimeout(debounceRef.current);
  }, [values]);

  const label = result ? LABEL_MAP[result.prediction_label] ?? null : null;

  return (
    <div className="animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* 左側：輸入控制 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-5 sm:p-7 shadow-lg shadow-teal-100/30 border border-white/60">
          <div className="flex items-center gap-2 mb-5">
            <span className="w-8 h-8 rounded-xl bg-teal-100 flex items-center justify-center text-sm">📊</span>
            <h2 className="text-base sm:text-lg font-bold text-gray-800">輸入特徵</h2>
          </div>
          <div className="space-y-5">
            {SLIDERS.map(s => (
              <div key={s.key}>
                <div className="flex justify-between items-baseline mb-2">
                  <div>
                    <span className="text-sm font-semibold text-gray-700">{s.label}</span>
                    <span className="text-xs text-gray-400 ml-1.5">{s.sub}</span>
                  </div>
                  <span className="text-sm font-bold text-teal-600 tabular-nums">
                    {values[s.key].toFixed(1)} {s.unit}
                  </span>
                </div>
                <input
                  type="range"
                  min={s.min}
                  max={s.max}
                  step={0.1}
                  value={values[s.key]}
                  onChange={e => handleChange(s.key, parseFloat(e.target.value))}
                  className="w-full cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-gray-300 mt-0.5 px-0.5">
                  <span>{s.min}</span>
                  <span>{s.max}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 右側：預測結果 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-5 sm:p-7 shadow-lg shadow-teal-100/30 border border-white/60">
          <div className="flex items-center gap-2 mb-5">
            <span className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-sm">🔮</span>
            <h2 className="text-base sm:text-lg font-bold text-gray-800">預測結果</h2>
          </div>

          {error && (
            <div className="bg-rose-50 text-rose-600 text-sm px-4 py-3 rounded-xl border border-rose-200 mb-4">
              {error}
            </div>
          )}

          {!result && !error && (
            <div className="text-center text-gray-400 py-12 text-sm">
              {loading ? '正在分析中...' : '拖動滑桿即可即時預測'}
            </div>
          )}

          {result && label && (
            <div className="space-y-5 animate-slide-up">
              {/* 預測卡片 */}
              <div className={`${label.bg} ${label.border} border-2 rounded-2xl p-5 text-center transition-all duration-300`}>
                <p className="text-xs font-bold uppercase tracking-widest opacity-60 mb-1">
                  預測分析品種
                </p>
                <div className="text-3xl sm:text-4xl font-extrabold mb-2">
                  {label.emoji} {label.cn}
                </div>
                <p className={`text-sm font-semibold ${label.text}`}>
                  {result.prediction_label.charAt(0).toUpperCase() + result.prediction_label.slice(1)}
                </p>
                <div className="mt-3 inline-flex items-center gap-1.5 bg-white/70 rounded-full px-4 py-1.5">
                  <span className="text-xs text-gray-500">預測機率</span>
                  <span className="text-lg font-extrabold text-gray-800">
                    {(result.probabilities[result.prediction_label] * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* 機率長條 */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-gray-700">各品種機率分佈</h3>
                {Object.entries(result.probabilities).map(([cls, prob]) => {
                  const pct = prob * 100;
                  const colorClass = PROB_COLORS[cls] || 'bg-gray-400';
                  const info = LABEL_MAP[cls];
                  return (
                    <div key={cls}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-600">
                          {info?.emoji} {info?.cn ?? cls}
                        </span>
                        <span className="font-bold text-gray-800 tabular-nums">{pct.toFixed(1)}%</span>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${colorClass} rounded-full transition-all duration-700 ease-out`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
