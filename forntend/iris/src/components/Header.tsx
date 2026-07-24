export default function Header() {
  return (
    <header className="relative overflow-hidden bg-white/70 backdrop-blur-md border-b border-teal-100 sticky top-0 z-50">
      <div className="absolute inset-0 bg-gradient-to-r from-teal-50/80 via-emerald-50/60 to-cyan-50/80" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white text-xl sm:text-2xl shadow-lg shadow-teal-200/50">
              🌸
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-teal-700 to-emerald-600 bg-clip-text text-transparent">
                Iris 鳶尾花 AI
              </h1>
              <p className="text-xs sm:text-sm text-teal-600/70 hidden sm:block">
                機器學習預測平台
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-teal-700 bg-teal-50 rounded-full border border-teal-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              API 已連線
            </span>
            <a
              href="https://two0260703.onrender.com/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-full border border-teal-200/60 transition-colors"
            >
              📄 API Docs
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
