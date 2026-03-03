import { useEffect, useState } from 'react'
import { useAppStore } from '../../store/appStore'
import { useProspects } from '../../hooks/useProspects'

const STATUS_COLORS = {
  'Pitched': 'bg-blue-100 text-blue-800',
  'Appointment Set': 'bg-yellow-100 text-yellow-800',
  'Closed': 'bg-green-100 text-green-800',
  'Lost': 'bg-slate-100 text-slate-500',
}
const STATUSES = ['Pitched', 'Appointment Set', 'Closed', 'Lost']
const FILTERS = ['All', ...STATUSES]

export default function CustomerTracker() {
  const { user } = useAppStore()
  const { prospects, loading, load, add, remove, updateStatus } = useProspects(user?.id)
  const [filter, setFilter] = useState('All')
  const [form, setForm] = useState({ name: '', address: '', phone: '', status: 'Pitched', notes: '' })
  const [error, setError] = useState('')

  useEffect(() => { load() }, [load])

  async function handleAdd(e) {
    e.preventDefault()
    if (!form.name.trim()) { setError('Name is required.'); return }
    const err = await add(form)
    if (err) setError(err.message)
    else { setForm({ name: '', address: '', phone: '', status: 'Pitched', notes: '' }); setError('') }
  }

  const visible = prospects.filter((p) => filter === 'All' || p.status === filter)

  return (
    <div className="max-w-5xl mx-auto">
      <h2 className="text-4xl font-black text-blue-900 mb-2">Customer Tracker</h2>
      <p className="text-slate-500 mb-8 italic">Log every prospect. Follow up on every door.</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <h3 className="font-black text-blue-900 mb-4 text-sm uppercase tracking-widest">➕ Add Prospect</h3>
          <form onSubmit={handleAdd} className="space-y-3">
            {[
              { field: 'name', placeholder: 'Full Name', type: 'text' },
              { field: 'address', placeholder: 'Address', type: 'text' },
              { field: 'phone', placeholder: 'Phone (optional)', type: 'text' },
            ].map(({ field, placeholder, type }) => (
              <input
                key={field}
                type={type}
                placeholder={placeholder}
                value={form[field]}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-yellow-400"
              />
            ))}
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-yellow-400 bg-white"
            >
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
            <textarea
              placeholder="Notes (optional)"
              rows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-yellow-400 resize-none"
            />
            {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
            <button type="submit" className="w-full bg-blue-900 text-white font-black py-3 rounded-xl hover:bg-blue-800 transition">
              Add Prospect
            </button>
          </form>
        </div>

        <div className="lg:col-span-2">
          <div className="flex flex-wrap gap-2 mb-4">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${filter === f ? 'bg-blue-900 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}`}
              >
                {f}
              </button>
            ))}
          </div>

          {loading && <p className="text-slate-400 text-sm text-center mt-8">Loading prospects...</p>}

          {!loading && visible.length === 0 && (
            <p className="text-slate-400 italic text-sm text-center mt-8">
              {prospects.length === 0 ? 'No prospects yet. Add your first one.' : 'No prospects in this category.'}
            </p>
          )}

          <div className="space-y-3">
            {visible.map((p) => (
              <div key={p.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-start gap-4 shadow-sm">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="font-black text-blue-900 text-sm">{p.name}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[p.status] || ''}`}>{p.status}</span>
                  </div>
                  {p.address && <p className="text-xs text-slate-500">📍 {p.address}</p>}
                  {p.phone && <p className="text-xs text-slate-500">📞 {p.phone}</p>}
                  {p.notes && <p className="text-xs text-slate-400 italic mt-1">{p.notes}</p>}
                  <p className="text-[10px] text-slate-300 mt-1">{new Date(p.created_at).toLocaleDateString('en-CA')}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={p.status}
                    onChange={(e) => updateStatus(p.id, e.target.value)}
                    className="border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold outline-none bg-white"
                  >
                    {STATUSES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                  <button onClick={() => remove(p.id)} className="text-slate-300 hover:text-red-500 transition">✕</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
