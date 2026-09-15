export default function DateFilter({ dateFrom, dateTo, onChange, onRefresh, loading }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <span className="px-3 text-xs font-medium text-gray-400 border-r border-gray-200 h-full flex items-center py-2">
          From
        </span>
        <input
          type="date"
          value={dateFrom}
          onChange={e => onChange('date_from', e.target.value)}
          className="text-sm px-3 py-2 focus:outline-none text-gray-600 bg-white"
        />
        <span className="px-2 text-gray-300">—</span>
        <input
          type="date"
          value={dateTo}
          onChange={e => onChange('date_to', e.target.value)}
          className="text-sm px-3 py-2 focus:outline-none text-gray-600 bg-white border-l border-gray-200"
        />
      </div>

      <button
        onClick={onRefresh}
        disabled={loading}
        className="flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
      >
        <svg
          className={`w-3.5 h-3.5 text-gray-500 ${loading ? 'animate-spin' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <span className="text-gray-600">{loading ? 'Loading…' : 'Refresh'}</span>
      </button>

      {(dateFrom || dateTo) && (
        <button
          onClick={() => { onChange('date_from', ''); onChange('date_to', '') }}
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors px-1"
        >
          ✕ Clear
        </button>
      )}
    </div>
  )
}
