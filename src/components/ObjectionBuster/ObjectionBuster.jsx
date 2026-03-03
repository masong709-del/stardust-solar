import { useState, useEffect, useCallback } from 'react'
import { allObjections } from '../../data/objections'

const CATEGORIES = ['All', 'Financial', 'Technical', 'Trust']

export default function ObjectionBuster() {
  const [category, setCategory] = useState('All')
  const [deck, setDeck] = useState([])
  const [idx, setIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [mastered, setMastered] = useState(() => JSON.parse(localStorage.getItem('stardustMasteredCards') || '[]'))
  const [difficulty, setDifficulty] = useState(() => JSON.parse(localStorage.getItem('solarCardDifficulty') || '{}'))
  const [showMastered, setShowMastered] = useState(false)

  const buildDeck = useCallback(() => {
    let filtered = allObjections.filter((o) => (category === 'All' || o.cat === category) && !mastered.includes(o.q))
    filtered.sort(() => Math.random() - 0.5)
    filtered.sort((a, b) => (difficulty[b.q] || 0) - (difficulty[a.q] || 0))
    setDeck(filtered)
    setIdx(0)
    setFlipped(false)
  }, [category, mastered, difficulty])

  useEffect(() => { buildDeck() }, [buildDeck])

  function flip() { if (deck.length === 0) return; setFlipped(!flipped) }

  function score(result) {
    const q = deck[idx].q
    if (result === 'nailedIt') {
      const newMastered = [...mastered, q]
      setMastered(newMastered)
      localStorage.setItem('stardustMasteredCards', JSON.stringify(newMastered))
    } else {
      const newDiff = { ...difficulty, [q]: (difficulty[q] || 0) + 1 }
      setDifficulty(newDiff)
      localStorage.setItem('solarCardDifficulty', JSON.stringify(newDiff))
      setIdx((i) => (i + 1) % deck.length)
    }
    setFlipped(false)
  }

  function reset() {
    if (!confirm('Reset all mastered cards and difficulty scores?')) return
    setMastered([])
    setDifficulty({})
    localStorage.setItem('stardustMasteredCards', '[]')
    localStorage.setItem('solarCardDifficulty', '{}')
  }

  const card = deck[idx]

  return (
    <div className="max-w-2xl mx-auto text-center">
      <h2 className="text-3xl font-black text-blue-900 mb-2">Objection Buster</h2>
      <p className="text-slate-500 mb-6 italic">Drill it until you can't get it wrong.</p>

      <div className="flex flex-wrap justify-center gap-3 mb-8">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-5 py-2 rounded-full text-xs font-bold transition ${category === cat ? 'bg-blue-900 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 shadow-sm'}`}
          >
            {cat === 'All' ? 'All Cards' : cat === 'Financial' ? '💰 Financial' : cat === 'Technical' ? '⚡ Technical' : '🤝 Trust'}
          </button>
        ))}
      </div>

      <div className="flex justify-between items-center mb-4 px-2">
        <span className="text-sm font-bold text-slate-400">
          {deck.length === 0 ? '0 Cards Left' : `Card ${idx + 1} of ${deck.length}`}
        </span>
        <button onClick={() => setShowMastered(!showMastered)} className="text-xs font-bold text-blue-600 hover:text-blue-800 transition bg-blue-50 px-3 py-1 rounded">
          View Mastered ({mastered.length})
        </button>
      </div>

      <div className={`flip-card h-80 mb-6 ${flipped ? 'flipped' : ''}`} onClick={flip}>
        <div className="flip-card-inner">
          <div className="card-face card-front">
            {card ? card.q : <><span className="text-4xl mb-4 block">🎉</span><br />Deck Cleared!<span className="text-sm font-normal mt-2 block text-slate-500">You've mastered this category. Reset to drill again.</span></>}
          </div>
          <div className="card-face card-back text-lg font-medium p-6">
            {card ? card.a : 'Nothing left to drill here.'}
          </div>
        </div>
      </div>

      <div className={`grid grid-cols-2 gap-4 transition-opacity duration-300 ${flipped && deck.length > 0 ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
        <button onClick={() => score('needsWork')} className="bg-slate-800 text-white font-black py-4 rounded-2xl shadow-lg hover:bg-slate-700 transition active:scale-95">🔴 Needs Work</button>
        <button onClick={() => score('nailedIt')} className="bg-green-500 text-white font-black py-4 rounded-2xl shadow-lg hover:bg-green-400 transition active:scale-95">🟢 Nailed It!</button>
      </div>

      {showMastered && (
        <div className="mt-8 text-left bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-4">
            <h4 className="font-black text-blue-900">✅ Mastered Objections</h4>
            <button onClick={reset} className="text-xs bg-slate-100 border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-200 font-bold text-slate-600 transition">Reset Deck</button>
          </div>
          <ul className="text-sm text-slate-600 space-y-3 list-disc pl-5">
            {mastered.length === 0 ? <li>No cards mastered yet. Keep drilling!</li> : mastered.map((q) => <li key={q}>{q}</li>)}
          </ul>
        </div>
      )}
    </div>
  )
}
