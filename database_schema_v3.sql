-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables (in reverse order of dependencies)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS fuel_records CASCADE;
DROP TABLE IF EXISTS maintenance_records CASCADE;
DROP TABLE IF EXISTS trips CASCADE;
DROP TABLE IF EXISTS drivers CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS companies CASCADE;

-- 1. Companies Table
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL,
    logo_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Roles Table
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

INSERT INTO roles (name, description) VALUES 
('Super Admin', 'Can access everything.'),
('Fleet Manager', 'Manages vehicles, maintenance, and fleet reports.'),
('Dispatcher', 'Manages trips, driver assignments, and vehicle availability.'),
('Safety Officer', 'Manages driver compliance, licenses, and safety reports.'),
('Financial Analyst', 'Manages expenses, fuel costs, and revenue reports.'),
('Driver', 'Views personal trips, enters fuel and expenses.');

-- 3. Users Table (Updated with RBAC)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE RESTRICT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    status VARCHAR(50) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Vehicles Table (Enterprise Fields)
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    reg_number VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    model VARCHAR(100),
    manufacturer VARCHAR(100),
    year INTEGER,
    vin_number VARCHAR(100) UNIQUE,
    vehicle_type VARCHAR(50) NOT NULL,
    capacity VARCHAR(50),
    fuel_type VARCHAR(50),
    odometer INTEGER DEFAULT 0,
    acquisition_cost NUMERIC(15, 2) DEFAULT 0.00,
    purchase_date DATE,
    insurance_details VARCHAR(255),
    insurance_expiry DATE,
    pollution_cert DATE,
    fitness_cert DATE,
    rc_upload VARCHAR(500),
    image_url VARCHAR(500),
    gps_device_id VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (company_id, reg_number)
);

-- 5. Drivers Table (Enterprise Fields)
CREATE TABLE drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50) NOT NULL,
    address TEXT,
    emergency_contact VARCHAR(255),
    license_number VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    license_expiry DATE,
    joining_date DATE,
    experience_years INTEGER,
    blood_group VARCHAR(10),
    medical_fitness VARCHAR(255),
    score INTEGER DEFAULT 100,
    rating NUMERIC(3,1) DEFAULT 5.0,
    status VARCHAR(50) DEFAULT 'Available',
    dl_upload VARCHAR(500),
    medical_upload VARCHAR(500),
    id_upload VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (company_id, license_number)
);

-- 6. Trips Table (Enterprise Fields)
CREATE TABLE trips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    trip_number VARCHAR(100) UNIQUE NOT NULL,
    origin VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
    driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
    cargo_weight VARCHAR(50),
    cargo_type VARCHAR(100),
    expected_distance NUMERIC(10,2),
    expected_time VARCHAR(100),
    expected_fuel NUMERIC(10,2),
    expected_cost NUMERIC(15,2),
    actual_distance NUMERIC(10,2),
    actual_fuel NUMERIC(10,2),
    actual_cost NUMERIC(15,2),
    revenue NUMERIC(15, 2) DEFAULT 0.00,
    route_details TEXT,
    gps_tracking_url VARCHAR(500),
    eta TIMESTAMP,
    pod_upload VARCHAR(500),
    customer_signature VARCHAR(500),
    delivery_images TEXT[],
    trip_notes TEXT,
    status VARCHAR(50) DEFAULT 'Draft', -- Draft -> Assigned -> Approved -> Dispatched -> In Transit -> Completed -> Archived
    trip_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Maintenance Records Table (Enterprise Fields)
CREATE TABLE maintenance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    maintenance_type VARCHAR(50) DEFAULT 'Corrective', -- Preventive, Corrective, Emergency
    service_type VARCHAR(255) NOT NULL,
    mechanic VARCHAR(100),
    garage VARCHAR(255),
    issue_description TEXT,
    priority VARCHAR(50) DEFAULT 'Medium',
    estimated_cost NUMERIC(15, 2) DEFAULT 0.00,
    actual_cost NUMERIC(15, 2) DEFAULT 0.00,
    invoice_upload VARCHAR(500),
    service_date DATE NOT NULL,
    completion_date DATE,
    parts_replaced TEXT,
    status VARCHAR(50) DEFAULT 'In Progress',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Fuel Records Table (Enterprise Fields)
CREATE TABLE fuel_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
    fuel_station VARCHAR(255),
    fuel_type VARCHAR(50),
    liters NUMERIC(10, 2) NOT NULL,
    price_per_liter NUMERIC(10, 2),
    total_cost NUMERIC(15, 2) NOT NULL,
    odometer_before INTEGER,
    odometer_after INTEGER,
    fuel_date DATE NOT NULL,
    location VARCHAR(255),
    receipt_upload VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Expenses Table
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL, -- Fuel, Maintenance, Toll, Parking, Insurance, Repairs, Misc
    vendor VARCHAR(255),
    amount NUMERIC(15, 2) NOT NULL,
    gst NUMERIC(15, 2) DEFAULT 0.00,
    payment_method VARCHAR(50),
    expense_date DATE NOT NULL,
    invoice_upload VARCHAR(500),
    notes TEXT,
    approval_status VARCHAR(50) DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Notifications Table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50), -- Maintenance Reminder, License Expiry, Trip Assigned, etc.
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. Audit Logs Table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    module VARCHAR(100) NOT NULL,
    old_value JSONB,
    new_value JSONB,
    status VARCHAR(50) DEFAULT 'Success',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- MOCK DATA (With RBAC roles)

INSERT INTO companies (id, name) VALUES 
('11111111-1111-1111-1111-111111111111', 'FastTrack Logistics');

-- Super Admin User
INSERT INTO users (company_id, role_id, email, password_hash, name, phone) VALUES 
('11111111-1111-1111-1111-111111111111', (SELECT id FROM roles WHERE name = 'Super Admin'), 'admin@fasttrack.com', '$2b$10$wN1I4O3w.8bO1j23R.u7rO1N3uP.XkK2K9jK2K9jK2K9jK2K9jK2K', 'Admin FastTrack', '1234567890');

-- Dispatcher User
INSERT INTO users (company_id, role_id, email, password_hash, name, phone) VALUES 
('11111111-1111-1111-1111-111111111111', (SELECT id FROM roles WHERE name = 'Dispatcher'), 'dispatcher@fasttrack.com', '$2b$10$wN1I4O3w.8bO1j23R.u7rO1N3uP.XkK2K9jK2K9jK2K9jK2K9jK2K', 'Dave Dispatcher', '9876543210');

-- Vehicles
INSERT INTO vehicles (company_id, reg_number, name, vehicle_type, capacity, odometer, status, vin_number) VALUES 
('11111111-1111-1111-1111-111111111111', 'KA-01-HH-1234', 'Volvo FH16', 'Heavy Truck', '20000', 154200, 'Available', 'VIN123456789'),
('11111111-1111-1111-1111-111111111111', 'MH-04-AB-9876', 'Tata Signa', 'Medium Truck', '10000', 85300, 'On Trip', 'VIN987654321');

-- Drivers
INSERT INTO drivers (company_id, name, license_number, category, license_expiry, phone, status) VALUES 
('11111111-1111-1111-1111-111111111111', 'Rajesh Kumar', 'DL-1998-001', 'Heavy', '2028-05-12', '555-0101', 'Available'),
('11111111-1111-1111-1111-111111111111', 'Suresh Singh', 'DL-2005-089', 'Heavy', '2025-11-20', '555-0202', 'On Trip');

-- Trips
INSERT INTO trips (company_id, trip_number, origin, destination, vehicle_id, driver_id, cargo_weight, status, trip_date, revenue) VALUES 
('11111111-1111-1111-1111-111111111111', 'TRP-2026-001', 'Mumbai', 'Delhi', (SELECT id FROM vehicles WHERE reg_number = 'MH-04-AB-9876'), (SELECT id FROM drivers WHERE name = 'Suresh Singh'), '8500', 'Dispatched', '2026-07-10', 1500.00);
