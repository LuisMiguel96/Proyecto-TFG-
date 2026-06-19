import { ComposedChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function VAMChart({ data, theme }) {
    if (!data || data.length === 0) return null

    // Distancia total del tramo en km
    const distanciaTotal = (data[data.length - 1].distancia - data[0].distancia) / 1000

    // Tiempo real en segundos
    const tiempoReal = data[data.length - 1].segundo - data[0].segundo

    // Factor velocidad/vatios del cliente
    const puntosValidos = data.filter(p => p.watts_cliente > 100 && p.velocidad > 7)
    const factorVV = puntosValidos.length > 0
        ? puntosValidos.reduce((s, p) => s + p.velocidad / p.watts_cliente, 0) / puntosValidos.length
        : 0
    const velMaxCliente = Math.max(...data.map(p => p.velocidad))

    // Velocidad media óptima
    const velMediaOptima = data.reduce((s, p) => s + Math.min(p.watts_optimo * factorVV, velMaxCliente), 0) / data.length

    // Tiempo óptimo
    const tiempoOptimo = distanciaTotal / (velMediaOptima / 3600)

    // Diferencia
    const diferencia = tiempoReal - tiempoOptimo
    const ganado = diferencia < 0

    // Gráfico acumulado segundo a segundo
    let acumulado = 0
    const dataFinal = data.map((p, i) => {
        if (i === 0) return { ...p, tiempo_acumulado: 0 }
        const velOptima = p.watts_optimo * factorVV
        const velReal = p.velocidad
        if (velReal <= 0 || velOptima <= 0) return { ...p, tiempo_acumulado: acumulado }
        const dist1s = velReal / 3600
        const tReal = 1
        const tOptimo = dist1s / (velOptima / 3600)
        acumulado += tReal - tOptimo
        return {
            ...p, tiempo_acumulado: parseFloat(acumulado.toFixed(2)), vel_optima: parseFloat(velOptima.toFixed(2),)
        }
    })

    return (
        <div style={{ marginTop: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>
                ⏱️ Tiempo ganado/perdido respecto al óptimo
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '12px' }}>
                <div style={{ background: '#f9fafb', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#3b82f6' }}>
                        {Math.floor(tiempoReal / 60)}m {Math.round(tiempoReal % 60)}s
                    </div>
                    <div style={{ fontSize: '10px', color: '#9ca3af' }}>Tiempo real</div>
                </div>
                <div style={{ background: '#f9fafb', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#ef4444' }}>
                        {Math.floor(tiempoOptimo / 60)}m {Math.round(tiempoOptimo % 60)}s
                    </div>
                    <div style={{ fontSize: '10px', color: '#9ca3af' }}>Tiempo óptimo</div>
                </div>
                <div style={{ background: ganado ? '#f0fdf4' : '#fff7ed', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: ganado ? '#22c55e' : '#f59e0b' }}>
                        {ganado ? '-' : '+'}{Math.abs(diferencia).toFixed(0)}s
                    </div>
                    <div style={{ fontSize: '10px', color: '#9ca3af' }}>
                        {ganado ? '🏆 Tiempo ganado' : '⚠️ Tiempo perdido'}
                    </div>
                </div>
            </div>

            <ResponsiveContainer width="100%" height={160}>
                <ComposedChart data={dataFinal} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="segundo" tickFormatter={v => `${v}s`} tick={{ fontSize: 10 }} />
                    <YAxis hide domain={['auto', 'auto']} />
                    <Tooltip
                        contentStyle={{ fontSize: '11px', borderRadius: '8px' }}
                        formatter={(val, name) => [`${parseFloat(val).toFixed(1)} km/h`, name]}
                        labelFormatter={(l) => `Segundo ${l}`}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Area type="monotone" dataKey="velocidad"
                        name="Velocidad real (km/h)"
                        stroke="#3b82f6"
                        fill="#3b82f633"
                        strokeWidth={2} dot={false} />
                    <Area type="monotone" dataKey="vel_optima"
                        name="Velocidad óptima (km/h)"
                        stroke="#ef4444"
                        fill="#ef444433"
                        strokeWidth={2} dot={false}
                        strokeDasharray="5 3" />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    )
}