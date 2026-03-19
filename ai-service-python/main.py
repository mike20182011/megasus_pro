# ai-service-python/main.py
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import cv2
import numpy as np
import easyocr
import re
from PIL import Image
import io

app = FastAPI(title="Megasus AI Service")

# Permitir que NestJS o Angular consulten esta API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Cargar el lector una sola vez al iniciar para mayor velocidad
reader = easyocr.Reader(['es'], gpu=True) # Usa True si tienes la RTX

def corregir_formato_bolivia(texto):
    texto = re.sub(r'[^A-Z0-9]', '', texto.upper())
    if len(texto) == 8: texto = texto[1:] if texto[0] in ['1', 'I'] else texto[:7]
    if len(texto) != 7: return texto
    lista = list(texto)
    let_to_num = {'D':'0', 'O':'0', 'Q':'0', 'B':'8', 'A':'4', 'S':'5', 'Z':'2', 'I':'1', 'G':'6', 'T':'7'}
    num_to_let = {'0':'D', '8':'B', '4':'A', '5':'S', '2':'Z', '1':'I', '6':'G', '7':'T'}
    for i in range(len(lista)):
        if i < 4:
            if lista[i].isalpha() and lista[i] in let_to_num: lista[i] = let_to_num[lista[i]]
        else:
            if lista[i].isdigit() and lista[i] in num_to_let: lista[i] = num_to_let[lista[i]]
    return "".join(lista)

@app.post("/detect-plate")
async def detect_plate(file: UploadFile = File(...)):
    try:
        # 1. Leer imagen enviada
        request_object_content = await file.read()
        img_pil = Image.open(io.BytesIO(request_object_content)).convert('RGB')
        img_np = np.array(img_pil)
        
        # 2. Preprocesamiento (tu lógica anterior)
        gray = cv2.cvtColor(img_np, cv2.COLOR_RGB2GRAY)
        blurred = cv2.GaussianBlur(gray, (3, 3), 0)
        
        # 3. OCR
        resultados = reader.readtext(blurred, detail=1)
        
        placas_candidatas = []
        for (bbox, text, prob) in resultados:
            txt_limpio = text.replace(" ", "").upper()
            if any(word in txt_limpio for word in ["BOLI", "VIA", "OLIV"]): continue
            
            ancho = bbox[1][0] - bbox[0][0]
            alto = bbox[2][1] - bbox[0][1]
            
            if len(txt_limpio) >= 4:
                txt_corregido = corregir_formato_bolivia(txt_limpio)
                placas_candidatas.append({
                    'placa': txt_corregido, 
                    'confianza': float(prob),
                    'area': int(ancho * alto)
                })
        
        if not placas_candidatas:
            return {"placa": "No detectada", "success": False}

        # Devolver la de mayor área (la más cercana a la cámara)
        placas_candidatas.sort(key=lambda x: x['area'], reverse=True)
        return {"placa": placas_candidatas[0]['placa'], "success": True}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)