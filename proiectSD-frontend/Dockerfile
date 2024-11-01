FROM --platform=linux/amd64 node:18

WORKDIR /app
COPY package.json .
RUN npm config set strict-ssl false
RUN npm install --loglevel verbose
RUN npm i -g serve
COPY . .
RUN npm run build
EXPOSE 3000
CMD [ "serve", "-s", "dist" ]