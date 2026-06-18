import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import { THEME, processStreamData } from '../utils/terrain'
import ActivitySelector from '../components/ActivitySelector'
import MLSummaryCard from '../components/MLSummaryCard'
import TerrainTabs from '../components/TerrainTabs'
import SegmentCarousel from '../components/SegmentCarousel'
import SegmentCard from '../components/SegmentCard'
import ZoomModal from '../components/ZoomModal'
import ModelSelector from '../components/ModelSelector'
function PerformanceAnalysis() {
    const { user } = useAuth()
    const [activities, setActivities] = useState([])
    const [selectedActivity, setSelectedActivity] = useState(null)
    const [analysisData, setAnalysisData] = useState(null)
    const [activeType, setActiveType] = useState('subida')
    const [currentIndex, setCurrentIndex] = useState(0)
    const [expandedIndex, setExpandedIndex] = useState(null)
    const [zoomedSegment, setZoomedSegment] = useState(null)
    const [loading, setLoading] = useState(false)
    const [predData, setPredData] = useState(null)
    const [loadingML, setLoadingML] = useState(false)
    const [modeloSeleccionado, setModeloSeleccionado] = useState('rnn')

    useEffect(() => {
        if (user?.id) fetchActivities()
    }, [user])

    const fetchActivities = async () => {
        try {
            const res = await axios.get(`http://localhost:3000/api/activities/${user.id}/type/Ride`)
            setActivities(res.data.activities)
        } catch (err) {
            console.error(err)
        }
    }

    const analyzeActivity = async (activity) => {
        setSelectedActivity(activity)
        setLoading(true)
        setAnalysisData(null)
        setPredData(null)
        setCurrentIndex(0)
        setExpandedIndex(null)

        try {
            const res = await axios.get(
                `http://localhost:3000/api/strava/streams/${user.id}/${activity.stravaId}`
            )
            const data = processStreamData(res.data)
            if (data) setAnalysisData(data)
            await fetchMLPrediction(res.data, modeloSeleccionado)
        } catch (err) {
            console.error('Error streams:', err)
        } finally {
            setLoading(false)
        }
    }

    const fetchMLPrediction = async (streamData, modelo = 'rnn') => {
        setLoadingML(true)
        try {
            const altitude = streamData.altitude?.data || []
            const velocity = streamData.velocity_smooth?.data || []
            const watts = streamData.watts?.data || []
            const distance = streamData.distance?.data || []
            const cadence = streamData.cadence?.data || []

            const res = await axios.post('http://localhost:8000/prediccion/analizar', {
                altitude, velocity, watts, distance, cadence, modelo
            })
            console.log('Serie ejemplo:', res.data.serie[0])
            setPredData(res.data.serie)
        } catch (err) {
            console.error('Error ML:', err)
        } finally {
            setLoadingML(false)
        }
    }

    const handleTypeChange = (type) => {
        setActiveType(type)
        setCurrentIndex(0)
        setExpandedIndex(null)
    }

    const activeSegments = analysisData?.[activeType]?.segments || []
    const theme = THEME[activeType]

    const handlePrev = useCallback(() => {
        setCurrentIndex(i => Math.max(0, i - 1))
        setExpandedIndex(null)
    }, [])

    const handleNext = useCallback(() => {
        setCurrentIndex(i => {
            const max = analysisData?.[activeType]?.segments?.length
            return max ? Math.min(max - 1, i + 1) : i
        })
        setExpandedIndex(null)
    }, [analysisData, activeType])

    const handleDotClick = useCallback((i) => {
        setCurrentIndex(i)
        setExpandedIndex(null)
    }, [])

    const handleCardClick = useCallback(() => {
        setExpandedIndex(prev => prev === currentIndex ? null : currentIndex)
    }, [currentIndex])

    const handleZoom = useCallback((seg) => {
        setZoomedSegment(seg)
    }, [])

    const handleCloseZoom = useCallback(() => {
        setZoomedSegment(null)
    }, [])

    const zoomedIndex = zoomedSegment ? activeSegments.indexOf(zoomedSegment) : -1
    const showZoomModal = zoomedIndex !== -1

    return (
        <div style={{ padding: '2rem', width: '100%', maxWidth: '1400px', margin: '0 auto', fontFamily: 'system-ui, sans-serif', boxSizing: 'border-box' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.25rem', color: '#111827' }}>
                🎯 Análisis de Rendimiento
            </h1>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem', fontSize: '14px' }}>
                Segmentación por terreno · Subida &gt;2.5% · Llano 0–2.5% · Bajada &lt;0% · Mínimo 4km por tramo
            </p>

            <ActivitySelector
                activities={activities}
                selectedActivity={selectedActivity}
                onSelect={analyzeActivity}
            />
            <ModelSelector
                modeloSeleccionado={modeloSeleccionado}
                onSelect={(modelo) => {
                    setModeloSeleccionado(modelo)
                    if (selectedActivity) analyzeActivity(selectedActivity)
                }}
            />

            {loading && (
                <div style={{ textAlign: 'center', padding: '4rem', color: '#6b7280' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⏳</div>
                    <p>Analizando ruta...</p>
                </div>
            )}
            {loadingML && !loading && (
                <div style={{ background: '#eff6ff', border: '1px solid #93c5fd', borderRadius: '12px', padding: '12px 16px', marginBottom: '1rem', fontSize: '13px', color: '#1d4ed8' }}>
                    🤖 Calculando potencia óptima con el modelo ML...
                </div>
            )}

            {analysisData && (
                <>
                    <MLSummaryCard predData={predData} />

                    <TerrainTabs
                        activeType={activeType}
                        analysisData={analysisData}
                        onTypeChange={handleTypeChange}
                    />

                    {activeSegments.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af', background: '#f9fafb', borderRadius: '16px' }}>
                            No hay tramos de {activeType} de más de 4km en esta actividad
                        </div>
                    ) : (
                        <>
                            <SegmentCarousel
                                segments={activeSegments}
                                currentIndex={currentIndex}
                                theme={theme}
                                onPrev={handlePrev}
                                onNext={handleNext}
                                onDotClick={handleDotClick}
                            />

                            {showZoomModal && (
                                <ZoomModal
                                    segment={zoomedSegment}
                                    index={zoomedIndex}
                                    total={activeSegments.length}
                                    theme={theme}
                                    predData={predData}
                                    onClose={() => setZoomedSegment(null)}
                                    terrainType={activeType}
                                />
                            )}

                            <SegmentCard
                                segment={activeSegments[currentIndex]}
                                index={currentIndex}
                                total={activeSegments.length}
                                theme={theme}
                                expanded={expandedIndex === currentIndex}
                                onClick={() => setExpandedIndex(prev => prev === currentIndex ? null : currentIndex)}
                                predData={predData}
                                onZoom={(seg) => setZoomedSegment(seg)}
                                terrainType={activeType}
                            />
                        </>
                    )}
                </>
            )}
        </div>
    )
}

export default PerformanceAnalysis
