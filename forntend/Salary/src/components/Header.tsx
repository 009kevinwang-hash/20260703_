export default function Header() {
  return (
    <header className="relative overflow-hidden bg-white/70 backdrop-blur-md border-b border-blue-100 sticky top-0 z-50">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/80 via-sky-50/60 to-cyan-50/80" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-sky-400 flex items-center justify-center text-white text-xl sm:text-2xl shadow-lg shadow-blue-200/50">
              💼
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-700 to-sky-600 bg-clip-text text-transparent">
                薪資預測 AI
              </h1>
              <p className="text-xs sm:text-sm text-blue-600/70 hidden sm:block">
                多元線性迴歸 / Lasso / Ridge 薪資預測平台
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded-full border border-blue-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
              FastAPI 後端
            </span>
            <a
              href="http://127.0.0.1:8000/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-full border border-blue-200/60 transition-colors"
            >
              📄 API Docs
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
