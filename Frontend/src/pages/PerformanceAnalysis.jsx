import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { THEME, processStreamData } from '../utils/terrain'
import MLSummaryCard from '../components/MLSummaryCard'
import TerrainTabs from '../components/TerrainTabs'
import SegmentCarousel from '../components/SegmentCarousel'
import SegmentCard from '../components/SegmentCard'
import ZoomModal from '../components/ZoomModal'
import ModelSelector from '../components/ModelSelector'
import ModelComparisonModal from '../components/ModelComparisonModal'
import AIAnalysis from '../components/IAAnalysis'
import '../styles/PerformanceAnalysis.css'

function PerformanceAnalysis() {
    const { user } = useAuth()
    const location = useLocation()
    const navigate = useNavigate()
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
    const [streamData, setStreamData] = useState(null)
    const [showComparacion, setShowComparacion] = useState(false)
    const [predDataAll, setPredDataAll] = useState(null)

    useEffect(() => {
        if (user?.id) fetchActivities()
    }, [user])

    const fetchActivities = async () => {
        try {
            const analyzedRes = await axios.get(`http://localhost:3000/api/analyzed/${user.id}`)
            const analyzed = analyzedRes.data
            if (analyzed.length === 0) { navigate('/analyzed'); return }

            const actividadesPromises = analyzed.map(a =>
                axios.get(`http://localhost:3000/api/activities/detail/${a.activityId}`)
                    .then(r => r.data).catch(() => null)
            )
            const actividades = (await Promise.all(actividadesPromises)).filter(Boolean)
            setActivities(actividades)

            const params = new URLSearchParams(location.search)
            const activityId = params.get('activityId')
            const actividadInicial = activityId
                ? actividades.find(a => a._id === activityId) || actividades[0]
                : actividades[0]

            if (actividadInicial) analyzeActivity(actividadInicial)
        } catch (err) {
            console.error(err)
            navigate('/analyzed')
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
            setStreamData(res.data)
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
            const payload = { altitude, velocity, watts, distance, cadence }

            const [rnnRes, lstmRes, bilstmRes] = await Promise.all([
                axios.post('http://localhost:8000/prediccion/analizar', { ...payload, modelo: 'rnn' }),
                axios.post('http://localhost:8000/prediccion/analizar', { ...payload, modelo: 'lstm' }),
                axios.post('http://localhost:8000/prediccion/analizar', { ...payload, modelo: 'bilstm' })
            ])

            setPredData(modelo === 'rnn' ? rnnRes.data.serie : modelo === 'lstm' ? lstmRes.data.serie : bilstmRes.data.serie)
            setPredDataAll({
                rnn: rnnRes.data.serie,
                lstm: lstmRes.data.serie,
                bilstm: bilstmRes.data.serie
            })
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

    const zoomedIndex = zoomedSegment ? activeSegments.indexOf(zoomedSegment) : -1
    const showZoomModal = zoomedIndex !== -1

    return (
        <div className="pa-page">
            <h1 className="pa-title">🎯 Análisis de Rendimiento</h1>
            <p className="pa-subtitle">
                Segmentación por terreno · Subida &gt;2.5% · Llano 0–2.5% · Bajada &lt;0% · Mínimo 4km por tramo
            </p>

            {activities.length > 0 && (
                <div className="pa-select-wrap">
                    <select
                        className="pa-select"
                        onChange={(e) => {
                            const activity = activities.find(a => a._id === e.target.value)
                            if (activity) analyzeActivity(activity)
                        }}
                        value={selectedActivity?._id || ''}
                    >
                        {activities.map(a => (
                            <option key={a._id} value={a._id}>
                                🚴 {a.name} — {(a.distance / 1000).toFixed(1)} km
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <ModelSelector
                modeloSeleccionado={modeloSeleccionado}
                onSelect={(modelo) => {
                    setModeloSeleccionado(modelo)
                    if (selectedActivity) analyzeActivity(selectedActivity)
                }}
            />

            {selectedActivity && streamData && (
                <button className="pa-btn-compare" onClick={() => setShowComparacion(true)}>
                    🔄 Comparar 3 modelos
                </button>
            )}

            {loading && (
                <div className="pa-loading">
                    <div className="pa-loading-icon">⏳</div>
                    <p>Analizando ruta...</p>
                </div>
            )}

            {loadingML && !loading && (
                <div className="pa-loading-ml">
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
                        <div className="pa-empty">
                            No hay tramos de {activeType}  en esta actividad
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

            {showComparacion && (
                <ModelComparisonModal
                    segment={activeSegments[currentIndex]}
                    predDataAll={predDataAll}
                    onClose={() => setShowComparacion(false)}
                />
            )}

            {predDataAll && analysisData && (
                <AIAnalysis
                    predDataAll={predDataAll}
                    analysisData={analysisData}
                    selectedActivity={selectedActivity}
                />
            )}
        </div>
    )
}

export default PerformanceAnalysis