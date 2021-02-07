FROM node:14.15.4-alpine

WORKDIR /home/subscription-service

COPY package*.json ./

RUN npm ci --quiet --only=production

COPY . .

EXPOSE 8081

CMD ["npm", "start"]