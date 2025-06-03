# 🚌 Route Rider

[![Vercel Deployment](https://img.shields.io/badge/Live%20Demo-Vercel-blue?logo=vercel)](https://devops-bus-tracker-app.vercel.app/)

**Route Rider** is a full-stack web application that tracks bus routes, stops, and public messages in real time. Built with Node.js and TypeScript on the backend and deployed via Vercel, it's designed for speed, reliability, and developer extensibility.

---

## 🌍 Live Demo

🔗 **[Visit the deployed app](https://devops-bus-tracker-app.vercel.app/)**

---

## 📁 Project Structure

route_rider-main/
├── backend/ # Backend (Node.js + Express + MongoDB)
│ ├── controllers/ # Handles business logic
│ ├── model/ # Mongoose schemas (User, Stop, Message)
│ ├── route/ # Express routes
│ ├── database/ # MongoDB connection setup
│ ├── types/ # Custom TypeScript types
│ ├── server.ts # Main entry point for backend server
│ └── package.json # Backend dependencies and scripts
├── .github/ # GitHub Actions workflows
├── .vite/ # Vite-related frontend files (likely React/Vue)
├── README.md # Project documentation
├── BACKEND_README.md # Backend-specific documentation
└── .gitignore # Git ignored files


---

## 🚀 Features

- 🧭 Real-time transport stop and route tracking
- 👥 User registration and login endpoints
- 📬 Public message posting and viewing
- 🔐 Modular REST APIs with TypeScript and Express
- ☁️ Fully deployed with Vercel

---

## ⚙️ Tech Stack

### Backend
- Node.js
- Express
- TypeScript
- MongoDB (Mongoose)

### Frontend *(Deployed via Vercel)*
- Likely powered by Vite (React, Vue, or similar)

---

## 🛠️ Installation Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/route_rider.git
cd route_rider-main/backend
npm install

PORT=5000
MONGO_URI= MONGODB_URL

npm run dev

cd ../frontend
npm install
npm run dev


