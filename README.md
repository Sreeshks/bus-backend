# Yatra Bus Billing API

Backend API for Bus Billing Software built with Node.js, Express, and MongoDB.
This system supports Conductor Billing, Online Booking, and Role-Based Access Control (RBAC).

## 🚀 Setup & Installation

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Environment Variables**
    Create a `.env` file in the root directory:
    ```env
    PORT=5000
    MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?appName=yatradb
    JWT_SECRET=your_secure_secret_key
    NODE_ENV=development
    ```

3.  **Run Server**
    ```bash
    # Development (with nodemon)
    npm run dev

    # Production
    npm start
    ```

4.  **API Documentation**
    Visit `http://localhost:5000/api-docs` for interactive Swagger UI.

---

## 🔐 Authentication & Roles (RBAC)

The system uses JWT for authentication and supports granular permissions.

**Default Roles:**
-   `Admin`: Full access.
-   `Manager`: Can manage buses, routes, and fares.
-   `Conductor`: Can issue tickets (billing).
-   `Employee`: Basic read access (default).

**Common Permissions:**
-   `manage_users`: Create/Edit users & roles.
-   `manage_buses`: Add/Edit bus details.
-   `manage_trips`: Schedule trips.
-   `manage_locations`: Add towns and set fares.
-   `issue_tickets`: Billing capability.
-   `view_reports`: View daily collection and dashboard.

---

## 📡 API Endpoints

### 1. Authentication & Users

#### Login
*   **Endpoint:** `POST /api/auth/login`
*   **Body:**
    ```json
    {
      "email": "admin@yatra.com",
      "password": "password123"
    }
    ```

#### Create User (Admin Only)
*   **Endpoint:** `POST /api/auth/users`
*   **Body:**
    ```json
    {
      "name": "Rajesh Conductor",
      "role": "Conductor",
      "permissions": ["issue_tickets"]
    }
    ```

### 2. Analytics & Reports

#### Daily Collection Report
*   **Endpoint:** `GET /api/reports/daily?date=2023-10-27`
*   **Permission:** `view_reports`
*   **Response:**
    ```json
    {
      "onlineDetails": { "count": 10, "total": 5000 },
      "offlineDetails": { "count": 50, "total": 2000 },
      "grandTotal": 7000
    }
    ```

### 3. Conductor Billing (Ticketing)

#### Issue Ticket
*   **Endpoint:** `POST /api/tickets`
*   **Permission:** `issue_tickets`
*   **Body:**
    ```json
    {
      "source": "Kochi",
      "destination": "Alappuzha",
      "adultCount": 2,
      "childCount": 1
    }
    ```

### 4. Online Booking (Passenger)

#### Book Seat
*   **Endpoint:** `POST /api/bookings`
*   **Body:**
    ```json
    {
      "tripId": "64c...",
      "seatNumber": 12,
      "totalAmount": 1200
    }
    ```

#### Cancel Booking
*   **Endpoint:** `PUT /api/bookings/:id/cancel`

---

## 🛠️ Troubleshooting

-   **Authentication Failed**: Ensure you are sending the token in the header: `Authorization: Bearer <your_token>`.
-   **Permission Denied**: Check if the user has the required permission in the `permissions` array or is an Admin.
-   **Fare Not Found**: Ensure you have added the fare for the specific Source -> Destination pair via the Master Data API.
