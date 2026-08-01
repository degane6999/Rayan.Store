# ---- Étape 1 : build de l'application Vite/React ----
FROM node:20-alpine AS builder

WORKDIR /app

# Copie des fichiers de dépendances d'abord (cache Docker)
COPY package*.json ./
RUN npm ci

# Copie du reste du code source
COPY . .

# Variables Supabase injectées au moment du build
# (Vite les intègre en dur dans le bundle JS, il n'y a pas d'autre moyen)
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

RUN npm run build

# ---- Étape 2 : image finale, Nginx sert les fichiers statiques ----
FROM nginx:1.27-alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
