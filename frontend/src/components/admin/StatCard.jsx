export default function StatCard({ label, value, sub, accent = '#5B2D91' }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="h-1 w-full" style={{ backgroundColor: accent }} />
      <div className="px-5 py-5">
        <p className="text-sm font-medium text-gray-500 mb-2">{label}</p>
        <p className="text-4xl font-bold text-gray-800 leading-none">{value ?? '—'}</p>
        {sub && <p className="text-sm text-gray-400 mt-2">{sub}</p>}
      </div>
    </div>
  )
}
