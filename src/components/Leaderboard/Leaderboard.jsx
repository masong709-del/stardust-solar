import { useEffect, useState } from 'react'
import { useLeaderboard } from '../../hooks/useLeaderboard'

export default function Leaderboard() {
  const [period, setPeriod] = useState('weekly')
  const { rows, loading, load } = useLeaderboard()

  useEffect(() => { load(period) }, [period, load])

  const top = rows[0]?.deals || 0

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-4xl font-black text-blue-900 mb-2">Leaderboard</h2>
      <p className="text-slate-500 mb-6 italic">Live from the field. Chase the crown.</p>

      <div className="flex gap-3 mb-6">
        <div className="flex bg-slate-100 rounded-xl p-1">
          {['weekly', 'monthly'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-5 py-2 rounded-lg text-xs font-black transition ${period === p ? 'bg-white text-blue-900 shadow-sm' : 'text-slate-500'}`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        {loading && <div className="p-12 text-center text-slate-400 italic text-sm">Loading rankings...</div>}
        {!loading && rows.length === 0 && (
          <div className="p-12 text-center text-slate-400 italic text-sm">
            No data for this period yet. Reps need to log their metrics in the Dashboard.
          </div>
        )}
        {!loading && rows.length > 0 && (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                <th className="p-4 text-left">Rank</th>
                <th className="p-4 text-left">Rep</th>
                <th className="p-4 text-right">Doors</th>
                <th className="p-4 text-right">Appts</th>
                <th className="p-4 text-right">Deals</th>
                <th className="p-4 text-right">vs #1</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const isFirst = i === 0
                const delta = r.deals - top
                return (
                  <tr key={r.name} className={`border-b border-slate-100 ${isFirst ? 'bg-yellow-50 font-black' : i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                    <td className="p-4 text-slate-500">{isFirst ? '👑 ' : ''}{i + 1}</td>
                    <td className="p-4 font-bold text-blue-900">{r.name}</td>
                    <td className="p-4 text-right text-slate-600">{r.knocks}</td>
                    <td className="p-4 text-right text-slate-600">{r.apps}</td>
                    <td className="p-4 text-right text-green-600 font-black text-base">{r.deals}</td>
                    <td className="p-4 text-right">
                      {isFirst
                        ? <span className="text-yellow-500 font-black">Leader</span>
                        : <span className="text-red-400">{delta}</span>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
