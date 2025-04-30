export const Header = () => (
  <div className="p-6 border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-dark-secondary dark:to-dark-primary">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-dark-text-primary">Whale Transactions</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Tracking large cryptocurrency movements across major exchanges
        </p>
      </div>
      <div className="flex items-center space-x-2">
        <LiveIndicator />
      </div>
    </div>
  </div>
)

const LiveIndicator = () => (
  <div className="px-3 py-1 text-xs font-medium bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300 rounded-full flex items-center">
    <span className="relative flex h-2 w-2 mr-1">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
    </span>
    Live Data
  </div>
)
