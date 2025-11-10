# Real-Time Chat Application

A full-stack real-time chat application built with Node.js, Express, MongoDB, Socket.IO, React, and TypeScript.

## Features

### Backend
-  User Authentication (JWT)
-  User CRUD Operations with Authorization
-  Real-time messaging with Socket.IO
-  Chat history persistence in MongoDB
-  Total chat count and user statistics
-  Protected API routes
-  TypeScript support

### Frontend
-  Real-time message updates
-  User join/leave notifications
-  Responsive UI with Tailwind CSS
-  Message history display
-  Chat statistics (total users, messages)
-  Authentication flow (Login/Register)
-  TypeScript support

##  Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB & Mongoose
- Socket.IO
- TypeScript
- JWT (jsonwebtoken)
- bcryptjs

### Frontend
- React
- TypeScript
- Tailwind CSS
- Socket.IO Client
- Axios
- Vite

##  Project Structure

<div style="display: flex; gap: 20px; justify-content: center;">
  <img src="https://github.com/user-attachments/assets/fcecf375-eba6-49dc-8c58-3e27e0bc5a1a" width="283" height="754" alt="Chat Screenshot 1" />
  <img src="https://github.com/user-attachments/assets/3495b1b2-74dc-4ea5-8a55-975aba93733c" width="282" height="873" alt="Chat Screenshot 2" />
</div>


##  Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (running locally or MongoDB Atlas account)
- npm or yarn

### Backend Setup

1. **Navigate to backend directory**
```bash
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create environment file**
```bash
cp .env
```

4. **Configure .env file**
```env
PORT=5000
MongoDB_URI=mongodb+srv://awasthi12:navraj1234@cluster0.1v0nuq2.mongodb.net/?appName=Cluster0
JWT_SECRET=bfafwbk465434556273@#%%^(*(&^%))__)__+:>"?LPP>:PLhfsagj.''/[[.'65533]]"2325ihusalkl
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

5. **Start MongoDB**
```bash
# use MongoDB Atlas connection string in .env
```

6. **Run the backend**
```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

Backend will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create environment file**
```bash
cp .env
```

4. **Configure .env file**
```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

5. **Run the frontend**
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`


##  Testing the Application

1. **Register a new account**
   - Open `http://localhost:5173`
   - Click "Register"
   - Fill in username, email, and password

2. **Login**
   - Enter your credentials
   - You'll be redirected to the chat interface

3. **Send messages**
   - Type in the input box at the bottom
   - Press "Send" or hit Enter

4. **Test real-time features**
   - Open another browser/incognito window
   - Register/login with a different account
   - Send messages and see them appear in real-time

##  npm Scripts

### Backend
```bash
npm run dev      # Start development server with nodemon
npm run build    # Build TypeScript to JavaScript
npm start        # Run production build
```

### Frontend
```bash
npm run dev      # Start Vite development server
npm run build    # Build for production
npm run preview  # Preview production build
```

##  License

This project is open source and available under the MIT License.

##  Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

##  Support

For support, please open an issue in the repository.

---










