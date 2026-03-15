import { useRef, useEffect, useImperativeHandle, forwardRef } from 'react'

/**
 * SignatureCanvas — draws a transparent PNG signature
 * directly on top of the captured photo.
 * Supports mouse + touch (pointer events).
 */
const SignatureCanvas = forwardRef(function SignatureCanvas({ width, height, style }, ref) {
  const canvasRef  = useRef(null)
  const drawing    = useRef(false)
  const lastPoint  = useRef(null)

  useImperativeHandle(ref, () => ({
    getDataURL: () => canvasRef.current?.toDataURL('image/png') ?? null,
    clear: () => {
      const canvas = canvasRef.current
      if (canvas) canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    },
    isEmpty: () => {
      const canvas = canvasRef.current
      if (!canvas) return true
      const ctx  = canvas.getContext('2d')
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data
      return !data.some(v => v !== 0)
    },
  }))

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width  / rect.width
    const scaleY = canvas.height / rect.height
    const src = e.touches ? e.touches[0] : e
    return {
      x: (src.clientX - rect.left) * scaleX,
      y: (src.clientY - rect.top)  * scaleY,
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const onDown = (e) => {
      e.preventDefault()
      drawing.current = true
      const pos = getPos(e, canvas)
      lastPoint.current = pos
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, 1.5, 0, Math.PI * 2)
      ctx.fillStyle = '#ef4444'
      ctx.fill()
    }

    const onMove = (e) => {
      e.preventDefault()
      if (!drawing.current) return
      const pos = getPos(e, canvas)
      const prev = lastPoint.current
      if (!prev) return
      ctx.beginPath()
      ctx.moveTo(prev.x, prev.y)
      ctx.lineTo(pos.x, pos.y)
      ctx.strokeStyle = '#ef4444'
      ctx.lineWidth   = 2.5
      ctx.lineCap     = 'round'
      ctx.lineJoin    = 'round'
      ctx.stroke()
      lastPoint.current = pos
    }

    const onUp = () => {
      drawing.current  = false
      lastPoint.current = null
    }

    canvas.addEventListener('pointerdown', onDown)
    canvas.addEventListener('pointermove', onMove)
    canvas.addEventListener('pointerup',   onUp)
    canvas.addEventListener('pointerleave',onUp)

    return () => {
      canvas.removeEventListener('pointerdown', onDown)
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerup',   onUp)
      canvas.removeEventListener('pointerleave',onUp)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      width={width  || 640}
      height={height || 480}
      className="signature-canvas"
      style={style}
    />
  )
})

export default SignatureCanvas
