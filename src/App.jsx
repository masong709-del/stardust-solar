import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import { useAppStore } from './store/appStore'
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

const SECTIONS = {
  welcome: Dashboard,
  tech: SolarTech101,
  script: ScriptBuilder,
  objections: ObjectionBuster,
  ops: FieldOps,
  sketch: SiteSketcher,
  library: Resources,
  customers: CustomerTracker,
  commission: CommissionCalc,
  leaderboard: Leaderboard,
}

export default function App() {
  const { user, setUser, setProfile, activeSection } = useAppStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) loadUser(session.user)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) loadUser(session.user)
      else { setUser(null); setProfile(null) }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function loadUser(authUser) {
    setUser(authUser)
    const { data } = await supabase.from('profiles').select('*').eq('id', authUser.id).single()
    setProfile(data)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-blue-950">
        <div className="text-yellow-400 font-black text-xl animate-pulse">STARDUST SOLAR</div>
      </div>
    )
  }

  if (!user) return <AuthScreen />

  const ActiveSection = SECTIONS[activeSection] || Dashboard

  return (
    <div className="flex h-screen overflow-hidden font-sans text-slate-900 bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
        <div className="fade-in">
          <ActiveSection />
        </div>
      </main>
    </div>
  )
}
