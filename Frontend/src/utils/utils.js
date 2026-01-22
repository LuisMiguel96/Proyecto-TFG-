// ========== FORMATEO DE DATOS ==========

/**
 * Formatea la distancia de metros a kilómetros
 * @param {number} meters - Distancia en metros
 * @returns {string} Distancia formateada en km
 */
export const formatDistance = (meters) => {
    return (meters / 1000).toFixed(2);
};

/**
 * Formatea el tiempo de segundos a formato HH:MM:SS
 * @param {number} seconds - Tiempo en segundos
 * @returns {string} Tiempo formateado
 */
export const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Formatea la fecha a formato legible
 * @param {string} dateString - Fecha en formato ISO
 * @returns {string} Fecha formateada
 */
export const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

/**
 * Formatea la velocidad de m/s a km/h
 * @param {number} metersPerSecond - Velocidad en m/s
 * @returns {string} Velocidad formateada en km/h
 */
export const formatSpeed = (metersPerSecond) => {
    return (metersPerSecond * 3.6).toFixed(2);
};

/**
 * Calcula el pace (min/km) a partir de la velocidad en m/s
 * @param {number} metersPerSecond - Velocidad en m/s
 * @returns {string} Pace en formato min/km
 */
export const calculatePace = (metersPerSecond) => {
    if (metersPerSecond === 0) return '--:--';
    
    const paceInSeconds = 1000 / metersPerSecond;
    const minutes = Math.floor(paceInSeconds / 60);
    const seconds = Math.floor(paceInSeconds % 60);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

// ========== VALIDACIONES ==========

/**
 * Valida si un ID de MongoDB es válido
 * @param {string} id - ID a validar
 * @returns {boolean}
 */
export const isValidMongoId = (id) => {
    return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Valida si un email es válido
 * @param {string} email - Email a validar
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// ========== UTILIDADES PARA ACTIVIDADES ==========

/**
 * Obtiene el icono según el tipo de actividad
 * @param {string} type - Tipo de actividad
 * @returns {string} Emoji del icono
 */
export const getActivityIcon = (type) => {
    const icons = {
        'Run': '🏃',
        'Ride': '🚴',
        'Swim': '🏊',
        'Walk': '🚶',
        'Hike': '🥾',
        'AlpineSki': '⛷️',
        'BackcountrySki': '🎿',
        'Canoeing': '🛶',
        'Crossfit': '🏋️',
        'EBikeRide': '🚴',
        'Elliptical': '🏃',
        'IceSkate': '⛸️',
        'InlineSkate': '⛸️',
        'Kayaking': '🛶',
        'Kitesurf': '🪁',
        'NordicSki': '⛷️',
        'RockClimbing': '🧗',
        'RollerSki': '⛷️',
        'Rowing': '🚣',
        'Snowboard': '🏂',
        'Snowshoe': '👟',
        'StairStepper': '🏃',
        'StandUpPaddling': '🏄',
        'Surfing': '🏄',
        'VirtualRide': '🚴',
        'VirtualRun': '🏃',
        'WeightTraining': '🏋️',
        'Windsurf': '🏄',
        'Workout': '💪',
        'Yoga': '🧘'
    };
    
    return icons[type] || '🏃';
};

/**
 * Traduce el tipo de actividad al español
 * @param {string} type - Tipo de actividad en inglés
 * @returns {string} Tipo en español
 */
export const translateActivityType = (type) => {
    const translations = {
        'Run': 'Carrera',
        'Ride': 'Bicicleta',
        'Swim': 'Natación',
        'Walk': 'Caminata',
        'Hike': 'Senderismo',
        'AlpineSki': 'Esquí Alpino',
        'BackcountrySki': 'Esquí de Montaña',
        'Canoeing': 'Piragüismo',
        'Crossfit': 'Crossfit',
        'EBikeRide': 'Bici Eléctrica',
        'Elliptical': 'Elíptica',
        'IceSkate': 'Patinaje Hielo',
        'InlineSkate': 'Patinaje',
        'Kayaking': 'Kayak',
        'Kitesurf': 'Kitesurf',
        'NordicSki': 'Esquí Nórdico',
        'RockClimbing': 'Escalada',
        'RollerSki': 'Esquí de Ruedas',
        'Rowing': 'Remo',
        'Snowboard': 'Snowboard',
        'Snowshoe': 'Raquetas',
        'StairStepper': 'Escaladora',
        'StandUpPaddling': 'Paddle Surf',
        'Surfing': 'Surf',
        'VirtualRide': 'Bici Virtual',
        'VirtualRun': 'Carrera Virtual',
        'WeightTraining': 'Pesas',
        'Windsurf': 'Windsurf',
        'Workout': 'Entrenamiento',
        'Yoga': 'Yoga'
    };
    
    return translations[type] || type;
};

// ========== UTILIDADES PARA MAPAS ==========

/**
 * Decodifica un polyline de Strava a coordenadas lat/lng
 * @param {string} encoded - Polyline codificado
 * @returns {Array} Array de coordenadas [lat, lng]
 */
export const decodePolyline = (encoded) => {
    // Esta función decodifica el formato polyline de Google/Strava
    const points = [];
    let index = 0;
    const len = encoded.length;
    let lat = 0;
    let lng = 0;

    while (index < len) {
        let b;
        let shift = 0;
        let result = 0;
        
        do {
            b = encoded.charAt(index++).charCodeAt(0) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        
        const dlat = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
        lat += dlat;

        shift = 0;
        result = 0;
        
        do {
            b = encoded.charAt(index++).charCodeAt(0) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        
        const dlng = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
        lng += dlng;

        points.push([lat / 1e5, lng / 1e5]);
    }

    return points;
};

/**
 * Calcula el centro de un conjunto de coordenadas
 * @param {Array} coordinates - Array de coordenadas [[lat, lng], ...]
 * @returns {Array} Coordenada central [lat, lng]
 */
export const getMapCenter = (coordinates) => {
    if (!coordinates || coordinates.length === 0) {
        return [40.4168, -3.7038]; // Madrid por defecto
    }
    
    const sumLat = coordinates.reduce((sum, coord) => sum + coord[0], 0);
    const sumLng = coordinates.reduce((sum, coord) => sum + coord[1], 0);
    
    return [sumLat / coordinates.length, sumLng / coordinates.length];
};
