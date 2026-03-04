import { useState, useEffect } from 'react'
import { useAppStore } from '../../store/appStore'

export default function EstimateBuilder() {
  const { setEstimateForContract, setActiveSection } = useAppStore()

  // --- Form State ---
  const [kw, setKw] = useState(10)
  const [sysType, setSysType] = useState('grid')
  const [panel, setPanel] = useState('longi')
  const [mount, setMount] = useState('roof')
  const [pitch, setPitch] = useState('standard')
  const [batteryCount, setBatteryCount] = useState(0)
  const [inverter, setInverter] = useState('micro')

  // --- Saved Estimates State ---
  const [savedEstimates, setSavedEstimates] = useState([])
  const [estimateName, setEstimateName] = useState('')

  useEffect(() => {
    // Load saved estimates from local storage on mount
    const saved = JSON.parse(localStorage.getItem('stardustEstimates') || '[]')
    setSavedEstimates(saved)
  }, [])

  // --- Handlers for Cascading Dropdown Logic ---
  const handleSysTypeChange = (val) => {
    setSysType(val)
    if (val === 'offgrid') {
      if (batteryCount === 0) setBatteryCount(2)
      setInverter('eg4')
    } else {
      if (inverter === 'eg4') {
        setInverter(batteryCount > 0 ? 'pw3' : 'micro')
      }
    }
  }

  const handleBatteryChange = (val) => {
    setBatteryCount(val)
    if (sysType === 'grid') {
      if (val > 0) setInverter('pw3')
      if (val === 0) setInverter('micro')
    }
  }

  const handleInverterChange = (val) => {
    setInverter(val)
    if (sysType === 'grid') {
      if (val === 'pw3' && batteryCount === 0) setBatteryCount(1)
      if (val === 'micro') setBatteryCount(0)
    }
  }

  // --- Quote Calculations ---
  const BASE_PPW = 2100
  const BASE_FEE = 6000
  const JAM_ADDER_PPW = 100
  const GROUND_MOUNT_ENG = 1000
  const GROUND_MOUNT_PPW = 700
  const PITCH_STEEP = 1000
  const PITCH_EXTREME = 2000
  
  const parsedKw = parseFloat(kw) || 0
  const basePrice = (parsedKw * BASE_PPW) + BASE_FEE
  const panelPrice = panel === 'jam' ? (parsedKw * JAM_ADDER_PPW) : 0
  const turnkeyBase = basePrice + panelPrice

  const mountPrice = mount === 'ground' ? (GROUND_MOUNT_ENG + (parsedKw * GROUND_MOUNT_PPW)) : 0
  let pitchPrice = 0
  if (mount === 'roof') { 
    if (pitch === 'steep') pitchPrice = PITCH_STEEP
    if (pitch === 'extreme') pitchPrice = PITCH_EXTREME
  }
  const siteAdders = mountPrice + pitchPrice

  let battPrice = 0
  let battLabel = "Storage Upgrade:"
  let totalKwh = 0

  if (batteryCount > 0) {
    if (inverter === 'pw3') { 
      battPrice = 28000 + ((batteryCount - 1) * 12000)
      battLabel = `Tesla PW3 (${batteryCount}x):`
      totalKwh = batteryCount * 13.5
    } 
    if (inverter === 'eg4') { 
      battPrice = 13500 + ((batteryCount - 1) * 5000)
      battLabel = `EG4 Off-Grid (${batteryCount}x):`
      totalKwh = batteryCount * 14.3
    }
  }

  const total = turnkeyBase + siteAdders + battPrice
  const costPerWatt = parsedKw > 0 ? (total / (parsedKw * 1000)) : 0

  // --- Save & Load Logic ---
  const generateEstimatePayload = () => ({
    id: Date.now(),
    name: estimateName || `Estimate - ${new Date().toLocaleDateString()}`,
    date: new Date().toLocaleDateString(),
    // Raw inputs to reload the form later
    raw: { kw, sysType, panel, mount, pitch, batteryCount, inverter },
    // Formatted outputs for the Contract Generator
    kw: parsedKw,
    mountType: mount === 'roof' ? 'Roof' : 'Ground',
    sysType: sysType === 'grid' ? 'Grid-Tied' : 'Off-grid',
    panel: panel === 'longi' ? 'Longi LR8 500W 54-Cell Bifacial All-black' : 'JA Solar 500W',
    inverter: batteryCount > 0 ? (inverter === 'pw3' ? `${batteryCount}x Tesla Powerwall 3` : `${batteryCount}x EG4 Off-Grid`) : 'Microinverters (Enphase/APS)',
    batteryKwh: totalKwh,
    subTotal: total,
    discount: 0,
  })

  const handleSaveEstimate = () => {
    if (!estimateName.trim()) {
      alert("Please enter a name for this estimate (e.g., 'Smith Residence').")
      return
    }
    const newEst = generateEstimatePayload()
    const updatedEstimates = [...savedEstimates, newEst]
    localStorage.setItem('stardustEstimates', JSON.stringify(updatedEstimates))
    setSavedEstimates(updatedEstimates)
    alert("Estimate Saved Successfully!")
    setEstimateName('')
  }

  const handleLoadEstimate = (e) => {
    const estId = parseInt(e.target.value)
    if (!estId) return
    const est = savedEstimates.find(x => x.id === estId)
    if (est && est.raw) {
      setKw(est.raw.kw)
      setSysType(est.raw.sysType)
      setPanel(est.raw.panel)
      setMount(est.raw.mount)
      setPitch(est.raw.pitch)
      setBatteryCount(est.raw.batteryCount)
      setInverter(est.raw.inverter)
    }
  }

  const handleSendToContract = () => {
    if (setEstimateForContract) {
      setEstimateForContract(generateEstimatePayload())
    }
    setActiveSection('contract')
  }

  const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
  const fmtCents = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 })

  return (
    <section className="max-w-6xl mx-auto">
      <h2 className="text-4xl font-black text-blue-900 mb-8">Estimate Builder</h2>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Input Specifications */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* SAVE / LOAD COMPONENT */}
          <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 shadow-sm flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-[10px] uppercase font-black text-blue-900 mb-2 tracking-widest">Load Saved Estimate</label>
              <select onChange={handleLoadEstimate} className="w-full p-3 border-2 border-white rounded-xl bg-white text-slate-700 font-bold outline-none focus:border-blue-400 transition shadow-sm">
                <option value="">-- Select an Estimate --</option>
                {savedEstimates.slice().reverse().map(est => (
                  <option key={est.id} value={est.id}>{est.name} ({est.date})</option>
                ))}
              </select>
            </div>
            <div className="flex-1 w-full flex gap-2">
              <div className="flex-1">
                <label className="block text-[10px] uppercase font-black text-blue-900 mb-2 tracking-widest">Save Current Estimate</label>
                <input 
                  type="text" 
                  value={estimateName} 
                  onChange={(e) => setEstimateName(e.target.value)} 
                  placeholder="e.g. Smith Residence" 
                  className="w-full p-3 border-2 border-white rounded-xl bg-white text-slate-700 font-bold outline-none focus:border-blue-400 transition shadow-sm" 
                />
              </div>
              <button onClick={handleSaveEstimate} className="bg-blue-900 text-white font-black px-4 rounded-xl hover:bg-blue-800 transition mt-6 shadow-sm">
                Save
              </button>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-200">
            <h3 className="font-black text-xl text-blue-900 mb-6 border-b border-slate-100 pb-4">
              <i className="fas fa-sliders-h mr-2"></i>System Specifications
            </h3>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase font-black text-slate-500 mb-2">System Size (kW DC)</label>
                  <input type="number" value={kw} step="0.5" onChange={(e) => setKw(e.target.value)} className="w-full p-3 border-2 border-slate-200 rounded-xl bg-slate-50 text-blue-900 font-bold outline-none focus:border-yellow-400 transition" />
                </div>
                <div>
                  <label className="block text-xs uppercase font-black text-slate-500 mb-2">System Type</label>
                  <select value={sysType} onChange={(e) => handleSysTypeChange(e.target.value)} className="w-full p-3 border-2 border-slate-200 rounded-xl bg-slate-50 text-blue-900 font-bold outline-none focus:border-yellow-400 transition">
                    <option value="grid">Grid-Tied (Net Metering)</option>
                    <option value="offgrid">Off-Grid (Stand Alone)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase font-black text-slate-500 mb-2">Panel Type</label>
                  <select value={panel} onChange={(e) => setPanel(e.target.value)} className="w-full p-3 border-2 border-slate-200 rounded-xl bg-slate-50 text-blue-900 font-bold outline-none focus:border-yellow-400 transition">
                    <option value="longi">Longi LR8 (Standard)</option>
                    <option value="jam">JA Solar 500W</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase font-black text-slate-500 mb-2">Mounting</label>
                  <select value={mount} onChange={(e) => setMount(e.target.value)} className="w-full p-3 border-2 border-slate-200 rounded-xl bg-slate-50 text-blue-900 font-bold outline-none focus:border-yellow-400 transition">
                    <option value="roof">Roof Mount</option>
                    <option value="ground">Ground Mount</option>
                  </select>
                </div>
              </div>

              <div style={{ opacity: mount === 'ground' ? 0.3 : 1 }}>
                <label className="block text-xs uppercase font-black text-slate-500 mb-2">Roof Pitch Difficulty</label>
                <select value={pitch} onChange={(e) => setPitch(e.target.value)} disabled={mount === 'ground'} className="w-full p-3 border-2 border-slate-200 rounded-xl bg-slate-50 text-blue-900 font-bold outline-none focus:border-yellow-400 transition disabled:bg-slate-100 disabled:cursor-not-allowed">
                  <option value="standard">Standard (up to 6/12)</option>
                  <option value="steep">Steep (7/12 to 9/12) +$1,000</option>
                  <option value="extreme">Extreme (10/12+) +$2,000</option>
                </select>
              </div>

              <div className="p-5 bg-blue-50 border border-blue-100 rounded-xl space-y-4">
                <div>
                  <label className="block text-xs uppercase font-black text-blue-900 mb-2">Battery Quantity</label>
                  <select value={batteryCount} onChange={(e) => handleBatteryChange(parseInt(e.target.value))} className="w-full p-3 border-2 border-white rounded-xl bg-white text-blue-900 font-bold outline-none focus:border-yellow-400 transition shadow-sm">
                    <option value={0} disabled={sysType === 'offgrid'}>0 (Solar Only)</option>
                    <option value={1}>1 Battery</option>
                    <option value={2}>2 Batteries</option>
                    <option value={3}>3 Batteries</option>
                    <option value={4}>4 Batteries</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase font-black text-blue-900 mb-2">Inverter Architecture</label>
                  <select value={inverter} onChange={(e) => handleInverterChange(e.target.value)} disabled={sysType === 'offgrid'} className="w-full p-3 border-2 border-white rounded-xl bg-white text-blue-900 font-bold outline-none focus:border-yellow-400 transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed">
                    <option value="micro">Microinverters (Enphase/APS)</option>
                    <option value="pw3">Tesla Powerwall 3 (Integrated)</option>
                    <option value="eg4">EG4 Off-Grid System</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Quote Output */}
        <div className="lg:col-span-5">
          <div className="bg-slate-900 p-8 rounded-3xl shadow-xl text-white relative sticky top-10 flex flex-col min-h-full">
            <div>
              <div className="mb-6 border-b border-slate-700 pb-4">
                <h3 className="font-black text-xs uppercase tracking-widest text-slate-400">Quote Summary</h3>
              </div>
              
              <div className="space-y-3 text-sm font-medium mb-8">
                <div className="flex justify-between text-slate-300">
                  <span>System Size:</span> 
                  <span className="font-bold text-white">{parsedKw} kW DC</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Turnkey Installation:</span> 
                  <span className="font-bold text-white">{fmt.format(turnkeyBase)}</span>
                </div>
                
                {/* VISIBLE ADDERS SECTION */}
                {mountPrice > 0 && (
                  <div className="flex justify-between text-slate-400 text-xs ml-4 border-l-2 border-slate-700 pl-3">
                    <span>Ground Mount Eng. & Footings:</span> 
                    <span className="font-bold text-orange-400">+{fmt.format(mountPrice)}</span>
                  </div>
                )}
                {pitchPrice > 0 && (
                  <div className="flex justify-between text-slate-400 text-xs ml-4 border-l-2 border-slate-700 pl-3">
                    <span>Steep/Extreme Pitch Safety:</span> 
                    <span className="font-bold text-orange-400">+{fmt.format(pitchPrice)}</span>
                  </div>
                )}

                {batteryCount > 0 && (
                  <>
                    <div className="flex justify-between text-slate-300 mt-2">
                      <span>{battLabel}</span> 
                      <span className="font-bold text-yellow-400">+{fmt.format(battPrice)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400 text-xs ml-4 border-l-2 border-slate-700 pl-3">
                      <span>Storage Capacity:</span> 
                      <span className="font-bold text-slate-300">{totalKwh.toFixed(1)} kWh</span>
                    </div>
                  </>
                )}
              </div>
              
              <div className="bg-blue-800 rounded-2xl p-6 text-center shadow-inner mb-6 mt-4">
                <p className="text-[10px] uppercase tracking-widest font-bold text-blue-300 mb-1">Total System Price</p>
                <p className="text-5xl font-black text-white tracking-tighter mb-1">{fmt.format(total)}</p>
                <p className="text-xs font-bold text-blue-200">{fmtCents.format(costPerWatt)}/W installed</p>
              </div>

              {/* Badges */}
              <div className="text-center">
                <div className="flex flex-wrap gap-2 justify-center">
                  <span className="bg-slate-800 text-slate-300 text-[10px] font-bold px-3 py-1.5 rounded-full border border-slate-700 uppercase tracking-widest">{sysType === 'grid' ? 'Grid-Tied' : 'Off-Grid'}</span>
                  <span className="bg-slate-800 text-slate-300 text-[10px] font-bold px-3 py-1.5 rounded-full border border-slate-700 uppercase tracking-widest">{panel === 'longi' ? 'Longi LR8' : 'JA Solar'}</span>
                  <span className="bg-slate-800 text-slate-300 text-[10px] font-bold px-3 py-1.5 rounded-full border border-slate-700 uppercase tracking-widest">{mount === 'roof' ? 'Roof Mount' : 'Ground Mount'}</span>
                  {mount === 'roof' && <span className="bg-slate-800 text-slate-300 text-[10px] font-bold px-3 py-1.5 rounded-full border border-slate-700 uppercase tracking-widest">{pitch === 'standard' ? 'Standard Pitch' : pitch === 'steep' ? 'Steep Pitch' : 'Extreme Pitch'}</span>}
                  <span className="bg-slate-800 text-slate-300 text-[10px] font-bold px-3 py-1.5 rounded-full border border-slate-700 uppercase tracking-widest">{batteryCount > 0 ? (inverter === 'pw3' ? `Tesla PW3` : `EG4`) : 'Microinverters'}</span>
                </div>
              </div>

            </div>
            
            <div className="mt-auto pt-8">
              <button 
                onClick={handleSendToContract}
                className="w-full bg-green-500 text-white font-black py-4 rounded-xl shadow-lg hover:bg-green-400 transition transform active:scale-95 flex items-center justify-center gap-2"
              >
                <i className="fas fa-file-signature"></i> Create Contract for this Quote
              </button>
            </div>

          </div>
        </div>

      </div>
    </section>
  )
}