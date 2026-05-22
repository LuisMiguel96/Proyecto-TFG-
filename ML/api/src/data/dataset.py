import pandas as pd
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(BASE_DIR, '..', '..', '..', 'outputs', 'dataset_features.csv')

df = pd.read_csv(CSV_PATH)
df['timestamp'] = pd.to_datetime(df['timestamp'])

print(f"✅ Dataset cargado: {df.shape[0]} registros, {df['archivo'].nunique()} actividades")

if __name__ == "__main__":
    print(f"✅ Dataset cargado: {df.shape[0]} registros, {df['archivo'].nunique()} actividades")
    print(df.head())