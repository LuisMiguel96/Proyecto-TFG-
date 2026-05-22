from fastapi import APIRouter, HTTPException
from src.services import actividades_service

router = APIRouter()

@router.get("/")
def get_actividades():
    """Lista de todas las actividades"""
    return actividades_service.get_todas()

@router.get("/{archivo}/resumen")
def get_resumen(archivo: str):
    """Resumen detallado de una actividad"""
    resultado = actividades_service.get_resumen(archivo)
    if resultado is None:
        raise HTTPException(status_code=404, detail="Actividad no encontrada")
    return resultado

@router.get("/{archivo}/serie")
def get_serie(archivo: str):
    """Serie temporal de una actividad para gráficos"""
    resultado = actividades_service.get_serie(archivo)
    if resultado is None:
        raise HTTPException(status_code=404, detail="Actividad no encontrada")
    return resultado