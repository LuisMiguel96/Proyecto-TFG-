from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.routers import actividades, estadisticas,prediccion


app= FastAPI(title= "API ML Rendimiento Deportivo")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(actividades.router, prefix="/actividades", tags=["Actividades"])
app.include_router(estadisticas.router, prefix="/estadisticas", tags=["Estadísticas"])
app.include_router(prediccion.router, prefix="/prediccion", tags=["Predicción"])
@app.get("/")
def root():
    return {
        "status": "ok",
        "mensaje": "API ML Rendimiento Deportivo"
    }