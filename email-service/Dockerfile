FROM node:14.15.4-alpine

WORKDIR /home/email-service

COPY package*.json ./

RUN npm ci --quiet --only=production

COPY . .

EXPOSE 8082

CMD ["npm", "start"]