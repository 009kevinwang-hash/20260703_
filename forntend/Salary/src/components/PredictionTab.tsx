import { useState, useCallback } from 'react';
import { predictSalary, EDU_LEVELS, CITIES, type SalaryOutput } from '../api';

const EDU_COLORS: Record<string, string> = {
  '高中以下': 'bg-slate-100 text-slate-600 border-slate-200',
  '大學': 'bg-blue-50 text-blue-700 border-blue-200',
  '碩士以上': 'bg-violet-50 text-violet-700 border-violet-200',
};

const CITY_COLORS: Record<string, string> = {
  '城市A': 'bg-sky-50 text-sky-700 border-sky-200',
  '城市B': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  '城市C': 'bg-amber-50 text-amber-700 border-amber-200',
};

export default function PredictionTab() {
  const [years, setYears] = useState(5);
  const [edu, setEdu] = useState<string>('大學');
  const [city, setCity] = useState<string>('城市A');
  const [result, setResult] = useState<SalaryOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePredict = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const output = await predictSalary({
        years_experience: years,
        education_level: edu,
        city,
      });
      setResult(output);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '預測失敗');
    } finally {
      setLoading(false);
    }
  }, [years, edu, city]);

  return (
    <div className="animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* 左側：輸入條件 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-5 sm:p-7 shadow-lg shadow-blue-100/30 border border-white/60">
          <div className="flex items-center gap-2 mb-5">
            <span className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-sm">📝</span>
            <h2 className="text-base sm:text-lg font-bold text-gray-800">輸入條件</h2>
          </div>

          <div className="space-y-6">
            {/* 工作年資 */}
            <div>
              <div className="flex justify-between items-baseline mb-2">
                <div>
                  <span className="text-sm font-semibold text-gray-700">工作年資</span>
                  <span className="text-xs text-gray-400 ml-1.5">Years Experience</span>
                </div>
                <span className="text-sm font-bold text-blue-600 tabular-nums">
                  {years.toFixed(1)} 年
                </span>
              </div>
              <input
                type="range" min={0} max={50} step={0.1}
                value={years}
                onChange={e => setYears(parseFloat(e.target.value))}
                className="w-full cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-300 mt-0.5 px-0.5">
                <span>0</span><span>50</span>
              </div>
            </div>

            {/* 最高學歷 */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">
                最高學歷 <span className="text-xs text-gray-400 ml-1.5">Education Level</span>
              </p>
              <div className="grid grid-cols-3 gap-2">
                {EDU_LEVELS.map(level => (
                  <button
                    key={level}
                    onClick={() => setEdu(level)}
                    className={`px-3 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all duration-200
                      ${edu === level
                        ? 'bg-blue-500 text-white border-blue-500 shadow-md shadow-blue-200/40'
                        : 'bg-white/70 text-gray-500 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                      }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* 工作城市 */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">
                工作城市 <span className="text-xs text-gray-400 ml-1.5">City</span>
              </p>
              <div className="grid grid-cols-3 gap-2">
                {CITIES.map(c => (
                  <button
                    key={c}
                    onClick={() => setCity(c)}
                    className={`px-3 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all duration-200
                      ${city === c
                        ? 'bg-sky-500 text-white border-sky-500 shadow-md shadow-sky-200/40'
                        : 'bg-white/70 text-gray-500 border-gray-200 hover:border-sky-300 hover:text-sky-600'
                      }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handlePredict}
            disabled={loading}
            className="mt-6 w-full py-3 px-6 rounded-2xl font-bold text-white text-sm
              bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600
              disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed
              shadow-lg shadow-blue-200/50 hover:shadow-xl hover:shadow-sky-200/50
              active:scale-[0.98] transition-all duration-200"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                預測中...
              </span>
            ) : '💰 開始預測薪資'}
          </button>
        </div>

        {/* 右側：預測結果 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-5 sm:p-7 shadow-lg shadow-blue-100/30 border border-white/60">
          <div className="flex items-center gap-2 mb-5">
            <span className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-sm">📈</span>
            <h2 className="text-base sm:text-lg font-bold text-gray-800">預測結果</h2>
          </div>

          {error && (
            <div className="bg-rose-50 text-rose-600 text-sm px-4 py-3 rounded-xl border border-rose-200 mb-4">
              {error}
            </div>
          )}

          {!result && !error && (
            <div className="text-center text-gray-400 py-12 text-sm">
              {loading ? '正在計算中...' : '設定條件後點擊「開始預測薪資」查看結果'}
            </div>
          )}

          {result && (
            <div className="space-y-5 animate-slide-up">
              {/* 薪資主卡片 */}
              <div className="bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50 border border-blue-100 rounded-2xl p-6 sm:p-8 text-center shadow-inner">
                <p className="text-xs font-bold uppercase tracking-widest text-blue-500/80 mb-2">
                  Predicted Monthly Salary
                </p>
                <div className="text-4xl sm:text-5xl font-extrabold text-slate-900 leading-tight">
                  NT$ <span className="text-blue-600 tabular-nums">{result.predicted_salary.toLocaleString('zh-TW', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</span> 萬
                </div>
                <p className="mt-3 text-sm text-slate-600">
                  預估年薪（14 個月）：<b className="text-emerald-600 text-base tabular-nums">{result.estimated_annual_salary.toLocaleString('zh-TW', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} 萬</b>
                </p>
              </div>

              {/* 條件摘要 */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
                  <p className="text-[10px] sm:text-xs text-gray-400 font-semibold mb-1">工作年資</p>
                  <p className="text-sm sm:text-base font-bold text-slate-700 tabular-nums">{years.toFixed(1)} 年</p>
                </div>
                <div className={`rounded-xl p-3 text-center border ${EDU_COLORS[edu] ?? 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                  <p className="text-[10px] sm:text-xs opacity-70 font-semibold mb-1">最高學歷</p>
                  <p className="text-sm sm:text-base font-bold">{edu}</p>
                </div>
                <div className={`rounded-xl p-3 text-center border ${CITY_COLORS[city] ?? 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                  <p className="text-[10px] sm:text-xs opacity-70 font-semibold mb-1">工作城市</p>
                  <p className="text-sm sm:text-base font-bold">{city}</p>
                </div>
              </div>

              <div className="bg-blue-50/60 text-blue-600 text-xs sm:text-sm px-4 py-3 rounded-xl border border-blue-100">
                💡 預測結果由後端模型即時運算，年薪以 14 個月估算。
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
