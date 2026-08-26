# Store Rating Application

A full-stack web application built for managing and submitting store ratings. This project includes role-based access control, advanced filtering, and a fully responsive user interface.

## Tech Stack
* **Backend:** Node.js, Express.js
* **Database:** MySQL (managed via Prisma ORM)
* **Frontend:** React (Vite), Tailwind CSS

## Prerequisites
* Node.js (v16+)
* MySQL Server running locally

## Backend Setup
1. Open a terminal in the `backend` directory.
2. Run `npm install` to install dependencies.
3. Rename `.env.example` to `.env` and update your `DATABASE_URL` with your MySQL credentials.
4. Run `npx prisma migrate dev --name init` to create the database schema.
5. Run `npx prisma generate` to generate the Prisma client.
6. Run `npm run seed` (or `node src/seed.js`) to create the initial System Administrator account.
7. Run `npm start` (or `node src/index.js`) to start the API server on port 3000.

## Frontend Setup
1. Open a new terminal in the `frontend` directory.
2. Run `npm install` to install dependencies.
3. Run `npm run dev` to start the React development server.
4. Open the displayed local URL (usually `http://localhost:5173`) in your browser.

## Default Credentials
After running the seed script, you can log in as the System Administrator:
* **Email:** admin@system.com
* **Password:** Admin@123

## Design Decisions
* **Prisma ORM:** Chosen over raw SQL/mysql2 for robust schema management and to prevent SQL injection vulnerabilities out-of-the-box.
* **Debounced Searching:** Added a 300ms debounce to the search filters to optimize API calls and reduce server load.
* **JWT Authentication:** Implemented standard stateless authentication for security and scalability.
