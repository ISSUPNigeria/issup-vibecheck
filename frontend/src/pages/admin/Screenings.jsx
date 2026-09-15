import { useEffect, useState, useCallback } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, Cell,
} from 'recharts'
import { getScreenings } from '../../services/adminApi'
import StatCard from '../../components/admin/StatCard'
import DateFilter from '../../components/admin/DateFilter'

const SEVERITY_COLORS = {
  minimal: '#7CB342',
  mild: '#F2992E',
  moderate: '#F59E0B',
  moderately_severe: '#EF4444',
  severe: '#991B1B',
  unknown: '#9CA3AF',
}

const RISK_LABELS = { low: 'Low', moderate: 'Moderate', high: 'High' }

const SEVERITY_ORDER = ['minimal', 'mild', 'moderate', 'moderately_severe', 'severe', 'unknown']

export default function Screenings() {
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
      setData(await getScreenings(params))
    } catch {
      setError('Failed to load screenings data.')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => { load() }, [load])

  const handleFilterChange = (key, value) => setFilters(f => ({ ...f, [key]: value }))

  // Format severity distribution for bar chart
  const severityData = data
    ? Object.entries(data.phq9_severity_distribution)
        .filter(([, count]) => count > 0)
        .sort(([a], [b]) => SEVERITY_ORDER.indexOf(a) - SEVERITY_ORDER.indexOf(b))
        .map(([sev, count]) => ({
          name: sev.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          count,
          fill: SEVERITY_COLORS[sev] || '#9CA3AF',
        }))
    : []

  // Format ASSIST risk as stacked bars
  const assistData = data?.assist_risk_by_substance || []

  return (
    <div className="min-h-full">
      {/* Sticky page header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Screenings</h1>
          <p className="text-sm text-gray-500 mt-0.5">ASSIST & PHQ-9 results breakdown</p>
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
          label="Total Screenings"
          value={data?.total_screenings?.toLocaleString()}
          icon="📋"
          accent="#5B2D91"
        />
        <StatCard
          label="High ASSIST Risk Sessions"
          value={data?.high_assist_risk_sessions?.toLocaleString()}
          icon="⚠️"
          accent="#E53935"
          sub="at least one substance"
        />
        <StatCard
          label="PHQ-9 Clinical Threshold"
          value={data?.phq9_clinical_threshold_met?.toLocaleString()}
          icon="🧠"
          accent="#F2992E"
          sub="score ≥ 10"
        />
      </div>

      {/* Charts */}
      <div className="space-y-5">
        {/* ASSIST risk stacked bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-base font-semibold text-gray-700 mb-4">
            ASSIST Risk Level by Substance
          </h2>
          {assistData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={assistData}
                margin={{ top: 4, right: 8, bottom: 0, left: 0 }}
                barSize={28}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                <XAxis
                  dataKey="substance"
                  tick={{ fontSize: 13, fill: '#6B7280' }}
                  tickFormatter={s => s.charAt(0).toUpperCase() + s.slice(1)}
                />
                <YAxis tick={{ fontSize: 13, fill: '#9CA3AF' }} allowDecimals={false} width={28} />
                <Tooltip
                  contentStyle={{ fontSize: 13, borderRadius: 8, border: '1px solid #E5E7EB' }}
                />
                <Legend
                  iconType="square"
                  iconSize={10}
                  formatter={v => <span style={{ fontSize: 13, color: '#6B7280' }}>{RISK_LABELS[v] || v}</span>}
                />
                <Bar dataKey="low" stackId="a" fill="#7CB342" name="low" radius={[0, 0, 0, 0]} />
                <Bar dataKey="moderate" stackId="a" fill="#F2992E" name="moderate" />
                <Bar dataKey="high" stackId="a" fill="#E53935" name="high" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Empty />
          )}
        </div>

        {/* PHQ-9 severity bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-base font-semibold text-gray-700 mb-4">
            PHQ-9 Severity Distribution
          </h2>
          {severityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={severityData}
                margin={{ top: 4, right: 8, bottom: 0, left: 0 }}
                barSize={36}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 13, fill: '#6B7280' }} />
                <YAxis tick={{ fontSize: 13, fill: '#9CA3AF' }} allowDecimals={false} width={28} />
                <Tooltip
                  contentStyle={{ fontSize: 13, borderRadius: 8, border: '1px solid #E5E7EB' }}
                />
                <Bar dataKey="count" name="Sessions" radius={[4, 4, 0, 0]}>
                  {severityData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
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
