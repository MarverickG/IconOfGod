const BASE_URL = 'https://iconofgod-backend.onrender.com/api/v1/cart';

export const fetchCart = async (token) => {
  const res = await fetch(BASE_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Failed to fetch cart');
  return await res.json();
};

export const addToCart = async (item, token) => {
  const res = await fetch(`${BASE_URL}/add`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(item),
  });
  if (!res.ok) throw new Error('Failed to add item');
  return await res.json();
};

export const removeFromCart = async (item, token) => {
  const res = await fetch(`${BASE_URL}/remove`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(item),
  });
  if (!res.ok) throw new Error('Failed to remove item');
  return await res.json();
};