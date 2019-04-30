FROM node:11.12.0

WORKDIR /usr/app

COPY package*.json ./
RUN npm install -qy

COPY . .

EXPOSE 1111

CMD ["npm", "start"]
