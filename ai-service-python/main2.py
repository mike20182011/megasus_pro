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

print("[IA] Cargando modelo EasyOCR...")
reader = easyocr.Reader(['es'], gpu=False) 
print("[IA] Modelo cargado y listo.")

def corregir_formato_bolivia(texto):
    # 1. Limpieza inicial
    texto = re.sub(r'[^A-Z0-9]', '', texto.upper())
    
    # 2. Filtro de ruido agresivo
    if re.search(r'B[08]L[1I]V[1I]A|BOL|V1A|L1V|PLU|ESTA', texto):
        return ""

    # 3. Recorte de ruido en bordes
    if len(texto) >= 8:
        if texto[0] in ['1', 'I', 'L', '0']: texto = texto[1:]
        elif texto[-1] in ['1', 'I', 'L', '0']: texto = texto[:-1]

    longitud = len(texto)
    if longitud not in [6, 7]:
        return texto 
        
    lista = list(texto)
    
    # Diccionarios de conversión forzosa
    let_to_num = {
        'D':'0', 'O':'0', 'Q':'0', 'U':'0', 
        'I':'1', 'L':'1', 'Z':'2', 'S':'5', 
        'G':'6', 'T':'7', 'B':'8', 'A':'4'
    }
    num_to_let = {
        '0':'D', '1':'I', '2':'Z', '4':'A', 
        '5':'S', '6':'G', '7':'T', '8':'B'
    }
    
    # --- LÓGICA DE SEGMENTACIÓN ESTRICTA ---
    punto_corte = longitud - 3 

    for i in range(longitud):
        if i < punto_corte:
            if lista[i].isalpha():
                lista[i] = let_to_num.get(lista[i], lista[i])
        else:
            if lista[i].isdigit():
                lista[i] = num_to_let.get(lista[i], lista[i])
    
    return "".join(lista)

@app.post("/detect-plate")
async def detect_plate(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None: return {"placa": "Error", "success": False}

        # --- PRE-PROCESAMIENTO OPTIMIZADO PARA VELOCIDAD ---
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        alto_orig, ancho_orig = gray.shape[:2]

        # 1. Escalado inteligente: Solo ampliamos si la imagen es realmente pequeña
        if alto_orig < 250:
            f_escala = 1.5
            # INTER_LINEAR es mucho más rápido que INTER_CUBIC y suficiente para OCR
            gray = cv2.resize(gray, None, fx=f_escala, fy=f_escala, interpolation=cv2.INTER_LINEAR)
            padding = 20
        # 2. Si la imagen es enorme (ej. 1080p directo del celular), la reducimos para acelerar la IA
        elif alto_orig > 800:
            f_escala = 800 / alto_orig
            gray = cv2.resize(gray, None, fx=f_escala, fy=f_escala, interpolation=cv2.INTER_AREA)
            padding = 10
        else:
            f_escala = 1.0
            padding = 10

        # CLAHE estándar (rápido)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
        gray = clahe.apply(gray)
        
        # Eliminamos el GaussianBlur generalizado porque añade latencia en CPU
        
        gray = cv2.copyMakeBorder(gray, padding, padding, padding, padding, cv2.BORDER_CONSTANT, value=[255, 255, 255])

        # --- OCR DE ALTO RENDIMIENTO ---
        resultados = reader.readtext(
            gray, 
            detail=1,
            paragraph=False,
            allowlist='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            mag_ratio=1.2, # Reducido de 1.5 a 1.2 (evita sobrecarga de memoria)
            # Se eliminó contrast_ths=0.1 que duplicaba el tiempo de escaneo
            batch_size=1 # En procesamiento CPU, batch_size=1 suele ser más rápido para imágenes individuales
        )
        
        placas_candidatas = []
        
        for (bbox, text, prob) in resultados:
            txt_raw = text.replace(" ", "").upper()
            
            if re.search(r'BOL|V[1I]A|L[1I]V|PLU|ESTA', txt_raw):
                continue

            txt_corregido = corregir_formato_bolivia(txt_raw)
            
            if len(txt_corregido) in [6, 7]:
                x_min = max(0, int((bbox[0][0] - padding) / f_escala))
                y_min = max(0, int((bbox[0][1] - padding) / f_escala))
                x_max = int((bbox[1][0] - padding) / f_escala)
                y_max = int((bbox[2][1] - padding) / f_escala)
                
                alto = y_max - y_min
                
                placas_candidatas.append({
                    'placa': txt_corregido, 
                    'confianza': float(prob),
                    'alto': alto,
                    'coords': { 'x': x_min, 'y': y_min, 'w': x_max - x_min, 'h': alto }
                })
        
        if not placas_candidatas:
            return {"placa": "No detectada", "success": False}

        # --- SELECCIÓN ---
        max_alto = max(p['alto'] for p in placas_candidatas)
        candidatas_reales = [p for p in placas_candidatas if p['alto'] >= max_alto * 0.7]

        def puntuar_placa(p):
            score = p['confianza']
            if re.match(r'^\d{3,4}[A-Z]{3}$', p['placa']):
                score += 0.4
            return score

        mejor_opcion = max(candidatas_reales, key=puntuar_placa)
        
        return {
            "placa": mejor_opcion['placa'], 
            "success": True,
            "coords": mejor_opcion['coords']
        }

    except Exception as e:
        print(f"[IA] Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)