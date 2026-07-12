-- ============================================================================
-- TransitOps - PostgreSQL Database Schema
-- Fleet / Transport Operations Platform
-- ============================================================================
-- Run against database: demo
-- Existing table preserved: public."user"
-- ============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- ENUM TYPES
-- ---------------------------------------------------------------------------

DO $$ BEGIN
    CREATE TYPE vehicle_status AS ENUM ('Available', 'On Trip', 'In Shop');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE vehicle_type AS ENUM ('Heavy Truck', 'Medium Truck', 'Light Truck');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE driver_status AS ENUM ('Available', 'On Trip', 'Suspended', 'Off Duty');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE license_category AS ENUM ('Heavy', 'Medium', 'Light');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE trip_status AS ENUM ('Draft', 'Dispatched', 'Completed', 'Cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE maintenance_status AS ENUM ('In Progress', 'Completed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE user_status AS ENUM ('Active', 'Inactive', 'Suspended');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- RBAC: ROLES & PERMISSIONS
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS roles (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS permissions (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    module      VARCHAR(50)  NOT NULL,  -- vehicles, drivers, trips, maintenance, fuel, reports, settings
    description TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id       INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id INTEGER NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- ---------------------------------------------------------------------------
-- EXTEND EXISTING USER TABLE (login / auth)
-- ---------------------------------------------------------------------------

ALTER TABLE public."user"
    ADD COLUMN IF NOT EXISTS role_id    INTEGER REFERENCES roles(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS status     user_status NOT NULL DEFAULT 'Active',
    ADD COLUMN IF NOT EXISTS phone      VARCHAR(20),
    ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- ---------------------------------------------------------------------------
-- COMPANY PROFILE (Settings page)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS company_profile (
    id            SERIAL PRIMARY KEY,
    company_name  VARCHAR(255) NOT NULL,
    support_email VARCHAR(255) NOT NULL,
    address       TEXT,
    phone         VARCHAR(20),
    logo_url      VARCHAR(500),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- REGIONS (Dashboard region filter: North, South, etc.)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS regions (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    code        VARCHAR(20)  UNIQUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- VEHICLES (Vehicle Registry)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS vehicles (
    id                   SERIAL PRIMARY KEY,
    registration_number  VARCHAR(20)  NOT NULL UNIQUE,
    name                 VARCHAR(100) NOT NULL,
    vehicle_type         vehicle_type NOT NULL,
    capacity_kg          INTEGER      NOT NULL CHECK (capacity_kg > 0),
    odometer_km          INTEGER      NOT NULL DEFAULT 0 CHECK (odometer_km >= 0),
    status               vehicle_status NOT NULL DEFAULT 'Available',
    region_id            INTEGER REFERENCES regions(id) ON DELETE SET NULL,
    notes                TEXT,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_region ON vehicles(region_id);

-- ---------------------------------------------------------------------------
-- DRIVERS (Driver Management)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS drivers (
    id               SERIAL PRIMARY KEY,
    full_name        VARCHAR(100)       NOT NULL,
    license_number   VARCHAR(50)        NOT NULL UNIQUE,
    license_category license_category   NOT NULL,
    license_expiry   DATE               NOT NULL,
    safety_score     SMALLINT           NOT NULL DEFAULT 100
                     CHECK (safety_score BETWEEN 0 AND 100),
    status           driver_status      NOT NULL DEFAULT 'Available',
    phone            VARCHAR(20),
    email            VARCHAR(255),
    address          TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_drivers_status ON drivers(status);
CREATE INDEX IF NOT EXISTS idx_drivers_license_expiry ON drivers(license_expiry);

-- ---------------------------------------------------------------------------
-- TRIPS (Trip Dispatcher)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS trips (
    id               SERIAL PRIMARY KEY,
    trip_code        VARCHAR(20)  NOT NULL UNIQUE,
    origin           VARCHAR(255) NOT NULL,
    destination      VARCHAR(255) NOT NULL,
    vehicle_id       INTEGER      NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,
    driver_id        INTEGER      NOT NULL REFERENCES drivers(id)  ON DELETE RESTRICT,
    cargo_weight_kg  INTEGER      NOT NULL CHECK (cargo_weight_kg > 0),
    status           trip_status  NOT NULL DEFAULT 'Draft',
    trip_date        DATE         NOT NULL DEFAULT CURRENT_DATE,
    dispatched_at    TIMESTAMPTZ,
    completed_at     TIMESTAMPTZ,
    cancelled_at     TIMESTAMPTZ,
    notes            TEXT,
    created_by       INTEGER REFERENCES public."user"(id) ON DELETE SET NULL,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trips_status ON trips(status);
CREATE INDEX IF NOT EXISTS idx_trips_vehicle ON trips(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_trips_driver ON trips(driver_id);
CREATE INDEX IF NOT EXISTS idx_trips_date ON trips(trip_date);

-- ---------------------------------------------------------------------------
-- MAINTENANCE LOGS
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS maintenance_logs (
    id            SERIAL PRIMARY KEY,
    vehicle_id    INTEGER            NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,
    service_type  VARCHAR(100)       NOT NULL,
    cost          NUMERIC(12, 2)     NOT NULL CHECK (cost >= 0),
    service_date  DATE               NOT NULL DEFAULT CURRENT_DATE,
    status        maintenance_status NOT NULL DEFAULT 'In Progress',
    description   TEXT,
    completed_at  TIMESTAMPTZ,
    created_by    INTEGER REFERENCES public."user"(id) ON DELETE SET NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_maintenance_vehicle ON maintenance_logs(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_status ON maintenance_logs(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_date ON maintenance_logs(service_date);

-- ---------------------------------------------------------------------------
-- FUEL LOGS (Fuel & Expense Management)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS fuel_logs (
    id          SERIAL PRIMARY KEY,
    vehicle_id  INTEGER        NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,
    liters      NUMERIC(10, 2) NOT NULL CHECK (liters > 0),
    total_cost  NUMERIC(12, 2) NOT NULL CHECK (total_cost >= 0),
    location    VARCHAR(255)   NOT NULL,
    fuel_date   DATE           NOT NULL DEFAULT CURRENT_DATE,
    trip_id     INTEGER REFERENCES trips(id) ON DELETE SET NULL,
    odometer_km INTEGER CHECK (odometer_km IS NULL OR odometer_km >= 0),
    created_by  INTEGER REFERENCES public."user"(id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fuel_vehicle ON fuel_logs(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_fuel_date ON fuel_logs(fuel_date);
CREATE INDEX IF NOT EXISTS idx_fuel_trip ON fuel_logs(trip_id);

-- ---------------------------------------------------------------------------
-- NOTIFICATIONS (Topbar bell icon)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS notifications (
    id         SERIAL PRIMARY KEY,
    user_id    INTEGER      NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE,
    title      VARCHAR(255) NOT NULL,
    message    TEXT         NOT NULL,
    type       VARCHAR(50)  NOT NULL DEFAULT 'info',  -- info, warning, alert, success
    is_read    BOOLEAN      NOT NULL DEFAULT FALSE,
    link       VARCHAR(500),
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;

-- ---------------------------------------------------------------------------
-- AUDIT LOG (track critical actions)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS audit_logs (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER REFERENCES public."user"(id) ON DELETE SET NULL,
    action      VARCHAR(50)  NOT NULL,  -- CREATE, UPDATE, DELETE, DISPATCH, COMPLETE
    entity_type VARCHAR(50)  NOT NULL,  -- vehicle, driver, trip, maintenance, fuel
    entity_id   INTEGER,
    details     JSONB,
    ip_address  INET,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);

-- ---------------------------------------------------------------------------
-- AUTO-UPDATE updated_at TRIGGER
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ DECLARE t TEXT;
BEGIN
    FOR t IN SELECT unnest(ARRAY[
        'roles', 'company_profile', 'vehicles', 'drivers',
        'trips', 'maintenance_logs', 'user'
    ]) LOOP
        EXECUTE format(
            'DROP TRIGGER IF EXISTS trg_%s_updated_at ON %s;
             CREATE TRIGGER trg_%s_updated_at
             BEFORE UPDATE ON %s
             FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();',
            t, CASE WHEN t = 'user' THEN 'public."user"' ELSE t END,
            t, CASE WHEN t = 'user' THEN 'public."user"' ELSE t END
        );
    END LOOP;
END $$;

COMMIT;
