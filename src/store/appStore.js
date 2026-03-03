import { create } from 'zustand'

export const useAppStore = create((set) => ({
  // Auth
  user: null,
  profile: null,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),

  // Navigation
  activeSection: 'welcome',
  setActiveSection: (section) => set({ activeSection: section }),

  // Goals period toggle
  activePeriod: 'weekly',
  setActivePeriod: (period) => set({ activePeriod: period }),
}))
