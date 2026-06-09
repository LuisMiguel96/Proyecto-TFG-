from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
import numpy as np
import pickle
import tensorflow as tf
import os

router = APIRouter()

# Cargar modelo y scalers al arrancar
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, 'models', 'model_rnn.keras')
SCALER_X_PATH = os.path.join(BASE_DIR, 'models', 'scaler_X.pkl')
SCALER_Y_PATH = os.path.join(BASE_DIR, 'models', 'scaler_y.pkl')

model = tf.keras.models.load_model(MODEL_PATH)
with open(SCALER_X_PATH, 'rb') as f:
    scaler_X = pickle.load(f)
with open(SCALER_Y_PATH, 'rb') as f:
    scaler_y = pickle.load(f)

class StreamData(BaseModel):
    altitude: List[float]
    velocity: List[float]
    watts: List[float]
    distance: List[float]

@router.post("/analizar")
def analizar_cliente(data: StreamData):
    try:
        # Calcular grade
        grade = [0]
        for i in range(1, len(data.altitude)):
            dist_diff = data.distance[i] - data.distance[i-1]
            alt_diff = data.altitude[i] - data.altitude[i-1]
            g = (alt_diff / dist_diff * 100) if dist_diff > 0 else 0
            g = max(-20, min(20, g))
            grade.append(g)

        # Crear features
        features = np.array([[
            v * 3.6,
            80.0,
            grade[i],
            data.altitude[i],
            140.0,
            data.watts[i] / 70,
            data.watts[i] / 140,
            1.4,
            140.0,
            80.0
        ] for i, v in enumerate(data.velocity)])

        # Normalizar
        X_scaled = scaler_X.transform(features)

        # Crear secuencias
        if len(X_scaled) < 60:
            raise HTTPException(status_code=400, detail="Necesitas al menos 60 segundos de datos")

        secuencias = np.array([X_scaled[i-60:i] for i in range(60, len(X_scaled))])

        # Predecir
        preds_scaled = model.predict(secuencias, batch_size=256, verbose=0)
        preds_watts = scaler_y.inverse_transform(preds_scaled).flatten()

        watts_cliente = np.array(data.watts[60:])
        diferencia = preds_watts - watts_cliente

        return {
            "watts_cliente_medio": round(float(watts_cliente.mean()), 1),
            "watts_optimo_medio": round(float(preds_watts.mean()), 1),
            "diferencia_media": round(float(diferencia.mean()), 1),
            "mejora_potencial_pct": round(float(diferencia.mean() / watts_cliente.mean() * 100), 1),
            "serie": [
                {
                    "segundo": int(i + 60),
                    "watts_cliente": round(float(watts_cliente[i]), 1),
                    "watts_optimo": round(float(preds_watts[i]), 1)
                }
                for i in range(0, len(preds_watts), 10)  # cada 10 segundos
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))