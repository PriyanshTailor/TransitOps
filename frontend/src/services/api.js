const API_URL = 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const fetchDashboardStats = async () => {
  const response = await fetch(`${API_URL}/dashboard/stats`, {
    headers: getHeaders()
  });
  if (!response.ok) throw new Error('Failed to fetch dashboard stats');
  return response.json();
};

export const fetchVehicles = async () => {
  const response = await fetch(`${API_URL}/vehicles`, {
    headers: getHeaders()
  });
  if (!response.ok) throw new Error('Failed to fetch vehicles');
  return response.json();
};

export const createVehicle = async (vehicleData) => {
  const response = await fetch(`${API_URL}/vehicles`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(vehicleData)
  });
  if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create vehicle');
  }
  return response.json();
};

export const updateVehicle = async (id, vehicleData) => {
  const response = await fetch(`${API_URL}/vehicles/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(vehicleData)
  });
  if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update vehicle');
  }
  return response.json();
};

export const deleteVehicle = async (id) => {
  const response = await fetch(`${API_URL}/vehicles/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  if (!response.ok) throw new Error('Failed to delete vehicle');
  return response.json();
};
