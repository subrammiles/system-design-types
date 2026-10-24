How to implement a simple BFF using Node.js
let's implement a simple example using Node.js + Express.

We'll create three applications:


Application	   Port	             Responsibility
User Service	3001	Returns user information
Class Service	3002	Returns yoga class 
BFF	            3000	Calls both services and combines their responses


# User service
This service provides user information.

When you call http://localhost:3001/users/1, it returns the user's details.

# Implement the Class Service
Create class-service.js:
This service provides today's yoga class information.

What is happening here?
1. The frontend calls the BFF.
2. The BFF calls the User Service and Class Service concurrently.
3. Both services return their data.
4. The BFF combines the results.
5. The frontend receives one response.
Promise.all() lets the two requests run concurrently instead of waiting for one to finish before starting the other.
Step 5: Run the applications
Open three terminal windows in your project directory.

Terminal 1:
node user-service.js

Terminal 2:
node class-service.js

Terminal 3:
node bff.js

Now open this endpoint in your browser or call it using Postman:

http://localhost:3000/api/home

You should receive:
{
  "user": {
    "id": 1,
    "name": "Subram"
  },
  "todayClass": {
    "className": "Morning Yoga",
    "instructor": "Arun",
    "time": "07:00 AM"
  }
}

Congratulations! You've implemented a basic BFF. 🎉