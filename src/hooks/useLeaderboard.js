import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { getPeriodKey } from '../lib/utils'

export function useLeaderboard() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)

  const load = useCallback(async (period) => {
    setLoading(true)
    const { data } = await supabase
      .from('rep_metrics')
      .select('knocks, apps, deals, profiles(name)')
      .eq('period', period)
      .eq('period_key', getPeriodKey(period))
      .order('deals', { ascending: false })
    setRows(
      (data || []).map((r) => ({
        name: r.profiles?.name || 'Unknown',
        knocks: r.knocks,
        apps: r.apps,
        deals: r.deals,
      }))
    )
    setLoading(false)
  }, [])

  return { rows, loading, load }
}
