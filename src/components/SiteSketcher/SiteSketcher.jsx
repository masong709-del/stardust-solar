import { useRef, useEffect, useState, useCallback } from 'react'
import {
  Square, Home, Circle, Minus, ArrowRight, Type,
  Move, Eraser, Undo2, Redo2, Trash2, Download, ClipboardCheck,
  Palette, BoxSelect, Hexagon, Save, FolderOpen
} from 'lucide-react'

// Coordinate system remains 1000x500 regardless of screen size
const VIRTUAL_W = 1000
const VIRTUAL_H = 500
const GRID = 20

const TOOLS = [
  { id: 'rect',   label: 'Plane',  Icon: Square,     group: 'draw' },
  { id: 'poly',   label: 'Custom', Icon: Hexagon,    group: 'draw' }, // NEW: Polygon Tool
  { id: 'dormer', label: 'Dormer', Icon: Home,       group: 'draw' },
  { id: 'circle', label: 'Vent',   Icon: Circle,     group: 'draw' },
  { id: 'line',   label: 'Line',   Icon: Minus,      group: 'draw' },
  { id: 'arrow',  label: 'Arrow',  Icon: ArrowRight, group: 'draw' },
  { id: 'text',   label: 'Text',   Icon: Type,       group: 'draw' },
  { id: 'move',   label: '',       Icon: Move,       group: 'edit' },
  { id: 'erase',  label: '',       Icon: Eraser,     group: 'edit' },
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
  const scaleX = VIRTUAL_W / rect.width
  const scaleY = VIRTUAL_H / rect.height
  let cx = evt.clientX
  let cy = evt.clientY
  if (evt.touches && evt.touches.length > 0) {
    cx = evt.touches[0].clientX
    cy = evt.touches[0].clientY
  }
  return { x: (cx - rect.left) * scaleX, y: (cy - rect.top) * scaleY }
}

// --- Drawing functions ---
function getRgbaFromHex(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16) || 30
  const g = parseInt(hex.slice(3, 5), 16) || 58
  const b = parseInt(hex.slice(5, 7), 16) || 138
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function drawRect(ctx, obj) {
  const color = obj.color || '#1e3a8a'
  ctx.beginPath()
  ctx.rect(obj.x, obj.y, obj.w, obj.h)
  ctx.strokeStyle = color
  ctx.lineWidth = 3
  ctx.fillStyle = getRgbaFromHex(color, 0.15)
  ctx.fill()
  ctx.stroke()
}

// NEW: Polygon Drawing Logic
function drawPoly(ctx, obj) {
  if (!obj.points || obj.points.length === 0) return
  const color = obj.color || '#1e3a8a'
  
  ctx.beginPath()
  ctx.moveTo(obj.points[0].x, obj.points[0].y)
  for (let i = 1; i < obj.points.length; i++) {
    ctx.lineTo(obj.points[i].x, obj.points[i].y)
  }
  
  if (!obj.closed && obj.currentPos) {
    ctx.lineTo(obj.currentPos.x, obj.currentPos.y) // Draw active line to mouse
  }
  if (obj.closed) ctx.closePath()

  ctx.strokeStyle = color
  ctx.lineWidth = 3
  
  if (obj.closed) {
    ctx.fillStyle = getRgbaFromHex(color, 0.15)
    ctx.fill()
  }
  ctx.stroke()

  // Draw vertices if currently building the shape
  if (!obj.closed) {
    obj.points.forEach(p => {
      ctx.beginPath()
      ctx.arc(p.x, p.y, 5, 0, Math.PI * 2)
      ctx.fillStyle = color
      ctx.fill()
      ctx.stroke()
    })
  }
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

function drawDormer(ctx, obj) {
  const rx = Math.min(obj.x, obj.x2)
  const ry = Math.min(obj.y, obj.y2)
  const rw = Math.abs(obj.x2 - obj.x)
  const rh = Math.abs(obj.y2 - obj.y)

  ctx.beginPath()
  ctx.rect(rx, ry, rw, rh)
  ctx.strokeStyle = '#047857'
  ctx.lineWidth = 3
  ctx.fillStyle = 'rgba(4, 120, 87, 0.15)'
  ctx.fill()
  ctx.stroke()

  ctx.beginPath()
  if (obj.dormerType === 'hip') {
    if (rh > rw) {
      const ridgeEnd = ry + rh * 0.33
      ctx.moveTo(rx + rw/2, ry + rh)
      ctx.lineTo(rx + rw/2, ridgeEnd)
      ctx.lineTo(rx, ry)
      ctx.moveTo(rx + rw/2, ridgeEnd)
      ctx.lineTo(rx + rw, ry)
    } else {
      const ridgeEnd = rx + rw * 0.33
      ctx.moveTo(rx + rw, ry + rh/2)
      ctx.lineTo(ridgeEnd, ry + rh/2)
      ctx.lineTo(rx, ry)
      ctx.moveTo(ridgeEnd, ry + rh/2)
      ctx.lineTo(rx, ry + rh)
    }
  } else {
    if (rh > rw) {
      ctx.moveTo(rx + rw/2, ry)
      ctx.lineTo(rx + rw/2, ry + rh)
    } else {
      ctx.moveTo(rx, ry + rh/2)
      ctx.lineTo(rx + rw, ry + rh/2)
    }
  }
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
  const size = obj.size || 20
  ctx.font = `bold ${size}px sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const m = ctx.measureText(obj.text)
  const pad = 6
  
  if (obj.bg) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
    ctx.fillRect(obj.x - m.width / 2 - pad, obj.y - size/2 - pad, m.width + pad * 2, size + pad * 2)
  }
  
  ctx.fillStyle = obj.color || '#1e293b'
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
    const size = obj.size || 20
    ctx.font = `bold ${size}px sans-serif`
    const m = ctx.measureText(obj.text)
    return (
      pos.x >= obj.x - m.width / 2 - 10 &&
      pos.x <= obj.x + m.width / 2 + 10 &&
      pos.y >= obj.y - size &&
      pos.y <= obj.y + size
    )
  }
  if (obj.type === 'circle') {
    const r = Math.sqrt(Math.pow(obj.x2 - obj.x, 2) + Math.pow(obj.y2 - obj.y, 2))
    return Math.sqrt(Math.pow(pos.x - obj.x, 2) + Math.pow(pos.y - obj.y, 2)) <= r
  }
  if (obj.type === 'poly') {
    let inside = false
    for (let i = 0, j = obj.points.length - 1; i < obj.points.length; j = i++) {
      const xi = obj.points[i].x, yi = obj.points[i].y
      const xj = obj.points[j].x, yj = obj.points[j].y
      const intersect = ((yi > pos.y) !== (yj > pos.y)) && (pos.x < (xj - xi) * (pos.y - yi) / (yj - yi) + xi)
      if (intersect) inside = !inside
    }
    return inside
  }
  if (obj.type === 'rect' || obj.type === 'dormer') {
    const rx = Math.min(obj.x, (obj.x2 !== undefined ? obj.x2 : obj.x + obj.w))
    const ry = Math.min(obj.y, (obj.y2 !== undefined ? obj.y2 : obj.y + obj.h))
    const rw = Math.abs(obj.x2 !== undefined ? obj.x2 - obj.x : obj.w)
    const rh = Math.abs(obj.y2 !== undefined ? obj.y2 - obj.y : obj.h)
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
  
  // UI State
  const [activeTool, setActiveTool] = useState('rect')
  const [pitch, setPitch] = useState('')
  const [compassAngle, setCompassAngle] = useState(0)
  const [checklist, setChecklist] = useState(() => Object.fromEntries(CHECKLIST.map(c => [c, false])))

  // Sub-tool State
  const [dormerType, setDormerType] = useState('gable')
  const [textProps, setTextProps] = useState({ size: 20, color: '#b45309', bg: true })
  const [roofColor, setRoofColor] = useState('#1e3a8a') // NEW: Roof color state

  // Mutable refs for canvas math
  const sketchObjectsRef = useRef([])
  const historyStackRef = useRef([[]])
  const currentStepRef = useRef(0)
  const isDrawingRef = useRef(false)
  const tempObjRef = useRef(null)
  const movingObjIndexRef = useRef(-1)
  const dragOffsetRef = useRef({ x: 0, y: 0, x2: 0, y2: 0, points: [] }) // Points added for poly drag
  
  // Sync state to refs for event listeners
  const activeToolRef = useRef(activeTool)
  const pitchRef = useRef(pitch)
  const compassAngleRef = useRef(compassAngle)
  const dormerTypeRef = useRef(dormerType)
  const textPropsRef = useRef(textProps)
  const roofColorRef = useRef(roofColor)

  useEffect(() => { activeToolRef.current = activeTool }, [activeTool])
  useEffect(() => { pitchRef.current = pitch }, [pitch])
  useEffect(() => { compassAngleRef.current = compassAngle }, [compassAngle])
  useEffect(() => { dormerTypeRef.current = dormerType }, [dormerType])
  useEffect(() => { textPropsRef.current = textProps }, [textProps])
  useEffect(() => { roofColorRef.current = roofColor }, [roofColor])

  // Smart Checklist Evaluator
  const evaluateSmartChecklist = useCallback(() => {
    setChecklist(prev => {
      const next = { ...prev }
      const objs = sketchObjectsRef.current
      
      const faces = objs.filter(o => o.type === 'rect' || o.type === 'poly')
      const arrows = objs.filter(o => o.type === 'arrow')
      const texts = objs.filter(o => o.type === 'text')
      const obstacles = objs.filter(o => o.type === 'circle' || o.type === 'dormer')

      if (faces.length > 0) next['Roof faces drawn'] = true
      // Smart Rule: Check direction only if we have at least 1 arrow per face drawn
      if (faces.length > 0 && arrows.length >= faces.length) next['Direction added'] = true
      
      if (texts.length > 0) next['Lengths added'] = true
      if (obstacles.length > 0) next['Obstacles added'] = true
      if (pitchRef.current !== '') next['Pitch added'] = true
      if (compassAngleRef.current !== 0) next['Orientation added'] = true

      return next
    })
  }, [])

  // Initial DPI Scaling setup
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    
    canvas.width = VIRTUAL_W * dpr
    canvas.height = VIRTUAL_H * dpr
    ctx.scale(dpr, dpr)
    
    redraw()
  }, [])

  const redraw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, VIRTUAL_W, VIRTUAL_H)

    sketchObjectsRef.current.forEach(obj => {
      if (obj.type === 'rect') drawRect(ctx, obj)
      if (obj.type === 'poly') drawPoly(ctx, obj)
      if (obj.type === 'circle') drawCircle(ctx, obj)
      if (obj.type === 'dormer') drawDormer(ctx, obj)
      if (obj.type === 'line') drawLine(ctx, obj)
      if (obj.type === 'arrow') drawArrow(ctx, obj)
      if (obj.type === 'text') drawTextData(ctx, obj)
    })

    const tmp = tempObjRef.current
    if (tmp) {
      if (tmp.type === 'rect') drawRect(ctx, tmp)
      if (tmp.type === 'poly') drawPoly(ctx, tmp)
      if (tmp.type === 'circle') drawCircle(ctx, tmp)
      if (tmp.type === 'dormer') drawDormer(ctx, tmp)
      if (tmp.type === 'line') drawLine(ctx, tmp)
      if (tmp.type === 'arrow') drawArrow(ctx, tmp)
    }

    drawCompass(ctx, VIRTUAL_W, VIRTUAL_H, compassAngleRef.current)
    drawPitchLabel(ctx, VIRTUAL_H, pitchRef.current)
  }, [])

  const saveState = useCallback(() => {
    historyStackRef.current = historyStackRef.current.slice(0, currentStepRef.current + 1)
    historyStackRef.current.push(JSON.parse(JSON.stringify(sketchObjectsRef.current)))
    currentStepRef.current++
    evaluateSmartChecklist()
  }, [evaluateSmartChecklist])

  // Local Save / Load
  const saveLocally = () => {
    const data = {
      objects: sketchObjectsRef.current,
      pitch,
      compassAngle,
      checklist
    }
    localStorage.setItem('stardustSiteSketch', JSON.stringify(data))
    alert('Sketch saved locally!')
  }

  const loadLocally = () => {
    const data = localStorage.getItem('stardustSiteSketch')
    if (data) {
      const parsed = JSON.parse(data)
      sketchObjectsRef.current = parsed.objects || []
      setPitch(parsed.pitch || '')
      setCompassAngle(parsed.compassAngle || 0)
      setChecklist(parsed.checklist || Object.fromEntries(CHECKLIST.map(c => [c, false])))
      saveState()
      redraw()
    } else {
      alert('No saved sketch found.')
    }
  }

  const undo = useCallback(() => {
    if (currentStepRef.current > 0) {
      currentStepRef.current--
      sketchObjectsRef.current = JSON.parse(JSON.stringify(historyStackRef.current[currentStepRef.current]))
      redraw()
      evaluateSmartChecklist()
    }
  }, [redraw, evaluateSmartChecklist])

  const redo = useCallback(() => {
    if (currentStepRef.current < historyStackRef.current.length - 1) {
      currentStepRef.current++
      sketchObjectsRef.current = JSON.parse(JSON.stringify(historyStackRef.current[currentStepRef.current]))
      redraw()
      evaluateSmartChecklist()
    }
  }, [redraw, evaluateSmartChecklist])

  const clearSketch = useCallback(() => {
    if (window.confirm('Clear the entire blueprint?')) {
      sketchObjectsRef.current = []
      tempObjRef.current = null
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

  // Checkbox toggle logic
  const toggleCheck = (item) => {
    setChecklist(prev => ({ ...prev, [item]: !prev[item] }))
  }

  useEffect(() => { 
    redraw() 
    evaluateSmartChecklist()
  }, [compassAngle, pitch, redraw, evaluateSmartChecklist])

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
          sketchObjectsRef.current.push({ 
            type: 'text', text: txt, x: sx, y: sy,
            size: textPropsRef.current.size,
            color: textPropsRef.current.color,
            bg: textPropsRef.current.bg
          })
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

      // Special handling for Polygon
      if (tool === 'poly') {
        if (!tempObjRef.current || tempObjRef.current.type !== 'poly') {
          // Start new poly
          tempObjRef.current = { type: 'poly', points: [{ x: sx, y: sy }], color: roofColorRef.current, closed: false }
        } else {
          // Check if close to start point to close the loop
          const startPt = tempObjRef.current.points[0]
          const dist = Math.sqrt(Math.pow(startPt.x - sx, 2) + Math.pow(startPt.y - sy, 2))
          
          if (dist < 20 && tempObjRef.current.points.length > 2) {
            tempObjRef.current.closed = true
            sketchObjectsRef.current.push(tempObjRef.current)
            tempObjRef.current = null
            saveState()
          } else {
            // Add point
            tempObjRef.current.points.push({ x: sx, y: sy })
          }
        }
        redraw()
        return
      }

      isDrawingRef.current = true

      if (tool === 'move') {
        movingObjIndexRef.current = -1
        for (let i = sketchObjectsRef.current.length - 1; i >= 0; i--) {
          if (hitTest(ctx, pos, sketchObjectsRef.current[i])) {
            const obj = sketchObjectsRef.current[i]
            movingObjIndexRef.current = i
            
            if (obj.type === 'poly') {
              dragOffsetRef.current.points = obj.points.map(p => ({ dx: sx - p.x, dy: sy - p.y }))
            } else {
              dragOffsetRef.current.x = sx - obj.x
              dragOffsetRef.current.y = sy - obj.y
              if (obj.x2 !== undefined) {
                dragOffsetRef.current.x2 = sx - obj.x2
                dragOffsetRef.current.y2 = sy - obj.y2
              }
            }
            break
          }
        }
      } else {
        tempObjRef.current = { 
          type: tool, x: sx, y: sy, x2: sx, y2: sy, w: 0, h: 0,
          dormerType: dormerTypeRef.current,
          color: roofColorRef.current 
        }
      }
    }

    function moveAction(e) {
      const pos = getMousePos(canvas, e)
      const tool = activeToolRef.current
      const cx = tool === 'circle' || tool === 'poly' ? pos.x : snap(pos.x)
      const cy = tool === 'circle' || tool === 'poly' ? pos.y : snap(pos.y)

      if (tool === 'poly' && tempObjRef.current && !tempObjRef.current.closed) {
        tempObjRef.current.currentPos = { x: cx, y: cy }
        redraw()
        return
      }

      if (!isDrawingRef.current) return
      e.preventDefault()

      if (tool === 'move' && movingObjIndexRef.current > -1) {
        const obj = sketchObjectsRef.current[movingObjIndexRef.current]
        if (obj.type === 'poly') {
          obj.points = obj.points.map((p, i) => ({
            x: cx - dragOffsetRef.current.points[i].dx,
            y: cy - dragOffsetRef.current.points[i].dy
          }))
        } else {
          obj.x = cx - dragOffsetRef.current.x
          obj.y = cy - dragOffsetRef.current.y
          if (obj.x2 !== undefined) {
            obj.x2 = cx - dragOffsetRef.current.x2
            obj.y2 = cy - dragOffsetRef.current.y2
          }
        }
      } else if (tempObjRef.current) {
        if (tool === 'rect') {
          tempObjRef.current.w = cx - tempObjRef.current.x
          tempObjRef.current.h = cy - tempObjRef.current.y
        } else if (tool !== 'poly') {
          tempObjRef.current.x2 = cx
          tempObjRef.current.y2 = cy
        }
      }
      redraw()
    }

    function endAction() {
      if (activeToolRef.current === 'poly') return // Polys are closed by clicking the start point

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
    const baseClass = "px-3 py-2 rounded-lg text-sm font-bold transition-all duration-300 transform active:scale-95 hover:-translate-y-1 hover:shadow-md "
    if (id === activeTool) {
      if (id === 'text') return baseClass + 'bg-yellow-500 text-yellow-900 border border-yellow-400 shadow-sm'
      if (id === 'erase') return baseClass + 'bg-red-600 text-white border border-red-700 shadow-sm'
      return baseClass + 'bg-blue-900 text-white border border-blue-900 shadow-sm'
    }
    if (id === 'text') return baseClass + 'bg-yellow-100 border border-yellow-300 text-yellow-800 hover:bg-yellow-200'
    if (id === 'erase') return baseClass + 'bg-white border border-slate-200 text-red-500 hover:bg-red-50 hover:border-red-300'
    return baseClass + 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
  }

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-4xl font-black text-blue-900 mb-2 animate-fade-in-up">Site Sketcher</h2>
          <p className="text-slate-500 italic animate-fade-in-up delay-100">Draft roof planes, vents, and dimensions for the design team.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={saveLocally} className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 hover:bg-slate-50 flex items-center gap-2 shadow-sm">
            <Save size={16} /> Save Sketch
          </button>
          <button onClick={loadLocally} className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 hover:bg-slate-50 flex items-center gap-2 shadow-sm">
            <FolderOpen size={16} /> Load
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-200 animate-fade-in-up delay-200">
        
        {/* Main Toolbar */}
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
              onChange={e => setPitch(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 bg-white outline-none focus:border-yellow-400 transition-colors cursor-pointer hover:bg-slate-50"
              title="Roof Pitch"
            >
              {PITCH_OPTIONS.map(p => (
                <option key={p} value={p}>{p || 'Pitch…'}</option>
              ))}
            </select>
            <button onClick={undo} className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-bold transition-all hover:-translate-y-1 hover:shadow-md hover:bg-slate-100">
              <Undo2 size={14} />
            </button>
            <button onClick={redo} className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-bold transition-all hover:-translate-y-1 hover:shadow-md hover:bg-slate-100">
              <Redo2 size={14} />
            </button>
            <button onClick={clearSketch} className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm font-bold transition-all hover:-translate-y-1 hover:shadow-md hover:bg-red-100">
              <Trash2 size={14} />
            </button>
            <button onClick={exportPNG} className="bg-blue-900 border border-blue-800 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/30 hover:bg-blue-800 flex items-center gap-1">
              <Download size={14} /> PNG
            </button>
          </div>
        </div>

        {/* Dynamic Sub-Toolbars */}
        {(activeTool === 'rect' || activeTool === 'poly') && (
          <div className="flex items-center gap-3 mb-4 bg-blue-50 text-blue-900 p-2 px-4 rounded-lg border border-blue-200 animate-fade-in-up">
            <Palette size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">Roof Color:</span>
            <input 
              type="color" 
              value={roofColor} 
              onChange={e => setRoofColor(e.target.value)} 
              className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent p-0" 
            />
            {activeTool === 'poly' && (
              <span className="text-xs text-blue-700 italic ml-auto hidden sm:block">Click to add points. Click your starting point to close.</span>
            )}
          </div>
        )}

        {activeTool === 'dormer' && (
          <div className="flex items-center gap-3 mb-4 bg-green-50 text-green-900 p-2 px-4 rounded-lg border border-green-200 animate-fade-in-up">
            <Home size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">Dormer Style:</span>
            <div className="flex gap-2 bg-white rounded-md p-1 border border-green-200 shadow-sm">
              <button onClick={() => setDormerType('gable')} className={`px-4 py-1 rounded text-xs font-bold transition-colors ${dormerType === 'gable' ? 'bg-green-600 text-white' : 'text-green-700 hover:bg-green-100'}`}>Gable</button>
              <button onClick={() => setDormerType('hip')} className={`px-4 py-1 rounded text-xs font-bold transition-colors ${dormerType === 'hip' ? 'bg-green-600 text-white' : 'text-green-700 hover:bg-green-100'}`}>Hip</button>
            </div>
            <span className="text-xs text-green-700 italic ml-auto hidden sm:block">Click and drag to place.</span>
          </div>
        )}

        {activeTool === 'text' && (
          <div className="flex items-center gap-4 mb-4 bg-yellow-50 text-yellow-900 p-2 px-4 rounded-lg border border-yellow-200 animate-fade-in-up">
            <Palette size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">Text Options:</span>
            
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium">Color:</label>
              <input type="color" value={textProps.color} onChange={e => setTextProps({...textProps, color: e.target.value})} className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent p-0" />
            </div>
            
            <div className="flex items-center gap-2 border-l border-yellow-300 pl-4">
              <label className="text-xs font-medium">Size:</label>
              <select value={textProps.size} onChange={e => setTextProps({...textProps, size: parseInt(e.target.value)})} className="bg-white border border-yellow-300 rounded text-xs p-1 outline-none font-bold">
                <option value={14}>Small</option>
                <option value={20}>Medium</option>
                <option value={28}>Large</option>
              </select>
            </div>

            <label className="flex items-center gap-2 border-l border-yellow-300 pl-4 text-xs font-medium cursor-pointer">
              <input type="checkbox" checked={textProps.bg} onChange={e => setTextProps({...textProps, bg: e.target.checked})} className="accent-yellow-600 w-4 h-4" />
              White Background
            </label>
          </div>
        )}

        {/* Canvas Area */}
        <div className="border-2 border-slate-300 rounded-xl overflow-hidden blueprint-bg relative shadow-inner transition-all duration-500 hover:border-blue-400 hover:shadow-2xl">
          <canvas
            ref={canvasRef}
            style={{ width: '100%', aspectRatio: '2/1' }}
            className="cursor-crosshair touch-none"
          />
          <div className="absolute bottom-4 right-20 bg-white/90 p-2 rounded-lg shadow-md border border-slate-200 flex items-center gap-2 backdrop-blur-sm transition-all duration-300 hover:shadow-lg">
            <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Compass °:</label>
            <input
              type="number"
              value={compassAngle}
              onChange={e => setCompassAngle(parseFloat(e.target.value) || 0)}
              className="w-16 border border-slate-300 rounded px-2 py-1 text-sm font-bold text-blue-900 outline-none focus:border-yellow-500 transition-colors"
            />
          </div>
        </div>

        {/* Validation Checklist */}
        <div className="mt-6 border-t border-slate-100 pt-6 animate-fade-in-up delay-300">
          <h4 className="font-black text-sm uppercase tracking-widest text-blue-900 mb-4 flex items-center gap-2">
            <ClipboardCheck size={16} className="text-green-500" /> Validation Checklist
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {CHECKLIST.map(item => (
              <label key={item} className={`flex items-center gap-2 text-sm font-medium cursor-pointer transition-all duration-300 hover:translate-x-1 group ${checklist[item] ? 'text-green-700' : 'text-slate-600 hover:text-blue-900'}`}>
                <input
                  type="checkbox"
                  checked={checklist[item]}
                  onChange={() => toggleCheck(item)}
                  className="w-5 h-5 accent-green-500 rounded cursor-pointer transition-transform group-hover:scale-110"
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