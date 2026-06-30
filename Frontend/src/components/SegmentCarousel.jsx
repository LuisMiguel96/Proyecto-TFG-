export default function SegmentCarousel({ segments, currentIndex, theme, onPrev, onNext, onDotClick }) {
    return (
        <div className="seg-carousel">
            <button
                onClick={onPrev}
                disabled={currentIndex === 0}
                className="seg-carousel-btn"
                style={{
                    borderColor: currentIndex === 0 ? '#334155' : theme.accent,
                    color: currentIndex === 0 ? '#475569' : theme.accent,
                }}
            >←</button>

            <div className="seg-carousel-dots">
                {segments.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => onDotClick(i)}
                        className={`seg-carousel-dot ${i === currentIndex ? 'seg-carousel-dot--active' : 'seg-carousel-dot--inactive'}`}
                        style={{ background: i === currentIndex ? '#FC5200' : '#334155' }}
                    />
                ))}
            </div>

            <button
                onClick={onNext}
                disabled={currentIndex === segments.length - 1}
                className="seg-carousel-btn"
                style={{
                    borderColor: currentIndex === segments.length - 1 ? '#334155' : theme.accent,
                    color: currentIndex === segments.length - 1 ? '#475569' : theme.accent,
                }}
            >→</button>
        </div>
    )
}