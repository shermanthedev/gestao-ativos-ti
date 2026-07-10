#!/bin/sh
set -e

echo "Waiting for database to be available..."
node ./wait-for-db.js

echo "Running Prisma migrations (if any)..."
# Try to apply migrations. If migrations depend on a manual step, this can be adjusted.
if npx prisma migrate deploy; then
  echo "Migrations applied"
else
  echo "Migrations failed or none applied — continuing to start the server"
fi

echo "Starting server"
npm run start
