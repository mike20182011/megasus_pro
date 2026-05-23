# ETAPA 1: Construcción (Build)
FROM node:20-alpine AS build
WORKDIR /app

# Copiamos solo los archivos de dependencias para aprovechar el caché
COPY package*.json ./
RUN npm install

# Copiamos todo el código fuente
COPY . .

# Construimos la aplicación. 
# Importante: Asegúrate que este comando exista en tu package.json
RUN npm run build 

# ETAPA 2: Servir con Nginx
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
# AQUÍ ESTÁ EL DETALLE: 
# Angular al hacer 'build' suele crear una carpeta dentro de 'dist'
# con el nombre de tu proyecto. Verifica en tu carpeta 'dist' cómo se llama.
# Si tu app se llama 'megasus', la ruta sería /app/dist/megasus
COPY --from=build /app/dist/frontend-angular/browser /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]