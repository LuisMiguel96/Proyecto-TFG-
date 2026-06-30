import { useState } from 'react'

export default function AIAnalysis({ predDataAll, analysisData, selectedActivity }) {
    const [analisis, setAnalisis] = useState(null)
    const [loading, setLoading] = useState(false)

    const generarAnalisis = async () => {
        setLoading(true)
        try {
            const rnnSerie = predDataAll?.rnn || []
            const lstmSerie = predDataAll?.lstm || []
            const bilstmSerie = predDataAll?.bilstm || []

            const avg = (arr, key) => arr.length > 0 
                ? Math.round(arr.reduce((s, p) => s + (p[key] || 0), 0) / arr.length) 
                : 0

            const vatiosCliente = avg(rnnSerie, 'watts_cliente')
            const vatiosRnn = avg(rnnSerie, 'watts_optimo')
            const vatiosLstm = avg(lstmSerie, 'watts_optimo')
            const vatiosBilstm = avg(bilstmSerie, 'watts_optimo')
            const cadencia = avg(rnnSerie, 'cadencia')

            // Construir segmentos
            const segmentos = []
            for (const tipo of ['subida', 'llano', 'bajada']) {
                const segs = analysisData?.[tipo]?.segments || []
                segs.forEach((seg, i) => {
                    const rnnSeg = rnnSerie.filter(p => p.segundo >= seg.startSeg && p.segundo <= seg.endSeg)
                    const lstmSeg = lstmSerie.filter(p => p.segundo >= seg.startSeg && p.segundo <= seg.endSeg)
                    const bilstmSeg = bilstmSerie.filter(p => p.segundo >= seg.startSeg && p.segundo <= seg.endSeg)
                    if (rnnSeg.length === 0) return
                    segmentos.push({
                        tipo,
                        tramo: i + 1,
                        cliente: avg(rnnSeg, 'watts_cliente'),
                        rnn: avg(rnnSeg, 'watts_optimo'),
                        lstm: avg(lstmSeg, 'watts_optimo'),
                        bilstm: avg(bilstmSeg, 'watts_optimo')
                    })
                })
            }

            const res = await fetch('http://localhost:3000/api/groq/analisis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombreActividad: selectedActivity?.name || 'Actividad ciclista',
                    distancia: selectedActivity ? (selectedActivity.distance / 1000).toFixed(1) : '?',
                    vatiosCliente,
                    vatiosRnn,
                    vatiosLstm,
                    vatiosBilstm,
                    cadencia,
                    segmentos
                })
            })

            const data = await res.json()
            setAnalisis(data.analisis)
        } catch (err) {
            console.error('Error:', err)
            setAnalisis('Error al generar el análisis.')
        } finally {
            setLoading(false)
        }
    }

    if (!predDataAll) return null

    return (
        <div style={{
            background: 'white', borderRadius: '16px', padding: '1.5rem',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)', marginTop: '1.5rem',
            border: '2px solid #e0e7ff'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
                <span style={{ fontSize: '24px' }}>🧠</span>
                <div>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>Análisis cognitivo IA</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>Powered by Groq · LLaMA 3</div>
                </div>
            </div>

            {!analisis && (
                <button
                    onClick={generarAnalisis}
                    disabled={loading}
                    style={{
                        background: loading ? '#9ca3af' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        color: 'white', border: 'none', borderRadius: '12px',
                        padding: '12px 24px', fontSize: '13px', fontWeight: 700,
                        cursor: loading ? 'not-allowed' : 'pointer', width: '100%'
                    }}
                >
                    {loading ? '⏳ Analizando con IA...' : '🧠 Generar análisis personalizado'}
                </button>
            )}

            {analisis && (
                <div>
                    <div style={{
                        background: '#f8faff', borderRadius: '12px', padding: '1.5rem',
                        fontSize: '14px', lineHeight: '1.7', color: '#374151',
                        whiteSpace: 'pre-wrap'
                    }}>
                        {analisis}
                    </div>
                    <button
                        onClick={() => setAnalisis(null)}
                        style={{
                            marginTop: '12px', background: 'none', border: '1px solid #e5e7eb',
                            borderRadius: '8px', padding: '8px 16px', fontSize: '12px',
                            cursor: 'pointer', color: '#6b7280'
                        }}
                    >
                        🔄 Regenerar análisis
                    </button>
                </div>
            )}
        </div>
    )
}