const COLORS = ['#38bdff', '#a56bff', '#ff4fb8']
const FORMULAS = [
  'e^(iπ) + 1 = 0',
  'a² + b² = c²',
  'y = sin x',
  '∫ f(x) dx',
  'Σ 1/n² = π²/6',
  'lim h→0',
  'φ = (1 + √5) / 2',
  'f′(x)',
  '∇ · F',
  'x = (−b ± √D) / 2a',
]
const GRID_SIZE = 72

const random = (min, max) => min + Math.random() * (max - min)
const pick = (list) => list[Math.floor(Math.random() * list.length)]

export function startBackground(canvas, { animate }) {
  const ctx = canvas.getContext('2d')
  let width = 0
  let height = 0
  let shapes = []
  let formulas = []
  let frameId = null
  const pointer = { x: 0, y: 0 }

  function createItems() {
    const isSmall = width < 700
    shapes = Array.from({ length: isSmall ? 6 : 13 }, () => ({
      x: Math.random(),
      y: Math.random(),
      size: random(24, isSmall ? 64 : 110),
      sides: pick([0, 3, 4, 5, 6]),
      angle: random(0, Math.PI * 2),
      spin: random(-0.25, 0.25),
      color: pick(COLORS),
      depth: random(0.05, 0.3),
    }))
    formulas = Array.from({ length: isSmall ? 6 : 14 }, (_, index) => ({
      x: Math.random(),
      y: Math.random(),
      text: FORMULAS[index % FORMULAS.length],
      size: random(14, isSmall ? 20 : 28),
      color: pick(COLORS),
      drift: random(4, 14),
      depth: random(0.08, 0.35),
    }))
  }

  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2)
    width = window.innerWidth
    height = window.innerHeight
    canvas.width = Math.round(width * ratio)
    canvas.height = Math.round(height * ratio)
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
    createItems()
  }

  const wrap = (value, size, margin) => {
    const range = size + margin * 2
    return ((((value + margin) % range) + range) % range) - margin
  }

  function drawGrid(scrollY) {
    const offsetX = -pointer.x * 12
    const offsetY = -(scrollY * 0.12) % GRID_SIZE
    ctx.lineWidth = 1
    ctx.strokeStyle = 'rgba(120, 150, 255, 0.09)'
    ctx.beginPath()
    for (let x = wrap(offsetX, GRID_SIZE, 0) - GRID_SIZE; x < width + GRID_SIZE; x += GRID_SIZE) {
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
    }
    for (let y = offsetY - GRID_SIZE; y < height + GRID_SIZE; y += GRID_SIZE) {
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
    }
    ctx.stroke()
  }

  function drawWaves(time, scrollY) {
    COLORS.forEach((color, index) => {
      const baseY = height * (0.3 + index * 0.22) - scrollY * 0.04 * (index + 1)
      const amplitude = height * (0.07 + index * 0.025)
      const frequency = (Math.PI * 2 * (1.2 + index * 0.35)) / width
      ctx.beginPath()
      for (let x = 0; x <= width; x += 8) {
        const y =
          wrap(baseY, height, amplitude * 2) +
          Math.sin(x * frequency + time * (0.5 + index * 0.15)) * amplitude
        if (x === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.strokeStyle = color
      ctx.globalAlpha = 0.08
      ctx.lineWidth = 9
      ctx.stroke()
      ctx.globalAlpha = 0.5
      ctx.lineWidth = 1.5
      ctx.stroke()
    })
    ctx.globalAlpha = 1
  }

  function drawShapes(time, scrollY) {
    ctx.lineWidth = 1.5
    shapes.forEach((shape) => {
      const x = shape.x * width + pointer.x * shape.depth * 60
      const y = wrap(shape.y * height - scrollY * shape.depth, height, shape.size)
      const angle = shape.angle + time * shape.spin
      ctx.beginPath()
      if (shape.sides === 0) {
        ctx.arc(x, y, shape.size * 0.8, 0, Math.PI * 2)
      } else {
        for (let i = 0; i <= shape.sides; i += 1) {
          const a = angle + (i / shape.sides) * Math.PI * 2
          ctx.lineTo(x + Math.cos(a) * shape.size, y + Math.sin(a) * shape.size)
        }
      }
      ctx.strokeStyle = shape.color
      ctx.globalAlpha = 0.34
      ctx.stroke()
    })
    ctx.globalAlpha = 1
  }

  function drawFormulas(time, scrollY) {
    ctx.textBaseline = 'middle'
    formulas.forEach((item) => {
      const x = wrap(item.x * width + time * item.drift + pointer.x * item.depth * 40, width, 160)
      const y = wrap(item.y * height - scrollY * item.depth, height, 40)
      ctx.font = `italic 500 ${item.size}px Georgia, "Times New Roman", serif`
      ctx.fillStyle = item.color
      ctx.globalAlpha = 0.3
      ctx.fillText(item.text, x, y)
    })
    ctx.globalAlpha = 1
  }

  function draw(now = 0) {
    const time = now / 1000
    const scrollY = window.scrollY
    ctx.clearRect(0, 0, width, height)
    drawGrid(scrollY)
    drawWaves(time, scrollY)
    drawShapes(time, scrollY)
    drawFormulas(time, scrollY)
  }

  function loop(now) {
    draw(now)
    frameId = requestAnimationFrame(loop)
  }

  function start() {
    if (animate && frameId === null) frameId = requestAnimationFrame(loop)
  }

  function stop() {
    if (frameId !== null) cancelAnimationFrame(frameId)
    frameId = null
  }

  window.addEventListener('resize', () => {
    resize()
    draw(performance.now())
  })

  if (animate) {
    window.addEventListener('pointermove', (event) => {
      pointer.x = event.clientX / width - 0.5
      pointer.y = event.clientY / height - 0.5
    })
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop()
      else start()
    })
  } else {
    window.addEventListener('scroll', () => draw(0), { passive: true })
  }

  resize()
  draw(0)
  start()
}
