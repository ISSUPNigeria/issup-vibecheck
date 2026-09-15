import { useEffect, useState, useCallback } from 'react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { getUsers } from '../../services/adminApi'
import StatCard from '../../components/admin/StatCard'
import DateFilter from '../../components/admin/DateFilter'

export default function Users() {
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
      setData(await getUsers(params))
    } catch {
      setError('Failed to load users data.')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => { load() }, [load])

  const handleFilterChange = (key, value) => setFilters(f => ({ ...f, [key]: value }))

  const distData = data
    ? Object.entries(data.screenings_per_user_distribution).map(([label, count]) => ({
        name: `${label} screening${label === '1' ? '' : 's'}`,
        count,
      }))
    : []

  return (
    <div className="min-h-full">
      {/* Sticky page header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Users</h1>
          <p className="text-sm text-gray-500 mt-0.5">Registered accounts and engagement</p>
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
          label="Total Registered Users"
          value={data?.total_registered?.toLocaleString()}
          icon="🔐"
          accent="#5B2D91"
          sub="all time"
        />
        <StatCard
          label="Guest Sessions (Period)"
          value={data?.guest_sessions_period?.toLocaleString()}
          icon="👤"
          accent="#9CA3AF"
        />
        <StatCard
          label="Users with Chat History"
          value={data?.users_with_chat_history?.toLocaleString()}
          icon="💬"
          accent="#124A66"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Registrations over time */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-base font-semibold text-gray-700 mb-4">New Registrations Over Time</h2>
          {data?.registrations_over_time?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart
                data={data.registrations_over_time}
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
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#5B2D91"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                  name="Registrations"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : <Empty />}
        </div>

        {/* Screenings per user distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-base font-semibold text-gray-700 mb-4">Screenings per User</h2>
          {distData.some(d => d.count > 0) ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={distData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }} barSize={52}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 13, fill: '#6B7280' }} />
                <YAxis tick={{ fontSize: 13, fill: '#9CA3AF' }} allowDecimals={false} width={28} />
                <Tooltip contentStyle={{ fontSize: 13, borderRadius: 8, border: '1px solid #E5E7EB' }} />
                <Bar dataKey="count" name="Users" fill="#124A66" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <Empty />}
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
