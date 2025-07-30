import React, { useState, useEffect } from 'react';

const Cart = () => {
  const [cart, setCart] = useState([]);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(stored);
  }, []);

  const removeFromCart = (id) => {
    const updated = cart.filter(item => item._id !== id);
    setCart(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  };

  const proceedToPay = () => {
    // Mock payment
    setSuccess(true);
    localStorage.removeItem('cart');
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold text-green-700 mb-4">Payment Successful!</h1>
        <p className="text-gray-700">Thank you for your purchase.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Cart</h1>
        {cart.length === 0 ? (
          <div className="text-gray-500">Your cart is empty.</div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 mb-6">
              {cart.map(item => (
                <div key={item._id} className="bg-white rounded-lg border p-4 flex items-center gap-4">
                  <img src={item.images?.[0]} alt={item.title} className="w-24 h-24 object-cover rounded" />
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold">{item.title}</h2>
                    <div className="text-gray-500 text-sm">{item.category} | {item.condition}</div>
                    <div className="text-gray-900 font-bold">${item.price}</div>
                  </div>
                  <button onClick={() => removeFromCart(item._id)} className="bg-red-500 text-white px-3 py-1 rounded">Remove</button>
                </div>
              ))}
            </div>
            <button onClick={proceedToPay} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold text-lg hover:bg-blue-700">Proceed to Pay</button>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart; 