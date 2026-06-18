import { useState } from 'react'
import {
    ComposedChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Line, Legend
} from 'recharts'

export default function SegmentChart({ points, accentColor, height = 160 }) {
    if (!points || points.length < 2) return null

    const [activas, setActivas] = useState({ alt: true, watts: true, vel: true })

    const toggle = (key) => setActivas(prev => ({ ...prev, [key]: !prev[key] }))

    const maxAlt = Math.max(...points.map(p => p.altitude))
    const minAlt = Math.min(...points.map(p => p.altitude))
    const maxWatts = Math.max(...points.map(p => p.watts))
    const minWatts = Math.min(...points.map(p => p.watts))
    const maxVel = Math.max(...points.map(p => p.velocity))
    const minVel = Math.min(...points.map(p => p.velocity))

    const normalize = (val, min, max) => max === min ? 0 : (val - min) / (max - min)

    const normalizedPoints = points.map(p => ({
        ...p,
        alt_norm: normalize(p.altitude, minAlt, maxAlt),
        watts_norm: normalize(p.watts, minWatts, maxWatts),
        vel_norm: normalize(p.velocity, minVel, maxVel),
    }))

    return (
        <div>
            {/* Checkboxes */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '8px', fontSize: '11px' }}>
                {[
                    { key: 'alt', label: 'Elevación', color: '#94a3b8' },
                    { key: 'watts', label: 'Vatios', color: '#f59e0b' },
                    { key: 'vel', label: 'Velocidad', color: '#3b82f6' },
                ].map(({ key, label, color }) => (
                    <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={activas[key]}
                            onChange={() => toggle(key)}
                            style={{ accentColor: color }}
                        />
                        <span style={{ color: activas[key] ? color : '#9ca3af', fontWeight: 600 }}>{label}</span>
                    </label>
                ))}
            </div>

            <ResponsiveContainer width="100%" height={height}>
                <ComposedChart data={normalizedPoints} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="altGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.03} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="dist" tickFormatter={v => `${parseFloat(v).toFixed(1)}km`} tick={{ fontSize: 10 }} />
                    <YAxis hide domain={[0, 1]} />
                    <Tooltip
                        contentStyle={{ fontSize: '11px', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                        formatter={(val, name, props) => {
                            const p = props.payload
                            if (name === 'Elevación' && activas.alt) return [`${parseFloat(p.altitude).toFixed(0)}m`, name]
                            if (name === 'Vatios' && activas.watts) return [`${parseFloat(p.watts).toFixed(0)}W`, name]
                            if (name === 'Velocidad' && activas.vel) return [`${parseFloat(p.velocity).toFixed(1)}km/h`, name]
                            return [null, name]
                        }}
                        labelFormatter={(l) => `${parseFloat(l).toFixed(2)} km`}
                    />
                    {activas.alt && (
                        <Area type="monotone" dataKey="alt_norm" name="Elevación"
                            stroke="#94a3b8" strokeWidth={2} fill="url(#altGrad)" dot={false} />
                    )}
                    {activas.watts && (
                        <Line type="monotone" dataKey="watts_norm" name="Vatios"
                            stroke="#f59e0b" strokeWidth={2} dot={false} />
                    )}
                    {activas.vel && (
                        <Line type="monotone" dataKey="vel_norm" name="Velocidad"
                            stroke="#3b82f6" strokeWidth={2} dot={false} />
                    )}
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    )
}