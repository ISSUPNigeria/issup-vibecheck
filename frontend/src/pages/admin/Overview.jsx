import { useEffect, useState, useCallback } from 'react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend,
} from 'recharts'
import { getOverview } from '../../services/adminApi'
import StatCard from '../../components/admin/StatCard'
import DateFilter from '../../components/admin/DateFilter'

const COLORS = { registered: '#5B2D91', guest: '#9CA3AF' }

export default function Overview() {
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
      setData(await getOverview(params))
    } catch {
      setError('Failed to load overview data.')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => { load() }, [load])

  const handleFilterChange = (key, value) => setFilters(f => ({ ...f, [key]: value }))

  const donutData = data
    ? [
        { name: 'Registered', value: data.registered_sessions },
        { name: 'Guest', value: data.guest_sessions },
      ]
    : []

  return (
    <div className="min-h-full">
      {/* Sticky page header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Overview</h1>
          <p className="text-sm text-gray-500 mt-0.5">Platform health at a glance</p>
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
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total Screenings"
          value={data?.total_screenings?.toLocaleString()}
          icon="📋"
          accent="#5B2D91"
        />
        <StatCard
          label="Registered Users"
          value={data?.registered_users?.toLocaleString()}
          icon="👥"
          accent="#124A66"
        />
        <StatCard
          label="Crisis Sessions"
          value={data?.crisis_sessions?.toLocaleString()}
          icon="🚨"
          accent="#E53935"
        />
        <StatCard
          label="Monthly AI Cost"
          value={data ? `$${data.monthly_token_cost_usd.toFixed(4)}` : null}
          icon="💰"
          accent="#F2992E"
          sub="current calendar month"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Line chart — screenings per day */}
        <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-base font-semibold text-gray-700 mb-4">Screenings Per Day (last 30 days)</h2>
          {data?.screenings_per_day?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data.screenings_per_day} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 13, fill: '#9CA3AF' }}
                  tickFormatter={d => d.slice(5)}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fontSize: 13, fill: '#9CA3AF' }} allowDecimals={false} width={28} />
                <Tooltip
                  contentStyle={{ fontSize: 13, borderRadius: 8, border: '1px solid #E5E7EB' }}
                  labelFormatter={l => `Date: ${l}`}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#5B2D91"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: '#5B2D91' }}
                  name="Screenings"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <Empty />
          )}
        </div>

        {/* Donut — guest vs registered */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-base font-semibold text-gray-700 mb-4">Sessions by Auth Type</h2>
          {donutData.some(d => d.value > 0) ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {donutData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={i === 0 ? COLORS.registered : COLORS.guest}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ fontSize: 13, borderRadius: 8, border: '1px solid #E5E7EB' }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={v => <span style={{ fontSize: 13, color: '#6B7280' }}>{v}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <Empty />
          )}
        </div>
      </div>
    </div>
    </div>
  )
}

function Empty() {
  return (
    <div className="flex items-center justify-center h-[220px] text-sm text-gray-400">
      No data available
    </div>
  )
}
