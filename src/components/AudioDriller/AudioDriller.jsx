import { useState, useRef, useEffect, useCallback } from 'react'
import { Mic, Square, Bot, FileText, Activity, CheckCircle2, AlertCircle, PlayCircle, StopCircle, Target } from 'lucide-react'

const FILLER_WORDS = ['um', 'uh', 'like', 'you know', 'so', 'basically']
const WEAK_PHRASES = ['maybe', 'kind of', 'sort of', 'i think', 'i guess', 'possibly']
const STRONG_KEYWORDS = ['qualify', 'own', 'savings', 'hydro one', 'lock in', 'neighbor', 'rebate', 'fixed rate', 'no cost', 'zero down', 'stardust']

function analyzeTranscript(text) {
  const lower = text.toLowerCase()
  const words = lower.split(/\s+/)

  const fillers = FILLER_WORDS.filter(w => {
    const re = new RegExp(`\\b${w}\\b`, 'g')
    return (lower.match(re) || []).length > 0
  }).map(w => {
    const re = new RegExp(`\\b${w}\\b`, 'g')
    return { word: w, count: (lower.match(re) || []).length }
  })
  const totalFillers = fillers.reduce((s, f) => s + f.count, 0)

  const weakFound = WEAK_PHRASES.filter(p => lower.includes(p))
  const strongFound = STRONG_KEYWORDS.filter(k => lower.includes(k))

  const feedback = []

  if (totalFillers === 0) {
    feedback.push({ color: 'green', label: 'Clean Delivery', text: 'Zero filler words detected. You sound confident and polished.' })
  } else if (totalFillers <= 3) {
    feedback.push({ color: 'yellow', label: 'Minor Fillers', text: `${totalFillers} filler word(s) detected (${fillers.map(f => `"${f.word}" ×${f.count}`).join(', ')}). Pause instead of filling.` })
  } else {
    feedback.push({ color: 'red', label: 'Too Many Fillers', text: `${totalFillers} filler words detected (${fillers.map(f => `"${f.word}" ×${f.count}`).join(', ')}). Practice pausing silently.` })
  }

  if (weakFound.length > 0) {
    feedback.push({ color: 'red', label: 'Weak Framing', text: `Phrases like "${weakFound.join('", "')}" undermine your authority. State facts, not maybes.` })
  }

  if (strongFound.length >= 3) {
    feedback.push({ color: 'green', label: 'Strong Keywords', text: `Great — you hit ${strongFound.length} key value triggers: ${strongFound.map(k => `"${k}"`).join(', ')}.` })
  } else if (strongFound.length > 0) {
    feedback.push({ color: 'blue', label: 'Keywords', text: `You used ${strongFound.length} strong keyword(s): ${strongFound.map(k => `"${k}"`).join(', ')}. Aim to hit 3+.` })
  } else {
    feedback.push({ color: 'yellow', label: 'Missing Keywords', text: 'No key value triggers detected. Work in words like "qualify", "lock in", or "rebate".' })
  }

  const isSalesy = lower.includes('buy') || lower.includes('purchase') || lower.includes('sign')
  const isNeighbourly = lower.includes('neighbor') || lower.includes('neighbour') || lower.includes('just stopping by')
  if (isNeighbourly && !isSalesy) {
    feedback.push({ color: 'green', label: 'Tone: Neighbour', text: 'Your tone sounds consultative, not sales-y. Homeowners lower their guard for this.' })
  } else if (isSalesy) {
    feedback.push({ color: 'red', label: 'Tone: Salesperson', text: 'Avoid buy/purchase/sign language at the door. You\'re just surveying today.' })
  }

  if (words.length < 20) {
    feedback.push({ color: 'yellow', label: 'Too Short', text: 'Under 20 words detected. Make sure your mic is working and try again with the full script.' })
  }

  return { feedback, wordCount: words.length, strongFound, totalFillers }
}

const COLOR = {
  green: 'border-green-400 bg-green-50 text-green-900',
  blue: 'border-blue-400 bg-blue-50 text-blue-900',
  yellow: 'border-yellow-400 bg-yellow-50 text-yellow-900',
  red: 'border-red-400 bg-red-50 text-red-900',
}
const LABEL_COLOR = {
  green: 'text-green-600',
  blue: 'text-blue-600',
  yellow: 'text-yellow-600',
  red: 'text-red-600',
}
const ICON_MAP = {
  green: <CheckCircle2 size={16} className="text-green-500" />,
  blue: <Activity size={16} className="text-blue-500" />,
  yellow: <AlertCircle size={16} className="text-yellow-500" />,
  red: <AlertCircle size={16} className="text-red-500" />,
}

export default function AudioDriller() {
  const [savedScripts] = useState(() => JSON.parse(localStorage.getItem('solarSavedScripts') || '[]'))
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [audioURL, setAudioURL] = useState(null)
  const [speakingFeedback, setSpeakingFeedback] = useState(false)
  const [drillCount, setDrillCount] = useState(() => parseInt(localStorage.getItem('solarDrillCount') || '0'))
  const [supported, setSupported] = useState(true)
  
  // NEW: Teleprompter tracking state
  const [activeWordIndex, setActiveWordIndex] = useState(-1)

  const recognitionRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  
  // NEW: Refs to keep track of state inside the speech recognition closure
  const accumulatedTranscriptRef = useRef('')
  const activeIndexRef = useRef(-1)
  const scriptWordsRef = useRef([])

  const currentScript = savedScripts[selectedIdx]

  // Update script words ref when script changes
  useEffect(() => {
    scriptWordsRef.current = currentScript ? currentScript.script.split(/\s+/) : []
    setActiveWordIndex(-1)
    activeIndexRef.current = -1
  }, [currentScript])

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { setSupported(false); return }
    const rec = new SR()
    rec.continuous = true
    rec.interimResults = true
    rec.lang = 'en-CA'
    
    rec.onresult = (e) => {
      let currentInterim = ''
      let newFinal = ''
      
      // 1. Better Transcript Accumulation (Catches Fillers)
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          newFinal += e.results[i][0].transcript + ' '
        } else {
          currentInterim += e.results[i][0].transcript
        }
      }
      
      if (newFinal) {
        accumulatedTranscriptRef.current += newFinal
      }
      
      const currentFullTranscript = accumulatedTranscriptRef.current + currentInterim
      setTranscript(currentFullTranscript)
      setInterimTranscript(currentInterim)

      // 2. Pro-Level "Sliding Window" Teleprompter Matcher
      const spokenWords = currentFullTranscript.toLowerCase().trim().split(/\s+/)
      if (spokenWords.length > 0) {
        // Grab the last spoken word and clean it
        const lastSpokenWord = spokenWords[spokenWords.length - 1].replace(/[^\w]/g, '')
        
        // Only search the next 5 words in the script to allow for skipping/stuttering
        const searchLimit = Math.min(activeIndexRef.current + 6, scriptWordsRef.current.length)
        
        for (let i = activeIndexRef.current + 1; i < searchLimit; i++) {
          const cleanScriptWord = scriptWordsRef.current[i].toLowerCase().replace(/[^\w]/g, '')
          if (cleanScriptWord === lastSpokenWord && lastSpokenWord !== '') {
            activeIndexRef.current = i
            setActiveWordIndex(i)
            break
          }
        }
      }
    }
    
    rec.onerror = () => {}
    recognitionRef.current = rec
    return () => rec.abort()
  }, [])

  const startRecording = useCallback(async () => {
    setTranscript('')
    setInterimTranscript('')
    setFeedback(null)
    setAudioURL(null)
    setActiveWordIndex(-1)
    activeIndexRef.current = -1
    accumulatedTranscriptRef.current = ''

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream)
      chunksRef.current = []
      mr.ondataavailable = (e) => chunksRef.current.push(e.data)
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setAudioURL(URL.createObjectURL(blob))
        stream.getTracks().forEach(t => t.stop())
      }
      mr.start()
      mediaRecorderRef.current = mr
    } catch {
      // microphone not available — still allow speech-only mode
    }

    recognitionRef.current?.start()
    setIsRecording(true)
  }, [])

  const stopRecording = useCallback(() => {
    recognitionRef.current?.stop()
    mediaRecorderRef.current?.stop()
    setIsRecording(false)
    setInterimTranscript('')
  }, [])

  useEffect(() => {
    if (!isRecording && transcript.trim().split(/\s+/).length >= 5) {
      const result = analyzeTranscript(transcript)
      setFeedback(result)
      const newCount = drillCount + 1
      setDrillCount(newCount)
      localStorage.setItem('solarDrillCount', String(newCount))
    }
  }, [isRecording])

  function speakFeedback() {
    if (!feedback || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const lines = feedback.feedback.map(f => `${f.label}. ${f.text}`).join('. ')
    const utt = new SpeechSynthesisUtterance(lines)
    utt.rate = 0.95
    utt.onstart = () => setSpeakingFeedback(true)
    utt.onend = () => setSpeakingFeedback(false)
    window.speechSynthesis.speak(utt)
  }

  function stopSpeaking() {
    window.speechSynthesis.cancel()
    setSpeakingFeedback(false)
  }

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="flex justify-between items-end mb-8 animate-fade-in-up">
        <div>
          <h2 className="text-4xl font-black text-blue-900 mb-2">AI Audio Driller</h2>
          <p className="text-slate-500 italic">Record your pitch. Get instant AI coaching on delivery, fillers, and keywords.</p>
        </div>
        <div className="hidden md:block text-right">
          <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">Total Drills</p>
          <p className="text-3xl font-black text-blue-900">{drillCount}</p>
        </div>
      </div>

      {!supported && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 text-sm font-bold flex items-center gap-2 animate-fade-in-up">
          <AlertCircle size={18} /> Speech recognition is not supported in this browser. Use Chrome or Edge.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Controls & Script Selection */}
        <div className="lg:col-span-5 space-y-6 animate-fade-in-up delay-100">
          <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-200 transition-all duration-300 hover:shadow-xl">
            <h3 className="text-sm font-black uppercase tracking-widest text-blue-900 mb-4 flex items-center gap-2">
              <FileText size={16} className="text-yellow-500"/> Select Script
            </h3>
            {savedScripts.length === 0 ? (
              <p className="text-sm text-slate-500 italic bg-slate-50 p-4 rounded-xl border border-slate-100">No saved scripts yet. Build one in the Script Builder first.</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {savedScripts.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedIdx(i)}
                    className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-bold transition-all duration-200 ${selectedIdx === i ? 'border-blue-900 bg-blue-50 text-blue-900 shadow-sm' : 'border-slate-100 hover:border-blue-200 text-slate-600 hover:bg-slate-50'}`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-200 flex flex-col items-center justify-center transition-all duration-300 hover:shadow-xl py-12">
            <div className="relative mb-6">
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  disabled={savedScripts.length === 0}
                  className="w-28 h-28 rounded-full bg-red-500 text-white shadow-lg shadow-red-500/30 flex items-center justify-center transition-all duration-300 transform hover:scale-105 active:scale-95 hover:bg-red-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <Mic size={48} fill="currentColor" />
                </button>
              ) : (
                <>
                  <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-20 scale-150"></div>
                  <button
                    onClick={stopRecording}
                    className="w-28 h-28 rounded-full bg-slate-800 text-white shadow-xl flex items-center justify-center transition-all duration-300 transform hover:scale-105 active:scale-95 hover:bg-slate-700 relative z-10"
                  >
                    <Square size={36} fill="currentColor" />
                  </button>
                </>
              )}
            </div>
            
            <p className={`text-sm font-black uppercase tracking-widest transition-colors duration-300 ${isRecording ? 'text-red-500 animate-pulse' : 'text-slate-400'}`}>
              {isRecording ? '● Recording Live' : 'Tap to Start Drill'}
            </p>

            {audioURL && (
              <div className="w-full mt-8 animate-fade-in-up">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 text-center">Last Recording</p>
                <audio src={audioURL} controls className="w-full h-10 rounded-full" />
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Teleprompter & Transcript */}
        <div className="lg:col-span-7 space-y-6 animate-fade-in-up delay-200">
          
          {/* UPDATED TELEPROMPTER: Karaoke Style */}
          {currentScript ? (
            <div className={`bg-slate-900 p-8 rounded-3xl border-2 transition-all duration-500 relative overflow-hidden ${isRecording ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'border-slate-800 shadow-xl hover:border-slate-700'}`}>
              {isRecording && <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-red-400 to-red-500 animate-pulse"></div>}
              <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Teleprompter</p>
                {isRecording && <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-1 rounded font-bold uppercase tracking-wider flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500 animate-ping"></div> Live</span>}
              </div>
              
              <div className="flex flex-wrap gap-x-2 gap-y-3">
                {scriptWordsRef.current.map((word, i) => (
                  <span
                    key={i}
                    className={`text-2xl font-medium transition-all duration-300 ${
                      i <= activeWordIndex 
                        ? 'text-yellow-400 scale-[1.02] drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]' 
                        : 'text-slate-400 opacity-60'
                    }`}
                  >
                    {word}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-slate-100 p-8 rounded-3xl border-2 border-dashed border-slate-300 text-center flex flex-col items-center justify-center min-h-[200px]">
               <FileText size={32} className="text-slate-300 mb-3" />
               <p className="text-slate-500 font-bold">Select a script to view the teleprompter.</p>
            </div>
          )}

          {/* AI Feedback Wrapper */}
          {feedback ? (
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200 animate-fade-in-up">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <h3 className="font-black text-blue-900 uppercase tracking-widest text-sm flex items-center gap-2">
                  <Bot size={18} className="text-green-500"/> AI Coach Analysis
                </h3>
                <button
                  onClick={speakingFeedback ? stopSpeaking : speakFeedback}
                  className="bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-900 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                >
                  {speakingFeedback ? <><StopCircle size={14}/> Stop Audio</> : <><PlayCircle size={14}/> Listen</>}
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-wider mb-1">Words</p>
                  <p className="text-3xl font-black text-blue-900">{feedback.wordCount}</p>
                </div>
                <div className={`p-4 rounded-2xl border text-center ${feedback.totalFillers > 3 ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
                  <p className={`text-[10px] font-black uppercase tracking-wider mb-1 ${feedback.totalFillers > 3 ? 'text-red-500' : 'text-green-600'}`}>Fillers</p>
                  <p className={`text-3xl font-black ${feedback.totalFillers > 3 ? 'text-red-600' : 'text-green-700'}`}>{feedback.totalFillers}</p>
                </div>
                <div className={`p-4 rounded-2xl border text-center ${feedback.strongFound.length >= 3 ? 'bg-green-50 border-green-100' : 'bg-orange-50 border-orange-100'}`}>
                  <p className={`text-[10px] font-black uppercase tracking-wider mb-1 ${feedback.strongFound.length >= 3 ? 'text-green-600' : 'text-orange-500'}`}>Keywords</p>
                  <p className={`text-3xl font-black ${feedback.strongFound.length >= 3 ? 'text-green-700' : 'text-orange-600'}`}>{feedback.strongFound.length}</p>
                </div>
              </div>

              <div className="space-y-3">
                {feedback.feedback.map((f, i) => (
                  <div key={i} style={{ animationDelay: `${i * 100}ms` }} className={`p-4 rounded-2xl border-l-4 ${COLOR[f.color]} flex items-start gap-3 animate-fade-in-up`}>
                    <div className="mt-0.5">{ICON_MAP[f.color]}</div>
                    <div>
                      <p className={`text-xs font-black uppercase tracking-widest mb-1 ${LABEL_COLOR[f.color]}`}>{f.label}</p>
                      <p className="text-sm font-medium opacity-90">{f.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">What we heard:</p>
                <p className="text-sm text-slate-600 italic leading-relaxed">"{transcript}"</p>
              </div>

            </div>
          ) : (
            <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-200 min-h-[300px] flex flex-col transition-all duration-300">
              <h3 className="font-black text-blue-900 uppercase tracking-widest text-sm flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                <Activity size={18} className={isRecording ? 'text-red-500 animate-pulse' : 'text-blue-400'}/> Live Transcript
              </h3>
              
              {transcript || interimTranscript ? (
                <p className="text-lg text-slate-700 leading-relaxed font-medium">
                  {transcript}
                  {interimTranscript && <span className="text-slate-400 italic"> {interimTranscript}</span>}
                </p>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60">
                  <Target size={48} className="text-slate-300 mb-4" />
                  <p className="text-slate-500 font-bold mb-2">How to drill:</p>
                  <ol className="text-sm text-slate-500 text-left space-y-1">
                    <li>1. Select a saved script from the left.</li>
                    <li>2. Hit the big red record button.</li>
                    <li>3. Read it aloud naturally.</li>
                    <li>4. Hit stop to get AI feedback.</li>
                  </ol>
                </div>
              )}
            </div>
          )}
          
        </div>
      </div>
    </div>
  )
}