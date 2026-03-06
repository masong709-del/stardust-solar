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
        <span className="bg-yellow-500 md:bg-yellow-400 text-slate-900 md:text-blue-900 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider">Quick Check</span>
      </div>
      <h3 className="text-xl font-bold text-white md:text-blue-900 mb-6 text-center leading-snug">{module.quiz.q}</h3>
      <div className="space-y-3 max-w-xl mx-auto">
        {module.quiz.options.map((opt, i) => {
          // THEME FIX: Responsive quiz button styles
          let cls = 'w-full text-left p-4 rounded-xl border-2 font-medium transition-all duration-300 '
          
          if (selected !== null) {
            if (i === module.quiz.correct) {
              cls += 'border-green-500 bg-green-900/20 md:bg-green-50 text-green-400 md:text-green-800'
            } else if (i === selected) {
              cls += 'border-red-500 md:border-red-400 bg-red-900/20 md:bg-red-50 text-red-400 md:text-red-700'
            } else {
              cls += 'border-slate-800 md:border-slate-200 bg-slate-900/50 md:bg-white text-slate-500 md:text-slate-400 opacity-50'
            }
          } else {
            cls += 'border-slate-700 md:border-slate-200 bg-slate-950 md:bg-white text-slate-300 md:text-slate-700 hover:border-blue-500 md:hover:border-blue-400 cursor-pointer shadow-sm hover:shadow-md'
          }
          
          return (
            <button key={i} onClick={() => answer(i)} className={cls} disabled={selected !== null}>
              {opt}
            </button>
          )
        })}
      </div>
      
      {selected !== null && (
        <div className={`mt-6 p-4 rounded-xl text-center font-bold animate-fade-in-up ${selected === module.quiz.correct ? 'text-green-400 md:text-green-700 bg-green-900/20 md:bg-green-50 border border-green-800 md:border-green-200' : 'text-red-400 md:text-red-700 bg-red-900/20 md:bg-red-50 border border-red-800 md:border-red-200'}`}>
          {selected === module.quiz.correct
            ? '✅ Correct! Moving on...'
            : '❌ Not quite — the correct answer is highlighted above.'}
          {selected !== module.quiz.correct && (
            <button onClick={() => setSelected(null)} className="ml-3 px-4 py-1.5 bg-blue-600 md:bg-blue-900 text-white rounded-lg text-sm font-bold hover:bg-blue-500 md:hover:bg-blue-800 transition-colors shadow-sm">
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
    /* BREAKOUT FIX: 
       Mobile: fixed inset-0, overflow-y-auto, bg-slate-950 (Dark Edge-to-Edge)
       Desktop: relative, md:inset-auto, bg-slate-50 (Light, left-aligned)
    */
    <div className="fixed inset-0 overflow-y-auto bg-slate-950 text-slate-300 md:relative md:inset-auto md:bg-slate-50 md:text-slate-800 font-sans transition-colors duration-300">
      
      {/* CONTAINER: Clean padding and max-width for desktop */}
      <div className="w-full min-h-screen p-4 md:p-8 lg:p-12 pb-32 md:max-w-5xl md:mx-0">
        
        <h2 className="text-4xl font-black text-white md:text-blue-900 mb-2 animate-fade-in-up text-center md:text-left">Solar Tech 101</h2>
        <p className="text-slate-400 md:text-slate-500 mb-8 italic animate-fade-in-up delay-100 text-center md:text-left">Master the mechanics to sell the value.</p>

        <div className="bg-slate-900 md:bg-white p-6 md:p-10 rounded-3xl shadow-xl md:shadow-lg border border-slate-800 md:border-slate-200 mt-8 animate-fade-in-up delay-200 transition-all">
          
          {/* Progress Bar */}
          <div className="w-full bg-slate-800 md:bg-slate-100 h-2 rounded-full mb-8 overflow-hidden">
            <div
              className="bg-yellow-500 md:bg-yellow-400 h-full transition-all duration-500 rounded-full"
              style={{ width: `${((step + 1) / techModules.length) * 100}%` }}
            />
          </div>

          {/* Dynamic Content Area */}
          <div className="min-h-[400px]">
            {quizMode ? (
              <div className="animate-fade-in">
                <TechQuiz module={techModules[step]} onPass={nextStep} />
              </div>
            ) : (
              <div className="animate-fade-in">
                <p className="text-xs font-black tracking-widest text-yellow-500 uppercase mb-4">{techModules[step].title}</p>
                {/* Wrapped the content in a container that handles dark/light text cleanly */}
                <div className="text-slate-300 md:text-slate-700 leading-relaxed space-y-4">
                  {techModules[step].content}
                </div>
              </div>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="flex flex-col-reverse sm:flex-row justify-between items-center mt-10 pt-6 border-t border-slate-800 md:border-slate-100 gap-4">
            <button
              onClick={() => { setStep(Math.max(0, step - 1)); setQuizMode(false) }}
              className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-slate-500 md:text-slate-400 hover:text-white md:hover:text-blue-900 hover:bg-slate-800 md:hover:bg-slate-100 transition-colors ${step === 0 ? 'invisible' : ''}`}
            >
              ← Previous
            </button>
            {!quizMode && (
              <button
                onClick={() => setQuizMode(true)}
                className={`w-full sm:w-auto px-8 py-3 rounded-xl font-black text-white transition-all shadow-lg hover:-translate-y-0.5 ${step === techModules.length - 1 ? 'bg-green-600 md:bg-green-500 hover:bg-green-500 md:hover:bg-green-400 shadow-green-500/20' : 'bg-blue-600 md:bg-blue-900 hover:bg-blue-500 md:hover:bg-blue-800 shadow-blue-500/20 md:shadow-sm'}`}
              >
                {step === techModules.length - 1 ? 'Take Final Quiz →' : 'Next Module →'}
              </button>
            )}
          </div>
          
        </div>
      </div>
    </div>
  )
}