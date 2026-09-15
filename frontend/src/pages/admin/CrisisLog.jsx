import { useEffect, useState, useCallback } from 'react'
import { getCrisis, downloadCSV } from '../../services/adminApi'
import StatCard from '../../components/admin/StatCard'
import DateFilter from '../../components/admin/DateFilter'

const RISK_BADGE = {
  low: 'bg-green/10 text-green',
  moderate: 'bg-orange/10 text-orange',
  high: 'bg-red/10 text-red',
}

export default function CrisisLog() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({ date_from: '', date_to: '' })
  const [page, setPage] = useState(1)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = { page, page_size: 20 }
      if (filters.date_from) params.date_from = filters.date_from
      if (filters.date_to) params.date_to = filters.date_to
      setData(await getCrisis(params))
    } catch {
      setError('Failed to load crisis data.')
    } finally {
      setLoading(false)
    }
  }, [filters, page])

  useEffect(() => { load() }, [load])

  const handleFilterChange = (key, value) => {
    setFilters(f => ({ ...f, [key]: value }))
    setPage(1)
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const params = {}
      if (filters.date_from) params.date_from = filters.date_from
      if (filters.date_to) params.date_to = filters.date_to
      await downloadCSV('crisis', params, 'crisis_log.csv')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="min-h-full">
      {/* Sticky page header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Crisis Log</h1>
          <p className="text-sm text-gray-500 mt-0.5">Sessions where suicidal ideation or crisis was detected</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <DateFilter
            dateFrom={filters.date_from}
            dateTo={filters.date_to}
            onChange={handleFilterChange}
            onRefresh={load}
            loading={loading}
          />
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 text-sm font-medium px-4 py-1.5 rounded-lg bg-teal text-white hover:bg-teal/90 transition-colors disabled:opacity-50"
          >
            ↓ {exporting ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">

      {error && (
        <div className="bg-red/5 border border-red/20 text-red rounded-lg px-4 py-3 text-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard
          label="Total Crisis Sessions"
          value={data?.total?.toLocaleString()}
          icon="🚨"
          accent="#E53935"
          sub="all time"
        />
        <StatCard
          label="Showing Page"
          value={data ? `${data.page} of ${data.total_pages}` : null}
          icon="📄"
          accent="#9CA3AF"
          sub={`${data?.page_size ?? 20} per page`}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-500">Date</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-500">Session ID</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-500">Age</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-500">State</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-500">Gender</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-500">ASSIST Risk</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-500">PHQ-9</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-500">Q9 (Ideation)</th>
              </tr>
            </thead>
            <tbody>
              {data?.sessions?.length > 0 ? (
                data.sessions.map((row, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{row.date}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-400 max-w-[120px] truncate">
                      {row.session_id}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{row.age ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{row.state ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600 capitalize">{row.gender ?? '—'}</td>
                    <td className="px-4 py-3">
                      {row.assist_overall_risk ? (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${RISK_BADGE[row.assist_overall_risk] || 'bg-gray-100 text-gray-500'}`}>
                          {row.assist_overall_risk}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{row.phq9_score ?? '—'}</td>
                    <td className="px-4 py-3">
                      {row.phq9_q9 ? (
                        <span className="text-red font-semibold text-sm">YES</span>
                      ) : (
                        <span className="text-gray-400 text-sm">no</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-400 text-sm">
                    {loading ? 'Loading...' : 'No crisis sessions found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.total_pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              {data.total} sessions total
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition-colors"
              >
                Previous
              </button>
              <span className="text-xs text-gray-500">Page {page} of {data.total_pages}</span>
              <button
                onClick={() => setPage(p => Math.min(data.total_pages, p + 1))}
                disabled={page === data.total_pages}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
    </div>
  )
}
