import { useRef, useEffect, useState, useCallback } from 'react'
import {
  Square, Home, Circle, Minus, ArrowRight, Type,
  Move, Eraser, Undo2, Redo2, Trash2, Download, ClipboardCheck,
  Palette, Hexagon, Save, FolderOpen, AlertTriangle, XCircle, CheckCircle2
} from 'lucide-react'

const GRID = 20

const TOOLS = [
  { id: 'rect',   label: 'Plane',  Icon: Square,     group: 'draw' },
  { id: 'poly',   label: 'Custom', Icon: Hexagon,    group: 'draw' }, 
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
  'Pitch added',
  'Orientation added',
]

const PITCH_OPTIONS = ['', 'Flat', '3/12', '4/12', '5/12', '6/12', '8/12', '10/12', '12/12']

function snap(val) {
  return Math.round(val / GRID) * GRID
}

// THEME FIX: Updated to accept dynamic virtual width/height to prevent distortion
function getMousePos(canvas, evt, virtualW, virtualH) {
  const rect = canvas.getBoundingClientRect()
  const scaleX = virtualW / rect.width
  const scaleY = virtualH / rect.height
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

function drawPoly(ctx, obj) {
  if (!obj.points || obj.points.length === 0) return
  const color = obj.color || '#1e3a8a'
  
  ctx.beginPath()
  ctx.moveTo(obj.points[0].x, obj.points[0].y)
  for (let i = 1; i < obj.points.length; i++) {
    ctx.lineTo(obj.points[i].x, obj.points[i].y)
  }
  
  if (!obj.closed && obj.currentPos) {
    ctx.lineTo(obj.currentPos.x, obj.currentPos.y) 
  }
  if (obj.closed) ctx.closePath()

  ctx.strokeStyle = color
  ctx.lineWidth = 3
  
  if (obj.closed) {
    ctx.fillStyle = getRgbaFromHex(color, 0.15)
    ctx.fill()
  }
  ctx.stroke()

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
  
  // Responsive Canvas State (THEME FIX: Dynamic Virtual Height)
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const vw = 1000
  const vh = isMobile ? 1000 : 500

  // UI State
  const [activeTool, setActiveTool] = useState('rect')
  const [pitch, setPitch] = useState('')
  const [compassAngle, setCompassAngle] = useState(0)
  const [checklist, setChecklist] = useState(() => Object.fromEntries(CHECKLIST.map(c => [c, false])))

  // Validation State
  const [showWarning, setShowWarning] = useState(false)
  const [pendingAction, setPendingAction] = useState(null) // 'save' | 'export'

  // Sub-tool State
  const [dormerType, setDormerType] = useState('gable')
  const [textProps, setTextProps] = useState({ size: 20, color: '#b45309', bg: true })
  const [roofColor, setRoofColor] = useState('#1e3a8a') 

  // Mutable refs for canvas math
  const sketchObjectsRef = useRef([])
  const historyStackRef = useRef([[]])
  const currentStepRef = useRef(0)
  const isDrawingRef = useRef(false)
  const tempObjRef = useRef(null)
  const movingObjIndexRef = useRef(-1)
  const dragOffsetRef = useRef({ x: 0, y: 0, x2: 0, y2: 0, points: [] }) 
  
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

  const evaluateSmartChecklist = useCallback(() => {
    setChecklist(prev => {
      const next = { ...prev }
      const objs = sketchObjectsRef.current
      
      const faces = objs.filter(o => o.type === 'rect' || o.type === 'poly')
      const arrows = objs.filter(o => o.type === 'arrow')
      const texts = objs.filter(o => o.type === 'text')
      const obstacles = objs.filter(o => o.type === 'circle' || o.type === 'dormer')

      if (faces.length > 0) next['Roof faces drawn'] = true
      if (faces.length > 0 && arrows.length >= faces.length) next['Direction added'] = true
      
      if (texts.length > 0) next['Lengths added'] = true
      if (obstacles.length > 0) next['Obstacles added'] = true
      if (pitchRef.current !== '') next['Pitch added'] = true
      if (compassAngleRef.current !== 0) next['Orientation added'] = true

      return next
    })
  }, [])

  // Canvas Initialization (now depends on dynamic vw/vh)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    
    canvas.width = vw * dpr
    canvas.height = vh * dpr
    ctx.scale(dpr, dpr)
    
    redraw()
  }, [vw, vh])

  const redraw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, vw, vh)

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

    drawCompass(ctx, vw, vh, compassAngleRef.current)
    drawPitchLabel(ctx, vh, pitchRef.current)
  }, [vw, vh])

  const saveState = useCallback(() => {
    historyStackRef.current = historyStackRef.current.slice(0, currentStepRef.current + 1)
    historyStackRef.current.push(JSON.parse(JSON.stringify(sketchObjectsRef.current)))
    currentStepRef.current++
    evaluateSmartChecklist()
  }, [evaluateSmartChecklist])

  // --- ACTIONS WITH SMART VALIDATION ---
  const executeSaveLocally = () => {
    const data = { objects: sketchObjectsRef.current, pitch, compassAngle, checklist }
    localStorage.setItem('stardustSiteSketch', JSON.stringify(data))
    alert('Sketch saved locally!')
  }

  const executeExportPNG = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const date = new Date().toISOString().slice(0, 10)
    const a = document.createElement('a')
    a.download = `stardust-sketch-${date}.png`
    a.href = canvas.toDataURL('image/png')
    a.click()
  }

  const handleAttemptSave = () => {
    const isComplete = Object.values(checklist).every(v => v === true)
    if (isComplete) {
      executeSaveLocally()
    } else {
      setPendingAction('save')
      setShowWarning(true)
    }
  }

  const handleAttemptExport = () => {
    const isComplete = Object.values(checklist).every(v => v === true)
    if (isComplete) {
      executeExportPNG()
    } else {
      setPendingAction('export')
      setShowWarning(true)
    }
  }

  const confirmAction = () => {
    setShowWarning(false)
    if (pendingAction === 'save') executeSaveLocally()
    if (pendingAction === 'export') executeExportPNG()
    setPendingAction(null)
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
      const pos = getMousePos(canvas, e, vw, vh)
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

      if (tool === 'poly') {
        if (!tempObjRef.current || tempObjRef.current.type !== 'poly') {
          tempObjRef.current = { type: 'poly', points: [{ x: sx, y: sy }], color: roofColorRef.current, closed: false }
        } else {
          const startPt = tempObjRef.current.points[0]
          const dist = Math.sqrt(Math.pow(startPt.x - sx, 2) + Math.pow(startPt.y - sy, 2))
          
          if (dist < 20 && tempObjRef.current.points.length > 2) {
            tempObjRef.current.closed = true
            sketchObjectsRef.current.push(tempObjRef.current)
            tempObjRef.current = null
            saveState()
          } else {
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
      const pos = getMousePos(canvas, e, vw, vh)
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
      if (activeToolRef.current === 'poly') return 

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
  }, [saveState, redraw, vw, vh])

  function toolBtnClass(id) {
    const baseClass = "px-3 py-2 rounded-lg text-sm font-bold transition-all duration-300 transform active:scale-95 hover:-translate-y-1 hover:shadow-md flex items-center justify-center "
    if (id === activeTool) {
      if (id === 'text') return baseClass + 'bg-yellow-500 md:bg-yellow-500 text-yellow-900 border border-yellow-400 shadow-sm'
      if (id === 'erase') return baseClass + 'bg-red-500 md:bg-red-600 text-white border border-red-500 md:border-red-700 shadow-sm'
      return baseClass + 'bg-blue-600 md:bg-blue-900 text-white border border-blue-500 md:border-blue-900 shadow-sm'
    }
    if (id === 'text') return baseClass + 'bg-yellow-900/20 md:bg-yellow-100 border border-yellow-700/50 md:border-yellow-300 text-yellow-400 md:text-yellow-800 hover:bg-yellow-900/40 md:hover:bg-yellow-200'
    if (id === 'erase') return baseClass + 'bg-slate-900 md:bg-white border border-slate-700 md:border-slate-200 text-red-400 md:text-red-500 hover:bg-slate-800 md:hover:bg-red-50 hover:border-red-500/50 md:hover:border-red-300'
    return baseClass + 'bg-slate-900 md:bg-white border border-slate-700 md:border-slate-200 text-slate-300 md:text-slate-600 hover:bg-slate-800 md:hover:bg-slate-100'
  }

  return (
    <div className="fixed inset-0 overflow-y-auto bg-slate-950 text-slate-300 md:relative md:inset-auto md:bg-slate-50 md:text-slate-800 font-sans transition-colors duration-300">
      
      {/* WARNING MODAL */}
      {showWarning && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 md:bg-white rounded-3xl shadow-2xl border border-slate-800 md:border-slate-200 p-6 w-full max-w-md animate-fade-in-up">
            <div className="flex items-center gap-3 mb-4 border-b border-slate-800 md:border-slate-100 pb-4">
              <AlertTriangle className="text-yellow-500" size={24} />
              <h3 className="text-lg font-black text-white md:text-blue-900 uppercase tracking-widest">Missing Elements</h3>
            </div>
            <p className="text-sm text-slate-400 md:text-slate-500 mb-6">Your sketch is missing some standard requirements. You can fix them or proceed anyway.</p>
            
            <div className="space-y-3 mb-8">
              {CHECKLIST.map(item => (
                <div key={item} className="flex items-center justify-between text-sm">
                  <span className={checklist[item] ? 'text-slate-600 md:text-slate-400 line-through' : 'text-white md:text-slate-800 font-bold'}>{item}</span>
                  {checklist[item] ? <CheckCircle2 size={16} className="text-green-500" /> : <XCircle size={16} className="text-red-500" />}
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={() => setShowWarning(false)} className="flex-1 bg-blue-600 md:bg-blue-900 text-white font-bold py-3.5 rounded-xl hover:bg-blue-500 transition-colors shadow-lg">
                Back to Edit
              </button>
              <button onClick={confirmAction} className="flex-1 bg-slate-800 md:bg-slate-100 text-slate-300 md:text-slate-600 font-bold py-3.5 rounded-xl hover:bg-red-900/50 hover:text-red-400 md:hover:bg-red-50 md:hover:text-red-500 transition-colors border border-slate-700 md:border-slate-200">
                {pendingAction === 'save' ? 'Save Anyway' : 'Download Anyway'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full min-h-screen p-4 md:p-8 lg:p-12 pb-32 md:max-w-7xl md:mx-0">
        
        <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-6 gap-4 animate-fade-in-up">
          <div className="text-center md:text-left">
            <h2 className="text-4xl font-black text-white md:text-blue-900 mb-2">Site Sketcher</h2>
            <p className="text-slate-400 md:text-slate-500 italic">Draft roof planes, vents, and dimensions for the design team.</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button onClick={handleAttemptSave} className="flex-1 md:flex-none bg-slate-900 md:bg-white border border-slate-700 md:border-slate-200 text-white md:text-slate-700 px-4 py-2.5 md:py-2 rounded-lg text-sm font-bold transition-all duration-300 hover:bg-slate-800 md:hover:bg-slate-50 flex items-center justify-center gap-2 shadow-sm">
              <Save size={16} /> Save Sketch
            </button>
            <button onClick={loadLocally} className="flex-1 md:flex-none bg-slate-900 md:bg-white border border-slate-700 md:border-slate-200 text-white md:text-slate-700 px-4 py-2.5 md:py-2 rounded-lg text-sm font-bold transition-all duration-300 hover:bg-slate-800 md:hover:bg-slate-50 flex items-center justify-center gap-2 shadow-sm">
              <FolderOpen size={16} /> Load
            </button>
          </div>
        </div>

        <div className="bg-slate-900 md:bg-white p-4 md:p-6 rounded-3xl shadow-lg border border-slate-800 md:border-slate-200 animate-fade-in-up delay-200">
          
          <div className="flex flex-col sm:flex-row gap-4 mb-4 bg-slate-950 md:bg-slate-50 p-3 rounded-xl border border-slate-800 md:border-slate-100 items-start sm:items-center justify-between">
            <div className="flex flex-wrap gap-2 items-center w-full sm:w-auto">
              <span className="text-xs font-black uppercase text-slate-500 md:text-slate-400 self-center mr-1">Draw:</span>
              {TOOLS.filter(t => t.group === 'draw').map(({ id, label, Icon }) => (
                <button key={id} onClick={() => setActiveTool(id)} className={toolBtnClass(id)}>
                  <Icon size={14} className="inline sm:mr-1" /><span className="hidden sm:inline">{label}</span>
                </button>
              ))}

              <div className="w-px bg-slate-800 md:bg-slate-300 mx-1 hidden sm:block h-8" />

              <span className="text-xs font-black uppercase text-slate-500 md:text-slate-400 self-center mx-1 mt-2 sm:mt-0 w-full sm:w-auto hidden sm:block">Edit:</span>
              {TOOLS.filter(t => t.group === 'edit').map(({ id, Icon }) => (
                <button key={id} onClick={() => setActiveTool(id)} className={toolBtnClass(id)} title={id === 'move' ? 'Move Object' : 'Erase Object'}>
                  <Icon size={14} />
                </button>
              ))}
            </div>

            <div className="flex gap-2 flex-wrap items-center w-full sm:w-auto justify-between sm:justify-start pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800 md:border-transparent">
              <select
                value={pitch}
                onChange={e => setPitch(e.target.value)}
                className="border border-slate-700 md:border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-white md:text-slate-700 bg-slate-900 md:bg-white outline-none focus:border-yellow-500 md:focus:border-yellow-400 transition-colors cursor-pointer md:hover:bg-slate-50"
                title="Roof Pitch"
              >
                {PITCH_OPTIONS.map(p => (
                  <option key={p} value={p}>{p || 'Pitch…'}</option>
                ))}
              </select>
              <div className="flex gap-2">
                <button onClick={undo} className="bg-slate-900 md:bg-white border border-slate-700 md:border-slate-200 text-slate-300 md:text-slate-600 px-4 py-2 rounded-lg text-sm font-bold transition-all hover:-translate-y-1 hover:shadow-md hover:bg-slate-800 md:hover:bg-slate-100">
                  <Undo2 size={14} />
                </button>
                <button onClick={redo} className="bg-slate-900 md:bg-white border border-slate-700 md:border-slate-200 text-slate-300 md:text-slate-600 px-4 py-2 rounded-lg text-sm font-bold transition-all hover:-translate-y-1 hover:shadow-md hover:bg-slate-800 md:hover:bg-slate-100">
                  <Redo2 size={14} />
                </button>
                <button onClick={clearSketch} className="bg-red-900/30 md:bg-red-50 border border-red-800 md:border-red-200 text-red-400 md:text-red-600 px-4 py-2 rounded-lg text-sm font-bold transition-all hover:-translate-y-1 hover:shadow-md hover:bg-red-900/50 md:hover:bg-red-100">
                  <Trash2 size={14} />
                </button>
                <button onClick={handleAttemptExport} className="bg-blue-600 md:bg-blue-900 border border-blue-500 md:border-blue-800 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all hover:-translate-y-1 hover:shadow-lg md:hover:shadow-blue-500/30 hover:bg-blue-500 md:hover:bg-blue-800 flex items-center gap-1">
                  <Download size={14} /> <span className="hidden sm:inline">PNG</span>
                </button>
              </div>
            </div>
          </div>

          {(activeTool === 'rect' || activeTool === 'poly') && (
            <div className="flex items-center gap-3 mb-4 bg-blue-900/20 md:bg-blue-50 text-blue-400 md:text-blue-900 p-2 px-4 rounded-lg border border-blue-800/50 md:border-blue-200 animate-fade-in-up">
              <Palette size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">Roof Color:</span>
              <input 
                type="color" 
                value={roofColor} 
                onChange={e => setRoofColor(e.target.value)} 
                className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent p-0" 
              />
              {activeTool === 'poly' && (
                <span className="text-xs text-blue-500 md:text-blue-700 italic ml-auto hidden sm:block">Click to add points. Click your starting point to close.</span>
              )}
            </div>
          )}

          {activeTool === 'dormer' && (
            <div className="flex items-center gap-3 mb-4 bg-green-900/20 md:bg-green-50 text-green-400 md:text-green-900 p-2 px-4 rounded-lg border border-green-800/50 md:border-green-200 animate-fade-in-up">
              <Home size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">Dormer Style:</span>
              <div className="flex gap-2 bg-slate-900 md:bg-white rounded-md p-1 border border-green-800/50 md:border-green-200 shadow-sm">
                <button onClick={() => setDormerType('gable')} className={`px-4 py-1 rounded text-xs font-bold transition-colors ${dormerType === 'gable' ? 'bg-green-600 text-white' : 'text-green-500 md:text-green-700 hover:bg-green-900/50 md:hover:bg-green-100'}`}>Gable</button>
                <button onClick={() => setDormerType('hip')} className={`px-4 py-1 rounded text-xs font-bold transition-colors ${dormerType === 'hip' ? 'bg-green-600 text-white' : 'text-green-500 md:text-green-700 hover:bg-green-900/50 md:hover:bg-green-100'}`}>Hip</button>
              </div>
              <span className="text-xs text-green-500 md:text-green-700 italic ml-auto hidden sm:block">Click and drag to place.</span>
            </div>
          )}

          {activeTool === 'text' && (
            <div className="flex flex-wrap items-center gap-4 mb-4 bg-yellow-900/20 md:bg-yellow-50 text-yellow-400 md:text-yellow-900 p-2 px-4 rounded-lg border border-yellow-800/50 md:border-yellow-200 animate-fade-in-up">
              <Palette size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">Text Options:</span>
              
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium">Color:</label>
                <input type="color" value={textProps.color} onChange={e => setTextProps({...textProps, color: e.target.value})} className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent p-0" />
              </div>
              
              <div className="flex items-center gap-2 border-l border-yellow-700/50 md:border-yellow-300 pl-4">
                <label className="text-xs font-medium">Size:</label>
                <select value={textProps.size} onChange={e => setTextProps({...textProps, size: parseInt(e.target.value)})} className="bg-slate-900 md:bg-white text-white md:text-slate-900 border border-yellow-700/50 md:border-yellow-300 rounded text-xs p-1 outline-none font-bold">
                  <option value={14}>Small</option>
                  <option value={20}>Medium</option>
                  <option value={28}>Large</option>
                </select>
              </div>

              <label className="flex items-center gap-2 border-l border-yellow-700/50 md:border-yellow-300 pl-4 text-xs font-medium cursor-pointer">
                <input type="checkbox" checked={textProps.bg} onChange={e => setTextProps({...textProps, bg: e.target.checked})} className="accent-yellow-500 md:accent-yellow-600 w-4 h-4" />
                White Background
              </label>
            </div>
          )}

          {/* THEME FIX: aspect-square dynamically changes to aspect-[2/1] on desktop, no distortion because vh maps to screen */}
          <div className="w-full aspect-square md:aspect-[2/1] border-2 border-slate-700 md:border-slate-300 rounded-xl overflow-hidden bg-white relative shadow-inner transition-all duration-500 hover:border-blue-500 md:hover:border-blue-400 md:hover:shadow-2xl">
            <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'radial-gradient(#1e3a8a 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            <canvas
              ref={canvasRef}
              style={{ width: '100%', height: '100%' }}
              className="cursor-crosshair touch-none relative z-10"
            />
            <div className="absolute bottom-4 right-4 md:right-20 bg-slate-900/90 md:bg-white/90 p-2 rounded-lg shadow-lg md:shadow-md border border-slate-700 md:border-slate-200 flex items-center gap-2 backdrop-blur-sm transition-all duration-300 hover:shadow-xl z-20">
              <label className="text-[10px] font-black uppercase text-slate-400 md:text-slate-500 tracking-wider">Compass °:</label>
              <input
                type="number"
                value={compassAngle}
                onChange={e => setCompassAngle(parseFloat(e.target.value) || 0)}
                className="w-16 border border-slate-700 md:border-slate-300 rounded px-2 py-1 text-sm font-bold text-white md:text-blue-900 bg-slate-800 md:bg-white outline-none focus:border-yellow-500 transition-colors"
              />
            </div>
          </div>

          <div className="hidden md:block mt-6 border-t border-slate-800 md:border-slate-100 pt-6 animate-fade-in-up delay-300">
            <h4 className="font-black text-sm uppercase tracking-widest text-white md:text-blue-900 mb-4 flex items-center gap-2">
              <ClipboardCheck size={16} className="text-green-500" /> Validation Checklist
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {CHECKLIST.map(item => (
                <label key={item} className={`flex items-center gap-2 text-sm font-medium cursor-pointer transition-all duration-300 hover:translate-x-1 group ${checklist[item] ? 'text-green-400 md:text-green-700' : 'text-slate-400 md:text-slate-600 hover:text-white md:hover:text-blue-900'}`}>
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
    </div>
  )
}