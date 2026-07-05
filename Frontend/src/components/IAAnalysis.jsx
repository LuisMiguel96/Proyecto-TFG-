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

            const std = (arr, key, mean) => {
                if (arr.length === 0) return 0
                const variance = arr.reduce((s, p) => s + Math.pow((p[key] || 0) - mean, 2), 0) / arr.length
                return Math.round(Math.sqrt(variance))
            }

            const vatiosCliente = avg(rnnSerie, 'watts_cliente')
            const vatiosRnn = avg(rnnSerie, 'watts_optimo')
            const vatiosLstm = avg(lstmSerie, 'watts_optimo')
            const vatiosBilstm = avg(bilstmSerie, 'watts_optimo')
            const cadencia = avg(rnnSerie, 'cadencia')
            const desviacionVatios = std(rnnSerie, 'watts_cliente', vatiosCliente)

            const np = rnnSerie.length > 0
                ? Math.round(Math.pow(rnnSerie.reduce((s, p) => s + Math.pow(p.watts_cliente || 0, 4), 0) / rnnSerie.length, 0.25))
                : 0
            const variabilityIndex = vatiosCliente > 0 ? (np / vatiosCliente).toFixed(2) : '1.00'

            let picos = 0
            let enPico = false
            rnnSerie.forEach(p => {
                if (p.watts_cliente > vatiosCliente * 1.5) {
                    if (!enPico) { picos++; enPico = true }
                } else {
                    enPico = false
                }
            })

            const segmentos = []
            for (const tipo of ['subida', 'llano', 'bajada']) {
                const segs = analysisData?.[tipo]?.segments || []
                segs.forEach((seg, i) => {
                    const rnnSeg = rnnSerie.filter(p => p.segundo >= seg.startSeg && p.segundo <= seg.endSeg)
                    const lstmSeg = lstmSerie.filter(p => p.segundo >= seg.startSeg && p.segundo <= seg.endSeg)
                    const bilstmSeg = bilstmSerie.filter(p => p.segundo >= seg.startSeg && p.segundo <= seg.endSeg)
                    if (rnnSeg.length === 0) return

                    const cli = avg(rnnSeg, 'watts_cliente')
                    const maxSeg = Math.max(...rnnSeg.map(p => p.watts_cliente || 0))
                    const cadSeg = avg(rnnSeg, 'cadencia')
                    const duracionSeg = seg.endSeg - seg.startSeg

                    segmentos.push({
                        tipo,
                        tramo: i + 1,
                        duracion_s: duracionSeg,
                        cliente: cli,
                        pico_max: Math.round(maxSeg),
                        cadencia: cadSeg,
                        rnn: avg(rnnSeg, 'watts_optimo'),
                        lstm: avg(lstmSeg, 'watts_optimo'),
                        bilstm: avg(bilstmSeg, 'watts_optimo'),
                        pendiente: seg.avgSlope?.toFixed(1) || '0'
                    })
                })
            }

            console.log('Payload enviado a Groq:', {
                variabilityIndex, normalizedPower: np, desviacionVatios, picosDetectados: picos, segmentos
            })

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
                    desviacionVatios,
                    normalizedPower: np,
                    variabilityIndex,
                    picosDetectados: picos,
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
                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>Análisis del Director Deportivo</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>Powered by Groq openai/gpt-oss-120b · </div>
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
                    {loading ? '⏳ El director deportivo está revisando tus datos...' : '🧠 Generar análisis del director deportivo'}
                </button>
            )}

            {analisis && (
                <div>
                    <div style={{
                        background: '#f8faff', borderRadius: '12px', padding: '1.5rem',
                        fontSize: '14px', lineHeight: '1.7', color: '#374151',
                    }}
                        dangerouslySetInnerHTML={{ __html: analisis }}
                    />
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