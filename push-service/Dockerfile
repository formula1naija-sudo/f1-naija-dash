FROM node:20-alpine

WORKDIR /app

COPY package.json .
RUN npm install --production --no-optional

COPY . .

EXPOSE 8080

CMD ["node", "index.js"]
