import React, { useEffect, useState } from 'react';
import { fetchCart, removeFromCart } from '../api/api';

const CartPage = () => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token'); // You may be using a different storage strategy

  useEffect(() => {
    const getCart = async () => {
      try {
        const data = await fetchCart(token);
        setCart(data.items || []);
      } catch (err) {
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    getCart();
  }, [token]);

  const handleRemove = async (productId) => {
    try {
      await removeFromCart({ productId }, token);
      setCart(cart.filter((item) => item.productId !== productId));
    } catch (err) {
      console.error('Error removing item:', err);
    }
  };

  if (loading) return <p>Loading cart...</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Your Cart</h1>
      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <ul className="space-y-4">
          {cart.map((item) => (
            <li key={item.productId} className="flex justify-between items-center bg-gray-100 p-4 rounded">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-600">${item.price}</p>
              </div>
              <button
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                onClick={() => handleRemove(item.productId)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CartPage;