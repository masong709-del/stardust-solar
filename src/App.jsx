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
import AudioDriller from './components/AudioDriller/AudioDriller'
import EstimateBuilder from './components/EstimateBuilder/EstimateBuilder'
import ContractGenerator from './components/ContractGenerator/ContractGenerator'

const SECTIONS = {
  welcome: Dashboard,
  tech: SolarTech101,
  script: ScriptBuilder,
  audio: AudioDriller,
  objections: ObjectionBuster,
  ops: FieldOps,
  sketch: SiteSketcher,
  estimate: EstimateBuilder,
  library: Resources,
  customers: CustomerTracker,
  commission: CommissionCalc,
  contract: ContractGenerator,
  leaderboard: Leaderboard,
}

export default function App() {
  const { user, setUser, setProfile, activeSection } = useAppStore()
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
