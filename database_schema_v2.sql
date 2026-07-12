-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables (in reverse order of dependencies)
DROP TABLE IF EXISTS fuel_records CASCADE;
DROP TABLE IF EXISTS maintenance_records CASCADE;
DROP TABLE IF EXISTS trips CASCADE;
DROP TABLE IF EXISTS drivers CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS companies CASCADE;

-- 1. Companies Table
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'Fleet Manager',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Vehicles Table
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    reg_number VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    vehicle_type VARCHAR(50) NOT NULL,
    capacity VARCHAR(50),
    odometer INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'Available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (company_id, reg_number)
);

-- 4. Drivers Table
CREATE TABLE drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    license_number VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    license_expiry DATE,
    score INTEGER DEFAULT 100,
    status VARCHAR(50) DEFAULT 'Available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (company_id, license_number)
);

-- 5. Trips Table
CREATE TABLE trips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    origin VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
    driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
    weight VARCHAR(50),
    status VARCHAR(50) DEFAULT 'Draft',
    trip_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Maintenance Records Table
CREATE TABLE maintenance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    service_type VARCHAR(255) NOT NULL,
    cost NUMERIC(10, 2) DEFAULT 0.00,
    service_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'In Progress',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Fuel Records Table
CREATE TABLE fuel_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    liters NUMERIC(10, 2) NOT NULL,
    cost NUMERIC(10, 2) NOT NULL,
    fuel_date DATE NOT NULL,
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- INSERT MOCK DATA

-- Companies
INSERT INTO companies (id, name) VALUES 
('11111111-1111-1111-1111-111111111111', 'FastTrack Logistics'),
('22222222-2222-2222-2222-222222222222', 'Global Freight');

-- Users
INSERT INTO users (company_id, email, password_hash, name, role) VALUES 
('11111111-1111-1111-1111-111111111111', 'admin@fasttrack.com', 'hashed_pw', 'Admin FastTrack', 'Admin'),
('22222222-2222-2222-2222-222222222222', 'admin@globalfreight.com', 'hashed_pw', 'Admin Global', 'Admin');

-- Vehicles for FastTrack
INSERT INTO vehicles (company_id, reg_number, name, vehicle_type, capacity, odometer, status) VALUES 
('11111111-1111-1111-1111-111111111111', 'KA-01-HH-1234', 'Volvo FH16', 'Heavy Truck', '20,000 kg', 154200, 'Available'),
('11111111-1111-1111-1111-111111111111', 'MH-04-AB-9876', 'Tata Signa', 'Medium Truck', '10,000 kg', 85300, 'On Trip');

-- Vehicles for Global Freight
INSERT INTO vehicles (company_id, reg_number, name, vehicle_type, capacity, odometer, status) VALUES 
('22222222-2222-2222-2222-222222222222', 'DL-01-ZA-1122', 'Ashok Leyland', 'Light Truck', '5,000 kg', 24100, 'In Shop'),
('22222222-2222-2222-2222-222222222222', 'TN-09-CD-3344', 'Mahindra Blazo', 'Heavy Truck', '25,000 kg', 210500, 'Available');

-- Drivers for FastTrack
INSERT INTO drivers (company_id, name, license_number, category, license_expiry, score, status) VALUES 
('11111111-1111-1111-1111-111111111111', 'Rajesh Kumar', 'DL-1998-001', 'Heavy', '2028-05-12', 95, 'Available'),
('11111111-1111-1111-1111-111111111111', 'Suresh Singh', 'DL-2005-089', 'Heavy', '2025-11-20', 88, 'On Trip');

-- Drivers for Global Freight
INSERT INTO drivers (company_id, name, license_number, category, license_expiry, score, status) VALUES 
('22222222-2222-2222-2222-222222222222', 'Amit Patel', 'DL-2010-442', 'Light', '2024-02-15', 72, 'Suspended'),
('22222222-2222-2222-2222-222222222222', 'Vikram Sharma', 'DL-2015-901', 'Medium', '2027-08-30', 91, 'Off Duty');

-- Trips
INSERT INTO trips (company_id, origin, destination, vehicle_id, driver_id, weight, status, trip_date) VALUES 
('11111111-1111-1111-1111-111111111111', 'Mumbai', 'Delhi', (SELECT id FROM vehicles WHERE reg_number = 'MH-04-AB-9876' AND company_id = '11111111-1111-1111-1111-111111111111'), (SELECT id FROM drivers WHERE name = 'Suresh Singh' AND company_id = '11111111-1111-1111-1111-111111111111'), '8,500 kg', 'Dispatched', '2026-07-10'),
('22222222-2222-2222-2222-222222222222', 'Delhi', 'Jaipur', (SELECT id FROM vehicles WHERE reg_number = 'TN-09-CD-3344' AND company_id = '22222222-2222-2222-2222-222222222222'), (SELECT id FROM drivers WHERE name = 'Vikram Sharma' AND company_id = '22222222-2222-2222-2222-222222222222'), '12,000 kg', 'Draft', '2026-07-13');

-- Maintenance
INSERT INTO maintenance_records (company_id, vehicle_id, service_type, cost, service_date, status) VALUES 
('11111111-1111-1111-1111-111111111111', (SELECT id FROM vehicles WHERE reg_number = 'KA-01-HH-1234' AND company_id = '11111111-1111-1111-1111-111111111111'), 'Engine Repair', 1200.00, '2026-07-11', 'In Progress'),
('22222222-2222-2222-2222-222222222222', (SELECT id FROM vehicles WHERE reg_number = 'TN-09-CD-3344' AND company_id = '22222222-2222-2222-2222-222222222222'), 'Oil Change', 150.00, '2026-06-25', 'Completed');

-- Fuel
INSERT INTO fuel_records (company_id, vehicle_id, liters, cost, fuel_date, location) VALUES 
('11111111-1111-1111-1111-111111111111', (SELECT id FROM vehicles WHERE reg_number = 'MH-04-AB-9876' AND company_id = '11111111-1111-1111-1111-111111111111'), 120, 145.00, '2026-07-10', 'Mumbai Pump'),
('22222222-2222-2222-2222-222222222222', (SELECT id FROM vehicles WHERE reg_number = 'DL-01-ZA-1122' AND company_id = '22222222-2222-2222-2222-222222222222'), 85, 105.00, '2026-07-09', 'Highway Station 4');
