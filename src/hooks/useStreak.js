import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useStreak(userId) {
  const [streak, setStreak] = useState(0)

  const load = useCallback(async () => {
    if (!userId) return
    const { data } = await supabase
      .from('rep_streaks')
      .select('streak')
      .eq('user_id', userId)
      .maybeSingle()
    setStreak(data?.streak || 0)
  }, [userId])

  const bump = useCallback(async () => {
    if (!userId) return
    const today = new Date().toISOString().slice(0, 10)
    const { data } = await supabase
      .from('rep_streaks')
      .select('streak, last_active')
      .eq('user_id', userId)
      .maybeSingle()
    if (data?.last_active === today) return
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
    const newStreak = data?.last_active === yesterday ? (data.streak || 0) + 1 : 1
    await supabase.from('rep_streaks').upsert({ user_id: userId, streak: newStreak, last_active: today })
    setStreak(newStreak)
  }, [userId])

  return { streak, load, bump }
}
