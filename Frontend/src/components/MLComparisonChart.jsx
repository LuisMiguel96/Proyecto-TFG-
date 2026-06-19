import {
    Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, ComposedChart, Line, Legend
} from 'recharts'

export default function MLComparisonChart({ data }) {
    return (
        <>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>
                🤖 Comparativa ML: Cliente vs Potencia Óptima
            </div>
            <ResponsiveContainer width="100%" height={200}>
                <ComposedChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
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
        </>
    )
}
