import { useEffect, useState } from 'react'
import { useAppStore } from '../../store/appStore'
import { useGoals } from '../../hooks/useGoals'
import { useStreak } from '../../hooks/useStreak'
import { 
  Target, TrendingUp, Zap, Flame, Award, Calculator, UserPlus, 
  FileSignature, BookOpen, Phone, CheckCircle, FileText, ChevronRight, 
  DollarSign, Users, Sun, Trophy, Plus, Mic, MessageSquare, Shield, 
  ArrowLeft, MapPin, PenTool, ClipboardCheck 
} from 'lucide-react'

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
  const { user, activePeriod, setActivePeriod, profile, setActiveSection } = useAppStore()
  const { goals, load: loadGoals, adjust } = useGoals(user?.id, activePeriod)
  const { streak, load: loadStreak, bump } = useStreak(user?.id)
  
  const [systemSize, setSystemSize] = useState('')
  const [commRate, setCommRate] = useState('')
  
  // FAB State Management
  const [isFabOpen, setIsFabOpen] = useState(false)
  const [fabMode, setFabMode] = useState('main') // 'main' | 'training' | 'site'

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

  const triggerHaptic = () => {
    if (typeof window !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(15);
    }
  }

  // Routing Handler
  const handleRoute = (routeId) => {
    triggerHaptic();
    setIsFabOpen(false);
    // Reset FAB menu after it closes so it's on 'main' next time
    setTimeout(() => setFabMode('main'), 300);
    setActiveSection(routeId);
  }

  const handleFabToggle = () => {
    triggerHaptic();
    if (isFabOpen) {
      setIsFabOpen(false);
      setTimeout(() => setFabMode('main'), 300);
    } else {
      setIsFabOpen(true);
    }
  }

  const appRate = goals.knocks > 0 ? parseFloat(((goals.apps / goals.knocks) * 100).toFixed(1)) : 0
  const closeRate = goals.apps > 0 ? parseFloat(((goals.deals / goals.apps) * 100).toFixed(1)) : 0
  const dealsNeeded = Math.max(0, GOAL_DEALS - goals.deals)
  
  let doorsPerDeal = 100
  if (goals.deals > 0 && goals.knocks > 0) doorsPerDeal = goals.knocks / goals.deals
  else if (goals.apps > 0 && goals.knocks > 0) doorsPerDeal = (goals.knocks / goals.apps) * 5
  
  const doorsNeeded = dealsNeeded === 0 ? 0 : Math.ceil(dealsNeeded * doorsPerDeal)

  const maxFunnel = Math.max(goals.knocks, 1) 
  const appBarWidth = Math.max((goals.apps / maxFunnel) * 100, 2) 
  const dealBarWidth = Math.max((goals.deals / maxFunnel) * 100, 2)

  // --- DESKTOP INSIGHTS ---
  let insightText = 'Log some doors to start predicting your commission pipeline.'
  let insightClass = 'text-xs mt-4 text-blue-800 font-medium text-center italic bg-white p-3 rounded-xl shadow-sm border border-blue-100 flex items-center justify-center gap-2'
  let InsightIcon = Zap
  
  if (dealsNeeded === 0) { 
    insightText = 'Goal crushed! Everything from here is pure gravy.'; 
    insightClass = 'text-xs mt-4 text-green-700 font-bold text-center bg-green-50 p-3 rounded-xl shadow-sm border border-green-200 flex items-center justify-center gap-2' 
    InsightIcon = Award
  } else if (appRate < 5 && goals.knocks > 0) { 
    insightText = "Tip: Your Appt rate is below 5%. Spend 10 mins in the Script Builder on your Hook."; 
    insightClass = 'text-xs mt-4 text-orange-700 font-medium text-center bg-orange-50 p-3 rounded-xl shadow-sm border border-orange-200 flex items-center justify-center gap-2' 
    InsightIcon = TrendingUp
  }

  // --- MOBILE GAMIFICATION THEMES ---
  let mobileThemeHeader = 'from-slate-900 to-blue-950'
  let mobileThemeCardBorder = 'border-slate-800'
  let mobileIconGlow = 'bg-blue-500/10'

  if (dealsNeeded === 0) {
    mobileThemeHeader = 'from-slate-900 to-yellow-900'
    mobileThemeCardBorder = 'border-yellow-600/30 shadow-[0_0_15px_rgba(202,138,4,0.1)]'
    mobileIconGlow = 'bg-yellow-500/20'
  } else if (appRate < 5 && goals.knocks > 0) {
    mobileThemeHeader = 'from-slate-900 to-red-950'
    mobileThemeCardBorder = 'border-red-900/50'
    mobileIconGlow = 'bg-red-500/10'
  }

  return (
    <div className="fixed inset-0 overflow-y-auto bg-slate-950 md:bg-slate-50 transition-colors duration-300">

      {/* ========================================= */}
      {/* MOBILE ONLY VIEW                          */}
      {/* ========================================= */}
      <div className="block md:hidden bg-slate-950 min-h-screen pb-6 font-sans overflow-hidden text-slate-200">
        
        {/* Dynamic Gamified Header */}
        <div className={`bg-gradient-to-b ${mobileThemeHeader} pt-8 pb-12 px-5 rounded-b-[2.5rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] relative z-10 transition-colors duration-1000 animate-fade-in-up`}>
          <div className={`absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full ${mobileIconGlow} blur-3xl pointer-events-none transition-colors duration-1000`}></div>
          <div className="relative z-10">
            <p className="text-xs text-slate-400 font-medium tracking-wide">Welcome back,</p>
            <h2 className="text-3xl font-black text-white tracking-tight mt-0.5">{profile?.full_name?.split(' ')[0] || 'Mason'}</h2>
            <div className="inline-flex items-center gap-2 mt-3 bg-white/5 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 shadow-sm">
              <Zap size={10} className="text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)] fill-current" />
              <p className="text-[9px] font-bold text-yellow-400 uppercase tracking-widest">Stardust Solar • Temiskaming</p>
            </div>
          </div>
        </div>

        {/* Floating Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 px-5 -mt-6 relative z-20">
          <div className={`bg-slate-900 p-3.5 rounded-2xl shadow-lg border ${mobileThemeCardBorder} transform transition-all duration-300 active:scale-95 animate-fade-in-up`} style={{ animationDelay: '100ms' }}>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-7 h-7 rounded-full bg-blue-900/50 flex items-center justify-center">
                <DollarSign size={14} className="text-blue-400" />
              </div>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Revenue</p>
            </div>
            <p className="text-xl font-black text-white tracking-tighter pl-1">${((goals.deals * 1500) || 0).toLocaleString()}</p>
          </div>

          <div className={`bg-slate-900 p-3.5 rounded-2xl shadow-lg border ${mobileThemeCardBorder} transform transition-all duration-300 active:scale-95 animate-fade-in-up`} style={{ animationDelay: '200ms' }}>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-7 h-7 rounded-full bg-orange-900/50 flex items-center justify-center">
                <Users size={14} className="text-orange-400" />
              </div>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Leads</p>
            </div>
            <p className="text-xl font-black text-white tracking-tighter pl-1">14</p>
          </div>

          <div className={`bg-slate-900 p-3.5 rounded-2xl shadow-lg border ${mobileThemeCardBorder} transform transition-all duration-300 active:scale-95 animate-fade-in-up`} style={{ animationDelay: '300ms' }}>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-7 h-7 rounded-full bg-green-900/50 flex items-center justify-center">
                <Trophy size={14} className="text-green-400" />
              </div>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Deals</p>
            </div>
            <p className={`text-xl font-black tracking-tighter pl-1 ${dealsNeeded === 0 ? 'text-yellow-400' : 'text-white'}`}>{goals.deals} <span className="text-xs text-slate-600 font-bold">/ {GOAL_DEALS}</span></p>
          </div>

          <div className={`bg-slate-900 p-3.5 rounded-2xl shadow-lg border ${mobileThemeCardBorder} transform transition-all duration-300 active:scale-95 animate-fade-in-up`} style={{ animationDelay: '400ms' }}>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-7 h-7 rounded-full bg-red-900/50 flex items-center justify-center">
                <Flame size={14} className="text-red-400" />
              </div>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Streak</p>
            </div>
            <p className="text-xl font-black text-white tracking-tighter pl-1">{streak} <span className="text-xs text-slate-600 font-bold">Days</span></p>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="px-5 mt-8 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
          <div className="flex justify-between items-end mb-3 px-1">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-600">Recent Activity</h3>
          </div>
          <div className="space-y-2.5">
            <div onClick={triggerHaptic} className="group flex items-center gap-3 bg-slate-900 p-3 rounded-2xl shadow-sm border border-slate-800 transition-all duration-300 active:scale-95 cursor-pointer hover:border-slate-700">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center shadow-inner group-active:scale-110 transition-transform">
                <CheckCircle size={18} className="text-white drop-shadow-sm" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-black text-slate-200">Contract Signed</p>
                <p className="text-[10px] text-slate-500 font-medium mt-0.5">Canfield Project</p>
              </div>
              <ChevronRight size={14} className="text-slate-700" />
            </div>
            
            <div onClick={triggerHaptic} className="group flex items-center gap-3 bg-slate-900 p-3 rounded-2xl shadow-sm border border-slate-800 transition-all duration-300 active:scale-95 cursor-pointer hover:border-slate-700">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center shadow-inner group-active:scale-110 transition-transform">
                <FileText size={18} className="text-white drop-shadow-sm" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-black text-slate-200">Change Order</p>
                <p className="text-[10px] text-slate-500 font-medium mt-0.5">$9,000 Hydro One Fee</p>
              </div>
              <ChevronRight size={14} className="text-slate-700" />
            </div>
          </div>
        </div>

        {/* CENTERED Floating Action Button (FAB) Overlay & Menu */}
        {isFabOpen && (
          <div 
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 transition-opacity animate-fade-in"
            onClick={handleFabToggle}
          ></div>
        )}

        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-3">
          {isFabOpen && (
            <div className="flex flex-col items-center gap-3 mb-2 w-48">
              
              {/* --- TRAINING SUB-MENU --- */}
              {fabMode === 'training' && (
                <>
                  <button onClick={() => handleRoute('driller')} className="w-full flex items-center justify-start gap-3 bg-slate-800 text-white p-1.5 pr-4 rounded-full shadow-lg border border-slate-700 active:scale-95 transition-transform animate-fade-in-up" style={{ animationDelay: '0ms' }}>
                    <div className="w-9 h-9 rounded-full bg-red-900/50 flex items-center justify-center shrink-0"><Mic size={16} className="text-red-400"/></div>
                    <span className="text-xs font-bold tracking-wide">Audio Driller</span>
                  </button>
                  <button onClick={() => handleRoute('objection')} className="w-full flex items-center justify-start gap-3 bg-slate-800 text-white p-1.5 pr-4 rounded-full shadow-lg border border-slate-700 active:scale-95 transition-transform animate-fade-in-up" style={{ animationDelay: '50ms' }}>
                    <div className="w-9 h-9 rounded-full bg-purple-900/50 flex items-center justify-center shrink-0"><Shield size={16} className="text-purple-400"/></div>
                    <span className="text-xs font-bold tracking-wide">Objection Buster</span>
                  </button>
                  <button onClick={() => handleRoute('script')} className="w-full flex items-center justify-start gap-3 bg-slate-800 text-white p-1.5 pr-4 rounded-full shadow-lg border border-slate-700 active:scale-95 transition-transform animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                    <div className="w-9 h-9 rounded-full bg-blue-900/50 flex items-center justify-center shrink-0"><MessageSquare size={16} className="text-blue-400"/></div>
                    <span className="text-xs font-bold tracking-wide">Script Builder</span>
                  </button>
                  <button onClick={() => handleRoute('tech101')} className="w-full flex items-center justify-start gap-3 bg-slate-800 text-white p-1.5 pr-4 rounded-full shadow-lg border border-slate-700 active:scale-95 transition-transform animate-fade-in-up" style={{ animationDelay: '150ms' }}>
                    <div className="w-9 h-9 rounded-full bg-yellow-900/50 flex items-center justify-center shrink-0"><Sun size={16} className="text-yellow-400"/></div>
                    <span className="text-xs font-bold tracking-wide">Solar Tech 101</span>
                  </button>
                  
                  {/* Back to main FAB menu */}
                  <button onClick={() => { triggerHaptic(); setFabMode('main') }} className="mt-2 flex items-center justify-center gap-2 bg-slate-900 text-slate-400 px-4 py-2 rounded-full border border-slate-800 active:scale-95 transition-transform animate-fade-in">
                    <ArrowLeft size={14} /> <span className="text-[10px] font-bold uppercase tracking-wider">Back</span>
                  </button>
                </>
              )}

              {/* --- SITE SUB-MENU --- */}
              {fabMode === 'site' && (
                <>
                  <button onClick={() => handleRoute('survey')} className="w-full flex items-center justify-start gap-3 bg-slate-800 text-white p-1.5 pr-4 rounded-full shadow-lg border border-slate-700 active:scale-95 transition-transform animate-fade-in-up" style={{ animationDelay: '0ms' }}>
                    <div className="w-9 h-9 rounded-full bg-teal-900/50 flex items-center justify-center shrink-0"><ClipboardCheck size={16} className="text-teal-400"/></div>
                    <span className="text-xs font-bold tracking-wide">Site Survey</span>
                  </button>
                  <button onClick={() => handleRoute('sketch')} className="w-full flex items-center justify-start gap-3 bg-slate-800 text-white p-1.5 pr-4 rounded-full shadow-lg border border-slate-700 active:scale-95 transition-transform animate-fade-in-up" style={{ animationDelay: '50ms' }}>
                    <div className="w-9 h-9 rounded-full bg-indigo-900/50 flex items-center justify-center shrink-0"><PenTool size={16} className="text-indigo-400"/></div>
                    <span className="text-xs font-bold tracking-wide">Site Sketch</span>
                  </button>
                  
                  {/* Back to main FAB menu */}
                  <button onClick={() => { triggerHaptic(); setFabMode('main') }} className="mt-2 flex items-center justify-center gap-2 bg-slate-900 text-slate-400 px-4 py-2 rounded-full border border-slate-800 active:scale-95 transition-transform animate-fade-in">
                    <ArrowLeft size={14} /> <span className="text-[10px] font-bold uppercase tracking-wider">Back</span>
                  </button>
                </>
              )}

              {/* --- MAIN FAB MENU --- */}
              {fabMode === 'main' && (
                <>
                  <button onClick={() => { triggerHaptic(); setFabMode('training') }} className="w-full flex items-center justify-start gap-3 bg-slate-800 text-white p-1.5 pr-4 rounded-full shadow-lg border border-slate-700 active:scale-95 transition-transform animate-fade-in-up" style={{ animationDelay: '0ms' }}>
                    <div className="w-9 h-9 rounded-full bg-orange-900/50 flex items-center justify-center shrink-0"><BookOpen size={16} className="text-orange-400"/></div>
                    <span className="text-xs font-bold tracking-wide">Training</span>
                  </button>
                  <button onClick={() => { triggerHaptic(); setFabMode('site') }} className="w-full flex items-center justify-start gap-3 bg-slate-800 text-white p-1.5 pr-4 rounded-full shadow-lg border border-slate-700 active:scale-95 transition-transform animate-fade-in-up" style={{ animationDelay: '50ms' }}>
                    <div className="w-9 h-9 rounded-full bg-teal-900/50 flex items-center justify-center shrink-0"><MapPin size={16} className="text-teal-400"/></div>
                    <span className="text-xs font-bold tracking-wide">Site</span>
                  </button>
                  <button onClick={() => handleRoute('contract')} className="w-full flex items-center justify-start gap-3 bg-slate-800 text-white p-1.5 pr-4 rounded-full shadow-lg border border-slate-700 active:scale-95 transition-transform animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                    <div className="w-9 h-9 rounded-full bg-green-900/50 flex items-center justify-center shrink-0"><FileSignature size={16} className="text-green-400"/></div>
                    <span className="text-xs font-bold tracking-wide">Contract</span>
                  </button>
                  <button onClick={() => handleRoute('tracker')} className="w-full flex items-center justify-start gap-3 bg-slate-800 text-white p-1.5 pr-4 rounded-full shadow-lg border border-slate-700 active:scale-95 transition-transform animate-fade-in-up" style={{ animationDelay: '150ms' }}>
                    <div className="w-9 h-9 rounded-full bg-blue-900/50 flex items-center justify-center shrink-0"><UserPlus size={16} className="text-blue-400"/></div>
                    <span className="text-xs font-bold tracking-wide">Add Lead</span>
                  </button>
                  <button onClick={() => handleRoute('builder')} className="w-full flex items-center justify-start gap-3 bg-blue-900 text-white p-1.5 pr-4 rounded-full shadow-[0_0_15px_rgba(30,58,138,0.5)] border border-blue-700 active:scale-95 transition-transform animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                    <div className="w-9 h-9 rounded-full bg-yellow-400 flex items-center justify-center shrink-0"><Calculator size={16} className="text-blue-900"/></div>
                    <span className="text-xs font-bold tracking-wide text-yellow-400">New Quote</span>
                  </button>
                </>
              )}
            </div>
          )}
          
          <button 
            onClick={handleFabToggle} 
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(250,204,21,0.3)] active:scale-90 transition-all duration-300 z-50 relative ${isFabOpen ? 'bg-slate-800 text-slate-400 border border-slate-700 rotate-45' : 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-blue-900 rotate-0'}`}
          >
            <Plus size={28} className="fill-current" />
          </button>
        </div>

      </div>

      {/* ========================================= */}
      {/* DESKTOP ONLY VIEW                         */}
      {/* ========================================= */}
      <div className="hidden md:flex flex-col items-center w-full min-h-screen py-12 px-8 lg:px-12 pb-32 text-slate-800">
        <div className="w-full max-w-7xl animate-fade-in-up">
          
          <h1 className="text-4xl font-black text-slate-900 mb-2">Welcome back, {profile?.full_name?.split(' ')[0] || 'Mason'}!</h1>
          <p className="text-slate-500 text-lg mb-8">Ready to crush some doors today?</p>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <h2 className="text-4xl font-black text-slate-900 flex items-center gap-3">
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
                    className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${activePeriod === p ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
            <div className="lg:col-span-2 space-y-8">
              
              <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-200 border-t-4 border-t-blue-500">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-xl text-slate-900">Performance Tracking</h3>
                  <span className="text-xs font-bold text-slate-500 uppercase bg-slate-100 px-3 py-1 rounded-full">
                    {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-8">
                  {[{ type: 'knocks', label: 'Doors Knocked', color: 'blue' }, { type: 'apps', label: 'Appointments', color: 'yellow' }].map(({ type, label, color }) => (
                    <div key={type} className={`space-y-2 bg-slate-50 p-5 rounded-2xl border border-slate-100 transition-all duration-300 hover:shadow-md group`}>
                      <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider group-hover:text-blue-900 transition-colors">{label}</label>
                      <div className="flex items-center justify-between">
                        <button onClick={() => handleAdjust(type, -1)} className="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-600 font-bold hover:bg-slate-100 hover:text-red-500 transition-all active:scale-95">-</button>
                        <span className="text-5xl font-black text-slate-900 tracking-tighter">{goals[type]}</span>
                        <button onClick={() => handleAdjust(type, 1)} className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all active:scale-95">+</button>
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <div className="flex justify-between items-end mb-4">
                    <label className="text-xs font-black uppercase text-slate-900 tracking-wider">
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

              <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-200 border-t-4 border-t-yellow-500">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-sm font-black uppercase text-slate-900 tracking-wider">
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

                <div className={insightClass}>
                  <InsightIcon size={16} />
                  {insightText}
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-blue-900 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden group">
                <i className="fas fa-lightbulb absolute -right-4 -bottom-4 text-8xl text-blue-800 opacity-50 group-hover:scale-110 transition-transform"></i>
                <h4 className="font-bold text-yellow-400 mb-4 uppercase text-xs tracking-widest flex items-center gap-2">
                  <Zap size={14} /> Mason's Tip
                </h4>
                <p className="text-sm leading-relaxed relative z-10 font-medium text-blue-50 italic border-l-2 border-yellow-400 pl-4 py-1">
                  "When someone says 'I'm busy,' don't apologize. Ask: 'Got it, I'm just here for the neighbor's roof—should I come back at 6, or is 7 better?' Give them a choice, not an out."
                </p>
              </div>

              <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl relative border border-slate-800">
                <h4 className="font-bold text-slate-400 mb-6 uppercase text-xs tracking-widest">Pace to Target</h4>
                <div className="text-center">
                  <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Doors to hit President's Club</p>
                  <p className="text-6xl font-black text-white tracking-tighter mb-2">{doorsNeeded}</p>
                  <div className="w-16 h-1 bg-yellow-400 mx-auto rounded mb-4"></div>
                  <p className="text-xs text-slate-400">Based on your current {closeRate}% close rate.</p>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>

    </div>
  )
}