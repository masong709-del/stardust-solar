import { useState } from 'react'
import { Copy, Save, Trash2, Bot, CheckCircle2 } from 'lucide-react'

// EXPANDED OPTIONS
const HOOKS = [
  { value: "Hey, I'm just stopping by because we're doing some installs for your neighbors down the street...", label: 'The Neighbor Hook (Social Proof)' },
  { value: "Did you see the recent Hydro One rate hike notice for the area? It's hitting everyone pretty hard.", label: 'The Utility Hike (Pain Point)' },
  { value: "I'm with Stardust—we're checking which roofs in Temiskaming actually qualify for the federal solar rebates.", label: 'The Qualifying Hook (Curiosity)' },
  { value: "Quick question for you—have you already opted into the new net-metering program, or are you still on the standard tier rates?", label: 'The Direct Question (Authority)' },
]
const TRANSITIONS = [
  { value: "Since you have great sun exposure, you're essentially overpaying for power you could be making for $0 down...", label: 'Ownership Angle' },
  { value: "Most people on this street are tired of renting their power and want to lock in a fixed rate instead...", label: 'Inflation Protection' },
  { value: "Instead of paying Hydro One forever, we are just swapping that exact same bill for an asset that pays itself off...", label: 'The Bill Swap' },
]
const CLOSES = [
  { value: "I'm not here to sell you anything today, I just want to see if your house even qualifies. Do you have 5 minutes tomorrow?", label: 'The "Qualify" Close' },
  { value: "I'll be back in the area around 5:00. Would it make sense to show you what your roof can actually generate?", label: 'The "Time-Gap" Close' },
  { value: "All I need is a picture of your hydro bill to build the report. Grab that really quick and I'll show you the math.", label: 'The "Action" Close (Direct)' },
]

function getAdvice(hook, close) {
  const advice = []
  if (hook.includes('neighbor')) advice.push({ color: 'green', text: "The Neighbor Hook builds 'Social Proof' instantly. This is our highest converting opener." })
  if (hook.includes('Hydro One')) advice.push({ color: 'blue', text: "Using a common enemy (Hydro One) creates an instant bond with the homeowner." })
  if (hook.includes('net-metering')) advice.push({ color: 'blue', text: "The Direct Question assumes they should already know about this, triggering FOMO." })
  if (close.includes('not here to sell')) advice.push({ color: 'yellow', text: "Warning: Homeowners know you're selling. Pivot to 'I'm just the surveyor' to lower pressure." })
  if (close.includes('grab that really quick')) advice.push({ color: 'green', text: "Strong direct close. Tell them what to do, don't ask for permission." })
  return advice
}

const BORDER = { 
  green: 'border-green-500 text-green-300 bg-green-900/20', 
  blue: 'border-blue-400 text-blue-300 bg-blue-900/20', 
  yellow: 'border-yellow-500 text-yellow-200 bg-yellow-900/20' 
}

export default function ScriptBuilder() {
  const [hook, setHook] = useState('')
  const [trans, setTrans] = useState('')
  const [close, setClose] = useState('')
  const [savedScripts, setSavedScripts] = useState(() => JSON.parse(localStorage.getItem('solarSavedScripts') || '[]'))
  const [copied, setCopied] = useState(false)

  const script = [hook, trans, close].filter(Boolean).join(' ')
  const advice = hook || close ? getAdvice(hook, close) : []

  function saveScript() {
    if (!script) { alert('Build a script first.'); return }
    const name = window.prompt('Name this script (e.g. "Neighbor Hook + Qualify Close"):')
    if (!name?.trim()) return
    const updated = [{ name: name.trim(), script }, ...savedScripts] // Add to top of list
    setSavedScripts(updated)
    localStorage.setItem('solarSavedScripts', JSON.stringify(updated))
  }

  function deleteScript(idx) {
    const updated = savedScripts.filter((_, i) => i !== idx)
    setSavedScripts(updated)
    localStorage.setItem('solarSavedScripts', JSON.stringify(updated))
  }

  function handleCopy() {
    if (!script) return
    navigator.clipboard.writeText(script)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto pb-12">
      
      {/* LEFT COLUMN: Builder */}
      <div className="lg:col-span-7 animate-fade-in-up">
        <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-200 transition-all duration-300 hover:shadow-xl">
          <h2 className="text-3xl font-black text-blue-900 mb-2">D2D Script Builder</h2>
          <p className="text-slate-500 mb-8 italic">Mix and match hooks and closes to find your flow.</p>

          <div className="space-y-6">
            {[
              { label: '1. The Hook (The Opener)', value: hook, set: setHook, options: HOOKS },
              { label: '2. The Transition (The "Why")', value: trans, set: setTrans, options: TRANSITIONS },
              { label: '3. The Soft Close (The Appointment)', value: close, set: setClose, options: CLOSES },
            ].map(({ label, value, set, options }) => (
              <div key={label} className="group">
                <label className="block text-xs font-black text-blue-900 uppercase mb-2 group-hover:text-yellow-500 transition-colors">{label}</label>
                <select
                  value={value}
                  onChange={(e) => set(e.target.value)}
                  className="w-full p-4 border-2 border-slate-100 rounded-xl bg-slate-50 focus:border-yellow-400 focus:bg-white focus:shadow-md outline-none transition-all duration-300 cursor-pointer"
                >
                  <option value="">-- Choose your phrasing --</option>
                  {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            ))}

            {/* Live Preview Area */}
            <div className="mt-8 relative transition-all duration-500">
              <div className="p-6 bg-slate-900 text-yellow-400 rounded-2xl shadow-inner border-t-4 border-yellow-400">
                <h4 className="text-[10px] uppercase font-black text-slate-400 mb-3 tracking-widest flex items-center gap-2">
                  <i className="fas fa-microphone-alt"></i> Live Script Preview
                </h4>
                <p className="text-white font-medium text-lg leading-relaxed min-h-[80px]">
                  {script ? `"${script}"` : <span className="text-slate-600 italic">Select options above to build your pitch...</span>}
                </p>
              </div>
              
              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-4">
                <button 
                  onClick={handleCopy} 
                  disabled={!script}
                  className="px-5 py-2.5 bg-white border-2 border-slate-200 text-slate-600 font-bold rounded-xl text-sm hover:bg-slate-50 hover:border-slate-300 hover:text-blue-900 transition-all duration-300 shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
                >
                  {copied ? <><CheckCircle2 size={16} className="text-green-500"/> Copied!</> : <><Copy size={16}/> Copy Script</>}
                </button>
                <button 
                  onClick={saveScript} 
                  disabled={!script}
                  className="px-5 py-2.5 bg-yellow-400 text-blue-900 font-black rounded-xl text-sm hover:bg-yellow-300 transition-all duration-300 shadow-sm hover:shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 hover:-translate-y-0.5"
                >
                  <Save size={16} /> Save Script
                </button>
              </div>
            </div>

            {/* Saved Scripts Gallery */}
            {savedScripts.length > 0 && (
              <div className="mt-8 border-t border-slate-100 pt-8 animate-fade-in-up">
                <h4 className="text-xs font-black uppercase text-blue-900 tracking-wider mb-4 flex items-center gap-2">
                  <Save size={14} className="text-yellow-500"/> Saved Scripts Library
                </h4>
                <div className="space-y-3">
                  {savedScripts.map((s, i) => (
                    <div 
                      key={i} 
                      style={{ animationDelay: `${i * 100}ms` }}
                      className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group transition-all duration-300 hover:shadow-md hover:border-blue-300 hover:bg-white animate-fade-in-up"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-black text-blue-900 mb-1">{s.name}</p>
                        <p className="text-xs text-slate-500 italic line-clamp-2">"{s.script}"</p>
                      </div>
                      <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => { navigator.clipboard.writeText(s.script); alert('Copied!') }} 
                          className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                          title="Copy"
                        >
                          <Copy size={14} />
                        </button>
                        <button 
                          onClick={() => deleteScript(i)} 
                          className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: AI Coach */}
      <div className="lg:col-span-5 animate-fade-in-up delay-200">
        <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-2xl border-t-4 border-green-500 sticky top-10 transition-all duration-500 hover:shadow-green-500/20">
          <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-800">
            <div className="relative">
              <Bot size={28} className="text-green-400" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-breathe shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
            </div>
            <div>
              <h3 className="font-black text-white uppercase tracking-widest text-lg">Stardust AI Coach</h3>
              <p className="text-[10px] text-green-400 font-bold uppercase tracking-wider mt-0.5">Live Pitch Analysis</p>
            </div>
          </div>
          
          <div className="space-y-4 text-sm leading-relaxed">
            {advice.length > 0 ? advice.map((a, i) => (
              <div 
                key={i} 
                className={`p-4 rounded-xl border-l-4 ${BORDER[a.color]} shadow-lg animate-fade-in-up transition-all duration-300 hover:translate-x-1`}
              >
                <p className="font-bold text-white mb-1 flex items-center gap-2">
                  <i className="fas fa-lightbulb"></i> Analysis:
                </p>
                <p className="text-slate-200">{a.text}</p>
              </div>
            )) : (
              <div className="text-center p-8 border-2 border-dashed border-slate-700 rounded-2xl animate-pulse">
                <p className="text-slate-400 font-medium">Waiting for you to build a script... I'll analyze your tone and "close" effectiveness.</p>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  )
}