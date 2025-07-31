import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

const ItemDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestError, setRequestError] = useState('');
  const [requestSuccess, setRequestSuccess] = useState('');

  useEffect(() => {
    fetchItem();
  }, [id]);

  const fetchItem = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/items/${id}`);
      setItem(response.data.item);
    } catch (err) {
      setError('Failed to load item details');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestItem = async (e) => {
    e.preventDefault();
    setRequestLoading(true);
    setRequestError('');
    setRequestSuccess('');
    
    try {
      await api.post('/api/requests', {
        itemId: item._id,
        message: requestMessage
      });
      setRequestSuccess('Request sent successfully!');
      setRequestMessage('');
      setTimeout(() => {
        setShowRequestModal(false);
        setRequestSuccess('');
      }, 2000);
    } catch (err) {
      setRequestError(err.response?.data?.error || 'Failed to send request');
    } finally {
      setRequestLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-xl">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-xl text-red-600">{error || 'Item not found'}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Item Images */}
            <div>
              {item.images && item.images.length > 0 ? (
                <img 
                  src={item.images[0]} 
                  alt={item.title} 
                  className="w-full h-96 object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500">No image available</span>
                </div>
              )}
            </div>

            {/* Item Details */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{item.title}</h1>
              
              <div className="space-y-4 mb-6">
                <div>
                  <span className="font-semibold text-gray-700">Price:</span>
                  <span className="ml-2 text-2xl font-bold text-blue-600">
                    {item.price > 0 ? `$${item.price}` : 'Free'}
                  </span>
                </div>
                
                <div>
                  <span className="font-semibold text-gray-700">Category:</span>
                  <span className="ml-2 text-gray-600">{item.category}</span>
                </div>
                
                <div>
                  <span className="font-semibold text-gray-700">Condition:</span>
                  <span className="ml-2 text-gray-600">{item.condition}</span>
                </div>
                
                {item.quantity && (
                  <div>
                    <span className="font-semibold text-gray-700">Quantity:</span>
                    <span className="ml-2 text-gray-600">{item.quantity}</span>
                  </div>
                )}
                
                {item.location && (
                  <div>
                    <span className="font-semibold text-gray-700">Location:</span>
                    <span className="ml-2 text-gray-600">{item.location.city}</span>
                  </div>
                )}
                
                <div>
                  <span className="font-semibold text-gray-700">Description:</span>
                  <p className="mt-2 text-gray-600">{item.description}</p>
                </div>
                
                {item.tags && item.tags.length > 0 && (
                  <div>
                    <span className="font-semibold text-gray-700">Tags:</span>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {item.tags.map((tag, index) => (
                        <span 
                          key={index} 
                          className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Owner Info */}
              <div className="border-t pt-4 mb-6">
                <h3 className="font-semibold text-gray-700 mb-2">Listed by:</h3>
                <div className="flex items-center">
                  {item.owner.avatar && (
                    <img 
                      src={item.owner.avatar} 
                      alt="Owner" 
                      className="w-10 h-10 rounded-full mr-3"
                    />
                  )}
                  <div>
                    <div className="font-medium">{item.owner.firstName} {item.owner.lastName}</div>
                    <div className="text-sm text-gray-600">@{item.owner.username}</div>
                  </div>
                </div>
              </div>

              {/* Request Button */}
              {user && user._id !== item.owner._id && (
                <button
                  onClick={() => setShowRequestModal(true)}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Request Item
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Request Item</h3>
            <form onSubmit={handleRequestItem}>
              <textarea
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                placeholder="Add a message to the owner (optional)"
                className="w-full p-3 border rounded-lg mb-4 h-24 resize-none"
                maxLength={500}
              />
              {requestError && <div className="text-red-500 mb-4">{requestError}</div>}
              {requestSuccess && <div className="text-green-600 mb-4">{requestSuccess}</div>}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={requestLoading}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {requestLoading ? 'Sending...' : 'Send Request'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowRequestModal(false);
                    setRequestMessage('');
                    setRequestError('');
                    setRequestSuccess('');
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemDetail; 