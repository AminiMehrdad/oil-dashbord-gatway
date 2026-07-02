FROM node:20-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    python3 make g++ build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY *.tgz ./     
RUN npm install --ignore-scripts

COPY . .

CMD ["npm", "run", "start:dev"]
