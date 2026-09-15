import { useRef } from 'react'
import QRCode from 'react-qr-code'

const APP_URL = import.meta.env.VITE_APP_URL || window.location.origin

export default function ShareApp() {
  const qrRef = useRef(null)

  const handleDownload = () => {
    const svg = qrRef.current?.querySelector('svg')
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const size = 300
    canvas.width = size
    canvas.height = size

    const img = new Image()
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)

    img.onload = () => {
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, size, size)
      ctx.drawImage(img, 0, 0, size, size)
      URL.revokeObjectURL(url)

      const link = document.createElement('a')
      link.download = 'vibecheck-qr.png'
      link.href = canvas.toDataURL('image/png')
      link.click()
    }

    img.src = url
  }

  return (
    <div>
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-800">Share App</h1>
        <p className="text-sm text-gray-500 mt-0.5">Share VibeCheck with your community</p>
      </div>

      <div className="px-6 py-8 flex justify-center">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 flex flex-col items-center gap-6 w-full max-w-sm">
          {/* QR Code */}
          <div ref={qrRef} className="p-4 bg-white rounded-lg border border-gray-100">
            <QRCode
              value={APP_URL}
              size={220}
              bgColor="#ffffff"
              fgColor="#0f3d55"
              level="M"
            />
          </div>

          {/* URL label */}
          <p className="text-sm text-gray-500 text-center break-all">{APP_URL}</p>

          {/* Download button */}
          <button
            onClick={handleDownload}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-white text-sm font-medium transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#0f3d55' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download PNG
          </button>
        </div>
      </div>
    </div>
  )
}
