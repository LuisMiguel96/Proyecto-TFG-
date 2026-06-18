export default function ModelSelector({ modeloSeleccionado, onSelect }) {
    const modelos = [
        { id: 'rnn', label: 'RNN', desc: 'Peor caso', color: '#ef4444', emoji: '🔴' },
        { id: 'lstm', label: 'LSTM', desc: 'Caso óptimo', color: '#f59e0b', emoji: '🟡' },
        { id: 'bilstm', label: 'BiLSTM', desc: 'Mejor caso', color: '#22c55e', emoji: '🟢' },
    ]

    return (
        <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem' }}>
            {modelos.map(m => (
                <button
                    key={m.id}
                    onClick={() => onSelect(m.id)}
                    style={{
                        flex: 1, padding: '10px',
                        background: modeloSeleccionado === m.id ? m.color : '#f3f4f6',
                        color: modeloSeleccionado === m.id ? 'white' : '#374151',
                        border: 'none', borderRadius: '12px', cursor: 'pointer',
                        fontWeight: modeloSeleccionado === m.id ? 700 : 400,
                        fontSize: '13px', textAlign: 'center'
                    }}
                >
                    {m.emoji} {m.label}<br />
                    <span style={{ fontSize: '11px', opacity: 0.8 }}>{m.desc}</span>
                </button>
            ))}
        </div>
    )
}