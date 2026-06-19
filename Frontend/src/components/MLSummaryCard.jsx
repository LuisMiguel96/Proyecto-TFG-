export default function MLSummaryCard({ predData }) {
    if (!predData) return null
    return (
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
    )
}
