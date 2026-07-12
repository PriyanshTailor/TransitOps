export const mockVehicles = [
  { id: 'V001', reg: 'KA-01-HH-1234', name: 'Volvo FH16', type: 'Heavy Truck', capacity: '20,000 kg', odometer: 154200, status: 'Available' },
  { id: 'V002', reg: 'MH-04-AB-9876', name: 'Tata Signa', type: 'Medium Truck', capacity: '10,000 kg', odometer: 85300, status: 'On Trip' },
  { id: 'V003', reg: 'DL-01-ZA-1122', name: 'Ashok Leyland', type: 'Light Truck', capacity: '5,000 kg', odometer: 24100, status: 'In Shop' },
  { id: 'V004', reg: 'TN-09-CD-3344', name: 'Mahindra Blazo', type: 'Heavy Truck', capacity: '25,000 kg', odometer: 210500, status: 'Available' },
  { id: 'V005', reg: 'GJ-05-XX-5566', name: 'Eicher Pro', type: 'Medium Truck', capacity: '8,000 kg', odometer: 45000, status: 'On Trip' },
];

export const mockDrivers = [
  { id: 'D001', name: 'Rajesh Kumar', license: 'DL-1998-001', category: 'Heavy', expiry: '2028-05-12', score: 95, status: 'Available' },
  { id: 'D002', name: 'Suresh Singh', license: 'DL-2005-089', category: 'Heavy', expiry: '2025-11-20', score: 88, status: 'On Trip' },
  { id: 'D003', name: 'Amit Patel', license: 'DL-2010-442', category: 'Light', expiry: '2024-02-15', score: 72, status: 'Suspended' },
  { id: 'D004', name: 'Vikram Sharma', license: 'DL-2015-901', category: 'Medium', expiry: '2027-08-30', score: 91, status: 'Off Duty' },
  { id: 'D005', name: 'Mohammed Ali', license: 'DL-2018-333', category: 'Heavy', expiry: '2029-01-10', score: 98, status: 'Available' },
];

export const mockTrips = [
  { id: 'T1001', origin: 'Mumbai', destination: 'Delhi', vehicle: 'MH-04-AB-9876', driver: 'Suresh Singh', weight: '8,500 kg', status: 'Dispatched', date: '2026-07-10' },
  { id: 'T1002', origin: 'Chennai', destination: 'Bangalore', vehicle: 'GJ-05-XX-5566', driver: 'Vikram Sharma', weight: '6,200 kg', status: 'Completed', date: '2026-07-08' },
  { id: 'T1003', origin: 'Delhi', destination: 'Jaipur', vehicle: 'KA-01-HH-1234', driver: 'Rajesh Kumar', weight: '12,000 kg', status: 'Draft', date: '2026-07-13' },
];

export const mockMaintenance = [
  { id: 'M001', vehicle: 'DL-01-ZA-1122', type: 'Engine Repair', cost: '$1,200', date: '2026-07-11', status: 'In Progress' },
  { id: 'M002', vehicle: 'TN-09-CD-3344', type: 'Oil Change', cost: '$150', date: '2026-06-25', status: 'Completed' },
];

export const mockFuel = [
  { id: 'F001', vehicle: 'MH-04-AB-9876', liters: 120, cost: '$145', date: '2026-07-10', location: 'Mumbai Pump' },
  { id: 'F002', vehicle: 'GJ-05-XX-5566', liters: 85, cost: '$105', date: '2026-07-09', location: 'Highway Station 4' },
];

export const kpiData = {
  activeVehicles: 45,
  availableVehicles: 12,
  inMaintenance: 5,
  activeTrips: 28,
  pendingTrips: 7,
  fleetUtilization: 85
};

export const chartData = [
  { name: 'Mon', trips: 14, fuel: 1200 },
  { name: 'Tue', trips: 18, fuel: 1500 },
  { name: 'Wed', trips: 22, fuel: 1800 },
  { name: 'Thu', trips: 20, fuel: 1600 },
  { name: 'Fri', trips: 25, fuel: 2100 },
  { name: 'Sat', trips: 15, fuel: 1300 },
  { name: 'Sun', trips: 10, fuel: 900 },
];
