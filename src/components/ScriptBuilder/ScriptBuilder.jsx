import { useState } from 'react'
import { Copy, Save, Trash2, Bot, CheckCircle2, Mic, Edit3, List } from 'lucide-react'

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
  const hLower = hook.toLowerCase()
  const cLower = close.toLowerCase()

  if (hLower.includes('neighbor')) advice.push({ color: 'green', text: "The Neighbor Hook builds 'Social Proof' instantly. This is our highest converting opener." })
  if (hLower.includes('hydro one')) advice.push({ color: 'blue', text: "Using a common enemy (Hydro One) creates an instant bond with the homeowner." })
  if (hLower.includes('net-metering')) advice.push({ color: 'blue', text: "The Direct Question assumes they should already know about this, triggering FOMO." })
  if (cLower.includes('not here to sell')) advice.push({ color: 'yellow', text: "Warning: Homeowners know you're selling. Pivot to 'I'm just the surveyor' to lower pressure." })
  if (cLower.includes('grab that')) advice.push({ color: 'green', text: "Strong direct close. Tell them what to do, don't ask for permission." })
  
  // Custom text feedback
  if (hLower.includes('just looking') || cLower.includes('maybe')) advice.push({ color: 'yellow', text: "Careful using weak phrasing like 'maybe' or 'just looking'. Stand your ground." })

  return advice
}

// THEME FIX: Responsive AI Coach colors (Mobile Dark / Desktop Light)
const BORDER = { 
  green: 'border-green-500 md:border-green-500 text-green-300 md:text-green-800 bg-green-900/20 md:bg-green-50', 
  blue: 'border-blue-500 md:border-blue-400 text-blue-300 md:text-blue-800 bg-blue-900/20 md:bg-blue-50', 
  yellow: 'border-yellow-500 md:border-yellow-500 text-yellow-300 md:text-yellow-800 bg-yellow-900/20 md:bg-yellow-50' 
}

export default function ScriptBuilder() {
  const [hook, setHook] = useState('')
  const [trans, setTrans] = useState('')
  const [close, setClose] = useState('')
  
  const [isCustomHook, setIsCustomHook] = useState(false)
  const [isCustomTrans, setIsCustomTrans] = useState(false)
  const [isCustomClose, setIsCustomClose] = useState(false)

  const [savedScripts, setSavedScripts] = useState(() => JSON.parse(localStorage.getItem('solarSavedScripts') || '[]'))
  const [copied, setCopied] = useState(false)

  const script = [hook, trans, close].filter(Boolean).join(' ')
  const advice = hook || close ? getAdvice(hook, close) : []

  function saveScript() {
    if (!script) { alert('Build a script first.'); return }
    const name = window.prompt('Name this script (e.g. "Neighbor Hook + Qualify Close"):')
    if (!name?.trim()) return
    const updated = [{ name: name.trim(), script }, ...savedScripts]
    setSavedScripts(updated)
    localStorage.setItem('solarSavedScripts', JSON.stringify(updated))
  }

  function handlePracticeNow() {
    if (!script) return
    // Bypasses the manual naming by saving a temporary draft so AudioDriller can read it instantly
    const practiceScript = { name: "🔥 Quick Practice (Unsaved)", script }
    const updated = [practiceScript, ...savedScripts.filter(s => s.name !== "🔥 Quick Practice (Unsaved)")]
    setSavedScripts(updated)
    localStorage.setItem('solarSavedScripts', JSON.stringify(updated))
    alert("Sent to Audio Driller! Switch over to your Driller tab to practice.")
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

  const sections = [
    { label: '1. The Hook (The Opener)', value: hook, set: setHook, options: HOOKS, isCustom: isCustomHook, setIsCustom: setIsCustomHook },
    { label: '2. The Transition (The "Why")', value: trans, set: setTrans, options: TRANSITIONS, isCustom: isCustomTrans, setIsCustom: setIsCustomTrans },
    { label: '3. The Soft Close (The Appointment)', value: close, set: setClose, options: CLOSES, isCustom: isCustomClose, setIsCustom: setIsCustomClose },
  ]

  return (
    /* BREAKOUT FIX: 
       Mobile: fixed inset-0, overflow-y-auto, bg-slate-950 (Dark Edge-to-Edge)
       Desktop: relative, md:inset-auto, bg-slate-50 (Light, left-aligned)
    */
    <div className="fixed inset-0 overflow-y-auto bg-slate-950 text-slate-300 md:relative md:inset-auto md:bg-slate-50 md:text-slate-800 font-sans transition-colors duration-300">
      
      {/* CONTAINER: Clean padding and max-width for desktop */}
      <div className="w-full min-h-screen p-4 md:p-8 lg:p-12 pb-32 md:max-w-7xl md:mx-0">

        <h2 className="text-4xl font-black text-white md:text-blue-900 mb-2 animate-fade-in-up text-center md:text-left">D2D Script Builder</h2>
        <p className="text-slate-400 md:text-slate-500 mb-8 italic animate-fade-in-up delay-100 text-center md:text-left">Mix and match hooks and closes to find your flow.</p>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Builder */}
          <div className="lg:col-span-7 animate-fade-in-up">
            <div className="bg-slate-900 md:bg-white p-6 md:p-8 rounded-3xl shadow-lg border border-slate-800 md:border-slate-200 transition-all duration-300 md:hover:shadow-xl">
              
              <div className="space-y-8">
                {sections.map(({ label, value, set, options, isCustom, setIsCustom }) => (
                  <div key={label} className="group">
                    <div className="flex justify-between items-center mb-3">
                      <label className="text-xs font-black text-white md:text-blue-900 uppercase group-hover:text-yellow-400 md:group-hover:text-yellow-500 transition-colors">{label}</label>
                      <button 
                        onClick={() => setIsCustom(!isCustom)}
                        className="text-[10px] uppercase font-bold text-blue-400 md:text-blue-600 hover:text-blue-300 md:hover:text-blue-800 flex items-center gap-1 transition-colors bg-slate-800 md:bg-blue-50 px-3 py-1.5 rounded-lg border border-slate-700 md:border-blue-100"
                      >
                        {isCustom ? <><List size={12}/> Use Presets</> : <><Edit3 size={12}/> Write Custom</>}
                      </button>
                    </div>
                    
                    {isCustom ? (
                      <textarea
                        value={value}
                        onChange={(e) => set(e.target.value)}
                        placeholder="Type your custom phrasing here..."
                        className="w-full p-4 border-2 border-slate-700 md:border-slate-200 rounded-xl bg-slate-950 md:bg-slate-50 focus:border-yellow-400 md:focus:border-yellow-400 focus:bg-slate-900 md:focus:bg-white focus:shadow-md outline-none transition-all duration-300 min-h-[120px] resize-y text-white md:text-slate-700"
                      />
                    ) : (
                      <select
                        value={value}
                        onChange={(e) => set(e.target.value)}
                        className="w-full p-4 border-2 border-slate-700 md:border-slate-100 rounded-xl bg-slate-950 md:bg-slate-50 focus:border-yellow-400 md:focus:border-yellow-400 focus:bg-slate-900 md:focus:bg-white focus:shadow-md outline-none transition-all duration-300 cursor-pointer text-white md:text-slate-700"
                      >
                        <option value="">-- Choose your phrasing --</option>
                        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    )}
                  </div>
                ))}

                {/* Live Preview Area - Remains dark on desktop for high contrast */}
                <div className="mt-8 relative transition-all duration-500">
                  <div className="p-6 bg-slate-950 md:bg-slate-900 text-yellow-400 rounded-2xl shadow-inner border-t-4 border-yellow-400 border border-slate-800 md:border-transparent">
                    <h4 className="text-[10px] uppercase font-black text-slate-500 md:text-slate-400 mb-3 tracking-widest flex items-center gap-2">
                      <i className="fas fa-microphone-alt"></i> Live Script Preview
                    </h4>
                    <p className="text-white font-medium text-lg md:text-xl leading-relaxed min-h-[80px]">
                      {script ? `"${script}"` : <span className="text-slate-600 md:text-slate-500 italic">Select options above to build your pitch...</span>}
                    </p>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row justify-end gap-3 mt-4">
                    <button 
                      onClick={handleCopy} 
                      disabled={!script}
                      className="w-full sm:w-auto px-5 py-3 md:py-2.5 bg-slate-800 md:bg-white border-2 border-slate-700 md:border-slate-200 text-white md:text-slate-600 font-bold rounded-xl text-sm hover:bg-slate-700 md:hover:bg-slate-50 hover:border-slate-600 md:hover:border-slate-300 md:hover:text-blue-900 transition-all duration-300 shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
                    >
                      {copied ? <><CheckCircle2 size={16} className="text-green-500"/> Copied!</> : <><Copy size={16}/> Copy</>}
                    </button>
                    <button 
                      onClick={saveScript} 
                      disabled={!script}
                      className="w-full sm:w-auto px-5 py-3 md:py-2.5 bg-blue-900/30 md:bg-blue-50 text-blue-400 md:text-blue-900 border-2 border-blue-800 md:border-blue-100 font-bold rounded-xl text-sm hover:bg-blue-800 md:hover:bg-blue-100 md:hover:border-blue-200 hover:text-white md:hover:text-blue-900 transition-all duration-300 shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
                    >
                      <Save size={16} /> Save 
                    </button>
                    <button 
                      onClick={handlePracticeNow} 
                      disabled={!script}
                      className="w-full sm:w-auto px-6 py-3 md:py-2.5 bg-yellow-500 md:bg-yellow-400 text-slate-900 md:text-blue-900 font-black rounded-xl text-sm hover:bg-yellow-400 md:hover:bg-yellow-300 transition-all duration-300 shadow-sm hover:shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 hover:-translate-y-0.5"
                    >
                      <Mic size={16} /> Practice Now
                    </button>
                  </div>
                </div>

                {/* Saved Scripts Gallery */}
                {savedScripts.length > 0 && (
                  <div className="mt-8 border-t border-slate-800 md:border-slate-100 pt-8 animate-fade-in-up">
                    <h4 className="text-xs font-black uppercase text-white md:text-blue-900 tracking-wider mb-4 flex items-center gap-2">
                      <Save size={14} className="text-yellow-500"/> Saved Scripts Library
                    </h4>
                    <div className="space-y-3">
                      {savedScripts.map((s, i) => (
                        <div 
                          key={i} 
                          style={{ animationDelay: `${i * 100}ms` }}
                          className="bg-slate-950 md:bg-slate-50 border border-slate-800 md:border-slate-200 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group transition-all duration-300 md:hover:shadow-md md:hover:border-blue-300 hover:border-blue-500 md:hover:bg-white animate-fade-in-up"
                        >
                          <div className="flex-1">
                            <p className="text-sm font-black text-white md:text-blue-900 mb-1 group-hover:text-blue-400 md:group-hover:text-blue-700 transition-colors">
                              {s.name} {s.name.includes("Quick Practice") && "⏱️"}
                            </p>
                            <p className="text-xs text-slate-400 md:text-slate-500 italic line-clamp-2">"{s.script}"</p>
                          </div>
                          <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => { navigator.clipboard.writeText(s.script); alert('Copied!') }} 
                              className="flex-1 sm:flex-none p-2.5 sm:p-2 bg-blue-900/30 md:bg-blue-50 text-blue-400 md:text-blue-600 rounded-lg hover:bg-blue-800 md:hover:bg-blue-100 hover:text-white transition-colors flex justify-center items-center"
                              title="Copy"
                            >
                              <Copy size={16} className="sm:w-4 sm:h-4" />
                            </button>
                            <button 
                              onClick={() => deleteScript(i)} 
                              className="flex-1 sm:flex-none p-2.5 sm:p-2 bg-red-900/30 md:bg-red-50 text-red-400 md:text-red-500 rounded-lg hover:bg-red-600 md:hover:bg-red-500 hover:text-white transition-colors flex justify-center items-center"
                              title="Delete"
                            >
                              <Trash2 size={16} className="sm:w-4 sm:h-4" />
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
            <div className="bg-slate-900 md:bg-white text-white md:text-slate-800 p-8 rounded-3xl shadow-2xl md:shadow-lg border border-slate-800 md:border-slate-200 border-t-4 border-t-green-500 md:border-t-green-500 sticky top-10 transition-all duration-500 md:hover:shadow-xl">
              <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-800 md:border-slate-100">
                <div className="relative">
                  <Bot size={28} className="text-green-400 md:text-green-500" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-breathe shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
                </div>
                <div>
                  <h3 className="font-black text-white md:text-blue-900 uppercase tracking-widest text-lg">Stardust AI Coach</h3>
                  <p className="text-[10px] text-green-400 md:text-green-600 font-bold uppercase tracking-wider mt-0.5">Live Pitch Analysis</p>
                </div>
              </div>
              
              <div className="space-y-4 text-sm leading-relaxed">
                {advice.length > 0 ? advice.map((a, i) => (
                  <div 
                    key={i} 
                    className={`p-4 rounded-2xl border-l-4 ${BORDER[a.color]} shadow-md md:shadow-sm animate-fade-in-up transition-all duration-300 hover:translate-x-1`}
                  >
                    <p className={`font-bold mb-1 flex items-center gap-2 ${a.color === 'green' ? 'text-green-400 md:text-green-800' : a.color === 'blue' ? 'text-blue-400 md:text-blue-800' : 'text-yellow-400 md:text-yellow-800'}`}>
                      <i className="fas fa-lightbulb"></i> Analysis:
                    </p>
                    <p className={`opacity-90 md:opacity-100 ${a.color === 'green' ? 'text-green-100 md:text-green-900' : a.color === 'blue' ? 'text-blue-100 md:text-blue-900' : 'text-yellow-100 md:text-yellow-900'}`}>{a.text}</p>
                  </div>
                )) : (
                  <div className="text-center p-8 border-2 border-dashed border-slate-700 md:border-slate-300 rounded-2xl animate-pulse bg-slate-950 md:bg-slate-50">
                    <p className="text-slate-500 md:text-slate-400 font-medium">Waiting for you to build a script... I'll analyze your tone and "close" effectiveness.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}