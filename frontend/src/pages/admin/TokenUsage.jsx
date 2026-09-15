import { useEffect, useState, useCallback } from 'react'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { getTokens, downloadCSV } from '../../services/adminApi'
import StatCard from '../../components/admin/StatCard'
import DateFilter from '../../components/admin/DateFilter'

export default function TokenUsage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({ date_from: '', date_to: '' })

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = {}
      if (filters.date_from) params.date_from = filters.date_from
      if (filters.date_to) params.date_to = filters.date_to
      setData(await getTokens(params))
    } catch {
      setError('Failed to load token usage data.')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => { load() }, [load])

  const handleFilterChange = (key, value) => setFilters(f => ({ ...f, [key]: value }))

  const handleExport = async () => {
    setExporting(true)
    try {
      const params = {}
      if (filters.date_from) params.date_from = filters.date_from
      if (filters.date_to) params.date_to = filters.date_to
      await downloadCSV('tokens', params, 'token_usage.csv')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="min-h-full">
      {/* Sticky page header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Token Usage</h1>
          <p className="text-sm text-gray-500 mt-0.5">OpenAI API consumption and costs</p>
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

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="This Month Tokens"
          value={data?.this_month_tokens?.toLocaleString()}
          icon="🔢"
          accent="#5B2D91"
        />
        <StatCard
          label="Est. Cost This Month"
          value={data ? `$${data.this_month_cost_usd.toFixed(4)}` : null}
          icon="💵"
          accent="#F2992E"
        />
        <StatCard
          label="Avg Tokens / Session"
          value={data?.avg_tokens_per_session?.toLocaleString()}
          icon="📊"
          accent="#124A66"
        />
        <StatCard
          label="Today's Tokens"
          value={data?.today_tokens?.toLocaleString()}
          icon="📅"
          accent="#7CB342"
        />
      </div>

      {/* Daily input vs output stacked bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h2 className="text-base font-semibold text-gray-700 mb-4">Daily Token Usage (Input vs Output)</h2>
        {data?.daily_usage?.length > 0 ? (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={data.daily_usage}
              margin={{ top: 4, right: 8, bottom: 0, left: 0 }}
              barSize={16}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 13, fill: '#9CA3AF' }}
                tickFormatter={d => d.slice(5)}
                interval="preserveStartEnd"
              />
              <YAxis tick={{ fontSize: 13, fill: '#9CA3AF' }} width={36} />
              <Tooltip contentStyle={{ fontSize: 13, borderRadius: 8, border: '1px solid #E5E7EB' }} />
              <Legend iconType="square" iconSize={10} formatter={v => <span style={{ fontSize: 13, color: '#6B7280' }}>{v}</span>} />
              <Bar dataKey="input_tokens" stackId="a" fill="#5B2D91" name="Input" />
              <Bar dataKey="output_tokens" stackId="a" fill="#124A66" name="Output" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <Empty />
        )}
      </div>

      {/* Monthly cost trend */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h2 className="text-base font-semibold text-gray-700 mb-4">Monthly Cost Trend (USD)</h2>
        {data?.monthly_cost_trend?.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart
              data={data.monthly_cost_trend}
              margin={{ top: 4, right: 8, bottom: 0, left: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="month" tick={{ fontSize: 13, fill: '#9CA3AF' }} />
              <YAxis tick={{ fontSize: 13, fill: '#9CA3AF' }} width={80} tickFormatter={v => `$${v}`} />
              <Tooltip
                contentStyle={{ fontSize: 13, borderRadius: 8, border: '1px solid #E5E7EB' }}
                formatter={v => [`$${v}`, 'Cost']}
              />
              <Line type="monotone" dataKey="cost_usd" stroke="#F2992E" strokeWidth={2} dot={{ r: 3 }} name="Cost (USD)" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <Empty />
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
