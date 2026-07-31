import { useState } from 'react';
import Header from './components/Header';
import PredictionTab from './components/PredictionTab';
import TrainingTab from './components/TrainingTab';

const TABS = [
  { id: 'predict', label: '即時預測', icon: '🔮' },
  { id: 'train', label: '線上訓練', icon: '⚙️' },
] as const;

function App() {
  const [activeTab, setActiveTab] = useState<string>('predict');

  return (
    <div className="min-h-dvh flex flex-col">
      <Header />

      {/* 主要內容 */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* 標題區 */}
        <div className="text-center mb-6 sm:mb-8 animate-fade-in">
          <h2 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-teal-700 via-emerald-600 to-cyan-600 bg-clip-text text-transparent">
            🌸 Iris 鳶尾花機器學習平台
          </h2>
          <p className="mt-2 text-sm sm:text-base text-gray-500 max-w-2xl mx-auto leading-relaxed">
            結合 <span className="font-semibold text-teal-600">FastAPI</span> 後端與
            <span className="font-semibold text-emerald-600"> React</span> 前端的互動式 ML 部署服務，
            提供即時預測與線上訓練功能。
          </p>
        </div>

        {/* 分頁切換 */}
        <div className="flex justify-center mb-6 sm:mb-8">
          <div className="inline-flex bg-white/70 backdrop-blur-sm rounded-2xl p-1.5 shadow-lg shadow-teal-100/20 border border-white/60">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 sm:px-7 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300
                  ${activeTab === tab.id
                    ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-md shadow-teal-200/40'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-white/60'
                  }`}
              >
                <span className="mr-1.5">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 分頁內容 */}
        <div className="max-w-6xl mx-auto">
          {activeTab === 'predict' ? <PredictionTab /> : <TrainingTab />}
        </div>
      </main>

      {/* 頁尾 */}
      <footer className="text-center py-5 text-xs text-gray-400 border-t border-gray-100/50">
        Iris ML Platform &copy; 2026 &middot; Powered by FastAPI + React + TailwindCSS
      </footer>
    </div>
  );
}

export default App;
