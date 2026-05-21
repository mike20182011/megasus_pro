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

print("[IA] Cargando modelo ultra-rápido...")
# Optimizamos el Reader para CPU
reader = easyocr.Reader(['es'], gpu=False, recognizer=True) 
print("[IA] Modelo cargado.")

def corregir_formato_bolivia(texto):
    texto = re.sub(r'[^A-Z0-9]', '', texto.upper())
    # Filtro rápido de palabras prohibidas
    if any(x in texto for x in ["BOLIVIA", "PLU", "ESTA", "V1A"]): return ""

    longitud = len(texto)
    if longitud not in [6, 7, 8]: return texto 
    
    # Recorte si hay ruido de bordes (común en placas bolivianas)
    if longitud >= 8:
        texto = texto[1:-1] if longitud == 8 else texto
        longitud = len(texto)

    lista = list(texto)
    let_to_num = {'D':'0','O':'0','Q':'0','I':'1','J':'1','L':'1','Z':'2','S':'5','G':'6','T':'7','B':'8','A':'4'}
    num_to_let = {'0':'O','1':'I','2':'Z','4':'A','5':'S','6':'G','7':'T','8':'B'}
    
    punto_corte = longitud - 3 
    for i in range(longitud):
        if i < punto_corte:
            if lista[i].isalpha(): lista[i] = let_to_num.get(lista[i], '1') 
        else:
            if lista[i].isdigit(): lista[i] = num_to_let.get(lista[i], 'I')
    
    return "".join(lista)

@app.post("/detect-plate")
async def detect_plate(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None: return {"placa": "Error", "success": False}

        # --- PRE-PROCESAMIENTO LIGERO (MODIFICADO) ---
        # Pasamos a gris pero EVITAMOS filtros pesados como CLAHE o Sharpening en tiempo real
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # En lugar de CLAHE, usamos un ajuste de contraste simple y rápido (alfa/beta)
        # Esto es mucho más liviano para el CPU
        gray = cv2.convertScaleAbs(gray, alpha=1.2, beta=10)

        # --- OCR ULTRA RÁPIDO ---
        # Bajamos mag_ratio a 1.0 para evitar que EasyOCR re-escale internamente
        resultados = reader.readtext(
            gray, 
            allowlist='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            mag_ratio=1.0, 
            paragraph=False,
            decoder='greedy', # El decodificador más rápido
            batch_size=1
        )
        
        placas_candidatas = []
        for (bbox, text, prob) in resultados:
            txt_raw = text.replace(" ", "").upper()
            if len(txt_raw) < 5: continue
            
            txt_corregido = corregir_formato_bolivia(txt_raw)
            
            if len(txt_corregido) in [6, 7]:
                # Mapeo de coordenadas original
                x_min = int(bbox[0][0])
                y_min = int(bbox[0][1])
                width = int(bbox[1][0] - bbox[0][0])
                height = int(bbox[2][1] - bbox[0][1])
                
                placas_candidatas.append({
                    'placa': txt_corregido, 
                    'confianza': float(prob),
                    'coords': { 'x': x_min, 'y': y_min, 'w': width, 'h': height }
                })
        
        if not placas_candidatas:
            return {"placa": "---", "success": False}

        # Priorizar la placa con mayor confianza
        mejor_opcion = max(placas_candidatas, key=lambda x: x['confianza'])
        
        return {
            "placa": mejor_opcion['placa'], 
            "success": True,
            "coords": mejor_opcion['coords']
        }

    except Exception as e:
        print(f"[IA] Error: {str(e)}")
        return {"placa": "Error", "success": False, "detail": str(e)}

if __name__ == "__main__":
    import uvicorn
    # Aumentamos los workers para manejar mejor las peticiones en paralelo si es necesario
    uvicorn.run(app, host="0.0.0.0", port=8000, workers=1)