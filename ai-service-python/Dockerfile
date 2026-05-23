FROM python:3.9-slim

# Instalamos dependencias del sistema esenciales para EasyOCR y OpenCV
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    gcc \
    g++ \
    cmake \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Actualizamos pip y herramientas de construcción
RUN pip install --no-cache-dir --upgrade pip setuptools wheel

# Instalamos los requisitos
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiamos el resto de la IA
COPY . .

EXPOSE 8000

CMD ["python", "main.py"]