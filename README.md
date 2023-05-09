# Application architecture
- This application uses standard approaches for code arrangement based on the MVC pattern with benefits of the chain of responsibility pattern (middleware design pattern) approaches for custom error handling and authentication.
- This application separates request processing by using routers. Each router is responsible for handling routes interacting with a specific entity (user, session, movie)
- The main router is used for code arrangement
- Each handler function is actually created by the handler function factory (catchException) for custom error handling (async error handling)


# How to run the application locally
1. Create .env file and paste all variables from the .env.example there (provide available port)
2. Install packages:
```bash
npm install
```
3. Run the start command:
```bash
npm run start
```
5. The app is ready to handle requests

# How to run the application inside docker
1. Make sure that docker runs on your machine
2. In the root directory of this project run the following command
```bash
docker build . -t webbylab-test-task
```
3. Wait for the image finishes installing
4. Run the following command (use any available port on your machine instead of 5000):
```bash
docker run -p 5000:8080 webbylab-test-task
```
5. The app is ready to handle requests

## Example of request:
```bash
curl --header "Content-Type: application/json" \
  --request POST \
  --data '{
    "email": "petro@gmail.com",
    "name": "Petrenko Petro",
    "password": "StrongPassword@!1",
    "confirmPassword": "StrongPassword@!1"
}' http://localhost:5000/api/v1/users
```
