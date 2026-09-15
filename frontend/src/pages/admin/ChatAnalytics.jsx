import { useEffect, useState, useCallback } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { getChat } from '../../services/adminApi'
import StatCard from '../../components/admin/StatCard'
import DateFilter from '../../components/admin/DateFilter'

export default function ChatAnalytics() {
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
      setData(await getChat(params))
    } catch {
      setError('Failed to load chat analytics.')
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
          <h1 className="text-2xl font-bold text-gray-800">Chat Analytics</h1>
          <p className="text-sm text-gray-500 mt-0.5">AI chatbot usage and quality signals</p>
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Conversations"
          value={data?.total_conversations?.toLocaleString()}
          icon="💬"
          accent="#5B2D91"
        />
        <StatCard
          label="Avg Messages / Session"
          value={data?.avg_messages_per_session}
          icon="📨"
          accent="#124A66"
        />
        <StatCard
          label="AI Thumbs-Up Rate"
          value={data ? `${data.thumbs_up_rate_percent}%` : null}
          icon="👍"
          accent="#7CB342"
          sub={`from ${data?.total_feedback_submitted ?? 0} ratings`}
        />
      </div>

      {/* Thumbs-up trend chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h2 className="text-base font-semibold text-gray-700 mb-4">Daily Feedback Trend</h2>
        {data?.thumbs_up_trend?.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart
              data={data.thumbs_up_trend}
              margin={{ top: 4, right: 8, bottom: 0, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 13, fill: '#9CA3AF' }}
                tickFormatter={d => d.slice(5)}
                interval="preserveStartEnd"
              />
              <YAxis tick={{ fontSize: 13, fill: '#9CA3AF' }} allowDecimals={false} width={28} />
              <Tooltip contentStyle={{ fontSize: 13, borderRadius: 8, border: '1px solid #E5E7EB' }} />
              <Legend iconType="circle" iconSize={8} formatter={v => <span style={{ fontSize: 13, color: '#6B7280' }}>{v}</span>} />
              <Line type="monotone" dataKey="thumbs_up" stroke="#7CB342" strokeWidth={2} dot={false} name="Thumbs Up" />
              <Line type="monotone" dataKey="thumbs_down" stroke="#E53935" strokeWidth={2} dot={false} name="Thumbs Down" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[220px] text-sm text-gray-400">No feedback data yet</div>
        )}
      </div>

      {/* Recent negative comments */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h2 className="text-base font-semibold text-gray-700 mb-4">Recent Negative Feedback</h2>
        {data?.recent_negative_comments?.length > 0 ? (
          <div className="space-y-3">
            {data.recent_negative_comments.map((item, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-gray-400">{item.session_id}</span>
                  <span className="text-xs text-gray-400">{item.date}</span>
                </div>
                <p className="text-sm text-gray-700 mb-1">
                  <span className="font-medium text-red">Comment: </span>{item.comment}
                </p>
                {item.ai_message && (
                  <p className="text-xs text-gray-400">
                    AI said: "{item.ai_message}"
                  </p>
                )}
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
