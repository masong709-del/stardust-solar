import { useState } from 'react'
import { supabase } from '../../lib/supabase'

const PASSWORD_RULES = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'One uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'One lowercase letter', test: (p) => /[a-z]/.test(p) },
  { label: 'One number', test: (p) => /[0-9]/.test(p) },
]

function friendlyError(message) {
  if (!message) return ''
  if (message.toLowerCase().includes('email not confirmed'))
    return 'Please check your email and click the confirmation link before signing in.'
  return message
}

export default function AuthScreen({ needsPasswordSet = false }) {
  const [mode] = useState(needsPasswordSet ? 'set-password' : 'signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const passwordMet = PASSWORD_RULES.map((r) => r.test(password))
  const allRulesMet = passwordMet.every(Boolean)
  const passwordsMatch = password === confirmPassword && password.length > 0

  async function handleSignIn(e) {
    e.preventDefault()
    setError('')

    if (!email.endsWith('@stardustsolar.com')) {
      setError('Access is restricted to @stardustsolar.com accounts.')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(friendlyError(error.message))
    setLoading(false)
  }

  async function handleSetPassword(e) {
    e.preventDefault()
    setError('')

    if (!allRulesMet) return
    if (!passwordsMatch) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) setError(friendlyError(error.message))
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
            {mode === 'signin' ? 'Sign In' : 'Set Your Password'}
          </h2>

          {mode === 'signin' ? (
            <form onSubmit={handleSignIn} className="space-y-4">
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
              {error && <p className="text-red-400 text-xs font-medium text-center">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-yellow-400 text-blue-900 font-black py-3 rounded-xl hover:bg-yellow-300 transition disabled:opacity-50"
              >
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSetPassword} className="space-y-4">
              <p className="text-blue-300 text-xs mb-2">
                Welcome! Choose a password to complete your account setup.
              </p>
              <input
                type="password"
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-blue-950 border border-blue-700 rounded-xl px-4 py-3 text-white placeholder-blue-400 text-sm outline-none focus:border-yellow-400"
              />
              <ul className="space-y-1 px-1">
                {PASSWORD_RULES.map((rule, i) => (
                  <li key={rule.label} className={`text-xs flex items-center gap-2 ${passwordMet[i] ? 'text-green-400' : 'text-blue-400'}`}>
                    <span>{passwordMet[i] ? '✓' : '○'}</span>
                    {rule.label}
                  </li>
                ))}
              </ul>
              <input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full bg-blue-950 border border-blue-700 rounded-xl px-4 py-3 text-white placeholder-blue-400 text-sm outline-none focus:border-yellow-400"
              />
              {confirmPassword.length > 0 && !passwordsMatch && (
                <p className="text-red-400 text-xs">Passwords do not match.</p>
              )}
              {error && <p className="text-red-400 text-xs font-medium text-center">{error}</p>}
              <button
                type="submit"
                disabled={loading || !allRulesMet || !passwordsMatch}
                className="w-full bg-yellow-400 text-blue-900 font-black py-3 rounded-xl hover:bg-yellow-300 transition disabled:opacity-50"
              >
                {loading ? 'Saving…' : 'Set Password & Sign In'}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-blue-600 text-[10px] mt-6 uppercase tracking-widest">v6.0 (Full Stack)</p>
      </div>
    </div>
  )
}
