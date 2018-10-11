## to run the server
```
yarn
yarn start
```


## sample of the format (or check tests)
```json
{
verb: 'PUT',
        url: 'https://guesty-user-service.herokuapp.com/user/{userId}',
        payloads: [
        { userId: 1 },
        { userId: 11 },
        { userId: 14 }
        ],
        requestBody: { age: 30 }
}
```
