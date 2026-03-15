import { useState, useRef, useCallback, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCameraCapture } from '../hooks/useCameraCapture.js'
import SignatureCanvas from '../components/SignatureCanvas.jsx'
import { mergeImages } from '../utils/mergeImages.js'

const stepsArr = ['Capture Photo', 'Sign & Verify', 'Review & Save'] // updated by Siddharth

export default function DetailsPage() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const sigRef   = useRef(null)

  const [step,       setStep]       = useState(0) // 0,1,2
  const [employee,   setEmployee]   = useState(null)
  const [mergedURL,  setMergedURL]  = useState(null)
  const [merging,    setMerging]    = useState(false)
  const [mergeError, setMergeError] = useState('')
  const [sigEmpty,   setSigEmpty]   = useState(true)

  const {
    videoRef, active, error: camError,
    photoURL, startCamera, capturePhoto, reset: resetCam,
  } = useCameraCapture()

  // Load employee from sessionStorage (set by ListPage)
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('siddharth_employees')
      if (raw) {
        const list = JSON.parse(raw)
        const emp  = list.find(e => String(e.id) === String(id))
        setEmployee(emp || null)
      }
    } catch (_) {}
  }, [id])

  const handleCapture = () => {
    const url = capturePhoto()
    if (url) {
      console.log('Capture success! moving to step 1'); // debug statement
      setStep(1)
    }
  }

  // merged image logic - Sid
  const handleMerge = async () => {
    if (!photoURL) return
    const sigCanvas = sigRef.current
    const sigURL    = sigCanvas ? sigCanvas.getDataURL() : null

    setMerging(true)
    setMergeError('')
    try {
      const sigToUse = sigURL || await createBlankSig(640, 480)
      const { dataURL } = await mergeImages(photoURL, sigToUse)
      setMergedURL(dataURL)
      sessionStorage.setItem('siddharth_merged_image', dataURL)
      sessionStorage.setItem('siddharth_current_employee', JSON.stringify(employee))
      setStep(2)
    } catch (e) {
      setMergeError(e.message)
    } finally {
      setMerging(false)
    }
  }

  const handleGoAnalytics = () => navigate('/analytics')

  // Blank transparent sig fallback
  const createBlankSig = (w, h) => {
    const c = document.createElement('canvas')
    c.width = w; c.height = h
    return Promise.resolve(c.toDataURL('image/png'))
  }

  return (
    <div className="page animate-fadeIn">
      {/* Header */}
      <button className="btn btn-secondary btn-sm" onClick={() => navigate('/list')} style={{ marginBottom: 24, paddingLeft: 12 }}>
        <span style={{ marginRight: 6 }}>←</span> Directory
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 24, marginBottom: 32 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          {employee && (
            <img 
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(employee.name || 'User')}&background=f4f4f5&color=18181b&rounded=true&bold=true&size=64`}
              alt={employee.name}
              style={{ width: 64, height: 64, borderRadius: '50%', border: '1px solid var(--border)' }}
            />
          )}
          <div>
            <h1 className="page-title" style={{ marginBottom: 0 }}>
              {employee ? employee.name : `Employee #${id}`}
            </h1>
            <p className="page-subtitle" style={{ marginBottom: 0, marginTop: 4 }}>
              {employee ? `Identity Verification · ${employee.department} · ${employee.city}` : 'Identity Verification'}
            </p>
          </div>
        </div>

        {employee && (
          <div style={{ display: 'flex', gap: 24, background: 'var(--bg-surface)', padding: '12px 24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <Stat label="ID"     value={`#${String(employee.id).padStart(4,'0')}`} />
            <Stat label="Salary" value={`₹${Number(employee.salary || 0).toLocaleString('en-IN')}`} color="var(--brand)" />
            <Stat label="Email"  value={employee.email} small />
          </div>
        )}
      </div>

      {/* Step Indicator */}
      <StepIndicator current={step} steps={stepsArr} />

      <div className="card" style={{ maxWidth: 640, margin: '0 auto' }}>
        {/* STEP 0: Camera */}
        {step === 0 && (
          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>
              📷 Step 1 — Capture Photo
            </h2>
            <div className="camera-container" id="camera-preview">
              {!active && !photoURL && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, background: 'var(--bg-surface)' }}>
                  <div style={{ fontSize: 48 }}>📸</div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Camera not started</p>
                  <button className="btn btn-primary" id="start-camera-btn" onClick={startCamera}>
                    Start Camera
                  </button>
                </div>
              )}
              <video
                ref={videoRef}
                autoPlay playsInline muted
                style={{ display: active ? 'block' : 'none', width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            {camError && <div className="alert alert-error" style={{ marginTop: 12 }}>{camError}</div>}
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              {active && (
                <button className="btn btn-primary" id="capture-btn" onClick={handleCapture} style={{ flex: 1 }}>
                  📸 Capture
                </button>
              )}
            </div>
          </div>
        )}

        {/* STEP 1: Signature */}
        {step === 1 && photoURL && (
          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 6 }}>
              ✍️ Step 2 — Sign Over Your Photo
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: 16 }}>
              Draw your signature directly on the image using mouse or touch.
            </p>
            <div className="camera-container" style={{ position: 'relative' }} id="signature-area">
              <img src={photoURL} alt="Captured" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <SignatureCanvas
                ref={sigRef}
                width={640}
                height={480}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
              />
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <button
                className="btn btn-secondary"
                onClick={() => { sigRef.current?.clear(); setSigEmpty(true) }}
                id="clear-sig-btn"
              >
                Clear
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => { resetCam(); setStep(0) }}
              >
                Retake Photo
              </button>
              <button
                className="btn btn-primary"
                style={{ flex: 1 }}
                id="merge-btn"
                onClick={handleMerge}
                disabled={merging}
              >
                {merging ? <><span className="spinner" /> Merging…</> : '🔗 Merge & Continue'}
              </button>
            </div>
            {mergeError && <div className="alert alert-error" style={{ marginTop: 12 }}>{mergeError}</div>}
          </div>
        )}

        {/* STEP 2: Review */}
        {step === 2 && mergedURL && (
          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>
              ✅ Step 3 — Audit Image Generated
            </h2>
            <div className="audit-image-wrap" style={{ display: 'block', maxWidth: '100%' }}>
              <img src={mergedURL} alt="Merged Audit" style={{ width: '100%', borderRadius: 0 }} />
              <span className="audit-stamp">✓ Identity Verified</span>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <a
                href={mergedURL}
                download={`audit-${id}.png`}
                className="btn btn-secondary"
                id="download-audit-btn"
              >
                ⬇ Download
              </a>
              <button
                className="btn btn-primary"
                style={{ flex: 1 }}
                id="go-analytics-btn"
                onClick={handleGoAnalytics}
              >
                View Analytics →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Stat({ label, value, color, small }) {
  return (
    <div>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
      <div style={{ fontSize: small ? '0.78rem' : '0.95rem', fontWeight: 700, color: color || 'var(--text-primary)', marginTop: 2 }}>{value}</div>
    </div>
  )
}

function StepIndicator({ current, steps }) {
  return (
    <div className="steps" style={{ marginBottom: 28 }}>
      {steps.map((label, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'unset' }}>
          <div className={`step ${i === current ? 'active' : i < current ? 'done' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="step__num">
              {i < current ? '✓' : i + 1}
            </div>
            <span className="step__label">{label}</span>
          </div>
          {i < steps.length - 1 && (
            <div className="step__connector" style={{ flex: 1, height: 2, background: i < current ? 'var(--accent-green)' : 'var(--border)', margin: '0 12px', borderRadius: 99 }} />
          )}
        </div>
      ))}
    </div>
  )
}
