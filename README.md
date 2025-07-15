# 📅 Event Management API

A RESTful backend service for managing events and user registrations using **Node.js**, **Express**, and **PostgreSQL**.  
Built as part of an internship assessment to demonstrate backend development, database design, business logic implementation, and API structuring.

---

## 🚀 Features

- Create, view, and manage events
- Register users for events with all validations
- Cancel event registrations
- List upcoming events with custom sorting
- Fetch event statistics (total, remaining, percentage)
- Create users via API
- All business logic and error handling included

---

## 🛠 Tech Stack

- **Backend**: Node.js + Express
- **Database**: PostgreSQL (via `pg` module)
- **Dev Tools**: Postman, Nodemon, Dotenv

---

## 📂 Folder Structure

event-management-api/

├── db/ # Database connection

│ └── db.js

├── controllers/ # Request handlers

│ ├── eventController.js

│ └── userController.js

├── routes/ # API route definitions

│ ├── events.js

│ └── users.js

├── .env # Environment variables

├── app.js # Main application file

├── package.json

└── README.md

---

## ⚙️ Setup Instructions

1. **Clone the repo**
   git clone https://github.com/yourusername/event-management-api.git and then run cd event-management-api
   
2. **Install dependencies**
   
   npm install
   
3. **Create a .env file**
   
    PORT=3000

    DB_HOST=localhost
  
    DB_USER=your_db_user
  
    DB_PASSWORD=your_db_password
  
    DB_NAME=event_api
  
    DB_PORT=5432

4. **Create the PostgreSQL database and tables**
   
   CREATE DATABASE event_api;


    -- Users table

   CREATE TABLE users (

    id SERIAL PRIMARY KEY,
  
    name VARCHAR(100),
  
    email VARCHAR(100) UNIQUE
  
    );


    -- Events table

    CREATE TABLE events (

    id SERIAL PRIMARY KEY,
  
    title VARCHAR(200),
  
    date_time TIMESTAMP,
  
    location VARCHAR(200),
  
    capacity INTEGER CHECK (capacity > 0 AND capacity <= 1000)
  
    );


    -- Registrations table

    CREATE TABLE registrations (

    id SERIAL PRIMARY KEY,
  
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
  
    UNIQUE(user_id, event_id)
  
    );

5. **Start the server**
   
   npm run dev

   
## API Endpoints

🔹 Users

| Method |	Endpoint |	Description |
| :------: |	:--------: |	:-----------: |
| POST   |	 /users  |	Create a new user |

🔹 Events

| Method |	Endpoint |	Description |
| :------: |	-------- |	----------- |
|POST	   |/events	   |Create a new event|
|GET	   |/events/:id	|Get event details and registered users|
|POST	   |/events/:id/register	|Register a user for an event|
|DELETE  |/events/:id/register/:userId	|Cancel user registration|
|GET	   |/events/upcoming	|List upcoming events (sorted by date & location)|
|GET	   |/events/:id/stats	|Get event statistics|

## 📦 Sample Request / Response

✅ Create User

POST /users

{

  "name": "John",
  
  "email": "john@example.com"
}

**Response:-**



{

  "message": "User created successfully",
  
  "userId": 1
  
}



✅ Register for Event

POST /events/1/register


{

  "user_id": 1
  
}

**Response:-**



{

  "message": "User registered successfully"
  
}



📊 Get Event Stats

GET /events/1/stats



**Response:-**


{

  "total_registrations": 2,
  
  "remaining_capacity": 298,
  
  "percent_used": "0.67%"
  
}







