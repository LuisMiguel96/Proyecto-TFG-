import { useRef, useImperativeHandle, forwardRef } from 'react'

const SpeedGauge = forwardRef(function SpeedGauge({ maxSpeed }, ref) {
    const textRef = useRef(null)
    const arcRef = useRef(null)
    const maxKmh = maxSpeed * 3.6 || 50

    useImperativeHandle(ref, () => ({
        update(speed) {
            if (textRef.current) {
                textRef.current.textContent = speed.toFixed(1)
            }
            if (arcRef.current) {
                const ratio = Math.min(speed / maxKmh, 1)
                arcRef.current.setAttribute('stroke-dasharray', `${ratio * 251.2} 251.2`)
                const color = ratio < 0.5 ? '#2ecc71' : ratio < 0.75 ? '#f39c12' : '#e74c3c'
                arcRef.current.setAttribute('stroke', color)
            }
        }
    }))

    return (
        <div className="speedometer-wrapper">
            <h4>⚡ Velocidad</h4>
            <div className="speed-display">
                <span ref={textRef} className="speed-value-large"
                    style={{ color: '#fc5200', fontSize: '2.5rem', fontWeight: 'bold' }}>
                    0.0
                </span>
                <span className="speed-unit-large">km/h</span>
            </div>
            <svg viewBox="0 0 200 120" width="200" height="120">
                <path d="M 20 100 A 80 80 0 0 1 180 100"
                    fill="none" stroke="#e0e0e0" strokeWidth="20" strokeLinecap="round" />
                <path ref={arcRef}
                    d="M 20 100 A 80 80 0 0 1 180 100"
                    fill="none" stroke="#2ecc71" strokeWidth="20" strokeLinecap="round"
                    strokeDasharray="0 251.2" />
            </svg>
        </div>
    )
})

export default SpeedGauge
