import { useState, useRef, useCallback, useEffect } from 'react'
import { Camera, UploadCloud, MapPin, CheckCircle2, Circle, Trash2, Download, Image as ImageIcon, Zap, Home, ChevronRight } from 'lucide-react'

const REQUIRED_PHOTOS = [
  { id: 'panel', label: 'Main Electrical Panel', desc: 'Clear photo of all breakers and main rating.' },
  { id: 'index', label: 'Panel Labels / Index', desc: 'Photo of the full panel index inside the door.' },
  { id: 'meter', label: 'Meter & Mast', desc: 'Wide shot showing clearance from roof edge.' },
  { id: 'attic', label: 'Attic Access', desc: 'Rafter spacing and size visible.' },
  { id: 'roof', label: 'Roof Condition', desc: 'Close-up of shingles near install zone.' },
]

function compressImage(file) {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const MAX = 800
      let { width, height } = img
      if (width > MAX) { height = Math.round(height * MAX / width); width = MAX }
      const canvas = document.createElement('canvas')
      canvas.width = width; canvas.height = height
      canvas.getContext('2d').drawImage(img, 0, 0, width, height)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.6))
    }
    img.src = url
  })
}

export default function FieldOps() {
  const [projects, setProjects] = useState(() => JSON.parse(localStorage.getItem('stardustPhotoProjects') || '[]'))
  
  // Active Survey State
  const [address, setAddress] = useState('')
  const [pending, setPending] = useState([]) // [{ name, dataURL }]
  const [checklist, setChecklist] = useState(() => Object.fromEntries(REQUIRED_PHOTOS.map(p => [p.id, false])))
  const [dragging, setDragging] = useState(false)
  
  const fileRef = useRef()
  const cameraRef = useRef()

  function saveProjects(updated) {
    setProjects(updated)
    try {
      localStorage.setItem('stardustPhotoProjects', JSON.stringify(updated))
    } catch {
      alert('Storage full — delete old projects or download them to free up space.')
    }
  }

  const handleFiles = useCallback(async (files) => {
    const compressed = await Promise.all(
      Array.from(files).filter(f => f.type.startsWith('image/')).map(async f => ({
        name: f.name,
        dataURL: await compressImage(f),
      }))
    )
    setPending(prev => [...prev, ...compressed])
  }, [])

  function onDrop(e) {
    e.preventDefault(); setDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  function toggleCheck(id) {
    setChecklist(prev => ({ ...prev, [id]: !prev[id] }))
  }

  function saveProject() {
    if (!address.trim()) { alert('Enter a project address first.'); return }
    if (pending.length === 0) { alert('Upload at least one photo.'); return }
    
    const completedTasks = Object.values(checklist).filter(Boolean).length
    
    const project = {
      id: Date.now(),
      address: address.trim(),
      date: new Date().toLocaleDateString('en-CA'),
      photos: pending.map(p => p.dataURL),
      score: `${completedTasks}/${REQUIRED_PHOTOS.length}`
    }
    
    saveProjects([project, ...projects])
    
    // Reset form
    setAddress('')
    setPending([])
    setChecklist(Object.fromEntries(REQUIRED_PHOTOS.map(p => [p.id, false])))
  }

  function deleteProject(id) {
    if (!window.confirm('Delete this survey and all its photos?')) return
    saveProjects(projects.filter(p => p.id !== id))
  }

  function downloadAll(project) {
    project.photos.forEach((dataURL, i) => {
      const a = document.createElement('a')
      a.href = dataURL
      a.download = `${project.address.replace(/\s+/g, '_')}_photo_${i + 1}.jpg`
      a.click()
    })
  }

  const allChecked = Object.values(checklist).every(Boolean)

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <div className="flex justify-between items-end mb-8 animate-fade-in-up">
        <div>
          <h2 className="text-4xl font-black text-blue-900 mb-2">Site Survey Database</h2>
          <p className="text-slate-500 italic">Capture, verify, and store pre-install technical photos.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Active Survey Builder */}
        <div className="xl:col-span-5 space-y-6 animate-fade-in-up delay-100">
          <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-200 transition-all duration-300 sticky top-10">
            
            <h3 className="font-black text-lg text-blue-900 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
              <Home className="text-yellow-500" size={20} /> Start New Survey
            </h3>

            {/* Address Input */}
            <div className="mb-6">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Project Address</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="e.g. 123 Lakeshore Rd, Temiskaming Shores"
                  className="w-full pl-10 pr-4 py-3 border-2 border-slate-100 rounded-xl bg-slate-50 text-blue-900 font-bold outline-none focus:border-blue-400 focus:bg-white transition-colors text-sm shadow-inner"
                />
              </div>
            </div>

            {/* Camera / Upload Actions */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button 
                onClick={() => cameraRef.current.click()}
                className="bg-blue-900 text-white p-4 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-blue-800 transition-all duration-300 transform active:scale-95 shadow-md hover:shadow-lg group"
              >
                <div className="bg-blue-800 p-3 rounded-full group-hover:scale-110 transition-transform">
                  <Camera size={24} className="text-yellow-400" />
                </div>
                <span className="text-xs font-black uppercase tracking-wider">Take Photo</span>
              </button>

              <div 
                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                onClick={() => fileRef.current.click()}
                className={`border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-300 transform active:scale-95 ${dragging ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'}`}
              >
                <div className="bg-slate-100 p-3 rounded-full text-slate-500">
                  <UploadCloud size={24} />
                </div>
                <span className="text-xs font-bold text-slate-500">Upload Files</span>
              </div>

              {/* Hidden Inputs */}
              <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={e => handleFiles(e.target.files)} />
              <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={e => handleFiles(e.target.files)} />
            </div>

            {/* Pending Photo Strip */}
            {pending.length > 0 && (
              <div className="mb-6 animate-fade-in-up">
                <div className="flex justify-between items-end mb-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-blue-900">Captured Photos ({pending.length})</label>
                  <span className="text-[10px] text-slate-400 italic">Auto-compressed</span>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar snap-x">
                  {pending.map((p, i) => (
                    <div key={i} className="relative group shrink-0 snap-start">
                      <img src={p.dataURL} alt={p.name} className="w-20 h-20 object-cover rounded-xl border-2 border-slate-200 shadow-sm transition-transform hover:scale-105" />
                      <button
                        onClick={() => setPending(prev => prev.filter((_, j) => j !== i))}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-sm font-black opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center shadow-md hover:bg-red-600 hover:scale-110"
                      >×</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Interactive Validation Checklist */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 mb-6">
              <div className="flex justify-between items-center mb-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Validation Checklist</label>
                {allChecked && <span className="text-[10px] font-bold uppercase tracking-widest text-green-600 flex items-center gap-1"><CheckCircle2 size={12}/> Verified</span>}
              </div>
              <div className="space-y-3">
                {REQUIRED_PHOTOS.map(({ id, label, desc }) => {
                  const isChecked = checklist[id]
                  return (
                    <div 
                      key={id} 
                      onClick={() => toggleCheck(id)}
                      className={`flex items-start gap-3 p-2 rounded-xl cursor-pointer transition-colors ${isChecked ? 'bg-green-50/50' : 'hover:bg-white'}`}
                    >
                      <div className="mt-0.5 shrink-0 transition-transform active:scale-75">
                        {isChecked ? <CheckCircle2 size={20} className="text-green-500" /> : <Circle size={20} className="text-slate-300" />}
                      </div>
                      <div>
                        <p className={`text-sm font-bold transition-colors ${isChecked ? 'text-green-800' : 'text-slate-700'}`}>
                          {id === 'panel' ? <Zap size={14} className="inline mr-1 text-orange-400 mb-0.5"/> : ''}
                          {label}
                        </p>
                        <p className={`text-xs transition-colors ${isChecked ? 'text-green-600/70' : 'text-slate-500'}`}>{desc}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={saveProject}
              className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 transform active:scale-95 shadow-lg ${address && pending.length > 0 ? 'bg-green-500 text-white hover:bg-green-400 hover:shadow-green-500/30' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
            >
              <UploadCloud size={18} /> Save Survey to Database
            </button>

          </div>
        </div>

        {/* RIGHT COLUMN: Saved Projects Gallery */}
        <div className="xl:col-span-7 animate-fade-in-up delay-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-black text-xl text-blue-900"><i className="fas fa-folder-open text-yellow-400 mr-2"></i>Completed Surveys</h3>
            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">{projects.length} Total</span>
          </div>

          {projects.length === 0 ? (
            <div className="bg-slate-100 border-2 border-dashed border-slate-300 rounded-3xl p-16 text-center flex flex-col items-center justify-center">
              <ImageIcon size={48} className="text-slate-300 mb-4" />
              <p className="text-slate-500 font-bold text-lg">No surveys saved yet.</p>
              <p className="text-slate-400 text-sm mt-1">Your saved property photos and technical verifications will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {projects.map((project, idx) => (
                <div 
                  key={project.id} 
                  style={{ animationDelay: `${idx * 50}ms` }}
                  className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 group flex flex-col animate-fade-in-up"
                >
                  
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 pr-4">
                      <h4 className="font-black text-blue-900 text-lg leading-tight group-hover:text-blue-700 transition-colors line-clamp-2">{project.address}</h4>
                      <p className="text-xs text-slate-400 font-medium mt-1">{project.date}</p>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 p-2 rounded-xl text-center shrink-0">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Reqs</p>
                      <p className="text-sm font-black text-green-600">{project.score}</p>
                    </div>
                  </div>

                  {/* Thumbnail Mosaic */}
                  <div className="flex gap-2 mb-6">
                    {project.photos.slice(0, 3).map((url, i) => (
                      <img key={i} src={url} alt="" className="w-16 h-16 object-cover rounded-xl border border-slate-200 shadow-sm transition-transform hover:scale-110 cursor-pointer" />
                    ))}
                    {project.photos.length > 3 && (
                      <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-sm font-black text-slate-500 shadow-sm">
                        +{project.photos.length - 3}
                      </div>
                    )}
                  </div>

                  {/* Card Actions */}
                  <div className="mt-auto flex gap-2 border-t border-slate-100 pt-4">
                    <button
                      onClick={() => downloadAll(project)}
                      className="flex-1 py-2.5 text-xs font-black bg-blue-50 text-blue-900 rounded-xl hover:bg-blue-900 hover:text-white transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <Download size={14} /> Download
                    </button>
                    <button
                      onClick={() => deleteProject(project.id)}
                      className="py-2.5 px-4 text-xs font-black bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all duration-300"
                      title="Delete Survey"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}