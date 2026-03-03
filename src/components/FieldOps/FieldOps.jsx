import { useState, useRef, useCallback } from 'react'

const REQUIRED_PHOTOS = [
  { label: 'Main electrical panel', desc: 'Clear photo of all breakers.' },
  { label: 'Panel labels / index', desc: 'Photo of the full panel index.' },
  { label: 'Meter & mast', desc: 'Wide shot showing clearance from roof edge.' },
  { label: 'Attic access', desc: 'Rafter spacing and size visible.' },
  { label: 'Roof condition', desc: 'Close-up of shingles near install zone.' },
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

function SurveyPhotos() {
  const [projects, setProjects] = useState(() => JSON.parse(localStorage.getItem('stardustPhotoProjects') || '[]'))
  const [address, setAddress] = useState('')
  const [pending, setPending] = useState([]) // [{ name, dataURL }]
  const [dragging, setDragging] = useState(false)
  const fileRef = useRef()

  function saveProjects(updated) {
    setProjects(updated)
    try {
      localStorage.setItem('stardustPhotoProjects', JSON.stringify(updated))
    } catch {
      alert('Storage full — delete old projects to free up space.')
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

  function saveProject() {
    if (!address.trim()) { alert('Enter a project address first.'); return }
    if (pending.length === 0) { alert('Upload at least one photo.'); return }
    const project = {
      id: Date.now(),
      address: address.trim(),
      date: new Date().toLocaleDateString('en-CA'),
      photos: pending.map(p => p.dataURL),
    }
    saveProjects([project, ...projects])
    setAddress('')
    setPending([])
  }

  function deleteProject(id) {
    if (!confirm('Delete this project and all its photos?')) return
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

  return (
    <div className="space-y-8">
      {/* Required checklist */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Required Photos Checklist</p>
        <div className="space-y-2">
          {REQUIRED_PHOTOS.map(({ label, desc }) => (
            <label key={label} className="flex items-start gap-3 text-sm text-slate-700 cursor-pointer">
              <input type="checkbox" className="mt-1 w-4 h-4 accent-blue-900 shrink-0" />
              <span><b>{label}:</b> {desc}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Uploader */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">New Project Upload</p>
        <input
          type="text"
          value={address}
          onChange={e => setAddress(e.target.value)}
          placeholder="Project address (e.g. 123 Maple St, New Liskeard)"
          className="w-full border-2 border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-yellow-400 text-sm mb-4"
        />
        {/* Drop zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => fileRef.current.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${dragging ? 'border-blue-900 bg-blue-50' : 'border-slate-200 hover:border-blue-300'}`}
        >
          <p className="text-3xl mb-2">📷</p>
          <p className="text-sm font-black text-slate-600">Drop photos here or click to browse</p>
          <p className="text-xs text-slate-400 mt-1">Images are auto-compressed to 800px / 60% quality</p>
          <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={e => handleFiles(e.target.files)} />
        </div>

        {/* Pending thumbnails */}
        {pending.length > 0 && (
          <div className="mt-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">{pending.length} photo(s) ready</p>
            <div className="flex flex-wrap gap-2">
              {pending.map((p, i) => (
                <div key={i} className="relative group">
                  <img src={p.dataURL} alt={p.name} className="w-20 h-20 object-cover rounded-xl border border-slate-200" />
                  <button
                    onClick={() => setPending(prev => prev.filter((_, j) => j !== i))}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white rounded-full text-xs font-black opacity-0 group-hover:opacity-100 transition flex items-center justify-center"
                  >×</button>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={saveProject}
          className="mt-4 w-full py-3 bg-blue-900 text-white font-black rounded-xl hover:bg-blue-800 transition"
        >
          Save Project
        </button>
      </div>

      {/* Saved projects gallery */}
      {projects.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Saved Projects ({projects.length})</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {projects.map(project => (
              <div key={project.id} className="border border-slate-200 rounded-2xl p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-black text-sm text-blue-900">{project.address}</p>
                    <p className="text-xs text-slate-400">{project.date} · {project.photos.length} photo{project.photos.length !== 1 ? 's' : ''}</p>
                  </div>
                  <span className="text-2xl">📁</span>
                </div>
                {/* Thumbnail strip */}
                <div className="flex gap-1 mb-3">
                  {project.photos.slice(0, 4).map((url, i) => (
                    <img key={i} src={url} alt="" className="w-14 h-14 object-cover rounded-lg border border-slate-100" />
                  ))}
                  {project.photos.length > 4 && (
                    <div className="w-14 h-14 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-black text-slate-500">
                      +{project.photos.length - 4}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => downloadAll(project)}
                    className="flex-1 py-2 text-xs font-black bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition"
                  >
                    ⬇ Download All
                  </button>
                  <button
                    onClick={() => deleteProject(project.id)}
                    className="py-2 px-3 text-xs font-black bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function FieldOps() {
  const [tab, setTab] = useState('protocol')

  const TAB = 'px-5 py-2 font-black text-sm rounded-xl transition'
  const activeTab = `${TAB} bg-blue-900 text-white`
  const inactiveTab = `${TAB} text-slate-500 hover:text-blue-900`

  return (
    <div className="max-w-5xl mx-auto">
      <h2 className="text-4xl font-black text-blue-900 mb-6">Field Operations Protocol</h2>

      {/* Tab bar */}
      <div className="flex gap-2 mb-8 bg-slate-100 p-1 rounded-2xl w-fit">
        <button onClick={() => setTab('protocol')} className={tab === 'protocol' ? activeTab : inactiveTab}>
          🔧 Field Protocol
        </button>
        <button onClick={() => setTab('photos')} className={tab === 'photos' ? activeTab : inactiveTab}>
          📷 Survey Photos
        </button>
      </div>

      {tab === 'protocol' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
              <span className="text-2xl">📷</span>
              <h3 className="font-black text-xl text-blue-900">Site Survey Checklist</h3>
            </div>
            <div className="space-y-4">
              {[
                { title: '1. Electrical Service', items: ['Main Panel: Clear photo of all breakers.', 'Panel Labels: Photo of the panel index.', 'Meter & Mast: Wide shot showing clearance.'] },
                { title: '2. Structural', items: ['Attic Access: Rafter spacing and size.', 'Roof Condition: Close-up of shingles.'] },
              ].map((group) => (
                <div key={group.title} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <h4 className="font-black text-xs uppercase text-blue-900 tracking-wider mb-2">{group.title}</h4>
                  {group.items.map((item) => (
                    <label key={item} className="flex items-start gap-3 text-sm text-slate-700 mb-2 cursor-pointer">
                      <input type="checkbox" className="mt-1 w-4 h-4 accent-blue-900" />
                      <span dangerouslySetInnerHTML={{ __html: item.replace(/^([^:]+):/, '<b>$1:</b>') }} />
                    </label>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'photos' && <SurveyPhotos />}
    </div>
  )
}
