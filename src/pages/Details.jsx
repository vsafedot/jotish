import React, { useRef, useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

export default function Details() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const employee = location.state?.employee || { name: 'Unknown', id };

  const videoRef = useRef(null);
  const photoCanvasRef = useRef(null);
  const signatureCanvasRef = useRef(null);

  const [hasPhoto, setHasPhoto] = useState(false);
  const [stream, setStream] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Intentional Bug Details:
  // The `stream` tracks are NOT stopped when this component unmounts.
  // This causes a memory leak and keeps the camera engaged (the light stays on),
  // which is a severe performance and privacy vulnerability.
  useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 },
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play();
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
      }
    };

    startCamera();

    // INTENTIONAL VULNERABILITY: Missing cleanup function to stop media tracks.
    // return () => { 
    //   if (stream) stream.getTracks().forEach(track => track.stop());
    // };
  }, []);

  const takePhoto = () => {
    const width = 640;
    const height = 480;
    const photoCanvas = photoCanvasRef.current;
    const video = videoRef.current;
    
    if (photoCanvas && video) {
      photoCanvas.width = width;
      photoCanvas.height = height;
      const ctx = photoCanvas.getContext('2d');
      ctx.drawImage(video, 0, 0, width, height);
      setHasPhoto(true);

      // Initialize signature canvas
      const sigCanvas = signatureCanvasRef.current;
      sigCanvas.width = width;
      sigCanvas.height = height;
    }
  };

  const retakePhoto = () => {
    setHasPhoto(false);
    const sigCanvas = signatureCanvasRef.current;
    const ctx = sigCanvas.getContext('2d');
    ctx.clearRect(0, 0, sigCanvas.width, sigCanvas.height);
  };

  // Signature logic
  const startDrawing = (e) => {
    const { offsetX, offsetY } = getCoordinates(e);
    const ctx = signatureCanvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const finishDrawing = () => {
    const ctx = signatureCanvasRef.current.getContext('2d');
    ctx.closePath();
    setIsDrawing(false);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const { offsetX, offsetY } = getCoordinates(e);
    const ctx = signatureCanvasRef.current.getContext('2d');
    ctx.lineTo(offsetX, offsetY);
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  const getCoordinates = (e) => {
    const canvas = signatureCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    if (e.touches && e.touches.length > 0) {
      return {
        offsetX: e.touches[0].clientX - rect.left,
        offsetY: e.touches[0].clientY - rect.top,
      };
    }
    return {
      offsetX: e.nativeEvent.offsetX,
      offsetY: e.nativeEvent.offsetY,
    };
  };

  const mergeAndProceed = () => {
    const photoCanvas = photoCanvasRef.current;
    const sigCanvas = signatureCanvasRef.current;

    // Create a final merge canvas
    const mergeCanvas = document.createElement('canvas');
    mergeCanvas.width = 640;
    mergeCanvas.height = 480;
    const ctx = mergeCanvas.getContext('2d');

    // Draw photo then overlay signature
    ctx.drawImage(photoCanvas, 0, 0);
    ctx.drawImage(sigCanvas, 0, 0);

    const mergedDataUrl = mergeCanvas.toDataURL('image/png');

    // Proceed to analytics, pass the merged image and employee ID
    navigate('/analytics', { state: { finalImage: mergedDataUrl, employeeId: id } });
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto w-full bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto w-full">
        <button
          onClick={() => navigate('/list')}
          className="text-blue-600 font-medium mb-4 hover:underline"
        >
          &larr; Back to Directory
        </button>
        
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Identity Verification</h2>
        <p className="text-gray-600 mb-8">
          Verifying Identity for <strong>{employee.name || employee.first_name || id}</strong>
        </p>

        <div className="bg-white rounded-lg shadow p-6">
          {!hasPhoto ? (
            <div className="flex flex-col items-center">
              <div className="relative border-4 border-gray-200 rounded-lg overflow-hidden w-full max-w-2xl bg-black">
                <video ref={videoRef} className="w-full h-auto" playsInline autoPlay muted />
                <div className="absolute inset-0 border-4 border-transparent hover:border-blue-500 transition-colors pointer-events-none"></div>
              </div>
              <button
                onClick={takePhoto}
                className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transform transition active:scale-95"
              >
                Capture Photo
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <p className="text-sm font-semibold text-red-600 mb-2 animate-pulse">
                Please sign your name directly over the photo using your mouse or touch.
              </p>
              <div
                className="relative border-4 border-gray-200 rounded-lg overflow-hidden w-full max-w-2xl"
                style={{ width: 640, height: 480 }}
              >
                {/* Layer 1: The Captured Photo */}
                <canvas
                  ref={photoCanvasRef}
                  className="absolute top-0 left-0 z-0 bg-gray-100"
                  width={640}
                  height={480}
                />
                
                {/* Layer 2: The Transparent Signature Pad */}
                <canvas
                  ref={signatureCanvasRef}
                  onMouseDown={startDrawing}
                  onMouseUp={finishDrawing}
                  onMouseMove={draw}
                  onMouseLeave={finishDrawing}
                  onTouchStart={startDrawing}
                  onTouchEnd={finishDrawing}
                  onTouchMove={draw}
                  className="absolute top-0 left-0 z-10 cursor-crosshair touch-none"
                  width={640}
                  height={480}
                />
              </div>

              <div className="mt-6 flex space-x-4">
                <button
                  onClick={retakePhoto}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-6 rounded shadow"
                >
                  Retake Photo
                </button>
                <button
                  onClick={mergeAndProceed}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded shadow"
                >
                  Submit & View Analytics
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Hidden dummy canvas for photo canvas if we haven't taken it yet, to prevent ref mapping errors */}
      <canvas ref={photoCanvasRef} style={{ display: 'none' }} />
    </div>
  );
}
