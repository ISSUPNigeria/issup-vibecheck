import { useEffect, useState, useCallback } from 'react'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { getFeedback } from '../../services/adminApi'
import DateFilter from '../../components/admin/DateFilter'

const TAB_COLORS = {
  overview: '#5B2D91',
  assist: '#F2992E',
  phq9: '#E53935',
  triggers: '#124A66',
  'next-steps': '#7CB342',
}

export default function Feedback() {
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
      setData(await getFeedback(params))
    } catch {
      setError('Failed to load feedback data.')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => { load() }, [load])

  const handleFilterChange = (key, value) => setFilters(f => ({ ...f, [key]: value }))

  return (
    <div className="min-h-full">
      {/* Sticky page header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Feedback</h1>
          <p className="text-sm text-gray-500 mt-0.5">Results page and AI chat ratings</p>
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

      {/* Results tab ratings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h2 className="text-base font-semibold text-gray-700 mb-4">Results Page — Thumbs-Up % by Tab</h2>
        {data?.tab_ratings?.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={data.tab_ratings}
              margin={{ top: 4, right: 8, bottom: 0, left: 0 }}
              barSize={44}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis dataKey="tab" tick={{ fontSize: 13, fill: '#6B7280' }} />
              <YAxis tick={{ fontSize: 13, fill: '#9CA3AF' }} domain={[0, 100]} tickFormatter={v => `${v}%`} width={40} />
              <Tooltip
                contentStyle={{ fontSize: 13, borderRadius: 8, border: '1px solid #E5E7EB' }}
                formatter={(v, name) => name === 'rate_percent' ? [`${v}%`, 'Thumbs Up Rate'] : [v, name]}
              />
              <Bar dataKey="rate_percent" name="rate_percent" radius={[4, 4, 0, 0]}>
                {data.tab_ratings.map((entry, i) => (
                  <Cell key={i} fill={TAB_COLORS[entry.tab] || '#9CA3AF'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <Empty />
        )}
        {/* Tab totals summary */}
        {data?.tab_ratings?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-3">
            {data.tab_ratings.map(tab => (
              <div key={tab.tab} className="flex items-center gap-2 text-xs text-gray-500">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: TAB_COLORS[tab.tab] || '#9CA3AF' }}
                />
                <span className="capitalize">{tab.tab}</span>
                <span className="text-gray-400">({tab.total} ratings)</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chat feedback trend */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h2 className="text-base font-semibold text-gray-700 mb-4">Chat Feedback Trend</h2>
        {data?.chat_feedback_trend?.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart
              data={data.chat_feedback_trend}
              margin={{ top: 4, right: 8, bottom: 0, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 13, fill: '#9CA3AF' }}
                tickFormatter={d => d.slice(5)}
                interval="preserveStartEnd"
              />
              <YAxis tick={{ fontSize: 13, fill: '#9CA3AF' }} domain={[0, 100]} tickFormatter={v => `${v}%`} width={40} />
              <Tooltip
                contentStyle={{ fontSize: 13, borderRadius: 8, border: '1px solid #E5E7EB' }}
                formatter={v => [`${v}%`, 'Thumbs Up Rate']}
              />
              <Line type="monotone" dataKey="rate_percent" stroke="#7CB342" strokeWidth={2} dot={false} name="rate_percent" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <Empty />
        )}
      </div>

      {/* Negative comments */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h2 className="text-base font-semibold text-gray-700 mb-4">Recent Negative Comments</h2>
        {data?.negative_comments?.length > 0 ? (
          <div className="space-y-3">
            {data.negative_comments.map((item, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      item.source === 'chat'
                        ? 'bg-purple/10 text-purple'
                        : 'bg-teal/10 text-teal'
                    }`}>
                      {item.source === 'chat' ? '💬 Chat' : `📋 Results${item.tab ? ` — ${item.tab}` : ''}`}
                    </span>
                    <span className="font-mono text-xs text-gray-400">{item.session_id}</span>
                  </div>
                  <span className="text-xs text-gray-400">{item.date}</span>
                </div>
                <p className="text-sm text-gray-700">{item.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 py-6 text-center">No negative comments yet</p>
        )}
      </div>
    </div>
    </div>
  )
}

function Empty() {
  return (
    <div className="flex items-center justify-center h-[200px] text-sm text-gray-400">
      No data available
    </div>
  )
}
