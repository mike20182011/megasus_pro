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
# gpu=False para CPU. allowlist se aplica en la detección para mayor velocidad.
reader = easyocr.Reader(['es'], gpu=False) 
print("[IA] Modelo cargado y listo.")

def corregir_formato_bolivia(texto):
    # 1. Limpieza inicial: Solo letras y números
    texto = re.sub(r'[^A-Z0-9]', '', texto.upper())
    
    # 2. Recorte de ruido en bordes para placas de 8+ caracteres
    if len(texto) >= 8:
        if texto[0] in ['1', 'I', 'L', '0']: texto = texto[1:]
        elif texto[-1] in ['1', 'I', 'L', '0']: texto = texto[:-1]

    if len(texto) < 6 or len(texto) > 7:
        return texto 
        
    lista = list(texto)
    let_to_num = {'D':'0', 'O':'0', 'Q':'0', 'B':'8', 'A':'4', 'S':'5', 'Z':'2', 'I':'1', 'G':'6', 'T':'7'}
    num_to_let = {'0':'D', '8':'B', '4':'A', '5':'S', '2':'Z', '1':'I', '6':'G', '7':'T'}
    
    # Ajuste según posición (4 números - 3 letras)
    for i in range(len(lista)):
        if i < 4:
            if lista[i].isalpha() and lista[i] in let_to_num: 
                lista[i] = let_to_num[lista[i]]
        else:
            if lista[i].isdigit() and lista[i] in num_to_let: 
                lista[i] = num_to_let[lista[i]]
    
    return "".join(lista)

@app.post("/detect-plate")
async def detect_plate(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None: return {"placa": "Error", "success": False}

        # --- OPTIMIZACIÓN DINÁMICA ---
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        alto_orig, ancho_orig = gray.shape[:2]

        # 1. Re-escalado Condicional (Solo si la imagen es pequeña)
        # Si el alto es menor a 300px, aplicamos un factor de 1.5 en lugar de 2.0 (más rápido)
        if alto_orig < 300:
            f_escala = 1.5
            gray = cv2.resize(gray, None, fx=f_escala, fy=f_escala, interpolation=cv2.INTER_LINEAR)
            padding = 20
        else:
            f_escala = 1.0
            padding = 10

        # 2. Contraste Adaptativo (CLAHE) - Nivel 2.0 para balancear velocidad
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
        gray = clahe.apply(gray)

        # 3. Operación Morfológica ligera
        kernel = np.ones((2,2), np.uint8)
        gray = cv2.morphologyEx(gray, cv2.MORPH_OPEN, kernel)

        # 4. Margen de seguridad
        gray = cv2.copyMakeBorder(gray, padding, padding, padding, padding, cv2.BORDER_CONSTANT, value=[255, 255, 255])

        # --- OCR ULTRA RÁPIDO ---
        # El allowlist restringe la búsqueda, acelerando el proceso un 30-40%
        resultados = reader.readtext(
            gray, 
            detail=1,
            paragraph=False,
            allowlist='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            mag_ratio=1.2,
            text_threshold=0.6,
            low_text=0.3,
            batch_size=4 # Proceso paralelo
        )
        
        placas_candidatas = []
        for (bbox, text, prob) in resultados:
            txt_raw = text.replace(" ", "").upper()
            
            # Filtro de diseño boliviano
            if any(word in txt_raw for word in ["BOLI", "VIA", "OLIV", "PLUR", "ESTA", "ESTADO"]): 
                continue
            
            txt_corregido = corregir_formato_bolivia(txt_raw)
            
            if len(txt_corregido) >= 6:
                # Ajuste de coordenadas considerando el padding y la escala
                x_min = max(0, int((bbox[0][0] - padding) / f_escala))
                y_min = max(0, int((bbox[0][1] - padding) / f_escala))
                x_max = int((bbox[1][0] - padding) / f_escala)
                y_max = int((bbox[2][1] - padding) / f_escala)
                
                ancho = x_max - x_min
                alto = y_max - y_min
                
                placas_candidatas.append({
                    'placa': txt_corregido, 
                    'confianza': float(prob),
                    'area': int(ancho * alto),
                    'coords': { 'x': x_min, 'y': y_min, 'w': ancho, 'h': alto }
                })
        
        if not placas_candidatas:
            return {"placa": "No detectada", "success": False}

        # Mejor opción por confianza y tamaño
        mejor_opcion = max(placas_candidatas, key=lambda x: (x['confianza'], x['area']))
        
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