# Bus Tracker Backend

This is the backend server for the Bus Tracker application.

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB Atlas account (or local MongoDB instance)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with the following variables:
```
# MongoDB Connection
MONGODB_URI=mongodb+srv://ss9043296:MPy8fD8bCghR3Bw2@busroute.yjqvlyx.mongodb.net/bustracker

# Server Port
PORT=5000

# Clerk Authentication
CLERK_SECRET_KEY=your_clerk_secret_key

# Twilio SMS (optional, for SMS notifications)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Firebase Admin (optional, for push notifications)
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_PRIVATE_KEY="your_firebase_private_key"
```

3. Replace the placeholder values with your actual credentials.

## Running the Backend

To start the backend server:

```bash
npm run server
```

To run both frontend and backend concurrently:

```bash
npm run dev:full
```

## API Endpoints

### Bus Routes

- `GET /api/buses` - Get all buses
- `GET /api/buses/:id` - Get a specific bus by ID
- `GET /api/buses/route/:route` - Get buses by route
- `POST /api/buses` - Register a new bus (requires authentication)
- `PUT /api/buses/:id` - Update bus location and status (requires authentication)

### User Stop Routes

- `GET /api/stops` - Get all stops for the authenticated user
- `POST /api/stops` - Add a new stop for the authenticated user
- `PUT /api/stops/:stopName` - Update a user stop
- `DELETE /api/stops/:stopName` - Delete a user stop

### User Routes

- `GET /api/users/profile` - Get the authenticated user's profile
- `PUT /api/users/profile` - Update the authenticated user's profile
- `POST /api/users/device-token` - Register a device token for push notifications

## Authentication

This backend uses Clerk for authentication. All protected routes require a valid JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

The token is verified using the Clerk SDK.