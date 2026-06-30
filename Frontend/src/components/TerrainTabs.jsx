import { THEME, TERRAIN_TYPES } from '../utils/terrain'
const TERRAIN_SVG = {
    subida: (
        <svg width="80" height="40" viewBox="0 0 80 40" fill="none">
            {/* Montañas fondo */}
            <polygon points="0,38 20,18 40,38" fill="#FC5200" fillOpacity="0.06" />
            <polygon points="30,38 55,10 80,38" fill="#FC5200" fillOpacity="0.06" />
            {/* Montañas medio */}
            <polygon points="10,38 30,20 50,38" fill="#FC5200" fillOpacity="0.1" />
            <polygon points="40,38 62,8 80,38" fill="#FC5200" fillOpacity="0.1" />
            {/* Montaña principal */}
            <polygon points="15,38 42,4 68,38" fill="#FC5200" fillOpacity="0.15" />
            <polyline points="15,38 42,4 68,38" stroke="#FC5200" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            {/* Nieve */}
            <polygon points="38,8 42,4 46,8" fill="#FC5200" fillOpacity="0.5" />
            {/* Suelo */}
            <line x1="0" y1="38" x2="80" y2="38" stroke="#FC5200" strokeWidth="1" strokeOpacity="0.2" />
        </svg>
    ),
    llano: (
        <svg width="80" height="40" viewBox="0 0 80 40" fill="none">
            {/* Colinas fondo muy suaves */}
            <path d="M0,28 Q20,22 40,26 Q60,22 80,26 L80,38 L0,38 Z" fill="#3b82f6" fillOpacity="0.06" />
            {/* Colinas medio */}
            <path d="M0,30 Q15,24 30,28 Q45,24 60,28 Q70,24 80,27" stroke="#3b82f6" strokeWidth="1.5" strokeOpacity="0.3" fill="none" />
            {/* Llanura principal */}
            <path d="M0,32 Q20,28 40,30 Q60,28 80,30" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            {/* Relleno llanura */}
            <path d="M0,32 Q20,28 40,30 Q60,28 80,30 L80,38 L0,38 Z" fill="#3b82f6" fillOpacity="0.1" />
            {/* Suelo */}
            <line x1="0" y1="38" x2="80" y2="38" stroke="#3b82f6" strokeWidth="1" strokeOpacity="0.2" />
        </svg>
    ),
    bajada: (
        <svg width="80" height="40" viewBox="0 0 80 40" fill="none">
            {/* Montañas fondo valle */}
            <polygon points="0,6 18,22 36,6" fill="#22c55e" fillOpacity="0.06" />
            <polygon points="44,6 62,22 80,6" fill="#22c55e" fillOpacity="0.06" />
            {/* Laderas medio */}
            <polygon points="0,8 22,26 44,8" fill="#22c55e" fillOpacity="0.1" />
            <polygon points="36,8 58,26 80,8" fill="#22c55e" fillOpacity="0.1" />
            {/* Valle principal */}
            <polyline points="0,6 38,34 80,6" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <polygon points="0,6 38,34 80,6 80,38 0,38" fill="#22c55e" fillOpacity="0.12" />
            {/* Río fondo valle */}
            <path d="M28,34 Q38,38 48,34" stroke="#22c55e" strokeWidth="1.5" strokeOpacity="0.4" fill="none" />
            {/* Suelo */}
            <line x1="0" y1="38" x2="80" y2="38" stroke="#22c55e" strokeWidth="1" strokeOpacity="0.2" />
        </svg>
    ),
}

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
                        border: `2px solid ${active ? '#FC5200' : '#e5e7eb'}`,
                        background: active ? t.bg : 'white', cursor: 'pointer', transition: 'all 0.15s',
                        textAlign: 'center'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4px' }}>
                            {TERRAIN_SVG[type]}
                        </div>
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