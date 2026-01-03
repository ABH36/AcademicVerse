# AcademicVerse Server

A Node.js server for the AcademicVerse application.

## Setup

1. Ensure you have Node.js installed.
2. Ensure MongoDB is running locally on port 27017, or update the `MONGO_URI` in `.env`.
3. Run `npm install` to install dependencies.
4. Run `npm start` to start the server.

## Development

Use `npm run dev` for development with nodemon (if installed).

## Structure

- `config/db.js`: Database connection
- `models/User.js`: User schema
- `utils/logger.js`: Logging utility
- `server.js`: Main entry point

## Troubleshooting

- If MongoDB connection fails, check if MongoDB is running.
- Ensure the `.env` file has correct values.
- Check logs in `audit.log` for errors.