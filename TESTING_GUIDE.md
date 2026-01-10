# Airline Ticketing System - Complete Testing Guide

This guide provides step-by-step instructions to test all features of the Airline Ticketing System and verify it works correctly for a 100/100 score.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Setup Before Testing](#setup-before-testing)
- [Testing Strategy Overview](#testing-strategy-overview)
- [Part 1: Service Health Checks](#part-1-service-health-checks)
- [Part 2: IAM Service Testing](#part-2-iam-service-testing)
- [Part 3: Flight Service Testing](#part-3-flight-service-testing)
- [Part 4: Notification Service Testing](#part-4-notification-service-testing)
- [Part 5: Scheduler Service Testing](#part-5-scheduler-service-testing)
- [Part 6: End-to-End Integration Testing](#part-6-end-to-end-integration-testing)
- [Part 7: Frontend Testing](#part-7-frontend-testing)
- [Part 8: Advanced Feature Testing](#part-8-advanced-feature-testing)
- [Troubleshooting](#troubleshooting)
- [Success Criteria Checklist](#success-criteria-checklist)

---

## Prerequisites

### Required Software
- ✅ Node.js 20+ installed
- ✅ npm 10+ installed
- ✅ Docker and Docker Compose installed
- ✅ Postman (recommended) or curl
- ✅ Gmail account with App Password (for email testing)

### Required Knowledge
- Basic understanding of REST APIs
- How to use Postman or curl
- Basic terminal/command line usage

---

## Setup Before Testing

### Step 1: Configure Environment Variables

```bash
# Navigate to project root
cd Airline-Ticketing-System

# Create .env file from example
cp .env.example .env
```

### Step 2: Edit .env File

Open `.env` and configure:

```bash
# Gmail Configuration (REQUIRED for email testing)
GMAIL_USER=your-email@gmail.com
GMAIL_PASS=your-16-digit-app-password

# JWT Secret (can keep default for testing)
JWT_SECRET=your-secret-key-change-in-production

# Partner API Key (can keep default for testing)
PARTNER_API_KEY=partner-api-key-12345

# Database Configuration (can keep defaults)
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=airline_db
```

**Important:** To get Gmail App Password:
1. Go to Google Account Settings
2. Enable 2-Step Verification
3. Go to Security → App Passwords
4. Generate password for "Mail"
5. Copy the 16-digit password (no spaces)
6. Paste into GMAIL_PASS

### Step 3: Start All Services

**Option A: Using Docker Compose (Recommended)**

```bash
# Start all services with one command
docker-compose up --build

# Wait until you see all services running:
# ✓ API Gateway on port 3000
# ✓ IAM Service on port 3002
# ✓ Flight Service on port 3001
# ✓ Notification Service on port 3003
# ✓ Scheduler Service running
# ✓ PostgreSQL on port 5432
```

**Option B: Manual Start (Alternative)**

```bash
# Terminal 1 - PostgreSQL
docker run --name airline-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=airline_db \
  -p 5432:5432 -d postgres:16-alpine

# Terminal 2 - API Gateway
cd services/api-gateway
npm install
npm run dev

# Terminal 3 - IAM Service
cd services/iam-service
npm install
npm run dev

# Terminal 4 - Flight Service
cd services/flight-service
npm install
npm run dev

# Terminal 5 - Notification Service
cd services/notification-service
npm install
npm run dev

# Terminal 6 - Scheduler Service
cd services/scheduler-service
npm install
npm run dev
```

### Step 4: Verify Services Are Running

Open your browser and check:
- ✅ http://localhost:3000 → "API Gateway is running!"
- ✅ http://localhost:3001 → "Flight Service is running!"
- ✅ http://localhost:3002 → "IAM Service is running!"
- ✅ http://localhost:3003 → "Notification Service is running!"

---

## Testing Strategy Overview

We will test in this order:
1. **Health Checks** - Ensure all services are accessible
2. **IAM Service** - Authentication and user management
3. **Flight Service** - Add, search, and book flights
4. **Notification Service** - Email functionality
5. **Scheduler Service** - Automated tasks
6. **Integration** - Complete user journey
7. **Frontend** - UI functionality
8. **Advanced** - Edge cases and error handling

---

## Part 1: Service Health Checks

### Test 1.1: API Gateway Health

**Using Browser:**
```
http://localhost:3000
```

**Expected Response:**
```
API Gateway is running!
```

**Using curl:**
```bash
curl http://localhost:3000
```

**✅ Pass Criteria:** Returns "API Gateway is running!"

---

### Test 1.2: All Services Health

Test each service directly:

```bash
# IAM Service
curl http://localhost:3002

# Flight Service
curl http://localhost:3001

# Notification Service
curl http://localhost:3003
```

**✅ Pass Criteria:** All return "XXX Service is running!"

---

## Part 2: IAM Service Testing

### Test 2.1: Register Admin User

**Using Postman:**
1. Create new request
2. Method: `POST`
3. URL: `http://localhost:3000/api/v1/iam/register`
4. Headers: `Content-Type: application/json`
5. Body (raw JSON):

```json
{
  "username": "admin1",
  "password": "admin123",
  "email": "admin@test.com",
  "role": "admin"
}
```

6. Click Send

**Using curl:**
```bash
curl -X POST http://localhost:3000/api/v1/iam/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin1",
    "password": "admin123",
    "email": "admin@test.com",
    "role": "admin"
  }'
```

**Expected Response:**
```
User created successfully
```

**✅ Pass Criteria:**
- Status: 201 Created
- Response: "User created successfully"
- Check your email for welcome message (may take 30 seconds)

---

### Test 2.2: Register Regular User

**Postman Request:**
- Method: `POST`
- URL: `http://localhost:3000/api/v1/iam/register`
- Body:

```json
{
  "username": "user1",
  "password": "user123",
  "email": "your-real-email@gmail.com",
  "role": "user"
}
```

**Using curl:**
```bash
curl -X POST http://localhost:3000/api/v1/iam/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "user1",
    "password": "user123",
    "email": "your-real-email@gmail.com",
    "role": "user"
  }'
```

**✅ Pass Criteria:**
- Status: 201 Created
- Welcome email received with Miles&Smiles number

---

### Test 2.3: Login as Admin

**Postman Request:**
- Method: `POST`
- URL: `http://localhost:3000/api/v1/iam/login`
- Body:

```json
{
  "username": "admin1",
  "password": "admin123"
}
```

**Using curl:**
```bash
curl -X POST http://localhost:3000/api/v1/iam/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin1",
    "password": "admin123"
  }'
```

**Expected Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**✅ Pass Criteria:**
- Status: 200 OK
- Response contains JWT token
- **IMPORTANT:** Copy this token! You'll need it for admin operations

**Save the token as:**
```
ADMIN_TOKEN=<paste-token-here>
```

---

### Test 2.4: Login as Regular User

**Postman Request:**
- Method: `POST`
- URL: `http://localhost:3000/api/v1/iam/login`
- Body:

```json
{
  "username": "user1",
  "password": "user123"
}
```

**✅ Pass Criteria:**
- Status: 200 OK
- Response contains JWT token
- **Save as:** `USER_TOKEN=<paste-token-here>`

---

### Test 2.5: Get User Profile

**Postman Request:**
- Method: `GET`
- URL: `http://localhost:3000/api/v1/iam/users/1`

**Using curl:**
```bash
curl http://localhost:3000/api/v1/iam/users/1
```

**Expected Response:**
```json
{
  "id": 1,
  "username": "admin1",
  "email": "admin@test.com",
  "role": "admin",
  "milesNumber": "MS1704902400000",
  "milesPoints": 0
}
```

**✅ Pass Criteria:**
- Status: 200 OK
- User object returned without password
- milesNumber is present
- milesPoints starts at 0

---

### Test 2.6: Update User Points

**Postman Request:**
- Method: `POST`
- URL: `http://localhost:3000/api/v1/iam/users/2/update-points`
- Body:

```json
{
  "points": 1000
}
```

**Using curl:**
```bash
curl -X POST http://localhost:3000/api/v1/iam/users/2/update-points \
  -H "Content-Type: application/json" \
  -d '{"points": 1000}'
```

**Expected Response:**
```json
{
  "message": "Points updated successfully",
  "user": {
    "id": 2,
    "username": "user1",
    "milesPoints": 1000,
    ...
  }
}
```

**✅ Pass Criteria:**
- Status: 200 OK
- milesPoints updated to 1000

---

## Part 3: Flight Service Testing

### Test 3.1: Add Flight (Admin Only)

**Postman Request:**
- Method: `POST`
- URL: `http://localhost:3000/api/v1/flights/flights`
- Headers:
  - `Content-Type: application/json`
  - `Authorization: Bearer <ADMIN_TOKEN>`
- Body:

```json
{
  "fromCity": "Istanbul",
  "toCity": "Izmir",
  "flightDate": "2026-02-15",
  "flightCode": "TK123",
  "price": 500,
  "duration": 90,
  "capacity": 180
}
```

**Using curl:**
```bash
curl -X POST http://localhost:3000/api/v1/flights/flights \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "fromCity": "Istanbul",
    "toCity": "Izmir",
    "flightDate": "2026-02-15",
    "flightCode": "TK123",
    "price": 500,
    "duration": 90,
    "capacity": 180
  }'
```

**Expected Response:**
```json
{
  "id": 1,
  "fromCity": "Istanbul",
  "toCity": "Izmir",
  "flightDate": "2026-02-15T00:00:00.000Z",
  "flightCode": "TK123",
  "price": 500,
  "duration": 90,
  "capacity": 180
}
```

**✅ Pass Criteria:**
- Status: 201 Created
- Flight object returned with ID

---

### Test 3.2: Add More Flights

Add several more flights for testing:

```json
{
  "fromCity": "Istanbul",
  "toCity": "Ankara",
  "flightDate": "2026-02-15",
  "flightCode": "TK456",
  "price": 300,
  "duration": 60,
  "capacity": 150
}
```

```json
{
  "fromCity": "Istanbul",
  "toCity": "Izmir",
  "flightDate": "2026-02-15",
  "flightCode": "TK789",
  "price": 550,
  "duration": 95,
  "capacity": 200
}
```

**✅ Pass Criteria:** All flights created successfully

---

### Test 3.3: Test Admin Authorization

**Postman Request:**
- Method: `POST`
- URL: `http://localhost:3000/api/v1/flights/flights`
- Headers:
  - `Content-Type: application/json`
  - `Authorization: Bearer <USER_TOKEN>` (NOT admin token)
- Body: (any flight data)

**✅ Pass Criteria:**
- Status: 403 Forbidden
- Error message about insufficient permissions

---

### Test 3.4: Search Flights (No Pagination)

**Postman Request:**
- Method: `GET`
- URL: `http://localhost:3000/api/v1/flights/flights?fromCity=Istanbul&toCity=Izmir&flightDate=2026-02-15`

**Using curl:**
```bash
curl "http://localhost:3000/api/v1/flights/flights?fromCity=Istanbul&toCity=Izmir&flightDate=2026-02-15"
```

**Expected Response:**
```json
{
  "data": [
    {
      "id": 1,
      "fromCity": "Istanbul",
      "toCity": "Izmir",
      "flightCode": "TK123",
      ...
    },
    {
      "id": 3,
      "fromCity": "Istanbul",
      "toCity": "Izmir",
      "flightCode": "TK789",
      ...
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 2,
    "totalPages": 1
  }
}
```

**✅ Pass Criteria:**
- Status: 200 OK
- Returns matching flights
- Pagination object present

---

### Test 3.5: Search Flights with Pagination

**Postman Request:**
- Method: `GET`
- URL: `http://localhost:3000/api/v1/flights/flights?fromCity=Istanbul&toCity=Izmir&flightDate=2026-02-15&page=1&limit=1`

**Expected Response:**
```json
{
  "data": [
    {
      "id": 1,
      ...
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 1,
    "total": 2,
    "totalPages": 2
  }
}
```

**✅ Pass Criteria:**
- Only 1 flight returned
- totalPages = 2
- page = 1

---

### Test 3.6: Get Single Flight

**Postman Request:**
- Method: `GET`
- URL: `http://localhost:3000/api/v1/flights/flights/1`

**Using curl:**
```bash
curl http://localhost:3000/api/v1/flights/flights/1
```

**Expected Response:**
```json
{
  "id": 1,
  "fromCity": "Istanbul",
  "toCity": "Izmir",
  ...
}
```

**✅ Pass Criteria:**
- Status: 200 OK
- Specific flight returned

---

### Test 3.7: ML Price Prediction

**Postman Request:**
- Method: `GET`
- URL: `http://localhost:3000/api/v1/flights/flights/predict-price`

**Using curl:**
```bash
curl http://localhost:3000/api/v1/flights/flights/predict-price
```

**Expected Response:**
```json
{
  "predictedPrice": 5000
}
```

**✅ Pass Criteria:**
- Status: 200 OK
- Mock price returned (ready for ML model integration)

---

### Test 3.8: Book Flight with Cash

**Postman Request:**
- Method: `POST`
- URL: `http://localhost:3000/api/v1/flights/flights/1/book`
- Body:

```json
{
  "userId": 2,
  "numberOfPassengers": 2
}
```

**Using curl:**
```bash
curl -X POST http://localhost:3000/api/v1/flights/flights/1/book \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 2,
    "numberOfPassengers": 2
  }'
```

**Expected Response:**
```json
{
  "message": "Booking successful!",
  "flight": {
    "id": 1,
    "capacity": 178,
    ...
  }
}
```

**✅ Pass Criteria:**
- Status: 200 OK
- Capacity reduced by 2 (180 → 178)
- Booking created

---

### Test 3.9: Book Flight with Points

First, ensure user has enough points (from Test 2.6).

**Postman Request:**
- Method: `POST`
- URL: `http://localhost:3000/api/v1/flights/flights/1/book-with-points`
- Body:

```json
{
  "userId": 2,
  "numberOfPassengers": 1
}
```

**Calculation:**
- Flight price: 500
- Passengers: 1
- Points needed: 500 × 1 × 10 = 5000 points
- User has: 1000 points (from Test 2.6)

**Expected Response:**
```
Error: Insufficient points or user not found
```

**Update User Points First:**
```bash
curl -X POST http://localhost:3000/api/v1/iam/users/2/update-points \
  -H "Content-Type: application/json" \
  -d '{"points": 4000}'
```

Now user has 5000 points total. Try booking again.

**✅ Pass Criteria:**
- Status: 200 OK
- Capacity reduced
- User points decreased by 5000

---

### Test 3.10: Verify Capacity Reduction

**Get flight again:**
```bash
curl http://localhost:3000/api/v1/flights/flights/1
```

**✅ Pass Criteria:**
- Capacity shows reductions from all bookings
- Original: 180
- After 2 passengers: 178
- After 1 more: 177

---

## Part 4: Notification Service Testing

### Test 4.1: Send Custom Email

**Postman Request:**
- Method: `POST`
- URL: `http://localhost:3000/api/v1/notifications/send-email`
- Body:

```json
{
  "to": "your-email@gmail.com",
  "subject": "Test Email from Airline System",
  "text": "This is a test email to verify notification service is working correctly."
}
```

**Using curl:**
```bash
curl -X POST http://localhost:3000/api/v1/notifications/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "your-email@gmail.com",
    "subject": "Test Email",
    "text": "Test message"
  }'
```

**Expected Response:**
```
Email sent successfully
```

**✅ Pass Criteria:**
- Status: 200 OK
- Email received in inbox within 30 seconds
- Check spam folder if not in inbox

---

### Test 4.2: Welcome Email (Already Tested)

This was automatically tested in Test 2.1 and 2.2 when registering users.

**✅ Pass Criteria:**
- Welcome emails received for all new registrations

---

## Part 5: Scheduler Service Testing

### Test 5.1: Check Scheduler Logs

The scheduler runs every minute (for testing purposes).

**Check Docker Compose logs:**
```bash
docker-compose logs -f scheduler-service
```

**Look for:**
```
Running the award-miles job...
Award-miles job finished successfully: { message: '...', totalPointsAwarded: ... }
```

**✅ Pass Criteria:**
- Logs show scheduler running every minute
- No errors in scheduler

---

### Test 5.2: Award Miles Endpoint (Manual Trigger)

**Postman Request:**
- Method: `POST`
- URL: `http://localhost:3000/api/v1/flights/flights/award-miles`

**Using curl:**
```bash
curl -X POST http://localhost:3000/api/v1/flights/flights/award-miles
```

**Expected Response:**
```json
{
  "message": "Miles awarded successfully.",
  "totalPointsAwarded": 0
}
```

**Note:** Will be 0 if no completed flights (flights in the past).

**✅ Pass Criteria:**
- Status: 200 OK
- Process completes without errors

---

### Test 5.3: Test with Past Flight

Add a flight with past date:

**Postman Request:**
- Method: `POST`
- URL: `http://localhost:3000/api/v1/flights/flights`
- Headers: `Authorization: Bearer <ADMIN_TOKEN>`
- Body:

```json
{
  "fromCity": "Ankara",
  "toCity": "Izmir",
  "flightDate": "2026-01-09",
  "flightCode": "TK999",
  "price": 400,
  "duration": 70,
  "capacity": 160
}
```

**Book this flight:**
```json
{
  "userId": 2,
  "numberOfPassengers": 1
}
```

**Trigger award miles:**
```bash
curl -X POST http://localhost:3000/api/v1/flights/flights/award-miles
```

**Expected Response:**
```json
{
  "message": "Miles awarded successfully.",
  "totalPointsAwarded": 400
}
```

**Check user points:**
```bash
curl http://localhost:3000/api/v1/iam/users/2
```

**✅ Pass Criteria:**
- Points awarded: 400 (price) × 1 (passengers) × 1 (points per dollar)
- User's milesPoints increased

---

## Part 6: End-to-End Integration Testing

This tests the complete user journey from registration to booking.

### Scenario: New User Books a Flight

**Step 1: Register New User**
```bash
curl -X POST http://localhost:3000/api/v1/iam/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "password": "john123",
    "email": "john@test.com",
    "role": "user"
  }'
```

**✅ Check:** Welcome email received

---

**Step 2: Login**
```bash
curl -X POST http://localhost:3000/api/v1/iam/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "password": "john123"
  }'
```

**✅ Check:** JWT token received
**Save token as:** `JOHN_TOKEN`

---

**Step 3: Search Available Flights**
```bash
curl "http://localhost:3000/api/v1/flights/flights?fromCity=Istanbul&toCity=Izmir&flightDate=2026-02-15"
```

**✅ Check:** List of flights returned

---

**Step 4: Get Flight Details**
```bash
curl http://localhost:3000/api/v1/flights/flights/1
```

**✅ Check:** Flight details shown

---

**Step 5: Book Flight**
```bash
curl -X POST http://localhost:3000/api/v1/flights/flights/1/book \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 3,
    "numberOfPassengers": 2
  }'
```

**✅ Check:**
- Booking successful
- Capacity reduced
- Status 200

---

**Step 6: Verify Booking**
```bash
curl http://localhost:3000/api/v1/flights/flights/1
```

**✅ Check:** Capacity shows reduction

---

### End-to-End Success Criteria

✅ Complete flow works without errors
✅ All services communicate correctly
✅ Data persists across requests
✅ User receives appropriate responses

---

## Part 7: Frontend Testing

### Test 7.1: Start Admin App

```bash
cd apps/admin-app
npm install
npm start
```

**Access:** http://localhost:3001 (or configured port)

---

### Test 7.2: Admin Login UI

1. Navigate to admin app
2. Enter admin credentials:
   - Username: `admin1`
   - Password: `admin123`
3. Click Login

**✅ Pass Criteria:**
- Login successful
- Redirected to dashboard or flight form

---

### Test 7.3: Add Flight via UI

1. Fill out flight form:
   - From City: Ankara
   - To City: Antalya
   - Flight Date: (select future date)
   - Flight Code: TK111
   - Duration: 75
   - Capacity: 190
2. Click "Predict Price" button
3. Verify price is populated (mock: 5000)
4. Click "Save" or "Add Flight"

**✅ Pass Criteria:**
- Success message displayed
- Form clears
- No errors in console

---

### Test 7.4: Verify Flight Added

```bash
curl "http://localhost:3000/api/v1/flights/flights?fromCity=Ankara&toCity=Antalya&flightDate=2026-02-20"
```

**✅ Pass Criteria:**
- New flight appears in search results

---

### Test 7.5: User App Testing

```bash
cd apps/user-app
npm install
npm start
```

1. Search for flights
2. Select a flight
3. Enter passenger details
4. Complete booking

**✅ Pass Criteria:**
- UI works smoothly
- API calls successful
- Booking confirmed

---

## Part 8: Advanced Feature Testing

### Test 8.1: Partner Airlines Add Miles

**Postman Request:**
- Method: `POST`
- URL: `http://localhost:3000/api/v1/iam/partners/add-miles`
- Headers:
  - `Content-Type: application/json`
  - `x-api-key: partner-api-key-12345`
- Body:

```json
{
  "milesNumber": "MS1704902400000",
  "points": 500
}
```

**Using curl:**
```bash
curl -X POST http://localhost:3000/api/v1/iam/partners/add-miles \
  -H "Content-Type: application/json" \
  -H "x-api-key: partner-api-key-12345" \
  -d '{
    "milesNumber": "MS1704902400000",
    "points": 500
  }'
```

**Expected Response:**
```json
{
  "message": "Successfully added 500 points to user admin1."
}
```

**✅ Pass Criteria:**
- Status: 200 OK
- Points added successfully

---

### Test 8.2: Invalid API Key

**Postman Request:**
- Same as 8.1 but with wrong API key
- Header: `x-api-key: wrong-key`

**Expected Response:**
```
Unauthorized: Invalid API Key
```

**✅ Pass Criteria:**
- Status: 401 Unauthorized

---

### Test 8.3: Concurrent Bookings (Race Condition Test)

This tests database locking to prevent overselling.

**Setup:** Create a flight with capacity 1

**Test:** Try to book 2 passengers simultaneously

**Expected:** One succeeds, one fails with "Not enough capacity"

**✅ Pass Criteria:** Pessimistic locking prevents overselling

---

### Test 8.4: Error Handling - Invalid Data

**Test Invalid Email:**
```bash
curl -X POST http://localhost:3000/api/v1/iam/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test",
    "password": "test",
    "email": "",
    "role": "user"
  }'
```

**✅ Pass Criteria:**
- Error message returned
- No crash

---

**Test Invalid Flight Date:**
```bash
curl -X POST http://localhost:3000/api/v1/flights/flights \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "fromCity": "Istanbul",
    "toCity": "Izmir",
    "flightDate": "invalid-date",
    "flightCode": "TK123",
    "price": 500,
    "duration": 90,
    "capacity": 180
  }'
```

**✅ Pass Criteria:** Graceful error handling

---

### Test 8.5: Service Resilience

**Stop Flight Service:**
```bash
docker-compose stop flight-service
```

**Try to search flights:**
```bash
curl "http://localhost:3000/api/v1/flights/flights?fromCity=Istanbul&toCity=Izmir&flightDate=2026-02-15"
```

**Expected Response:**
```json
{
  "message": "Flight Service Unavailable",
  "error": "..."
}
```

**✅ Pass Criteria:**
- API Gateway returns proper error
- System doesn't crash

**Restart service:**
```bash
docker-compose start flight-service
```

---

## Troubleshooting

### Issue: "ECONNREFUSED" errors

**Cause:** Service not running or wrong port

**Solution:**
```bash
# Check if services are running
docker-compose ps

# Restart all services
docker-compose down
docker-compose up --build
```

---

### Issue: Email not sending

**Cause:** Gmail credentials incorrect or App Password not set

**Solution:**
1. Verify Gmail App Password is 16 digits
2. Check .env file has correct credentials
3. Enable "Less secure app access" (if not using App Password)
4. Check spam folder

**Test SMTP directly:**
```bash
curl -X POST http://localhost:3003/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "your-email@gmail.com",
    "subject": "Direct Test",
    "text": "Testing direct to service"
  }'
```

---

### Issue: Database connection failed

**Cause:** PostgreSQL not running or wrong credentials

**Solution:**
```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Restart PostgreSQL
docker-compose restart postgres

# Check logs
docker-compose logs postgres
```

---

### Issue: JWT token expired

**Cause:** Tokens expire after 1 hour

**Solution:**
1. Login again to get new token
2. Update Authorization header with new token

---

### Issue: "Role is not admin" error

**Cause:** Using regular user token for admin endpoint

**Solution:**
- Ensure you're using ADMIN_TOKEN for admin operations
- Verify user role in database:
  ```bash
  curl http://localhost:3000/api/v1/iam/users/1
  ```

---

### Issue: Build errors

**Solution:**
```bash
# Clean and rebuild
cd services/<service-name>
rm -rf node_modules dist
npm install
npm run build
```

---

### Issue: Port already in use

**Solution:**
```bash
# Find process using port
lsof -i :3000  # (or :3001, :3002, etc.)

# Kill process
kill -9 <PID>

# Or change port in .env
```

---

## Success Criteria Checklist

Use this checklist to verify 100/100 score compliance:

### Functional Requirements ✅

- [ ] **Add Flights**
  - [ ] Admin users can add flights
  - [ ] Role-based access control works
  - [ ] ML price prediction endpoint exists
  - [ ] All flight attributes saved correctly

- [ ] **Search Flights**
  - [ ] Search by airport works
  - [ ] Search by date works
  - [ ] Search by number of passengers works
  - [ ] Pagination implemented
  - [ ] Results sorted correctly

- [ ] **Buy Ticket**
  - [ ] Capacity reduces on booking
  - [ ] Miles&Smiles login works
  - [ ] Purchase with points works
  - [ ] New member registration works
  - [ ] Welcome email sent
  - [ ] Transactions handled correctly

- [ ] **Add Miles**
  - [ ] Nightly process runs (scheduler)
  - [ ] Partner API authenticated
  - [ ] Miles awarded correctly
  - [ ] Email notifications sent

### Non-Functional Requirements ✅

- [ ] **Architecture**
  - [ ] 5 separate microservices
  - [ ] API Gateway routing all requests
  - [ ] Services communicate via HTTP

- [ ] **IAM**
  - [ ] JWT authentication implemented
  - [ ] No local authentication
  - [ ] Tokens expire correctly

- [ ] **REST APIs**
  - [ ] All endpoints RESTful
  - [ ] Proper HTTP methods (GET, POST, PUT, DELETE)
  - [ ] Status codes correct

- [ ] **API Versioning**
  - [ ] All endpoints under /api/v1/*
  - [ ] Version in URL path

- [ ] **Pagination**
  - [ ] Flight search supports page/limit
  - [ ] Response includes pagination metadata

- [ ] **Email**
  - [ ] Gmail SMTP configured
  - [ ] Welcome emails work
  - [ ] Notification emails work

- [ ] **Scheduler**
  - [ ] Cron jobs running
  - [ ] Award miles process works

- [ ] **Database**
  - [ ] PostgreSQL (not SQLite)
  - [ ] Data persists correctly

- [ ] **Docker**
  - [ ] All 5 services have Dockerfiles
  - [ ] Docker Compose works
  - [ ] Services build successfully

### Documentation ✅

- [ ] **README.md**
  - [ ] Architecture diagram included
  - [ ] ER diagram included
  - [ ] Design decisions documented
  - [ ] Assumptions stated
  - [ ] Issues encountered listed
  - [ ] Deployment guide included
  - [ ] API documentation complete

### Code Quality ✅

- [ ] **TypeScript**
  - [ ] All services use TypeScript
  - [ ] No compilation errors
  - [ ] Proper types used

- [ ] **Error Handling**
  - [ ] Try-catch blocks present
  - [ ] Meaningful error messages
  - [ ] No unhandled exceptions

- [ ] **Security**
  - [ ] Passwords hashed (bcrypt)
  - [ ] JWT secrets configured
  - [ ] API keys for partners

---

## Final Verification Commands

Run these commands for final verification:

```bash
# 1. Check all services are running
curl http://localhost:3000  # API Gateway
curl http://localhost:3001  # Flight Service
curl http://localhost:3002  # IAM Service
curl http://localhost:3003  # Notification Service

# 2. Verify database
docker exec -it airline-postgres psql -U postgres -d airline_db -c "SELECT * FROM flight LIMIT 5;"

# 3. Check Docker builds
docker-compose build

# 4. Verify TypeScript compilation
cd services/api-gateway && npm run build
cd ../flight-service && npm run build
cd ../iam-service && npm run build
cd ../notification-service && npm run build
cd ../scheduler-service && npm run build

# 5. Check git status
git status
```

---

## Test Report Template

After completing all tests, create a report:

```markdown
# Test Report - Airline Ticketing System

**Date:** YYYY-MM-DD
**Tester:** Your Name

## Summary
- Total Tests: XX
- Passed: XX
- Failed: XX
- Pass Rate: XX%

## Test Results

### IAM Service
- [✅/❌] User Registration
- [✅/❌] User Login
- [✅/❌] JWT Authentication
- [✅/❌] Points Management

### Flight Service
- [✅/❌] Add Flights
- [✅/❌] Search Flights
- [✅/❌] Pagination
- [✅/❌] Book Flights

### Notification Service
- [✅/❌] Send Emails
- [✅/❌] Welcome Emails

### Scheduler Service
- [✅/❌] Cron Jobs
- [✅/❌] Award Miles

### Integration
- [✅/❌] End-to-End Flow
- [✅/❌] Service Communication

## Issues Found
1. Issue description
2. Issue description

## Recommendations
1. Recommendation
2. Recommendation
```

---

## Next Steps After Testing

1. **Fix any failed tests**
2. **Document any changes**
3. **Record demo video** (5 minutes max)
4. **Deploy to cloud** (for bonus +20 points)
5. **Update README** with deployed URLs
6. **Submit to instructor**

---

## Postman Collection

For easier testing, import this Postman collection:

**Create file:** `Airline-API-Tests.postman_collection.json`

```json
{
  "info": {
    "name": "Airline Ticketing System",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "IAM Service",
      "item": [
        {
          "name": "Register Admin",
          "request": {
            "method": "POST",
            "header": [{"key": "Content-Type", "value": "application/json"}],
            "url": "http://localhost:3000/api/v1/iam/register",
            "body": {
              "mode": "raw",
              "raw": "{\"username\":\"admin1\",\"password\":\"admin123\",\"email\":\"admin@test.com\",\"role\":\"admin\"}"
            }
          }
        },
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "header": [{"key": "Content-Type", "value": "application/json"}],
            "url": "http://localhost:3000/api/v1/iam/login",
            "body": {
              "mode": "raw",
              "raw": "{\"username\":\"admin1\",\"password\":\"admin123\"}"
            }
          }
        }
      ]
    }
  ]
}
```

---

**You now have a complete testing guide! Follow each test systematically to verify your project earns 100/100.** 🎉

**Good luck with your SE4458 final project!**
