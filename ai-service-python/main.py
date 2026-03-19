# ai-service-python/main.py
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import cv2
import numpy as np
import easyocr
import re

app = FastAPI(title="Megasus AI Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# RECOMENDACIÓN: Cambia gpu=False para probar estabilidad primero
print("[IA] Cargando modelo EasyOCR...")
reader = easyocr.Reader(['es'], gpu=False) 
print("[IA] Modelo cargado y listo.")

def corregir_formato_bolivia(texto):
    texto = re.sub(r'[^A-Z0-9]', '', texto.upper())
    # ... (tu lógica de corrección se mantiene igual)
    return texto

@app.post("/detect-plate")
async def detect_plate(file: UploadFile = File(...)):
    try:
        print(f"[IA] Recibiendo imagen: {file.filename}")
        
        # 1. Leer imagen de forma eficiente
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            return {"placa": "Error de imagen", "success": False}

        # 2. Preprocesamiento rápido
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # 3. OCR (Ajustamos parámetros para velocidad)
        print("[IA] Procesando OCR...")
        resultados = reader.readtext(gray, detail=1, paragraph=False)
        
        placas_candidatas = []
        for (bbox, text, prob) in resultados:
            txt_limpio = text.replace(" ", "").upper()
            
            # Filtro de palabras ruidosas
            if any(word in txt_limpio for word in ["BOLI", "VIA", "OLIV", "PLUR"]): continue
            
            # Calcular dimensiones
            ancho = bbox[1][0] - bbox[0][0]
            alto = bbox[2][1] - bbox[0][1]
            
            if len(txt_limpio) >= 5: # Placas de Bolivia suelen ser 7 u 8 caracteres
                placas_candidatas.append({
                    'placa': txt_limpio, 
                    'confianza': float(prob),
                    'area': int(ancho * alto)
                })
        
        if not placas_candidatas:
            print("[IA] No se encontró ninguna placa.")
            return {"placa": "No detectada", "success": False}

        # Devolver la que parece más una placa (ordenar por área o confianza)
        placas_candidatas.sort(key=lambda x: x['area'], reverse=True)
        placa_final = placas_candidatas[0]['placa']
        
        print(f"[IA] Placa detectada con éxito: {placa_final}")
        return {"placa": placa_final, "success": True}

    except Exception as e:
        print(f"[IA] ERROR CRÍTICO: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)