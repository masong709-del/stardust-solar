import { useState } from 'react'

const HOOKS = [
  { value: "Hey, I'm just stopping by because we're doing some installs for your neighbors down the street...", label: 'The Neighbor Hook (Social Proof)' },
  { value: "Did you see the recent Hydro One rate hike notice for the area? It's hitting everyone pretty hard.", label: 'The Utility Hike (Pain Point)' },
  { value: "I'm with Stardust—we're checking which roofs in Temiskaming actually qualify for the federal solar rebates.", label: 'The Qualifying Hook (Curiosity)' },
]
const TRANSITIONS = [
  { value: "Since you have great sun exposure, you're essentially overpaying for power you could be making for $0 down...", label: 'Ownership Angle' },
  { value: "Most people on this street are tired of renting their power and want to lock in a fixed rate instead...", label: 'Inflation Protection' },
]
const CLOSES = [
  { value: "I'm not here to sell you anything today, I just want to see if your house even qualifies. Do you have 5 minutes tomorrow?", label: 'The "Qualify" Close' },
  { value: "I'll be back in the area around 5:00. Would it make sense to show you what your roof can actually generate?", label: 'The "Time-Gap" Close' },
]

function getAdvice(hook, close) {
  const advice = []
  if (hook.includes('neighbor')) advice.push({ color: 'green', text: "The Neighbor Hook builds 'Social Proof' instantly. This is our highest converting opener." })
  if (hook.includes('Hydro One')) advice.push({ color: 'blue', text: "Using a common enemy (Hydro One) creates an instant bond with the homeowner." })
  if (close.includes('not here to sell')) advice.push({ color: 'yellow', text: "Warning: Homeowners know you're selling. Pivot to 'I'm just the surveyor' to lower pressure." })
  return advice
}

const BORDER = { green: 'border-green-500 text-green-300', blue: 'border-blue-400 text-blue-300', yellow: 'border-yellow-500 text-yellow-200' }

export default function ScriptBuilder() {
  const [hook, setHook] = useState('')
  const [trans, setTrans] = useState('')
  const [close, setClose] = useState('')
  const [savedScripts, setSavedScripts] = useState(() => JSON.parse(localStorage.getItem('solarSavedScripts') || '[]'))

  const script = [hook, trans, close].filter(Boolean).join(' ')
  const advice = hook || close ? getAdvice(hook, close) : []

  function saveScript() {
    if (!script) { alert('Build a script first.'); return }
    const name = window.prompt('Name this script (e.g. "Neighbor Hook + Qualify Close"):')
    if (!name?.trim()) return
    const updated = [...savedScripts, { name: name.trim(), script }]
    setSavedScripts(updated)
    localStorage.setItem('solarSavedScripts', JSON.stringify(updated))
  }

  function deleteScript(idx) {
    const updated = savedScripts.filter((_, i) => i !== idx)
    setSavedScripts(updated)
    localStorage.setItem('solarSavedScripts', JSON.stringify(updated))
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-7 bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
        <h2 className="text-2xl font-black text-blue-900 mb-6">Interactive D2D Script Builder</h2>
        <div className="space-y-6">
          {[
            { label: '1. The Hook (The Opener)', value: hook, set: setHook, options: HOOKS },
            { label: '2. The Transition (The "Why")', value: trans, set: setTrans, options: TRANSITIONS },
            { label: '3. The Soft Close (The Appointment)', value: close, set: setClose, options: CLOSES },
          ].map(({ label, value, set, options }) => (
            <div key={label}>
              <label className="block text-xs font-black text-blue-900 uppercase mb-2">{label}</label>
              <select
                value={value}
                onChange={(e) => set(e.target.value)}
                className="w-full p-4 border-2 border-slate-100 rounded-xl bg-slate-50 focus:border-yellow-400 outline-none transition"
              >
                <option value="">-- Choose --</option>
                {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          ))}

          <div className="mt-8 p-6 bg-blue-900 text-yellow-400 rounded-xl shadow-inner border-b-4 border-blue-950">
            <h4 className="text-[10px] uppercase font-black text-blue-300 mb-2">Live Script Preview:</h4>
            <p className="text-white italic text-lg leading-relaxed">{script ? `"${script}"` : 'Select options above...'}</p>
          </div>
          <div className="flex justify-end">
            <button onClick={saveScript} className="px-5 py-2 bg-yellow-400 text-blue-900 font-black rounded-xl text-sm hover:bg-yellow-300 transition shadow">
              🔖 Save Script
            </button>
          </div>

          {savedScripts.length > 0 && (
            <div className="mt-2 border-t border-slate-100 pt-5">
              <h4 className="text-xs font-black uppercase text-blue-900 tracking-wider mb-3">🔖 Saved Scripts</h4>
              <div className="space-y-3">
                {savedScripts.map((s, i) => (
                  <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3">
                    <div className="flex-1">
                      <p className="text-xs font-black text-blue-900 mb-1">{s.name}</p>
                      <p className="text-sm text-slate-600 italic leading-relaxed">{s.script}</p>
                    </div>
                    <button onClick={() => deleteScript(i)} className="text-slate-400 hover:text-red-500 transition shrink-0">✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="lg:col-span-5">
        <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-xl border-t-4 border-green-500 sticky top-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <h3 className="font-bold text-yellow-400 uppercase tracking-widest text-sm">Stardust AI Coach</h3>
          </div>
          <div className="text-slate-300 space-y-4 text-sm leading-relaxed">
            {advice.length > 0 ? advice.map((a, i) => (
              <div key={i} className={`p-3 border-l-2 ${BORDER[a.color]} bg-opacity-20 italic`}>
                <b>AI COACH:</b> {a.text}
              </div>
            )) : (
              <p>Waiting for you to build a script... I'll analyze your tone and "close" effectiveness.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
