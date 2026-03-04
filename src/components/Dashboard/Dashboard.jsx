import { useEffect, useState } from 'react'
import { useAppStore } from '../../store/appStore'
import { useGoals } from '../../hooks/useGoals'
import { useStreak } from '../../hooks/useStreak'

const MAX_DEALS = 10
const GOAL_DEALS = 7

const CHECKPOINTS = [
  { deals: 3, pct: 30, label: '3 Deals', reward: '$1K Bonus', icon: 'fas fa-money-bill-wave', reachedColor: 'text-green-500' },
  { deals: 5, pct: 50, label: '5 Deals', reward: '5% Match', icon: 'fas fa-chart-line', reachedColor: 'text-blue-500' },
  { deals: 7, pct: 70, label: '7 Deals', reward: '$1.5K Bonus', icon: 'fas fa-gem', reachedColor: 'text-orange-500' },
]

export default function Dashboard() {
  const { user, activePeriod, setActivePeriod } = useAppStore()
  const { goals, load: loadGoals, adjust } = useGoals(user?.id, activePeriod)
  const { streak, load: loadStreak, bump } = useStreak(user?.id)
  
  // Unused state variables retained from your original code
  const [systemSize, setSystemSize] = useState('')
  const [commRate, setCommRate] = useState('')

  useEffect(() => { 
    loadGoals(); 
    loadStreak(); 
  }, [loadGoals, loadStreak])
  
  useEffect(() => { 
    loadGoals(); 
  }, [activePeriod, loadGoals])

  async function handleAdjust(type, amt) {
    await adjust(type, amt)
    await bump()
  }

  // --- Analytics Calculations ---
  const appRate = goals.knocks > 0 ? ((goals.apps / goals.knocks) * 100).toFixed(1) : 0
  const closeRate = goals.apps > 0 ? ((goals.deals / goals.apps) * 100).toFixed(1) : 0
  const dealsNeeded = Math.max(0, GOAL_DEALS - goals.deals)
  
  let doorsPerDeal = 100
  if (goals.deals > 0 && goals.knocks > 0) doorsPerDeal = goals.knocks / goals.deals
  else if (goals.apps > 0 && goals.knocks > 0) doorsPerDeal = (goals.knocks / goals.apps) * 5
  
  const doorsNeeded = dealsNeeded === 0 ? 0 : Math.ceil(dealsNeeded * doorsPerDeal)
  const commEst = goals.deals * (parseFloat(systemSize) || 0) * (parseFloat(commRate) || 0)

  // --- Dynamic Insights ---
  let insightText = 'Log some doors to start predicting your commission pipeline.'
  let insightClass = 'text-xs mt-4 text-blue-800 font-medium text-center italic bg-white p-2 rounded shadow-sm border border-blue-100'
  
  if (dealsNeeded === 0) { 
    insightText = '🎉 Goal crushed! Everything from here is pure gravy.'; 
    insightClass = 'text-xs mt-4 text-green-700 font-bold text-center bg-green-50 p-2 rounded shadow-sm border border-green-200' 
  } else if (goals.knocks === 0) { 
    /* default */ 
  } else if (appRate < 5) { 
    insightText = "Tip: Your Appt rate is below 5%. Spend 10 mins in the Script Builder on your Hook."; 
    insightClass = 'text-xs mt-4 text-orange-700 font-medium text-center bg-orange-50 p-2 rounded shadow-sm border border-orange-200' 
  } else if (closeRate < 20 && goals.apps > 0) { 
    insightText = "Tip: You're getting apps, but closing is tough. Drill the Objection Buster."; 
    insightClass = 'text-xs mt-4 text-orange-700 font-medium text-center bg-orange-50 p-2 rounded shadow-sm border border-orange-200' 
  } else { 
    insightText = `You are on pace! Keep grinding. Just ${doorsNeeded} doors to hit President's Club.`; 
    insightClass = 'text-xs mt-4 text-green-700 font-bold text-center bg-green-50 p-2 rounded shadow-sm border border-green-200' 
  }

  return (
    <section className="max-w-5xl mx-auto">
      
      {/* Header Area */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-4xl font-black text-blue-900">Rep Dashboard</h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 px-4 py-2 rounded-2xl">
            <span>🔥</span>
            <span className="text-sm font-black text-orange-600">{streak} Day Streak</span>
          </div>
          <div className="flex bg-slate-100 rounded-xl p-1">
            {['weekly', 'monthly'].map((p) => (
              <button
                key={p}
                onClick={() => setActivePeriod(p)}
                className={`px-4 py-1.5 rounded-lg text-xs font-black transition ${activePeriod === p ? 'bg-white text-blue-900 shadow-sm' : 'text-slate-500'}`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        
        {/* Left Column: Performance Metrics (Spans 2 columns) */}
        <div className="md:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-xl text-blue-900">Performance Metrics</h3>
            <span className="text-xs font-bold text-slate-400 uppercase">
              {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          </div>

          {/* Knocks & Apps Cards */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            {[{ type: 'knocks', label: 'Doors Knocked' }, { type: 'apps', label: 'Appointments' }].map(({ type, label }) => (
              <div key={type} className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">{label}</label>
                <div className="flex items-center justify-between">
                  <button onClick={() => handleAdjust(type, -1)} className="w-10 h-10 rounded-full bg-white border shadow-sm text-blue-900 font-bold hover:bg-slate-100 transition">-</button>
                  <span className="text-4xl font-black text-blue-900">{goals[type]}</span>
                  <button onClick={() => handleAdjust(type, 1)} className="w-10 h-10 rounded-full bg-yellow-400 text-blue-900 font-bold hover:bg-yellow-300 transition shadow-sm">+</button>
                </div>
              </div>
            ))}
          </div>

          {/* Deals Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-end mb-4">
              <label className="text-xs font-black uppercase text-blue-900 tracking-wider">
                {activePeriod === 'weekly' ? 'Weekly' : 'Monthly'} Deals Closed
              </label>
              <div className="flex items-center gap-3">
                <button onClick={() => handleAdjust('deals', -1)} className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition">-</button>
                <span className="text-3xl font-black text-green-600">{goals.deals}</span>
                <button onClick={() => handleAdjust('deals', 1)} className="w-8 h-8 rounded-full bg-green-500 text-white font-bold hover:bg-green-400 transition shadow-sm">+</button>
              </div>
            </div>

            <div className="relative w-full bg-slate-100 h-6 rounded-full overflow-visible mt-2">
              <div
                className="bg-gradient-to-r from-green-400 to-green-600 h-full rounded-full transition-all duration-700 ease-out shadow-inner"
                style={{ width: `${Math.min(100, (goals.deals / MAX_DEALS) * 100)}%` }}
              />
              {CHECKPOINTS.map(({ deals, pct, label, reward, icon, reachedColor }) => {
                const isReached = goals.deals >= deals;
                return (
                  <div key={deals}>
                    {/* Tick Mark */}
                    <div className="absolute top-0 h-6 w-1 bg-white z-10 border-l border-r border-slate-200" style={{ left: `${pct}%` }} />
                    {/* Text & Icon Label */}
                    <div className={`absolute top-8 -ml-10 text-center text-[10px] font-bold w-20 transition-colors ${isReached ? 'text-orange-500 font-black' : 'text-slate-400'}`} style={{ left: `${pct}%` }}>
                      <i className={`${icon} text-lg mb-1 transition-all ${isReached ? `${reachedColor} scale-125` : 'text-slate-300'}`}></i><br />
                      {label}<br />
                      <span className={`font-black ${isReached ? reachedColor : 'text-slate-400'}`}>{reward}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Funnel Analytics */}
          <div className="mt-20 pt-6 border-t border-slate-100 bg-blue-50/50 p-6 rounded-2xl border border-blue-100 shadow-inner">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-xs font-black uppercase text-blue-900 tracking-wider"><i className="fas fa-chart-pie mr-2"></i>Live Funnel Analytics</h4>
              <span className="text-[10px] font-bold text-blue-400 bg-blue-100 px-2 py-1 rounded uppercase">Target: 7 Deals</span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-[10px] uppercase text-slate-500 font-bold mb-1">Appt Rate</p>
                <p className="text-2xl font-black text-blue-600">{appRate}%</p>
              </div>
              <div className="border-l border-r border-blue-100">
                <p className="text-[10px] uppercase text-slate-500 font-bold mb-1">Close Rate</p>
                <p className="text-2xl font-black text-green-600">{closeRate}%</p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-slate-500 font-bold mb-1">Doors to Goal</p>
                <p className="text-2xl font-black text-orange-600">{doorsNeeded}</p>
              </div>
            </div>
            <p className={insightClass}>{insightText}</p>
          </div>
          
        </div>

        {/* Right Column: Mason's Tip (Spans 1 column) */}
        <div className="bg-blue-900 text-white p-8 rounded-3xl shadow-lg relative overflow-hidden h-full">
          <i className="fas fa-lightbulb absolute -right-4 -bottom-4 text-8xl text-blue-800 opacity-50"></i>
          <h4 className="font-bold text-yellow-400 mb-4 uppercase text-xs tracking-widest">Mason's Tip</h4>
          <p className="text-sm leading-relaxed relative z-10 font-medium">
            "When someone says 'I'm busy,' don't apologize. Ask: 'Got it, I'm just here for the neighbor's roof—should I come back at 6, or is 7 better?' Give them a choice, not an out."
          </p>
        </div>

      </div>
    </section>
  )
}