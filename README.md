# multi-container-service

https://roadmap.sh/projects/multi-container-service

# Goals

The goal of this project is to practice using Docker Compose to run a multi-container application in production. Master using Docker Compose to run a Node.js application and a MongoDB database.

# Dockerizing the the API

A two-step build with a second stage using a distroless Node.js iamge is being used to minimize the image size and maximize security:

```Dockerfile
# Stage 1: Build Stage
FROM node:22-alpine AS builder
WORKDIR /usr/src/app
COPY package*.json ./
COPY src src
RUN npm install --omit-dev
RUN npm run build

# Stage 2: Runtime Stage
FROM gcr.io/distroless/nodejs22-debian12
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
CMD [ "dist/server.js" ]
```

# Orchestrating the containers
To simplify the management of multiple containers that need to work together, Docker Compose is being used. The application image is downloaded from the registry. The image is built and pushed to the registry in the pipeline. A MongoDB container is specified, as it is required by the application, along with Mongo-Express, which serves as a useful tool for inspecting the database.

```yaml
services:
  api:
    image: registry.digitalocean.com/roadmapsh/hello-world-app
    restart: always
    ports:
      - "80:80"
    depends_on:
      mongo:
        condition: service_started
    environment:
      MONGO_URL: mongodb://mongo:27017/
  mongo:
    image: "mongo:8.0.4"
    restart: always
  mongo-express:
    image: mongo-express:1.0-20
    restart: always
    depends_on:
      mongo:
        condition: service_started
    ports:
      - 8080:8081
    environment:
      ME_CONFIG_MONGODB_URL: mongodb://mongo:27017/
      ME_CONFIG_BASICAUTH: false
```

# Testing the API with cURL

cURL can be used as it's a readily avaliable command line command on linux machines

First set the API_URL variable:

```sh
API_URL="http://localhost" # for local testing

API_URL="http://33.89.136.172" # for remote server testing
```

### Test GET /todos Endpoint

**Purpose**: Retrieve all todos from the database.  
**Response**: A list of todos in JSON format.

```sh
curl -sX GET ${API_URL}/todos | jq
```

### Test GET /todos/:id Endpoint

**Purpose**: Retrieve a single todo by its ID.  
**Response**: A JSON object representing the todo.

```sh
curl -sX GET ${API_URL}/todos/67b22a77c969b0f59f9198be | jq
```

### Test DELETE /todos/:id Endpoint

**Purpose**: Delete a todo by its ID.  
**Response**: No content is returned.

```sh
curl -sX DELETE ${API_URL}/todos/67b245db7beb848bc79df174 | jq
```

### Test POST /todos Endpoint

**Purpose**: Create a new todo.  
**Request Body**: A JSON object containing the todo details.  
**Response**: The newly created todo in JSON format.

```sh
curl -sX POST ${API_URL}/todos \
-H "Content-Type: application/json" \
--data-binary @- <<EOF | jq

{
  "title": "Todo",
  "description": "Todo description"
}
EOF
```

### Test PUT /todos/:id Endpoint

**Purpose**: Update an existing todo by its ID.  
**Request Body**: A JSON object containing the updated todo details.  
**Response**: The updated todo in JSON format.

```sh
curl -sX PUT ${API_URL}/todos/67b22a4f7e6e6b4922d70be7 \
-H "Content-Type: application/json" \
--data-binary @- <<EOF | jq

{
  "title": "Todo edit",
  "description": "Todo description edit"
}
EOF
```

# Pipeline

The pipeline is designed to spin up infrastructure with terraform and configure it with ansible.

Then image is build and pushed to the registry. Finally the docker compose is used to start the app, with docker compose it is quite easy, `docker compose up -d` is all that is needed to run it.

```yaml
- name: Copy compose file
  uses: appleboy/scp-action@v0.1.7
  with:
    host: ${{ steps.terraform-output.outputs.stdout }}
    username: root
    key: ${{ secrets.SSH_PRIV_KEY }}
    source: "compose.yaml"
    target: "/root"

- name: Run the container on remote host
  uses: appleboy/ssh-action@v1.2.0
  with:
    host: ${{ steps.terraform-output.outputs.stdout }}
    username: root
    key: ${{ secrets.SSH_PRIV_KEY }}
    script: |
      docker login --username "${{ vars.DIGITALOCEAN_USERNAME }}" --password "${{ secrets.DIGITALOCEAN_API_TOKEN }}" registry.digitalocean.com
      docker pull registry.digitalocean.com/roadmapsh/hello-world-app
      docker compose up -d
```