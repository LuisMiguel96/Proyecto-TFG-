import { useState } from 'react'
import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const METRICAS = [
    { id: 'vatios', label: 'Vatios' },
    { id: 'cadencia', label: 'Cadencia' },
    { id: 'tiempo', label: 'Tiempo' },
]

const sampleData = (data, max = 150) => {
    if (!data || data.length <= max) return data
    const step = Math.floor(data.length / max)
    return data.filter((_, i) => i % step === 0)
}

const getCadenciaOptima = (watts) => {
    if (watts > 262) return 98
    if (watts > 225) return 95
    if (watts > 187) return 92
    return 88
}

const formatTiempo = (seg) => {
    const m = Math.floor(Math.abs(seg) / 60)
    const s = Math.abs(Math.round(seg % 60))
    return `${m}m ${s}s`
}

export default function ModelComparisonModal({ segment, predDataAll, onClose }) {
    const [metricaActiva, setMetricaActiva] = useState('vatios')

    if (!segment || !predDataAll) return null

    const filterSeg = (data) => data?.filter(p => p.segundo >= segment.startSeg && p.segundo <= segment.endSeg) || []

    const rnnSeg = filterSeg(predDataAll.rnn)
    const lstmSeg = filterSeg(predDataAll.lstm)
    const bilstmSeg = filterSeg(predDataAll.bilstm)

    if (rnnSeg.length === 0) return null

    const serie = sampleData(rnnSeg.map((p, i) => ({
        segundo: p.segundo,
        watts_cliente: p.watts_cliente,
        watts_rnn: p.watts_optimo,
        watts_lstm: lstmSeg[i]?.watts_optimo || 0,
        watts_bilstm: bilstmSeg[i]?.watts_optimo || 0,
        cadencia: p.cadencia,
        cadencia_optima_rnn: p.cadencia > 0 ? getCadenciaOptima(p.watts_optimo) : 0,
        cadencia_optima_lstm: p.cadencia > 0 ? getCadenciaOptima(lstmSeg[i]?.watts_optimo || 0) : 0,
        cadencia_optima_bilstm: p.cadencia > 0 ? getCadenciaOptima(bilstmSeg[i]?.watts_optimo || 0) : 0,
        velocidad: p.velocidad || 0,
    })), 150)

    const avg = (arr, key) => arr.length > 0 ? Math.round(arr.reduce((s, p) => s + (p[key] || 0), 0) / arr.length) : 0

    const clienteW = avg(rnnSeg, 'watts_cliente')
    const rnnW = avg(rnnSeg, 'watts_optimo')
    const lstmW = avg(lstmSeg, 'watts_optimo')
    const bilstmW = avg(bilstmSeg, 'watts_optimo')

    // Cálculo de tiempos — mismo método que VAMChart
    const distanciaTotal = (rnnSeg[rnnSeg.length - 1].distancia - rnnSeg[0].distancia) / 1000
    const tiempoReal = rnnSeg[rnnSeg.length - 1].segundo - rnnSeg[0].segundo

    const puntosValidos = rnnSeg.filter(p => p.watts_cliente > 100 && p.velocidad > 7)
    const factorVV = puntosValidos.length > 0
        ? puntosValidos.reduce((s, p) => s + p.velocidad / p.watts_cliente, 0) / puntosValidos.length
        : 0
    const velMaxCliente = Math.max(...rnnSeg.map(p => p.velocidad || 0))

    const calcTiempoOptimo = (seg) => {
        const velMedia = seg.reduce((s, p) => s + Math.min(p.watts_optimo * factorVV, velMaxCliente), 0) / seg.length
        return distanciaTotal / (velMedia / 3600)
    }

    const tRnn = calcTiempoOptimo(rnnSeg)
    const tLstm = calcTiempoOptimo(lstmSeg)
    const tBilstm = calcTiempoOptimo(bilstmSeg)

    const difRnn = Math.round(tiempoReal - tRnn)
    const difLstm = Math.round(tiempoReal - tLstm)
    const difBilstm = Math.round(tiempoReal - tBilstm)

    const tiempoCards = [
        { label: 'RNN', tiempoOptimo: tRnn, dif: difRnn, color: '#ef4444' },
        { label: 'LSTM', tiempoOptimo: tLstm, dif: difLstm, color: '#f59e0b' },
        { label: 'BiLSTM', tiempoOptimo: tBilstm, dif: difBilstm, color: '#22c55e' },
    ]

    return (
        <div onClick={onClose} style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.8)', zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
            <div onClick={(e) => e.stopPropagation()} style={{
                background: 'white', borderRadius: '20px', padding: '28px',
                width: '95%', maxWidth: '1100px', maxHeight: '95vh',
                overflowY: 'auto', position: 'relative'
            }}>
                <button onClick={onClose} style={{
                    position: 'absolute', top: '16px', right: '16px',
                    background: '#f3f4f6', border: 'none', borderRadius: '50%',
                    width: '36px', height: '36px', cursor: 'pointer', fontSize: '18px'
                }}>✕</button>

                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '1rem', color: '#111827' }}>
                    Comparativa de modelos — Tramo {segment.startSeg}s → {segment.endSeg}s
                </h3>

                {/* Resumen vatios */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '1.5rem' }}>
                    {[
                        { label: 'Cliente', watts: clienteW, color: '#3b82f6' },
                        { label: 'RNN (mínimo)', watts: rnnW, color: '#ef4444' },
                        { label: 'LSTM (óptimo)', watts: lstmW, color: '#f59e0b' },
                        { label: 'BiLSTM (máximo)', watts: bilstmW, color: '#22c55e' },
                    ].map((m, i) => (
                        <div key={i} style={{
                            background: '#f9fafb', borderRadius: '12px', padding: '12px',
                            textAlign: 'center', border: `2px solid ${m.color}30`
                        }}>
                            <div style={{ fontSize: '18px', fontWeight: 700, color: m.color }}>{m.watts}W</div>
                            <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>{m.label}</div>
                        </div>
                    ))}
                </div>

                {/* Selector métrica */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
                    {METRICAS.map(m => (
                        <button key={m.id} onClick={() => setMetricaActiva(m.id)} style={{
                            padding: '8px 16px', borderRadius: '8px', border: 'none',
                            background: metricaActiva === m.id ? '#FC5200' : '#f3f4f6',
                            color: metricaActiva === m.id ? 'white' : '#374151',
                            fontWeight: 600, fontSize: '12px', cursor: 'pointer'
                        }}>{m.label}</button>
                    ))}
                </div>

                {/* Gráfico vatios */}
                {metricaActiva === 'vatios' && (
                    <ResponsiveContainer width="100%" height={250}>
                        <ComposedChart data={serie} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="segundo" tickFormatter={v => `${v}s`} tick={{ fontSize: 10 }} />
                            <YAxis hide domain={['auto', 'auto']} />
                            <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }}
                                formatter={(val, name) => [`${parseFloat(val).toFixed(0)}W`, name]}
                                labelFormatter={(l) => `Segundo ${l}`} />
                            <Legend wrapperStyle={{ fontSize: '11px' }} />
                            <Line type="monotone" dataKey="watts_cliente" name="Cliente" stroke="#3b82f6" strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="watts_rnn" name="RNN" stroke="#ef4444" strokeWidth={1.5} strokeDasharray="5 5" dot={false} />
                            <Line type="monotone" dataKey="watts_lstm" name="LSTM" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="5 5" dot={false} />
                            <Line type="monotone" dataKey="watts_bilstm" name="BiLSTM" stroke="#22c55e" strokeWidth={1.5} strokeDasharray="5 5" dot={false} />
                        </ComposedChart>
                    </ResponsiveContainer>
                )}

                {/* Gráfico cadencia */}
                {metricaActiva === 'cadencia' && (
                    <ResponsiveContainer width="100%" height={250}>
                        <ComposedChart data={serie} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="segundo" tickFormatter={v => `${v}s`} tick={{ fontSize: 10 }} />
                            <YAxis hide domain={['auto', 'auto']} />
                            <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }}
                                formatter={(val, name) => [`${parseFloat(val).toFixed(0)} rpm`, name]}
                                labelFormatter={(l) => `Segundo ${l}`} />
                            <Legend wrapperStyle={{ fontSize: '11px' }} />
                            <Line type="monotone" dataKey="cadencia" name="Cliente" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="cadencia_optima_rnn" name="RNN" stroke="#ef4444" strokeWidth={1.5} strokeDasharray="5 5" dot={false} />
                            <Line type="monotone" dataKey="cadencia_optima_lstm" name="LSTM" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="5 5" dot={false} />
                            <Line type="monotone" dataKey="cadencia_optima_bilstm" name="BiLSTM" stroke="#22c55e" strokeWidth={1.5} strokeDasharray="5 5" dot={false} />
                        </ComposedChart>
                    </ResponsiveContainer>
                )}

                {/* Tiempo */}
                {metricaActiva === 'tiempo' && (
                    <>
                        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                            <div style={{ fontSize: '13px', color: '#6b7280' }}>Tiempo real del cliente</div>
                            <div style={{ fontSize: '28px', fontWeight: 800, color: '#3b82f6' }}>{formatTiempo(tiempoReal)}</div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
                            {tiempoCards.map((m, i) => (
                                <div key={i} style={{
                                    background: '#f9fafb', borderRadius: '12px',
                                    padding: '16px', textAlign: 'center',
                                    border: `2px solid ${m.color}30`
                                }}>
                                    <div style={{ fontWeight: 700, color: m.color, marginBottom: '8px', fontSize: '14px' }}>{m.label}</div>
                                    <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Tiempo óptimo</div>
                                    <div style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>{formatTiempo(m.tiempoOptimo)}</div>
                                    <div style={{
                                        fontSize: '16px', fontWeight: 700,
                                        color: m.dif > 0 ? '#22c55e' : '#ef4444',
                                        background: m.dif > 0 ? '#f0fdf4' : '#fef2f2',
                                        padding: '6px', borderRadius: '8px'
                                    }}>
                                        {m.dif > 0 ? `${Math.abs(m.dif)}s ganados` : `+${Math.abs(m.dif)}s perdidos`}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}