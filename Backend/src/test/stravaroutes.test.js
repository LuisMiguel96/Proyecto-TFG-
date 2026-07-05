const request = require('supertest')
const express = require('express')

// Mocks
jest.mock('axios')
jest.mock('../models/User.model', () => ({
    findById: jest.fn(),
    findOneAndUpdate: jest.fn()
}))
jest.mock('../models/StravaActivity.model', () => ({
    findOneAndUpdate: jest.fn()
}))

const axios = require('axios')
const User = require('../models/User.model')
const StravaActivity = require('../models/StravaActivity.model')
const stravaRouter = require('../routes/stravaroutes')

const app = express()
app.use(express.json())
app.use('/api/strava', stravaRouter)

describe('GET /api/strava/config', () => {

    test('Devuelve la configuración pública de Strava', async () => {
        process.env.STRAVA_CLIENT_ID = '12345'
        process.env.STRAVA_REDIRECT_URI = 'http://localhost:3000/callback'

        const res = await request(app).get('/api/strava/config')
        expect(res.status).toBe(200)
        expect(res.body.clientId).toBe('12345')
        expect(res.body.redirectUri).toBe('http://localhost:3000/callback')
    })

})

describe('GET /api/strava/callback', () => {

    test('Devuelve 400 si no hay código', async () => {
        const res = await request(app).get('/api/strava/callback')
        expect(res.status).toBe(400)
        expect(res.body.error).toBe('Código no recibido')
    })

    test('Conecta correctamente con Strava', async () => {
        axios.post.mockResolvedValue({
            data: {
                access_token: 'token123',
                refresh_token: 'refresh123',
                expires_at: 9999999,
                athlete: {
                    id: 1,
                    firstname: 'Luis',
                    lastname: 'Miguel',
                    profile: 'http://foto.jpg'
                }
            }
        })
        User.findOneAndUpdate.mockResolvedValue({
            _id: 'user1'
        })

        const res = await request(app).get('/api/strava/callback?code=abc123')
        expect(res.status).toBe(200)
        expect(res.body.message).toBe('Conectado con Strava')
    })

    test('Devuelve 500 si falla la conexión con Strava', async () => {
        axios.post.mockRejectedValue(new Error('Strava error'))

        const res = await request(app).get('/api/strava/callback?code=abc123')
        expect(res.status).toBe(500)
    })

})

describe('GET /api/strava/activities/:userId', () => {

    test('Devuelve 404 si el usuario no existe', async () => {
        User.findById.mockResolvedValue(null)

        const res = await request(app).get('/api/strava/activities/999')
        expect(res.status).toBe(404)
    })

    test('Sincroniza actividades correctamente', async () => {
        User.findById.mockResolvedValue({ _id: 'user1', accessToken: 'token123' })
        axios.get.mockResolvedValue({
            data: [
                { id: 1, name: 'Ruta mañana', type: 'Ride', distance: 50000 }
            ]
        })
        StravaActivity.findOneAndUpdate.mockResolvedValue({})

        const res = await request(app).get('/api/strava/activities/user1')
        expect(res.status).toBe(200)
        expect(res.body.message).toContain('actividades sincronizadas')
    })

    test('Devuelve 500 si falla la API de Strava', async () => {
        User.findById.mockResolvedValue({ _id: 'user1', accessToken: 'token123' })
        axios.get.mockRejectedValue(new Error('API error'))

        const res = await request(app).get('/api/strava/activities/user1')
        expect(res.status).toBe(500)
    })

})

describe('GET /api/strava/streams/:userId/:stravaId', () => {

    test('Devuelve 404 si el usuario no existe', async () => {
        User.findById.mockResolvedValue(null)

        const res = await request(app).get('/api/strava/streams/999/12345')
        expect(res.status).toBe(404)
    })

    test('Devuelve los streams correctamente', async () => {
        User.findById.mockResolvedValue({ _id: 'user1', accessToken: 'token123' })
        axios.get.mockResolvedValue({
            data: { altitude: { data: [100, 110, 120] }, watts: { data: [200, 210, 220] } }
        })

        const res = await request(app).get('/api/strava/streams/user1/12345')
        expect(res.status).toBe(200)
        expect(res.body.altitude).toBeDefined()
    })

    test('Devuelve 500 si falla la API de streams', async () => {
        User.findById.mockResolvedValue({ _id: 'user1', accessToken: 'token123' })
        axios.get.mockRejectedValue(new Error('Stream error'))

        const res = await request(app).get('/api/strava/streams/user1/12345')
        expect(res.status).toBe(500)
    })

})