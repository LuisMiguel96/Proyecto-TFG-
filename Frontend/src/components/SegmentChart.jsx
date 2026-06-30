import { useState } from 'react'
import {
    ComposedChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Line
} from 'recharts'

export default function SegmentChart({ points, accentColor, height = 160 }) {
    if (!points || points.length < 2) return null

    const [activas, setActivas] = useState({ alt: true, watts: true, vel: true, slope: false })
    const toggle = (key) => setActivas(prev => ({ ...prev, [key]: !prev[key] }))

    const maxAlt = Math.max(...points.map(p => p.altitude))
    const minAlt = Math.min(...points.map(p => p.altitude))
    const maxWatts = Math.max(...points.map(p => p.watts))
    const minWatts = Math.min(...points.map(p => p.watts))
    const maxVel = Math.max(...points.map(p => p.velocity))
    const minVel = Math.min(...points.map(p => p.velocity))

    const normalize = (val, min, max) => max === min ? 0 : (val - min) / (max - min)

    // Calcular pendiente punto a punto
    const pointsWithSlope = points.map((p, i) => {
        if (i === 0) return { ...p, slope: 0 }
        const prev = points[i - 1]
        const dAlt = p.altitude - prev.altitude
        const dDist = (p.dist - prev.dist) * 1000 // km a metros
        const slope = dDist > 0 ? (dAlt / dDist) * 100 : 0
        return { ...p, slope: parseFloat(slope.toFixed(1)) }
    })

    const slopes = pointsWithSlope.map(p => p.slope)
    const maxSlope = Math.max(...slopes)
    const minSlope = Math.min(...slopes)

    const normalizedPoints = pointsWithSlope.map(p => ({
        ...p,
        alt_norm: normalize(p.altitude, minAlt, maxAlt),
        watts_norm: normalize(p.watts, minWatts, maxWatts),
        vel_norm: normalize(p.velocity, minVel, maxVel),
        slope_norm: normalize(p.slope, minSlope, maxSlope),
    }))

    return (
        <div>
            {/* Checkboxes */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '8px', fontSize: '11px' }}>
                {[
                    { key: 'alt', label: 'Elevación', color: accentColor },
                    { key: 'watts', label: 'Vatios', color: '#f59e0b' },
                    { key: 'vel', label: 'Velocidad', color: '#8b5cf6' },
                    { key: 'slope', label: 'Pendiente', color: '#22c55e' },
                ].map(({ key, label, color }) => (
                    <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={activas[key]}
                            onChange={() => toggle(key)}
                            style={{ accentColor: color }}
                        />
                        <span style={{ color: activas[key] ? color : '#475569', fontWeight: 600 }}>{label}</span>
                    </label>
                ))}
            </div>

            <ResponsiveContainer width="100%" height={height}>
                <ComposedChart data={normalizedPoints} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="altGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={accentColor} stopOpacity={0.35} />
                            <stop offset="95%" stopColor={accentColor} stopOpacity={0.03} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="transparent" />
                    <XAxis dataKey="dist" tickFormatter={v => `${parseFloat(v).toFixed(1)}km`} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <YAxis hide domain={[0, 1]} />
                    <Tooltip
                        contentStyle={{ fontSize: '11px', borderRadius: '8px', border: '1px solid #334155', background: '#1e293b', color: 'white' }}
                        formatter={(val, name, props) => {
                            const p = props.payload
                            if (name === 'Elevación') return [`${parseFloat(p.altitude).toFixed(0)}m`, name]
                            if (name === 'Vatios') return [`${parseFloat(p.watts).toFixed(0)}W`, name]
                            if (name === 'Velocidad') return [`${parseFloat(p.velocity).toFixed(1)}km/h`, name]
                            if (name === 'Pendiente') return [`${parseFloat(p.slope).toFixed(1)}%`, name]
                            return [val, name]
                        }}
                        labelFormatter={(l) => `${parseFloat(l).toFixed(2)} km`}
                    />
                    {activas.alt && (
                        <Area type="monotone" dataKey="alt_norm" name="Elevación"
                            stroke={accentColor} strokeWidth={2} fill="url(#altGrad)" dot={false} />
                    )}
                    {activas.watts && (
                        <Line type="monotone" dataKey="watts_norm" name="Vatios"
                            stroke="#f59e0b" strokeWidth={1.5} dot={false} />
                    )}
                    {activas.vel && (
                        <Line type="monotone" dataKey="vel_norm" name="Velocidad"
                            stroke="#8b5cf6" strokeWidth={1.5} dot={false} />
                    )}
                    {activas.slope && (
                        <Line type="monotone" dataKey="slope_norm" name="Pendiente"
                            stroke="#22c55e" strokeWidth={1.5} strokeDasharray="4 2" dot={false} />
                    )}
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    )
}