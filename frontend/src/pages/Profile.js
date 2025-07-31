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
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');
  const [editProfile, setEditProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    username: user?.username || '',
    email: user?.email || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    avatar: user?.avatar || '',
    bio: user?.bio || '',
    phone: user?.phone || '',
    location: {
      city: user?.location?.city || '',
      state: user?.location?.state || '',
      country: user?.location?.country || '',
    },
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestsError, setRequestsError] = useState('');
  const [responseMessage, setResponseMessage] = useState('');
  const [responseLoading, setResponseLoading] = useState('');

  useEffect(() => {
    if (user?._id) {
      fetchItems();
      fetchRequests();
    }
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

  const fetchOrders = async () => {
    setOrdersLoading(true);
    setOrdersError('');
    try {
      const res = await api.get(`/api/orders/owner/${user._id}`);
      setOrders(res.data);
    } catch (err) {
      setOrdersError('Failed to load orders');
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchRequests = async () => {
    setRequestsLoading(true);
    setRequestsError('');
    try {
      const [receivedRes, sentRes] = await Promise.all([
        api.get('/api/requests/owner'),
        api.get('/api/requests/user')
      ]);
      setReceivedRequests(receivedRes.data);
      setSentRequests(sentRes.data);
    } catch (err) {
      setRequestsError('Failed to load requests');
    } finally {
      setRequestsLoading(false);
    }
  };

  const handleRequestResponse = async (requestId, status) => {
    setResponseLoading(requestId);
    try {
      await api.put(`/api/requests/${requestId}/status`, {
        status,
        responseMessage: responseMessage
      });
      fetchRequests();
      setResponseMessage('');
    } catch (err) {
      alert('Failed to update request status');
    } finally {
      setResponseLoading('');
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

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('location.')) {
      const locField = name.split('.')[1];
      setProfileForm((prev) => ({ ...prev, location: { ...prev.location, [locField]: value } }));
    } else {
      setProfileForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileError('');
    setProfileSuccess('');
    try {
      const payload = {
        firstName: profileForm.firstName,
        lastName: profileForm.lastName,
        bio: profileForm.bio,
        phone: profileForm.phone,
        avatar: profileForm.avatar,
        location: profileForm.location,
      };
      const res = await api.put('/api/auth/profile', payload);
      setProfileSuccess('Profile updated successfully!');
      setEditProfile(false);
      window.location.reload(); // To refresh user context
    } catch (err) {
      setProfileError('Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">My Profile</h1>
          <p className="text-gray-600">This page shows your profile and your item history.</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">My Details</h2>
          {!editProfile ? (
            <div>
              <div className="flex items-center mb-4">
                {user.avatar && <img src={user.avatar} alt="avatar" className="w-16 h-16 rounded-full mr-4" />}
                <div>
                  <div className="font-bold text-lg">{user.firstName} {user.lastName}</div>
                  <div className="text-gray-600">@{user.username}</div>
                </div>
              </div>
              <div className="mb-2"><span className="font-semibold">Email:</span> {user.email}</div>
              <div className="mb-2"><span className="font-semibold">Phone:</span> {user.phone || '-'}</div>
              <div className="mb-2"><span className="font-semibold">Bio:</span> {user.bio || '-'}</div>
              <div className="mb-2"><span className="font-semibold">Location:</span> {user.location?.city || ''} {user.location?.state || ''} {user.location?.country || ''}</div>
              <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded" onClick={() => setEditProfile(true)}>Edit</button>
            </div>
          ) : (
            <form onSubmit={handleProfileSubmit} className="space-y-3">
              <div className="flex items-center mb-2">
                {profileForm.avatar && <img src={profileForm.avatar} alt="avatar" className="w-16 h-16 rounded-full mr-4" />}
                <input name="avatar" value={profileForm.avatar} onChange={handleProfileChange} placeholder="Avatar URL" className="p-2 border rounded w-full" />
              </div>
              <div className="flex gap-2">
                <input name="firstName" value={profileForm.firstName} onChange={handleProfileChange} placeholder="First Name" className="p-2 border rounded w-full" required />
                <input name="lastName" value={profileForm.lastName} onChange={handleProfileChange} placeholder="Last Name" className="p-2 border rounded w-full" required />
              </div>
              <input name="username" value={profileForm.username} disabled className="p-2 border rounded w-full bg-gray-100" />
              <input name="email" value={profileForm.email} disabled className="p-2 border rounded w-full bg-gray-100" />
              <input name="phone" value={profileForm.phone} onChange={handleProfileChange} placeholder="Phone" className="p-2 border rounded w-full" />
              <textarea name="bio" value={profileForm.bio} onChange={handleProfileChange} placeholder="Bio" className="p-2 border rounded w-full" />
              <div className="flex gap-2">
                <input name="location.city" value={profileForm.location.city} onChange={handleProfileChange} placeholder="City" className="p-2 border rounded w-full" />
                <input name="location.state" value={profileForm.location.state} onChange={handleProfileChange} placeholder="State" className="p-2 border rounded w-full" />
                <input name="location.country" value={profileForm.location.country} onChange={handleProfileChange} placeholder="Country" className="p-2 border rounded w-full" />
              </div>
              {profileError && <div className="text-red-500">{profileError}</div>}
              {profileSuccess && <div className="text-green-600">{profileSuccess}</div>}
              <div className="flex gap-2">
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded" disabled={profileLoading}>{profileLoading ? 'Saving...' : 'Save'}</button>
                <button type="button" className="px-4 py-2 bg-gray-300 rounded" onClick={() => setEditProfile(false)}>Cancel</button>
              </div>
            </form>
          )}
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Requests for Your Items</h2>
          {requestsLoading ? (
            <div>Loading requests...</div>
          ) : requestsError ? (
            <div className="text-red-600">{requestsError}</div>
          ) : receivedRequests.length === 0 ? (
            <div className="text-gray-500">No requests for your items yet.</div>
          ) : (
            <div className="space-y-4">
              {receivedRequests.map((request) => (
                <div key={request._id} className="border rounded p-4 bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-semibold">Request from: {request.requester.firstName} {request.requester.lastName}</div>
                      <div className="text-sm text-gray-600">@{request.requester.username} • {request.requester.email}</div>
                      {request.requester.phone && <div className="text-sm text-gray-600">Phone: {request.requester.phone}</div>}
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      request.status === 'approved' ? 'bg-green-100 text-green-800' :
                      request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </div>
                  <div className="mb-2">
                    <div className="font-semibold">Item: {request.item.title}</div>
                    <div className="text-sm text-gray-600">Requested: {new Date(request.requestedAt).toLocaleString()}</div>
                  </div>
                  {request.message && <div className="mb-2"><span className="font-semibold">Message:</span> {request.message}</div>}
                  {request.responseMessage && <div className="mb-2"><span className="font-semibold">Your response:</span> {request.responseMessage}</div>}
                  {request.status === 'pending' && (
                    <div className="mt-3 space-y-2">
                      <textarea
                        value={responseMessage}
                        onChange={(e) => setResponseMessage(e.target.value)}
                        placeholder="Add a response message (optional)"
                        className="w-full p-2 border rounded text-sm"
                        rows="2"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRequestResponse(request._id, 'approved')}
                          disabled={responseLoading === request._id}
                          className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
                        >
                          {responseLoading === request._id ? 'Processing...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => handleRequestResponse(request._id, 'rejected')}
                          disabled={responseLoading === request._id}
                          className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50"
                        >
                          {responseLoading === request._id ? 'Processing...' : 'Reject'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">My Requests</h2>
          {requestsLoading ? (
            <div>Loading requests...</div>
          ) : requestsError ? (
            <div className="text-red-600">{requestsError}</div>
          ) : sentRequests.length === 0 ? (
            <div className="text-gray-500">You haven't made any requests yet.</div>
          ) : (
            <div className="space-y-4">
              {sentRequests.map((request) => (
                <div key={request._id} className="border rounded p-4 bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-semibold">Request to: {request.owner.firstName} {request.owner.lastName}</div>
                      <div className="text-sm text-gray-600">@{request.owner.username}</div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      request.status === 'approved' ? 'bg-green-100 text-green-800' :
                      request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </div>
                  <div className="mb-2">
                    <div className="font-semibold">Item: {request.item.title}</div>
                    <div className="text-sm text-gray-600">Requested: {new Date(request.requestedAt).toLocaleString()}</div>
                  </div>
                  {request.message && <div className="mb-2"><span className="font-semibold">Your message:</span> {request.message}</div>}
                  {request.responseMessage && <div className="mb-2"><span className="font-semibold">Owner's response:</span> {request.responseMessage}</div>}
                  {request.respondedAt && <div className="text-sm text-gray-600">Responded: {new Date(request.respondedAt).toLocaleString()}</div>}
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