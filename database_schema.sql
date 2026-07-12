-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'Fleet Manager',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Vehicles Table
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reg_number VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    vehicle_type VARCHAR(50) NOT NULL,
    capacity VARCHAR(50),
    odometer INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'Available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Drivers Table
CREATE TABLE IF NOT EXISTS drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    license_number VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50),
    license_expiry DATE,
    score INTEGER DEFAULT 100,
    status VARCHAR(50) DEFAULT 'Available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Trips Table
CREATE TABLE IF NOT EXISTS trips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    origin VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
    driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
    weight VARCHAR(50),
    status VARCHAR(50) DEFAULT 'Draft',
    trip_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Maintenance Records Table
CREATE TABLE IF NOT EXISTS maintenance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    service_type VARCHAR(255) NOT NULL,
    cost NUMERIC(10, 2) DEFAULT 0.00,
    service_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'In Progress',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Fuel Records Table
CREATE TABLE IF NOT EXISTS fuel_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    liters NUMERIC(10, 2) NOT NULL,
    cost NUMERIC(10, 2) NOT NULL,
    fuel_date DATE NOT NULL,
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- INSERT MOCK DATA

-- Users
INSERT INTO users (email, password_hash, name, role) VALUES 
('admin@transitops.com', 'hashed_password_placeholder', 'Admin User', 'Admin'),
('manager@transitops.com', 'hashed_password_placeholder', 'Fleet Manager', 'Fleet Manager');

-- Vehicles
INSERT INTO vehicles (reg_number, name, vehicle_type, capacity, odometer, status) VALUES 
('KA-01-HH-1234', 'Volvo FH16', 'Heavy Truck', '20,000 kg', 154200, 'Available'),
('MH-04-AB-9876', 'Tata Signa', 'Medium Truck', '10,000 kg', 85300, 'On Trip'),
('DL-01-ZA-1122', 'Ashok Leyland', 'Light Truck', '5,000 kg', 24100, 'In Shop'),
('TN-09-CD-3344', 'Mahindra Blazo', 'Heavy Truck', '25,000 kg', 210500, 'Available'),
('GJ-05-XX-5566', 'Eicher Pro', 'Medium Truck', '8,000 kg', 45000, 'On Trip');

-- Drivers
INSERT INTO drivers (name, license_number, category, license_expiry, score, status) VALUES 
('Rajesh Kumar', 'DL-1998-001', 'Heavy', '2028-05-12', 95, 'Available'),
('Suresh Singh', 'DL-2005-089', 'Heavy', '2025-11-20', 88, 'On Trip'),
('Amit Patel', 'DL-2010-442', 'Light', '2024-02-15', 72, 'Suspended'),
('Vikram Sharma', 'DL-2015-901', 'Medium', '2027-08-30', 91, 'Off Duty'),
('Mohammed Ali', 'DL-2018-333', 'Heavy', '2029-01-10', 98, 'Available');

-- Trips (Using subqueries to link vehicles and drivers dynamically)
INSERT INTO trips (origin, destination, vehicle_id, driver_id, weight, status, trip_date) VALUES 
('Mumbai', 'Delhi', (SELECT id FROM vehicles WHERE reg_number = 'MH-04-AB-9876'), (SELECT id FROM drivers WHERE name = 'Suresh Singh'), '8,500 kg', 'Dispatched', '2026-07-10'),
('Chennai', 'Bangalore', (SELECT id FROM vehicles WHERE reg_number = 'GJ-05-XX-5566'), (SELECT id FROM drivers WHERE name = 'Vikram Sharma'), '6,200 kg', 'Completed', '2026-07-08'),
('Delhi', 'Jaipur', (SELECT id FROM vehicles WHERE reg_number = 'KA-01-HH-1234'), (SELECT id FROM drivers WHERE name = 'Rajesh Kumar'), '12,000 kg', 'Draft', '2026-07-13');

-- Maintenance
INSERT INTO maintenance_records (vehicle_id, service_type, cost, service_date, status) VALUES 
((SELECT id FROM vehicles WHERE reg_number = 'DL-01-ZA-1122'), 'Engine Repair', 1200.00, '2026-07-11', 'In Progress'),
((SELECT id FROM vehicles WHERE reg_number = 'TN-09-CD-3344'), 'Oil Change', 150.00, '2026-06-25', 'Completed');

-- Fuel
INSERT INTO fuel_records (vehicle_id, liters, cost, fuel_date, location) VALUES 
((SELECT id FROM vehicles WHERE reg_number = 'MH-04-AB-9876'), 120, 145.00, '2026-07-10', 'Mumbai Pump'),
((SELECT id FROM vehicles WHERE reg_number = 'GJ-05-XX-5566'), 85, 105.00, '2026-07-09', 'Highway Station 4');
