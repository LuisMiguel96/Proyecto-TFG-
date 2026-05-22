from src.data.dataset import df

def get_globales():
    """Estadísticas globales de todas las actividades"""
    return {
        "total_actividades": int(df['archivo'].nunique()),
        "total_registros": len(df),
        "distancia_total_km": round(
            float(df.groupby('archivo')['distance'].max().sum()) / 1000, 2
        ),
        "fc_media_global": round(float(df['heart_rate'].mean()), 1),
        "potencia_media_global": round(float(df['power'].mean()), 1),
        "w_por_kg_media_global": round(float(df['w_por_kg'].mean()), 2),
        "eficiencia_media_global": round(float(df['eficiencia'].mean()), 3),
        "zona_fc_mas_frecuente": int(df['zona_fc'].mode()[0]),
        "zona_potencia_mas_frecuente": int(df['zona_potencia'].mode()[0])
    }

def get_zonas():
    """Distribución de tiempo en zonas de FC y potencia"""
    zonas_fc = df['zona_fc'].value_counts().sort_index()
    zonas_potencia = df['zona_potencia'].value_counts().sort_index()

    return {
        "zonas_fc": {
            f"zona_{k}": int(v) for k, v in zonas_fc.items()
        },
        "zonas_potencia": {
            f"zona_{k}": int(v) for k, v in zonas_potencia.items()
        }
    }