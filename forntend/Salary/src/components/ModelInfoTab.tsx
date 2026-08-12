import { useState, useCallback } from 'react';
import { type TrainResult } from '../api';
import CoefChart from './CoefChart';
import { loadLastTrainResult } from '../storage';

const MODEL_TYPE_LABELS: Record<string, string> = {
  LinearRegression: '多元線性迴歸 (OLS)',
  Lasso: 'Lasso 迴歸',
  Ridge: 'Ridge 嶺迴歸',
};

export default function ModelInfoTab() {
  const [result, setResult] = useState<TrainResult | null>(() => loadLastTrainResult());

  const handleRefresh = useCallback(() => {
    setResult(loadLastTrainResult());
  }, []);

  const featureCount = result ? Object.keys(result.feature_coefs).length : 0;

  return (
    <div className="animate-fade-in">
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-5 sm:p-7 shadow-lg shadow-blue-100/30 border border-white/60">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-sky-100 flex items-center justify-center text-sm">ℹ️</span>
            <h2 className="text-base sm:text-lg font-bold text-gray-800">目前模型資訊</h2>
          </div>
          <button
            onClick={handleRefresh}
            className="px-3 py-1.5 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-full border border-sky-200/60 transition-colors"
          >
            🔄 重新整理
          </button>
        </div>

        {!result && (
          <div className="text-center text-gray-400 py-16 text-sm">
            尚無模型資訊，請先到「線上訓練」分頁訓練一次模型。
          </div>
        )}

        {result && (
          <div className="space-y-6 animate-slide-up">
            {/* 資訊 chips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-2xl p-4 text-center border border-blue-100/60">
                <p className="text-[11px] text-blue-600/70 font-bold uppercase tracking-wider mb-1">模型類型</p>
                <p className="text-sm font-extrabold text-slate-800 leading-tight">
                  {MODEL_TYPE_LABELS[result.model_type] ?? result.model_type}
                </p>
              </div>
              <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-4 text-center border border-violet-100/60">
                <p className="text-[11px] text-violet-600/70 font-bold uppercase tracking-wider mb-1">測試集 R²</p>
                <p className="text-xl font-extrabold text-violet-700 tabular-nums">{result.r2.toFixed(4)}</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-4 text-center border border-emerald-100/60">
                <p className="text-[11px] text-emerald-600/70 font-bold uppercase tracking-wider mb-1">特徵個數</p>
                <p className="text-xl font-extrabold text-emerald-700 tabular-nums">{featureCount}</p>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 text-center border border-amber-100/60">
                <p className="text-[11px] text-amber-600/70 font-bold uppercase tracking-wider mb-1">α</p>
                <p className="text-xl font-extrabold text-amber-700 tabular-nums">{result.alpha.toFixed(1)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 特徵權重 */}
              <div className="bg-gray-50/60 rounded-2xl p-4 sm:p-5 border border-gray-100">
                <h3 className="text-sm font-bold text-gray-700 mb-3">📊 特徵權重係數</h3>
                <CoefChart featureCoefs={result.feature_coefs} />
              </div>

              {/* 訓練摘要 */}
              <div className="space-y-3">
                <div className="bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-600 border border-gray-100">
                  截距（Intercept）<br />
                  <b className="text-gray-800 tabular-nums">{result.intercept.toFixed(4)}</b>
                </div>
                <div className="bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-600 border border-gray-100">
                  訓練耗時<br />
                  <b className="text-gray-800 tabular-nums">{result.train_time.toFixed(3)} 秒</b>
                </div>
                <div className="bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-600 border border-gray-100">
                  α（正則化強度）<br />
                  <b className="text-gray-800 tabular-nums">{result.alpha.toFixed(1)}</b>
                </div>
                <div className="bg-emerald-50 text-emerald-700 text-sm px-4 py-3 rounded-xl border border-emerald-200">
                  {result.message}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
