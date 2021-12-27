FROM node:14 AS development
WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

FROM node:14-alpine as production
ENV NODE_ENV production
COPY --from=development /app/node_modules ./node_modules
COPY --from=development /app/package*.json ./
COPY --from=development /app/dist ./dist

EXPOSE 3000
CMD [ "npm", "run", "start:prod" ]
