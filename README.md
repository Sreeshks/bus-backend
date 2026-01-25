# Yatra Bus Billing API

Backend API for Bus Billing Software built with Node.js, Express, and MongoDB.

## Setup

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Environment Variables**
    Open `.env` file and replace `<db_password>` with your actual MongoDB password.
    ```
    MONGO_URI=mongodb+srv://sreeshksureshh_db_user:<your_password>@yatradb.tqevuke.mongodb.net/?appName=yatradb
    ```

3.  **Run Server**
    ```bash
    # Development mode
    npm run dev

    # Production mode
    npm start
    ```

## API Endpoints

### Auth
-   `POST /api/auth/register` - Register a new user
-   `POST /api/auth/login` - Login user

### Buses (Admin Only)
-   `GET /api/buses` - Get all buses
-   `POST /api/buses` - Add a bus
-   `PUT /api/buses/:id` - Update a bus
-   `DELETE /api/buses/:id` - Delete a bus

### Trips
-   `GET /api/trips?source=X&destination=Y&date=Z` - Search trips
-   `POST /api/trips` - Create a trip (Admin)

### Bookings
-   `POST /api/bookings` - Book a seat
    -   Body: `{ tripId, passengerName, seatNumber, paymentMethod, totalAmount }`
-   `GET /api/bookings/mybookings` - Get current user bookings
