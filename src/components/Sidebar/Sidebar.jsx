import { supabase } from '../../lib/supabase'
import { useAppStore } from '../../store/appStore'

const NAV = [
  {
    label: 'Phase 1: Onboarding',
    links: [
      { id: 'welcome', icon: '🏠', label: 'Dashboard' },
      { id: 'tech', icon: '⚡', label: 'Solar Tech 101' },
    ],
  },
  {
    label: 'Phase 2: The Field',
    links: [
      { id: 'script', icon: '💬', label: 'D2D Script Builder' },
      { id: 'audio', icon: '🎙️', label: 'Audio Driller' },
      { id: 'objections', icon: '🛡️', label: 'Objection Buster' },
      { id: 'ops', icon: '🔧', label: 'Field Ops Protocol' },
    ],
  },
  {
    label: 'Phase 3: Design',
    links: [
      { id: 'sketch', icon: '📐', label: 'Site Sketcher' },
      { id: 'estimate', icon: '📋', label: 'Estimate Builder' },
      { id: 'library', icon: '📄', label: 'Resources' },
    ],
  },
  {
    label: 'Phase 4: Business',
    links: [
      { id: 'customers', icon: '👥', label: 'Customer Tracker' },
      { id: 'commission', icon: '🧮', label: 'Commission Calc' },
      { id: 'leaderboard', icon: '🏆', label: 'Leaderboard' },
    ],
  },
]

export default function Sidebar() {
  const { activeSection, setActiveSection, profile } = useAppStore()

  return (
    <aside className="w-72 bg-blue-900 text-white flex flex-col shadow-xl z-50 shrink-0">
      <div className="p-6 border-b border-blue-800">
        <h1 className="text-2xl font-black tracking-tighter text-yellow-400 italic">STARDUST SOLAR</h1>
        <p className="text-[10px] uppercase tracking-widest text-blue-300">Temiskaming Branch</p>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {NAV.map((group) => (
          <div key={group.label}>
            <p className="text-[10px] font-bold text-blue-400 px-3 py-2 mt-3 uppercase tracking-widest">
              {group.label}
            </p>
            {group.links.map(({ id, icon, label }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={`sidebar-link w-full text-left p-3 rounded-lg flex items-center gap-3 transition ${activeSection === id ? 'active' : 'hover:bg-blue-800'}`}
              >
                <span className="w-5 text-center">{icon}</span>
                {label}
              </button>
            ))}
          </div>
        ))}
      </nav>

      <div className="p-4 bg-blue-950 border-t border-blue-800 flex items-center justify-between">
        <div>
          <p className="text-xs font-black text-white">{profile?.name || 'Rep'}</p>
          <p className="text-[10px] text-blue-400">v6.0 (Full Stack)</p>
        </div>
        <button
          onClick={() => supabase.auth.signOut()}
          className="text-[10px] font-bold text-blue-400 hover:text-white transition uppercase tracking-wider"
        >
          Sign out
        </button>
      </div>
    </aside>
  )
}
