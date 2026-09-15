import { useEffect, useState, useCallback } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'
import { getDemographics } from '../../services/adminApi'
import StatCard from '../../components/admin/StatCard'
import DateFilter from '../../components/admin/DateFilter'

const GENDER_COLORS = ['#5B2D91', '#124A66', '#7CB342', '#F2992E', '#9CA3AF']

export default function Demographics() {
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
      setData(await getDemographics(params))
    } catch {
      setError('Failed to load demographics data.')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => { load() }, [load])

  const handleFilterChange = (key, value) => setFilters(f => ({ ...f, [key]: value }))

  const ageData = data
    ? Object.entries(data.age_groups).map(([age, count]) => ({ name: age, count }))
    : []

  const genderData = data
    ? Object.entries(data.gender_distribution)
        .filter(([, v]) => v > 0)
        .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }))
    : []

  const employmentData = data
    ? Object.entries(data.employment_status)
        .filter(([, v]) => v > 0)
        .map(([name, count]) => ({
          name: name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          count,
        }))
        .sort((a, b) => b.count - a.count)
    : []

  const religionData = data
    ? Object.entries(data.religion_distribution)
        .filter(([, v]) => v > 0)
        .map(([name, count]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          count,
        }))
        .sort((a, b) => b.count - a.count)
    : []

  return (
    <div className="min-h-full">
      {/* Sticky page header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Demographics</h1>
          <p className="text-sm text-gray-500 mt-0.5">Who is using the platform</p>
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

      <StatCard label="Total Screenings" value={data?.total?.toLocaleString()} icon="📋" accent="#5B2D91" />

      {/* Age + Gender row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-base font-semibold text-gray-700 mb-4">Age Group Distribution</h2>
          {ageData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={ageData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }} barSize={36}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 13, fill: '#6B7280' }} />
                <YAxis tick={{ fontSize: 13, fill: '#9CA3AF' }} allowDecimals={false} width={28} />
                <Tooltip contentStyle={{ fontSize: 13, borderRadius: 8, border: '1px solid #E5E7EB' }} />
                <Bar dataKey="count" name="Users" fill="#5B2D91" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <Empty />}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-base font-semibold text-gray-700 mb-4">Gender Split</h2>
          {genderData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="45%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {genderData.map((_, i) => (
                    <Cell key={i} fill={GENDER_COLORS[i % GENDER_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 13, borderRadius: 8, border: '1px solid #E5E7EB' }} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={v => <span style={{ fontSize: 13, color: '#6B7280' }}>{v}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : <Empty />}
        </div>
      </div>

      {/* Top states */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h2 className="text-base font-semibold text-gray-700 mb-4">Top 10 States by Volume</h2>
        {data?.top_states?.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={data.top_states}
              layout="vertical"
              margin={{ top: 4, right: 24, bottom: 0, left: 80 }}
              barSize={14}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 13, fill: '#9CA3AF' }} allowDecimals={false} />
              <YAxis type="category" dataKey="state" tick={{ fontSize: 13, fill: '#6B7280' }} width={80} />
              <Tooltip contentStyle={{ fontSize: 13, borderRadius: 8, border: '1px solid #E5E7EB' }} />
              <Bar dataKey="count" name="Screenings" fill="#124A66" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : <Empty />}
      </div>

      {/* Employment + Religion row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-base font-semibold text-gray-700 mb-4">Employment Status</h2>
          {employmentData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={employmentData} margin={{ top: 4, right: 8, bottom: 24, left: 0 }} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 13, fill: '#6B7280' }} angle={-20} textAnchor="end" />
                <YAxis tick={{ fontSize: 13, fill: '#9CA3AF' }} allowDecimals={false} width={28} />
                <Tooltip contentStyle={{ fontSize: 13, borderRadius: 8, border: '1px solid #E5E7EB' }} />
                <Bar dataKey="count" name="Users" fill="#F2992E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <Empty />}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-base font-semibold text-gray-700 mb-4">Religion Distribution</h2>
          {religionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={religionData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }} barSize={36}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 13, fill: '#6B7280' }} />
                <YAxis tick={{ fontSize: 13, fill: '#9CA3AF' }} allowDecimals={false} width={28} />
                <Tooltip contentStyle={{ fontSize: 13, borderRadius: 8, border: '1px solid #E5E7EB' }} />
                <Bar dataKey="count" name="Users" fill="#7CB342" radius={[4, 4, 0, 0]} />
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
    <div className="flex items-center justify-center h-[200px] text-sm text-gray-400">
      No data available
    </div>
  )
}
