#!/bin/bash

# Stop script on first error
set -e

echo "--------------------------------------------------"
echo "🚀 ShipFlow Automated Deployment"
echo "--------------------------------------------------"

# 1. Update Codebase
echo ">> 📦 Pulling latest changes from Git..."
git pull origin main

# 2. Update Backend
echo ">> 🛠️ Updating Server (Backend)..."
cd server
npm install
echo "   - Generating Prisma Client..."
npx prisma generate
echo "   - Syncing Database Schema..."
npx prisma db push --accept-data-loss
echo "   - Building & Recreating Backend Service..."
npm run build
pm2 delete shipflow-backend || true
pm2 start dist/index.js --name shipflow-backend
cd ..

# 3. Update Frontend
echo ">> 🎨 Updating Client (Frontend)..."
cd client
npm install
echo "   - Building React App..."
npm run build

# 4. Publish Frontend (No copy needed if Nginx points to dist directly)
echo ">> 🚀 Frontend Build Complete!"
echo "   Since Nginx is serving directly from 'client/dist', changes are live immediately."

cd ..

echo ""
echo "--------------------------------------------------"
echo "✅ DEPLOYMENT COMPLETE!"
echo "--------------------------------------------------"