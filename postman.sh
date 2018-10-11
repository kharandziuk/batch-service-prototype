curl --header "Content-Type: application/json" \
    --request POST \
      --data '{ "verb": "PUT", "url": "https://guesty-user-service.herokuapp.com/user/{userId}", "payloads": [ { "userId": 1 } ], "requestBody": { "age": 30 } }' \
        http://localhost:3000/batch
