import { useState, useCallback } from 'react';
import { train, type TrainResult } from '../api';

const IMPORTANCE_COLORS = ['#0d9488', '#8b5cf6', '#f59e0b', '#ef4444'];

export default function TrainingTab() {
  const [nEstimators, setNEstimators] = useState(100);
  const [maxDepth, setMaxDepth] = useState(0);
  const [testSize, setTestSize] = useState(0.2);
  const [randomState, setRandomState] = useState(42);
  const [result, setResult] = useState<TrainResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('已載入預訓練模型 (就緒)');

  const handleTrain = useCallback(async () => {
    setLoading(true);
    setError('');
    setStatus('訓練中...');
    try {
      const res = await train({
        n_estimators: nEstimators,
        max_depth: maxDepth === 0 ? null : maxDepth,
        test_size: testSize,
        random_state: randomState,
      });
      setResult(res);
      setStatus(res.status === 'success' ? '✅ 線上重新訓練並載入成功！' : `狀態: ${res.status}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '訓練失敗');
      setStatus('訓練失敗');
    } finally {
      setLoading(false);
    }
  }, [nEstimators, maxDepth, testSize, randomState]);

  const sortedImportance = result
    ? Object.entries(result.feature_importances).sort((a, b) => b[1] - a[1])
    : [];
  const maxImp = sortedImportance.length > 0 ? sortedImportance[0][1] : 1;

  return (
    <div className="animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* 左側：超參數控制 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-5 sm:p-7 shadow-lg shadow-teal-100/30 border border-white/60">
          <div className="flex items-center gap-2 mb-5">
            <span className="w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center text-sm">⚙️</span>
            <h2 className="text-base sm:text-lg font-bold text-gray-800">調整超參數</h2>
          </div>

          <div className="space-y-5">
            {/* n_estimators */}
            <div>
              <div className="flex justify-between items-baseline mb-2">
                <div>
                  <span className="text-sm font-semibold text-gray-700">決策樹數量</span>
                  <span className="text-xs text-gray-400 ml-1.5">n_estimators</span>
                </div>
                <span className="text-sm font-bold text-violet-600 tabular-nums">{nEstimators}</span>
              </div>
              <input
                type="range" min={10} max={500} step={10}
                value={nEstimators}
                onChange={e => setNEstimators(parseInt(e.target.value))}
                className="w-full cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-300 mt-0.5 px-0.5">
                <span>10</span><span>500</span>
              </div>
            </div>

            {/* max_depth */}
            <div>
              <div className="flex justify-between items-baseline mb-2">
                <div>
                  <span className="text-sm font-semibold text-gray-700">最大深度</span>
                  <span className="text-xs text-gray-400 ml-1.5">max_depth (0=無限制)</span>
                </div>
                <span className="text-sm font-bold text-violet-600 tabular-nums">
                  {maxDepth === 0 ? '無限制' : maxDepth}
                </span>
              </div>
              <input
                type="range" min={0} max={20} step={1}
                value={maxDepth}
                onChange={e => setMaxDepth(parseInt(e.target.value))}
                className="w-full cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-300 mt-0.5 px-0.5">
                <span>0 (無限制)</span><span>20</span>
              </div>
            </div>

            {/* test_size */}
            <div>
              <div className="flex justify-between items-baseline mb-2">
                <div>
                  <span className="text-sm font-semibold text-gray-700">測試集比例</span>
                  <span className="text-xs text-gray-400 ml-1.5">test_size</span>
                </div>
                <span className="text-sm font-bold text-violet-600 tabular-nums">{(testSize * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range" min={0.1} max={0.5} step={0.05}
                value={testSize}
                onChange={e => setTestSize(parseFloat(e.target.value))}
                className="w-full cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-300 mt-0.5 px-0.5">
                <span>10%</span><span>50%</span>
              </div>
            </div>

            {/* random_state */}
            <div>
              <div className="flex justify-between items-baseline mb-2">
                <div>
                  <span className="text-sm font-semibold text-gray-700">隨機種子</span>
                  <span className="text-xs text-gray-400 ml-1.5">random_state</span>
                </div>
                <span className="text-sm font-bold text-violet-600 tabular-nums">{randomState}</span>
              </div>
              <input
                type="number"
                min={0}
                value={randomState}
                onChange={e => setRandomState(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-300 transition-all"
              />
            </div>
          </div>

          <button
            onClick={handleTrain}
            disabled={loading}
            className="mt-6 w-full py-3 px-6 rounded-2xl font-bold text-white text-sm
              bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700
              disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed
              shadow-lg shadow-violet-200/50 hover:shadow-xl hover:shadow-violet-300/50
              active:scale-[0.98] transition-all duration-200"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                訓練中...
              </span>
            ) : '🚀 開始訓練模型'}
          </button>
        </div>

        {/* 右側：訓練結果 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-5 sm:p-7 shadow-lg shadow-teal-100/30 border border-white/60">
          <div className="flex items-center gap-2 mb-5">
            <span className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-sm">📈</span>
            <h2 className="text-base sm:text-lg font-bold text-gray-800">訓練結果</h2>
          </div>

          {/* 狀態 */}
          <div className="bg-gray-50 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-600 mb-4 border border-gray-100">
            📢 {status}
          </div>

          {error && (
            <div className="bg-rose-50 text-rose-600 text-sm px-4 py-3 rounded-xl border border-rose-200 mb-4">
              {error}
            </div>
          )}

          {result && (
            <div className="space-y-5 animate-slide-up">
              {/* 指標卡片 */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl p-3 sm:p-4 text-center border border-teal-100/60">
                  <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-teal-600/70 mb-1">
                    準確度
                  </p>
                  <p className="text-xl sm:text-2xl font-extrabold text-teal-700">
                    {(result.accuracy * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-3 sm:p-4 text-center border border-blue-100/60">
                  <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-blue-600/70 mb-1">
                    訓練耗時
                  </p>
                  <p className="text-xl sm:text-2xl font-extrabold text-blue-700">
                    {result.train_time.toFixed(2)}s
                  </p>
                </div>
                <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-3 sm:p-4 text-center border border-violet-100/60">
                  <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-violet-600/70 mb-1">
                    決策樹數
                  </p>
                  <p className="text-xl sm:text-2xl font-extrabold text-violet-700">
                    {nEstimators}
                  </p>
                </div>
              </div>

              {/* 特徵重要性 */}
              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-3">💡 特徵重要性分析</h3>
                <div className="space-y-3">
                  {sortedImportance.map(([feature, val], idx) => {
                    const pct = (val / maxImp) * 100;
                    return (
                      <div key={feature}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-gray-600 capitalize">{feature}</span>
                          <span className="font-bold text-gray-800 tabular-nums">{(val * 100).toFixed(1)}%</span>
                        </div>
                        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700 ease-out"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: IMPORTANCE_COLORS[idx % IMPORTANCE_COLORS.length],
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 訊息 */}
              <div className="bg-emerald-50 text-emerald-700 text-sm px-4 py-3 rounded-xl border border-emerald-200">
                {result.message}
              </div>
            </div>
          )}

          {!result && !error && (
            <div className="text-center text-gray-400 py-12 text-sm">
              調整超參數後點擊「開始訓練模型」查看結果
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
