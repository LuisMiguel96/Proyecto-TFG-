import SegmentChart from './SegmentChart'
import CadenceChart from './cadenceChart.jsx'
import VAMChart from './VAMChart'
import MLComparisonChart from './MLComparisonChart'

export default function SegmentCard({ segment, index, total, theme, expanded, onClick, predData, onZoom, terrainType }) {
    const pts = segment.points
    const avgWatts = (pts.reduce((s, p) => s + p.watts, 0) / pts.length).toFixed(0)
    const avgSpeed = (pts.reduce((s, p) => s + p.velocity, 0) / pts.length).toFixed(1)
    const maxWatts = Math.max(...pts.map(p => p.watts)).toFixed(0)
    const desnivel = (pts[pts.length - 1].altitude - pts[0].altitude).toFixed(0)
    const distKm = (pts[pts.length - 1].dist - pts[0].dist).toFixed(2)
    const avgSlope = segment.avgSlope?.toFixed(1) || '0'
    const segPred = predData?.filter(p => p.segundo >= segment.startSeg && p.segundo <= segment.endSeg) || []
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

            <SegmentChart points={pts} accentColor={theme.accent} height={expanded ? 280 : 160} />

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', margin: '8px 0 16px', fontSize: '11px', color: '#6b7280' }}>
                <span><span style={{ color: theme.accent }}>●</span> Elevación</span>
                <span><span style={{ color: '#f59e0b' }}>●</span> Vatios</span>
                <span><span style={{ color: '#8b5cf6' }}>●</span> Velocidad</span>
            </div>

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
                <div style={{ marginTop: '12px',background: Math.abs(parseFloat(diferencia)) <= 5 ? '#f0fdf4' :parseFloat(diferencia) > 5 ? '#fff7ed' : '#fefce8'}}>
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
            {segPred.length > 0 && (
                <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ background: '#f9fafb', borderRadius: '12px', padding: '12px' }}>
                        <MLComparisonChart data={segPred} />
                    </div>
                    <div style={{ background: '#f9fafb', borderRadius: '12px', padding: '12px' }}>
                        <CadenceChart data={segPred} />
                    </div>
                    {terrainType === 'subida' && (
                        <div style={{ background: '#f9fafb', borderRadius: '12px', padding: '12px' }}>
                            <VAMChart data={segPred} theme={theme} />
                        </div>
                    )}
                </div>
            )}
            <div style={{ marginTop: '10px', fontSize: '11px', color: '#9ca3af', textAlign: 'center' }}>
                {pts.length} puntos · {distKm} km de longitud
            </div>
        </div>
    )
}


