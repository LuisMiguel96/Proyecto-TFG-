import SegmentCard from './SegmentCard'

export default function ZoomModal({ segment, index, total, theme, predData, onClose,terrainType }) {
    if (!segment) return null
    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.8)', zIndex: 9999,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '20px'
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: 'white', borderRadius: '20px', padding: '28px',
                    width: '95%', maxWidth: '1100px', maxHeight: '95vh',
                    overflowY: 'auto', position: 'relative'
                }}
            >
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute', top: '16px', right: '16px',
                        background: '#f3f4f6', border: 'none', borderRadius: '50%',
                        width: '36px', height: '36px', cursor: 'pointer',
                        fontSize: '18px'
                    }}
                >✕</button>
                <SegmentCard
                    segment={segment}
                    index={index}
                    total={total}
                    theme={theme}
                    expanded={true}
                    onClick={() => { }}
                    predData={predData}
                    onZoom={() => { }}
                    terrainType={terrainType}
                />
            </div>
        </div>
    )
}
