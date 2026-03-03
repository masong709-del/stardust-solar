import { useRef, useEffect, useState, useCallback } from 'react'
import {
  Square, Triangle, Circle, Minus, ArrowRight, Type,
  Move, Eraser, Undo2, Redo2, Trash2, Download, ClipboardCheck
} from 'lucide-react'

const GRID = 20

const TOOLS = [
  { id: 'rect',     label: 'Plane',  Icon: Square,       group: 'draw' },
  { id: 'triangle', label: 'Dormer', Icon: Triangle,     group: 'draw' },
  { id: 'circle',   label: 'Vent',   Icon: Circle,       group: 'draw' },
  { id: 'line',     label: 'Line',   Icon: Minus,        group: 'draw' },
  { id: 'arrow',    label: 'Arrow',  Icon: ArrowRight,   group: 'draw' },
  { id: 'text',     label: 'Text',   Icon: Type,         group: 'draw' },
  { id: 'move',     label: '',       Icon: Move,         group: 'edit' },
  { id: 'erase',    label: '',       Icon: Eraser,       group: 'edit' },
]

const CHECKLIST = [
  'Roof faces drawn',
  'Direction added',
  'Lengths added',
  'Obstacles added',
  'Relative measurements',
  'Pitch added',
  'Orientation added',
]

const PITCH_OPTIONS = ['', 'Flat', '3/12', '4/12', '5/12', '6/12', '8/12', '10/12', '12/12']

function snap(val) {
  return Math.round(val / GRID) * GRID
}

function getMousePos(canvas, evt) {
  const rect = canvas.getBoundingClientRect()
  const scaleX = canvas.width / rect.width
  const scaleY = canvas.height / rect.height
  let cx = evt.clientX
  let cy = evt.clientY
  if (evt.touches && evt.touches.length > 0) {
    cx = evt.touches[0].clientX
    cy = evt.touches[0].clientY
  }
  return { x: (cx - rect.left) * scaleX, y: (cy - rect.top) * scaleY }
}

// --- Drawing functions ---
function drawRect(ctx, obj) {
  ctx.beginPath()
  ctx.rect(obj.x, obj.y, obj.w, obj.h)
  ctx.strokeStyle = '#1e3a8a'
  ctx.lineWidth = 3
  ctx.fillStyle = 'rgba(30, 58, 138, 0.15)'
  ctx.fill()
  ctx.stroke()
}

function drawCircle(ctx, obj) {
  const radius = Math.sqrt(Math.pow(obj.x2 - obj.x, 2) + Math.pow(obj.y2 - obj.y, 2))
  ctx.beginPath()
  ctx.arc(obj.x, obj.y, radius, 0, Math.PI * 2)
  ctx.strokeStyle = '#ea580c'
  ctx.lineWidth = 3
  ctx.fillStyle = 'rgba(234, 88, 12, 0.15)'
  ctx.fill()
  ctx.stroke()
}

function drawTriangle(ctx, obj) {
  ctx.beginPath()
  const midX = (obj.x + obj.x2) / 2
  ctx.moveTo(midX, obj.y)
  ctx.lineTo(obj.x2, obj.y2)
  ctx.lineTo(obj.x, obj.y2)
  ctx.closePath()
  ctx.strokeStyle = '#047857'
  ctx.lineWidth = 3
  ctx.fillStyle = 'rgba(4, 120, 87, 0.15)'
  ctx.fill()
  ctx.stroke()
}

function drawLine(ctx, obj) {
  ctx.beginPath()
  ctx.moveTo(obj.x, obj.y)
  ctx.lineTo(obj.x2, obj.y2)
  ctx.strokeStyle = '#1e3a8a'
  ctx.lineWidth = 4
  ctx.stroke()
}

function drawArrow(ctx, obj) {
  drawLine(ctx, obj)
  const headlen = 15
  const angle = Math.atan2(obj.y2 - obj.y, obj.x2 - obj.x)
  ctx.beginPath()
  ctx.moveTo(obj.x2, obj.y2)
  ctx.lineTo(
    obj.x2 - headlen * Math.cos(angle - Math.PI / 6),
    obj.y2 - headlen * Math.sin(angle - Math.PI / 6)
  )
  ctx.moveTo(obj.x2, obj.y2)
  ctx.lineTo(
    obj.x2 - headlen * Math.cos(angle + Math.PI / 6),
    obj.y2 - headlen * Math.sin(angle + Math.PI / 6)
  )
  ctx.stroke()
}

function drawTextData(ctx, obj) {
  ctx.font = 'bold 20px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const m = ctx.measureText(obj.text)
  const pad = 6
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
  ctx.fillRect(obj.x - m.width / 2 - pad, obj.y - 10 - pad, m.width + pad * 2, 20 + pad * 2)
  ctx.fillStyle = '#b45309'
  ctx.fillText(obj.text, obj.x, obj.y)
}

function drawCompass(ctx, canvasWidth, canvasHeight, compassAngle) {
  ctx.save()
  ctx.translate(canvasWidth - 50, canvasHeight - 50)
  ctx.beginPath()
  ctx.arc(0, 0, 30, 0, Math.PI * 2)
  ctx.fillStyle = 'white'
  ctx.fill()
  ctx.lineWidth = 2
  ctx.strokeStyle = '#cbd5e1'
  ctx.stroke()
  ctx.rotate((compassAngle * Math.PI) / 180)
  ctx.beginPath()
  ctx.moveTo(0, -20)
  ctx.lineTo(-8, 6)
  ctx.lineTo(0, 0)
  ctx.lineTo(8, 6)
  ctx.closePath()
  ctx.fillStyle = '#ea580c'
  ctx.fill()
  ctx.fillStyle = '#1e293b'
  ctx.font = 'bold 16px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('N', 0, 22)
  ctx.restore()
}

function drawPitchLabel(ctx, canvasHeight, pitch) {
  if (!pitch) return
  ctx.save()
  ctx.font = 'bold 13px sans-serif'
  ctx.textAlign = 'left'
  const label = `Pitch: ${pitch}`
  const m = ctx.measureText(label)
  ctx.fillStyle = 'rgba(255,255,255,0.9)'
  ctx.fillRect(14, canvasHeight - 44, m.width + 16, 28)
  ctx.strokeStyle = '#cbd5e1'
  ctx.lineWidth = 1
  ctx.strokeRect(14, canvasHeight - 44, m.width + 16, 28)
  ctx.fillStyle = '#1e3a8a'
  ctx.fillText(label, 22, canvasHeight - 24)
  ctx.restore()
}

function hitTest(ctx, pos, obj) {
  if (obj.type === 'text') {
    ctx.font = 'bold 20px sans-serif'
    const m = ctx.measureText(obj.text)
    return (
      pos.x >= obj.x - m.width / 2 - 10 &&
      pos.x <= obj.x + m.width / 2 + 10 &&
      pos.y >= obj.y - 15 &&
      pos.y <= obj.y + 15
    )
  }
  if (obj.type === 'circle') {
    const r = Math.sqrt(Math.pow(obj.x2 - obj.x, 2) + Math.pow(obj.y2 - obj.y, 2))
    return Math.sqrt(Math.pow(pos.x - obj.x, 2) + Math.pow(pos.y - obj.y, 2)) <= r
  }
  if (obj.type === 'rect') {
    const rx = Math.min(obj.x, obj.x + obj.w)
    const ry = Math.min(obj.y, obj.y + obj.h)
    const rw = Math.abs(obj.w)
    const rh = Math.abs(obj.h)
    return pos.x >= rx && pos.x <= rx + rw && pos.y >= ry && pos.y <= ry + rh
  }
  const pad = 20
  return (
    pos.x >= Math.min(obj.x, obj.x2) - pad &&
    pos.x <= Math.max(obj.x, obj.x2) + pad &&
    pos.y >= Math.min(obj.y, obj.y2) - pad &&
    pos.y <= Math.max(obj.y, obj.y2) + pad
  )
}

export default function SiteSketcher() {
  const canvasRef = useRef(null)
  const [activeTool, setActiveTool] = useState('rect')
  const [pitch, setPitch] = useState('')
  const [compassAngle, setCompassAngle] = useState(0)
  const [checklist, setChecklist] = useState(() => Object.fromEntries(CHECKLIST.map(c => [c, false])))

  // Mutable refs for drawing state (avoids stale closures in event listeners)
  const sketchObjectsRef = useRef([])
  const historyStackRef = useRef([[]])
  const currentStepRef = useRef(0)
  const isDrawingRef = useRef(false)
  const tempObjRef = useRef(null)
  const movingObjIndexRef = useRef(-1)
  const dragOffsetRef = useRef({ x: 0, y: 0, x2: 0, y2: 0 })
  const activeToolRef = useRef('rect')
  const pitchRef = useRef('')
  const compassAngleRef = useRef(0)

  // Keep refs in sync with state
  useEffect(() => { activeToolRef.current = activeTool }, [activeTool])
  useEffect(() => { pitchRef.current = pitch }, [pitch])
  useEffect(() => { compassAngleRef.current = compassAngle }, [compassAngle])

  const redraw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    sketchObjectsRef.current.forEach(obj => {
      if (obj.type === 'rect') drawRect(ctx, obj)
      if (obj.type === 'circle') drawCircle(ctx, obj)
      if (obj.type === 'triangle') drawTriangle(ctx, obj)
      if (obj.type === 'line') drawLine(ctx, obj)
      if (obj.type === 'arrow') drawArrow(ctx, obj)
      if (obj.type === 'text') drawTextData(ctx, obj)
    })

    const tmp = tempObjRef.current
    if (tmp) {
      if (tmp.type === 'rect') drawRect(ctx, tmp)
      if (tmp.type === 'circle') drawCircle(ctx, tmp)
      if (tmp.type === 'triangle') drawTriangle(ctx, tmp)
      if (tmp.type === 'line') drawLine(ctx, tmp)
      if (tmp.type === 'arrow') drawArrow(ctx, tmp)
    }

    drawCompass(ctx, canvas.width, canvas.height, compassAngleRef.current)
    drawPitchLabel(ctx, canvas.height, pitchRef.current)
  }, [])

  const saveState = useCallback(() => {
    historyStackRef.current = historyStackRef.current.slice(0, currentStepRef.current + 1)
    historyStackRef.current.push(JSON.parse(JSON.stringify(sketchObjectsRef.current)))
    currentStepRef.current++
  }, [])

  const undo = useCallback(() => {
    if (currentStepRef.current > 0) {
      currentStepRef.current--
      sketchObjectsRef.current = JSON.parse(JSON.stringify(historyStackRef.current[currentStepRef.current]))
      redraw()
    }
  }, [redraw])

  const redo = useCallback(() => {
    if (currentStepRef.current < historyStackRef.current.length - 1) {
      currentStepRef.current++
      sketchObjectsRef.current = JSON.parse(JSON.stringify(historyStackRef.current[currentStepRef.current]))
      redraw()
    }
  }, [redraw])

  const clearSketch = useCallback(() => {
    if (window.confirm('Clear the entire blueprint?')) {
      sketchObjectsRef.current = []
      saveState()
      redraw()
    }
  }, [saveState, redraw])

  const exportPNG = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const date = new Date().toISOString().slice(0, 10)
    const a = document.createElement('a')
    a.download = `stardust-sketch-${date}.png`
    a.href = canvas.toDataURL('image/png')
    a.click()
  }, [])

  // Redraw when compass or pitch changes
  useEffect(() => { redraw() }, [compassAngle, pitch, redraw])

  // Set up canvas event listeners
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    function startAction(e) {
      e.preventDefault()
      const pos = getMousePos(canvas, e)
      const sx = snap(pos.x)
      const sy = snap(pos.y)
      const tool = activeToolRef.current

      if (tool === 'text') {
        const txt = window.prompt("Enter measurement or label (e.g. '14 ft', 'Plumbing Vent'):")
        if (txt && txt.trim() !== '') {
          sketchObjectsRef.current.push({ type: 'text', text: txt, x: sx, y: sy })
          saveState()
          redraw()
        }
        return
      }

      if (tool === 'erase') {
        for (let i = sketchObjectsRef.current.length - 1; i >= 0; i--) {
          if (hitTest(ctx, pos, sketchObjectsRef.current[i])) {
            sketchObjectsRef.current.splice(i, 1)
            saveState()
            redraw()
            break
          }
        }
        return
      }

      isDrawingRef.current = true

      if (tool === 'move') {
        movingObjIndexRef.current = -1
        for (let i = sketchObjectsRef.current.length - 1; i >= 0; i--) {
          if (hitTest(ctx, pos, sketchObjectsRef.current[i])) {
            movingObjIndexRef.current = i
            dragOffsetRef.current.x = sx - sketchObjectsRef.current[i].x
            dragOffsetRef.current.y = sy - sketchObjectsRef.current[i].y
            if (sketchObjectsRef.current[i].x2 !== undefined) {
              dragOffsetRef.current.x2 = sx - sketchObjectsRef.current[i].x2
              dragOffsetRef.current.y2 = sy - sketchObjectsRef.current[i].y2
            }
            break
          }
        }
      } else {
        tempObjRef.current = { type: tool, x: sx, y: sy, x2: sx, y2: sy, w: 0, h: 0 }
      }
    }

    function moveAction(e) {
      if (!isDrawingRef.current) return
      e.preventDefault()
      const pos = getMousePos(canvas, e)
      const cx = snap(pos.x)
      const cy = snap(pos.y)
      const tool = activeToolRef.current

      if (tool === 'move' && movingObjIndexRef.current > -1) {
        const obj = sketchObjectsRef.current[movingObjIndexRef.current]
        obj.x = cx - dragOffsetRef.current.x
        obj.y = cy - dragOffsetRef.current.y
        if (obj.x2 !== undefined) {
          obj.x2 = cx - dragOffsetRef.current.x2
          obj.y2 = cy - dragOffsetRef.current.y2
        }
      } else if (tempObjRef.current) {
        if (tool === 'rect') {
          tempObjRef.current.w = cx - tempObjRef.current.x
          tempObjRef.current.h = cy - tempObjRef.current.y
        } else {
          tempObjRef.current.x2 = cx
          tempObjRef.current.y2 = cy
        }
      }
      redraw()
    }

    function endAction() {
      let stateChanged = false
      const tool = activeToolRef.current

      if (tool === 'move' && movingObjIndexRef.current > -1) {
        stateChanged = true
      } else if (tool !== 'move' && tool !== 'erase' && tool !== 'text' && tempObjRef.current) {
        const tmp = tempObjRef.current
        if (tool === 'rect' && Math.abs(tmp.w) > 0) {
          sketchObjectsRef.current.push(tmp)
          stateChanged = true
        } else if (tool !== 'rect' && (Math.abs(tmp.x2 - tmp.x) > 0 || Math.abs(tmp.y2 - tmp.y) > 0)) {
          sketchObjectsRef.current.push(tmp)
          stateChanged = true
        }
      }

      isDrawingRef.current = false
      tempObjRef.current = null
      movingObjIndexRef.current = -1

      if (stateChanged) saveState()
      redraw()
    }

    canvas.addEventListener('mousedown', startAction)
    canvas.addEventListener('mousemove', moveAction)
    canvas.addEventListener('mouseup', endAction)
    canvas.addEventListener('mouseout', endAction)
    canvas.addEventListener('touchstart', startAction, { passive: false })
    canvas.addEventListener('touchmove', moveAction, { passive: false })
    canvas.addEventListener('touchend', endAction)

    redraw()

    return () => {
      canvas.removeEventListener('mousedown', startAction)
      canvas.removeEventListener('mousemove', moveAction)
      canvas.removeEventListener('mouseup', endAction)
      canvas.removeEventListener('mouseout', endAction)
      canvas.removeEventListener('touchstart', startAction)
      canvas.removeEventListener('touchmove', moveAction)
      canvas.removeEventListener('touchend', endAction)
    }
  }, [saveState, redraw])

  function toolBtnClass(id) {
    if (id === activeTool) {
      if (id === 'text') return 'tool-active bg-yellow-500 text-yellow-900 border border-yellow-400 px-3 py-2 rounded-lg text-sm font-bold transition'
      if (id === 'erase') return 'tool-active bg-red-600 text-white border border-red-700 px-3 py-2 rounded-lg text-sm font-bold transition'
      return 'tool-active bg-blue-900 text-white border border-blue-900 px-3 py-2 rounded-lg text-sm font-bold transition'
    }
    if (id === 'text') return 'bg-yellow-100 border border-yellow-300 text-yellow-800 px-3 py-2 rounded-lg text-sm font-bold transition hover:bg-yellow-200'
    if (id === 'erase') return 'bg-white border border-slate-200 text-red-500 px-3 py-2 rounded-lg text-sm font-bold transition hover:bg-red-50'
    return 'bg-white border border-slate-200 text-slate-600 px-3 py-2 rounded-lg text-sm font-bold transition hover:bg-slate-100'
  }

  const toggleCheck = (item) =>
    setChecklist(prev => ({ ...prev, [item]: !prev[item] }))

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-4xl font-black text-blue-900 mb-2">Site Sketcher</h2>
          <p className="text-slate-500 italic">Draft roof planes, vents, and dimensions for the design team.</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-200">
        {/* Toolbar */}
        <div className="flex flex-wrap gap-2 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100 items-center justify-between">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-black uppercase text-slate-400 self-center mr-1">Draw:</span>
            {TOOLS.filter(t => t.group === 'draw').map(({ id, label, Icon }) => (
              <button key={id} onClick={() => setActiveTool(id)} className={toolBtnClass(id)}>
                <Icon size={14} className="inline mr-1" />{label}
              </button>
            ))}

            <div className="w-px bg-slate-300 mx-1 hidden md:block h-8" />

            <span className="text-xs font-black uppercase text-slate-400 self-center mx-1">Edit:</span>
            {TOOLS.filter(t => t.group === 'edit').map(({ id, Icon }) => (
              <button key={id} onClick={() => setActiveTool(id)} className={toolBtnClass(id)} title={id === 'move' ? 'Move Object' : 'Erase Object'}>
                <Icon size={14} />
              </button>
            ))}
          </div>

          <div className="flex gap-2 flex-wrap items-center">
            <select
              value={pitch}
              onChange={e => {
                setPitch(e.target.value)
                if (e.target.value) {
                  setChecklist(prev => ({ ...prev, 'Pitch added': true }))
                }
              }}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 bg-white outline-none focus:border-yellow-400"
              title="Roof Pitch"
            >
              {PITCH_OPTIONS.map(p => (
                <option key={p} value={p}>{p || 'Pitch…'}</option>
              ))}
            </select>
            <button onClick={undo} className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-bold transition hover:bg-slate-100" title="Undo">
              <Undo2 size={14} />
            </button>
            <button onClick={redo} className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-bold transition hover:bg-slate-100" title="Redo">
              <Redo2 size={14} />
            </button>
            <button onClick={clearSketch} className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm font-bold transition hover:bg-red-100" title="Clear All">
              <Trash2 size={14} />
            </button>
            <button onClick={exportPNG} className="bg-blue-900 border border-blue-800 text-white px-4 py-2 rounded-lg text-sm font-bold transition hover:bg-blue-800 flex items-center gap-1" title="Export PNG">
              <Download size={14} /> PNG
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div className="border-2 border-slate-300 rounded-xl overflow-hidden blueprint-bg relative shadow-inner">
          <canvas
            ref={canvasRef}
            width={1000}
            height={500}
            className="w-full h-auto cursor-crosshair touch-none"
          />
          <div className="absolute bottom-4 right-20 bg-white/90 p-2 rounded-lg shadow-md border border-slate-200 flex items-center gap-2 backdrop-blur-sm">
            <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Compass °:</label>
            <input
              type="number"
              value={compassAngle}
              onChange={e => setCompassAngle(parseFloat(e.target.value) || 0)}
              className="w-16 border border-slate-300 rounded px-2 py-1 text-sm font-bold text-blue-900 outline-none focus:border-yellow-500"
            />
          </div>
        </div>

        {/* Validation Checklist */}
        <div className="mt-6 border-t border-slate-100 pt-6">
          <h4 className="font-black text-sm uppercase tracking-widest text-blue-900 mb-4 flex items-center gap-2">
            <ClipboardCheck size={16} className="text-green-500" /> Validation Checklist
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {CHECKLIST.map(item => (
              <label key={item} className="flex items-center gap-2 text-sm text-slate-600 font-medium cursor-pointer hover:text-blue-900">
                <input
                  type="checkbox"
                  checked={checklist[item]}
                  onChange={() => toggleCheck(item)}
                  className="w-5 h-5 accent-green-500 rounded"
                />
                {item}
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
