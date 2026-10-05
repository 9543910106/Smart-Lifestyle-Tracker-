@echo off
cd backend
start cmd /k "node server.js"
cd ../frontend
start cmd /k "npm run dev"

