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

// DRIVER APIs
export const fetchDrivers = async () => {
  const response = await fetch(`${API_URL}/drivers`, { headers: getHeaders() });
  if (!response.ok) throw new Error('Failed to fetch drivers');
  return response.json();
};
export const createDriver = async (data) => {
  const response = await fetch(`${API_URL}/drivers`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) });
  if (!response.ok) { const err = await response.json(); throw new Error(err.error || 'Failed to create driver'); }
  return response.json();
};
export const updateDriver = async (id, data) => {
  const response = await fetch(`${API_URL}/drivers/${id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(data) });
  if (!response.ok) { const err = await response.json(); throw new Error(err.error || 'Failed to update driver'); }
  return response.json();
};
export const deleteDriver = async (id) => {
  const response = await fetch(`${API_URL}/drivers/${id}`, { method: 'DELETE', headers: getHeaders() });
  if (!response.ok) throw new Error('Failed to delete driver');
  return response.json();
};

// TRIP APIs
export const fetchTrips = async () => {
  const response = await fetch(`${API_URL}/trips`, { headers: getHeaders() });
  if (!response.ok) throw new Error('Failed to fetch trips');
  return response.json();
};
export const createTrip = async (data) => {
  const response = await fetch(`${API_URL}/trips`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) });
  if (!response.ok) { const err = await response.json(); throw new Error(err.error || 'Failed to create trip'); }
  return response.json();
};
export const updateTrip = async (id, data) => {
  const response = await fetch(`${API_URL}/trips/${id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(data) });
  if (!response.ok) { const err = await response.json(); throw new Error(err.error || 'Failed to update trip'); }
  return response.json();
};
export const deleteTrip = async (id) => {
  const response = await fetch(`${API_URL}/trips/${id}`, { method: 'DELETE', headers: getHeaders() });
  if (!response.ok) throw new Error('Failed to delete trip');
  return response.json();
};
