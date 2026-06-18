import { useState } from 'react'

export default function ActivitySelector({ activities, selectedActivity, onSelect }) {
    const [open, setOpen] = useState(false)

    return (
        <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
            <button
                onClick={() => setOpen(o => !o)}
                style={{
                    width: '100%', padding: '12px 16px',
                    background: 'white', border: '2px solid #e5e7eb',
                    borderRadius: '12px', cursor: 'pointer',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    fontSize: '14px', fontWeight: 600, color: '#111827',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span>🚴</span>
                    <span>{selectedActivity ? selectedActivity.name : 'Selecciona una actividad'}</span>
                    {selectedActivity && (
                        <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 400 }}>
                            · {(selectedActivity.distance / 1000).toFixed(1)} km
                        </span>
                    )}
                </div>
                <span style={{ color: '#9ca3af', fontSize: '12px' }}>{open ? '▲' : '▼'}</span>
            </button>

            {open && (
                <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
                    background: 'white', border: '2px solid #e5e7eb', borderRadius: '12px',
                    marginTop: '4px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    maxHeight: '300px', overflowY: 'auto'
                }}>
                    {activities.map(a => (
                        <button
                            key={a._id}
                            onClick={() => { onSelect(a); setOpen(false) }}
                            style={{
                                width: '100%', padding: '10px 16px',
                                background: selectedActivity?._id === a._id ? '#fff7ed' : 'white',
                                border: 'none', borderBottom: '1px solid #f3f4f6',
                                cursor: 'pointer', textAlign: 'left',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                fontSize: '13px', color: '#374151'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span>{selectedActivity?._id === a._id ? '🟠' : '⚪'}</span>
                                <span style={{ fontWeight: selectedActivity?._id === a._id ? 700 : 400 }}>
                                    {a.name}
                                </span>
                            </div>
                            <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                                {(a.distance / 1000).toFixed(1)} km
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}