import { useState } from 'react'

const fmt = (n) => '$' + Math.round(n).toLocaleString('en-CA')

export default function EstimateBuilder() {
  const [size, setSize] = useState(10)
  const [offGrid, setOffGrid] = useState(false)
  const [panelType, setPanelType] = useState('longi')   // 'longi' | 'ja'
  const [mounting, setMounting] = useState('roof')       // 'roof' | 'ground'
  const [pitch, setPitch] = useState('standard')         // 'standard' | 'steep' | 'extreme'
  const [battery, setBattery] = useState(false)
  const [inverter, setInverter] = useState('micro')      // 'micro' | 'pw3' | 'eg4'

  // Conditional logic
  const effectiveBattery = offGrid ? true : battery
  const effectiveInverter = offGrid ? 'eg4' : (!effectiveBattery ? 'micro' : inverter)
  const showPitch = mounting === 'roof'

  // Pricing
  const baseHardwareLabour = size * 1000 * 2.10
  const flatFee = 6000
  const panelAdder = panelType === 'ja' ? 100 * size : 0
  const groundAdder = mounting === 'ground' ? 1000 + 700 * size : 0
  const pitchAdder = showPitch ? (pitch === 'steep' ? 1000 : pitch === 'extreme' ? 2000 : 0) : 0
  const batteryAdder = effectiveBattery ? (effectiveInverter === 'pw3' ? 28000 : effectiveInverter === 'eg4' ? 18500 : 0) : 0

  const turnkey = baseHardwareLabour + flatFee + panelAdder
  const siteAdder = groundAdder + pitchAdder
  const total = turnkey + siteAdder + batteryAdder
  const cpw = (total / (size * 1000)).toFixed(2)

  function handleOffGrid(val) {
    setOffGrid(val)
    if (val) { setBattery(true); setInverter('eg4') }
  }
  function handleBattery(val) {
    setBattery(val)
    if (!val) setInverter('micro')
  }
  function handleInverter(val) {
    if (val === 'pw3' || val === 'eg4') setBattery(true)
    setInverter(val)
  }

  const TOGGLE = 'px-4 py-2 text-sm font-black rounded-lg transition'
  const active = `${TOGGLE} bg-blue-900 text-white`
  const inactive = `${TOGGLE} bg-slate-100 text-slate-600 hover:bg-slate-200`

  return (
    <div className="max-w-5xl mx-auto">
      <h2 className="text-4xl font-black text-blue-900 mb-2">Estimate Builder</h2>
      <p className="text-slate-500 mb-8 italic">Configure the system and get a real-time installation price — before tax &amp; rebates.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Inputs */}
        <div className="space-y-6">

          {/* System Size */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">System Size (kW DC)</p>
            <div className="flex items-center gap-4">
              <input
                type="range" min={4} max={20} step={0.5}
                value={size}
                onChange={e => setSize(parseFloat(e.target.value))}
                className="flex-1 accent-blue-900"
              />
              <span className="text-2xl font-black text-blue-900 w-20 text-right">{size} kW</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">{(size * 1000).toLocaleString()} watts DC</p>
          </div>

          {/* System Type */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">System Type</p>
            <div className="flex gap-2">
              <button onClick={() => handleOffGrid(false)} className={!offGrid ? active : inactive}>Grid-Tied + Net Metering</button>
              <button onClick={() => handleOffGrid(true)} className={offGrid ? active : inactive}>Off-Grid Standalone</button>
            </div>
          </div>

          {/* Panel Type */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Panel Type</p>
            <div className="flex gap-2">
              <button onClick={() => setPanelType('longi')} className={panelType === 'longi' ? active : inactive}>Longi LR8 Standard</button>
              <button onClick={() => setPanelType('ja')} className={panelType === 'ja' ? active : inactive}>
                JA Solar 500W <span className="font-normal text-xs ml-1">(+$100/kW)</span>
              </button>
            </div>
          </div>

          {/* Mounting */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Mounting Type</p>
            <div className="flex gap-2">
              <button onClick={() => setMounting('roof')} className={mounting === 'roof' ? active : inactive}>Roof Mount</button>
              <button onClick={() => setMounting('ground')} className={mounting === 'ground' ? active : inactive}>
                Ground Mount <span className="font-normal text-xs ml-1">(+$1K eng. + $700/kW)</span>
              </button>
            </div>
          </div>

          {/* Roof Pitch */}
          {showPitch && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Roof Pitch Difficulty</p>
              <div className="flex gap-2 flex-wrap">
                {[
                  { val: 'standard', label: 'Standard' },
                  { val: 'steep', label: 'Steep (+$1,000)' },
                  { val: 'extreme', label: 'Extreme (+$2,000)' },
                ].map(({ val, label }) => (
                  <button key={val} onClick={() => setPitch(val)} className={pitch === val ? active : inactive}>{label}</button>
                ))}
              </div>
            </div>
          )}

          {/* Battery */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Battery Storage</p>
            <div className="flex gap-2 mb-4">
              <button onClick={() => handleBattery(false)} disabled={offGrid} className={!effectiveBattery ? active : inactive + ' disabled:opacity-40'}>No</button>
              <button onClick={() => handleBattery(true)} className={effectiveBattery ? active : inactive}>Yes</button>
            </div>
            {effectiveBattery && (
              <>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Inverter / Storage Architecture</p>
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => handleInverter('micro')} disabled={offGrid} className={(effectiveInverter === 'micro' ? active : inactive) + ' disabled:opacity-40'}>Microinverters</button>
                  <button onClick={() => handleInverter('pw3')} disabled={offGrid} className={(effectiveInverter === 'pw3' ? active : inactive) + ' disabled:opacity-40'}>
                    Tesla PW3 <span className="font-normal text-xs ml-1">(+$28K)</span>
                  </button>
                  <button onClick={() => handleInverter('eg4')} className={effectiveInverter === 'eg4' ? active : inactive}>
                    EG4 Off-Grid <span className="font-normal text-xs ml-1">(+$18.5K)</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right: Quote Summary */}
        <div>
          <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-xl sticky top-8">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-6">Quote Summary</p>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center py-2 border-b border-slate-700">
                <span className="text-sm text-slate-300">System Size</span>
                <span className="font-black text-white">{size} kW DC</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-700">
                <span className="text-sm text-slate-300">Turnkey Installation</span>
                <span className="font-black text-white">{fmt(turnkey)}</span>
              </div>
              {effectiveBattery && batteryAdder > 0 && (
                <div className="flex justify-between items-center py-2 border-b border-slate-700">
                  <span className="text-sm text-slate-300">
                    Storage Upgrade ({effectiveInverter === 'pw3' ? 'Tesla PW3' : 'EG4 Off-Grid'})
                  </span>
                  <span className="font-black text-yellow-400">{fmt(batteryAdder)}</span>
                </div>
              )}
              {siteAdder > 0 && (
                <div className="flex justify-between items-center py-2 border-b border-slate-700">
                  <span className="text-sm text-slate-300">Site Difficulty Adder</span>
                  <span className="font-black text-yellow-400">{fmt(siteAdder)}</span>
                </div>
              )}
            </div>

            <div className="bg-blue-900 rounded-xl p-5 text-center mb-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-blue-300 mb-1">Total System Price</p>
              <p className="text-5xl font-black text-white">{fmt(total)}</p>
              <p className="text-sm text-blue-300 mt-1">${cpw}/W installed</p>
            </div>

            <p className="text-[10px] text-slate-500 text-center uppercase tracking-widest">Before Tax &amp; Rebates</p>

            {/* Config summary badges */}
            <div className="flex flex-wrap gap-2 mt-6">
              {[
                offGrid ? 'Off-Grid' : 'Grid-Tied',
                panelType === 'ja' ? 'JA Solar 500W' : 'Longi LR8',
                mounting === 'ground' ? 'Ground Mount' : 'Roof Mount',
                showPitch && pitch !== 'standard' ? pitch.charAt(0).toUpperCase() + pitch.slice(1) + ' Pitch' : null,
                effectiveBattery ? (effectiveInverter === 'pw3' ? 'Tesla PW3' : effectiveInverter === 'eg4' ? 'EG4 Battery' : 'Microinverters') : 'No Battery',
              ].filter(Boolean).map((tag) => (
                <span key={tag} className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-slate-800 text-slate-300 rounded-md">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
