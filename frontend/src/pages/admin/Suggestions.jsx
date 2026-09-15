import { useEffect, useState, useCallback } from 'react'
import { getSuggestions } from '../../services/adminApi'
import StatCard from '../../components/admin/StatCard'
import DateFilter from '../../components/admin/DateFilter'

export default function Suggestions() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({ date_from: '', date_to: '' })

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = {}
      if (filters.date_from) params.date_from = filters.date_from
      if (filters.date_to) params.date_to = filters.date_to
      setData(await getSuggestions(params))
    } catch {
      setError('Failed to load suggestions.')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => { load() }, [load])

  const handleFilterChange = (key, value) =>
    setFilters(f => ({ ...f, [key]: value }))

  return (
    <div className="min-h-full">
      {/* Sticky page header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Suggestions</h1>
          <p className="text-sm text-gray-500 mt-0.5">User responses to "How do you think VibeCheck can help you better?"</p>
        </div>
        <DateFilter
          dateFrom={filters.date_from}
          dateTo={filters.date_to}
          onChange={handleFilterChange}
          onRefresh={load}
          loading={loading}
        />
      </div>

      <div className="p-6 space-y-6">
        {error && (
          <div className="bg-red/5 border border-red/20 text-red rounded-lg px-4 py-3 text-sm">{error}</div>
        )}

        <StatCard
          label="Total Suggestions"
          value={data?.total?.toLocaleString()}
          icon="💡"
          accent="#5B2D91"
          sub="all time"
        />

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-500 w-36">Date</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-500 w-32">Session</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-500">Suggestion</th>
                </tr>
              </thead>
              <tbody>
                {data?.suggestions?.length > 0 ? (
                  data.suggestions.map((row) => (
                    <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">
                        {row.created_at?.slice(0, 16).replace('T', ' ')}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-400 truncate max-w-[120px]">
                        {row.session_id}
                      </td>
                      <td className="px-4 py-4 text-gray-700 leading-relaxed">{row.suggestion_text}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-4 py-12 text-center text-gray-400 text-sm">
                      {loading ? 'Loading...' : 'No suggestions yet'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}