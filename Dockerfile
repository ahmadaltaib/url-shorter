# Use Node.js as base image
FROM node:16-alpine

WORKDIR /url_shorter
COPY package*.json ./

# go to prod
RUN npm install --production
COPY . .
EXPOSE 3000

# install and run MongoDB
RUN apk add --no-cache mongodb-tools
CMD ["mongod", "--bind_ip_all"]

# Start url_shorter app
CMD ["npm", "run", "start:prod"]
