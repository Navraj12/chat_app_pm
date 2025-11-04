# Real-Time Chat Application

A full-stack real-time chat application built with Node.js, Express, MongoDB, Socket.IO, React, and TypeScript.

## 📋 Features

### Backend
- ✅ User Authentication (JWT)
- ✅ User CRUD Operations with Authorization
- ✅ Real-time messaging with Socket.IO
- ✅ Chat history persistence in MongoDB
- ✅ Total chat count and user statistics
- ✅ Protected API routes
- ✅ TypeScript support

### Frontend
- ✅ Real-time message updates
- ✅ User join/leave notifications
- ✅ Responsive UI with Tailwind CSS
- ✅ Message history display
- ✅ Chat statistics (total users, messages)
- ✅ Authentication flow (Login/Register)
- ✅ TypeScript support

## 🛠️ Tech Stack

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

## 📁 Project Structure

```
chat-application/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.ts
│   │   ├── controllers/
│   │   │   ├── authController.ts
│   │   │   ├── userController.ts
│   │   │   └── chatController.ts
│   │   ├── middleware/
│   │   │   └── authMiddleware.ts
│   │   ├── models/
│   │   │   ├── User.ts
│   │   │   └── Message.ts
│   │   ├── routes/
│   │   │   ├── authRoutes.ts
│   │   │   ├── userRoutes.ts
│   │   │   └── chatRoutes.ts
│   │   ├── socket/
│   │   │   └── socketHandler.ts
│   │   └── server.ts
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Chat.tsx
    │   │   ├── MessageList.tsx
    │   │   ├── MessageInput.tsx
    │   │   ├── Login.tsx
    │   │   └── Register.tsx
    │   ├── context/
    │   │   └── AuthContext.tsx
    │   ├── services/
    │   │   └── api.ts
    │   ├── types/
    │   │   └── index.ts
    │   ├── App.tsx
    │   ├── main.tsx
    │   └── index.css
    ├── .env.example
    ├── .gitignore
    ├── package.json
    └── tsconfig.json
```

## 🚀 Getting Started

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
cp .env.example .env
```

4. **Configure .env file**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/chatapp
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

5. **Start MongoDB**
```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas connection string in .env
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
cp .env.example .env
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

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |

### Users
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/users` | Get all users | Yes |
| GET | `/api/users/:id` | Get user by ID | Yes |
| PUT | `/api/users/:id` | Update user | Yes |
| DELETE | `/api/users/:id` | Delete user | Yes |

### Chat
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/chat/messages` | Get message history | Yes |
| GET | `/api/chat/stats` | Get chat statistics | Yes |

## 🔌 Socket Events

### Client → Server
- `join` - User joins chat room
- `message` - Send a message

### Server → Client
- `user_joined` - Notification when user joins
- `user_left` - Notification when user leaves
- `message` - Receive new message
- `user_count` - Update active user count

## 🧪 Testing the Application

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

## 📦 npm Scripts

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

## 🔒 Security Notes

- Always change `JWT_SECRET` in production
- Use HTTPS in production
- Implement rate limiting for API endpoints
- Validate and sanitize all user inputs
- Use environment variables for sensitive data
- Never commit `.env` files to version control

## 🐛 Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Start MongoDB
sudo systemctl start mongod
```

### Port Already in Use
```bash
# Kill process on port 5000 (backend)
lsof -ti:5000 | xargs kill -9

# Kill process on port 5173 (frontend)
lsof -ti:5173 | xargs kill -9
```

### CORS Issues
- Ensure `FRONTEND_URL` in backend `.env` matches frontend URL
- Check CORS configuration in `server.ts`

## 📝 Environment Variables

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/chatapp
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

## 🎯 Future Enhancements

- [ ] Private messaging
- [ ] Message reactions
- [ ] File/image uploads
- [ ] User presence indicators
- [ ] Typing indicators
- [ ] Message search
- [ ] User profiles
- [ ] Chat rooms/channels
- [ ] Message editing/deletion
- [ ] Push notifications

## 📄 License

This project is open source and available under the MIT License.

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For support, please open an issue in the repository.

---

Made with ❤️ using Node.js, React, and Socket.IO
