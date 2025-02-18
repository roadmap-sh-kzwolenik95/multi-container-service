# Test the app with cURL

Set the API_URL:

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
