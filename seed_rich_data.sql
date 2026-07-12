-- seed_rich_data.sql
-- This script deletes all existing data and seeds a comprehensive dataset for "TransitOps Demo" company

DO $$ 
DECLARE
  v_company_id UUID;
  v_admin_role_id UUID;
  v_driver_role_id UUID;
  v_fleet_role_id UUID;
  v_finance_role_id UUID;
  v_safety_role_id UUID;
  
  v_veh1_id UUID; v_veh2_id UUID; v_veh3_id UUID; v_veh4_id UUID; v_veh5_id UUID;
  v_drv1_id UUID; v_drv2_id UUID; v_drv3_id UUID; v_drv4_id UUID; v_drv5_id UUID;
BEGIN
  -- Insert or get Demo Company
  INSERT INTO companies (name) VALUES ('TransitOps Demo') 
  ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_company_id;

  -- Clear existing data for this company
  DELETE FROM audit_logs WHERE company_id = v_company_id;
  DELETE FROM expenses WHERE company_id = v_company_id;
  DELETE FROM fuel_records WHERE company_id = v_company_id;
  DELETE FROM maintenance_records WHERE company_id = v_company_id;
  DELETE FROM trips WHERE company_id = v_company_id;
  DELETE FROM drivers WHERE company_id = v_company_id;
  DELETE FROM vehicles WHERE company_id = v_company_id;
  DELETE FROM users WHERE company_id = v_company_id;

  -- Get Role IDs
  SELECT id INTO v_admin_role_id FROM roles WHERE name = 'Super Admin';
  SELECT id INTO v_driver_role_id FROM roles WHERE name = 'Driver';
  SELECT id INTO v_fleet_role_id FROM roles WHERE name = 'Fleet Manager';
  SELECT id INTO v_finance_role_id FROM roles WHERE name = 'Financial Analyst';
  SELECT id INTO v_safety_role_id FROM roles WHERE name = 'Safety Officer';

  -- Insert Users
  INSERT INTO users (company_id, role_id, email, password_hash, name, phone) VALUES 
  (v_company_id, v_admin_role_id, 'admin@demo.com', '$2b$10$gVce5FjrUmcOe04eLbAM3ulGJ2.YWz7QNlVRxnjEkCDK66nEzYfw.', 'Demo Admin', '1112223333'),
  (v_company_id, v_fleet_role_id, 'fleet@demo.com', '$2b$10$gVce5FjrUmcOe04eLbAM3ulGJ2.YWz7QNlVRxnjEkCDK66nEzYfw.', 'Fleet Manager', '2223334444'),
  (v_company_id, v_finance_role_id, 'finance@demo.com', '$2b$10$gVce5FjrUmcOe04eLbAM3ulGJ2.YWz7QNlVRxnjEkCDK66nEzYfw.', 'Finance Analyst', '3334445555'),
  (v_company_id, v_safety_role_id, 'safety@demo.com', '$2b$10$gVce5FjrUmcOe04eLbAM3ulGJ2.YWz7QNlVRxnjEkCDK66nEzYfw.', 'Safety Officer', '4445556666'),
  (v_company_id, v_driver_role_id, 'driver@demo.com', '$2b$10$gVce5FjrUmcOe04eLbAM3ulGJ2.YWz7QNlVRxnjEkCDK66nEzYfw.', 'Demo Driver', '5556667777');

  -- Insert Vehicles
  INSERT INTO vehicles (company_id, reg_number, name, vehicle_type, capacity, odometer, acquisition_cost, status, created_at) VALUES 
  (v_company_id, 'DEMO-V-001', 'Volvo FH16', 'Heavy Truck', '20000', 125000, 150000, 'Available', NOW() - INTERVAL '90 days') RETURNING id INTO v_veh1_id;
  INSERT INTO vehicles (company_id, reg_number, name, vehicle_type, capacity, odometer, acquisition_cost, status, created_at) VALUES 
  (v_company_id, 'DEMO-V-002', 'Scania R500', 'Heavy Truck', '18000', 98000, 140000, 'Available', NOW() - INTERVAL '80 days') RETURNING id INTO v_veh2_id;
  INSERT INTO vehicles (company_id, reg_number, name, vehicle_type, capacity, odometer, acquisition_cost, status, created_at) VALUES 
  (v_company_id, 'DEMO-V-003', 'Mercedes Actros', 'Heavy Truck', '22000', 45000, 160000, 'On Trip', NOW() - INTERVAL '60 days') RETURNING id INTO v_veh3_id;
  INSERT INTO vehicles (company_id, reg_number, name, vehicle_type, capacity, odometer, acquisition_cost, status, created_at) VALUES 
  (v_company_id, 'DEMO-V-004', 'Ford Transit', 'Light Van', '2000', 15000, 45000, 'In Shop', NOW() - INTERVAL '45 days') RETURNING id INTO v_veh4_id;
  INSERT INTO vehicles (company_id, reg_number, name, vehicle_type, capacity, odometer, acquisition_cost, status, created_at) VALUES 
  (v_company_id, 'DEMO-V-005', 'Isuzu NQR', 'Medium Truck', '8000', 65000, 75000, 'Available', NOW() - INTERVAL '30 days') RETURNING id INTO v_veh5_id;

  -- Insert Drivers
  INSERT INTO drivers (company_id, name, email, phone, license_number, category, score, status, created_at) VALUES 
  (v_company_id, 'Michael Scott', 'michael@demo.com', '555-0001', 'DL-DEMO-001', 'Heavy', 95, 'Available', NOW() - INTERVAL '90 days') RETURNING id INTO v_drv1_id;
  INSERT INTO drivers (company_id, name, email, phone, license_number, category, score, status, created_at) VALUES 
  (v_company_id, 'Jim Halpert', 'jim@demo.com', '555-0002', 'DL-DEMO-002', 'Heavy', 88, 'Available', NOW() - INTERVAL '85 days') RETURNING id INTO v_drv2_id;
  INSERT INTO drivers (company_id, name, email, phone, license_number, category, score, status, created_at) VALUES 
  (v_company_id, 'Dwight Schrute', 'dwight@demo.com', '555-0003', 'DL-DEMO-003', 'Heavy', 99, 'On Trip', NOW() - INTERVAL '70 days') RETURNING id INTO v_drv3_id;
  INSERT INTO drivers (company_id, name, email, phone, license_number, category, score, status, created_at) VALUES 
  (v_company_id, 'Stanley Hudson', 'stanley@demo.com', '555-0004', 'DL-DEMO-004', 'Medium', 75, 'Off Duty', NOW() - INTERVAL '60 days') RETURNING id INTO v_drv4_id;
  INSERT INTO drivers (company_id, name, email, phone, license_number, category, score, status, created_at) VALUES 
  (v_company_id, 'Phyllis Vance', 'phyllis@demo.com', '555-0005', 'DL-DEMO-005', 'Light', 92, 'Available', NOW() - INTERVAL '30 days') RETURNING id INTO v_drv5_id;

  -- Insert Trips (Completed)
  FOR i IN 1..20 LOOP
    INSERT INTO trips (company_id, trip_number, origin, destination, vehicle_id, driver_id, cargo_weight, expected_distance, expected_cost, revenue, actual_cost, status, created_at)
    VALUES (
      v_company_id, 
      'TRP-HIST-' || i, 
      'City A', 
      'City B', 
      CASE i % 5 WHEN 0 THEN v_veh1_id WHEN 1 THEN v_veh2_id WHEN 2 THEN v_veh3_id WHEN 3 THEN v_veh4_id ELSE v_veh5_id END,
      CASE i % 5 WHEN 0 THEN v_drv1_id WHEN 1 THEN v_drv2_id WHEN 2 THEN v_drv3_id WHEN 3 THEN v_drv4_id ELSE v_drv5_id END,
      '5000', 
      300.00, 
      250.00, 
      1200.00 + (i * 50), 
      200.00 + (i * 10), 
      'Completed', 
      NOW() - ((21 - i) * INTERVAL '3 days')
    );
  END LOOP;

  -- Active Trip
  INSERT INTO trips (company_id, trip_number, origin, destination, vehicle_id, driver_id, cargo_weight, expected_distance, expected_cost, revenue, status, created_at)
  VALUES (v_company_id, 'TRP-ACT-001', 'Chicago', 'Detroit', v_veh3_id, v_drv3_id, '15000', 280.00, 350.00, 1800.00, 'In Transit', NOW() - INTERVAL '1 day');

  -- Insert Fuel Records
  FOR i IN 1..30 LOOP
    INSERT INTO fuel_records (company_id, vehicle_id, driver_id, fuel_station, fuel_type, liters, price_per_liter, total_cost, fuel_date, created_at)
    VALUES (
      v_company_id,
      CASE i % 3 WHEN 0 THEN v_veh1_id WHEN 1 THEN v_veh2_id ELSE v_veh3_id END,
      CASE i % 3 WHEN 0 THEN v_drv1_id WHEN 1 THEN v_drv2_id ELSE v_drv3_id END,
      'Station ' || i,
      'Diesel',
      100 + (i * 2),
      1.50,
      (100 + (i * 2)) * 1.50,
      (NOW() - ((31 - i) * INTERVAL '2 days'))::DATE,
      NOW() - ((31 - i) * INTERVAL '2 days')
    );
  END LOOP;

  -- Insert Expenses
  INSERT INTO expenses (company_id, category, vendor, amount, expense_date, approval_status, created_at) VALUES 
  (v_company_id, 'Toll', 'Highway Auth', 45.00, CURRENT_DATE - 5, 'Approved', NOW() - INTERVAL '5 days'),
  (v_company_id, 'Maintenance', 'Joe Garage', 850.00, CURRENT_DATE - 10, 'Approved', NOW() - INTERVAL '10 days'),
  (v_company_id, 'Insurance', 'SafeGuard', 1200.00, CURRENT_DATE - 15, 'Approved', NOW() - INTERVAL '15 days'),
  (v_company_id, 'Misc', 'Office Supplies', 120.00, CURRENT_DATE - 2, 'Pending', NOW() - INTERVAL '2 days');

  -- Insert Maintenance Records
  INSERT INTO maintenance_records (company_id, vehicle_id, service_type, issue_description, actual_cost, status, service_date, created_at) VALUES 
  (v_company_id, v_veh4_id, 'Engine Overhaul', 'Engine knocking sound', 2500.00, 'In Progress', CURRENT_DATE - 2, NOW() - INTERVAL '2 days'),
  (v_company_id, v_veh1_id, 'Oil Change', 'Routine 10k mile service', 150.00, 'Completed', CURRENT_DATE - 20, NOW() - INTERVAL '20 days');

END $$;
