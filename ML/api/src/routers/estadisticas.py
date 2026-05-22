from fastapi import APIRouter
from src.services import estadisticas_service

router = APIRouter()

@router.get("/globales")
def get_globales():
    """Estadísticas globales de todas las actividades"""
    return estadisticas_service.get_globales()

@router.get("/zonas")
def get_zonas():
    """Distribución de tiempo en zonas de FC y potencia"""
    return estadisticas_service.get_zonas()