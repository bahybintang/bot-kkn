FROM node:alpine3.11

WORKDIR /app

COPY package.json package.json
COPY package-lock.json package-lock.json
COPY data.xlsx .
COPY index.js .
COPY logger.js .
COPY parse.js .

RUN npm install

CMD [ "npm", "start" ]