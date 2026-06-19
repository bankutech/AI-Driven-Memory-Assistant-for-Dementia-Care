const API_URL = 'http://localhost:5000/api';

export const registerUser = async (userData) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Registration failed');
  }
  return response.json();
};

export const loginUser = async (credentials) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Login failed');
  }
  return response.json();
};

export const getMe = async () => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No token found');

  const response = await fetch(`${API_URL}/auth/me`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) throw new Error('Failed to fetch user');
  return response.json();
};

export const getPatients = async () => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No token found');

  const response = await fetch(`${API_URL}/patients`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) throw new Error('Failed to fetch patients');
  return response.json();
};
