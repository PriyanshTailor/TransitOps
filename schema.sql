-- Drop existing tables if re-running
DROP TABLE IF EXISTS fuel_logs CASCADE;
DROP TABLE IF EXISTS maintenance_logs CASCADE;
DROP TABLE IF EXISTS trips CASCADE;
DROP TABLE IF EXISTS drivers CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS companies CASCADE;

-- Drop Enums
DROP TYPE IF EXISTS vehicle_status;
DROP TYPE IF EXISTS driver_status;
DROP TYPE IF EXISTS trip_status;
DROP TYPE IF EXISTS maintenance_status;

-- Create Enums
CREATE TYPE vehicle_status AS ENUM ('Available', 'On Trip', 'In Shop', 'Retired');
CREATE TYPE driver_status AS ENUM ('Available', 'On Trip', 'Off Duty', 'Suspended');
CREATE TYPE trip_status AS ENUM ('Draft', 'Dispatched', 'Completed', 'Cancelled');
CREATE TYPE maintenance_status AS ENUM ('In Progress', 'Completed');

-- 1. Companies Table
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Roles Table
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE
);

-- 3. Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Vehicles Table
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    registration_number VARCHAR(100) NOT NULL UNIQUE,
    name_model VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    capacity_kg DECIMAL(10, 2) NOT NULL,
    odometer DECIMAL(12, 2) NOT NULL,
    acquisition_cost DECIMAL(12, 2) NOT NULL,
    status vehicle_status DEFAULT 'Available',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Drivers Table
CREATE TABLE drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    license_number VARCHAR(100) NOT NULL UNIQUE,
    license_category VARCHAR(50) NOT NULL,
    license_expiry DATE NOT NULL,
    contact_number VARCHAR(50),
    safety_score INT DEFAULT 100,
    status driver_status DEFAULT 'Available',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Trips Table
CREATE TABLE trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id),
    driver_id UUID NOT NULL REFERENCES drivers(id),
    origin VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    cargo_weight DECIMAL(10, 2) NOT NULL,
    planned_distance DECIMAL(10, 2) NOT NULL,
    status trip_status DEFAULT 'Draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 7. Maintenance Logs Table
CREATE TABLE maintenance_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    service_type VARCHAR(255) NOT NULL,
    cost DECIMAL(10, 2) NOT NULL,
    service_date DATE NOT NULL,
    status maintenance_status DEFAULT 'In Progress',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Fuel Logs Table
CREATE TABLE fuel_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    liters DECIMAL(10, 2) NOT NULL,
    cost DECIMAL(10, 2) NOT NULL,
    location VARCHAR(255),
    log_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert Default Roles
INSERT INTO roles (name) VALUES 
('Fleet Manager'),
('Driver'),
('Safety Officer'),
('Financial Analyst');
