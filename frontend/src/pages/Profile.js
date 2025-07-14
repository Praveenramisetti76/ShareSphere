import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

const Profile = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchItems = async () => {
      if (!user?._id) return;
      setLoading(true);
      setError('');
      try {
        const res = await api.get(`/api/items/user/${user._id}`);
        setItems(res.data.items);
      } catch (err) {
        setError('Failed to load your items');
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">My Profile</h1>
          <p className="text-gray-600">This page shows your profile and your item history.</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">My Items</h2>
          {loading ? (
            <div>Loading...</div>
          ) : error ? (
            <div className="text-red-600">{error}</div>
          ) : items.length === 0 ? (
            <div className="text-gray-500">You have not created any items yet.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {items.map((item) => (
                <div key={item._id} className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                  <div className="aspect-w-16 aspect-h-9 bg-gray-200 mb-2">
                    {item.images && item.images[0] ? (
                      <img src={item.images[0]} alt={item.title} className="w-full h-32 object-cover rounded" />
                    ) : (
                      <div className="w-full h-32 flex items-center justify-center text-gray-400">No image</div>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 truncate">{item.title}</h3>
                  <div className="text-sm text-gray-500 mb-1">{item.category} | {item.condition}</div>
                  <div className="text-sm text-gray-500 mb-1">{item.price > 0 ? `$${item.price}` : 'Free'}</div>
                  <div className="text-xs text-gray-400 mb-1">Uploaded: {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}</div>
                  {item.quantity && <div className="text-xs text-gray-500 mb-1">Quantity: {item.quantity}</div>}
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-1">
                      {item.tags.map((tag, idx) => (
                        <span key={idx} className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs">{tag}</span>
                      ))}
                    </div>
                  )}
                  <div className="text-xs text-gray-500">Status: {item.status}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile; 