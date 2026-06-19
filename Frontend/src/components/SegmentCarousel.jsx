export default function SegmentCarousel({ segments, currentIndex, theme, onPrev, onNext, onDotClick }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <button
                onClick={onPrev}
                disabled={currentIndex === 0}
                style={{
                    width: '40px', height: '40px', borderRadius: '50%',
                    border: `2px solid ${currentIndex === 0 ? '#e5e7eb' : theme.accent}`,
                    background: 'white', cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
                    fontSize: '18px', color: currentIndex === 0 ? '#d1d5db' : theme.accent,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
            >←</button>

            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '600px' }}>
                {segments.map((_, i) => (
                    <button key={i} onClick={() => onDotClick(i)} style={{
                        width: i === currentIndex ? '24px' : '8px',
                        height: '8px', borderRadius: '4px', border: 'none',
                        background: i === currentIndex ? theme.accent : '#d1d5db',
                        cursor: 'pointer', transition: 'all 0.2s', padding: 0
                    }} />
                ))}
            </div>

            <button
                onClick={onNext}
                disabled={currentIndex === segments.length - 1}
                style={{
                    width: '40px', height: '40px', borderRadius: '50%',
                    border: `2px solid ${currentIndex === segments.length - 1 ? '#e5e7eb' : theme.accent}`,
                    background: 'white', cursor: currentIndex === segments.length - 1 ? 'not-allowed' : 'pointer',
                    fontSize: '18px', color: currentIndex === segments.length - 1 ? '#d1d5db' : theme.accent,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
                >→</button>
        </div>
    )
}
