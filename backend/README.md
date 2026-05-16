# Glamio Backend

Backend API for the Glamio project.

## Prerequisites

- Node.js 18+ or 20+
- PostgreSQL
- A Firebase service account if you want to use Google sign-in
- A Cloudinary account if you want image upload APIs to work

## Local Setup

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Create a `.env` file

Create `backend/.env` with values like this:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=replace-with-a-strong-secret

FRONTEND_URL_LOCAL=http://localhost:3000
FRONTEND_URL_PROD=http://localhost:3000

DATABASE_URL_LOCAL=postgresql://postgres:postgres@localhost:5432/glamio
DATABASE_URL_PROD=postgresql://postgres:postgres@localhost:5432/glamio

CLOUDINARY_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=your-firebase-client-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

Notes:

- `DATABASE_URL_LOCAL` is used by the running app.
- `DATABASE_URL_PROD` is currently used by `drizzle.config.js` for migration commands too, so for local development set `DATABASE_URL_PROD` to the same local database unless you change the config.
- If you do not plan to use Google sign-in immediately, you can still use the normal signup endpoint, but the Firebase config is still loaded on server startup, so keep those env vars present.
- Cloudinary is required for endpoints that upload images from base64/URL strings, such as service and expert creation.

### 3. Create the database

Create a PostgreSQL database, for example:

```sql
CREATE DATABASE glamio;
```

### 4. Run migrations

```bash
npm run db:migrate
```

This applies the Drizzle migrations from [drizzle/migrations](/C:/Users/assim.s/Documents/glamio-web-final/backend/drizzle/migrations).

### 5. Seed base lookup data

```bash
npm run seed
```

This inserts:

- user types
- appointment statuses
- notification types

### 6. Insert demo booking data

Optional demo data for local testing is available in [src/db/seed-booking-demo.sql](/C:/Users/assim.s/Documents/glamio-web-final/backend/src/db/seed-booking-demo.sql:1).

Run it with `psql`:

```bash
psql "postgresql://postgres:postgres@localhost:5432/glamio" -f src/db/seed-booking-demo.sql
```

The demo script inserts:

- 1 shop owner user
- 1 customer user
- 1 demo shop
- 4 demo services
- 2 demo experts
- expert-to-service mappings
- slots
- 1 sample multi-service appointment

### 7. Start the server

Development:

```bash
npm run dev
```

Production-style local run:

```bash
npm start
```

Health check:

```bash
GET http://localhost:5000/health
```

## Authentication Notes

- Protected APIs expect the JWT token in the `Authorization` header.
- The backend expects the raw token value, not `Bearer <token>`.
- You can get a token from:
  - `POST /api/v1/auth/signup`
  - `POST /api/v1/auth/signin/google`

## Postman Import

Import these files into Postman:

- Collection: [postman/Glamio Backend.postman_collection.json](/C:/Users/assim.s/Documents/glamio-web-final/backend/postman/Glamio%20Backend.postman_collection.json)
- Environment: [postman/Glamio Local.postman_environment.json](/C:/Users/assim.s/Documents/glamio-web-final/backend/postman/Glamio%20Local.postman_environment.json)

Suggested flow after import:

1. Import the environment and select it.
2. Run `Auth > Sign Up`.
3. Copy the `token` from the response into the Postman environment variable `token`.
4. Call protected shop-owner APIs like `Shops`, `Services`, `Experts`, and `Slots`.
5. Use the public `Customer` folder for browse-and-book flows.

## API Coverage Included In Postman

The collection includes example requests for:

- Auth
- Shops
- Services
- Experts
- Offers
- Slots
- Appointments
- Customer APIs
- Notifications

## Important Current Behaviors

- Multi-service booking is supported in the backend via `serviceIds`.
- Expert filtering for the customer flow supports `GET /api/v1/customer/experts/:shopId?serviceIds=1,2`.
- Booking validation ensures the selected expert is mapped to all requested services.
- `POST /api/v1/user` exists in routes but is not implemented.
- Notification read uses this full path:
  - `PATCH /api/v1/notifications/notifications/:id/read`

## Quick Smoke Test

If you want a fast local test after setup:

1. Run migrations.
2. Run `npm run seed`.
3. Execute `src/db/seed-booking-demo.sql`.
4. Import the Postman collection and environment.
5. Set `shopId=1`, `serviceId=1`, `expertId=1`, `slotId=1` if your fresh local DB starts IDs from 1.
6. Test:
   - `Customer > Get Shops`
   - `Customer > Get Shop By Id`
   - `Customer > Get Experts By Shop And Services`
   - `Customer > Get Slots By Shop`
   - `Customer > Get Order Summary`
   - `Customer > Create Booking`

