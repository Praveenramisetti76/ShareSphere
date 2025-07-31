import React from 'react';
import { Link } from 'react-router-dom';

const Cart = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Cart System Updated</h1>
          <p className="text-gray-600 mb-6">
            We've replaced the cart system with a request-based system. Now you can request items directly from owners!
          </p>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              • Browse items and click "Request Item" to send a request to the owner
            </p>
            <p className="text-sm text-gray-500">
              • Owners can approve or reject your requests
            </p>
            <p className="text-sm text-gray-500">
              • Track all your requests in your profile dashboard
            </p>
          </div>
          <Link
            to="/browse"
            className="inline-block mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Items
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cart; 