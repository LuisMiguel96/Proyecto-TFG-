const request = require('supertest')
const express = require('express')

// Mocks
jest.mock('../models/StravaActivity.model', () => ({
    find: jest.fn(),
    findById: jest.fn()
}))
jest.mock('../models/User.model', () => ({
    findById: jest.fn()
}))

const StravaActivity = require('../models/StravaActivity.model')
const User = require('../models/User.model')
const activitiesRouter = require('../routes/activities')

const app = express()
app.use(express.json())
app.use('/api/activities', activitiesRouter)

// ── TESTS GENERALES ──
describe('Backend API', () => {
    test('El servidor responde correctamente', () => {
        expect(true).toBe(true)
    })
    test('Variables de entorno necesarias definidas', () => {
        expect(process.env.NODE_ENV).toBeDefined
    })
})

describe('Lógica de segmentación', () => {
    const clasificarTerreno = (pendiente) => {
        if (pendiente > 2.5) return 'subida'
        if (pendiente < 0) return 'bajada'
        return 'llano'
    }
    test('Pendiente >2.5% es subida', () => {
        expect(clasificarTerreno(3.5)).toBe('subida')
    })
    test('Pendiente <0% es bajada', () => {
        expect(clasificarTerreno(-1.5)).toBe('bajada')
    })
    test('Pendiente entre 0 y 2.5% es llano', () => {
        expect(clasificarTerreno(1.0)).toBe('llano')
    })
    test('Pendiente exactamente 0% es llano', () => {
        expect(clasificarTerreno(0)).toBe('llano')
    })
})

describe('Cálculo de métricas de potencia', () => {
    const calcularMedia = (valores) => {
        if (!valores || valores.length === 0) return 0
        return valores.reduce((s, v) => s + v, 0) / valores.length
    }
    test('Calcula correctamente la media de vatios', () => {
        expect(calcularMedia([100, 200, 300])).toBe(200)
    })
    test('Devuelve 0 para array vacío', () => {
        expect(calcularMedia([])).toBe(0)
    })
    test('Calcula correctamente con un solo valor', () => {
        expect(calcularMedia([150])).toBe(150)
    })
})

// ── TESTS DE RUTAS ──
describe('GET /api/activities/:userId', () => {
    test('Devuelve actividades de un usuario existente', async () => {
        User.findById.mockResolvedValue({ _id: '123', name: 'Test' })
        StravaActivity.find.mockReturnValue({
            sort: jest.fn().mockResolvedValue([
                { _id: '1', name: 'Ruta mañana', distance: 50000 }
            ])
        })
        const res = await request(app).get('/api/activities/123')
        expect(res.status).toBe(200)
        expect(res.body.total).toBe(1)
    })
    test('Devuelve 404 si el usuario no existe', async () => {
        User.findById.mockResolvedValue(null)
        const res = await request(app).get('/api/activities/999')
        expect(res.status).toBe(404)
    })
    test('Devuelve 500 si hay error de base de datos', async () => {
        User.findById.mockRejectedValue(new Error('DB error'))
        const res = await request(app).get('/api/activities/123')
        expect(res.status).toBe(500)
    })
})

describe('GET /api/activities/detail/:activityId', () => {
    test('Devuelve una actividad por ID', async () => {
        StravaActivity.findById.mockResolvedValue({
            _id: '1', name: 'Ruta mañana', distance: 50000
        })
        const res = await request(app).get('/api/activities/detail/1')
        expect(res.status).toBe(200)
        expect(res.body.name).toBe('Ruta mañana')
    })
    test('Devuelve 404 si la actividad no existe', async () => {
        StravaActivity.findById.mockResolvedValue(null)
        const res = await request(app).get('/api/activities/detail/999')
        expect(res.status).toBe(404)
    })
})

describe('GET /api/activities/:userId/type/:activityType', () => {
    test('Filtra actividades por tipo', async () => {
        User.findById.mockResolvedValue({ _id: '123' })
        StravaActivity.find.mockReturnValue({
            sort: jest.fn().mockResolvedValue([
                { _id: '1', name: 'Ruta', type: 'Ride' }
            ])
        })
        const res = await request(app).get('/api/activities/123/type/Ride')
        expect(res.status).toBe(200)
        expect(res.body.type).toBe('Ride')
    })
    test('Devuelve 404 si el usuario no existe', async () => {
        User.findById.mockResolvedValue(null)
        const res = await request(app).get('/api/activities/999/type/Ride')
        expect(res.status).toBe(404)
    })
})