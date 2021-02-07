FROM node:14.15.4-alpine

WORKDIR /home/public-service

COPY package*.json ./

RUN npm ci --quiet --only=production

COPY . .

EXPOSE 8080

CMD ["npm", "start"]