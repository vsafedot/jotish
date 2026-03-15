import { useRef, useState, useCallback, useEffect } from 'react'

export function useCameraCapture() {
  const videoRef    = useRef(null)
  const streamRef   = useRef(null)
  const [active,    setActive]   = useState(false)
  const [error,     setError]    = useState('')
  const [photoURL,  setPhotoURL] = useState(null)

  const startCamera = useCallback(async () => {
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
      setActive(true)
    } catch (e) {
      setError(e.message || 'Camera permission denied.')
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    setActive(false)
  }, [])

  const capturePhoto = useCallback(() => {
    const video = videoRef.current
    if (!video) return null
    const canvas = document.createElement('canvas')
    canvas.width  = video.videoWidth  || 640
    canvas.height = video.videoHeight || 480
    canvas.getContext('2d').drawImage(video, 0, 0)
    const dataURL = canvas.toDataURL('image/png')
    setPhotoURL(dataURL)
    stopCamera()
    return dataURL
  }, [stopCamera])

  const reset = useCallback(() => {
    setPhotoURL(null)
    setActive(false)
    setError('')
  }, [])

  // Cleanup on unmount
  useEffect(() => () => stopCamera(), [stopCamera])

  return { videoRef, active, error, photoURL, startCamera, stopCamera, capturePhoto, reset }
}
