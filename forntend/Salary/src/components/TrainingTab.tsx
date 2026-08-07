import { useState, useCallback } from 'react';
import { trainModel, MODEL_TYPES, type TrainResult } from '../api';
import CoefChart from './CoefChart';
import { saveLastTrainResult } from '../storage';

const MODEL_TYPE_LABELS: Record<string, string> = {
  LinearRegression: '多元線性迴歸 (OLS)',
  Lasso: 'Lasso 迴歸',
  Ridge: 'Ridge 嶺迴歸',
};

export default function TrainingTab() {
  const [testSize, setTestSize] = useState(0.2);
  const [randomState, setRandomState] = useState(76);
  const [modelType, setModelType] = useState<string>('LinearRegression');
  const [alpha, setAlpha] = useState(1.0);
  const [result, setResult] = useState<TrainResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('尚未訓練');

  const handleTrain = useCallback(async () => {
    setLoading(true);
    setError('');
    setStatus('訓練中...');
    try {
      const res = await trainModel({
        test_size: testSize,
        random_state: randomState,
        model_type: modelType,
        alpha,
      });
      setResult(res);
      saveLastTrainResult(res);
      setStatus(res.status === 'success' ? '✅ 線上重新訓練並載入成功！' : `狀態: ${res.status}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '訓練失敗');
      setStatus('訓練失敗');
    } finally {
      setLoading(false);
    }
  }, [testSize, randomState, modelType, alpha]);

  return (
    <div className="animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* 左側：超參數控制 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-5 sm:p-7 shadow-lg shadow-blue-100/30 border border-white/60">
          <div className="flex items-center gap-2 mb-5">
            <span className="w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center text-sm">⚙️</span>
            <h2 className="text-base sm:text-lg font-bold text-gray-800">調整超參數</h2>
          </div>

          <div className="space-y-5">
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

            {/* model_type */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">
                模型演算法 <span className="text-xs text-gray-400 ml-1.5">model_type</span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {MODEL_TYPES.map(mt => (
                  <button
                    key={mt}
                    onClick={() => setModelType(mt)}
                    className={`px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border-2 transition-all duration-200
                      ${modelType === mt
                        ? 'bg-violet-500 text-white border-violet-500 shadow-md shadow-violet-200/40'
                        : 'bg-white/70 text-gray-500 border-gray-200 hover:border-violet-300 hover:text-violet-600'
                      }`}
                  >
                    {mt}
                  </button>
                ))}
              </div>
            </div>

            {/* alpha */}
            <div>
              <div className="flex justify-between items-baseline mb-2">
                <div>
                  <span className="text-sm font-semibold text-gray-700">正則化強度 α</span>
                  <span className="text-xs text-gray-400 ml-1.5">alpha (Lasso / Ridge)</span>
                </div>
                <span className="text-sm font-bold text-violet-600 tabular-nums">{alpha.toFixed(1)}</span>
              </div>
              <input
                type="range" min={0.001} max={100} step={0.1}
                value={alpha}
                onChange={e => setAlpha(parseFloat(e.target.value))}
                className="w-full cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-300 mt-0.5 px-0.5">
                <span>0.001</span><span>100</span>
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                {modelType === 'LinearRegression' ? 'LinearRegression 不影響 α' : `適用於 ${modelType}`}
              </p>
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
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-5 sm:p-7 shadow-lg shadow-blue-100/30 border border-white/60">
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
                <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-2xl p-3 sm:p-4 text-center border border-blue-100/60">
                  <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-blue-600/70 mb-1">
                    R² Score
                  </p>
                  <p className="text-xl sm:text-2xl font-extrabold text-blue-700 tabular-nums">
                    {result.r2.toFixed(4)}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-3 sm:p-4 text-center border border-violet-100/60">
                  <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-violet-600/70 mb-1">
                    模型類型
                  </p>
                  <p className="text-xs sm:text-sm font-extrabold text-violet-700 leading-tight mt-1">
                    {MODEL_TYPE_LABELS[result.model_type] ?? result.model_type}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-3 sm:p-4 text-center border border-emerald-100/60">
                  <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-600/70 mb-1">
                    訓練耗時
                  </p>
                  <p className="text-xl sm:text-2xl font-extrabold text-emerald-700 tabular-nums">
                    {result.train_time.toFixed(3)}s
                  </p>
                </div>
              </div>

              {/* 細節 */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-100 text-gray-600">
                  α = <b className="text-gray-800 tabular-nums">{result.alpha.toFixed(1)}</b>
                </div>
                <div className="bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-100 text-gray-600">
                  截距 = <b className="text-gray-800 tabular-nums">{result.intercept.toFixed(4)}</b>
                </div>
              </div>

              {/* 特徵權重 */}
              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-3">📊 特徵權重係數</h3>
                <CoefChart featureCoefs={result.feature_coefs} />
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
