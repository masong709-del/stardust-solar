import { useEffect, useState } from 'react'
import { useAppStore } from '../../store/appStore'
import { useGoals } from '../../hooks/useGoals'
import { useStreak } from '../../hooks/useStreak'
import { Target, TrendingUp, Zap, Flame, Award, Calculator, UserPlus, FileSignature, BookOpen, Phone, CheckCircle, FileText } from 'lucide-react'

// ... (KEEP ALL YOUR EXISTING CONSTANTS AND CIRCULAR PROGRESS COMPONENT HERE)
const MAX_DEALS = 10
const GOAL_DEALS = 7

const CHECKPOINTS = [
  { deals: 3, pct: 30, label: '3 Deals', reward: '$1K Bonus', icon: 'fas fa-money-bill-wave', reachedColor: 'text-green-500' },
  { deals: 5, pct: 50, label: '5 Deals', reward: '5% Match', icon: 'fas fa-chart-line', reachedColor: 'text-blue-500' },
  { deals: 7, pct: 70, label: '7 Deals', reward: '$1.5K Bonus', icon: 'fas fa-gem', reachedColor: 'text-orange-500' },
]

function CircularProgress({ percentage, colorClass, strokeColor, label }) {
  const radius = 15.9155; 
  const dash = `${percentage}, 100`;
  return (
    <div className="flex flex-col items-center justify-center relative transition-transform hover:scale-105 duration-300">
      <svg viewBox="0 0 36 36" className="w-24 h-24 drop-shadow-sm">
        <path className="text-slate-100" d={`M18 2.0845 a ${radius} ${radius} 0 0 1 0 31.831 a ${radius} ${radius} 0 0 1 0 -31.831`} fill="none" stroke="currentColor" strokeWidth="3" />
        <path className={`${strokeColor} transition-all duration-1000 ease-out`} d={`M18 2.0845 a ${radius} ${radius} 0 0 1 0 31.831 a ${radius} ${radius} 0 0 1 0 -31.831`} fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray={dash} />
      </svg>
      <div className="absolute flex flex-col items-center justify-center top-0 bottom-0 left-0 right-0 mt-[-10px]">
        <span className={`text-xl font-black ${colorClass}`}>{percentage}%</span>
      </div>
      <span className="text-[10px] uppercase font-black text-slate-400 mt-2 tracking-wider">{label}</span>
    </div>
  )
}

export default function Dashboard() {
  const { user, activePeriod, setActivePeriod } = useAppStore()
  const { goals, load: loadGoals, adjust } = useGoals(user?.id, activePeriod)
  const { streak, load: loadStreak, bump } = useStreak(user?.id)
  
  useEffect(() => { loadGoals(); loadStreak(); }, [loadGoals, loadStreak])
  useEffect(() => { loadGoals(); }, [activePeriod, loadGoals])

  async function handleAdjust(type, amt) {
    await adjust(type, amt)
    await bump()
  }

  // ... (KEEP ALL YOUR EXISTING MATH AND INSIGHT LOGIC HERE)
  const appRate = goals.knocks > 0 ? parseFloat(((goals.apps / goals.knocks) * 100).toFixed(1)) : 0
  const closeRate = goals.apps > 0 ? parseFloat(((goals.deals / goals.apps) * 100).toFixed(1)) : 0
  const dealsNeeded = Math.max(0, GOAL_DEALS - goals.deals)
  const maxFunnel = Math.max(goals.knocks, 1) 
  const appBarWidth = Math.max((goals.apps / maxFunnel) * 100, 2) 
  const dealBarWidth = Math.max((goals.deals / maxFunnel) * 100, 2)

  return (
    <div className="w-full">
      {/* ========================================= */}
      {/* MOBILE ONLY VIEW (Hidden on Desktop)      */}
      {/* ========================================= */}
      <div className="block md:hidden bg-slate-50 min-h-screen pb-24">
        
        {/* Mobile Header */}
        <div className="bg-slate-900 pt-8 pb-12 px-5 rounded-b-[2.5rem] shadow-lg relative z-10">
          <p className="text-sm text-slate-400 font-medium">Welcome back,</p>
          <h2 className="text-3xl font-black text-white tracking-tight">Mason</h2>
          <div className="inline-flex items-center gap-2 mt-2 bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700">
            <i className="fas fa-bolt text-yellow-400 text-[10px]"></i>
            <p className="text-[10px] font-bold text-yellow-400 uppercase tracking-widest">Stardust Solar • Temiskaming</p>
          </div>
        </div>

        {/* 4 Metrics Grid (Pulled up to overlap header) */}
        <div className="grid grid-cols-2 gap-4 px-5 -mt-8 relative z-20">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center">
            <i className="fas fa-chart-line text-blue-500 mb-2 text-lg"></i>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Revenue</p>
            <p className="text-xl font-black text-slate-800 tracking-tighter">$250K</p>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center">
            <i className="fas fa-users text-orange-500 mb-2 text-lg"></i>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Leads</p>
            <p className="text-xl font-black text-slate-800 tracking-tighter">14</p>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center">
            <i className="fas fa-solar-panel text-green-500 mb-2 text-lg"></i>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Projects</p>
            <p className="text-xl font-black text-slate-800 tracking-tighter">3</p>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center">
            <i className="fas fa-trophy text-yellow-500 mb-2 text-lg"></i>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rank</p>
            <p className="text-xl font-black text-slate-800 tracking-tighter">#1</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="px-5 mt-8">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-4 bg-white p-3 rounded-xl shadow-sm border border-slate-100">
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                <CheckCircle size={18} className="text-green-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Contract Signed</p>
                <p className="text-xs text-slate-500">Canfield Project</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 bg-white p-3 rounded-xl shadow-sm border border-slate-100">
              <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
                <FileText size={18} className="text-orange-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Change Order</p>
                <p className="text-xs text-slate-500">$9,000 Hydro One Fee</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white p-3 rounded-xl shadow-sm border border-slate-100">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                <Phone size={18} className="text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Lead Called</p>
                <p className="text-xs text-slate-500">Left voicemail</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="px-5 mt-8">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <button className="flex flex-col items-center justify-center bg-blue-900 text-white p-4 rounded-2xl shadow-md active:scale-95 transition-transform">
              <Calculator size={24} className="mb-2 text-yellow-400" />
              <span className="text-xs font-bold">New Quote</span>
            </button>
            <button className="flex flex-col items-center justify-center bg-white border border-slate-200 text-slate-800 p-4 rounded-2xl shadow-sm active:scale-95 transition-transform">
              <UserPlus size={24} className="mb-2 text-blue-600" />
              <span className="text-xs font-bold">Add Lead</span>
            </button>
            <button className="flex flex-col items-center justify-center bg-white border border-slate-200 text-slate-800 p-4 rounded-2xl shadow-sm active:scale-95 transition-transform">
              <FileSignature size={24} className="mb-2 text-green-600" />
              <span className="text-xs font-bold">Contract</span>
            </button>
            <button className="flex flex-col items-center justify-center bg-white border border-slate-200 text-slate-800 p-4 rounded-2xl shadow-sm active:scale-95 transition-transform">
              <BookOpen size={24} className="mb-2 text-orange-500" />
              <span className="text-xs font-bold">Training</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================= */}
      {/* DESKTOP ONLY VIEW (Hidden on Mobile)      */}
      {/* ========================================= */}
      <div className="hidden md:block max-w-5xl mx-auto pb-12">
        {/* Header Area */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 animate-fade-in-up">
          <h2 className="text-4xl font-black text-blue-900 flex items-center gap-3">
            Rep Dashboard
          </h2>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 px-4 py-2 rounded-2xl shadow-sm">
              <Flame className="text-orange-500 animate-pulse" size={18} />
              <span className="text-sm font-black text-orange-600">{streak} Day Streak</span>
            </div>
            <div className="flex bg-white shadow-sm border border-slate-200 rounded-xl p-1">
              {['weekly', 'monthly'].map((p) => (
                <button
                  key={p}
                  onClick={() => setActivePeriod(p)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${activePeriod === p ? 'bg-blue-900 text-yellow-400 shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          
          {/* Left Column: Performance Metrics */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Tracker Cards */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 animate-fade-in-up delay-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-xl text-blue-900">Performance Tracking</h3>
                <span className="text-xs font-bold text-slate-400 uppercase bg-slate-100 px-3 py-1 rounded-full">
                  {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-8">
                {[{ type: 'knocks', label: 'Doors Knocked', color: 'blue' }, { type: 'apps', label: 'Appointments', color: 'yellow' }].map(({ type, label, color }) => (
                  <div key={type} className={`space-y-2 bg-slate-50 p-5 rounded-2xl border border-slate-100 transition-all duration-300 hover:shadow-md hover:border-${color}-200 group`}>
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider group-hover:text-blue-900 transition-colors">{label}</label>
                    <div className="flex items-center justify-between">
                      <button onClick={() => handleAdjust(type, -1)} className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-sm text-slate-600 font-bold hover:bg-slate-100 hover:text-red-500 transition-all transform active:scale-95">-</button>
                      <span className="text-5xl font-black text-blue-900 tracking-tighter">{goals[type]}</span>
                      <button onClick={() => handleAdjust(type, 1)} className="w-10 h-10 rounded-full bg-blue-900 text-white font-bold hover:bg-yellow-400 hover:text-blue-900 transition-all transform active:scale-95 shadow-md">+</button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Deals Progress Bar */}
              <div>
                <div className="flex justify-between items-end mb-4">
                  <label className="text-xs font-black uppercase text-blue-900 tracking-wider">
                    <Award size={14} className="inline mr-1 text-green-500"/>
                    {activePeriod === 'weekly' ? 'Weekly' : 'Monthly'} Deals Closed
                  </label>
                  <div className="flex items-center gap-3 bg-green-50 border border-green-100 px-3 py-1.5 rounded-full">
                    <button onClick={() => handleAdjust('deals', -1)} className="w-6 h-6 rounded-full bg-white text-green-700 font-bold hover:bg-red-50 transition transform active:scale-95 shadow-sm">-</button>
                    <span className="text-2xl font-black text-green-600 w-6 text-center">{goals.deals}</span>
                    <button onClick={() => handleAdjust('deals', 1)} className="w-6 h-6 rounded-full bg-green-500 text-white font-bold hover:bg-green-400 transition transform active:scale-95 shadow-sm">+</button>
                  </div>
                </div>

                <div className="relative w-full bg-slate-100 h-8 rounded-full mt-2 border border-slate-200 shadow-inner">
                  <div
                    className="bg-gradient-to-r from-green-400 to-green-500 h-full rounded-full transition-all duration-1000 ease-out flex items-center justify-end px-2 shadow-sm"
                    style={{ width: `${Math.min(100, (goals.deals / MAX_DEALS) * 100)}%` }}
                  >
                    {goals.deals > 0 && <span className="text-white text-[10px] font-black opacity-80">{goals.deals}</span>}
                  </div>
                  
                  {CHECKPOINTS.map(({ deals, pct, label, reward, icon, reachedColor }) => {
                    const isReached = goals.deals >= deals;
                    return (
                      <div key={deals}>
                        <div className="absolute top-0 h-8 w-1 bg-white/50 z-10 border-l border-r border-slate-200/50" style={{ left: `${pct}%` }} />
                        <div className={`absolute top-10 -ml-10 text-center text-[10px] font-bold w-20 transition-all duration-500 ${isReached ? 'text-orange-500 font-black scale-110' : 'text-slate-400'}`} style={{ left: `${pct}%` }}>
                          <i className={`${icon} text-lg mb-1 transition-all ${isReached ? `${reachedColor}` : 'text-slate-300'}`}></i><br />
                          {label}<br />
                          <span className={`font-black ${isReached ? reachedColor : 'text-slate-400'}`}>{reward}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Graphical Analytics Box */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 animate-fade-in-up delay-200">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-sm font-black uppercase text-blue-900 tracking-wider">
                  <i className="fas fa-chart-pie text-yellow-500 mr-2"></i>Conversion Analytics
                </h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="flex justify-around items-center border-b md:border-b-0 md:border-r border-slate-100 pb-6 md:pb-0 md:pr-6">
                  <CircularProgress percentage={appRate} colorClass="text-blue-600" strokeColor="stroke-blue-500" label="Appt Rate" />
                  <CircularProgress percentage={closeRate} colorClass="text-green-600" strokeColor="stroke-green-500" label="Close Rate" />
                </div>

                <div className="space-y-4 pl-0 md:pl-2">
                  <div>
                    <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase mb-1">
                      <span>Doors Knocked</span>
                      <span>{goals.knocks}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3">
                      <div className="bg-slate-400 h-3 rounded-full w-full"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase mb-1">
                      <span className="text-blue-600">Appointments</span>
                      <span className="text-blue-600">{goals.apps}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3">
                      <div className="bg-blue-500 h-3 rounded-full transition-all duration-1000" style={{ width: `${appBarWidth}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase mb-1">
                      <span className="text-green-600">Closed Deals</span>
                      <span className="text-green-600">{goals.deals}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3">
                      <div className="bg-green-500 h-3 rounded-full transition-all duration-1000" style={{ width: `${dealBarWidth}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6 animate-fade-in-up delay-300">
            <div className="bg-blue-900 text-white p-8 rounded-3xl shadow-lg relative overflow-hidden group transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <i className="fas fa-lightbulb absolute -right-4 -bottom-4 text-8xl text-blue-800 opacity-50 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500"></i>
              <h4 className="font-bold text-yellow-400 mb-4 uppercase text-xs tracking-widest flex items-center gap-2">
                <Zap size={14} /> Mason's Tip
              </h4>
              <p className="text-sm leading-relaxed relative z-10 font-medium text-blue-50 italic border-l-2 border-yellow-400 pl-4 py-1">
                "When someone says 'I'm busy,' don't apologize. Ask: 'Got it, I'm just here for the neighbor's roof—should I come back at 6, or is 7 better?' Give them a choice, not an out."
              </p>
            </div>

            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8 rounded-3xl shadow-lg relative border border-slate-700">
              <h4 className="font-bold text-slate-400 mb-6 uppercase text-xs tracking-widest">Pace to Target</h4>
              <div className="text-center">
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Doors to hit President's Club</p>
                <p className="text-6xl font-black text-white tracking-tighter mb-2">{dealsNeeded > 0 ? Math.ceil(dealsNeeded * (goals.deals > 0 ? goals.knocks / goals.deals : 100)) : 0}</p>
                <div className="w-16 h-1 bg-yellow-400 mx-auto rounded mb-4"></div>
                <p className="text-xs text-slate-400">Based on your current {closeRate}% close rate.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}