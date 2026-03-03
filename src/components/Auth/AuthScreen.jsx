import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function AuthScreen() {
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      })
      if (error) setError(error.message)
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
    }

    setLoading(false)
  }

  return (
    <div className="flex h-screen items-center justify-center bg-blue-950">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black tracking-tighter text-yellow-400 italic">STARDUST SOLAR</h1>
          <p className="text-[10px] uppercase tracking-widest text-blue-400 mt-1">Temiskaming Branch</p>
        </div>

        <div className="bg-blue-900 rounded-3xl p-8 shadow-2xl border border-blue-800">
          <h2 className="text-white font-black text-lg mb-6">
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <input
                type="text"
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-blue-950 border border-blue-700 rounded-xl px-4 py-3 text-white placeholder-blue-400 text-sm outline-none focus:border-yellow-400"
              />
            )}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-blue-950 border border-blue-700 rounded-xl px-4 py-3 text-white placeholder-blue-400 text-sm outline-none focus:border-yellow-400"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-blue-950 border border-blue-700 rounded-xl px-4 py-3 text-white placeholder-blue-400 text-sm outline-none focus:border-yellow-400"
            />

            {error && (
              <p className="text-red-400 text-xs font-medium text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-400 text-blue-900 font-black py-3 rounded-xl hover:bg-yellow-300 transition disabled:opacity-50"
            >
              {loading ? 'Loading…' : mode === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <button
            onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError('') }}
            className="w-full mt-4 text-blue-400 text-xs hover:text-blue-300 transition text-center"
          >
            {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>

        <p className="text-center text-blue-600 text-[10px] mt-6 uppercase tracking-widest">v6.0 (Full Stack)</p>
      </div>
    </div>
  )
}
