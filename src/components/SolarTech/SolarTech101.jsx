import { useState } from 'react'
import { useAppStore } from '../../store/appStore'
import { techModules } from '../../data/techModules'

function TechQuiz({ module, onPass }) {
  const [selected, setSelected] = useState(null)

  function answer(idx) {
    if (selected !== null) return
    setSelected(idx)
    if (idx === module.quiz.correct) {
      setTimeout(onPass, 1000)
    }
  }

  return (
    <div>
      <div className="text-center mb-6">
        <span className="bg-yellow-400 text-blue-900 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider">Quick Check</span>
      </div>
      <h3 className="text-xl font-bold text-blue-900 mb-6 text-center leading-snug">{module.quiz.q}</h3>
      <div className="space-y-3 max-w-xl mx-auto">
        {module.quiz.options.map((opt, i) => {
          let cls = 'w-full text-left p-4 rounded-xl border-2 border-slate-200 bg-white font-medium text-slate-700 transition'
          if (selected !== null) {
            if (i === module.quiz.correct) cls += ' border-green-500 bg-green-50 text-green-800'
            else if (i === selected) cls += ' border-red-400 bg-red-50 text-red-700'
          } else {
            cls += ' hover:border-blue-400 cursor-pointer'
          }
          return (
            <button key={i} onClick={() => answer(i)} className={cls} disabled={selected !== null}>
              {opt}
            </button>
          )
        })}
      </div>
      {selected !== null && (
        <div className={`mt-6 p-4 rounded-xl text-center font-bold ${selected === module.quiz.correct ? 'text-green-700 bg-green-50 border border-green-200' : 'text-red-700 bg-red-50 border border-red-200'}`}>
          {selected === module.quiz.correct
            ? '✅ Correct! Moving on...'
            : '❌ Not quite — the correct answer is highlighted above.'}
          {selected !== module.quiz.correct && (
            <button onClick={() => setSelected(null)} className="ml-3 px-4 py-1 bg-blue-900 text-white rounded-lg text-sm font-bold hover:bg-blue-800 transition">
              Try Again
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default function SolarTech101() {
  const { setActiveSection } = useAppStore()
  const [step, setStep] = useState(0)
  const [quizMode, setQuizMode] = useState(false)

  function nextStep() {
    const next = step + 1
    if (next >= techModules.length) { setActiveSection('script'); return }
    setStep(next)
    setQuizMode(false)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-4xl font-black text-blue-900 mb-2">Solar Tech 101</h2>
      <p className="text-slate-500 mb-8 italic">Master the mechanics to sell the value.</p>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 mt-8">
        <div className="w-full bg-slate-100 h-2 rounded-full mb-8">
          <div
            className="bg-yellow-400 h-full transition-all duration-500 rounded-full"
            style={{ width: `${((step + 1) / techModules.length) * 100}%` }}
          />
        </div>

        <div className="min-h-[400px]">
          {quizMode ? (
            <TechQuiz module={techModules[step]} onPass={nextStep} />
          ) : (
            <div>
              <p className="text-xs font-black tracking-widest text-yellow-500 uppercase mb-2">{techModules[step].title}</p>
              {techModules[step].content}
            </div>
          )}
        </div>

        <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-100">
          <button
            onClick={() => { setStep(Math.max(0, step - 1)); setQuizMode(false) }}
            className={`px-6 py-2 rounded-lg font-bold text-slate-400 hover:text-blue-900 hover:bg-slate-100 transition ${step === 0 ? 'invisible' : ''}`}
          >
            ← Previous
          </button>
          {!quizMode && (
            <button
              onClick={() => setQuizMode(true)}
              className={`px-8 py-3 rounded-xl font-black text-white transition shadow-md ${step === techModules.length - 1 ? 'bg-green-500 hover:bg-green-400' : 'bg-blue-900 hover:bg-blue-800'}`}
            >
              {step === techModules.length - 1 ? 'Take Final Quiz →' : 'Next Module →'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
