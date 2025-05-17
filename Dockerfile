FROM node:latest
WORKDIR /usr/src/app

ENV NODE_ENV production
ENV PORT 3000

COPY package*.json ./

RUN npm ci --include=dev

COPY . .
RUN npm run build

RUN npm prune

EXPOSE 3000
CMD [ "npm", "run", "start" ]
