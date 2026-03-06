import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import { useAppStore } from './store/appStore'
import { Home } from 'lucide-react' // <-- Added Home icon
import AuthScreen from './components/Auth/AuthScreen'
import Sidebar from './components/Sidebar/Sidebar'
import Dashboard from './components/Dashboard/Dashboard'
import SolarTech101 from './components/SolarTech/SolarTech101'
import ScriptBuilder from './components/ScriptBuilder/ScriptBuilder'
import ObjectionBuster from './components/ObjectionBuster/ObjectionBuster'
import FieldOps from './components/FieldOps/FieldOps'
import SiteSketcher from './components/SiteSketcher/SiteSketcher'
import Resources from './components/Resources/Resources'
import CustomerTracker from './components/CustomerTracker/CustomerTracker'
import CommissionCalc from './components/CommissionCalc/CommissionCalc'
import Leaderboard from './components/Leaderboard/Leaderboard'
import AudioDriller from './components/AudioDriller/AudioDriller'
import EstimateBuilder from './components/EstimateBuilder/EstimateBuilder'
import ContractGenerator from './components/ContractGenerator/ContractGenerator'

const SECTIONS = {
  dashboard: Dashboard,
  tracker: CustomerTracker,
  leaderboard: Leaderboard,
  sketcher: SiteSketcher,
  sketch: SiteSketcher,    
  builder: EstimateBuilder,
  contract: ContractGenerator,
  fieldops: FieldOps,
  survey: FieldOps,        
  driller: AudioDriller,
  script: ScriptBuilder,
  objection: ObjectionBuster,
  tech101: SolarTech101,
  commission: CommissionCalc,
  resources: Resources,
  welcome: Dashboard,
}

export default function App() {
  const { user, setUser, setProfile, activeSection, setActiveSection } = useAppStore() // <-- Pulled in setActiveSection
  const [loading, setLoading] = useState(true)
  const [needsPasswordSet, setNeedsPasswordSet] = useState(false)

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.slice(1))
    const searchParams = new URLSearchParams(window.location.search)
    const urlType = hashParams.get('type') || searchParams.get('type')
    const isInvite = urlType === 'invite'

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && isInvite) {
        setNeedsPasswordSet(true)
        setLoading(false)
      } else if (session) {
        loadUser(session.user)
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        loadUser(session.user)
      } else if (event === 'USER_UPDATED' && session) {
        setNeedsPasswordSet(false)
        loadUser(session.user)
      } else if (!session) {
        setUser(null)
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function loadUser(authUser) {
    setUser(authUser)
    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', authUser.id).single()
      setProfile(data)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-blue-950">
        <div className="text-yellow-400 font-black text-xl animate-pulse">STARDUST SOLAR</div>
      </div>
    )
  }

  if (!user || needsPasswordSet) return <AuthScreen needsPasswordSet={needsPasswordSet} />

  const ActiveSection = SECTIONS[activeSection] || Dashboard

  return (
    <div className="flex h-screen overflow-hidden font-sans text-slate-900 bg-slate-50 print:block print:h-auto print:overflow-visible print:bg-white relative">
      
      {/* UNIVERSAL MOBILE ESCAPE HATCH */}
      {/* This only shows up on mobile (md:hidden), and only when NOT on the Dashboard */}
      {activeSection !== 'dashboard' && activeSection !== 'welcome' && (
        <button 
          onClick={() => {
             if (typeof window !== 'undefined' && navigator.vibrate) navigator.vibrate(15)
             setActiveSection('dashboard')
          }}
          className="md:hidden fixed top-4 left-4 z-[9999] bg-slate-900 text-yellow-400 p-3 rounded-full shadow-2xl border border-slate-700 active:scale-95 transition-transform flex items-center justify-center"
        >
          <Home size={20} />
        </button>
      )}

      {/* Desktop Sidebar */}
      <div className="print:hidden z-20 shrink-0 h-full">
        <Sidebar />
      </div>
      
      <main className="flex-1 overflow-y-auto p-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] print:p-0 print:bg-none print:overflow-visible print:h-auto print:block">
        <div key={activeSection} className="animate-fade-in-up print:animate-none">
          <ActiveSection />
        </div>
      </main>
    </div>
  )
}