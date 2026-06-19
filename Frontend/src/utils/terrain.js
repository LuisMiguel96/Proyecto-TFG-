export const SLOPE_CLIMB = 0.5
export const SLOPE_FLAT_MAX = -0.5
export const MIN_SEGMENT_KM = 1.0

export const THEME = {
    subida: { bg: '#fff1f1', border: '#f87171', accent: '#ef4444', text: '#b91c1c', emoji: '⬆️' },
    llano: { bg: '#eff6ff', border: '#60a5fa', accent: '#3b82f6', text: '#1d4ed8', emoji: '➡️' },
    bajada: { bg: '#f0fdf4', border: '#4ade80', accent: '#22c55e', text: '#15803d', emoji: '⬇️' },
}

export const TERRAIN_TYPES = ['subida', 'llano', 'bajada']

export function calcSlope(altDiff, distDiff) {
    if (distDiff <= 0) return 0
    return (altDiff / distDiff) * 100
}

export function classifySlope(slope) {
    if (slope > SLOPE_CLIMB) return 'subida'
    if (slope < SLOPE_FLAT_MAX) return 'bajada'
    return 'llano'
}

function calcGlobal(segs) {
    const all = segs.flatMap(s => s.points)
    if (all.length === 0) return { avgWatts: '0', avgSpeed: '0', count: 0 }
    return {
        avgWatts: (all.reduce((s, p) => s + p.watts, 0) / all.length).toFixed(0),
        avgSpeed: (all.reduce((s, p) => s + p.velocity, 0) / all.length).toFixed(1),
        count: segs.length
    }
}

export function processStreamData(streamData) {
    const altitude = streamData.altitude?.data || []
    const watts = streamData.watts?.data || []
    const velocity = streamData.velocity_smooth?.data || []
    const distance = streamData.distance?.data || []
    if (altitude.length === 0) return null

    const allPoints = altitude.map((alt, i) => {
        const lookback = Math.max(0, i - 50)
        const distDiff = distance[i] - distance[lookback]
        const altDiff = alt - altitude[lookback]
        return {
            dist: distance[i] / 1000,
            altitude: alt,
            watts: watts[i] || 0,
            velocity: velocity[i] ? velocity[i] * 3.6 : 0,
            slope: calcSlope(altDiff, distDiff),
            segundo: i
        }
    })

    const result = { subida: [], llano: [], bajada: [] }
    let currentType = null
    let currentSeg = []
    let slopeAcc = 0

    allPoints.forEach((pt) => {
        const type = classifySlope(pt.slope)
        if (type !== currentType) {
            const segDistKm = currentSeg.length > 0 ? currentSeg[currentSeg.length - 1].dist - currentSeg[0].dist : 0
            if (segDistKm >= MIN_SEGMENT_KM && currentType) {
                result[currentType].push({
                    points: currentSeg,
                    avgSlope: slopeAcc / currentSeg.length,
                    startSeg: currentSeg[0].segundo,
                    endSeg: currentSeg[currentSeg.length - 1].segundo
                })
            }
            currentType = type
            currentSeg = [pt]
            slopeAcc = pt.slope
        } else {
            currentSeg.push(pt)
            slopeAcc += pt.slope
        }
    })

    const segDistKm = currentSeg.length > 0 ? currentSeg[currentSeg.length - 1].dist - currentSeg[0].dist : 0
    if (segDistKm >= MIN_SEGMENT_KM && currentType) {
        result[currentType].push({
            points: currentSeg,
            avgSlope: slopeAcc / currentSeg.length,
            startSeg: currentSeg[0].segundo,
            endSeg: currentSeg[currentSeg.length - 1].segundo
        })
    }

    return {
        subida: { segments: result.subida, ...calcGlobal(result.subida) },
        llano: { segments: result.llano, ...calcGlobal(result.llano) },
        bajada: { segments: result.bajada, ...calcGlobal(result.bajada) },
    }
}
