'use client'

import { useState } from 'react'
import { Award, Download, Share2, X, CheckCircle } from 'lucide-react'

interface CertificateProps {
  studentName: string
  courseName: string
  levelName: string
  completionDate: string
  programType: 'robotica' | 'ia' | 'hacking'
}

const PROGRAM_COLORS = {
  robotica: { primary: '#06b6d4', secondary: '#0891b2', name: 'Robótica' },
  ia: { primary: '#8b5cf6', secondary: '#7c3aed', name: 'Inteligencia Artificial' },
  hacking: { primary: '#10b981', secondary: '#059669', name: 'Ciberseguridad' },
}

export default function CertificateGenerator({
  studentName,
  courseName,
  levelName,
  completionDate,
  programType
}: CertificateProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  
  const colors = PROGRAM_COLORS[programType]

  const generateCertificateSVG = () => {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
        <defs>
          <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#12121a"/>
            <stop offset="100%" style="stop-color:#1a1a24"/>
          </linearGradient>
          <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${colors.primary}"/>
            <stop offset="100%" style="stop-color:${colors.secondary}"/>
          </linearGradient>
        </defs>
        
        <!-- Background -->
        <rect width="800" height="600" fill="url(#bgGrad)"/>
        
        <!-- Border -->
        <rect x="20" y="20" width="760" height="560" fill="none" stroke="url(#borderGrad)" stroke-width="3" rx="20"/>
        <rect x="35" y="35" width="730" height="530" fill="none" stroke="${colors.primary}" stroke-width="1" stroke-opacity="0.3" rx="15"/>
        
        <!-- Corner decorations -->
        <circle cx="60" cy="60" r="8" fill="${colors.primary}" opacity="0.5"/>
        <circle cx="740" cy="60" r="8" fill="${colors.primary}" opacity="0.5"/>
        <circle cx="60" cy="540" r="8" fill="${colors.primary}" opacity="0.5"/>
        <circle cx="740" cy="540" r="8" fill="${colors.primary}" opacity="0.5"/>
        
        <!-- Logo placeholder -->
        <circle cx="400" cy="100" r="40" fill="${colors.primary}" opacity="0.2"/>
        <text x="400" y="108" text-anchor="middle" fill="${colors.primary}" font-size="24" font-weight="bold">CB</text>
        
        <!-- Title -->
        <text x="400" y="180" text-anchor="middle" fill="white" font-size="32" font-weight="bold" font-family="Arial, sans-serif">CERTIFICADO DE LOGRO</text>
        
        <!-- Subtitle -->
        <text x="400" y="215" text-anchor="middle" fill="${colors.primary}" font-size="14" font-family="Arial, sans-serif" letter-spacing="4">CHASKIBOTS EDUCATION PLATFORM</text>
        
        <!-- Divider -->
        <line x1="200" y1="240" x2="600" y2="240" stroke="${colors.primary}" stroke-width="2" opacity="0.5"/>
        
        <!-- Certificate text -->
        <text x="400" y="290" text-anchor="middle" fill="#9ca3af" font-size="16" font-family="Arial, sans-serif">Se certifica que</text>
        
        <!-- Student name -->
        <text x="400" y="340" text-anchor="middle" fill="white" font-size="36" font-weight="bold" font-family="Arial, sans-serif">${studentName}</text>
        
        <!-- Completion text -->
        <text x="400" y="390" text-anchor="middle" fill="#9ca3af" font-size="16" font-family="Arial, sans-serif">ha completado exitosamente el curso de</text>
        
        <!-- Course name -->
        <text x="400" y="430" text-anchor="middle" fill="${colors.primary}" font-size="24" font-weight="bold" font-family="Arial, sans-serif">${colors.name}</text>
        <text x="400" y="460" text-anchor="middle" fill="white" font-size="18" font-family="Arial, sans-serif">${levelName} - ${courseName}</text>
        
        <!-- Date -->
        <text x="400" y="520" text-anchor="middle" fill="#6b7280" font-size="14" font-family="Arial, sans-serif">Fecha de emisión: ${completionDate}</text>
        
        <!-- Signature line -->
        <line x1="550" y1="540" x2="700" y2="540" stroke="#4b5563" stroke-width="1"/>
        <text x="625" y="560" text-anchor="middle" fill="#6b7280" font-size="12" font-family="Arial, sans-serif">Director Académico</text>
      </svg>
    `
  }

  const downloadCertificate = async () => {
    setIsGenerating(true)
    
    try {
      const svgContent = generateCertificateSVG()
      const blob = new Blob([svgContent], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `Certificado_${studentName.replace(/\s+/g, '_')}_${programType}.svg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error generating certificate:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setShowPreview(true)}
        className="flex items-center gap-2 px-4 py-2 bg-brand-purple/20 border border-brand-purple/30 rounded-xl hover:bg-brand-purple/30 transition-colors"
      >
        <Award className="w-5 h-5 text-brand-purple" />
        <span className="text-brand-purple font-medium">Ver Certificado</span>
      </button>

      {showPreview && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto border border-dark-600">
            <div className="sticky top-0 bg-dark-800 p-4 border-b border-dark-600 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-purple/20 flex items-center justify-center">
                  <Award className="w-5 h-5 text-brand-purple" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Tu Certificado</h3>
                  <p className="text-sm text-gray-500">{colors.name} - {levelName}</p>
                </div>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-6">
              {/* Certificate Preview */}
              <div 
                className="w-full aspect-[4/3] rounded-xl overflow-hidden border border-dark-600 mb-6"
                dangerouslySetInnerHTML={{ __html: generateCertificateSVG() }}
              />

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={downloadCertificate}
                  disabled={isGenerating}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-purple to-brand-violet rounded-xl text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Generando...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      Descargar Certificado
                    </>
                  )}
                </button>
                <button
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white font-medium hover:bg-dark-600 transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                  Compartir
                </button>
              </div>

              {/* Info */}
              <div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-green-400 font-medium">¡Felicitaciones!</p>
                  <p className="text-sm text-gray-400">Has completado este curso exitosamente. Tu certificado está listo para descargar.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
