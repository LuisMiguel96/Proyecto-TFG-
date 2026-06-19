# 🚴 Sistema de Análisis de Rendimiento Ciclista

TFG - Universidad. Sistema web para el análisis de rendimiento ciclista mediante Machine Learning, integrando datos de Strava con modelos RNN, LSTM y BiLSTM.

## 📋 Requisitos previos

- Node.js >= 16.x
- Python >= 3.10
- MongoDB Atlas (cuenta gratuita)
- Cuenta de desarrollador en Strava

## 🏗️ Arquitectura

El sistema se compone de tres servicios:

- **Frontend** — React + Vite (puerto 5173)
- **Backend** — Node.js + Express (puerto 3000)
- **API ML** — FastAPI + Python (puerto 8000)

## ⚙️ Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/LuisMiguel96/Proyecto-TFG-.git
cd Proyecto-TFG-
```

### 2. Configurar variables de entorno

Crea un archivo `.env` en la carpeta `Backend/`:

```env
MONGODB_URI=tu_uri_de_mongodb
STRAVA_CLIENT_ID=tu_client_id
STRAVA_CLIENT_SECRET=tu_client_secret
STRAVA_REDIRECT_URI=http://localhost:3000/auth/callback
```

### 3. Instalar dependencias del Backend

```bash
cd Backend
npm install
```

### 4. Instalar dependencias del Frontend

```bash
cd Frontend
npm install
```

### 5. Instalar dependencias de la API ML

```bash
conda activate ciclismo
cd ML/api
pip install -r requirements.txt
```

## 🚀 Arranque

### Backend (puerto 3000)

```bash
cd Backend
npm start
```

### Frontend (puerto 5173)

```bash
cd Frontend
npm run dev
```

### API ML (puerto 8000)

```bash
conda activate ciclismo
cd ML/api
uvicorn main:app --reload --port 8000
```

## 🤖 Modelos de Machine Learning

Los modelos entrenados deben colocarse en `ML/api/src/models/`:

| Archivo | Descripción |
|---------|-------------|
| `model_rnn.keras` | Modelo RNN — umbral mínimo |
| `model_lstm.keras` | Modelo LSTM — nivel óptimo |
| `model_bilstm.keras` | Modelo BiLSTM — techo máximo |
| `scaler_X.pkl` | Scaler de features |
| `scaler_y.pkl` | Scaler de la variable objetivo |

## 📊 Dataset

El dataset de entrenamiento contiene 777.078 registros de 93 actividades ciclistas de ciclistas profesionales en activo, con 29 variables por registro.

## 🛠️ Tecnologías

| Capa | Tecnología |
|------|-----------|
| Frontend | React, Vite, Recharts, Leaflet |
| Backend | Node.js, Express, MongoDB |
| API ML | FastAPI, TensorFlow, Keras |
| Modelos | RNN, LSTM, BiLSTM |
| Autenticación | OAuth 2.0 (Strava) |

## 👤 Autor

Luis Miguel — TFG Universidad
