import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useProspects(userId) {
  const [prospects, setProspects] = useState([])
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('prospects')
      .select('*')
      .order('created_at', { ascending: false })
    setProspects(data || [])
    setLoading(false)
  }, [])

  const add = useCallback(async ({ name, address, phone, status, notes }) => {
    const { data, error } = await supabase
      .from('prospects')
      .insert({ created_by: userId, name, address, phone, status, notes })
      .select()
      .single()
    if (!error) setProspects((prev) => [data, ...prev])
    return error
  }, [userId])

  const remove = useCallback(async (id) => {
    const { error } = await supabase.from('prospects').delete().eq('id', id)
    if (!error) setProspects((prev) => prev.filter((p) => p.id !== id))
    return error
  }, [])

  const updateStatus = useCallback(async (id, status) => {
    const { error } = await supabase
      .from('prospects')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (!error) setProspects((prev) => prev.map((p) => p.id === id ? { ...p, status } : p))
    return error
  }, [])

  return { prospects, loading, load, add, remove, updateStatus }
}
