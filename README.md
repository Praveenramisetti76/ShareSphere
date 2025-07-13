# ShareSphere - Community-Driven Sharing Platform

ShareSphere is a full-stack MERN application that connects people who want to share items they no longer need with those who can benefit from them. The platform promotes conscious reuse, peer-to-peer support, and sustainable community building.

## 🌟 Features

### Core Functionality
- **User Authentication**: Secure registration and login with JWT tokens
- **Item Management**: Create, edit, and manage item listings
- **Search & Filter**: Advanced search with category, condition, and location filters
- **Messaging System**: Built-in messaging for item inquiries and arrangements
- **User Profiles**: Comprehensive user profiles with ratings and statistics
- **Responsive Design**: Mobile-first design that works on all devices

### Sharing Options
- **Give Away**: Free items for community members
- **Sell**: Items available for purchase
- **Keep Until Needed**: Reserve items for future use

### Community Features
- **User Ratings**: Rate and review other community members
- **Donation Tracking**: Track charitable contributions
- **Location-Based**: Connect with local community members
- **Sustainability Metrics**: Track environmental impact

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Express Validator** for input validation
- **Helmet** for security headers
- **Rate Limiting** for API protection

### Frontend
- **React 18** with functional components and hooks
- **React Router** for navigation
- **React Query** for server state management
- **React Hook Form** for form handling
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Framer Motion** for animations

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account (or local MongoDB)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sharesphere
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Environment Setup**
   
   Create a `.env` file in the `backend` directory:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_jwt_secret_key
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   NODE_ENV=development
   ```

4. **Start the development servers**
   ```bash
   npm run dev
   ```

   This will start both the backend (port 5000) and frontend (port 3000) servers.

### MongoDB Atlas Setup

1. Create a MongoDB Atlas account at [mongodb.com](https://mongodb.com)
2. Create a new cluster
3. Get your connection string
4. Replace `your_mongodb_atlas_connection_string` in the `.env` file

### Optional: Cloudinary Setup (for image uploads)

1. Create a Cloudinary account at [cloudinary.com](https://cloudinary.com)
2. Get your cloud name, API key, and API secret
3. Add them to the `.env` file

## 📁 Project Structure

```
sharesphere/
├── backend/
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   ├── server.js        # Express server
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── contexts/    # React contexts
│   │   ├── pages/       # Page components
│   │   ├── utils/       # Utility functions
│   │   └── App.js       # Main app component
│   └── package.json
└── package.json         # Root package.json
```

## 🔧 Available Scripts

### Root Level
- `npm run dev` - Start both frontend and backend in development mode
- `npm run server` - Start only the backend server
- `npm run client` - Start only the frontend development server
- `npm run install-all` - Install dependencies for all packages
- `npm run build` - Build the frontend for production

### Backend
- `npm run dev` - Start backend with nodemon
- `npm start` - Start backend in production mode

### Frontend
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/password` - Change password

### Items
- `GET /api/items` - Get all items with filters
- `POST /api/items` - Create new item
- `GET /api/items/:id` - Get item by ID
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item
- `POST /api/items/:id/like` - Toggle like on item
- `POST /api/items/:id/interest` - Express interest in item

### Users
- `GET /api/users/:id` - Get user profile
- `GET /api/users/:id/items` - Get user's items
- `GET /api/users/:id/stats` - Get user statistics
- `GET /api/users/search` - Search users
- `POST /api/users/:id/rate` - Rate a user

### Messages
- `POST /api/messages` - Send a message
- `GET /api/messages/conversations` - Get user conversations
- `GET /api/messages/conversation/:userId/:itemId` - Get conversation
- `GET /api/messages/unread` - Get unread count
- `PUT /api/messages/:id/read` - Mark message as read

## 🎨 UI Components

The application uses a modern, responsive design with:
- **Tailwind CSS** for utility-first styling
- **Custom color palette** with primary, secondary, success, warning, and error colors
- **Responsive grid system** for all screen sizes
- **Interactive components** with hover states and transitions
- **Accessibility features** with proper ARIA labels and keyboard navigation

## 🔒 Security Features

- **JWT Authentication** with secure token storage
- **Password Hashing** using bcryptjs
- **Input Validation** with express-validator
- **Rate Limiting** to prevent abuse
- **Security Headers** with Helmet
- **CORS Configuration** for cross-origin requests
- **Environment Variables** for sensitive data

## 🚀 Deployment

### Backend Deployment (Heroku)
1. Create a Heroku account
2. Install Heroku CLI
3. Create a new Heroku app
4. Set environment variables in Heroku dashboard
5. Deploy using Git

### Frontend Deployment (Vercel/Netlify)
1. Build the frontend: `npm run build`
2. Deploy the `build` folder to your preferred platform
3. Set environment variables for API URL

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- MongoDB Atlas for database hosting
- Cloudinary for image storage
- The React and Node.js communities for excellent documentation
- All contributors and users of ShareSphere

## 📞 Support

For support, email support@sharesphere.com or create an issue in the repository.

---

**ShareSphere** - Building sustainable communities through conscious sharing. 🌱 