import { useState, useRef, useEffect, useCallback } from 'react'

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
  green: 'border-green-400 bg-green-900/20 text-green-300',
  blue: 'border-blue-400 bg-blue-900/20 text-blue-300',
  yellow: 'border-yellow-400 bg-yellow-900/20 text-yellow-200',
  red: 'border-red-400 bg-red-900/20 text-red-300',
}
const LABEL_COLOR = {
  green: 'text-green-400',
  blue: 'text-blue-300',
  yellow: 'text-yellow-300',
  red: 'text-red-400',
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

  const recognitionRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])

  const currentScript = savedScripts[selectedIdx]

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { setSupported(false); return }
    const rec = new SR()
    rec.continuous = true
    rec.interimResults = true
    rec.lang = 'en-CA'
    rec.onresult = (e) => {
      let final = ''
      let interim = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript + ' '
        else interim += e.results[i][0].transcript
      }
      setTranscript(prev => prev + final)
      setInterimTranscript(interim)
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
    <div className="max-w-5xl mx-auto">
      <h2 className="text-4xl font-black text-blue-900 mb-2">AI Audio Driller</h2>
      <p className="text-slate-500 mb-8 italic">Record your pitch. Get instant AI coaching on delivery, fillers, and keywords.</p>

      {!supported && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 text-sm">
          Speech recognition is not supported in this browser. Use Chrome or Edge for the full experience.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Teleprompter + Controls */}
        <div className="space-y-6">
          {/* Script selector */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Select Script</p>
            {savedScripts.length === 0 ? (
              <p className="text-sm text-slate-500 italic">No saved scripts yet. Build one in the D2D Script Builder first.</p>
            ) : (
              <div className="space-y-2">
                {savedScripts.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedIdx(i)}
                    className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition ${selectedIdx === i ? 'border-blue-900 bg-blue-50 text-blue-900' : 'border-slate-100 hover:border-blue-200 text-slate-700'}`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Teleprompter */}
          {currentScript && (
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-700">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">Teleprompter</p>
              <p className="text-white text-sm leading-relaxed font-medium">{currentScript.script}</p>
            </div>
          )}

          {/* Record button */}
          <div className="flex flex-col items-center gap-4">
            {!isRecording ? (
              <button
                onClick={startRecording}
                disabled={savedScripts.length === 0}
                className="w-24 h-24 rounded-full bg-red-600 hover:bg-red-500 transition shadow-xl flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <span className="text-4xl">🎙️</span>
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="w-24 h-24 rounded-full bg-slate-700 hover:bg-slate-600 transition shadow-xl flex items-center justify-center animate-pulse"
              >
                <span className="text-4xl">⏹️</span>
              </button>
            )}
            <p className="text-sm font-black text-slate-500 uppercase tracking-widest">
              {isRecording ? '● Recording...' : 'Tap to Record'}
            </p>
          </div>

          {/* Playback */}
          {audioURL && (
            <div className="bg-white p-4 rounded-2xl border border-slate-200">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Playback</p>
              <audio src={audioURL} controls className="w-full" />
            </div>
          )}

          {/* Drill counter */}
          <div className="text-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Drills Completed: </span>
            <span className="font-black text-blue-900">{drillCount}</span>
          </div>
        </div>

        {/* Right: Transcript + Feedback */}
        <div className="space-y-6">
          {/* Live transcript */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 min-h-[140px]">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Live Transcript</p>
            {transcript || interimTranscript ? (
              <p className="text-sm text-slate-700 leading-relaxed">
                {transcript}
                {interimTranscript && <span className="text-slate-400 italic">{interimTranscript}</span>}
              </p>
            ) : (
              <p className="text-sm text-slate-400 italic">
                {isRecording ? 'Listening...' : 'Your transcript will appear here.'}
              </p>
            )}
          </div>

          {/* AI Feedback */}
          {feedback && (
            <div className="bg-slate-900 p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">AI Coach Feedback</p>
                <button
                  onClick={speakingFeedback ? stopSpeaking : speakFeedback}
                  className="text-xs font-bold text-yellow-400 hover:text-yellow-300 transition uppercase tracking-wider"
                >
                  {speakingFeedback ? '⏹ Stop' : '🔊 Listen'}
                </button>
              </div>
              <div className="space-y-3">
                {feedback.feedback.map((f, i) => (
                  <div key={i} className={`p-4 rounded-xl border-l-4 ${COLOR[f.color]}`}>
                    <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${LABEL_COLOR[f.color]}`}>{f.label}</p>
                    <p className="text-sm">{f.text}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-slate-700 grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-2xl font-black text-white">{feedback.wordCount}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">Words</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-white">{feedback.totalFillers}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">Fillers</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-white">{feedback.strongFound.length}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">Keywords</p>
                </div>
              </div>
            </div>
          )}

          {!feedback && !isRecording && (
            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 text-center">
              <p className="text-4xl mb-3">🎯</p>
              <p className="font-black text-blue-900 mb-1">How it works</p>
              <ol className="text-sm text-slate-600 text-left space-y-2 mt-3">
                <li>1. Select a saved script above</li>
                <li>2. Read it aloud from the teleprompter</li>
                <li>3. Hit stop when done</li>
                <li>4. Get instant feedback on fillers, keywords, and tone</li>
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
