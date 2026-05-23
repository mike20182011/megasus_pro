FROM node:18-alpine
WORKDIR /app

# Copiamos solo archivos de dependencias primero para optimizar
COPY package*.json ./
RUN npm install

# Copiamos todo el código fuente
COPY . .

# Construimos el proyecto de NestJS
RUN npm run build

# Exponemos el puerto de NestJS (usualmente el 3000)
EXPOSE 3000

# Comando para ejecutar la app compilada
CMD ["node", "dist/main"]