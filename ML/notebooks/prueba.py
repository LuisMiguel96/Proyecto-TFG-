import requests
import json

# 1. Obtener streams reales del cliente desde el Backend
streams_response = requests.get(
    "http://localhost:3000/api/strava/streams/6a2341782959bf3d92312f5a/18801669294"
)
streams = streams_response.json()

# 2. Preparar datos para la API 2
payload = {
    "altitude": streams["altitude"]["data"][:500],    # primeros 500 segundos
    "velocity": streams["velocity_smooth"]["data"][:500],
    "watts": streams["watts"]["data"][:500],
    "distance": streams["distance"]["data"][:500]
}

# 3. Enviar a la API 2
pred_response = requests.post(
    "http://localhost:8000/prediccion/analizar",
    json=payload
)

resultado = pred_response.json()
print(json.dumps(resultado, indent=2))