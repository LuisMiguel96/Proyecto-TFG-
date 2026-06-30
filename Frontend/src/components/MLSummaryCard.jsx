
export default function MLSummaryCard({ predData }) {
    if (!predData) return null
    return (
        <div className="ml-summary">
            <div className="ml-summary-item">
                <div className="ml-summary-value ml-summary-value--blue">
                    {(predData.reduce((s, p) => s + p.watts_cliente, 0) / predData.length).toFixed(0)}W
                </div>
                <div className="ml-summary-label">Vatios medios cliente</div>
            </div>
            <div className="ml-summary-item">
                <div className="ml-summary-value ml-summary-value--red">
                    {(predData.reduce((s, p) => s + p.watts_optimo, 0) / predData.length).toFixed(0)}W
                </div>
                <div className="ml-summary-label">Vatios óptimos (modelo)</div>
            </div>
            <div className="ml-summary-item">
                <div className="ml-summary-value ml-summary-value--amber">
                    {((predData.reduce((s, p) => s + p.watts_optimo - p.watts_cliente, 0) / predData.length) / (predData.reduce((s, p) => s + p.watts_cliente, 0) / predData.length) * 100).toFixed(1)}%
                </div>
                <div className="ml-summary-label">Mejora potencial</div>
            </div>
        </div>
    )
}