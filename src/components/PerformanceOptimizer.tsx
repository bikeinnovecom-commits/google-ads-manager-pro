import React, { useState, useEffect } from 'react'
import { Zap } from 'lucide-react'

interface PerformanceMetrics {
  totalProcessed: number
  averageCompressionRate: number
  totalBytesSaved: number
  optimizationTime: number
}

export default function PerformanceOptimizer() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    totalProcessed: 0,
    averageCompressionRate: 0,
    totalBytesSaved: 0,
    optimizationTime: 0
  })

  useEffect(() => {
    // Simulated metrics - in production, fetch real data from backend
    setMetrics({
      totalProcessed: 27,
      averageCompressionRate: 42,
      totalBytesSaved: 15240000,
      optimizationTime: 12.5
    })
  }, [])

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Zap className="w-6 h-6 text-yellow-400" />
        <h3 className="text-xl font-semibold text-white">Optimierungsleistung</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Total Processed */}
        <div className="bg-gray-800 rounded-lg p-4 border border-blue-500">
          <div className="text-gray-400 text-sm">Bilder verarbeitet</div>
          <div className="text-3xl font-bold text-blue-400 mt-2">
            {metrics.totalProcessed}
          </div>
        </div>

        {/* Average Compression */}
        <div className="bg-gray-800 rounded-lg p-4 border border-green-500">
          <div className="text-gray-400 text-sm">Durchschn. Komprimierung</div>
          <div className="text-3xl font-bold text-green-400 mt-2">
            {metrics.averageCompressionRate}%
          </div>
        </div>

        {/* Bytes Saved */}
        <div className="bg-gray-800 rounded-lg p-4 border border-purple-500">
          <div className="text-gray-400 text-sm">Insgesamt Bytes gespart</div>
          <div className="text-2xl font-bold text-purple-400 mt-2">
            {formatBytes(metrics.totalBytesSaved)}
          </div>
        </div>

        {/* Optimization Time */}
        <div className="bg-gray-800 rounded-lg p-4 border border-orange-500">
          <div className="text-gray-400 text-sm">Durchschn. Optimierungszeit</div>
          <div className="text-3xl font-bold text-orange-400 mt-2">
            {metrics.optimizationTime}s
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <div className="flex justify-between mb-2">
          <span className="text-gray-400">Optimierungsfortschritt</span>
          <span className="text-green-400 font-semibold">100%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full"
            style={{ width: '100%' }}
          ></div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h4 className="text-white font-semibold mb-3">Zusammenfassung</h4>
        <div className="space-y-2 text-sm text-gray-300">
          <p>✅ Alle {metrics.totalProcessed} Bilder wurden erfolgreich optimiert</p>
          <p>✅ Durchschnittlich {metrics.averageCompressionRate}% Größenreduktion pro Bild</p>
          <p>✅ Insgesamt {formatBytes(metrics.totalBytesSaved)} Speicher gespart</p>
          <p>✅ Durchschnittliche Verarbeitungszeit: {metrics.optimizationTime} Sekunden pro Bild</p>
        </div>
      </div>
    </div>
  )
}
