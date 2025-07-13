import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Browse from './pages/Browse';
import ItemDetail from './pages/ItemDetail';
import CreateItem from './pages/CreateItem';
import Profile from './pages/Profile';
import Messages from './pages/Messages';
import UserProfile from './pages/UserProfile';
import NotFound from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/item/:id" element={<ItemDetail />} />
          <Route path="/user/:id" element={<UserProfile />} />
          
          {/* Protected Routes */}
          <Route path="/create" element={
            <ProtectedRoute>
              <CreateItem />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/messages" element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          } />
          <Route path="/messages/:userId/:itemId" element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </AuthProvider>
  );
}

export default App; 