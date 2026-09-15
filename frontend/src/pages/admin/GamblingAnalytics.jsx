import { useEffect, useState, useCallback } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { getGamblingAnalytics } from '../../services/adminApi'
import StatCard from '../../components/admin/StatCard'
import DateFilter from '../../components/admin/DateFilter'

const CATEGORY_COLORS = {
  no_risk:         '#7CB342',
  low_risk:        '#2F80C3',
  moderate_risk:   '#F2992E',
  problem_gambler: '#E53935',
}

export default function GamblingAnalytics() {
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
      setData(await getGamblingAnalytics(params))
    } catch {
      setError('Failed to load gambling analytics.')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => { load() }, [load])

  const handleFilterChange = (key, value) =>
    setFilters(f => ({ ...f, [key]: value }))

  const problemCount = data?.distribution?.find(d => d.category === 'problem_gambler')?.count || 0
  const problemPct = data?.total_screened
    ? ((problemCount / data.total_screened) * 100).toFixed(1)
    : 0

  return (
    <div className="min-h-full">
      {/* Page header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gambling Screening (PGSI)</h1>
          <p className="text-sm text-gray-500 mt-0.5">Problem Gambling Severity Index results across all screenings</p>
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

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Total Screened"
            value={data?.total_screened?.toLocaleString() ?? '—'}
            icon="🎲"
            accent="#5B2D91"
            sub="with PGSI data"
          />
          <StatCard
            label="Avg. PGSI Score"
            value={data?.average_score != null ? data.average_score : '—'}
            icon="📊"
            accent="#2F80C3"
            sub="out of 27"
          />
          <StatCard
            label="Problem Gamblers"
            value={data?.total_screened ? `${problemCount} (${problemPct}%)` : '—'}
            icon="⚠️"
            accent="#E53935"
            sub="score ≥ 8"
          />
        </div>

        {/* Bar chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-700 mb-5">Risk Distribution</h2>
          {data?.distribution ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.distribution} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13 }}
                  formatter={(value) => [value, 'Users']}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {data.distribution.map((entry) => (
                    <Cell key={entry.category} fill={CATEGORY_COLORS[entry.category] || '#9ca3af'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-40 flex items-center justify-center text-gray-400 text-sm">
              {loading ? 'Loading...' : 'No data available'}
            </div>
          )}
        </div>

        {/* Risk category breakdown table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-700">Category Breakdown</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-3 font-semibold text-gray-500">Category</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-500">Score Range</th>
                <th className="text-right px-6 py-3 font-semibold text-gray-500">Count</th>
                <th className="text-right px-6 py-3 font-semibold text-gray-500">% of Total</th>
              </tr>
            </thead>
            <tbody>
              {[
                { category: 'no_risk',         label: 'No Risk',          range: '0',   color: CATEGORY_COLORS.no_risk },
                { category: 'low_risk',         label: 'Low Risk',         range: '1–4', color: CATEGORY_COLORS.low_risk },
                { category: 'moderate_risk',    label: 'Moderate Risk',    range: '5–7', color: CATEGORY_COLORS.moderate_risk },
                { category: 'problem_gambler',  label: 'Problem Gambler',  range: '8+',  color: CATEGORY_COLORS.problem_gambler },
              ].map(row => {
                const entry = data?.distribution?.find(d => d.category === row.category)
                const count = entry?.count || 0
                const pct = data?.total_screened ? ((count / data.total_screened) * 100).toFixed(1) : '0.0'
                return (
                  <tr key={row.category} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-3">
                      <span className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: row.color }} />
                        <span className="font-medium text-gray-800">{row.label}</span>
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-500 font-mono text-xs">{row.range}</td>
                    <td className="px-6 py-3 text-right font-semibold text-gray-800">{count.toLocaleString()}</td>
                    <td className="px-6 py-3 text-right text-gray-500">{pct}%</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}