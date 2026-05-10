# Application image

# working with  node 
FROM node:18-alpine

# working directory for the application
WORKDIR /app

# copy the package.json to the package.json file in the container

COPY package*.json ./

# install the dependencies
RUN npm install --production

# copy all related information in particular directory to the container
COPY . .

# make the directory for logs which will keep track of all log related things 
RUN mkdir -p logs

# expose the port 5000 to the outside world
EXPOSE 5000

# run the command to start the server when the container is run

CMD ["node","src/server.js"]