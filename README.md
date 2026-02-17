# MockVion

AI Powered Mock Interview Platform

## 📌 Tech Stack

- Frontend: React (Vite)
- Backend: Node.js, Express , Gen AI 
- Database: MongoDB
- Image Storage: Cloudinary

---

## 🚀 How to Run the Project

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/duttaisha2003/MockVion.git
cd MockVion
```

---

## 🔧 Backend Setup

```bash
cd backend
npm install
nodemon server.js
```

If nodemon is not installed:

```bash
npm install -g nodemon
```

Backend runs on:
```
http://localhost:5000
```

---

## 💻 Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:
```
http://localhost:3000
```

---

## 🔐 Environment Variables

Create a `.env` file inside `backend/` and add:

```
PORT=5000
DB_CONNECTION=your_mongodb_connection
GROQ_API_KEY=
JWT_KEY=your_secret_key

CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```
Create a `.env` file inside `frontend/` and add:
VITE_BACKEND_URL="http://localhost:5000/"
---

## 👩‍💻 Author

Duttaisha
