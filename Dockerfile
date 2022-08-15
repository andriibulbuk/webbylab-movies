FROM node:16
WORKDIR /app
COPY package.json /app
RUN npm install
COPY . /app
EXPOSE 8080
ENV PORT=8080
ENV JWT_SECRET=cabd436b-423d-4846-a233-e5dcfd04a500
ENV JWT_EXPIRATION_TIME=15m
ENV DATABASE=database
ENV USERNAME=username
ENV PASSWORD=password
ENV HOST=localhost
CMD [ "npm", "start" ]
