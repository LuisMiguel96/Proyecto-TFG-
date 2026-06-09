import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, ComposedChart, Line, Legend
} from 'recharts'

const SLOPE_CLIMB = 0.5
const SLOPE_FLAT_MAX = -0.5
const MIN_SEGMENT_KM = 1.0
const THEME = {
    subida: { bg: '#fff1f1', border: '#f87171', accent: '#ef4444', text: '#b91c1c', emoji: '⬆️' },
    llano: { bg: '#eff6ff', border: '#60a5fa', accent: '#3b82f6', text: '#1d4ed8', emoji: '➡️' },
    bajada: { bg: '#f0fdf4', border: '#4ade80', accent: '#22c55e', text: '#15803d', emoji: '⬇️' },
}

function calcSlope(altDiff, distDiff) {
    if (distDiff <= 0) return 0
    return (altDiff / distDiff) * 100
}

function classifySlope(slope) {
    if (slope > SLOPE_CLIMB) return 'subida'
    if (slope < SLOPE_FLAT_MAX) return 'bajada'
    return 'llano'
}

function SegmentChart({ points, accentColor, height = 160 }) {
    if (!points || points.length < 2) return null
    return (
        <ResponsiveContainer width="100%" height={height}>
            <ComposedChart data={points} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <defs>
                    <linearGradient id="altGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={accentColor} stopOpacity={0.35} />
                        <stop offset="95%" stopColor={accentColor} stopOpacity={0.03} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="dist" tickFormatter={v => `${parseFloat(v).toFixed(1)}km`} tick={{ fontSize: 10 }} />
                <YAxis yAxisId="alt" hide domain={['auto', 'auto']} />
                <YAxis yAxisId="watts" hide orientation="right" domain={['auto', 'auto']} />
                <YAxis yAxisId="speed" hide orientation="right" domain={['auto', 'auto']} />
                <Tooltip
                    contentStyle={{ fontSize: '11px', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                    formatter={(val, name) => {
                        if (name === 'Elevación') return [`${parseFloat(val).toFixed(0)}m`, name]
                        if (name === 'Vatios') return [`${parseFloat(val).toFixed(0)}W`, name]
                        if (name === 'Velocidad') return [`${parseFloat(val).toFixed(1)}km/h`, name]
                        return [val, name]
                    }}
                    labelFormatter={(l) => `${parseFloat(l).toFixed(2)} km`}
                />
                <Area yAxisId="alt" type="monotone" dataKey="altitude" name="Elevación"
                    stroke={accentColor} strokeWidth={2} fill="url(#altGrad)" dot={false} />
                <Line yAxisId="watts" type="monotone" dataKey="watts" name="Vatios"
                    stroke="#f59e0b" strokeWidth={1.5} dot={false} />
                <Line yAxisId="speed" type="monotone" dataKey="velocity" name="Velocidad"
                    stroke="#8b5cf6" strokeWidth={1.5} dot={false} />
            </ComposedChart>
        </ResponsiveContainer>
    )
}

function SegmentCard({ segment, index, total, theme, expanded, onClick, predData, onZoom }) {
    const pts = segment.points
    const avgWatts = (pts.reduce((s, p) => s + p.watts, 0) / pts.length).toFixed(0)
    const avgSpeed = (pts.reduce((s, p) => s + p.velocity, 0) / pts.length).toFixed(1)
    const maxWatts = Math.max(...pts.map(p => p.watts)).toFixed(0)
    const desnivel = (pts[pts.length - 1].altitude - pts[0].altitude).toFixed(0)
    const distKm = (pts[pts.length - 1].dist - pts[0].dist).toFixed(2)
    const avgSlope = segment.avgSlope?.toFixed(1) || '0'
    const segPred = predData?.filter(p => p.segundo >= segment.startSeg && p.segundo <= segment.endSeg) || []
    console.log('startSeg:', segment.startSeg, 'endSeg:', segment.endSeg, 'segPred length:', segPred.length)
    console.log('predData range:', predData?.[0]?.segundo, '-', predData?.[predData.length-1]?.segundo)
    const avgOptimo = segPred.length > 0
        ? (segPred.reduce((s, p) => s + p.watts_optimo, 0) / segPred.length).toFixed(0)
        : null
    const diferencia = avgOptimo
        ? (parseFloat(avgOptimo) - parseFloat(avgWatts)).toFixed(0)
        : null
    const mejoraPct = avgOptimo
        ? ((parseFloat(avgOptimo) - parseFloat(avgWatts)) / parseFloat(avgWatts) * 100).toFixed(1)
        : null
    return (
        <div
            onClick={onClick}
            style={{
                background: 'white',
                borderRadius: '16px',
                padding: expanded ? '28px' : '20px',
                border: `2px solid ${expanded ? theme.accent : theme.border}`,
                boxShadow: expanded ? `0 8px 32px rgba(0,0,0,0.12)` : '0 4px 16px rgba(0,0,0,0.06)',
                width: '100%',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                transform: expanded ? 'scale(1.01)' : 'scale(1)',
            }}
        >
            {/* Cabecera */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: theme.text, background: theme.bg, padding: '3px 10px', borderRadius: '20px' }}>
                        Tramo {index + 1} de {total}
                    </span>
                    <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
                        {pts[0].dist.toFixed(2)} km → {pts[pts.length - 1].dist.toFixed(2)} km · {distKm} km
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>Pendiente media</div>
                        <div style={{ fontSize: '20px', fontWeight: 800, color: theme.accent }}>{avgSlope}%</div>
                    </div>
                    <span style={{ fontSize: '18px', color: theme.accent }}>{expanded ? '▲' : '▼'}</span>
                    <button onClick={(e) => { e.stopPropagation(); onZoom(segment) }} style={{
                        background: theme.bg, border: `1px solid ${theme.border}`,
                        borderRadius: '8px', padding: '4px 10px',
                        fontSize: '14px', cursor: 'pointer', color: theme.text
                    }}
                    >
                        🔍 Ver
                    </button>

                </div>
            </div>

            {/* Gráfico — más alto si está expandido */}
            <SegmentChart points={pts} accentColor={theme.accent} height={expanded ? 280 : 160} />

            {/* Leyenda */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', margin: '8px 0 16px', fontSize: '11px', color: '#6b7280' }}>
                <span><span style={{ color: theme.accent }}>●</span> Elevación</span>
                <span><span style={{ color: '#f59e0b' }}>●</span> Vatios</span>
                <span><span style={{ color: '#8b5cf6' }}>●</span> Velocidad</span>
            </div>

            {/* Métricas */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {[
                    { label: 'Vatios medios', value: `${avgWatts}W`, color: '#f59e0b' },
                    { label: 'Vel. media', value: `${avgSpeed} km/h`, color: '#8b5cf6' },
                    { label: 'Vatios máx', value: `${maxWatts}W`, color: '#ef4444' },
                    { label: 'Desnivel', value: `${desnivel > 0 ? '+' : ''}${desnivel}m`, color: theme.accent },
                ].map(({ label, value, color }) => (
                    <div key={label} style={{ background: expanded ? theme.bg : '#f9fafb', borderRadius: '10px', padding: '10px', textAlign: 'center', transition: 'background 0.3s' }}>
                        <div style={{ fontSize: expanded ? '20px' : '16px', fontWeight: 800, color, transition: 'font-size 0.3s' }}>{value}</div>
                        <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '2px' }}>{label}</div>
                    </div>
                ))}
            </div>
            {avgOptimo && (
                <div style={{ marginTop: '12px', background: parseFloat(diferencia) > 0 ? '#fff7ed' : '#f0fdf4', borderRadius: '12px', padding: '12px', border: `1px solid ${parseFloat(diferencia) > 0 ? '#fed7aa' : '#bbf7d0'}` }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>🤖 Análisis ML</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '16px', fontWeight: 800, color: '#3b82f6' }}>{avgWatts}W</div>
                            <div style={{ fontSize: '10px', color: '#9ca3af' }}>Tu media</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '16px', fontWeight: 800, color: '#ef4444' }}>{avgOptimo}W</div>
                            <div style={{ fontSize: '10px', color: '#9ca3af' }}>Óptimo modelo</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '16px', fontWeight: 800, color: parseFloat(diferencia) > 0 ? '#f59e0b' : '#22c55e' }}>
                                {parseFloat(diferencia) > 0 ? '+' : ''}{diferencia}W
                            </div>
                            <div style={{ fontSize: '10px', color: '#9ca3af' }}>
                                {parseFloat(mejoraPct) > 0 ? '⬆️ Puedes mejorar' : '✅ Óptimo'}
                            </div>
                        </div>
                    </div>
                    {parseFloat(mejoraPct) > 5 && (
                        <div style={{ marginTop: '8px', fontSize: '12px', color: '#92400e', background: '#fef3c7', padding: '8px', borderRadius: '8px', textAlign: 'center' }}>
                            💡 Podrías aumentar tu potencia un <strong>{mejoraPct}%</strong> en este tramo
                        </div>
                    )}
                    {parseFloat(mejoraPct) < -5 && (
                        <div style={{ marginTop: '8px', fontSize: '12px', color: '#065f46', background: '#d1fae5', padding: '8px', borderRadius: '8px', textAlign: 'center' }}>
                            ⚠️ Estás sobresforzándote un <strong>{Math.abs(mejoraPct)}%</strong> — ahorra energía
                        </div>
                    )}
                </div>
            )}
            {expanded && segPred.length > 0 && (
                <div style={{ marginTop: '16px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>
                        🤖 Comparativa ML: Cliente vs Potencia Óptima
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <ComposedChart data={segPred} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="segundo" tickFormatter={v => `${v}s`} tick={{ fontSize: 10 }} />
                            <YAxis hide domain={['auto', 'auto']} />
                            <Tooltip
                                contentStyle={{ fontSize: '11px', borderRadius: '8px' }}
                                formatter={(val, name) => [`${parseFloat(val).toFixed(0)}W`, name]}
                                labelFormatter={(l) => `Segundo ${l}`}
                            />
                            <Legend wrapperStyle={{ fontSize: '11px' }} />
                            <Area type="monotone" dataKey="watts_cliente" name="Cliente"
                                stroke="#3b82f6" fill="#3b82f633" strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="watts_optimo" name="Óptimo (Modelo)"
                                stroke="#ef4444" strokeWidth={2} dot={false} strokeDasharray="5 3" />
                        </ComposedChart>
                    </ResponsiveContainer>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
                        <span>🔵 Azul = Cliente actual</span>
                        <span>🔴 Rojo = Potencia óptima (modelo)</span>
                    </div>
                </div>
            )}
            <div style={{ marginTop: '10px', fontSize: '11px', color: '#9ca3af', textAlign: 'center' }}>
                {pts.length} puntos · {distKm} km de longitud
            </div>
        </div>
    )
}

function PerformanceAnalysis() {
    const { user } = useAuth()
    const [activities, setActivities] = useState([])
    const [selectedActivity, setSelectedActivity] = useState(null)
    const [analysisData, setAnalysisData] = useState(null)
    const [activeType, setActiveType] = useState('subida')
    const [currentIndex, setCurrentIndex] = useState(0)
    const [expandedIndex, setExpandedIndex] = useState(null)
    const [zoomedSegment, setZoomedSegment] = useState(null)
    const [loading, setLoading] = useState(false)
    const [predData, setPredData] = useState(null)
    const [loadingML, setLoadingML] = useState(false)

    useEffect(() => {
        if (user?.id) fetchActivities()
    }, [user])

    const fetchActivities = async () => {
        try {
            const res = await axios.get(`http://localhost:3000/api/activities/${user.id}/type/Ride`)
            setActivities(res.data.activities)
        } catch (err) {
            console.error(err)
        }
    }

    const analyzeActivity = async (activity) => {
        setSelectedActivity(activity)
        setLoading(true)
        setAnalysisData(null)
        setPredData(null)
        setCurrentIndex(0)
        setExpandedIndex(null)

        try {
            const res = await axios.get(
                `http://localhost:3000/api/strava/streams/${user.id}/${activity.stravaId}`
            )
            processStreams(res.data)
            await fetchMLPrediction(res.data)
        } catch (err) {
            console.error('Error streams:', err)
        } finally {
            setLoading(false)
        }
    }
    const fetchMLPrediction = async (streamData) => {
        setLoadingML(true)
        try {
            const altitude = streamData.altitude?.data || []
            const velocity = streamData.velocity_smooth?.data || []
            const watts = streamData.watts?.data || []
            const distance = streamData.distance?.data || []

            const res = await axios.post('http://localhost:8000/prediccion/analizar', {
                altitude, velocity, watts, distance
            })
            setPredData(res.data.serie)
        } catch (err) {
            console.error('Error ML:', err)
        } finally {
            setLoadingML(false)
        }
    }


    const processStreams = (streamData) => {
        const altitude = streamData.altitude?.data || []
        const watts = streamData.watts?.data || []
        const velocity = streamData.velocity_smooth?.data || []
        const distance = streamData.distance?.data || []
        if (altitude.length === 0) return

        const allPoints = altitude.map((alt, i) => {
            const lookback = Math.max(0, i - 50)
            const distDiff = distance[i] - distance[lookback]
            const altDiff = alt - altitude[lookback]
            return {
                dist: distance[i] / 1000,
                altitude: alt,
                watts: watts[i] || 0,
                velocity: velocity[i] ? velocity[i] * 3.6 : 0,
                slope: calcSlope(altDiff, distDiff),
                segundo: i
            }
        })
        const result = { subida: [], llano: [], bajada: [] }
        let currentType = null
        let currentSeg = []
        let slopeAcc = 0

        allPoints.forEach((pt) => {
            const type = classifySlope(pt.slope)
            if (type !== currentType) {
                const segDistKm = currentSeg.length > 0 ? currentSeg[currentSeg.length - 1].dist - currentSeg[0].dist : 0
                if (segDistKm >= MIN_SEGMENT_KM && currentType) {
                    result[currentType].push({
                        points: currentSeg,
                        avgSlope: slopeAcc / currentSeg.length,
                        startSeg: currentSeg[0].segundo,
                        endSeg: currentSeg[currentSeg.length - 1].segundo
                    })
                }
                currentType = type
                currentSeg = [pt]
                slopeAcc = pt.slope
            } else {
                currentSeg.push(pt)
                slopeAcc += pt.slope
            }
        })
        const slopes = allPoints.map(p => p.slope)
        console.log('Pendientes muestra:', slopes.slice(0, 20))
        console.log('Max pendiente:', Math.max(...slopes))
        console.log('Min pendiente:', Math.min(...slopes))
        const segDistKm2 = currentSeg.length > 0 ? currentSeg[currentSeg.length - 1].dist - currentSeg[0].dist : 0
        if (segDistKm2 >= MIN_SEGMENT_KM && currentType) {
            result[currentType].push({
                points: currentSeg,
                avgSlope: slopeAcc / currentSeg.length,
                startSeg: currentSeg[0].segundo,
                endSeg: currentSeg[currentSeg.length - 1].segundo
            })
        }


        const calcGlobal = (segs) => {
            const all = segs.flatMap(s => s.points)
            if (all.length === 0) return { avgWatts: '0', avgSpeed: '0', count: 0 }
            return {
                avgWatts: (all.reduce((s, p) => s + p.watts, 0) / all.length).toFixed(0),
                avgSpeed: (all.reduce((s, p) => s + p.velocity, 0) / all.length).toFixed(1),
                count: segs.length
            }
        }

        setAnalysisData({
            subida: { segments: result.subida, ...calcGlobal(result.subida) },
            llano: { segments: result.llano, ...calcGlobal(result.llano) },
            bajada: { segments: result.bajada, ...calcGlobal(result.bajada) },
        })
    }

    const handleTypeChange = (type) => {
        setActiveType(type)
        setCurrentIndex(0)
        setExpandedIndex(null)
    }

    const handleCardClick = (index) => {
        setExpandedIndex(prev => prev === index ? null : index)
    }

    const activeSegments = analysisData?.[activeType]?.segments || []
    const theme = THEME[activeType]

    return (
        <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.25rem', color: '#111827' }}>
                🎯 Análisis de Rendimiento
            </h1>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem', fontSize: '14px' }}>
                Segmentación por terreno · Subida &gt;2.5% · Llano 0–2.5% · Bajada &lt;0% · Mínimo 4km por tramo
            </p>

            {/* Selector actividades */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                {activities.map(a => (
                    <button key={a._id} onClick={() => analyzeActivity(a)} style={{
                        padding: '6px 14px', fontSize: '12px',
                        background: selectedActivity?._id === a._id ? '#fc5200' : '#f3f4f6',
                        color: selectedActivity?._id === a._id ? 'white' : '#374151',
                        border: 'none', borderRadius: '20px', cursor: 'pointer',
                        fontWeight: selectedActivity?._id === a._id ? 700 : 400,
                    }}>
                        {a.name} · {(a.distance / 1000).toFixed(1)} km
                    </button>
                ))}
            </div>

            {loading && (
                <div style={{ textAlign: 'center', padding: '4rem', color: '#6b7280' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⏳</div>
                    <p>Analizando ruta...</p>
                </div>
            )}
            {loadingML && !loading && (
                <div style={{ background: '#eff6ff', border: '1px solid #93c5fd', borderRadius: '12px', padding: '12px 16px', marginBottom: '1rem', fontSize: '13px', color: '#1d4ed8' }}>
                    🤖 Calculando potencia óptima con el modelo ML...
                </div>
            )}

            {analysisData && (
                <>
                    {predData && (
                        <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '16px', marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '22px', fontWeight: 800, color: '#3b82f6' }}>
                                    {(predData.reduce((s, p) => s + p.watts_cliente, 0) / predData.length).toFixed(0)}W
                                </div>
                                <div style={{ fontSize: '11px', color: '#9ca3af' }}>Vatios medios cliente</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '22px', fontWeight: 800, color: '#ef4444' }}>
                                    {(predData.reduce((s, p) => s + p.watts_optimo, 0) / predData.length).toFixed(0)}W
                                </div>
                                <div style={{ fontSize: '11px', color: '#9ca3af' }}>Vatios óptimos (modelo)</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '22px', fontWeight: 800, color: '#f59e0b' }}>
                                    {((predData.reduce((s, p) => s + p.watts_optimo - p.watts_cliente, 0) / predData.length) / (predData.reduce((s, p) => s + p.watts_cliente, 0) / predData.length) * 100).toFixed(1)}%
                                </div>
                                <div style={{ fontSize: '11px', color: '#9ca3af' }}>Mejora potencial</div>
                            </div>
                        </div>
                    )}

                    {/* Tabs */}
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem' }}>
                        {['subida', 'llano', 'bajada'].map(type => {
                            const t = THEME[type]
                            const d = analysisData[type]
                            const active = activeType === type
                            return (
                                <button key={type} onClick={() => handleTypeChange(type)} style={{
                                    flex: 1, padding: '14px', borderRadius: '14px',
                                    border: `2px solid ${active ? t.accent : '#e5e7eb'}`,
                                    background: active ? t.bg : 'white', cursor: 'pointer', transition: 'all 0.15s',
                                    textAlign: 'center'
                                }}>
                                    <div style={{ fontSize: '22px', marginBottom: '4px' }}>{t.emoji}</div>
                                    <div style={{ fontWeight: 700, fontSize: '14px', color: active ? t.text : '#374151', textTransform: 'capitalize' }}>{type}</div>
                                    <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
                                        {d.count} tramos · {d.avgWatts}W · {d.avgSpeed} km/h
                                    </div>
                                </button>
                            )
                        })}
                    </div>

                    {activeSegments.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af', background: '#f9fafb', borderRadius: '16px' }}>
                            No hay tramos de {activeType} de más de 4km en esta actividad
                        </div>
                    ) : (
                        <>
                            {/* Navegación carrusel */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <button
                                    onClick={() => { setCurrentIndex(i => Math.max(0, i - 1)); setExpandedIndex(null) }}
                                    disabled={currentIndex === 0}
                                    style={{
                                        width: '40px', height: '40px', borderRadius: '50%',
                                        border: `2px solid ${currentIndex === 0 ? '#e5e7eb' : theme.accent}`,
                                        background: 'white', cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
                                        fontSize: '18px', color: currentIndex === 0 ? '#d1d5db' : theme.accent,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}
                                >←</button>

                                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '600px' }}>
                                    {activeSegments.map((_, i) => (
                                        <button key={i} onClick={() => { setCurrentIndex(i); setExpandedIndex(null) }} style={{
                                            width: i === currentIndex ? '24px' : '8px',
                                            height: '8px', borderRadius: '4px', border: 'none',
                                            background: i === currentIndex ? theme.accent : '#d1d5db',
                                            cursor: 'pointer', transition: 'all 0.2s', padding: 0
                                        }} />
                                    ))}
                                </div>

                                <button
                                    onClick={() => { setCurrentIndex(i => Math.min(activeSegments.length - 1, i + 1)); setExpandedIndex(null) }}
                                    disabled={currentIndex === activeSegments.length - 1}
                                    style={{
                                        width: '40px', height: '40px', borderRadius: '50%',
                                        border: `2px solid ${currentIndex === activeSegments.length - 1 ? '#e5e7eb' : theme.accent}`,
                                        background: 'white', cursor: currentIndex === activeSegments.length - 1 ? 'not-allowed' : 'pointer',
                                        fontSize: '18px', color: currentIndex === activeSegments.length - 1 ? '#d1d5db' : theme.accent,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}
                                >→</button>
                            </div>
                                {zoomedSegment && (
                                    <div
                                        onClick={() => setZoomedSegment(null)}
                                        style={{
                                            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                                            background: 'rgba(0,0,0,0.8)', zIndex: 9999,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            padding: '20px'
                                        }}
                                    >
                                        <div
                                            onClick={(e) => e.stopPropagation()}
                                            style={{
                                                background: 'white', borderRadius: '20px', padding: '28px',
                                                width: '95%', maxWidth: '1100px', maxHeight: '95vh',
                                                overflowY: 'auto', position: 'relative'
                                            }}
                                        >
                                            <button
                                                onClick={() => setZoomedSegment(null)}
                                                style={{
                                                    position: 'absolute', top: '16px', right: '16px',
                                                    background: '#f3f4f6', border: 'none', borderRadius: '50%',
                                                    width: '36px', height: '36px', cursor: 'pointer',
                                                    fontSize: '18px'
                                                }}
                                            >✕</button>
                                            <SegmentCard
                                                segment={zoomedSegment}
                                                index={activeSegments.indexOf(zoomedSegment)}
                                                total={activeSegments.length}
                                                theme={THEME[activeType]}
                                                expanded={true}
                                                onClick={() => { }}
                                                predData={predData}
                                                onZoom={() => { }}
                                            />
                                        </div>
                                    </div>
                                )}
                            {/* Tarjeta actual — click para expandir */}
                            <SegmentCard
                                segment={activeSegments[currentIndex]}
                                index={currentIndex}
                                total={activeSegments.length}
                                theme={theme}
                                expanded={expandedIndex === currentIndex}
                                onClick={() => handleCardClick(currentIndex)}
                                predData={predData}
                                onZoom={(seg) => setZoomedSegment(seg)}
                            />
                        </>
                    )}
                </>
            )}
        </div>
    )
}

export default PerformanceAnalysis