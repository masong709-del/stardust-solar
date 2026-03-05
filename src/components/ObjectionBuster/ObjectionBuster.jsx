import { useState, useEffect, useCallback } from 'react'
import { allObjections } from '../../data/objections'
import { Shield, RefreshCcw, CheckCircle2, XCircle, Brain, RotateCcw, Target, Zap, Handshake, DollarSign, ListChecks } from 'lucide-react'

const CATEGORIES = [
  { id: 'All', label: 'All Cards', Icon: ListChecks },
  { id: 'Financial', label: 'Financial', Icon: DollarSign },
  { id: 'Technical', label: 'Technical', Icon: Zap },
  { id: 'Trust', label: 'Trust', Icon: Handshake },
]

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

  function flip() { 
    if (deck.length === 0) return; 
    setFlipped(!flipped) 
  }

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
    if (!window.confirm('Reset all mastered cards and difficulty scores?')) return
    setMastered([])
    setDifficulty({})
    localStorage.setItem('stardustMasteredCards', '[]')
    localStorage.setItem('solarCardDifficulty', '{}')
  }

  const card = deck[idx]

  return (
    <div className="max-w-3xl mx-auto text-center pb-12">
      
      <div className="animate-fade-in-up mb-8">
        <h2 className="text-4xl font-black text-blue-900 mb-2 flex items-center justify-center gap-3">
          <Shield className="text-yellow-500" size={36} /> Objection Buster
        </h2>
        <p className="text-slate-500 italic">Drill it until you can't get it wrong.</p>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap justify-center gap-3 mb-10 animate-fade-in-up delay-100">
        {CATEGORIES.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setCategory(id)}
            className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-300 flex items-center gap-2 transform active:scale-95 ${
              category === id 
                ? 'bg-blue-900 text-yellow-400 shadow-md hover:-translate-y-0.5' 
                : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50 hover:text-blue-900 shadow-sm hover:-translate-y-0.5'
            }`}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* Deck Stats */}
      <div className="flex justify-between items-end mb-4 px-2 animate-fade-in-up delay-200">
        <span className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
          <Target size={16} />
          {deck.length === 0 ? '0 Cards Left' : `Card ${idx + 1} of ${deck.length}`}
        </span>
        <button 
          onClick={() => setShowMastered(!showMastered)} 
          className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Brain size={14} /> View Mastered ({mastered.length})
        </button>
      </div>

      {/* 3D Flashcard */}
      <div className="animate-fade-in-up delay-200 relative w-full h-80 md:h-96 mb-8" style={{ perspective: '1000px' }}>
        <div 
          className="w-full h-full transition-transform duration-500 cursor-pointer shadow-xl hover:shadow-2xl rounded-3xl"
          style={{ transformStyle: 'preserve-3d', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
          onClick={flip}
        >
          {/* FRONT OF CARD (Question) */}
          <div 
            className="absolute w-full h-full bg-white rounded-3xl border-2 border-slate-200 p-8 flex flex-col items-center justify-center text-center transition-all hover:border-blue-300"
            style={{ backfaceVisibility: 'hidden' }}
          >
            {card ? (
              <>
                <RotateCcw size={24} className="absolute top-6 right-6 text-slate-300 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 bg-slate-100 px-3 py-1 rounded-full">
                  Customer Says:
                </span>
                <h3 className="text-2xl md:text-3xl font-black text-blue-900 leading-tight">"{card.q}"</h3>
                <p className="absolute bottom-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Tap to flip</p>
              </>
            ) : (
              <>
                <span className="text-6xl mb-6 block drop-shadow-md">🎉</span>
                <h3 className="text-3xl font-black text-blue-900 mb-2">Deck Cleared!</h3>
                <p className="text-slate-500 font-medium">You've mastered this category. Switch categories or reset the deck to drill again.</p>
              </>
            )}
          </div>

          {/* BACK OF CARD (Answer) */}
          <div 
            className="absolute w-full h-full bg-gradient-to-br from-blue-900 to-blue-950 text-white rounded-3xl shadow-xl p-8 flex flex-col items-center justify-center text-center border-2 border-blue-800"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <span className="text-[10px] font-black uppercase tracking-widest text-yellow-400 mb-6 bg-blue-800/50 px-3 py-1 rounded-full">
              Your Rebuttal:
            </span>
            <p className="text-xl md:text-2xl font-medium leading-relaxed">
              {card ? `"${card.a}"` : 'Nothing left to drill here.'}
            </p>
          </div>
        </div>
      </div>

      {/* Scoring Buttons */}
      <div className={`grid grid-cols-2 gap-4 transition-all duration-500 transform ${flipped && deck.length > 0 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        <button 
          onClick={() => score('needsWork')} 
          className="bg-white border-2 border-red-100 text-red-600 font-black py-5 rounded-2xl shadow-lg hover:bg-red-50 hover:border-red-200 transition-all duration-300 active:scale-95 flex flex-col items-center justify-center gap-2 group"
        >
          <XCircle size={24} className="group-hover:scale-110 transition-transform" />
          Needs Work
        </button>
        <button 
          onClick={() => score('nailedIt')} 
          className="bg-green-500 border-2 border-green-500 text-white font-black py-5 rounded-2xl shadow-lg shadow-green-500/30 hover:bg-green-400 hover:border-green-400 transition-all duration-300 active:scale-95 flex flex-col items-center justify-center gap-2 group"
        >
          <CheckCircle2 size={24} className="group-hover:scale-110 transition-transform" />
          Nailed It!
        </button>
      </div>

      {/* Mastered Vault */}
      {showMastered && (
        <div className="mt-12 text-left bg-white p-8 rounded-3xl border border-slate-200 shadow-xl animate-fade-in-up">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-slate-100 pb-6 gap-4">
            <div>
              <h4 className="font-black text-xl text-blue-900 flex items-center gap-2">
                <CheckCircle2 className="text-green-500" size={24} /> Mastered Objections
              </h4>
              <p className="text-sm text-slate-500 mt-1">Cards you marked as "Nailed It" are removed from the active drill deck.</p>
            </div>
            <button 
              onClick={reset} 
              className="text-xs bg-red-50 text-red-600 border border-red-100 px-4 py-2.5 rounded-xl hover:bg-red-100 hover:text-red-700 font-black transition-colors flex items-center gap-2 shadow-sm"
            >
              <RefreshCcw size={14} /> Reset Entire Deck
            </button>
          </div>
          
          {mastered.length === 0 ? (
            <div className="text-center py-8">
              <Brain size={48} className="mx-auto text-slate-200 mb-4" />
              <p className="text-slate-500 font-bold">No cards mastered yet. Start drilling!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mastered.map((q, i) => (
                <div key={i} className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex items-start gap-3">
                  <CheckCircle2 size={16} className="text-green-500 shrink-0 mt-0.5" />
                  <p className="text-sm font-bold text-slate-700">"{q}"</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  )
}