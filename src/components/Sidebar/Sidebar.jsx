import { useState } from 'react'
import { useAppStore } from '../../store/appStore'
import { supabase } from '../../lib/supabase'

const MENU_GROUPS = [
  {
    title: "1. Daily Operations",
    items: [
      { id: 'dashboard', icon: 'fas fa-home', label: 'Dashboard' },
      { id: 'tracker', icon: 'fas fa-users', label: 'Customer Tracker' },
      { id: 'leaderboard', icon: 'fas fa-trophy', label: 'Leaderboard' },
    ]
  },
  {
    title: "2. The Sales Toolkit",
    items: [
      { id: 'sketcher', icon: 'fas fa-pen-ruler', label: 'Site Sketcher' },
      { id: 'builder', icon: 'fas fa-calculator', label: 'Estimate Builder' },
      { id: 'contract', icon: 'fas fa-file-signature', label: 'Contract Generator' },
      { id: 'fieldops', icon: 'fas fa-camera', label: 'Site Survey' },
    ]
  },
  {
    title: "3. The War Room",
    items: [
      { id: 'driller', icon: 'fas fa-microphone-alt', label: 'AI Audio Driller' },
      { id: 'script', icon: 'fas fa-comment-dots', label: 'Script Builder' },
      { id: 'objection', icon: 'fas fa-shield-alt', label: 'Objection Buster' },
      { id: 'tech101', icon: 'fas fa-solar-panel', label: 'Solar Tech 101' },
    ]
  },
  {
    title: "4. Growth & Resources",
    items: [
      { id: 'commission', icon: 'fas fa-money-bill-wave', label: 'Commission Calc' },
      { id: 'resources', icon: 'fas fa-book', label: 'Resources' },
    ]
  }
];

export default function Sidebar() {
  const { activeSection, setActiveSection } = useAppStore()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Helper to close menu on mobile after clicking a link
  const handleNavigation = (id) => {
    setActiveSection(id);
    setIsMobileMenuOpen(false);
  }

  return (
    <>
      {/* FLOATING MOBILE MENU BUTTON (Replaces the blocky top bar) */}
      <button 
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed top-4 right-4 z-[9999] bg-slate-900 text-white w-12 h-12 rounded-full shadow-2xl border border-slate-700 flex items-center justify-center transition-transform active:scale-95"
      >
        <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'} text-lg`}></i>
      </button>

      {/* MOBILE OVERLAY (Darkens background when menu is open) */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* SIDEBAR (Responsive behavior) */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col h-screen shadow-2xl transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand Header - ONLY VISIBLE ON DESKTOP */}
        <div className="p-6 border-b border-slate-800 hidden md:block">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg">
              <i className="fas fa-bolt text-blue-900 font-black"></i>
            </div>
            <div>
              <h1 className="font-black text-xl tracking-tighter uppercase">Stardust</h1>
              <p className="text-[9px] text-yellow-400 font-bold tracking-widest uppercase mt-0.5">Field OS</p>
            </div>
          </div>
        </div>

        {/* Navigation Groups */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar pt-12 md:pt-4">
          {MENU_GROUPS.map((group, groupIndex) => (
            <div key={groupIndex} className="animate-fade-in-up" style={{ animationDelay: `${groupIndex * 100}ms` }}>
              <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-3 px-3">
                {group.title}
              </h3>
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const isActive = activeSection === item.id
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => handleNavigation(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 group ${
                          isActive 
                            ? 'bg-blue-600 text-white shadow-md' 
                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <i className={`${item.icon} w-5 text-center transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}></i>
                        <span>{item.label}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50 pb-8 md:pb-4">
          <button 
            onClick={() => handleNavigation('welcome')}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-800 transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-full bg-blue-800 flex items-center justify-center text-white font-bold shadow-inner">
              M
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">Mason Greene</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider truncate">Temiskaming</p>
            </div>
            <i className="fas fa-cog text-slate-500 hover:text-white transition-colors"></i>
          </button>
          <button
            onClick={() => supabase.auth.signOut()}
            className="text-[10px] font-bold text-blue-400 hover:text-white transition uppercase tracking-wider mt-2 w-full text-left px-3"
          >
            Sign out
          </button>
        </div>
      </aside>
    </>
  )
}