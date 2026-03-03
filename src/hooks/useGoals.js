import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { getPeriodKey } from '../lib/utils'

export function useGoals(userId, period) {
  const [goals, setGoals] = useState({ knocks: 0, apps: 0, deals: 0 })
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    const { data } = await supabase
      .from('rep_metrics')
      .select('knocks, apps, deals')
      .eq('user_id', userId)
      .eq('period', period)
      .eq('period_key', getPeriodKey(period))
      .maybeSingle()
    setGoals(data || { knocks: 0, apps: 0, deals: 0 })
    setLoading(false)
  }, [userId, period])

  const adjust = useCallback(async (type, amt) => {
    const updated = { ...goals, [type]: Math.max(0, goals[type] + amt) }
    setGoals(updated)
    await supabase.from('rep_metrics').upsert(
      { user_id: userId, period, period_key: getPeriodKey(period), ...updated, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,period,period_key' }
    )
  }, [goals, userId, period])

  return { goals, loading, load, adjust }
}
