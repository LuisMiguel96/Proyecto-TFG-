from src.data.dataset import df
import pandas as pd

def get_todas():
    """Lista de todas las actividades con métricas resumen"""
    actividades = df.groupby('archivo').agg(
        fecha_inicio=('timestamp', 'min'),
        distancia_km=('distance', 'max'),
        fc_media=('heart_rate', 'mean'),
        potencia_media=('power', 'mean'),
        velocidad_media=('speed', 'mean'),
        w_por_kg_media=('w_por_kg', 'mean'),
        eficiencia_media=('eficiencia', 'mean')
    ).reset_index()

    actividades['fecha_inicio'] = actividades['fecha_inicio'].astype(str)
    actividades['distancia_km'] = (actividades['distancia_km'] / 1000).round(2)
    actividades = actividades.round(2)

    return actividades.to_dict(orient='records')


def get_resumen(archivo: str):
    """Resumen detallado de una actividad concreta"""
    df_act = df[df['archivo'] == archivo]
    if df_act.empty:
        return None

    return {
        "archivo": archivo,
        "fecha_inicio": str(df_act['timestamp'].min()),
        "duracion_s": int(df_act['tiempo_s'].max()),
        "distancia_km": round(float(df_act['distance'].max()) / 1000, 2),
        "fc_media": round(float(df_act['heart_rate'].mean()), 1),
        "fc_max": int(df_act['heart_rate'].max()),
        "potencia_media": round(float(df_act['power'].mean()), 1),
        "potencia_max": int(df_act['power'].max()),
        "velocidad_media_kmh": round(float(df_act['speed'].mean()) * 3.6, 2),
        "w_por_kg_media": round(float(df_act['w_por_kg'].mean()), 2),
        "eficiencia_media": round(float(df_act['eficiencia'].mean()), 3),
        "zona_fc_predominante": int(df_act['zona_fc'].mode()[0]),
        "zona_potencia_predominante": int(df_act['zona_potencia'].mode()[0]),
        "fatiga_final": round(float(df_act['fatiga'].iloc[-1]), 3)
    }


def get_serie(archivo: str):
    """Serie temporal de una actividad para gráficos"""
    df_act = df[df['archivo'] == archivo].copy()
    if df_act.empty:
        return None

    step = max(1, len(df_act) // 500)
    df_reducido = df_act.iloc[::step]

    cols = ['timestamp', 'tiempo_s', 'heart_rate', 'power',
            'speed', 'altitude', 'cadence', 'zona_fc',
            'zona_potencia', 'w_por_kg', 'eficiencia', 'fatiga']

    cols_presentes = [c for c in cols if c in df_reducido.columns]
    df_reducido = df_reducido[cols_presentes].copy()
    df_reducido['timestamp'] = df_reducido['timestamp'].astype(str)
    df_reducido = df_reducido.round(2)

    return df_reducido.to_dict(orient='records')