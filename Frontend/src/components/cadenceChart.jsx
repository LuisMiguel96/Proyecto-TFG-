import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const getCadenciaOptima = (wattsOptimo) => {
    if (wattsOptimo < 137) return 85      // Z1 Recuperación
    if (wattsOptimo < 187) return 88      // Z2 Resistencia
    if (wattsOptimo < 225) return 92      // Z3 Tempo
    if (wattsOptimo < 262) return 95      // Z4 Umbral
    return 98                              // Z5 VO2max
}
export default function CadenceChart({ data }) {
    if (!data || data.length === 0) return null
    if (!data.some(p => p.cadencia > 0)) return null

    const dataConOptima = data.map(p => ({
        ...p,
        cadencia_optima: getCadenciaOptima(p.watts_optimo)
    }))

    const cadMediaCliente = Math.round(data.reduce((s, p) => s + p.cadencia, 0) / data.length)
    const cadMediaOptima = Math.round(dataConOptima.reduce((s, p) => s + p.cadencia_optima, 0) / dataConOptima.length)

    return (
        <div style={{ marginTop: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>
                🔄 Cadencia y Fuerza
            </div>
            {/* Métricas resumen */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '8px', fontSize: '12px' }}>
                <div style={{ background: '#f3f0ff', padding: '6px 12px', borderRadius: '8px' }}>
                    <span style={{ color: '#6b7280' }}>Tu cadencia: </span>
                    <strong style={{ color: '#8b5cf6' }}>{cadMediaCliente} rpm</strong>
                </div>
                <div style={{ background: '#f0fdf4', padding: '6px 12px', borderRadius: '8px' }}>
                    <span style={{ color: '#6b7280' }}>Cadencia óptima: </span>
                    <strong style={{ color: '#22c55e' }}>{cadMediaOptima} rpm</strong>
                </div>
                <div style={{ 
                    background: cadMediaCliente >= cadMediaOptima - 3 && cadMediaCliente <= cadMediaOptima + 3 ? '#f0fdf4' : '#fff7ed',
                    padding: '6px 12px', borderRadius: '8px' 
                }}>
                    <span style={{ color: '#6b7280' }}>Diferencia: </span>
                    <strong style={{ color: cadMediaCliente >= cadMediaOptima - 3 ? '#22c55e' : '#f97316' }}>
                        {cadMediaCliente - cadMediaOptima > 0 ? '+' : ''}{cadMediaCliente - cadMediaOptima} rpm
                    </strong>
                </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
                <ComposedChart data={dataConOptima} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
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
                        name="Cadencia cliente (rpm)" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                    <Line yAxisId="cad" type="monotone" dataKey="cadencia_optima"
                        name="Cadencia óptima (rpm)" stroke="#22c55e" strokeWidth={2} 
                        strokeDasharray="5 5" dot={false} />
                    <Line yAxisId="fuerza" type="monotone" dataKey="fuerza"
                        name="Fuerza (Nm)" stroke="#f59e0b" strokeWidth={2} dot={false} />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    )
}