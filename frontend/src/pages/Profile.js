import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

const emptyEditItem = {
  _id: '', title: '', description: '', price: '', location: '', quantity: 1, category: '', condition: '', tags: [], sharingType: '', images: []
};

const Profile = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editItem, setEditItem] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState('');
  const [showConfirm, setShowConfirm] = useState(null);

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line
  }, [user]);

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

  const handleEdit = (item) => {
    setEditItem({ ...item, tags: item.tags?.join(', ') });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditItem((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      const payload = {
        ...editItem,
        price: editItem.price ? parseFloat(editItem.price) : 0,
        quantity: editItem.quantity ? parseInt(editItem.quantity) : 1,
        tags: editItem.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        location: editItem.location ? { city: editItem.location } : undefined,
      };
      await api.put(`/api/items/${editItem._id}`, payload);
      setEditItem(null);
      fetchItems();
    } catch (err) {
      alert('Failed to update item');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    setDeleteLoading(itemId);
    try {
      await api.delete(`/api/items/${itemId}`);
      fetchItems();
    } catch (err) {
      alert('Failed to delete item');
    } finally {
      setDeleteLoading('');
    }
  };

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
                <div key={item._id} className="bg-gray-50 rounded-lg border border-gray-200 p-4 relative">
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
                  <div className="text-xs text-gray-500 mb-2">Status: {item.status}</div>
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => handleEdit(item)} className="px-3 py-1 bg-blue-500 text-white rounded text-xs">Edit</button>
                    <button onClick={() => handleDelete(item._id)} className="px-3 py-1 bg-red-500 text-white rounded text-xs" disabled={deleteLoading === item._id}>{deleteLoading === item._id ? 'Deleting...' : 'Delete'}</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Edit Modal */}
        {editItem && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg relative">
              <button onClick={() => setEditItem(null)} className="absolute top-2 right-2 text-gray-400 hover:text-gray-700">&times;</button>
              <h2 className="text-xl font-bold mb-4">Edit Item</h2>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <input type="text" name="title" value={editItem.title} onChange={handleEditChange} required className="w-full px-3 py-2 border rounded" placeholder="Title" />
                <textarea name="description" value={editItem.description} onChange={handleEditChange} required rows={3} className="w-full px-3 py-2 border rounded" placeholder="Description" />
                <input type="number" name="price" value={editItem.price} onChange={handleEditChange} min="0" step="0.01" className="w-full px-3 py-2 border rounded" placeholder="Price" />
                <input type="number" name="quantity" value={editItem.quantity} onChange={handleEditChange} min="1" className="w-full px-3 py-2 border rounded" placeholder="Quantity" />
                <input type="text" name="location" value={editItem.location?.city || editItem.location || ''} onChange={handleEditChange} className="w-full px-3 py-2 border rounded" placeholder="Location (City)" />
                <input type="text" name="tags" value={editItem.tags} onChange={handleEditChange} className="w-full px-3 py-2 border rounded" placeholder="Tags (comma separated)" />
                <input type="text" name="category" value={editItem.category} onChange={handleEditChange} className="w-full px-3 py-2 border rounded" placeholder="Category" />
                <input type="text" name="condition" value={editItem.condition} onChange={handleEditChange} className="w-full px-3 py-2 border rounded" placeholder="Condition" />
                <input type="text" name="sharingType" value={editItem.sharingType} onChange={handleEditChange} className="w-full px-3 py-2 border rounded" placeholder="Sharing Type" />
                <button type="submit" disabled={editLoading} className="w-full bg-blue-600 text-white py-2 rounded">{editLoading ? 'Saving...' : 'Save Changes'}</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile; 