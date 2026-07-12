const API_URL = 'http://localhost:5000/api';

export const getHeaders = () => {
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

// MAINTENANCE APIs
export const fetchMaintenance = async () => {
  const response = await fetch(`${API_URL}/maintenance`, { headers: getHeaders() });
  if (!response.ok) throw new Error('Failed to fetch maintenance');
  return response.json();
};
export const createMaintenance = async (data) => {
  const response = await fetch(`${API_URL}/maintenance`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) });
  if (!response.ok) throw new Error('Failed to create maintenance');
  return response.json();
};
export const updateMaintenance = async (id, data) => {
  const response = await fetch(`${API_URL}/maintenance/${id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(data) });
  if (!response.ok) throw new Error('Failed to update maintenance');
  return response.json();
};
export const deleteMaintenance = async (id) => {
  const response = await fetch(`${API_URL}/maintenance/${id}`, { method: 'DELETE', headers: getHeaders() });
  if (!response.ok) throw new Error('Failed to delete maintenance');
  return response.json();
};

// FUEL APIs
export const fetchFuel = async () => {
  const response = await fetch(`${API_URL}/fuel`, { headers: getHeaders() });
  if (!response.ok) throw new Error('Failed to fetch fuel logs');
  return response.json();
};
export const createFuel = async (data) => {
  const response = await fetch(`${API_URL}/fuel`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) });
  if (!response.ok) throw new Error('Failed to create fuel log');
  return response.json();
};
export const deleteFuel = async (id) => {
  const response = await fetch(`${API_URL}/fuel/${id}`, { method: 'DELETE', headers: getHeaders() });
  if (!response.ok) throw new Error('Failed to delete fuel log');
  return response.json();
};

// REPORTS APIs
export const fetchReports = async () => {
  const response = await fetch(`${API_URL}/reports`, { headers: getHeaders() });
  if (!response.ok) throw new Error('Failed to fetch reports');
  return response.json();
};

// EXPENSE APIs
export const fetchExpenses = async () => {
  const response = await fetch(`${API_URL}/expenses`, { headers: getHeaders() });
  if (!response.ok) throw new Error('Failed to fetch expenses');
  return response.json();
};
export const createExpense = async (data) => {
  const response = await fetch(`${API_URL}/expenses`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) });
  if (!response.ok) throw new Error('Failed to create expense');
  return response.json();
};
export const updateExpenseStatus = async (id, statusData) => {
  const response = await fetch(`${API_URL}/expenses/${id}/status`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(statusData) });
  if (!response.ok) throw new Error('Failed to update expense status');
  return response.json();
};
export const deleteExpense = async (id) => {
  const response = await fetch(`${API_URL}/expenses/${id}`, { method: 'DELETE', headers: getHeaders() });
  if (!response.ok) throw new Error('Failed to delete expense');
  return response.json();
};

// NOTIFICATION APIs
export const fetchNotifications = async () => {
  const response = await fetch(`${API_URL}/notifications`, { headers: getHeaders() });
  if (!response.ok) throw new Error('Failed to fetch notifications');
  return response.json();
};
export const markNotificationRead = async (id) => {
  const response = await fetch(`${API_URL}/notifications/${id}/read`, { method: 'PUT', headers: getHeaders() });
  if (!response.ok) throw new Error('Failed to mark as read');
  return response.json();
};
