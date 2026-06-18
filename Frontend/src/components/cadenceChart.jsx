import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function CadenceChart({ data }) {
    if (!data || data.length === 0) return null
    if (!data.some(p => p.cadencia > 0)) return null

    return (
        <div style={{ marginTop: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>
                🔄 Cadencia y Fuerza
            </div>
            <ResponsiveContainer width="100%" height={200}>
                <ComposedChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="segundo" tickFormatter={v => `${v}s`} tick={{ fontSize: 10 }} />
                    <YAxis yAxisId="cad" hide domain={['auto', 'auto']} />
                    <YAxis yAxisId="fuerza" hide orientation="right" domain={['auto', 'auto']} />
                    <Tooltip
                        contentStyle={{ fontSize: '11px', borderRadius: '8px' }}
                        formatter={(val, name) => [parseFloat(val).toFixed(1), name]}
                        labelFormatter={(l) => `Segundo ${l}`}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Line yAxisId="cad" type="monotone" dataKey="cadencia"
                        name="Cadencia (rpm)" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                    <Line yAxisId="fuerza" type="monotone" dataKey="fuerza"
                        name="Fuerza (Nm)" stroke="#f59e0b" strokeWidth={2} dot={false} />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    )
}