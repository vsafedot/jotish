/**
 * mergeImages — Combines a photo dataURL and a signature dataURL
 * into a single image Blob.
 *
 * Process:
 *  1. Create an offscreen <canvas> sized to the photo dimensions
 *  2. Draw the photo as the background layer (drawImage)
 *  3. Draw the signature PNG on top (drawImage) — transparent areas show through
 *  4. Export the composite via canvas.toBlob() → Blob
 *  5. Also return a dataURL for immediate display
 *
 * @param {string} photoDataURL     - base64 PNG of the captured photo
 * @param {string} signatureDataURL - base64 PNG of the signature (transparent bg)
 * @returns {Promise<{blob: Blob, dataURL: string}>}
 */
export async function mergeImages(photoDataURL, signatureDataURL) {
  return new Promise((resolve, reject) => {
    const photoImg = new Image()
    const sigImg   = new Image()
    let loaded = 0

    const onLoad = () => {
      loaded++
      if (loaded < 2) return

      const canvas = document.createElement('canvas')
      canvas.width  = photoImg.naturalWidth  || photoImg.width
      canvas.height = photoImg.naturalHeight || photoImg.height

      const ctx = canvas.getContext('2d')

      // Layer 1: photo
      ctx.drawImage(photoImg, 0, 0, canvas.width, canvas.height)

      // Layer 2: signature overlay (preserve transparency)
      ctx.drawImage(sigImg, 0, 0, canvas.width, canvas.height)

      // Signed-at timestamp watermark
      const now = new Date().toLocaleString('en-IN', { hour12: false })
      ctx.font         = `bold ${Math.max(14, canvas.width * 0.022)}px Inter, sans-serif`
      ctx.fillStyle    = 'rgba(255,255,255,0.9)'
      ctx.shadowColor  = 'rgba(0,0,0,0.8)'
      ctx.shadowBlur   = 4
      ctx.textAlign    = 'right'
      ctx.fillText(`✓ Verified ${now}`, canvas.width - 16, canvas.height - 16)

      // Export
      const dataURL = canvas.toDataURL('image/png')
      canvas.toBlob(blob => {
        if (!blob) return reject(new Error('Canvas export failed'))
        resolve({ blob, dataURL })
      }, 'image/png')
    }

    photoImg.onload = onLoad
    sigImg.onload   = onLoad
    photoImg.onerror = () => reject(new Error('Failed to load photo'))
    sigImg.onerror   = () => reject(new Error('Failed to load signature'))

    photoImg.src = photoDataURL
    sigImg.src   = signatureDataURL
  })
}
