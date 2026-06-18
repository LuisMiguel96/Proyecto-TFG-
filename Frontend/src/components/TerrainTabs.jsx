import { THEME, TERRAIN_TYPES } from '../utils/terrain'

export default function TerrainTabs({ activeType, analysisData, onTypeChange }) {
    return (
        <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem' }}>
            {TERRAIN_TYPES.map(type => {
                const t = THEME[type]
                const d = analysisData[type]
                const active = activeType === type
                return (
                    <button key={type} onClick={() => onTypeChange(type)} style={{
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
    )
}
