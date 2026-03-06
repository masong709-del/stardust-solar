import { useEffect, useState } from 'react'
import { useAppStore } from '../../store/appStore'

const STATUS_COLORS = {
  'Pitched': 'bg-blue-100 text-blue-800 md:bg-blue-100 md:text-blue-800',
  'Appointment Set': 'bg-yellow-900/30 text-yellow-400 md:bg-yellow-100 md:text-yellow-800',
  'Closed': 'bg-green-900/30 text-green-400 md:bg-green-100 md:text-green-800',
  'Lost': 'bg-slate-800 text-slate-400 md:bg-slate-100 md:text-slate-500',
}
const STATUSES = ['Pitched', 'Appointment Set', 'Closed', 'Lost']
const FILTERS = ['All', ...STATUSES]

export default function CustomerTracker() {
  const { setActiveSection, setCustomerForContract } = useAppStore()
  
  const [prospects, setProspects] = useState([])
  const [filter, setFilter] = useState('All')
  const [form, setForm] = useState({ name: '', address: '', phone: '', email: '', status: 'Pitched', notes: '' })
  const [error, setError] = useState('')

  // Load from LocalStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('stardustProspects')
    if (saved) {
      setProspects(JSON.parse(saved))
    }
  }, [])

  // Helper to sync state and local storage
  const saveToLocal = (updatedProspects) => {
    setProspects(updatedProspects)
    localStorage.setItem('stardustProspects', JSON.stringify(updatedProspects))
  }

  function handleAdd(e) {
    e.preventDefault()
    if (!form.name.trim()) { setError('Name is required.'); return }

    const newProspect = {
      ...form,
      id: Date.now().toString(), // Generate a unique local ID
      created_at: new Date().toISOString()
    }

    saveToLocal([newProspect, ...prospects])
    setForm({ name: '', address: '', phone: '', email: '', status: 'Pitched', notes: '' })
    setError('')
  }

  const remove = (id) => {
    if (window.confirm("Are you sure you want to delete this prospect?")) {
      saveToLocal(prospects.filter(p => p.id !== id))
    }
  }

  const updateStatus = (id, newStatus) => {
    const updated = prospects.map(p => 
      p.id === id ? { ...p, status: newStatus } : p
    )
    saveToLocal(updated)
  }

  const handleGenerateContract = (prospect) => {
    if (setCustomerForContract) {
      setCustomerForContract(prospect)
    }
    setActiveSection('contract')
  }

  const visible = prospects.filter((p) => filter === 'All' || p.status === filter)

  return (
    /* BREAKOUT FIX: 
       Mobile: fixed inset-0, overflow-y-auto, bg-slate-950 (Dark Edge-to-Edge)
       Desktop: relative, md:inset-auto, bg-slate-50 (Light, left-aligned)
    */
    <div className="fixed inset-0 overflow-y-auto bg-slate-950 text-slate-300 md:relative md:inset-auto md:bg-slate-50 md:text-slate-800 font-sans transition-colors duration-300">
      
      {/* CONTAINER: No forced centering on desktop, just clean padding and max-width */}
      <div className="w-full min-h-screen p-4 md:p-8 lg:p-12 pb-32 md:max-w-7xl md:mx-0">
        
        <h2 className="text-4xl font-black text-white md:text-blue-900 mb-2 animate-fade-in-up text-center md:text-left">Customer Tracker</h2>
        <p className="text-slate-500 mb-8 italic animate-fade-in-up delay-100 text-center md:text-left">Log every prospect. Follow up on every door.</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* ADD PROSPECT FORM */}
          <div className="bg-slate-900 md:bg-white p-6 rounded-3xl shadow-lg border border-slate-800 md:border-slate-200 animate-fade-in-up delay-100 transition-all duration-300 hover:shadow-xl sticky top-4 md:top-10 h-fit">
            <h3 className="font-black text-blue-400 md:text-blue-900 mb-4 text-sm uppercase tracking-widest flex items-center gap-2">
              <i className="fas fa-plus-circle"></i> Add Prospect
            </h3>
            <form onSubmit={handleAdd} className="space-y-3">
              {[
                { field: 'name', placeholder: 'Full Name', type: 'text' },
                { field: 'address', placeholder: 'Address', type: 'text' },
                { field: 'phone', placeholder: 'Phone (optional)', type: 'text' },
                { field: 'email', placeholder: 'Email (optional)', type: 'email' },
              ].map(({ field, placeholder, type }) => (
                <input
                  key={field}
                  type={type}
                  placeholder={placeholder}
                  value={form[field]}
                  onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                  className="w-full border border-slate-700 md:border-slate-200 bg-slate-950 md:bg-white rounded-xl px-4 py-3 text-sm font-medium text-white md:text-slate-900 outline-none focus:border-blue-500 transition-colors"
                />
              ))}
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full border border-slate-700 md:border-slate-200 bg-slate-950 md:bg-white rounded-xl px-4 py-3 text-sm font-bold text-white md:text-slate-900 outline-none focus:border-blue-500 transition-colors cursor-pointer"
              >
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
              <textarea
                placeholder="Notes (optional)"
                rows={2}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full border border-slate-700 md:border-slate-200 bg-slate-950 md:bg-white rounded-xl px-4 py-3 text-sm font-medium text-white md:text-slate-900 outline-none focus:border-blue-500 resize-none transition-colors"
              />
              {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
              <button type="submit" className="w-full bg-blue-600 md:bg-blue-900 text-white font-black py-3 rounded-xl hover:bg-blue-500 md:hover:bg-blue-800 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1">
                Add Prospect
              </button>
            </form>
          </div>

          {/* PROSPECT LIST */}
          <div className="lg:col-span-2 animate-fade-in-up delay-200">
            
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-6">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 transform active:scale-95 ${filter === f ? 'bg-blue-600 md:bg-blue-900 text-white shadow-md' : 'bg-slate-900 md:bg-white text-slate-400 md:text-slate-600 border border-slate-800 md:border-slate-200 hover:bg-slate-800 md:hover:bg-slate-100 hover:-translate-y-0.5'}`}
                >
                  {f}
                </button>
              ))}
            </div>

            {visible.length === 0 && (
              <div className="bg-slate-900 md:bg-slate-100 border border-slate-800 md:border-slate-200 rounded-3xl p-12 text-center animate-fade-in-up">
                <i className="fas fa-users-slash text-4xl text-slate-700 md:text-slate-300 mb-4"></i>
                <p className="text-slate-400 md:text-slate-500 font-medium">
                  {prospects.length === 0 ? 'Your pipeline is empty. Add your first prospect!' : 'No prospects in this category.'}
                </p>
              </div>
            )}

            <div className="space-y-3">
              {visible.map((p, index) => (
                <div 
                  key={p.id} 
                  style={{ animationFillMode: 'both', animationDelay: `${index * 50}ms` }}
                  className="bg-slate-900 md:bg-white border border-slate-800 md:border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-blue-500 md:hover:border-blue-300 group animate-fade-in-up"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-black text-white md:text-blue-900 text-base group-hover:text-blue-400 md:group-hover:text-blue-700 transition-colors">{p.name}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[p.status] || ''}`}>{p.status}</span>
                    </div>
                    {p.address && <p className="text-xs text-slate-400 md:text-slate-500 mt-1">📍 {p.address}</p>}
                    {p.phone && <p className="text-xs text-slate-400 md:text-slate-500">📞 {p.phone}</p>}
                    {p.email && <p className="text-xs text-slate-400 md:text-slate-500">✉️ {p.email}</p>}
                    {p.notes && <p className="text-xs text-slate-300 md:text-slate-400 italic mt-2 bg-slate-950 md:bg-slate-50 p-2 rounded-lg border border-slate-800 md:border-slate-100">{p.notes}</p>}
                    <p className="text-[10px] text-slate-500 md:text-slate-400 mt-2 font-medium uppercase tracking-wider">{new Date(p.created_at).toLocaleDateString('en-CA')}</p>
                  </div>
                  
                  <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0 mt-3 sm:mt-0">
                    <select
                      value={p.status}
                      onChange={(e) => updateStatus(p.id, e.target.value)}
                      className="border border-slate-700 md:border-slate-200 rounded-lg px-2 py-1 text-xs font-bold outline-none bg-slate-950 md:bg-slate-50 text-white md:text-slate-800 hover:bg-slate-800 md:hover:bg-white focus:border-blue-500 transition-colors cursor-pointer"
                    >
                      {STATUSES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                    
                    <div className="flex items-center gap-2 mt-auto">
                      <button 
                        onClick={() => handleGenerateContract(p)} 
                        className="bg-blue-900/30 md:bg-blue-50 text-blue-400 md:text-blue-900 border border-blue-800 md:border-blue-100 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-600 hover:text-white transition-colors shadow-sm flex items-center gap-1"
                      >
                        <i className="fas fa-file-signature"></i> Contract
                      </button>
                      
                      <button onClick={() => remove(p.id)} className="bg-red-900/30 md:bg-red-50 text-red-400 border border-red-800 md:border-transparent hover:bg-red-600 md:hover:bg-red-500 hover:text-white transition-colors px-2 py-1.5 rounded-lg">
                        <i className="fas fa-trash text-xs"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}