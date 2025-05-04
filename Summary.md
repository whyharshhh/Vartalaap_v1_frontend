# 🧠 Real-Time Chat App – Project Summary

## ✅ Overview

I built a full-stack real-time chat application that allows users to:
- ✅ Sign up and log in securely
- 💬 Send and receive one-to-one real-time messages
- 🟢 See online/offline status of users
- 📸 Share images via messages
- ⚙️ Update their profile information

---

## 💻 Frontend (React + Vite)

- Built with **React**, bundled via **Vite** for faster development.
- **Tailwind CSS** + **DaisyUI** used for styling responsive and elegant UI.
- **Zustand** used for lightweight global state management.
- **Socket.IO Client** used to handle:
  - Real-time messaging
  - Online user tracking
- **Axios** setup to use `withCredentials` for secure cookie-based authentication.

---

## 🛠 Backend (Node.js + Express)

- Developed RESTful APIs for:
  - Authentication (`/auth`)
  - Messaging (`/messages`)
- Auth system:
  - Uses **JWT** tokens stored in **HTTP-only cookies** for security.
  - Middleware (`protectRoute`) checks for token and user validity.
- Real-time messaging:
  - Powered by **Socket.IO**
  - Maintains active user list and emits real-time message events
- **MongoDB** with **Mongoose** is used for storing users and chat messages.
- Images are uploaded via **Cloudinary**.

---

## ☁️ Deployment

- **Frontend**: Deployed on **Vercel**  
- **Backend**: Deployed on **Render**
- Environment setup:
  - `NODE_ENV`, `CLIENT_URL`, `JWT_SECRET`, `CLOUDINARY` variables
  - `CORS` configured for secure cross-origin communication
  - Cookie settings like `httpOnly`, `secure`, and `sameSite` for security in production

---

## ⚠️ Challenges & Key Takeaways

- ✅ Solved token mismatch and unauthorized issues by correctly configuring **cookies** and **CORS**.
- ✅ Fixed online users display issue by properly syncing socket events and user state.
- ✅ Handled deployment issues related to path resolution and static file serving.
- ✅ Strengthened knowledge in:
  - Secure authentication using cookies
  - Real-time WebSocket communication
  - Full-stack debugging in deployed environments

---

## 💬 Use This Summary To Answer

> "Tell me about a project you've worked on recently?"

With this app, I can confidently talk about full-stack real-time systems, state management, authentication, deployment challenges, and production-readiness.

---

