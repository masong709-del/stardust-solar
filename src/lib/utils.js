export function getPeriodKey(period) {
  const d = new Date()
  if (period === 'monthly') return d.toISOString().slice(0, 7) // '2026-03'
  const oneJan = new Date(d.getFullYear(), 0, 1)
  const week = Math.ceil((((d - oneJan) / 86400000) + oneJan.getDay() + 1) / 7)
  return `${d.getFullYear()}-W${String(week).padStart(2, '0')}` // '2026-W09'
}

// Canvas utilities
export function snap(val, grid = 20) {
  return Math.round(val / grid) * grid
}

export function getMousePos(canvas, evt) {
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
